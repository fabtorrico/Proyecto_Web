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
// verifyPayment
// Ruta PRIVADA — requiere JWT.
// Consulta el estado real de la orden en Izipay y, si está pagada,
// activa el plan del usuario en la BD.
// Fallback para cuando el IPN no llega (URL de producción, ngrok, etc.).
//
// Recibe: POST /api/payments/verify
// Body:   { paymentId }  (el id del registro en la tabla payments)
// ──────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const userId    = req.user.id;
    const paymentId = parseInt(req.body?.paymentId, 10);

    if (!paymentId || isNaN(paymentId)) {
      return res.status(400).json({ error: "paymentId inválido" });
    }

    // ── Verificar que el pago existe y pertenece al usuario ──
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE id = ? AND user_id = ? LIMIT 1",
      [paymentId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    const payment = rows[0];

    // Si ya está aprobado, responder sin volver a llamar a Izipay
    if (payment.estado === "aprobado") {
      return res.json({ success: true, alreadyApproved: true, message: "El plan ya está activo." });
    }

    // ── Consultar Izipay: estado real de la orden ──────────
    const { IZIPAY_USERNAME, IZIPAY_PASSWORD } = process.env;
    const orderGetUrl = "https://api.micuentaweb.pe/api-payment/V4/Order/Get";
    const orderId     = `CERTIA-${payment.id}`;

    console.log("[verify] consultando Izipay para orderId:", orderId);

    const izipayRes = await axios.post(
      orderGetUrl,
      { orderId },
      {
        auth:    { username: IZIPAY_USERNAME, password: IZIPAY_PASSWORD },
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("[verify] Izipay Order/Get status:", izipayRes.data?.status,
      "| orderStatus:", izipayRes.data?.answer?.orderStatus);

    if (izipayRes.data?.status !== "SUCCESS") {
      return res.status(400).json({ success: false, error: "Error al consultar Izipay", detail: izipayRes.data });
    }

    const orderStatus  = izipayRes.data.answer?.orderStatus;
    const transactions = izipayRes.data.answer?.transactions || [];

    // orderStatus "PAID" o alguna transacción en estado aprobado
    const TRANS_OK = ["AUTHORISED", "AUTHORISED_TO_VALIDATE", "CAPTURED"];
    const isPaid   = orderStatus === "PAID"
      || transactions.some(t => TRANS_OK.includes(String(t.transStatus || t.status || "").toUpperCase()));

    if (!isPaid) {
      return res.json({
        success: false,
        pending: true,
        orderStatus,
        message: "El pago aún no ha sido confirmado por Izipay.",
      });
    }

    // ── Pago confirmado → activar plan ────────────────────
    const transUuid = transactions[0]?.uuid || transactions[0]?.transactionUuid || null;

    const [updatePay] = await pool.query(
      "UPDATE payments SET estado = 'aprobado', transaction_id = ? WHERE id = ?",
      [transUuid, paymentId]
    );
    console.log("[verify] UPDATE payments — filas afectadas:", updatePay.affectedRows);

    const planDuracion = payment.plan_duracion;
    if (planDuracion === null || planDuracion === undefined) {
      return res.status(500).json({ error: "plan_duracion inválido en el registro de pago" });
    }

    const duracion = parseInt(planDuracion, 10);
    let fechaFinExpr;
    if (duracion === 0)      fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 1 MONTH)";
    else if (duracion === 1) fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 1 YEAR)";
    else if (duracion === 2) fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 2 YEAR)";
    else if (duracion === 3) fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 3 YEAR)";
    else                     fechaFinExpr = `DATE_ADD(CURDATE(), INTERVAL ${duracion} YEAR)`;

    const [updateUser] = await pool.query(
      `UPDATE users
         SET plan_duracion     = ?,
             fecha_inicio_plan = CURDATE(),
             fecha_fin_plan    = ${fechaFinExpr}
       WHERE id = ?`,
      [duracion, payment.user_id]
    );
    console.log("[verify] UPDATE users — filas afectadas:", updateUser.affectedRows);
    console.log("[verify] ✓ plan activado — userId:", payment.user_id, "| plan_duracion:", duracion);

    return res.json({ success: true, activated: true, message: "Plan activado correctamente." });

  } catch (error) {
    if (error.response) {
      console.error("[verify] error Izipay:", error.response.status, JSON.stringify(error.response.data));
      return res.status(400).json({ success: false, error: error.response.data });
    }
    console.error("[verify] error inesperado:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ──────────────────────────────────────────────────────
// handleIPN
// Ruta PÚBLICA — Izipay llama a este endpoint directamente.
// NO lleva JWT: el servidor de Izipay no tiene token del usuario.
//
// Flujo:
//   1. Leer campos vads_* del body (urlencoded)
//   2. Verificar vads_trans_status === "AUTHORISED"
//   3. Extraer paymentId desde vads_order_id  (formato: CERTIA-{id})
//   4. Buscar payment en BD
//   5. UPDATE payments SET estado = 'aprobado'
//   6. Calcular fecha_fin_plan según plan_duracion
//      plan_duracion = 0 → INTERVAL 1 MONTH  (Plan Mensual)
//      plan_duracion = 1 → INTERVAL 1 YEAR
//      plan_duracion = 2 → INTERVAL 2 YEAR
//      plan_duracion = 3 → INTERVAL 3 YEAR
//   7. UPDATE users con plan_duracion, fecha_inicio_plan, fecha_fin_plan
//
// IMPORTANTE: plan_duracion = 0 es válido (Plan Mensual).
// No usar  if (!plan_duracion)  porque falla con 0.
// Usar     plan_duracion === null || plan_duracion === undefined
//
// Recibe: POST /api/payments/ipn
// ──────────────────────────────────────────────────────
export const handleIPN = async (req, res) => {
  try {
    // ── PASO 1: validar body ───────────────────────────────
    console.log("[IPN] body recibido:", JSON.stringify(req.body));

    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("[IPN] body vacío — verificar express.urlencoded en app.js");
      return res.status(200).send("ERROR_BODY");
    }

    // ── PASO 2: leer campos vads_* ────────────────────────
    const vadsOrderId     = String(req.body["vads_order_id"]     || "").trim();
    const vadsTransStatus = String(req.body["vads_trans_status"] || "").trim();
    const vadsTransUuid   = String(req.body["vads_trans_uuid"]   || "").trim();

    console.log("[IPN] vads_order_id:",     vadsOrderId);
    console.log("[IPN] vads_trans_status:", vadsTransStatus);
    console.log("[IPN] vads_trans_uuid:",   vadsTransUuid);

    // ── PASO 3: verificar estado aprobado ─────────────────
    // Izipay puede enviar distintos estados según configuración y modo TEST:
    //   "AUTHORISED"            → autorizado por el banco (más común)
    //   "AUTHORISED_TO_VALIDATE"→ autorizado, requiere validación manual
    //   "CAPTURED"              → ya capturado/liquidado (auto-capture activo)
    // Cualquiera de estos indica pago exitoso.
    const ESTADOS_APROBADOS = ["AUTHORISED", "AUTHORISED_TO_VALIDATE", "CAPTURED"];

    if (!ESTADOS_APROBADOS.includes(vadsTransStatus)) {
      console.log("[IPN] estado NO aprobado — retornando IGNORED. Status recibido:", JSON.stringify(vadsTransStatus));
      return res.status(200).send("IGNORED");
    }

    console.log("[IPN] estado aprobado confirmado:", vadsTransStatus);

    // ── PASO 4: extraer paymentId desde vads_order_id ─────
    // Formato esperado: CERTIA-{id}  →  paymentId = {id}
    const raw       = vadsOrderId.replace(/^CERTIA-/i, "");
    const paymentId = parseInt(raw, 10);

    console.log("[IPN] paymentId extraído:", paymentId, "(raw:", raw + ")");

    if (isNaN(paymentId) || paymentId <= 0) {
      console.error("[IPN] vads_order_id no válido:", vadsOrderId);
      return res.status(200).send("IGNORED");
    }

    // ── PASO 5: buscar payment en BD ──────────────────────
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE id = ? LIMIT 1",
      [paymentId]
    );

    if (rows.length === 0) {
      console.error("[IPN] payment no encontrado en BD. paymentId:", paymentId);
      return res.status(200).send("IGNORED");
    }

    const payment = rows[0];
    console.log("[IPN] payment encontrado:", {
      id:            payment.id,
      user_id:       payment.user_id,
      plan_duracion: payment.plan_duracion,
      monto:         payment.monto,
      estado:        payment.estado,
    });

    // ── PASO 6: UPDATE payments ───────────────────────────
    const [updatePayResult] = await pool.query(
      "UPDATE payments SET estado = 'aprobado', transaction_id = ? WHERE id = ?",
      [vadsTransUuid || null, paymentId]
    );
    console.log("[IPN] UPDATE payments resultado — filas afectadas:", updatePayResult.affectedRows);

    // ── PASO 7: calcular fecha_fin_plan ───────────────────
    // IMPORTANTE: plan_duracion = 0 es válido (Plan Mensual).
    // No evaluar con  !plan_duracion  porque  !0 === true  fallaría.
    const planDuracion = payment.plan_duracion;

    if (planDuracion === null || planDuracion === undefined) {
      console.error("[IPN] plan_duracion es null/undefined — no se puede activar plan");
      return res.status(200).send("ERROR_DURACION");
    }

    const duracion = parseInt(planDuracion, 10);

    let fechaFinExpr;
    if (duracion === 0) {
      fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 1 MONTH)";   // Plan Mensual
    } else if (duracion === 1) {
      fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 1 YEAR)";
    } else if (duracion === 2) {
      fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 2 YEAR)";
    } else if (duracion === 3) {
      fechaFinExpr = "DATE_ADD(CURDATE(), INTERVAL 3 YEAR)";
    } else {
      fechaFinExpr = `DATE_ADD(CURDATE(), INTERVAL ${duracion} YEAR)`;
    }

    console.log("[IPN] plan_duracion:", duracion, "→ fechaFinExpr:", fechaFinExpr);

    // ── PASO 8: UPDATE users ──────────────────────────────
    const [updateUserResult] = await pool.query(
      `UPDATE users
         SET plan_duracion     = ?,
             fecha_inicio_plan = CURDATE(),
             fecha_fin_plan    = ${fechaFinExpr}
       WHERE id = ?`,
      [duracion, payment.user_id]
    );
    console.log("[IPN] UPDATE users resultado — filas afectadas:", updateUserResult.affectedRows);

    console.log("[IPN] ✓ plan activado — userId:", payment.user_id, "| plan_duracion:", duracion);

    return res.status(200).send("OK");

  } catch (error) {
    console.error("[IPN] error inesperado:", error.message, error.stack);
    return res.status(200).send("ERROR");
  }
};
