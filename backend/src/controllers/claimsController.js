// ============================================================
// claimsController.js — Lógica para creación de reclamos
// ============================================================

import pool from "../config/db.js";

// ── Helpers ───────────────────────────────────────────────

// Genera correlativo con formato: RECLAMO-YYYYMMDD-NNNNN
// El número secuencial se calcula contando los reclamos del día.
const generateCorrelativo = async () => {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, "0");
  const dd    = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM claims WHERE DATE(created_at) = CURDATE()"
  );
  const seq = String(rows[0].total + 1).padStart(5, "0");
  return `RECLAMO-${dateStr}-${seq}`;
};

// Genera un código de seguimiento alfanumérico de 7 caracteres en mayúsculas.
// El cliente lo usará para consultar el estado de su reclamo.
const generateCodigoSeguimiento = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0 ni I/1 para evitar confusión
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// ──────────────────────────────────────────────────────────
// createClaim
// Recibe los datos del formulario público, genera correlativo
// y código de seguimiento, y guarda el reclamo en MySQL.
// Recibe: POST /api/claims
// Es una ruta pública — no requiere JWT (el cliente no está logueado).
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
      descripcion_reclamo,
      fecha_compra_consumo,
      pedido_cliente,
    } = req.body;

    // ── Validaciones obligatorias ──────────────────────────
    if (!user_id || isNaN(user_id) || parseInt(user_id) <= 0) {
      return res.status(400).json({ error: "ID de empresa requerido" });
    }
    if (!nombre?.trim())                         return res.status(400).json({ error: "El nombre es obligatorio" });
    if (!primer_apellido?.trim())                return res.status(400).json({ error: "El primer apellido es obligatorio" });
    if (!tipo_documento?.trim())                 return res.status(400).json({ error: "El tipo de documento es obligatorio" });
    if (!numero_documento?.trim())               return res.status(400).json({ error: "El número de documento es obligatorio" });
    if (!celular?.trim())                        return res.status(400).json({ error: "El celular es obligatorio" });
    if (!departamento?.trim())                   return res.status(400).json({ error: "El departamento es obligatorio" });
    if (!provincia?.trim())                      return res.status(400).json({ error: "La provincia es obligatoria" });
    if (!distrito?.trim())                       return res.status(400).json({ error: "El distrito es obligatorio" });
    if (!direccion?.trim())                      return res.status(400).json({ error: "La dirección es obligatoria" });
    if (!correo_electronico?.trim())             return res.status(400).json({ error: "El correo es obligatorio" });
    if (!tipo_reclamo?.trim())                   return res.status(400).json({ error: "El tipo de reclamo es obligatorio" });
    if (!tipo_consumo?.trim())                   return res.status(400).json({ error: "El tipo de consumo es obligatorio" });
    if (!monto_reclamado && monto_reclamado !== 0) return res.status(400).json({ error: "El monto reclamado es obligatorio" });
    if (!descripcion_producto_servicio?.trim())  return res.status(400).json({ error: "La descripción del producto/servicio es obligatoria" });
    if (!descripcion_reclamo?.trim())            return res.status(400).json({ error: "La descripción del reclamo es obligatoria" });
    if (!pedido_cliente?.trim())                 return res.status(400).json({ error: "El pedido del cliente es obligatorio" });

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo_electronico.trim())) {
      return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    // ── Generar correlativo y código de seguimiento ────────
    const correlativo         = await generateCorrelativo();
    // Reintentar si hay colisión (extremadamente improbable)
    let codigo_seguimiento    = generateCodigoSeguimiento();
    const [existing] = await pool.query(
      "SELECT id FROM claims WHERE codigo_seguimiento = ?",
      [codigo_seguimiento]
    );
    if (existing.length > 0) {
      codigo_seguimiento = generateCodigoSeguimiento();
    }

    // ── Insertar en MySQL ──────────────────────────────────
    await pool.query(
      `INSERT INTO claims (
        user_id, correlativo, codigo_seguimiento,
        nombre, primer_apellido, segundo_apellido,
        tipo_documento, numero_documento, celular,
        departamento, provincia, distrito,
        direccion, referencia, correo_electronico,
        es_menor_edad, tipo_reclamo, tipo_consumo,
        numero_pedido, monto_reclamado,
        descripcion_producto_servicio, descripcion_reclamo,
        fecha_compra_consumo, pedido_cliente
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(user_id),
        correlativo,
        codigo_seguimiento,
        nombre.trim(),
        primer_apellido.trim(),
        segundo_apellido?.trim() || null,
        tipo_documento.trim(),
        numero_documento.trim(),
        celular.trim(),
        departamento.trim(),
        provincia.trim(),
        distrito.trim(),
        direccion.trim(),
        referencia?.trim() || null,
        correo_electronico.trim().toLowerCase(),
        es_menor_edad === "Si" ? 1 : 0,
        tipo_reclamo,
        tipo_consumo,
        numero_pedido?.trim() || null,
        parseFloat(monto_reclamado),
        descripcion_producto_servicio.trim(),
        descripcion_reclamo.trim(),
        fecha_compra_consumo || null,
        pedido_cliente.trim(),
      ]
    );

    return res.status(201).json({
      message: "Reclamo registrado correctamente",
      correlativo,
      codigo_seguimiento,
    });

  } catch (error) {
    console.error("[claimsController] createClaim error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
