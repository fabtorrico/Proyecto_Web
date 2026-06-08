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
    // ── Logs de diagnóstico — eliminar en producción ─────────
    console.log("[izipay IPN] Headers:", req.headers);
    console.log("[izipay IPN] Body:",    req.body);

    // ── Validar que req.body existe y no está vacío ────────
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("[izipay IPN] Body vacío o no parseado");
      return res.status(400).json({ error: "Body vacío" });
    }

    const krAnswer          = req.body["kr-answer"];
    const krHash            = req.body["kr-hash"];
    const krHashAlgorithm   = req.body["kr-hash-algorithm"];
    const { IZIPAY_HMAC_KEY } = process.env;

    console.log("[izipay IPN] recibido:", { krHashAlgorithm, krHash });

    // ── Validar que los campos obligatorios existen ──────────
    if (!krAnswer || !krHash) {
      console.error("[izipay IPN] campos faltantes en el payload");
      return res.status(400).json({ error: "Payload IPN incompleto" });
    }

    if (!IZIPAY_HMAC_KEY) {
      console.error("[izipay IPN] IZIPAY_HMAC_KEY no configurada");
      return res.status(500).json({ error: "Clave HMAC no configurada" });
    }

    // ── Validar firma HMAC-SHA256 ───────────────────────
    // Izipay firma kr-answer con HMAC-SHA256 usando la clave HMAC del comercio.
    // Si la firma no coincide, el evento no es auténtico y se rechaza.
    const expectedHash = crypto
      .createHmac("sha256", IZIPAY_HMAC_KEY)
      .update(krAnswer)
      .digest("hex");

    if (expectedHash !== krHash) {
      console.error("[izipay IPN] firma HMAC inválida");
      return res.status(400).json({ error: "Firma HMAC inválida" });
    }

    // ── Parsear el cuerpo del evento ──────────────────────
    let answer;
    try {
      answer = JSON.parse(krAnswer);
    } catch {
      console.error("[izipay IPN] kr-answer no es JSON válido");
      return res.status(400).json({ error: "kr-answer inválido" });
    }

    const orderStatus = answer.orderStatus;
    const orderId     = answer.orderDetails?.orderId || answer.orderId;
    const uuid        = answer.transactions?.[0]?.uuid;

    console.log("[izipay IPN] orderStatus:", orderStatus, "| orderId:", orderId, "| uuid:", uuid);

    // ── Solo procesar pagos aprobados ───────────────────
    // Para otros estados (UNPAID, CANCELLED, etc.) solo confirmar recepción.
    if (orderStatus !== "PAID") {
      console.log("[izipay IPN] pago no aprobado, estado:", orderStatus);
      return res.status(200).json({ received: true, orderStatus });
    }

    // ── Extraer paymentId desde orderId (formato: CERTIA-{id}) ──
    const paymentId = parseInt((orderId || "").replace("CERTIA-", ""));

    if (!paymentId || isNaN(paymentId)) {
      console.error("[izipay IPN] orderId no válido:", orderId);
      return res.status(200).json({ received: true, error: "orderId no reconocido" });
    }

    // ── Buscar el pago en la BD ───────────────────────
    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE id = ? LIMIT 1",
      [paymentId]
    );

    if (payments.length === 0) {
      console.error("[izipay IPN] pago no encontrado en BD, paymentId:", paymentId);
      return res.status(200).json({ received: true, error: "pago no encontrado" });
    }

    const payment = payments[0];
    console.log("[izipay IPN] pago encontrado: userId=", payment.user_id, "| plan_duracion=", payment.plan_duracion);

    // ── Actualizar payments.estado = 'aprobado' ──────────
    await pool.query(
      "UPDATE payments SET estado = 'aprobado', transaction_id = ? WHERE id = ?",
      [uuid || null, paymentId]
    );

    // ── Calcular fecha_fin_plan según plan_duracion ───────
    // INTERVAL n YEAR calcula correctamente años bisiestos.
    const duracion = parseInt(payment.plan_duracion);
    const fechaFinExpr = `DATE_ADD(CURDATE(), INTERVAL ${duracion} YEAR)`;

    // ── Activar plan en la tabla users ─────────────────
    await pool.query(
      `UPDATE users
       SET plan_duracion      = ?,
           fecha_inicio_plan  = CURDATE(),
           fecha_fin_plan     = ${fechaFinExpr}
       WHERE id = ?`,
      [duracion, payment.user_id]
    );

    console.log("[izipay IPN] plan activado: userId=", payment.user_id, "| duracion=", duracion, "años");

    // Responder HTTP 200 para que Izipay sepa que el IPN fue procesado.
    return res.status(200).json({ received: true, activated: true });

  } catch (error) {
    console.error("[izipayController] handleIPN error:", error.message);
    // Siempre responder 200 a Izipay aunque haya error interno,
    // para evitar reintentos infinitos del proveedor.
    return res.status(200).json({ received: true, error: "error interno" });
  }
};
