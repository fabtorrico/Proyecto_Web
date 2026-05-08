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

// ──────────────────────────────────────────────────────────
// updateUserProfile
// Actualiza nombre, apellido, correo y web del usuario.
// NO toca la contraseña ni datos del negocio.
// Recibe: PUT /api/users/:id/profile
// ──────────────────────────────────────────────────────────
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, correo, web } = req.body;

    // Validar id
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    // Validar campos obligatorios
    if (!nombre || !apellido || !correo) {
      return res.status(400).json({ error: "Nombre, apellido y correo son obligatorios" });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    // Verificar que el correo no esté en uso por otro usuario
    const [existingEmail] = await pool.query(
      "SELECT id FROM users WHERE correo = ? AND id != ?",
      [correo.trim().toLowerCase(), parseInt(id)]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado por otro usuario" });
    }

    // Actualizar en MySQL
    await pool.query(
      "UPDATE users SET nombre = ?, apellido = ?, correo = ?, web = ? WHERE id = ?",
      [nombre.trim(), apellido.trim(), correo.trim().toLowerCase(), web || "", parseInt(id)]
    );

    // Devolver el usuario actualizado (sin password)
    const [updatedRows] = await pool.query(
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url FROM users WHERE id = ?",
      [parseInt(id)]
    );

    if (updatedRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({
      message: "Datos del usuario actualizados correctamente",
      user: updatedRows[0],
    });

  } catch (error) {
    console.error("[authController] updateUserProfile error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ──────────────────────────────────────────────────────────
// updateBusinessData
// Actualiza razon_social, ruc, direccion y logo_url del usuario.
// NO toca datos personales ni la contraseña.
// Recibe: PUT /api/users/:id/business
// ──────────────────────────────────────────────────────────
export const updateBusinessData = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon_social, ruc, direccion, logo_url } = req.body;

    // Validar que el id sea un número entero positivo
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    // Razón social y RUC son obligatorios
    if (!razon_social || razon_social.trim() === "") {
      return res.status(400).json({ error: "La razón social es obligatoria" });
    }
    if (!ruc || ruc.trim() === "") {
      return res.status(400).json({ error: "El RUC es obligatorio" });
    }

    // El RUC peruano debe tener exactamente 11 dígitos
    const rucRegex = /^\d{11}$/;
    if (!rucRegex.test(ruc.trim())) {
      return res.status(400).json({ error: "El RUC debe tener exactamente 11 dígitos" });
    }

    // logo_url es opcional; si se envía debe ser una URL válida
    if (logo_url && logo_url.trim() !== "") {
      try {
        new URL(logo_url.trim());
      } catch {
        return res.status(400).json({ error: "La URL del logo no es válida" });
      }
    }

    // Actualizar datos del negocio en MySQL
    await pool.query(
      "UPDATE users SET razon_social = ?, ruc = ?, direccion = ?, logo_url = ? WHERE id = ?",
      [razon_social.trim(), ruc.trim(), direccion || "", logo_url || "", parseInt(id)]
    );

    // Devolver el usuario actualizado (sin password)
    const [updatedRows] = await pool.query(
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url FROM users WHERE id = ?",
      [parseInt(id)]
    );

    if (updatedRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({
      message: "Datos del negocio actualizados correctamente",
      user: updatedRows[0],
    });

  } catch (error) {
    console.error("[authController] updateBusinessData error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ──────────────────────────────────────────────────────────
// updateUserPassword
// Verifica la contraseña antigua y actualiza por la nueva.
// NO devuelve password en ninguna respuesta.
// Recibe: PUT /api/users/:id/password
// ──────────────────────────────────────────────────────────
export const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Validar id
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    // Ambos campos son obligatorios
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Debe completar ambos campos de contraseña" });
    }

    // La nueva contraseña debe tener al menos 6 caracteres
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    // Obtener la contraseña actual desde la BD (nunca se devuelve al frontend)
    const [rows] = await pool.query(
      "SELECT id, password FROM users WHERE id = ?",
      [parseInt(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Fase actual: comparación en texto plano.
    // TODO Fase 2: reemplazar por bcrypt.compare(oldPassword, rows[0].password)
    if (rows[0].password !== oldPassword) {
      return res.status(401).json({ error: "La contraseña antigua no es correcta" });
    }

    // Fase actual: guardar en texto plano.
    // TODO Fase 2: guardar hash con bcrypt.hash(newPassword, 10)
    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [newPassword, parseInt(id)]
    );

    // Nunca devolver la contraseña en la respuesta
    return res.json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("[authController] updateUserPassword error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
