// ============================================================
// claimController.js — Controlador público del libro de reclamaciones
//
// Esta ruta es PÚBLICA: la usa el consumidor final, no el admin.
// Por eso NO requiere JWT.
//
// Por qué correlativo y codigo_seguimiento se generan aquí (backend):
//   - Garantizan unicidad y formato consistente sin depender del cliente.
//   - El frontend no tiene acceso a la secuencia de la BD.
//   - Evita manipulación de correlativo por parte del usuario.
//
// Por qué NO se guarda captcha_respuesta:
//   - El captcha es solo una verificación visual en el frontend.
//   - No tiene valor almacenable; su único rol es bloquear bots antes
//     de que lleguen al backend.
// ============================================================

import pool from "../config/db.js";

// ── Genera correlativo con formato RECLAMO-YYYYMMDD-NNNNN ─
// El número secuencial se calcula contando los reclamos del día actual.
const generateCorrelativo = async () => {
  const today = new Date();

  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day   = String(today.getDate()).padStart(2, "0");

  const datePart = `${year}${month}${day}`;

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM claims
     WHERE DATE(created_at) = CURDATE()`
  );

  const nextNumber = String(rows[0].total + 1).padStart(5, "0");

  return `RECLAMO-${datePart}-${nextNumber}`;
};

// ── Genera un código de seguimiento alfanumérico de 7 caracteres ─
// Usa letras mayúsculas y dígitos para que sea fácil de leer/dictar.
const generateTrackingCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

// ── Garantiza unicidad del código consultando la BD ──────
// En condiciones normales el bucle itera solo una vez;
// el while es una salvaguarda ante colisiones estadísticamente raras.
const generateUniqueTrackingCode = async () => {
  let code = "";
  let exists = true;

  while (exists) {
    code = generateTrackingCode();

    const [rows] = await pool.query(
      "SELECT id FROM claims WHERE codigo_seguimiento = ?",
      [code]
    );

    exists = rows.length > 0;
  }

  return code;
};

// ── createClaim ───────────────────────────────────────────
// Recibe los datos del formulario público, valida, genera
// correlativo + codigo_seguimiento, y guarda en MySQL.
//
// Cómo se arma el payload:
//   - El frontend envía todos los campos del formulario EXCEPTO
//     captcha_respuesta (no se persiste) y los campos generados
//     (correlativo, codigo_seguimiento) que se crean aquí.
//
// user_id: temporalmente viene de localStorage en el frontend.
//   Fase 2: el backend buscará user_id usando el slug de la URL pública.
// ──────────────────────────────────────────────────────────
export const createClaim = async (req, res) => {
  try {
    const {
      user_id,

      nombre,
      primer_apellido,
      segundo_apellido,

      tipo_documento,
      numero_documento,
      celular,

      departamento,
      provincia,
      distrito,

      direccion,
      referencia,
      correo_electronico,

      es_menor_edad,

      tipo_reclamo,
      tipo_consumo,
      numero_pedido,

      monto_reclamado,
      descripcion_producto_servicio,
      // detalle_reclamo: texto del reclamo/queja — se guarda en claims.detalle_reclamo
      detalle_reclamo,
      fecha_compra_consumo,

      archivo_adjunto,

      pedido_cliente,

      acepta_politica,
    } = req.body;

    // ── Validaciones obligatorias ──────────────────────────
    // Se itera sobre cada campo para devolver cuál está faltando,
    // lo que facilita depuración tanto en desarrollo como en producción.
    const requiredFields = {
      user_id,
      nombre,
      primer_apellido,
      segundo_apellido,
      tipo_documento,
      numero_documento,
      celular,
      departamento,
      provincia,
      distrito,
      direccion,
      correo_electronico,
      es_menor_edad,
      tipo_reclamo,
      tipo_consumo,
      descripcion_producto_servicio,
      detalle_reclamo,
      pedido_cliente,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === null || value === undefined || String(value).trim() === "") {
        return res.status(400).json({ error: `Faltan campos obligatorios (${field})` });
      }
    }

    // monto_reclamado se valida aparte porque puede ser 0 (válido como número)
    if (monto_reclamado === null || monto_reclamado === undefined || String(monto_reclamado).trim() === "") {
      return res.status(400).json({ error: "Faltan campos obligatorios (monto_reclamado)" });
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo_electronico)) {
      return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    // Validar que el celular tenga exactamente 9 dígitos
    const celularRegex = /^\d{9}$/;
    if (!celularRegex.test(celular)) {
      return res.status(400).json({ error: "El celular debe tener 9 dígitos" });
    }

    // Validar que el usuario aceptó la política de privacidad
    if (!acepta_politica) {
      return res.status(400).json({ error: "Debe aceptar la Política de Privacidad" });
    }

    // Verificar que la empresa (user_id) exista en la BD
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    // ── Generar campos automáticos ─────────────────────────
    const correlativo        = await generateCorrelativo();
    const codigo_seguimiento = await generateUniqueTrackingCode();

    // Obtener el nombre del archivo subido por multer.
    // req.file está disponible porque uploadClaimAttachment.single() procesó el request.
    // Si no se adjuntó archivo, req.file es undefined y se guarda cadena vacía.
    const uploadedFileName = req.file ? req.file.filename : "";

    // ── Guardar en claims ─────────────────────────────────
    // Cómo se guarda: todos los campos del formulario + los dos generados.
    // captcha_respuesta NO se persiste (es solo verificación visual).
    await pool.query(
      `INSERT INTO claims (
        user_id,
        correlativo,
        codigo_seguimiento,

        nombre,
        primer_apellido,
        segundo_apellido,

        tipo_documento,
        numero_documento,
        celular,

        departamento,
        provincia,
        distrito,

        direccion,
        referencia,
        correo_electronico,

        es_menor_edad,

        tipo_reclamo,
        tipo_consumo,
        numero_pedido,

        monto_reclamado,
        descripcion_producto_servicio,
        detalle_reclamo,
        fecha_compra_consumo,

        archivo_adjunto,

        pedido_cliente,

        acepta_politica
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?,
        ?,
        ?
      )`,
      [
        user_id,
        correlativo,
        codigo_seguimiento,

        nombre,
        primer_apellido,
        segundo_apellido,

        tipo_documento,
        numero_documento,
        celular,

        departamento,
        provincia,
        distrito,

        direccion,
        referencia || "",
        correo_electronico,

        es_menor_edad,

        tipo_reclamo,
        tipo_consumo,
        numero_pedido || "",

        monto_reclamado,
        descripcion_producto_servicio,
        detalle_reclamo,
        fecha_compra_consumo || null,

        uploadedFileName,

        pedido_cliente,

        acepta_politica ? 1 : 0,
      ]
    );

    return res.status(201).json({
      message:            "Reclamo registrado correctamente",
      correlativo,
      codigo_seguimiento,
    });

  } catch (error) {
    console.error("[claimController] createClaim error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ── getPendingClaims ────────────────────────────────────
// Devuelve los reclamos con estado PENDIENTE del usuario logueado.
// Ruta protegida con JWT — user_id se extrae del token, NO del body.
// Solo devuelve reclamos de esa empresa; nunca de otros usuarios.
export const getPendingClaims = async (req, res) => {
  try {
    // user_id viene del token JWT decodificado por verifyToken
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT
         id,
         correlativo,
         codigo_seguimiento,
         -- Campo calculado para la columna "Cliente" en la tabla del Dashboard
         CONCAT(nombre, ' ', primer_apellido, ' ', segundo_apellido) AS cliente,
         -- Campos individuales necesarios para el modal de detalle del reclamo
         nombre,
         primer_apellido,
         segundo_apellido,
         tipo_documento,
         numero_documento,
         celular,
         correo_electronico,
         departamento,
         provincia,
         distrito,
         tipo_reclamo,
         monto_reclamado,
         descripcion_producto_servicio,
         detalle_reclamo,
         pedido_cliente,
         archivo_adjunto,
         created_at
       FROM claims
       WHERE user_id = ?
         AND UPPER(estado) = 'PENDIENTE'
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ claims: rows });

  } catch (error) {
    console.error("[claimController] getPendingClaims error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ── getCompletedClaims ────────────────────────────────
// Devuelve los reclamos con estado COMPLETADO del usuario logueado.
// Ruta protegida con JWT — user_id se extrae del token, NO del body.
// Solo devuelve reclamos de esa empresa; nunca de otros usuarios.
export const getCompletedClaims = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT
         id,
         correlativo,
         codigo_seguimiento,
         CONCAT(nombre, ' ', primer_apellido, ' ', segundo_apellido) AS cliente,
         tipo_reclamo,
         monto_reclamado,
         created_at
       FROM claims
       WHERE user_id = ?
         AND UPPER(estado) = 'COMPLETADO'
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ claims: rows });

  } catch (error) {
    console.error("[claimController] getCompletedClaims error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
