// ============================================================
// Dashboard.jsx — Panel principal del sistema Libro de Reclamaciones
// Ruta: /dashboard (privada — requiere sesión en localStorage)
// ⚠️ Fase 1: autenticación por localStorage.
//    Fase 2: reemplazar por validación JWT contra el backend.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // ── Estado de paginación ─────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // Recalcular páginas cuando cambia la fuente de datos
  const totalPages    = Math.ceil(mockReports.length / ITEMS_PER_PAGE);
  const currentReports = mockReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reiniciar paginación al cambiar de tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // ── Logout ────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Mientras se resuelve la validación, no renderizar nada
  if (!user) return null;

  const companyName = user?.razon_social || "Empresa sin nombre";
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
            Hola, {user?.nombre}
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

          {/* PESTAÑA: Pendientes */}
          {activeTab === "Pendientes" && (
            <div>
              {/* Tabla de reportes */}
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                }}>
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
                    {currentReports.map((report) => (
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
                          {/* Botón Ver — no funcional aún */}
                          <button style={{
                            padding: "4px 14px",
                            background: "#1e3a8a",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}>
                            Ver
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
                {/* Anterior */}
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: currentPage === 1 ? "#f3f4f6" : "#fff",
                    color: currentPage === 1 ? "#9ca3af" : "#374151",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  ← Anterior
                </button>

                {/* Indicador de página */}
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  Página {currentPage} de {totalPages}
                </span>

                {/* Siguiente */}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: currentPage === totalPages ? "#f3f4f6" : "#fff",
                    color: currentPage === totalPages ? "#9ca3af" : "#374151",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* PESTAÑA: Completado */}
          {activeTab === "Completado" && (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280", fontSize: "18px" }}>
              1
            </div>
          )}

          {/* PESTAÑA: Integración */}
          {activeTab === "Integración" && (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280", fontSize: "18px" }}>
              2
            </div>
          )}

          {/* PESTAÑA: Ajuste */}
          {activeTab === "Ajuste" && (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280", fontSize: "18px" }}>
              3
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;

