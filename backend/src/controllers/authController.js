// ============================================================
// authController.js — Lógica de negocio para autenticación
// Separa la lógica del routing para mayor mantenibilidad
// ============================================================

import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────
// login
// Recibe { correo, password } del body, valida contra la BD
// y devuelve los datos del usuario (sin la contraseña).
//
// FASE 1: comparación directa de contraseña en texto plano.
// FASE 2 (pendiente): reemplazar la comparación por bcrypt.compare()
//   y emitir un JWT en lugar de devolver el objeto user completo.
// ──────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // ── Validación de entradas (nunca confiar en el frontend) ──
    if (!correo || typeof correo !== "string" || correo.trim() === "") {
      return res.status(400).json({ error: "El correo es requerido" });
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    // Sanitizar: eliminar espacios extremos
    const correoSanitizado = correo.trim().toLowerCase();

    // ── Consulta parametrizada (evita SQL Injection) ──
    // Se busca solo por correo; la verificación de contraseña se hace en JS
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE correo = ?",
      [correoSanitizado]
    );

    // Mensaje genérico para no revelar si el correo existe o no
    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = rows[0];

    // ── FASE 1: comparación en texto plano ──
    // TODO FASE 2: reemplazar por:
    //   const match = await bcrypt.compare(password, user.password);
    //   if (!match) return res.status(401).json({ error: "Credenciales incorrectas" });
    if (user.password !== password) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // ── Nunca enviar la contraseña al cliente ──
    delete user.password;

    // TODO FASE 2: emitir un JWT en lugar del objeto user:
    //   const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    //   return res.json({ token });

    res.json({ user });

  } catch (error) {
    // No exponer detalles internos en producción
    console.error("[authController] login error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
