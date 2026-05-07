// ============================================================
// PublicClaimBook.jsx — Vista pública del libro de reclamaciones
// Ruta: /libro/:slug
//
// Esta pantalla es accesible por cualquier visitante (clientes externos).
// El slug identifica a qué empresa pertenece el libro.
//
// ⚠️ Fase 1: solo estructura visual.
// Fase 2: obtener datos de la empresa desde el backend usando el slug,
//         mostrar formulario de reclamo y guardarlo en base de datos.
// ============================================================

import { useParams } from "react-router-dom";

function PublicClaimBook() {
  // useParams extrae el slug de la URL, ej: /libro/fabriciotorrico → slug = "fabriciotorrico"
  // En Fase 2 se usará para hacer un GET /api/empresa/:slug y mostrar los datos reales.
  const { slug } = useParams();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "28px",
      fontWeight: "bold",
    }}>
      {/* Mensaje temporal — en Fase 2 se reemplaza por el formulario de reclamo */}
      Puto el que lo lea
    </div>
  );
}

export default PublicClaimBook;
