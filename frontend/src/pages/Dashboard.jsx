// ============================================================
// Dashboard.jsx — Panel principal del sistema Libro de Reclamaciones
// Ruta: /dashboard (privada — requiere sesión en localStorage)
// ⚠️ Fase 1: autenticación por localStorage.
//    Fase 2: reemplazar por validación JWT contra el backend.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// Librería para generar el código QR como elemento canvas
import { QRCodeCanvas } from "qrcode.react";
// Imagen del libro usada en la vista previa del widget de integración
import libroImg from "../assets/img/libro.png";

// ── Registros por página en la tabla de pendientes ──
const ITEMS_PER_PAGE = 10;

// ── Datos mock temporales ──────────────────────────────────
// Representan reportes del libro de reclamaciones.
// En producción serán reemplazados por una llamada al backend.
const mockReports = [
  { id:  1, correlativo: "001", codigoSeguimiento: "LR-2026-001", cliente: "Carlos Mendoza",     tipo: "Reclamo",  monto: "S/ 120.00", fecha: "2026-05-01" },
  { id:  2, correlativo: "002", codigoSeguimiento: "LR-2026-002", cliente: "Ana Torres",         tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-01" },
  { id:  3, correlativo: "003", codigoSeguimiento: "LR-2026-003", cliente: "Jorge Ramírez",      tipo: "Reclamo",  monto: "S/ 350.00", fecha: "2026-05-02" },
  { id:  4, correlativo: "004", codigoSeguimiento: "LR-2026-004", cliente: "María Luisa Vega",   tipo: "Reclamo",  monto: "S/ 80.00",  fecha: "2026-05-02" },
  { id:  5, correlativo: "005", codigoSeguimiento: "LR-2026-005", cliente: "Pedro Huanca",       tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-03" },
  { id:  6, correlativo: "006", codigoSeguimiento: "LR-2026-006", cliente: "Lucía Fernández",    tipo: "Reclamo",  monto: "S/ 200.00", fecha: "2026-05-03" },
  { id:  7, correlativo: "007", codigoSeguimiento: "LR-2026-007", cliente: "Roberto Castro",     tipo: "Reclamo",  monto: "S/ 560.00", fecha: "2026-05-04" },
  { id:  8, correlativo: "008", codigoSeguimiento: "LR-2026-008", cliente: "Sofía Paredes",      tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-04" },
  { id:  9, correlativo: "009", codigoSeguimiento: "LR-2026-009", cliente: "Diego Alvarado",     tipo: "Reclamo",  monto: "S/ 145.00", fecha: "2026-05-05" },
  { id: 10, correlativo: "010", codigoSeguimiento: "LR-2026-010", cliente: "Valeria Quispe",     tipo: "Reclamo",  monto: "S/ 95.00",  fecha: "2026-05-05" },
  { id: 11, correlativo: "011", codigoSeguimiento: "LR-2026-011", cliente: "Manuel Soto",        tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-05" },
  { id: 12, correlativo: "012", codigoSeguimiento: "LR-2026-012", cliente: "Elena Morales",      tipo: "Reclamo",  monto: "S/ 430.00", fecha: "2026-05-06" },
  { id: 13, correlativo: "013", codigoSeguimiento: "LR-2026-013", cliente: "Andrés Villanueva",  tipo: "Reclamo",  monto: "S/ 75.00",  fecha: "2026-05-06" },
  { id: 14, correlativo: "014", codigoSeguimiento: "LR-2026-014", cliente: "Carmen Iglesias",    tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-06" },
  { id: 15, correlativo: "015", codigoSeguimiento: "LR-2026-015", cliente: "Francisco Reyes",    tipo: "Reclamo",  monto: "S/ 290.00", fecha: "2026-05-07" },
  { id: 16, correlativo: "016", codigoSeguimiento: "LR-2026-016", cliente: "Isabel Chávez",      tipo: "Reclamo",  monto: "S/ 160.00", fecha: "2026-05-07" },
  { id: 17, correlativo: "017", codigoSeguimiento: "LR-2026-017", cliente: "Gustavo Pinto",      tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-07" },
  { id: 18, correlativo: "018", codigoSeguimiento: "LR-2026-018", cliente: "Patricia Lozano",    tipo: "Reclamo",  monto: "S/ 510.00", fecha: "2026-05-07" },
  { id: 19, correlativo: "019", codigoSeguimiento: "LR-2026-019", cliente: "Héctor Salas",       tipo: "Reclamo",  monto: "S/ 230.00", fecha: "2026-05-07" },
  { id: 20, correlativo: "020", codigoSeguimiento: "LR-2026-020", cliente: "Rosa Medina",        tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-07" },
  { id: 21, correlativo: "021", codigoSeguimiento: "LR-2026-021", cliente: "Alberto Núñez",      tipo: "Reclamo",  monto: "S/ 185.00", fecha: "2026-05-07" },
  { id: 22, correlativo: "022", codigoSeguimiento: "LR-2026-022", cliente: "Claudia Herrera",    tipo: "Reclamo",  monto: "S/ 320.00", fecha: "2026-05-07" },
  { id: 23, correlativo: "023", codigoSeguimiento: "LR-2026-023", cliente: "Oscar Benavides",    tipo: "Queja",    monto: "S/ 0.00",   fecha: "2026-05-07" },
];

// ── Calcula la fecha de caducidad (hoy + 1 año) ──────────
// Simula que el usuario adquirió el plan hoy.
// Fase 2: obtener la fecha real desde la BD del usuario.
const getExpirationDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0]; // formato YYYY-MM-DD
};

// ─────────────────────────────────────────────────────────
// ReportsTable — tabla reutilizable de reportes con paginación.
// La única diferencia entre pestañas es el texto del botón en Acciones.
// Cada instancia maneja su propio estado de página de forma independiente.
function ReportsTable({ actionLabel }) {
  const [page, setPage] = useState(1);
  const totalPages     = Math.ceil(mockReports.length / ITEMS_PER_PAGE);
  const visibleReports = mockReports.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          border: "1px solid #d1d5db",
          fontSize: "14px",
          tableLayout: "fixed",   /* anchos fijos → misma distribución en ambas pestañas */
        }}>
          {/* Anchos de columna explícitos para que no varíen con el contenido */}
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
            {visibleReports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px" }}>{report.correlativo}</td>
                <td style={{ padding: "10px 12px", color: "#1e3a8a", fontWeight: 500 }}>{report.codigoSeguimiento}</td>
                <td style={{ padding: "10px 12px" }}>{report.cliente}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: report.tipo === "Reclamo" ? "#fee2e2" : "#fef9c3",
                    color:      report.tipo === "Reclamo" ? "#dc2626"  : "#854d0e",
                  }}>
                    {report.tipo}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>{report.monto}</td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>{report.fecha}</td>
                <td style={{ padding: "10px 12px" }}>
                  {/* Botón de acción — texto varía según la pestaña */}
                  <button style={{
                    padding: "4px 14px",
                    background: "#1e3a8a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}>
                    {actionLabel}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Controles de paginación ── */}
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

  // ── Carga de datos frescos desde la base de datos ────
  // Se ejecuta cuando el usuario está disponible.
  // Evita mostrar datos desactualizados de localStorage.
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:3000/api/user/${user.id}`)
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
      })
      .catch((err) => console.error("[Dashboard] fetch user error:", err));
  }, [user?.id]);

  // Reiniciar paginación al cambiar de tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // ── Logout ────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
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
  // y en producción (https://lrperu.com) sin cambios de código.
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
    console.log("URL:", `http://localhost:3000/api/users/${user.id}/profile`);

    try {
      const res = await fetch(`http://localhost:3000/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`http://localhost:3000/api/users/${user.id}/business`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`http://localhost:3000/api/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  const tabs = ["Pendientes", "Completado", "Integración", "Ajuste"];

  return (
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

          {/* Fecha de caducidad simulada */}
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "22px" }}>
            Fecha de Caducidad: {getExpirationDate()}
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
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  padding: "8px 18px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 400,
                  cursor: "pointer",
                  border: isActive ? "1px solid #e5e7eb" : "1px solid transparent",
                  borderBottom: isActive ? "2px solid #fff" : "none",
                  borderTop: isActive ? "3px solid #1e3a8a" : "3px solid transparent",
                  borderRadius: "6px 6px 0 0",
                  background: isActive ? "#fff" : "#f3f4f6",
                  color: isActive ? "#111827" : "#6b7280",
                  marginBottom: "-1px", // fusiona con el borde inferior del contenedor
                  transition: "all 0.15s",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Contenido de cada pestaña ───────────────── */}
        <div style={{ padding: "20px" }}>

          {/* PESTAÑA: Pendientes — botón de acción: "Ver" */}
          {activeTab === "Pendientes" && <ReportsTable actionLabel="Ver" />}

          {/* PESTAÑA: Completado — misma tabla, botón de acción: "Ver Respuesta" */}
          {activeTab === "Completado" && <ReportsTable actionLabel="Ver Respuesta" />}

          {/* PESTAÑA: Integración */}
          {activeTab === "Integración" && (
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
  );
}

export default Dashboard;

