// ============================================================
// Login.jsx — Página de inicio de sesión
// Ruta: /login
// Diseño centrado con logo, campos de usuario/contraseña y botón de acceso
// ============================================================

import React from "react";
import { useNavigate } from "react-router-dom"; // Para el enlace de regreso al inicio
import "../assets/css/home.css";                 // Estilos globales (incluye los de .login-*)

// ──────────────────────────────────────────────────────────
// Componente Login
// Renderiza el formulario de acceso al sistema.
// Los inputs son solo visuales por ahora — lógica de auth pendiente.
// ──────────────────────────────────────────────────────────
function Login() {
  // useNavigate permite redirigir al usuario sin recargar la página
  const navigate = useNavigate();

  return (
    /* Contenedor principal: ocupa toda la pantalla, centra el formulario */
    <div className="login-container">

      {/* Logo de la marca — imagen en /public/logo.png */}
      <img
        src="/logo.png"
        alt="Logo LRPeru"
        className="login-logo"
        /* onError oculta la imagen si el archivo no existe aún */
        onError={(e) => { e.target.style.display = "none"; }}
      />

      {/* Nombre de la marca debajo del logo */}
      <p className="login-brand">
        <span>LR</span>Peru
      </p>

      {/* ── Caja del formulario ── */}
      <div className="login-box">

        {/* Título del formulario */}
        <h2 className="login-title">Iniciar sesión</h2>

        {/* ── Campo: usuario o correo ── */}
        <label className="login-label" htmlFor="login-user">
          Nombre de usuario o correo electrónico
        </label>
        <input
          id="login-user"
          type="text"
          className="login-input"
          placeholder="usuario@ejemplo.com"
          autoComplete="username"  /* Permite que el navegador autocomplete */
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
        />

        {/* ── Opción "Recuérdame" ── */}
        <div className="login-options">
          <label className="login-remember">
            <input type="checkbox" />
            {/* Texto junto al checkbox */}
            <span>Recuérdame</span>
          </label>
        </div>

        {/* ── Botón principal de acceso ── */}
        <button className="login-btn" type="button">
          Acceder
        </button>

        {/* ── Enlace para volver al inicio ── */}
        <button
          className="login-back"
          type="button"
          onClick={() => navigate("/")} /* Regresa a la landing sin recargar */
        >
          ← Volver al inicio
        </button>

      </div>
    </div>
  );
}

export default Login;
