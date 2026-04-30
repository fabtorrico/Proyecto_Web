// ============================================================
// Dashboard.jsx — Pantalla principal después del login
// Ruta: /dashboard
// Muestra datos del usuario autenticado y botón de logout
// ============================================================

import "../assets/css/home.css";

function Dashboard() {
  // Recuperar el usuario almacenado en localStorage tras el login
  const user = JSON.parse(localStorage.getItem("user"));

  // ── Logout ──
  // Elimina la sesión local y redirige al inicio
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", padding: "0 20px" }}>

      {/* Título principal */}
      <h1 style={{ fontSize: "32px", color: "#1e3a8a", marginBottom: "16px" }}>
        Libro de Reclamaciones
      </h1>

      {/* Saludo personalizado con datos del usuario */}
      <p style={{ fontSize: "18px", color: "#374151", marginBottom: "8px" }}>
        Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong>
      </p>

      {/* Datos adicionales del usuario */}
      {user?.razon_social && (
        <p style={{ fontSize: "15px", color: "#6b7280" }}>
          {user.razon_social} — RUC: {user.ruc}
        </p>
      )}
      {user?.correo && (
        <p style={{ fontSize: "15px", color: "#6b7280" }}>{user.correo}</p>
      )}

      {/* Botón de cierre de sesión */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: "32px",
          background: "#1e3a8a",
          color: "#fff",
          border: "none",
          padding: "12px 32px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Salir
      </button>

    </div>
  );
}

export default Dashboard;
