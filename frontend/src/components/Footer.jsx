// ============================================================
// Footer.jsx — Pie de página
// 4 columnas: LRPeru / Legal / Enlaces Útiles / Contáctanos
// Fondo azul corporativo #1e3a8a
// ============================================================

import "../assets/css/home.css";                      // Estilos globales
import libroImg    from "../assets/img/libro.png";    // Imagen oficial del libro de reclamaciones
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
            <span>LR</span>Peru
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
            <li><a href="#privacidad">Política de Privacidad</a></li>
            <li><a href="#terminos">Términos y Condiciones</a></li>
            <li><a href="#libro">Libro de Reclamaciones</a></li>
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
            <li><a href="#contacto">Soporte</a></li>
          </ul>
        </div>

        {/* ══ COLUMNA 4: Contacto y redes sociales ══ */}
        <div>
          {/* ── Contacto ── */}
          <h3 className="footer__col-title">Contáctanos</h3>
          <ul className="footer__list">
            <li>
              <a href="mailto:soporte@lrperu.com" aria-label="Enviar correo">
                📧 soporte@lrperu.com
              </a>
            </li>
            <li>
              <a href="tel:+51922446325" aria-label="Llamar por teléfono">
                📞 +51 922 446 325
              </a>
            </li>
            <li>
              {/* rel="noopener noreferrer" protege contra ataques de window.opener */}
              <a
                href="https://wa.me/51922446325"
                aria-label="Contactar por WhatsApp"
                rel="noopener noreferrer"
                target="_blank"
              >
                💬 WhatsApp: +51 922 446 325
              </a>
            </li>
          </ul>

          {/* ── Redes sociales ──
               Fila flex con íconos de imagen real (20px).
               Cada <a> tiene aria-label para accesibilidad. ── */}
          <h3 className="footer__col-title" style={{ marginTop: "20px" }}>Síguenos</h3>

          {/* Contenedor flex que alinea los íconos en una fila */}
          <div className="footer__social">

            {/* ─ Facebook ─ */}
            <a
              href="#"
              className="footer__social-icon"
              aria-label="Síguenos en Facebook"
              rel="noopener noreferrer"
            >
              {/* Imagen importada desde assets/img/facebook.png */}
              <img src={facebookImg} alt="Facebook" className="footer__social-img" />
            </a>

            {/* ─ Instagram ─ */}
            <a
              href="#"
              className="footer__social-icon"
              aria-label="Síguenos en Instagram"
              rel="noopener noreferrer"
            >
              {/* Imagen importada desde assets/img/instagram.png */}
              <img src={instagramImg} alt="Instagram" className="footer__social-img" />
            </a>

            {/* ─ WhatsApp ─ abre en nueva pestaña */}
            <a
              href="https://wa.me/51922446325"
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
        <p>© {currentYear} LRPeru. Todos los derechos reservados.</p>
      </div>

    </footer>
  );
};

export default Footer;