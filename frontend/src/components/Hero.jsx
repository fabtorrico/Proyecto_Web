// ============================================================
// Hero.jsx — Sección principal de bienvenida (above the fold)
// Incluye: top bar verde, título azul corporativo, descripción
// actualizada y dos botones con íconos.
// ============================================================

import "../assets/css/home.css"; // Estilos globales del proyecto

// ──────────────────────────────────────────────────────────
// Componente Hero
// Estructura:
//   1. TopBar   — barra verde de anuncio (100% ancho)
//   2. hero     — sección centrada con título, descripción y botones
// ──────────────────────────────────────────────────────────
const Hero = () => {
  return (
    /* Fragmento raíz: agrupa TopBar + Hero sin añadir nodo DOM extra */
    <>

      {/* ── 1. BARRA DE ANUNCIO VERDE (top bar) ─────────────────
           Ocupa el 100% del ancho antes del hero principal.
           Llama la atención con una propuesta de valor rápida. */}
      <div className="hero__topbar">
        {/* Ícono decorativo + mensaje promocional */}
        📊 ¡Un solo pago para todos los locales de tu empresa, sin costos adicionales!
      </div>

      {/* ── 2. SECCIÓN HERO PRINCIPAL ────────────────────────── */}
      <section className="hero" id="inicio">

        {/* Contenedor centrado — limita el ancho a 900px */}
        <div className="hero__content">

          {/* ── Etiqueta decorativa (badge/pill) ── */}
          <span className="hero__badge">
            Solución oficial para negocios en Perú 👍
          </span>

          {/* ── Título principal ──
               Color azul corporativo #1e3b8a77 (no negro).
               Tamaño grande para máximo impacto visual. */}
          <h1 className="hero__title">
            Libro de Reclamaciones Virtual para Negocios en Perú
          </h1>

          {/* ── Descripción ──
               Texto actualizado con más contexto y CTA implícito. */}
          <p className="hero__description">
            La solución más fácil para cumplir con la normativa peruana,
            ya sea que tengas una tienda física o un sitio web.
            Obtén tu enlace personalizado hoy.
          </p>

          {/* ── Contenedor de botones ── */}
          <div className="hero__actions">

            {/* BOTÓN 1 — Azul oscuro corporativo con ícono de chat */}
            <a
              href="#planes"
              className="hero__btn hero__btn--blue"
              aria-label="Contactar a un asesor"
            >
              {/* Ícono representativo de comunicación */}
              <span aria-hidden="true">💬</span>
              Contacta un Asesor
            </a>

            {/* BOTÓN 2 — Verde con ícono de información */}
            <a
              href="#como-funciona"
              className="hero__btn hero__btn--green"
              aria-label="Ver cómo funciona el servicio"
            >
              {/* Ícono representativo de información */}
              <span aria-hidden="true">ℹ️</span>
              Ver Cómo Funciona
            </a>

          </div>
        </div>
      </section>

    </>
  );
};

export default Hero;
