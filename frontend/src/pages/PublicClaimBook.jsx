// ============================================================
// PublicClaimBook.jsx — Vista pública del libro de reclamaciones
// Ruta: /libro/:slug
//
// Esta pantalla es accesible por cualquier visitante (clientes externos).
// El slug en la URL identifica a qué empresa pertenece el libro.
//
// Los datos del encabezado (razón social, RUC, dirección) pertenecen
// a la EMPRESA dueña del libro, NO al cliente que llena el formulario.
//
// ⚠️ Fase 1: datos de empresa desde localStorage; formulario solo visual.
// Fase 2: obtener datos de empresa desde el backend usando el slug,
//         guardar reclamos asociados a esa empresa en base de datos.
// ============================================================

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// react-datepicker: selector de fecha visual con calendario popup
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Estilos reutilizables
const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #9ca3af",
  borderRadius: "4px",
  background: "#fff",
  color: "#111827",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "5px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1f2937",
  marginBottom: "6px",
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "18px",
  marginBottom: "18px",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "18px",
  marginBottom: "18px",
};

function Field({ label, required, children }) {
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function PublicClaimBook() {
  // slug identifica la empresa dueña del libro en la URL
  const { slug } = useParams();

  // ── Datos de la empresa dueña del libro ─────────────────
  // Fase 1: obtenidos desde localStorage del usuario logueado.
  // Fase 2: se reemplaza por GET /api/empresa/:slug para obtener
  // los datos reales de la empresa sin depender de localStorage.
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ── Estado unificado del formulario de reclamo ───────────
  // Todos los campos del formulario viven aquí.
  // Preparado para enviarse al backend en Fase 2 como un solo objeto.
  const [claimForm, setClaimForm] = useState({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",

    tipo_documento: "",
    numero_documento: "",
    celular: "",

    departamento: "",
    provincia: "",
    distrito: "",

    direccion: "",
    referencia: "",
    correo_electronico: "",

    es_menor_edad: "",

    tipo_reclamo: "",
    tipo_consumo: "Producto",
    numero_pedido: "",

    monto_reclamado: "",
    descripcion_producto_servicio: "",
    descripcion_reclamo: "",

    // Objeto Date para el DatePicker; en Fase 2 se serializa a ISO string
    fecha_compra_consumo: null,

    // Objeto File; en Fase 2 se envía como FormData
    archivo_adjunto: null,

    pedido_cliente: "",

    // Checkbox de política — booleano
    acepta_politica: false,

    captcha_respuesta: "",
  });

  // ── Handler general ──────────────────────────────────────
  // Maneja inputs, selects, textareas, radios, checkboxes y file.
  // Checkbox usa `checked` en lugar de `value`.
  // File usa `files[0]` para guardar el objeto File.
  const handleClaimChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setClaimForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked :
        type === "file"     ? (files[0] || null) :
                              value,
    }));
  };

  // ── Captcha matemático aleatorio ──────────────────────
  // Evita envíos automáticos de bots con una operación simple.
  // En Fase 2 se validará captcha_respuesta === captchaAnswer antes de enviar.
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState(null);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ["+", "-"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    if (operator === "+") {
      setCaptchaQuestion(`¿Cuánto es ${num1} + ${num2}?`);
      setCaptchaAnswer(num1 + num2);
    } else {
      // Resta siempre con el mayor primero para evitar negativos
      const bigger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      setCaptchaQuestion(`¿Cuánto es ${bigger} - ${smaller}?`);
      setCaptchaAnswer(bigger - smaller);
    }
  };

  // Generar una operación nueva cada vez que se carga la página
  useEffect(() => {
    generateCaptcha();
  }, []);

  // ── Estado del envío ─────────────────────────────────────
  const [submitLoading, setSubmitLoading]   = useState(false);
  const [submitError,   setSubmitError]     = useState("");
  const [submitResult,  setSubmitResult]    = useState(null); // { correlativo, codigo_seguimiento }

  // ── Handler de envío ─────────────────────────────────────
  // Cómo se arma el payload:
  //   - Se toman todos los campos de claimForm EXCEPTO captcha_respuesta
  //     (el captcha es solo verificación visual, no se persiste en BD).
  //   - archivo_adjunto: se envía solo el nombre del archivo, no el binario.
  //   - fecha_compra_consumo: el Date object se serializa a YYYY-MM-DD.
  //   - acepta_politica: se envía como booleano para que el backend lo valide.
  //   - user_id viene de localStorage (temporal — Fase 2 usará el slug de URL).
  //
  // correlativo y codigo_seguimiento los genera el backend, no el frontend.
  const handleSubmitClaim = async () => {
    try {
      // Verificar que existe la empresa asociada (user_id desde localStorage)
      if (!user?.id) {
        alert("No se encontró la empresa asociada al libro");
        return;
      }

      // Validar política de privacidad en frontend como primera línea de defensa
      if (!claimForm.acepta_politica) {
        alert("Debe aceptar la Política de Privacidad");
        return;
      }

      // Validar captcha matemático antes de llamar al backend
      if (parseInt(claimForm.captcha_respuesta) !== captchaAnswer) {
        setSubmitError("La respuesta de verificación es incorrecta.");
        return;
      }

      setSubmitError("");
      setSubmitLoading(true);

      // Payload: todos los campos del formulario salvo captcha_respuesta.
      // user_id: temporalmente desde localStorage.
      // Fase 2: el backend buscará user_id usando el slug de la URL pública.
      const payload = {
        user_id: user.id,

        nombre:           claimForm.nombre,
        primer_apellido:  claimForm.primer_apellido,
        segundo_apellido: claimForm.segundo_apellido,

        tipo_documento:   claimForm.tipo_documento,
        numero_documento: claimForm.numero_documento,
        celular:          claimForm.celular,

        departamento: claimForm.departamento,
        provincia:    claimForm.provincia,
        distrito:     claimForm.distrito,

        direccion:           claimForm.direccion,
        referencia:          claimForm.referencia,
        correo_electronico:  claimForm.correo_electronico,

        es_menor_edad: claimForm.es_menor_edad,

        tipo_reclamo:  claimForm.tipo_reclamo,
        tipo_consumo:  claimForm.tipo_consumo,
        numero_pedido: claimForm.numero_pedido,

        monto_reclamado:              claimForm.monto_reclamado,
        descripcion_producto_servicio: claimForm.descripcion_producto_servicio,
        descripcion_reclamo:           claimForm.descripcion_reclamo,

        // Serializar Date a YYYY-MM-DD o enviar null
        fecha_compra_consumo: claimForm.fecha_compra_consumo
          ? claimForm.fecha_compra_consumo.toISOString().split("T")[0]
          : null,

        // Solo se guarda el nombre del archivo; el binario no se envía aún
        archivo_adjunto: claimForm.archivo_adjunto
          ? claimForm.archivo_adjunto.name
          : "",

        pedido_cliente: claimForm.pedido_cliente,

        // El backend valida que sea true; se persiste como TINYINT(1)
        acepta_politica: claimForm.acepta_politica,
      };

      const res  = await fetch("http://localhost:3000/api/claims", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "No se pudo registrar el reclamo");
        return;
      }

      // Mostrar confirmación con los datos generados por el backend
      setSubmitResult({
        correlativo:        data.correlativo,
        codigo_seguimiento: data.codigo_seguimiento,
      });

    } catch (error) {
      console.error("Error enviando reclamo:", error);
      setSubmitError("Error al enviar reclamo. Verifica tu conexión.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "30px 16px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Encabezado: datos de la empresa ─────────────── */}
        <div style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "28px 32px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827", textTransform: "uppercase" }}>
              {user?.razon_social || "—"}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
              RUC: {user?.ruc || "—"}
            </div>
          </div>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>Dirección del Negocio: </span>
            {user?.direccion || "—"}
          </div>
        </div>

        {/* ── Título principal ─────────────────────────────── */}
        <h1 style={{
          textAlign: "center",
          fontSize: "26px",
          fontWeight: 800,
          color: "#1f2937",
          marginBottom: "28px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Libro de Reclamaciones
        </h1>

        {/* ── Pantalla de confirmación — reemplaza el formulario tras envío exitoso ── */}
        {submitResult ? (
          <div style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "40px 32px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
            textAlign: "center",
            marginBottom: "40px",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#15803d", marginBottom: "8px" }}>
              ¡Reclamo Registrado Exitosamente!
            </h2>
            <p style={{ color: "#374151", fontSize: "15px", marginBottom: "28px" }}>
              Hemos recibido tu reclamo. Guarda estos datos para hacer seguimiento.
            </p>
            <div style={{
              display: "inline-block",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              padding: "20px 32px",
              textAlign: "left",
              marginBottom: "28px",
            }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>N° de Correlativo</p>
              <p style={{ fontSize: "18px", fontWeight: 800, color: "#111827", letterSpacing: "1px", marginBottom: "16px" }}>
                {submitResult.correlativo}
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Código de Seguimiento</p>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#1d4ed8", letterSpacing: "3px" }}>
                {submitResult.codigo_seguimiento}
              </p>
            </div>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              El proveedor tiene hasta <strong>15 días hábiles</strong> para responder a tu reclamo.
            </p>
          </div>
        ) : (
          <>
        {/* ── SECCIÓN 1: Identificación del Consumidor ─────── */}
        <div style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "28px 32px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "22px", flexWrap: "wrap", gap: "8px" }}>
            <p style={sectionTitleStyle}>Identificación del Consumidor Reclamante</p>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>(*) Datos Requeridos</span>
          </div>

          {/* Fila 1: Nombre, Primer Apellido, Segundo Apellido */}
          <div style={grid3}>
            <Field label="Nombre" required>
              <input style={inputStyle} type="text" name="nombre" value={claimForm.nombre} onChange={handleClaimChange} />
            </Field>
            <Field label="Primer Apellido" required>
              <input style={inputStyle} type="text" name="primer_apellido" value={claimForm.primer_apellido} onChange={handleClaimChange} />
            </Field>
            <Field label="Segundo Apellido" required>
              <input style={inputStyle} type="text" name="segundo_apellido" value={claimForm.segundo_apellido} onChange={handleClaimChange} />
            </Field>
          </div>

          {/* Fila 2: Tipo Documento, N° Documento, Celular */}
          <div style={grid3}>
            <Field label="Tipo de Documento" required>
              <select style={inputStyle} name="tipo_documento" value={claimForm.tipo_documento} onChange={handleClaimChange}>
                <option value="">Seleccionar</option>
                <option value="DNI">DNI</option>
                <option value="CE">Carné de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="RUC">RUC</option>
              </select>
            </Field>
            <Field label="N° Documento" required>
              <input style={inputStyle} type="text" name="numero_documento" value={claimForm.numero_documento} onChange={handleClaimChange} />
            </Field>
            <Field label="Celular (9 dígitos)" required>
              <input style={inputStyle} type="tel" maxLength={9} name="celular" value={claimForm.celular} onChange={handleClaimChange} />
            </Field>
          </div>

          {/* Fila 3: Departamento, Provincia, Distrito */}
          <div style={grid3}>
            <Field label="Departamento" required>
              <input style={inputStyle} type="text" name="departamento" value={claimForm.departamento} onChange={handleClaimChange} />
            </Field>
            <Field label="Provincia" required>
              <input style={inputStyle} type="text" name="provincia" value={claimForm.provincia} onChange={handleClaimChange} />
            </Field>
            <Field label="Distrito" required>
              <input style={inputStyle} type="text" name="distrito" value={claimForm.distrito} onChange={handleClaimChange} />
            </Field>
          </div>

          {/* Fila 4: Dirección, Referencia, Correo */}
          <div style={grid3}>
            <Field label="Dirección" required>
              <input style={inputStyle} type="text" name="direccion" value={claimForm.direccion} onChange={handleClaimChange} />
            </Field>
            <Field label="Referencia">
              <input style={inputStyle} type="text" name="referencia" value={claimForm.referencia} onChange={handleClaimChange} />
            </Field>
            <Field label="Correo Electrónico" required>
              <input style={inputStyle} type="email" name="correo_electronico" value={claimForm.correo_electronico} onChange={handleClaimChange} />
            </Field>
          </div>

          {/* Fila 5: Menor de edad */}
          <div style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>
              ¿Eres menor de edad? <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "24px", marginTop: "6px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                <input type="radio" name="es_menor_edad" value="Si" checked={claimForm.es_menor_edad === "Si"} onChange={handleClaimChange} />
                Sí
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                <input type="radio" name="es_menor_edad" value="No" checked={claimForm.es_menor_edad === "No"} onChange={handleClaimChange} />
                No
              </label>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 2: Detalles del Reclamo ──────────────── */}
        <div style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "28px 32px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "22px", flexWrap: "wrap", gap: "8px" }}>
            <p style={sectionTitleStyle}>Detalles del Reclamo o Queja</p>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>(*) Datos Requeridos</span>
          </div>

          {/* Fila 1: Tipo Reclamo, Tipo Consumo, N° Pedido */}
          <div style={grid3}>
            <Field label="Tipo de Reclamo" required>
              <select style={inputStyle} name="tipo_reclamo" value={claimForm.tipo_reclamo} onChange={handleClaimChange}>
                <option value="">Seleccionar</option>
                <option value="RECLAMO">Reclamo</option>
                <option value="QUEJA">Queja</option>
              </select>
            </Field>
            <Field label="Tipo de Consumo" required>
              {/* El valor de tipo_consumo controla el label dinámico de la fecha */}
              <select style={inputStyle} name="tipo_consumo" value={claimForm.tipo_consumo} onChange={handleClaimChange}>
                <option value="Producto">Producto</option>
                <option value="Servicio">Servicio</option>
              </select>
            </Field>
            <Field label="N° de Pedido">
              <input style={inputStyle} type="text" name="numero_pedido" value={claimForm.numero_pedido} onChange={handleClaimChange} />
            </Field>
          </div>

          {/* Fila 2: Monto Reclamado, Descripción Producto */}
          <div style={grid2}>
            <Field label="Monto Reclamado (S/)" required>
              <input style={inputStyle} type="number" min="0" step="0.01" name="monto_reclamado" value={claimForm.monto_reclamado} onChange={handleClaimChange} />
            </Field>
            <Field label="Descripción del Producto/Servicio" required>
              <input style={inputStyle} type="text" name="descripcion_producto_servicio" value={claimForm.descripcion_producto_servicio} onChange={handleClaimChange} />
            </Field>
          </div>

          {/* Fecha dinámica: el label cambia según tipo_consumo.
              "Producto" → "Fecha de Compra" | "Servicio" → "Fecha de Consumo"
              En Fase 2: fecha_compra_consumo.toISOString() se envía al backend. */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              {claimForm.tipo_consumo === "Servicio" ? "Fecha de Consumo" : "Fecha de Compra"}{" "}
              <span style={{ color: "#6b7280", fontWeight: 400 }}>(Opcional)</span>
            </label>
            <DatePicker
              selected={claimForm.fecha_compra_consumo}
              onChange={(date) => setClaimForm((prev) => ({ ...prev, fecha_compra_consumo: date }))}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/aaaa"
              className="claim-date-input"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>

          {/* Descripción del reclamo */}
          <Field label="Detalle del Reclamo o Queja" required>
            <textarea
              style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
              name="descripcion_reclamo"
              value={claimForm.descripcion_reclamo}
              onChange={handleClaimChange}
            />
          </Field>

          {/* Archivo adjunto — input file no usa value */}
          <div style={{ marginTop: "18px" }}>
            <label style={labelStyle}>
              Archivo Adjunto <span style={{ color: "#6b7280", fontWeight: 400 }}>(Opcional - Máx. 10MB)</span>
            </label>
            <input
              type="file"
              name="archivo_adjunto"
              accept=".jpg,.png,.pdf,.doc,.xls"
              onChange={handleClaimChange}
              style={{ fontSize: "14px", marginTop: "4px" }}
            />
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
              Formatos permitidos: .jpg, .png, .pdf, .doc, .xls
            </p>
          </div>
        </div>

        {/* ── SECCIÓN 3: Pedido del Cliente ────────────────── */}
        {/* Esta sección se usará para el submit real en Fase 2 */}
        <div style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "28px 32px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "22px", flexWrap: "wrap", gap: "8px" }}>
            <p style={sectionTitleStyle}>Pedido del Cliente</p>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>(*) Datos Requeridos</span>
          </div>

          <Field label="Pedido del Cliente" required>
            <textarea
              style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
              name="pedido_cliente"
              value={claimForm.pedido_cliente}
              onChange={handleClaimChange}
            />
          </Field>
        </div>

        {/* ── Zona inferior: checkbox, captcha, botón, textos legales ── */}
        {/* Checkbox y verificación se validarán en Fase 2 antes de enviar */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>

          {/* Checkbox Política de Privacidad — booleano en claimForm.acepta_politica */}
          <label className="privacy-checkbox-label">
            <input
              type="checkbox"
              name="acepta_politica"
              checked={claimForm.acepta_politica}
              onChange={handleClaimChange}
              style={{ marginRight: "6px", cursor: "pointer" }}
            />
            Acepto la{" "}
            <a
              href="/politica-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="privacy-link"
            >
              Política de Privacidad
            </a>
            .
          </label>

          {/* Campo de verificación matemática aleatoria.
              La pregunta cambia en cada carga de página.
              En Fase 2 se valida que captcha_respuesta === captchaAnswer antes de enviar. */}
          <div style={{ margin: "16px auto 20px", maxWidth: "320px", textAlign: "center" }}>
            <label style={{ ...labelStyle, display: "block", marginBottom: "6px", textAlign: "center" }}>
              Verificación: {captchaQuestion} <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              style={{ ...inputStyle, maxWidth: "160px", textAlign: "center" }}
              type="number"
              name="captcha_respuesta"
              placeholder="Tu respuesta"
              value={claimForm.captcha_respuesta}
              onChange={handleClaimChange}
            />
          </div>

          {/* Mensaje de error de validación */}
          {submitError && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              borderRadius: "6px",
              padding: "10px 16px",
              marginBottom: "16px",
              maxWidth: "480px",
              margin: "0 auto 16px",
              fontSize: "14px",
            }}>
              {submitError}
            </div>
          )}

          {/* Botón enviar */}
          <button
            type="button"
            onClick={handleSubmitClaim}
            disabled={submitLoading}
            style={{
              background: submitLoading ? "#93c5fd" : "#1d4ed8",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "4px",
              border: "none",
              fontSize: "15px",
              fontWeight: 600,
              cursor: submitLoading ? "not-allowed" : "pointer",
            }}
          >
            {submitLoading ? "Enviando..." : "Enviar Reclamo"}
          </button>

          {/* Textos legales obligatorios según normativa INDECOPI */}
          <ul style={{
            maxWidth: "760px",
            margin: "28px auto 0",
            textAlign: "left",
            paddingLeft: "20px",
            color: "#4b5563",
            fontSize: "13px",
            lineHeight: 1.7,
          }}>
            <li>
              La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
            </li>
            <li style={{ marginTop: "8px" }}>
              El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.
            </li>
          </ul>
        </div>

        </>
        )}

      </div>
    </div>
  );
}

export default PublicClaimBook;

