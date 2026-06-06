// ============================================================
// authController.js — Lógica de negocio para autenticación
// Separa la lógica del routing para mayor mantenibilidad
// ============================================================

import pool from "../config/db.js";
import bcrypt from "bcrypt";
// JWT (JSON Web Token): estándar para transmitir información verificable entre partes.
// El token se firma con JWT_SECRET y expira tras 7 días.
// NO se incluyen datos sensibles (password) en el payload del token.
import jwt from "jsonwebtoken";

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

    // bcrypt.compare verifica la contraseña ingresada contra el hash guardado en BD.
    // Nunca se expone el hash al frontend ni se hace comparación en texto plano.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // ── Nunca enviar la contraseña al cliente ──
    delete user.password;

    // Generar JWT con información mínima: solo id y correo.
    // El frontend lo adjunta en cada petición privada como "Authorization: Bearer <token>".
    const token = jwt.sign(
      { id: user.id, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Devolver token + datos del usuario (sin password).
    // Se incluyen los campos de plan para que el frontend pueda
    // verificar si el usuario tiene un plan activo (hasActivePlan).
    return res.json({
      token,
      user: {
        id:                user.id,
        nombre:            user.nombre,
        apellido:          user.apellido,
        correo:            user.correo,
        web:               user.web,
        razon_social:      user.razon_social,
        ruc:               user.ruc,
        direccion:         user.direccion,
        logo_url:          user.logo_url,
        plan_duracion:     user.plan_duracion     || null,
        fecha_inicio_plan: user.fecha_inicio_plan || null,
        fecha_fin_plan:    user.fecha_fin_plan     || null,
      },
    });

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
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url, plan_duracion, fecha_inicio_plan, fecha_fin_plan FROM users WHERE id = ?",
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
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url, plan_duracion, fecha_inicio_plan, fecha_fin_plan FROM users WHERE id = ?",
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
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url, plan_duracion, fecha_inicio_plan, fecha_fin_plan FROM users WHERE id = ?",
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

    // bcrypt.compare verifica la contraseña antigua contra el hash almacenado en BD
    // sin exponer el hash en memoria ni en consola.
    const isOldPasswordValid = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: "La contraseña antigua no es correcta" });
    }

    // bcrypt.hash protege la nueva contraseña antes de guardarla.
    // El factor de costo 10 equilibra seguridad y rendimiento.
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, parseInt(id)]
    );

    // Nunca devolver la contraseña en la respuesta
    return res.json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("[authController] updateUserPassword error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ── register ──────────────────────────────────────────────────
// Crea un nuevo usuario en la tabla users.
// Ruta pública — NO requiere JWT.
// La contraseña SIEMPRE se guarda con bcrypt (nunca en texto plano).
// Valida: campos obligatorios, correo válido, correo único, RUC 11 dígitos,
// contraseña mínimo 6 caracteres, URLs opcionales bien formadas.
export const register = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      correo,
      password,
      web,
      razon_social,
      ruc,
      direccion,
      logo_url,
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !correo || !password || !razon_social || !ruc || !direccion) {
      return res.status(400).json({ error: "Debe completar todos los campos obligatorios" });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    // RUC debe tener exactamente 11 dígitos numéricos
    const rucRegex = /^\d{11}$/;
    if (!rucRegex.test(ruc)) {
      return res.status(400).json({ error: "El RUC debe tener exactamente 11 dígitos" });
    }

    // Contraseña mínima de 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar URL web si fue proporcionada
    if (web && web.trim() !== "") {
      try { new URL(web); } catch {
        return res.status(400).json({ error: "La URL web no es válida" });
      }
    }

    // Validar URL del logo si fue proporcionada
    if (logo_url && logo_url.trim() !== "") {
      try { new URL(logo_url); } catch {
        return res.status(400).json({ error: "La URL del logo no es válida" });
      }
    }

    // Verificar que el correo no esté ya registrado
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE correo = ?",
      [correo.trim().toLowerCase()]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // Hash de la contraseña con bcrypt — factor de costo 10
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users
         (nombre, apellido, correo, password, web, razon_social, ruc, direccion, logo_url,
          plan_duracion, fecha_inicio_plan, fecha_fin_plan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL)`,
      // plan_duracion / fecha_inicio_plan / fecha_fin_plan quedan NULL:
      // el usuario se registra sin plan activo.
      // El plan se activara despues del pago; hasta entonces el acceso
      // a la integracion quedara bloqueado segun estos campos.
      [
        nombre.trim(),
        apellido.trim(),
        correo.trim().toLowerCase(),
        hashedPassword,
        web          || "",
        razon_social.trim(),
        ruc.trim(),
        direccion.trim(),
        logo_url     || "",
      ]
    );

    return res.status(201).json({ message: "Usuario registrado correctamente" });

  } catch (error) {
    console.error("[authController] register error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ──────────────────────────────────────────────────────────
// getCompanyBook
// Ruta PUBLICA — no requiere JWT.
// Devuelve los datos de la empresa corporativa oficial de Certia,
// que corresponde SIEMPRE al usuario con id = 1.
// Este endpoint es el que usa el enlace "Libro de Reclamaciones"
// del footer: esa vista siempre muestra el libro de Certia (id=1),
// independientemente de quien este logueado.
// Nunca se expone el password.
// Recibe: GET /api/company-book
// ──────────────────────────────────────────────────────────
export const getCompanyBook = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url FROM users WHERE id = 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Libro oficial no encontrado" });
    }

    return res.json({ company: rows[0] });

  } catch (error) {
    console.error("[authController] getCompanyBook error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ──────────────────────────────────────────────────────
// getCompanyBookBySlug
// Ruta PÚBLICA — no requiere JWT.
// Recibe el slug generado a partir de la razón social del usuario.
// Carga TODOS los usuarios y busca el que cuyo slug coincida.
// Esto permite que cada usuario tenga su propio libro público en /libro/:slug.
// La lógica de slug es idéntica a la del frontend (normalize + replace).
// Recibe: GET /api/company-book/:slug
// ──────────────────────────────────────────────────────
export const getCompanyBookBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return res.status(400).json({ error: "Slug inválido" });
    }

    // Mógica de slug idéntica a la del Dashboard.jsx:
    // razon_social → lowercase → quitar tildes → quitar chars especiales → guiones
    const toSlug = (str) =>
      (str || "empresa")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    const [users] = await pool.query(
      "SELECT id, nombre, apellido, correo, web, razon_social, ruc, direccion, logo_url FROM users"
    );

    const match = users.find((u) => toSlug(u.razon_social) === slug.trim());

    if (!match) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    return res.json({ company: match });

  } catch (error) {
    console.error("[authController] getCompanyBookBySlug error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
