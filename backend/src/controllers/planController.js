// ============================================================
// planController.js — Lógica de negocio para planes
// Lee los planes disponibles desde la tabla `plans` de la BD.
// Los precios NO están hardcodeados; se obtienen en tiempo real.
// Futura integración con Izipay para compra y renovación de planes.
// ============================================================

import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────
// getPlans
// Devuelve todos los planes ordenados por duración ascendente.
// Ruta: GET /api/plans (pública — no requiere JWT)
// ──────────────────────────────────────────────────────────
export const getPlans = async (req, res) => {
  try {
    // Lectura de planes desde la BD — elimina precios hardcodeados del frontend.
    // ORDER BY duracion_anios ASC garantiza el orden: 1 año → 2 años → 3 años.
    const [plans] = await pool.query(`
      SELECT
        id,
        nombre,
        duracion_anios,
        precio
      FROM plans
      ORDER BY duracion_anios ASC
    `);

    return res.json({ plans });

  } catch (error) {
    console.error("[planController] getPlans error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
