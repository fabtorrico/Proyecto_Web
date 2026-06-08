// ============================================================
// paymentController.js — Gestión de pagos de planes
//
// Primer paso del flujo de pagos de Certia.
// Por ahora solo registra la intención de compra (estado: pendiente).
// Base para la futura integración con Izipay (IPN y webhooks).
// ============================================================

import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────
// createPayment
// Ruta PRIVADA — requiere JWT.
// Registra un pago pendiente en la tabla `payments`.
// Este es el primer paso del flujo; NO llama a Izipay todavía.
// Cuando Izipay esté integrado, este registro será la base
// para el webhook/IPN que confirmará o rechazará el pago.
//
// Recibe: POST /api/payments/create
// Body:   { planId }
// ──────────────────────────────────────────────────────────
export const createPayment = async (req, res) => {
  try {
    // userId proviene del token JWT decodificado por verifyToken
    const userId = req.user.id;
    const { planId } = req.body;

    // ── Validación de entrada ──────────────────────────────
    if (!planId || isNaN(planId) || parseInt(planId) <= 0) {
      return res.status(400).json({ error: "planId inválido" });
    }

    // ── Verificar que el plan existe en la BD ──────────────
    const [plans] = await pool.query(
      "SELECT * FROM plans WHERE id = ?",
      [parseInt(planId)]
    );

    if (plans.length === 0) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    const plan = plans[0];

    // ── Prevención de pagos duplicados ────────────────────
    // Un usuario solo puede tener 1 pago pendiente a la vez.
    // Si ya existe uno, se reutiliza ese mismo paymentId en lugar
    // de crear un registro nuevo. Esto es compatible con el flujo
    // futuro de Izipay: se continuará con el mismo pago pendiente
    // y no se generarán órdenes duplicadas en el proveedor.
    const [existing] = await pool.query(
      `SELECT id FROM payments
       WHERE user_id = ? AND estado = 'pendiente'
       ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success:        true,
        alreadyPending: true,
        paymentId:      existing[0].id,
        message:        "Ya existe un pago pendiente.",
      });
    }

    // ── Crear registro de pago pendiente ──────────────────
    // estado = 'pendiente': intención de compra registrada.
    // payment_provider = 'izipay': referencia al proveedor futuro.
    // Cuando el webhook de Izipay confirme el pago, se actualizará
    // este registro a 'aprobado' y se asignará el plan al usuario.
    const [result] = await pool.query(
      `INSERT INTO payments (user_id, plan_duracion, monto, estado, payment_provider)
       VALUES (?, ?, ?, 'pendiente', 'izipay')`,
      [userId, plan.duracion_anios, plan.precio]
    );

    const paymentId = result.insertId;

    return res.status(201).json({
      success:        true,
      alreadyPending: false,
      paymentId,
      planId:         plan.id,
      monto:          plan.precio,
      message:        "Pago pendiente generado correctamente.",
    });

  } catch (error) {
    console.error("[paymentController] createPayment error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
