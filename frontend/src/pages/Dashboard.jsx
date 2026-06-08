// ============================================================
// Dashboard.jsx — Panel principal del sistema Libro de Reclamaciones
// Ruta: /dashboard (privada — requiere sesión en localStorage)
// ⚠️ Fase 1: autenticación por localStorage.
//    Fase 2: reemplazar por validación JWT contra el backend.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// API_URL: URL base del backend (cambia entre dev y prod via VITE_API_URL)
// SERVER_URL: raiz del servidor, para archivos estaticos /uploads
import { API_URL, SERVER_URL } from "../config/api";
// Librería para generar el código QR como elemento canvas
import { QRCodeCanvas } from "qrcode.react";
// Imagen del libro usada en la vista previa del widget de integración
import libroImg from "../assets/img/libro.png";

// ── Registros por página en la tabla de pendientes ──
const ITEMS_PER_PAGE = 10;

// ─────────────────────────────────────────────────────────
// ReportsTable — tabla de reportes con paginación.
// Recibe datos reales desde el backend vía props.
// reports: array de reclamos; loading/error: estados de carga.
// onAction: callback opcional llamado con el objeto claim al hacer clic en el botón.
// emptyMessage: texto cuando no hay registros (muestra tabla con cabeceras).
function ReportsTable({ reports, loading, error, actionLabel, onAction, emptyMessage = "No hay reclamos." }) {
  const [page, setPage] = useState(1);

  // Reiniciar página cuando cambian los datos
  const totalPages     = Math.max(1, Math.ceil(reports.length / ITEMS_PER_PAGE));
  const visibleReports = reports.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // ── Estados visuales de carga ──────────────────────────
  if (loading) {
    return <p style={{ padding: "20px", color: "#6b7280" }}>Cargando reclamos...</p>;
  }
  if (error) {
    return <p style={{ padding: "20px", color: "#dc2626" }}>{error}</p>;
  }

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          border: "1px solid #d1d5db",
          fontSize: "14px",
          tableLayout: "fixed",
        }}>
          <colgroup>
            <col style={{ width: "10%" }} />   {/* N° Correlativo */}
            <col style={{ width: "16%" }} />   {/* Cód. Seguimiento */}
            <col style={{ width: "22%" }} />   {/* Cliente */}
            <col style={{ width: "10%" }} />   {/* Tipo */}
            <col style={{ width: "10%" }} />   {/* Monto */}
            <col style={{ width: "12%" }} />   {/* Fecha */}
            <col style={{ width: "20%" }} />   {/* Acciones */}
          </colgroup>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["N° Correlativo", "Cód. Seguimiento", "Cliente", "Tipo", "Monto", "Fecha", "Acciones"].map((h) => (
                <th key={h} style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#374151",
                  borderBottom: "1px solid #d1d5db",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Si no hay registros: fila que ocupa todas las columnas */}
            {visibleReports.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "20px 12px", color: "#6b7280", textAlign: "center" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
            /* Mapeo de datos reales desde claims — reemplaza mock data */
            visibleReports.map((claim) => (
              <tr key={claim.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px" }}>{claim.correlativo}</td>
                <td style={{ padding: "10px 12px", color: "#1e3a8a", fontWeight: 500 }}>{claim.codigo_seguimiento}</td>
                <td style={{ padding: "10px 12px" }}>{claim.cliente}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: claim.tipo_reclamo === "RECLAMO" ? "#fee2e2" : "#fef9c3",
                    color:      claim.tipo_reclamo === "RECLAMO" ? "#dc2626"  : "#854d0e",
                  }}>
                    {claim.tipo_reclamo}
                  </span>
                </td>
                {/* Formato: S/ 120.00 */}
                <td style={{ padding: "10px 12px" }}>S/ {Number(claim.monto_reclamado).toFixed(2)}</td>
                {/* Formato: YYYY-MM-DD */}
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                  {new Date(claim.created_at).toISOString().split("T")[0]}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {/* Al hacer clic llama onAction con el reclamo seleccionado (si se proporcionó) */}
                  <button
                    type="button"
                    onClick={() => onAction && onAction(claim)}
                    style={{
                      padding: "4px 14px",
                      background: "#1e3a8a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {actionLabel}
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Controles de paginación con datos reales ── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        marginTop: "16px",
      }}>
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: page === 1 ? "#f3f4f6" : "#fff",
            color: page === 1 ? "#9ca3af" : "#374151",
            cursor: page === 1 ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          ← Anterior
        </button>

        <span style={{ fontSize: "14px", color: "#374151" }}>
          Página {page} de {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: page === totalPages ? "#f3f4f6" : "#fff",
            color: page === totalPages ? "#9ca3af" : "#374151",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();

  // ── Validación de sesión ──────────────────────────────
  // Si no hay usuario guardado → redirigir al login inmediatamente.
  // ⚠️ localStorage no es seguridad real; en Fase 2 usar JWT + backend.
  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // ── Estado de pestañas ───────────────────────────────
  const [activeTab, setActiveTab] = useState("Pendientes");

  // ── Hooks de la sección QR ────────────────────────────
  // Deben declararse aquí (antes del early return) para respetar
  // las reglas de hooks de React.
  const [showQR,    setShowQR]    = useState(false);
  const qrRef                     = useRef(null);
  const [widgetSize, setWidgetSize] = useState("Mediano");

  // ── Estados de los formularios de Ajuste ─────────────
  // Inicializados vacíos; se rellenan desde el backend en el useEffect.
  const [userForm, setUserForm] = useState({
    nombre: "", apellido: "", correo: "", web: "",
  });
  const [businessForm, setBusinessForm] = useState({
    razon_social: "", ruc: "", direccion: "", logo_url: "",
  });

  // ── Estado del formulario de cambio de contraseña ────────
  // ⚠️ Solo visual por ahora. NO guardar contraseñas aquí.
  // Implementación real: validar contraseña antigua en backend
  // y guardar la nueva con bcrypt (Fase 2).
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [businessSuccessMessage, setBusinessSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  // planMessage: shown near the tabs when user tries to enter Integracion without
  // an active plan. Disappears after 3 seconds automatically.
  const [planMessage, setPlanMessage] = useState("");

  // ── Estado de datos del plan — leídos frescos desde la BD ────────
  // Inicializados desde localStorage como valor provisional mientras carga el fetch.
  const [fechaFinPlan,    setFechaFinPlan]    = useState(user?.fecha_fin_plan    || null);
  const [fechaInicioPlan, setFechaInicioPlan] = useState(user?.fecha_inicio_plan || null);
  const [planDuracion,    setPlanDuracion]    = useState(user?.plan_duracion     || null);

  // ── Planes disponibles — obtenidos desde la tabla `plans` de la BD ──
  // Elimina precios hardcodeados del frontend.
  // Futura integración con Izipay para gestión de pagos y renovaciones.
  const [plans,            setPlans]            = useState([]);
  const [plansLoading,     setPlansLoading]     = useState(false);
  const [selectedPlan,     setSelectedPlan]     = useState(null); // guarda plan.id
  const [showConfirmation, setShowConfirmation] = useState(false); // pantalla previa a Izipay
  const [paymentLoading,   setPaymentLoading]   = useState(false); // bloquea doble clic
  const [paymentMessage,   setPaymentMessage]   = useState("");    // mensaje de éxito
  const [paymentError,     setPaymentError]     = useState("");    // mensaje de error

  // ── Carga de datos frescos desde la base de datos ────
  // Se ejecuta cuando el usuario está disponible.
  // Evita mostrar datos desactualizados de localStorage.
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/user/${user.id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(({ user: fresh }) => {
        if (!fresh) return;
        setUserForm({
          nombre:   fresh.nombre   || "",
          apellido: fresh.apellido || "",
          correo:   fresh.correo   || "",
          web:      fresh.web      || "",
        });
        setBusinessForm({
          razon_social: fresh.razon_social || "",
          ruc:          fresh.ruc          || "",
          direccion:    fresh.direccion    || "",
          logo_url:     fresh.logo_url     || "",
        });
        // Actualizar datos del plan con valores reales de la BD
        setFechaFinPlan(fresh.fecha_fin_plan       || null);
        setFechaInicioPlan(fresh.fecha_inicio_plan || null);
        setPlanDuracion(fresh.plan_duracion        || null);
      })
      .catch((err) => console.error("[Dashboard] fetch user error:", err));
  }, [user?.id]);

  // hasActivePlan: returns true when the user has a plan whose end date has not
  // yet passed. Both plan_duracion and fecha_fin_plan must be non-null (they are
  // NULL for users registered without a paid plan).
  // TODO: integrate with MercadoPago payment flow so this flag is set on purchase.
  const hasActivePlan = () => {
    if (!user?.plan_duracion || !user?.fecha_fin_plan) return false;
    const today   = new Date();
    const endDate = new Date(user.fecha_fin_plan);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  };

  // handleTabChange: blocks navigation to Integracion if the user has no active
  // plan. Shows a temporary message and leaves the current tab unchanged.
  const handleTabChange = (tab) => {
    if (tab === "Integración" && !hasActivePlan()) {
      setPlanMessage("Debes adquirir un plan para usar Integración.");
      setTimeout(() => setPlanMessage(""), 3000);
      return;
    }
    setActiveTab(tab);
  };

  // ── Reclamos pendientes — datos reales desde MySQL ────────
  // Se cargan con JWT; el backend filtra por user_id del token.
  // Reemplaza la mock data anterior de mockReports.
  const [pendingClaims,  setPendingClaims]  = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError,   setPendingError]   = useState("");

  const fetchPendingClaims = async () => {
    try {
      setPendingLoading(true);
      setPendingError("");

      const res  = await fetch(`${API_URL}/claims/pending`, {
        method:  "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setPendingError(data.error || "No se pudieron cargar los reclamos");
        return;
      }

      // Guardar solo los reclamos de esta empresa (filtro ya aplicado en backend)
      setPendingClaims(data.claims || []);
    } catch (error) {
      console.error("Error cargando reclamos pendientes:", error);
      setPendingError("Error al cargar reclamos pendientes");
    } finally {
      setPendingLoading(false);
    }
  };

  // Cargar reclamos al entrar a la pestaña Pendientes
  useEffect(() => {
    if (activeTab === "Pendientes") {
      fetchPendingClaims();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Reclamos completados — datos reales desde MySQL ────────
  // Carga real con JWT; filtro estado COMPLETADO aplicado en backend.
  // Futura función "Ver Respuesta" operará sobre estos registros.
  const [completedClaims,  setCompletedClaims]  = useState([]);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [completedError,   setCompletedError]   = useState("");

  const fetchCompletedClaims = async () => {
    try {
      setCompletedLoading(true);
      setCompletedError("");

      const res  = await fetch(`${API_URL}/claims/completed`, {
        method:  "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setCompletedError(data.error || "No se pudieron cargar los reclamos completados");
        return;
      }

      setCompletedClaims(data.claims || []);
    } catch (error) {
      console.error("Error cargando reclamos completados:", error);
      setCompletedError("Error al cargar reclamos completados");
    } finally {
      setCompletedLoading(false);
    }
  };

  // Cargar reclamos al entrar a la pestaña Completado
  useEffect(() => {
    if (activeTab === "Completado") {
      fetchCompletedClaims();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Carga de planes disponibles desde la BD ────────────────────
  // GET /api/plans — público, sin JWT.
  // Se ejecuta solo al abrir la pestaña "Mi Plan" para no hacer llamadas innecesarias.
  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const res  = await fetch(`${API_URL}/plans`);
      const data = await res.json();
      if (!res.ok) return;
      // Reemplaza cualquier precio hardcodeado: los datos vienen de la tabla `plans`
      setPlans(data.plans || []);
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Mi Plan") {
      fetchPlans();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Logout ────────────────────────────────────────────
  const handleLogout = () => {    // Eliminar token JWT y datos del usuario al cerrar sesión
    localStorage.removeItem("token");    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── Modal de reclamo ─────────────────────────────────
  // Todos los hooks deben declararse ANTES del early return (reglas de React).
  // selectedClaim: objeto del reclamo seleccionado desde la tabla Pendientes.
  // officialResponse: texto que el admin escribe como respuesta oficial.
  const [selectedClaim,         setSelectedClaim]         = useState(null);
  const [isClaimModalOpen,      setIsClaimModalOpen]      = useState(false);
  const [officialResponse,      setOfficialResponse]      = useState("");
  const [isSendingResponse,     setIsSendingResponse]     = useState(false);
  const [responseSuccessMessage, setResponseSuccessMessage] = useState("");
  const [responseErrorMessage,   setResponseErrorMessage]   = useState("");

  // ── Modal de visualización (Completado) — solo lectura ──
  // A diferencia del modal de Pendientes, este no permite editar ni enviar nada.
  // Los datos vienen de getCompletedClaims que incluye respuesta y fecha_respuesta.
  const [selectedCompletedClaim, setSelectedCompletedClaim] = useState(null);
  const [isCompletedModalOpen,   setIsCompletedModalOpen]   = useState(false);

  const openCompletedModal  = (claim) => { setSelectedCompletedClaim(claim); setIsCompletedModalOpen(true); };
  const closeCompletedModal = ()      => { setSelectedCompletedClaim(null);  setIsCompletedModalOpen(false); };

  const openClaimModal  = (claim) => { setSelectedClaim(claim); setIsClaimModalOpen(true); };
  // Al cerrar, se limpia todo: reclamo, texto de respuesta y mensajes de estado.
  const closeClaimModal = () => {
    setSelectedClaim(null);
    setIsClaimModalOpen(false);
    setOfficialResponse("");
    setResponseSuccessMessage("");
    setResponseErrorMessage("");
  };

  // ── Enviar respuesta oficial al backend ───────────────────
  // PUT /api/claims/:claimId/respond — protegido con JWT.
  // Al tener éxito: quita el reclamo de la lista Pendientes,
  // muestra confirmación brevemente y cierra el modal.
  const handleSendOfficialResponse = async () => {
    try {
      setResponseSuccessMessage("");
      setResponseErrorMessage("");

      if (!selectedClaim?.id) {
        setResponseErrorMessage("No se encontró el reclamo seleccionado");
        return;
      }

      // Validar que se haya escrito algo antes de llamar al backend
      if (!officialResponse || officialResponse.trim() === "") {
        setResponseErrorMessage("Debe escribir una respuesta oficial");
        return;
      }

      setIsSendingResponse(true);

      const res = await fetch(
        `${API_URL}/claims/${selectedClaim.id}/respond`,
        {
          method:  "PUT",
          headers: {
            "Content-Type":  "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ respuesta: officialResponse }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setResponseErrorMessage(data.error || "No se pudo enviar la respuesta");
        return;
      }

      // Éxito: mostrar mensaje y quitar el reclamo de la lista Pendientes de inmediato
      setResponseSuccessMessage("Respuesta enviada correctamente");
      setPendingClaims((prev) => prev.filter((c) => c.id !== selectedClaim.id));

      // Cerrar modal después de 1.2 s y recargar Completado para que aparezca allí
      setTimeout(() => {
        closeClaimModal();
        setResponseSuccessMessage("");
        setResponseErrorMessage("");
        fetchCompletedClaims();
      }, 1200);

    } catch (error) {
      console.error("Error enviando respuesta:", error);
      setResponseErrorMessage("Error al enviar respuesta. Verifica tu conexión.");
    } finally {
      setIsSendingResponse(false);
    }
  };

  // ── Helpers para visualizar/descargar archivos adjuntos ──
  // Actualmente archivo_adjunto guarda solo el nombre del archivo.
  // Cuando se implemente multer/upload real, los archivos se servirán desde /uploads/claims.
  // SERVER_URL es la raiz del servidor (sin /api) para acceder a archivos subidos.
  const getAttachmentUrl = (fileName) =>
    `${SERVER_URL}/uploads/claims/${fileName}`;

  const getFileExtension = (fileName = "") =>
    fileName.split(".").pop().toLowerCase();

  // Abre en nueva pestaña si es PDF/imagen; descarga si es documento Office.
  // Para extensiones no reconocidas, intenta abrir en nueva pestaña.
  const handleViewAttachment = (fileName) => {
    if (!fileName) return;
    const fileUrl   = getAttachmentUrl(fileName);
    const extension = getFileExtension(fileName);
    const previewExtensions  = ["pdf", "jpg", "jpeg", "png"];
    const downloadExtensions = ["doc", "docx", "xls", "xlsx"];
    if (previewExtensions.includes(extension)) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (downloadExtensions.includes(extension)) {
      const link = document.createElement("a");
      link.href     = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // Mientras se resuelve la validación, no renderizar nada
  if (!user) return null;

  const companyName = user?.razon_social || "Empresa sin nombre";

  // Estilos reutilizables para los inputs y botones de la pestaña Ajuste
  const inputStyle = {
    width: "320px",
    padding: "8px",
    border: "1px solid #9ca3af",
    borderRadius: "4px",
    background: "#fff",
    color: "#111827",
    fontSize: "14px",
    boxSizing: "border-box",
  };
  const ajusteBtn = {
    background: "#1d4ed8",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  };

  // ── URL dinámica del libro de reclamaciones ────────────
  // Construida con nombre + apellido del usuario logeado.
  // Slug basado en razón social para URLs públicas limpias y representativas.
  // normalize("NFD") + replace elimina tildes y diacríticos (ó→o, ñ→n, etc.).
  // replace(/[^a-z0-9\s-]/g, "") descarta caracteres especiales.
  // Los espacios se convierten en guiones para mayor legibilidad.
  const userSlug = (user?.razon_social || "empresa")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  // Usa window.location.origin para funcionar en local (localhost:5173)
  // y en producción (https://certia.com) sin cambios de código.
  const userBookUrl = `${window.location.origin}/libro/${userSlug}`;

  // Mapa de tamaños del widget
  const widgetSizes = { "Pequeño": 60, "Mediano": 90, "Grande": 130 };
  const currentWidgetHeight = widgetSizes[widgetSize];

  // ── Descarga el QR generado como archivo PNG ──────────
  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `qr-libro-reclamaciones-${userSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Código HTML del widget generado dinámicamente ───────
  const htmlCode = `<a href="${userBookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none; border: none; padding: 0; margin: 0;"><img src="${window.location.origin}/src/assets/img/libro.png" alt="Libro de Reclamaciones" style="height: ${currentWidgetHeight}px; width: auto; border: none; display: block;"></a>`;

  const copyHtmlCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      alert("Código copiado correctamente");
    } catch (error) {
      console.error("Error al copiar código:", error);
      alert("No se pudo copiar el código");
    }
  };

  const copyBookUrl = async () => {
    try {
      await navigator.clipboard.writeText(userBookUrl);
      alert("URL copiada correctamente");
    } catch (error) {
      console.error("Error al copiar URL:", error);
      alert("No se pudo copiar la URL");
    }
  };

  // ── Actualiza datos del usuario en MySQL ────────────────
  const handleUpdateUserProfile = async () => {
    // Validación mínima en frontend (el backend también valida)
    if (!user?.id) {
      alert("No se encontró el usuario logueado");
      return;
    }
    if (!userForm.nombre || !userForm.apellido || !userForm.correo) {
      alert("Nombre, apellidos y correo son obligatorios");
      return;
    }

    // ── Logs de depuración — eliminar en producción ──
    console.log("user:", user);
    console.log("userForm:", userForm);
    console.log("URL:", `${API_URL}/users/${user.id}/profile`);

    try {
      const res = await fetch(`${API_URL}/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Token JWT requerido por el middleware verifyToken del backend
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombre:   userForm.nombre,
          apellido: userForm.apellido,
          correo:   userForm.correo,
          web:      userForm.web,
        }),
      });

      console.log("status:", res.status);
      const data = await res.json();
      console.log("respuesta backend:", data);

      if (!res.ok) {
        alert(data.error || "No se pudieron actualizar los datos");
        return;
      }
      // Actualizar localStorage con el usuario devuelto por el backend
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccessMessage("Datos actualizados correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("ERROR FETCH updateUserProfile:", error);
      alert("Error al actualizar datos del usuario");
    }
  };

  // ── Actualizar datos del negocio ─────────────────────────
  // Llama al backend PUT /api/users/:id/business.
  // Valida RUC (11 dígitos) y logo_url (URL válida si se proporciona).
  const handleUpdateBusinessData = async () => {
    try {
      if (!user?.id) {
        alert("No se encontró el usuario logueado");
        return;
      }

      // Raz\u00f3n social y RUC son obligatorios
      if (!businessForm.razon_social || !businessForm.ruc) {
        alert("Razón social y RUC son obligatorios");
        return;
      }

      // Validación de RUC: exactamente 11 dígitos numéricos
      const rucRegex = /^\d{11}$/;
      if (!rucRegex.test(businessForm.ruc)) {
        alert("El RUC debe tener exactamente 11 dígitos");
        return;
      }

      // Llamada PUT al backend con los datos del negocio
      const res = await fetch(`${API_URL}/users/${user.id}/business`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Token JWT requerido por el middleware verifyToken del backend
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          razon_social: businessForm.razon_social,
          ruc:          businessForm.ruc,
          direccion:    businessForm.direccion,
          logo_url:     businessForm.logo_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudieron actualizar los datos del negocio");
        return;
      }

      // Actualizar localStorage con el usuario devuelto por el backend
      localStorage.setItem("user", JSON.stringify(data.user));

      // Mensaje visual de éxito; se limpia tras 3 segundos
      setBusinessSuccessMessage("Datos del negocio actualizados correctamente");
      setTimeout(() => setBusinessSuccessMessage(""), 3000);

    } catch (error) {
      console.error("Error actualizando datos del negocio:", error);
      alert("Error al actualizar datos del negocio");
    }
  };

  // ── Actualizar contraseña ────────────────────────────────
  // Verifica la contraseña antigua en el backend antes de actualizar.
  // La contraseña nunca se guarda en localStorage ni se muestra en consola.
  // TODO Fase 2: migrar a bcrypt en backend.
  const handleUpdatePassword = async () => {
    try {
      // Limpiar mensajes previos
      setPasswordSuccessMessage("");
      setPasswordErrorMessage("");

      if (!user?.id) {
        setPasswordErrorMessage("No se encontró el usuario logueado");
        return;
      }

      // Validaciones en frontend (el backend también valida)
      if (!passwordForm.oldPassword || !passwordForm.newPassword) {
        setPasswordErrorMessage("Debe completar ambos campos de contraseña");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordErrorMessage("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }

      // Llamada PUT al backend — el backend verifica la contraseña antigua
      const res = await fetch(`${API_URL}/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Token JWT requerido por el middleware verifyToken del backend
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordErrorMessage(data.error || "No se pudo actualizar la contraseña");
        return;
      }

      // Limpiar inputs y mostrar mensaje de éxito
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setPasswordSuccessMessage("Contraseña actualizada correctamente");
      setTimeout(() => setPasswordSuccessMessage(""), 3000);

    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      setPasswordErrorMessage("Error al actualizar contraseña");
    }
  };

  const tabs = ["Pendientes", "Completado", "Integración", "Mi Plan", "Ajuste"];

  return (
    <>
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "24px" }}>

      {/* ── Cabecera ─────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px",
      }}>
        {/* Bloque izquierdo: saludo + título + caducidad */}
        <div>
          {/* Saludo personalizado */}
          <p style={{ fontSize: "15px", color: "#374151", marginBottom: "8px" }}>
            Hola, {user?.nombre} {user?.apellido}
          </p>

          {/* Título principal con razón social */}
          <h1 style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "10px",
          }}>
            Libro de Reclamaciones: {companyName}
          </h1>

          {/* Fecha de caducidad real desde la BD (campo fecha_fin_plan de users) */}
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "22px" }}>
            Fecha de Caducidad: {fechaFinPlan
              ? new Date(fechaFinPlan).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
              : "Sin plan activo"}
          </p>
        </div>

        {/* Botón Salir */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#1e3a8a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Salir
        </button>
      </div>

      {/* ── Panel con pestañas ───────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}>

        {/* Barra de pestañas */}
        <div style={{
          display: "flex",
          gap: "6px",
          padding: "12px 16px 0",
          borderBottom: "1px solid #e5e7eb",
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            // isLocked: Integracion tab is disabled when the user has no active plan
            const isLocked = tab === "Integración" && !hasActivePlan();
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  padding: "8px 18px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 400,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  border: isActive ? "1px solid #e5e7eb" : "1px solid transparent",
                  borderBottom: isActive ? "2px solid #fff" : "none",
                  borderTop: isActive ? "3px solid #1e3a8a" : "3px solid transparent",
                  borderRadius: "6px 6px 0 0",
                  background: isActive ? "#fff" : "#f3f4f6",
                  color: isActive ? "#111827" : "#6b7280",
                  marginBottom: "-1px",
                  transition: "all 0.15s",
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                {isLocked ? `${tab} 🔒` : tab}
              </button>
            );
          })}
        </div>

        {/* Plan message: appears for 3 s when user clicks Integracion without a plan */}
        {planMessage && (
          <p className="plan-message" style={{ padding: "6px 16px 0" }}>
            {planMessage}
          </p>
        )}

        {/* ── Contenido de cada pestaña ───────────────── */}
        <div style={{ padding: "20px" }}>

          {/* PESTAÑA: Pendientes — botón de acción: "Ver" */}
          {activeTab === "Pendientes" && (
            <ReportsTable
              reports={pendingClaims}
              loading={pendingLoading}
              error={pendingError}
              actionLabel="Ver"
              onAction={openClaimModal}
            />
          )}

          {/* PESTAÑA: Completado — carga real desde backend, estado = COMPLETADO */}
          {activeTab === "Completado" && (
            <ReportsTable
              reports={completedClaims}
              loading={completedLoading}
              error={completedError}
              actionLabel="Ver Respuesta"
              onAction={openCompletedModal}
              emptyMessage="No hay reclamos completados."
            />
          )}

          {/* PESTAÑA: Integracion */}
          {/* Security guard: if user somehow lands here without a plan, show restricted notice */}
          {activeTab === "Integración" && !hasActivePlan() && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: "#dc2626", fontSize: "16px", fontWeight: 600 }}>
                Acceso restringido. Debes adquirir un plan activo para usar esta seccion.
              </p>
            </div>
          )}
          {/* Full integration panel — only rendered when plan is active */}
          {activeTab === "Integración" && hasActivePlan() && (
            <div className="integration-panel">
              <h2 className="integration-panel__title">Herramientas de Integración</h2>

              {/* ── 1. Código QR ─────────────────────────────── */}
              {/* La URL del libro NO se muestra aquí; aparece solo
                  en la sección "URL directa" más abajo para no duplicarla. */}
              <div className="integration-section">
                <h3 className="integration-section__title">1. Código QR</h3>
                <p className="integration-section__desc">
                  Genera un código QR que enlace directamente a tu libro de reclamaciones.
                </p>

                {/* Fila de botones: Generar QR + Descargar QR (al lado) */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <button className="integration-btn" onClick={() => setShowQR(true)}>
                    Generar QR
                  </button>

                  {/* Descargar QR aparece junto a Generar QR una vez que el QR fue generado */}
                  {showQR && (
                    <button
                      onClick={downloadQR}
                      style={{
                        background: "#fff",
                        color: "#1d4ed8",
                        border: "1.5px solid #1d4ed8",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Descargar QR
                    </button>
                  )}
                </div>

                {/* QR visual — solo visible tras hacer clic en Generar QR */}
                {showQR && (
                  <div ref={qrRef} className="qr-box">
                    <QRCodeCanvas
                      value={userBookUrl}
                      size={220}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                )}
              </div>

              {/* ── 2. Aviso para Tienda Física ───────────────── */}
              <div className="integration-section">
                <h3 className="integration-section__title">2. Aviso para Tienda Física</h3>
                <p className="integration-section__desc">
                  Genera un PDF con los datos de tu empresa y un código QR para imprimir y colocar en tu tienda.
                </p>
                {/* Abre /aviso/:slug en nueva pestaña — usa el mismo slug generado arriba */}
                <button
                  className="integration-btn"
                  onClick={() => window.open(`/aviso/${userSlug}`, "_blank")}
                >
                  Generar PDF para Imprimir
                </button>
              </div>

              {/* ── 3. Código HTML para tu Sitio Web ─────────── */}
              <div className="integration-section">
                <h3 className="integration-section__title">3. Código HTML para tu Sitio Web</h3>
                <p className="integration-section__desc">
                  Copia y pega este código en tu sitio web para mostrar el acceso a tu libro de reclamaciones.
                </p>

                <h4 className="integration-section__subtitle">Personalizar Widget</h4>

                {/* Select funcional — cambia widgetSize y actualiza preview + htmlCode */}
                <div style={{ marginBottom: "16px" }}>
                  <label className="integration-label">Tamaño de la imagen:</label>
                  <select
                    className="integration-select"
                    value={widgetSize}
                    onChange={(e) => setWidgetSize(e.target.value)}
                  >
                    <option>Pequeño</option>
                    <option>Mediano</option>
                    <option>Grande</option>
                  </select>
                </div>

                {/* Vista previa del widget — la imagen cambia de alto según el select.
                    Está envuelta en <a> para que al hacer clic abra el libro público del usuario. */}
                <p className="integration-label">Vista previa:</p>
                <div className="integration-preview">
                  <a href={userBookUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={libroImg}
                      alt="Libro de Reclamaciones"
                      className="integration-book-img"
                      style={{ height: `${currentWidgetHeight}px`, width: "auto" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </a>
                </div>

                {/* Textarea con el código HTML actualizado dinámicamente */}
                <label className="integration-label">Código HTML:</label>
                <textarea
                  className="integration-html-textarea"
                  readOnly
                  value={htmlCode}
                />

                {/* Copia todo el contenido del textarea al portapapeles */}
                <button className="integration-btn" style={{ marginBottom: "24px" }} onClick={copyHtmlCode}>Copiar código</button>

                {/* URL directa — aparece solo aquí, no duplicada arriba */}
                <p className="integration-label">URL directa de tu libro:</p>
                <div className="integration-url-box">{userBookUrl}</div>

                {/* Botón copiar URL — usa copyBookUrl con la URL dinámica del usuario */}
                <button className="integration-btn" onClick={copyBookUrl}>Copiar URL</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
               PESTAÑA: Mi Plan — Centro de gestión de membresía
               Sección principal de suscripciones de Certia.
               Lee datos reales desde la tabla users de la BD.
               Futura integración con Izipay para compra y renovación.
               ══════════════════════════════════════════════════════ */}
          {activeTab === "Mi Plan" && (() => {
            // ── Helpers de formato de fecha ──────────────────────
            const formatDate = (raw) => {
              if (!raw) return "No disponible";
              return new Date(raw).toLocaleDateString("es-PE", {
                day: "2-digit", month: "long", year: "numeric",
              });
            };

            // ── Interpreta plan_duracion a texto legible ──────────
            const planLabel = (() => {
              if (!planDuracion) return null;
              if (planDuracion === 10) return "Administrador";
              if (planDuracion === 1)  return "1 Año";
              if (planDuracion === 2)  return "2 Años";
              if (planDuracion === 3)  return "3 Años";
              return `${planDuracion} Años`;
            })();

            const hasplan = !!planDuracion;

            return (
              <div style={{ padding: "10px 0" }}>
                {/* ── Tarjeta principal centrada — estilo premium ── */}
                <div style={{
                  maxWidth: "900px",
                  margin: "0 auto",
                  background: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                  padding: "40px 48px",
                }}>

                  {/* ── Título de sección ── */}
                  <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>
                    Mi Plan
                  </h2>
                  <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "36px" }}>
                    Administra tu suscripción y consulta el estado actual de tu membresía.
                  </p>

                  {/* ── Bloque de estado del plan ── */}
                  <div style={{
                    background: hasplan ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${hasplan ? "#bbf7d0" : "#fecaca"}`,
                    borderRadius: "10px",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "32px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}>
                    <div>
                      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px", fontWeight: 500 }}>
                        ESTADO
                      </p>
                      <p style={{ fontSize: "20px", fontWeight: 700, color: hasplan ? "#15803d" : "#dc2626" }}>
                        {hasplan ? "Plan Activo" : "Sin Plan Activo"}
                      </p>
                    </div>
                    {/* Badge de estado */}
                    <span style={{
                      background: hasplan ? "#16a34a" : "#dc2626",
                      color: "#fff",
                      padding: "6px 18px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                    }}>
                      {hasplan ? "Activo" : "Sin Plan"}
                    </span>
                  </div>

                  {/* ── Grid de detalles: Plan · Inicio · Vencimiento ── */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    marginBottom: "32px",
                  }}>

                    {/* Plan Actual */}
                    <div style={{
                      background: "#f9fafb",
                      borderRadius: "8px",
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                    }}>
                      <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Plan Actual
                      </p>
                      <p style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                        {planLabel || "Sin plan"}
                      </p>
                    </div>

                    {/* Fecha de Inicio */}
                    <div style={{
                      background: "#f9fafb",
                      borderRadius: "8px",
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                    }}>
                      <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Fecha de Inicio
                      </p>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "#374151" }}>
                        {formatDate(fechaInicioPlan)}
                      </p>
                    </div>

                    {/* Fecha de Vencimiento */}
                    <div style={{
                      background: "#f9fafb",
                      borderRadius: "8px",
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                    }}>
                      <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Fecha de Vencimiento
                      </p>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "#374151" }}>
                        {formatDate(fechaFinPlan)}
                      </p>
                    </div>

                  </div>

                  {/* ── Planes disponibles desde la BD (sin precios hardcodeados) ── */}
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
                    Planes Disponibles
                  </h3>

                  {plansLoading ? (
                    <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "28px" }}>Cargando planes...</p>
                  ) : plans.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "28px" }}>No hay planes disponibles.</p>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      marginBottom: "28px",
                    }}>
                      {/* Lectura real desde la tabla `plans` — sin valores hardcodeados */}
                      {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        return (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            style={{
                              background: isSelected ? "#eff6ff" : "#f9fafb",
                              border: `2px solid ${isSelected ? "#1e3a8a" : "#e5e7eb"}`,
                              borderRadius: "10px",
                              padding: "20px",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
                              {plan.nombre}
                            </p>
                            <p style={{ fontSize: "26px", fontWeight: 700, color: isSelected ? "#1e3a8a" : "#374151", marginBottom: "4px" }}>
                              S/ {Number(plan.precio).toFixed(2)}
                            </p>
                            <p style={{ fontSize: "13px", color: "#6b7280" }}>
                              {plan.duracion_anios === 1
                                ? "1 Año"
                                : `${plan.duracion_anios} Años`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Bloque informativo ── */}
                  <p style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.7,
                    marginBottom: "28px",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}>
                    Tu plan determina el acceso a funcionalidades avanzadas como Integración
                    y futuras herramientas premium de Certia.
                  </p>

                  {/* ── Botón Comprar Plan ──
                       Solo activo cuando hay un plan seleccionado.
                       Al pulsar muestra la pantalla de confirmación;
                       NO integra Izipay todavía. */}
                  <button
                    type="button"
                    disabled={!selectedPlan}
                    onClick={() => setShowConfirmation(true)}
                    style={{
                      background: selectedPlan ? "#1e3a8a" : "#9ca3af",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 28px",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: selectedPlan ? "pointer" : "not-allowed",
                      transition: "background 0.2s",
                    }}
                  >
                    Comprar Plan
                  </button>

                  {/* ── Pantalla de confirmación ──
                       Paso previo obligatorio antes del procesamiento del pago.
                       Se muestra solo cuando showConfirmation === true y hay un plan seleccionado.
                       Aquí se registrará el pago como pendiente antes de redirigir a Izipay. */}
                  {showConfirmation && selectedPlan && (() => {
                    const plan = plans.find((p) => p.id === selectedPlan);
                    if (!plan) return null;
                    return (
                      <div style={{
                        maxWidth: "700px",
                        margin: "28px auto 0",
                        background: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                        padding: "36px 40px",
                        border: "1px solid #e5e7eb",
                      }}>

                        {/* Título */}
                        <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginBottom: "24px" }}>
                          Confirmar Compra
                        </h3>

                        {/* Datos del plan seleccionado — obtenidos desde la BD, sin hardcodear */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                            <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500 }}>Plan Seleccionado</span>
                            <span style={{ fontSize: "14px", color: "#111827", fontWeight: 700 }}>{plan.nombre}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                            <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500 }}>Duración</span>
                            <span style={{ fontSize: "14px", color: "#111827", fontWeight: 700 }}>
                              {plan.duracion_anios === 1 ? "1 Año" : `${plan.duracion_anios} Años`}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                            <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500 }}>Monto</span>
                            <span style={{ fontSize: "22px", color: "#1e3a8a", fontWeight: 700 }}>
                              S/ {Number(plan.precio).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Mensaje de advertencia */}
                        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "28px" }}>
                          Verifica los datos antes de proceder con el pago.
                        </p>

                        {/* Botones de acción */}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>

                          {/* Volver — cancela la confirmación */}
                          <button
                            type="button"
                            onClick={() => setShowConfirmation(false)}
                            style={{
                              background: "#f3f4f6",
                              color: "#374151",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                              padding: "10px 24px",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Volver
                          </button>

                          {/* Proceder al Pago — primer paso real del flujo de pagos.
                               Registra un pago pendiente en la tabla `payments`.
                               Base para el webhook/IPN de Izipay (integración futura). */}
                          <button
                            type="button"
                            disabled={paymentLoading}
                            onClick={async () => {
                              setPaymentMessage("");
                              setPaymentError("");
                              setPaymentLoading(true);
                              try {
                                // ── Paso 1: registrar/reutilizar pago pendiente ──
                                const createRes = await fetch(`${API_URL}/payments/create`, {
                                  method:  "POST",
                                  headers: {
                                    "Content-Type":  "application/json",
                                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                                  },
                                  body: JSON.stringify({ planId: plan.id }),
                                });
                                const createData = await createRes.json();
                                if (!createRes.ok) {
                                  setPaymentError(createData.error || "No se pudo registrar el pago");
                                  return;
                                }

                                const paymentId = createData.paymentId;

                                // ── Paso 2: crear orden en Izipay con el paymentId ──
                                const res = await fetch(`${API_URL}/payments/create-order`, {
                                  method:  "POST",
                                  headers: {
                                    "Content-Type":  "application/json",
                                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                                  },
                                  body: JSON.stringify({ paymentId }),
                                });
                                const data = await res.json();
                                if (!res.ok) {
                                  setPaymentError(data.error || "No se pudo conectar con el proveedor de pago");
                                  return;
                                }
                                // Paso 2 exitoso: redirigir al formulario de pago de Izipay.
                                if (data.success && data.paymentURL) {
                                  window.location.href = data.paymentURL;
                                } else {
                                  setPaymentError("No fue posible iniciar el proceso de pago.");
                                }
                              } catch (err) {
                                console.error("[Dashboard] createPayment error:", err);
                                setPaymentError("Error de conexión. Verifica que el servidor esté activo.");
                              } finally {
                                setPaymentLoading(false);
                              }
                            }}
                            style={{
                              background: paymentLoading ? "#6b7280" : "#1e3a8a",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "10px 24px",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor: paymentLoading ? "not-allowed" : "pointer",
                            }}
                          >
                            {paymentLoading ? "Procesando..." : "Proceder al Pago"}
                          </button>

                        </div>
                        {/* Mensajes de resultado del pago */}
                        {paymentMessage && (
                          <p style={{ marginTop: "16px", fontSize: "14px", color: "#16a34a", fontWeight: 600, textAlign: "center" }}>
                            ✅ {paymentMessage}
                          </p>
                        )}
                        {paymentError && (
                          <p style={{ marginTop: "16px", fontSize: "14px", color: "#dc2626", fontWeight: 600, textAlign: "center" }}>
                            ❌ {paymentError}
                          </p>
                        )}

                      </div>
                    );
                  })()}

                  {/* Próximamente:
                    - Compra de planes con Izipay
                    - Renovación automática y manual
                    - Historial de pagos
                  */}

                </div>
              </div>
            );
          })()}

          {/* PESTAÑA: Ajuste — Configuración de la cuenta */}
          {activeTab === "Ajuste" && (
            <div style={{ padding: "10px 0" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "28px" }}>
                Configuración de la Cuenta
              </h2>

              {/* ── Fila superior: 2 columnas ──────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "36px", alignItems: "start" }}>

                {/* Columna izquierda: Datos del Usuario */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "18px" }}>
                    Datos del Usuario
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Nombre</label>
                      <input type="text" value={userForm.nombre} onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Apellidos</label>
                      <input type="text" value={userForm.apellido} onChange={(e) => setUserForm({ ...userForm, apellido: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Correo Electrónico <span style={{ color: "#dc2626" }}>*</span></label>
                      <input type="email" value={userForm.correo} onChange={(e) => setUserForm({ ...userForm, correo: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Web</label>
                      <input type="text" value={userForm.web} onChange={(e) => setUserForm({ ...userForm, web: e.target.value })} style={inputStyle} />
                    </div>
                  </div>

                  {/* Llama al backend PUT /api/users/:id/profile y actualiza localStorage */}
                  <button type="button" style={{ ...ajusteBtn, marginTop: "20px" }} onClick={handleUpdateUserProfile}>
                    Actualizar Datos del Usuario
                  </button>
                  {successMessage && (
                    <p className="success-message">{successMessage}</p>
                  )}
                </div>

                {/* Columna derecha: Cambiar contraseña */}
                {/* ⚠️ Solo visual. No guarda datos. Implementación real con
                    hash bcrypt en backend (Fase 2). */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "18px" }}>
                    Cambiar contraseña
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Antigua Contraseña</label>
                      <input
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", color: "#374151", marginBottom: "4px" }}>Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* TODO Fase 2: validar oldPassword en backend, guardar newPassword con bcrypt */}
                  <button type="button" style={{ ...ajusteBtn, marginTop: "20px" }} onClick={handleUpdatePassword}>
                    Actualizar contraseña
                  </button>
                  {/* Mensaje visual de éxito: desaparece tras 3 segundos */}
                  {passwordSuccessMessage && (
                    <p className="success-message">{passwordSuccessMessage}</p>
                  )}
                  {/* Mensaje de error: permanece hasta que el usuario corrige */}
                  {passwordErrorMessage && (
                    <p className="error-message">{passwordErrorMessage}</p>
                  )}
                </div>

              </div>

              {/* ── Bloque 2: Datos del Negocio ────────────────── */}
              <div style={{ marginBottom: "36px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "18px" }}>
                  Datos del Negocio
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "180px 320px", gap: "18px", alignItems: "center" }}>
                  <label style={{ fontSize: "14px", color: "#374151" }}>Razón Social</label>
                  <input type="text" value={businessForm.razon_social} onChange={(e) => setBusinessForm({ ...businessForm, razon_social: e.target.value })} style={inputStyle} />

                  <label style={{ fontSize: "14px", color: "#374151" }}>RUC</label>
                  <input type="text" value={businessForm.ruc} onChange={(e) => setBusinessForm({ ...businessForm, ruc: e.target.value })} style={inputStyle} />

                  <label style={{ fontSize: "14px", color: "#374151" }}>Dirección</label>
                  <input type="text" value={businessForm.direccion} onChange={(e) => setBusinessForm({ ...businessForm, direccion: e.target.value })} style={inputStyle} />

                  <label style={{ fontSize: "14px", color: "#374151" }}>URL del Logo</label>
                  <input type="text" value={businessForm.logo_url} onChange={(e) => setBusinessForm({ ...businessForm, logo_url: e.target.value })} style={inputStyle} />
                </div>

                {/* PUT /api/users/:id/business — actualiza datos del negocio en MySQL */}
                <button type="button" style={{ ...ajusteBtn, marginTop: "20px" }} onClick={handleUpdateBusinessData}>
                  Actualizar Datos del Negocio
                </button>
                {/* Mensaje visual de éxito; desaparece tras 3 segundos */}
                {businessSuccessMessage && (
                  <p className="success-message">{businessSuccessMessage}</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

    {/* ── Modal de respuesta de reclamo ─────────────────────────────
        Se muestra sobrepuesto cuando isClaimModalOpen === true.
        selectedClaim: objeto con todos los datos del reclamo desde la BD.
        Diseño de dos columnas: izquierda (datos) — derecha (respuesta). */}
    {isClaimModalOpen && selectedClaim && (
      <div className="claim-modal-overlay" onClick={closeClaimModal}>
        <div className="claim-modal" onClick={(e) => e.stopPropagation()}>

          {/* ── Header: título + correlativo en azul + botón cerrar ── */}
          <div className="claim-modal-header">
            <h3>
              Responder Reclamo{" "}
              {selectedClaim.correlativo && (
                <span className="claim-modal-correlativo">: {selectedClaim.correlativo}</span>
              )}
            </h3>
            <button type="button" className="claim-modal-close-x" onClick={closeClaimModal}>×</button>
          </div>

          {/* ── Body: grid de dos columnas ── */}
          <div className="claim-modal-body">

            {/* ══ COLUMNA IZQUIERDA — datos del reclamo ══
                Muestra tres secciones tipo tarjeta: consumidor, detalle, adjuntos.
                38% del ancho, fondo gris claro, scroll independiente. */}
            <div className="claim-modal-left">

              {/* Sección A: Datos del Consumidor */}
              <div className="claim-modal-section">
                <div className="claim-modal-section-header">
                  <span>👤</span><span>Datos del Consumidor</span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Nombre</span>
                  <span className="cml-value">
                    {[selectedClaim.nombre, selectedClaim.primer_apellido, selectedClaim.segundo_apellido]
                      .filter(Boolean).join(" ")}
                  </span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Documento</span>
                  <span className="cml-value">{selectedClaim.tipo_documento}: {selectedClaim.numero_documento}</span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Contacto</span>
                  <span className="cml-value">{selectedClaim.celular} / {selectedClaim.correo_electronico}</span>
                </div>
                <div className="claim-modal-row" style={{ borderBottom: "none" }}>
                  <span className="cml-label">Ubicación</span>
                  <span className="cml-value">
                    {selectedClaim.departamento}, {selectedClaim.provincia} ({selectedClaim.distrito})
                  </span>
                </div>
              </div>

              {/* Sección B: Detalle del Reclamo */}
              <div className="claim-modal-section">
                <div className="claim-modal-section-header">
                  <span>📄</span><span>Detalle del Reclamo</span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Tipo</span>
                  <span className="cml-value">
                    {/* Badge de color según tipo_reclamo */}
                    <span className={
                      selectedClaim.tipo_reclamo?.toUpperCase() === "RECLAMO"
                        ? "claim-badge-reclamo"
                        : "claim-badge-queja"
                    }>
                      {selectedClaim.tipo_reclamo}
                    </span>
                  </span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Monto</span>
                  <span className="cml-value">S/ {selectedClaim.monto_reclamado}</span>
                </div>
                {/* Campos de texto largo: bloque con borde y fondo blanco */}
                <div className="claim-modal-col">
                  <span className="cml-label-top">Producto / Servicio</span>
                  <div className="claim-text-block">{selectedClaim.descripcion_producto_servicio}</div>
                </div>
                <div className="claim-modal-col">
                  <span className="cml-label-top">Queja / Reclamo</span>
                  <div className="claim-text-block">{selectedClaim.detalle_reclamo}</div>
                </div>
                <div className="claim-modal-col" style={{ borderBottom: "none" }}>
                  <span className="cml-label-top">Pedido del Cliente</span>
                  <div className="claim-text-block">{selectedClaim.pedido_cliente}</div>
                </div>
              </div>

              {/* Sección C: Evidencias / Adjuntos */}
              <div className="claim-modal-section claim-modal-section-last">
                <div className="claim-modal-section-header">
                  <span>📎</span><span>Evidencias / Adjuntos</span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  {selectedClaim.archivo_adjunto ? (
                    /* Botón ancho que muestra el archivo adjunto */
                    <button
                      type="button"
                      className="claim-adjunto-btn"
                      onClick={() => handleViewAttachment(selectedClaim.archivo_adjunto)}
                    >
                      📎 VER ARCHIVO ADJUNTO
                    </button>
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "14px" }}>Sin archivo adjunto</span>
                  )}
                </div>
              </div>

            </div>{/* fin columna izquierda */}

            {/* ══ COLUMNA DERECHA — respuesta oficial ══
                El admin escribe aquí la respuesta para el cliente.
                officialResponse: estado local conectado al backend mediante handleSendOfficialResponse. */}
            <div className="claim-modal-right">
              <div className="claim-response-area">
                <p className="claim-response-title">
                  <span style={{ marginRight: "8px" }}>💬</span>
                  Escriba la respuesta oficial para el cliente:
                </p>
                <textarea
                  className="claim-response-textarea"
                  placeholder="Ej: Estimado cliente, hemos procesado su solicitud y procederemos a..."
                  value={officialResponse}
                  onChange={(e) => setOfficialResponse(e.target.value)}
                />
                {/* Mensajes de éxito / error debajo del textarea */}
                {responseErrorMessage && (
                  <p className="error-message" style={{ marginTop: "10px" }}>{responseErrorMessage}</p>
                )}
                {responseSuccessMessage && (
                  <p className="success-message" style={{ marginTop: "10px" }}>{responseSuccessMessage}</p>
                )}
              </div>
            </div>

          </div>{/* fin body */}

          {/* ── Footer: botones de acción ── */}
          <div className="claim-modal-footer">
            <button type="button" className="claim-modal-secondary-btn" onClick={closeClaimModal}>
              ✕ Cerrar
            </button>
            {/* Conectado a handleSendOfficialResponse — guarda respuesta y cambia estado a completado */}
            <button
              type="button"
              className="claim-modal-primary-btn"
              onClick={handleSendOfficialResponse}
              disabled={isSendingResponse}
            >
              {isSendingResponse ? "Enviando..." : "Enviar Respuesta Oficial"}
            </button>
          </div>

        </div>
      </div>
    )}

    {/* ── Modal de visualización de reclamo completado — SOLO LECTURA ──────────
        Reutiliza las mismas clases CSS del modal de Pendientes para mantener
        el mismo estilo visual profesional. No permite editar ni enviar nada.
        Datos: getCompletedClaims (incluye respuesta + fecha_respuesta). */}
    {isCompletedModalOpen && selectedCompletedClaim && (
      <div className="claim-modal-overlay" onClick={closeCompletedModal}>
        <div className="claim-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header: título + correlativo en azul + badge Completado + × */}
          <div className="claim-modal-header">
            <h3>
              Respuesta del Reclamo{" "}
              <span className="claim-modal-correlativo">: {selectedCompletedClaim.correlativo}</span>
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Badge visual que indica que este reclamo ya fue resuelto */}
              <span style={{
                background: "#dcfce7", color: "#166534",
                padding: "4px 10px", borderRadius: "999px",
                fontSize: "12px", fontWeight: 700,
              }}>Completado</span>
              <button type="button" className="claim-modal-close-x" onClick={closeCompletedModal}>×</button>
            </div>
          </div>

          {/* Body: dos columnas — izquierda datos del reclamo, derecha respuesta oficial */}
          <div className="claim-modal-body">

            {/* Columna izquierda: replica exacta del modal de Pendientes (solo lectura) */}
            <div className="claim-modal-left">

              {/* Sección A: Datos del Consumidor */}
              <div className="claim-modal-section">
                <div className="claim-modal-section-header"><span>👤</span><span>Datos del Consumidor</span></div>
                <div className="claim-modal-row">
                  <span className="cml-label">Nombre</span>
                  <span className="cml-value">
                    {[selectedCompletedClaim.nombre, selectedCompletedClaim.primer_apellido, selectedCompletedClaim.segundo_apellido]
                      .filter(Boolean).join(" ")}
                  </span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Documento</span>
                  <span className="cml-value">{selectedCompletedClaim.tipo_documento}: {selectedCompletedClaim.numero_documento}</span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Contacto</span>
                  <span className="cml-value">{selectedCompletedClaim.celular} / {selectedCompletedClaim.correo_electronico}</span>
                </div>
                <div className="claim-modal-row" style={{ borderBottom: "none" }}>
                  <span className="cml-label">Ubicación</span>
                  <span className="cml-value">
                    {selectedCompletedClaim.departamento}, {selectedCompletedClaim.provincia} ({selectedCompletedClaim.distrito})
                  </span>
                </div>
              </div>

              {/* Sección B: Detalle del Reclamo */}
              <div className="claim-modal-section">
                <div className="claim-modal-section-header"><span>📄</span><span>Detalle del Reclamo</span></div>
                <div className="claim-modal-row">
                  <span className="cml-label">Tipo</span>
                  <span className="cml-value">
                    <span className={
                      selectedCompletedClaim.tipo_reclamo?.toUpperCase() === "RECLAMO"
                        ? "claim-badge-reclamo" : "claim-badge-queja"
                    }>{selectedCompletedClaim.tipo_reclamo}</span>
                  </span>
                </div>
                <div className="claim-modal-row">
                  <span className="cml-label">Monto</span>
                  <span className="cml-value">S/ {selectedCompletedClaim.monto_reclamado}</span>
                </div>
                <div className="claim-modal-col">
                  <span className="cml-label-top">Producto / Servicio</span>
                  <div className="claim-text-block">{selectedCompletedClaim.descripcion_producto_servicio}</div>
                </div>
                <div className="claim-modal-col">
                  <span className="cml-label-top">Queja / Reclamo</span>
                  <div className="claim-text-block">{selectedCompletedClaim.detalle_reclamo}</div>
                </div>
                <div className="claim-modal-col" style={{ borderBottom: "none" }}>
                  <span className="cml-label-top">Pedido del Cliente</span>
                  <div className="claim-text-block">{selectedCompletedClaim.pedido_cliente}</div>
                </div>
              </div>

              {/* Sección C: Evidencias / Adjuntos — reutiliza handleViewAttachment */}
              <div className="claim-modal-section claim-modal-section-last">
                <div className="claim-modal-section-header"><span>📎</span><span>Evidencias / Adjuntos</span></div>
                <div style={{ padding: "14px 16px" }}>
                  {selectedCompletedClaim.archivo_adjunto ? (
                    <button type="button" className="claim-adjunto-btn"
                      onClick={() => handleViewAttachment(selectedCompletedClaim.archivo_adjunto)}>
                      📎 VER ARCHIVO ADJUNTO
                    </button>
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "14px" }}>Sin archivo adjunto</span>
                  )}
                </div>
              </div>

            </div>{/* fin columna izquierda */}

            {/* Columna derecha: respuesta oficial guardada en BD — solo lectura */}
            <div className="claim-modal-right">
              <div className="claim-response-area">

                <p className="claim-response-title">
                  <span style={{ marginRight: "8px" }}>✅</span>
                  Respuesta Oficial
                </p>

                {/* Texto de la respuesta: div de solo lectura, no textarea */}
                <div style={{
                  background: "#f8fafc",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "16px",
                  minHeight: "220px",
                  whiteSpace: "pre-wrap",
                  color: "#374151",
                  lineHeight: 1.6,
                  fontSize: "15px",
                }}>
                  {selectedCompletedClaim.respuesta || <em style={{ color: "#9ca3af" }}>Sin respuesta registrada</em>}
                </div>

                {/* Fecha en que se envió la respuesta */}
                <p style={{ marginTop: "16px", fontSize: "13px", color: "#6b7280" }}>
                  <strong>Fecha de respuesta:</strong>{" "}
                  {selectedCompletedClaim.fecha_respuesta
                    ? new Date(selectedCompletedClaim.fecha_respuesta).toISOString().split("T")[0]
                    : "Sin fecha registrada"}
                </p>

                {/* Código de seguimiento para referencia del cliente */}
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
                    <strong>Código de seguimiento:</strong>
                  </p>
                  <span style={{
                    display: "inline-block",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    fontSize: "15px",
                    letterSpacing: "0.05em",
                  }}>
                    {selectedCompletedClaim.codigo_seguimiento}
                  </span>
                </div>

              </div>
            </div>

          </div>{/* fin body */}

          {/* Footer: solo botón Cerrar — sin enviar nada al backend */}
          <div className="claim-modal-footer">
            <button type="button" className="claim-modal-secondary-btn" onClick={closeCompletedModal}>
              ✕ Cerrar
            </button>
          </div>

        </div>
      </div>
    )}
    </>
  );
}

export default Dashboard;

