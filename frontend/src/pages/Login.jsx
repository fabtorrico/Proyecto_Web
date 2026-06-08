// ============================================================
// Login.jsx — Página de inicio de sesión
// Ruta: /login
// Envía credenciales al backend y redirige al Dashboard
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/home.css";
import logoImg from "../assets/img/logo.png";
// API_URL centralizada: usa VITE_API_URL de .env (dev) o .env.production (prod)
import { API_URL } from "../config/api";

function Login() {
  // ── Estado del formulario ──
  const [correo,   setCorreo]   = useState("");
  const [password, setPassword] = useState("");
  // Controla el mensaje de error mostrado al usuario
  const [error,    setError]    = useState("");
  // Deshabilita el botón mientras espera la respuesta del servidor
  const [loading,  setLoading]  = useState(false);

  const navigate = useNavigate();

  // ── Manejador del login ──────────────────────────────────
  const handleLogin = async () => {
    // Limpiar error previo
    setError("");

    // Validación mínima en el frontend (el backend también valida)
    if (!correo.trim() || !password.trim()) {
      setError("Por favor completá todos los campos.");
      return;
    }

    setLoading(true);
    try {
      // POST al endpoint de autenticación
      const res = await fetch(`${API_URL}/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        // Enviar credenciales como JSON
        body: JSON.stringify({ correo: correo.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar token JWT para adjuntarlo en peticiones privadas
        localStorage.setItem("token", data.token);
        // Guardar datos del usuario para mostrarlos en el Dashboard
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        // Mostrar el mensaje de error devuelto por el backend
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      // Error de red: backend no responde
      console.error("[Login] fetch error:", err);
      setError("No se pudo conectar con el servidor. Verificá que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  // Permitir enviar el form con la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    /* Contenedor principal: ocupa toda la pantalla, centra el formulario */
    <div className="login-container">

      {/* Logo de la marca */}
      <img
        src={logoImg}
        alt="Logo CERTIA"
        className="login-logo"
      />

      {/* ── Caja del formulario ── */}
      <div className="login-box">

        {/* Título del formulario */}
        <h2 className="login-title">Iniciar sesión</h2>

        {/* ── Mensaje de error ── */}
        {error && (
          <p style={{
            color: "#dc2626",
            fontSize: "14px",
            marginBottom: "12px",
            background: "#fee2e2",
            padding: "8px 12px",
            borderRadius: "6px",
          }}>
            {error}
          </p>
        )}

        {/* ── Campo: correo ── */}
        <label className="login-label" htmlFor="login-user">
          Correo electrónico
        </label>
        <input
          id="login-user"
          type="email"
          className="login-input"
          placeholder="usuario@ejemplo.com"
          autoComplete="username"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* ── Campo: contraseña ── */}
        <label className="login-label" htmlFor="login-pass">
          Contraseña
        </label>
        <input
          id="login-pass"
          type="password"
          className="login-input"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* ── Opción "Recuérdame" ── */}
        <div className="login-options">
          <label className="login-remember">
            <input type="checkbox" />
            <span>Recuérdame</span>
          </label>
        </div>

        {/* ── Botón principal de acceso ── */}
        <button
          className="login-btn"
          type="button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verificando..." : "Acceder"}
        </button>

        {/* ── Enlace para volver al inicio ── */}
        <button
          className="login-back"
          type="button"
          onClick={() => navigate("/")}
        >
          ← Volver al inicio
        </button>

      </div>
    </div>
  );
}

export default Login;
