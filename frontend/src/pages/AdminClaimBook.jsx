// ============================================================
// AdminClaimBook.jsx — Libro de Reclamaciones corporativo oficial
// Ruta: /libro-admin
//
// REGLA PERMANENTE:
//   Este componente siempre carga los datos de la empresa
//   correspondiente a users.id = 1 (el administrador principal
//   de Certia), independientemente de quien este logueado.
//
//   Es el libro que se muestra al hacer clic en el enlace
//   "Libro de Reclamaciones" del footer/menu lateral.
//
//   NO usar el usuario logueado.
//   NO usar seleccion dinamica.
//   Siempre: users.id = 1.
//
// Flujo:
//   1. Llama a GET /api/company-book (ruta publica, sin JWT).
//   2. Recibe los datos de la empresa (razon_social, ruc, etc.).
//   3. Renderiza PublicClaimBook pasando esos datos como prop.
//      Los reclamos enviados quedan asociados a users.id = 1.
// ============================================================

import { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import PublicClaimBook from "./PublicClaimBook";

function AdminClaimBook() {
  const [company, setCompany]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");

  // Carga unica al montar: obtiene datos del libro corporativo oficial
  useEffect(() => {
    fetch(`${API_URL}/company-book`)
      .then((res) => res.json())
      .then((data) => {
        if (data.company) {
          setCompany(data.company);
        } else {
          setError(data.error || "No se encontro el libro oficial");
        }
      })
      .catch(() => setError("Error al cargar el libro de reclamaciones"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>Cargando libro de reclamaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "#dc2626", fontSize: "16px" }}>{error}</p>
      </div>
    );
  }

  // Renderiza el formulario publico usando los datos de users.id = 1
  return <PublicClaimBook companyOverride={company} />;
}

export default AdminClaimBook;
