// ============================================================
// Navbar.jsx — Barra de navegación principal
// Fija en la parte superior, sombra al hacer scroll
// ============================================================

import { useEffect, useState } from "react";         // Hooks de React
import { useNavigate } from "react-router-dom";      // Hook para navegación programativa
import "../assets/css/home.css";                     // Estilos del proyecto

// ──────────────────────────────────────────────────────────
// Componente Navbar
// Renderiza el logo a la izquierda y el botón "Ingresa" a la derecha.
// Agrega la clase 'navbar--scrolled' cuando el usuario baja la página.
// ──────────────────────────────────────────────────────────
const Navbar = () => {

  // useNavigate devuelve una función para cambiar de ruta sin recargar la página
  const navigate = useNavigate();

  // Estado booleano: ¿el usuario ha hecho scroll hacia abajo?
  const [scrolled, setScrolled] = useState(false);

  // Efecto que escucha el evento de scroll en la ventana
  useEffect(() => {
    // Función que verifica si se ha bajado más de 10px
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Suscribirse al evento scroll
    window.addEventListener("scroll", handleScroll);

    // Limpiar el listener cuando el componente se desmonte (buena práctica)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // [] = solo se ejecuta una vez al montar el componente

  return (
    /* Navbar principal — clase dinámica según si hay scroll */
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>

      {/* Contenedor interno: distribuye logo y botón en los extremos */}
      <div className="navbar__inner">

        {/* ── Logo / Nombre de la marca ── */}
        <a href="#inicio" className="navbar__logo" aria-label="Ir al inicio">
          {/* "LR" en azul, "Peru" en texto oscuro */}
          <span>LR</span>Peru
        </a>

        {/* ── Botones de acceso ──
             Orden visual: [Registrar] [Ingresa]
             Registrar: acceso a la futura vista de signup (por ahora en blanco).
             Ingresa: acceso al login existente. */}
        <div style={{ display: "flex", gap: "12px" }}>
          {/* Botón Registrar — navega a /registro (vista en blanco por ahora) */}
          <button
            className="navbar__btn"
            aria-label="Registrar una cuenta"
            onClick={() => navigate("/registro")}
          >
            Registrar
          </button>

          {/* Botón Ingresa — navega a /login (comportamiento original) */}
          <button
            className="navbar__btn"
            aria-label="Ingresar al sistema"
            onClick={() => navigate("/login")}
          >
            Ingresa
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
