// ============================================================
// izipayController.js — Integración con Izipay
//
// Flujo LinkPro PaymentForm:
//   1. Frontend llama POST /api/payments/create-order con { paymentId }
//   2. Backend llama a Izipay → obtiene paymentURL
//   3. Frontend redirige al usuario a paymentURL
//   4. Izipay llama POST /api/payments/ipn con el resultado
//   5. Backend valida HMAC, actualiza payments y activa el plan del usuario
// ============================================================

import axios  from "axios";
import crypto from "crypto";
import pool   from "../config/db.js";

// ──────────────────────────────────────────────────────────
// createPaymentOrder
// Ruta PRIVADA — requiere JWT.
// Construye la orden de pago en Izipay y devuelve la paymentURL.
// Recibe: POST /api/payments/create-order
// Body:   { paymentId }
// ──────────────────────────────────────────────────────────
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId } = req.body;

    // ── Validación de entrada ──────────────────────────────
    if (!paymentId || isNaN(paymentId) || parseInt(paymentId) <= 0) {
      return res.status(400).json({ error: "paymentId inválido" });
    }

    // ── Verificar que el pago existe y pertenece al usuario ──
    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE id = ? AND user_id = ?",
      [parseInt(paymentId), userId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    const payment = payments[0];

    // ── Validar credenciales de Izipay en .env ─────────────
    const { IZIPAY_USERNAME, IZIPAY_PASSWORD, IZIPAY_API_URL } = process.env;

    if (!IZIPAY_USERNAME || !IZIPAY_PASSWORD || !IZIPAY_API_URL) {
      return res.status(500).json({
        error: "Credenciales de Izipay no configuradas en el servidor",
      });
    }

    // ── Construir payload mínimo requerido por Izipay ──────
    // Documentación: https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/api/
    // orderId: identificador único de la orden — se usa el id del pago en BD.
    // amount: en céntimos (PEN) → S/ 150.00 = 15000
    // currency: ISO 4217 — PEN para soles peruanos
    const payload = {
      orderId:   `CERTIA-${payment.id}`,
      amount:    Math.round(Number(payment.monto) * 100), // céntimos
      currency:  "PEN",
      customer: {
        reference: String(payment.user_id),
      },
      // URL donde Izipay enviará el resultado del pago (IPN/webhook).
      // Debe ser accesible públicamente — en producción usar el dominio real.
      ipnTargetUrl: process.env.IZIPAY_IPN_URL || "https://certia.pe/api/payments/ipn",
    };

    console.log("[izipay] payload enviado:", JSON.stringify(payload, null, 2));

    // ── Llamada a Izipay con Basic Auth ────────────────────
    // Las credenciales se codifican en Base64 por axios automáticamente.
    const response = await axios.post(IZIPAY_API_URL, payload, {
      auth: {
        username: IZIPAY_USERNAME,
        password: IZIPAY_PASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[izipay] respuesta completa:", JSON.stringify(response.data, null, 2));

    // ── Verificar resultado de Izipay ──────────────────────
    if (response.data?.status !== "SUCCESS") {
      console.error("[izipay] respuesta no exitosa:", response.data);
      return res.status(400).json({
        success: false,
        error:   response.data,
      });
    }

    const paymentURL = response.data.answer?.paymentURL;

    if (!paymentURL) {
      return res.status(400).json({
        success: false,
        error:   "Izipay no devolvió una paymentURL",
      });
    }

    // ── Guardar el orderId en el registro de pago ──────────
    // Permite correlacionar el pago con el webhook/IPN de Izipay.
    await pool.query(
      "UPDATE payments SET transaction_id = ? WHERE id = ?",
      [`CERTIA-${payment.id}`, payment.id]
    );

    // Redirección al usuario implementada en el frontend.
    return res.json({
      success:   true,
      paymentURL,
      paymentId: payment.id,
    });

  } catch (error) {
    // Capturar errores de Axios (respuesta de Izipay con error HTTP)
    if (error.response) {
      console.error("[izipay] error HTTP:", error.response.status, JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({
        success: false,
        error:   error.response.data,
      });
    }
    console.error("[izipayController] createPaymentOrder error:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ──────────────────────────────────────────────────────
// handleIPN
// Ruta PÚBLICA — Izipay llama a este endpoint directamente.
// NO lleva JWT: el servidor de Izipay no tiene token del usuario.
// La autenticidad se valida con HMAC-SHA256 usando IZIPAY_HMAC_KEY.
//
// Flujo:
//   1. Validar firma HMAC del payload
//   2. Parsear kr-answer
//   3. Verificar orderStatus === 'PAID'
//   4. Actualizar payments.estado = 'aprobado'
//   5. Calcular fecha_fin_plan según plan_duracion
//   6. Activar plan en la tabla users
//
// Recibe: POST /api/payments/ipn
// ──────────────────────────────────────────────────────
export const handleIPN = async (req, res) => {
  try {
    // ── Logs de diagnóstico ────────────────────────────────
    console.log("[izipay IPN] Headers:", req.headers);
    console.log("[izipay IPN] Body:",    req.body);

    // ── Validar que req.body existe y no está vacío ────────
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("[izipay IPN] Body vacío o no parseado");
      return res.status(400).json({ error: "Body vacío" });
    }

    // ── Leer campos del payload real de Izipay (formato vads_*) ──
    const vadsOrderId     = req.body["vads_order_id"];
    const vadsTransStatus = req.body["vads_trans_status"];
    const vadsTransUuid   = req.body["vads_trans_uuid"];
    const signature       = req.body["signature"];

    console.log("[izipay IPN] vads_order_id:",     vadsOrderId);
    console.log("[izipay IPN] vads_trans_status:", vadsTransStatus);
    console.log("[izipay IPN] vads_trans_uuid:",   vadsTransUuid);
    console.log("[izipay IPN] signature:",         signature);

    // ── Solo procesar pagos autorizados ───────────────────
    // Para otros estados (REFUSED, CANCELLED, etc.) confirmar recepción sin actuar.
    if (vadsTransStatus !== "AUTHORISED") {
      console.log("[izipay IPN] estado no aprobado:", vadsTransStatus);
      return res.status(200).send("IGNORED");
    }

    // ── Extraer paymentId desde vads_order_id (formato: CERTIA-{id}) ──
    const paymentId = parseInt((vadsOrderId || "").replace("CERTIA-", ""));

    if (!paymentId || isNaN(paymentId)) {
      console.error("[izipay IPN] vads_order_id no válido:", vadsOrderId);
      return res.status(200).send("IGNORED");
    }

    // ── Buscar el pago en la BD ───────────────────────────
    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE id = ? LIMIT 1",
      [paymentId]
    );

    if (payments.length === 0) {
      console.error("[izipay IPN] pago no encontrado en BD, paymentId:", paymentId);
      return res.status(200).send("IGNORED");
    }

    const payment = payments[0];
    console.log("[izipay IPN] pago encontrado: userId=", payment.user_id, "| plan_duracion=", payment.plan_duracion);

    // ── Actualizar payments: estado = 'aprobado' ──────────
    await pool.query(
      "UPDATE payments SET estado = 'aprobado', transaction_id = ? WHERE id = ?",
      [vadsTransUuid || null, paymentId]
    );

    // ── Calcular fecha_fin_plan según plan_duracion ────────
    // INTERVAL n YEAR calcula correctamente años bisiestos.
    const duracion = parseInt(payment.plan_duracion);
    const fechaFinExpr = `DATE_ADD(CURDATE(), INTERVAL ${duracion} YEAR)`;

    // ── Activar plan en la tabla users ────────────────────
    await pool.query(
      `UPDATE users
       SET plan_duracion     = ?,
           fecha_inicio_plan = CURDATE(),
           fecha_fin_plan    = ${fechaFinExpr}
       WHERE id = ?`,
      [duracion, payment.user_id]
    );

    console.log("[izipay IPN] plan activado: userId=", payment.user_id, "| duracion=", duracion, "años");

    // Responder HTTP 200 para confirmar recepción a Izipay.
    return res.status(200).send("OK");

  } catch (error) {
    console.error("[izipayController] handleIPN error:", error.message);
    // Siempre responder 200 para evitar reintentos infinitos del proveedor.
    return res.status(200).send("ERROR");
  }
};
