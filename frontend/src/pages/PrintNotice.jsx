// ============================================================
// PrintNotice.jsx — Vista imprimible del aviso del Libro de Reclamaciones
// Ruta: /aviso/:slug
//
// Diseñada como hoja A4 para imprimir y colocar en tienda física.
// Se abre en nueva pestaña desde el botón "Generar PDF para Imprimir"
// en la pestaña Integración del Dashboard.
//
// ⚠️ Fase 1: datos obtenidos desde localStorage.
// Fase 2: obtener nombre/empresa/URL desde el backend usando el slug.
// ============================================================

import { QRCodeCanvas } from "qrcode.react";
import libroImg from "../assets/img/libro.png";

function PrintNotice() {
  // ── Datos del usuario desde localStorage ──────────────
  // En Fase 2 se reemplaza por un fetch al backend con el slug de la URL.
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Nombre completo en mayúsculas para mostrar en el aviso
  const fullName = `${user?.nombre || ""} ${user?.apellido || ""}`.trim().toUpperCase();

  // ── Slug: mismo algoritmo que Dashboard para garantizar consistencia ──
  // Elimina tildes → minúsculas → sin espacios
  const userSlug = `${user?.nombre || ""}${user?.apellido || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

  // ── URL pública del libro del usuario ─────────────────
  // window.location.origin adapta automáticamente a localhost o producción
  const userBookUrl = `${window.location.origin}/libro/${userSlug}`;

  return (
    // Fondo oscuro exterior tipo presentación de documento
    <div className="print-page-wrapper" style={{
      background: "#2b2b2b",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      padding: "20px",
    }}>
      {/* Hoja blanca A4 */}
      <div className="print-sheet" style={{
        width: "794px",
        minHeight: "1123px",
        background: "#fff",
        padding: "40px 70px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.45)",
        boxSizing: "border-box",
      }}>

        {/* 1. Título principal */}
        <h1 style={{
          textAlign: "center",
          fontSize: "38px",
          fontWeight: 900,
          lineHeight: 1.15,
          color: "#000",
          textTransform: "uppercase",
          margin: "0 0 10px",
          letterSpacing: "1px",
        }}>
          LIBRO DE<br />RECLAMACIONES
        </h1>

        {/* 2. Imagen del libro en blanco y negro */}
        <img
          src={libroImg}
          alt="Libro de Reclamaciones"
          style={{
            width: "360px",
            display: "block",
            margin: "30px auto 60px",
            // Blanco y negro con alto contraste para impresión
            filter: "grayscale(1) contrast(1.8)",
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        {/* 3. Nombre del usuario / empresa */}
        <p style={{
          textAlign: "center",
          fontSize: "30px",
          fontWeight: 900,
          textTransform: "uppercase",
          borderBottom: "3px solid #000",
          paddingBottom: "8px",
          marginBottom: "25px",
          letterSpacing: "0.5px",
        }}>
          {fullName || "NOMBRE NO DISPONIBLE"}
        </p>

        {/* 4. Texto legal obligatorio */}
        <p style={{
          background: "#f5f5f5",
          padding: "20px 35px",
          textAlign: "center",
          fontSize: "18px",
          lineHeight: 1.35,
          marginBottom: "30px",
          color: "#111",
        }}>
          Conforme a lo establecido en el Código de Protección y Defensa del Consumidor,
          este establecimiento cuenta con un Libro de Reclamaciones Virtual a tu disposición.
        </p>

        {/* 5. Caja QR con borde negro */}
        <div style={{
          border: "2px solid #000",
          borderRadius: "4px",
          overflow: "hidden",
          textAlign: "center",
        }}>
          {/* Texto instrucción */}
          <p style={{
            fontSize: "18px",
            fontWeight: 700,
            textTransform: "uppercase",
            margin: "18px 0 12px",
            letterSpacing: "0.5px",
          }}>
            ESCANEA ESTE CÓDIGO QR
          </p>

          {/* QR que apunta a la URL pública del libro */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <QRCodeCanvas
              value={userBookUrl}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Franja inferior con la URL */}
          <div style={{
            borderTop: "2px solid #000",
            background: "#f5f5f5",
            padding: "10px",
            fontWeight: 700,
            fontSize: "14px",
            wordBreak: "break-all",
          }}>
            URL del Libro: {userBookUrl}
          </div>
        </div>

      </div>

      {/* ── Estilos de impresión ────────────────────────── */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print-page-wrapper {
            background: white;
            padding: 0;
          }
          .print-sheet {
            box-shadow: none;
            margin: 0;
            width: 100%;
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}

export default PrintNotice;
