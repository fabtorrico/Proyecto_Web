// ============================================================
// authController.js — Lógica de negocio para autenticación
// Separa la lógica del routing para mayor mantenibilidad
// ============================================================

import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────
// login
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
    console.error("[authController] login error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ──────────────────────────────────────────────────────────
// getUser
// Devuelve los datos actualizados del usuario desde la BD.
// Usado por el Dashboard para precargar los formularios de Ajuste.
// Recibe: GET /api/user/:id
// ──────────────────────────────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el id sea un número entero positivo
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url FROM users WHERE id = ?",
      [parseInt(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ user: rows[0] });

  } catch (error) {
    console.error("[authController] getUser error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
