// ============================================================
// Footer.jsx — Pie de página
// 4 columnas: CERTIA / Legal / Enlaces Útiles / Contáctanos
// Fondo azul corporativo #1e3a8a
// ============================================================

import "../assets/css/home.css";                      // Estilos globales
import logoImg from "../assets/img/logo.png";        // Logo de la marca
import libroImg    from "../assets/img/libro_main.png";    // Imagen oficial del libro de reclamaciones
import facebookImg from "../assets/img/facebook.png"; // Icono de Facebook
import instagramImg from "../assets/img/instagram.png"; // Icono de Instagram
import whatsappImg from "../assets/img/whatsapp.png"; // Icono de WhatsApp

// ── Año dinámico para el copyright ──
const currentYear = new Date().getFullYear();

// ──────────────────────────────────────────────────────────
// Componente Footer
// Grid de 4 columnas: descripción, legal, enlaces, contacto+redes.
// ──────────────────────────────────────────────────────────
const Footer = () => {
  return (
    <footer className="footer" id="contacto">
      <div className="footer__grid">

        {/* ══ COLUMNA 1: Marca y descripción ══ */}
        <div>
          {/* Nombre de la marca con acento de color */}
          <p className="footer__brand">
            CERTIA<span style={{ color: "#ef4444" }}>.PE</span>
          </p>
          {/* Descripción breve del servicio */}
          <p className="footer__tagline">
            La solución más fácil para cumplir con el libro de
            reclamaciones virtual en Perú.
          </p>
        </div>

        {/* ══ COLUMNA 2: Legal + imagen del libro ══ */}
        <div>
          <h3 className="footer__col-title">Legal</h3>
          <ul className="footer__list">
            <li><a href="/politica-privacidad">Política de Privacidad</a></li>
            <li><a href="#terminos">Términos y Condiciones</a></li>
            {/* Enlace corporativo: siempre abre el libro oficial de Certia (users.id=1) */}
            <li><a href="/libro-admin">Libro de Reclamaciones</a></li>
          </ul>

          {/* Imagen oficial del Libro de Reclamaciones peruano */}
          <img
            src={libroImg}
            alt="Libro de Reclamaciones oficial"
            className="footer-book"
          />
        </div>

        {/* ══ COLUMNA 3: Enlaces útiles ══ */}
        <div>
          <h3 className="footer__col-title">Enlaces Útiles</h3>
          <ul className="footer__list">
            <li><a href="#beneficios">Características</a></li>
            <li><a href="#como-funciona">Cómo Funciona</a></li>
            <li><a href="#planes">Precios</a></li>
            <li>
              <a
                href="https://api.whatsapp.com/send/?phone=51922446325&text=Quiero+soporte&type=phone_number&app_absent=0"
                rel="noopener noreferrer"
                target="_blank"
              >
                Soporte
              </a>
            </li>
          </ul>
        </div>

        {/* ══ COLUMNA 4: Contacto y redes sociales ══ */}
        <div>
          {/* ── Contacto ── */}
          <h3 className="footer__col-title">Contáctanos</h3>
          <ul className="footer__list">
            <li>
              <a href="mailto:certiaperu@certia.pe" aria-label="Enviar correo">
                📧 certiaperu@certia.pe
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/51940810288"
                aria-label="Llamar por teléfono"
                rel="noopener noreferrer"
                target="_blank"
              >
                📞 +51 940 810 288
              </a>
            </li>
            <li>
              {/* Enlace externo a WhatsApp con mensaje predefinido de soporte.
                   target="_blank" abre en nueva pestaña.
                   rel="noopener noreferrer" evita acceso al window de esta página. */}
              <a
                href="https://wa.me/51940810288"
                aria-label="Contactar por WhatsApp"
                rel="noopener noreferrer"
                target="_blank"
              >
                💬 WhatsApp: +51 940 810 288
              </a>
            </li>
          </ul>

          {/* ── Redes sociales ──
               Fila flex con íconos de imagen real (20px).
               Cada <a> tiene aria-label para accesibilidad. ── */}
          <h3 className="footer__col-title" style={{ marginTop: "20px" }}>Síguenos</h3>

          {/* Contenedor flex que alinea los íconos en una fila */}
          <div className="footer__social">

            {/* ─ Facebook ─
                 Enlace externo: abre WhatsApp con mensaje sobre Facebook.
                 Reemplaza href por URL real de Facebook cuando esté disponible. */}
            <a
              href="https://www.facebook.com/profile.php?id=61590531545240&sk=about"
              className="footer__social-icon"
              aria-label="Síguenos en Facebook"
              rel="noopener noreferrer"
              target="_blank"
            >
              {/* Imagen importada desde assets/img/facebook.png */}
              <img src={facebookImg} alt="Facebook" className="footer__social-img" />
            </a>

            {/* ─ Instagram ─
                 Enlace externo: abre WhatsApp con mensaje sobre Instagram.
                 Reemplaza href por URL real de Instagram cuando esté disponible. */}
            <a
              href="https://www.instagram.com/certiaperu/?hl=es"
              className="footer__social-icon"
              aria-label="Síguenos en Instagram"
              rel="noopener noreferrer"
              target="_blank"
            >
              {/* Imagen importada desde assets/img/instagram.png */}
              <img src={instagramImg} alt="Instagram" className="footer__social-img" />
            </a>

            {/* ─ WhatsApp ─
                 Enlace externo: abre WhatsApp con mensaje de contacto directo. */}
            <a
              href="https://wa.me/51940810288"
              className="footer__social-icon"
              aria-label="Contáctanos por WhatsApp"
              rel="noopener noreferrer"
              target="_blank"
            >
              {/* Imagen importada desde assets/img/whatsapp.png */}
              <img src={whatsappImg} alt="WhatsApp" className="footer__social-img" />
            </a>

          </div>
        </div>

      </div>

      {/* ── Copyright centrado al fondo ── */}
      <div className="footer__bottom">
        <p>© {currentYear} CERTIA. Todos los derechos reservados.</p>
      </div>

    </footer>
  );
};

export default Footer;