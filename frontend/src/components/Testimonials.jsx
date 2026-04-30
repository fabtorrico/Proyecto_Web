// ============================================================
// Testimonials.jsx — Sección "Lo que dicen nuestros clientes"
// Cards de reseñas de clientes reales
// Estructura preparada para integrar un slider en el futuro
// ============================================================

import "../assets/css/home.css"; // Estilos del proyecto

// ──────────────────────────────────────────────────────────
// Lista de testimonios
// Definida fuera del componente para evitar recreaciones en cada render.
// Cada objeto tiene: id, texto, nombre del cliente y tipo de negocio.
// NOTA: Para agregar slider futuro, envolver .testimonials__grid en un
//       contenedor con overflow:hidden y controlar translateX con estado.
// ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    text: "Implementar el libro de reclamaciones virtual fue muy sencillo. En menos de un día ya teníamos el código QR en nuestra tienda y el enlace en nuestra web.",
    name: "Carlos Mendoza",
    business: "Tienda de electrónica — Lima",
    stars: 5,
  },
  {
    id: 2,
    text: "Nos evitó una multa de INDECOPI. Antes no teníamos el libro y no sabíamos cómo implementarlo. Con LRPeru fue rapidísimo y muy profesional.",
    name: "María Torres",
    business: "Restaurante — Miraflores",
    stars: 5,
  },
  {
    id: 3,
    text: "El panel de administración es muy intuitivo. Podemos ver todos los reclamos, responderlos y generar PDFs automáticamente. Excelente servicio.",
    name: "Javier Quispe",
    business: "Clínica dental — San Isidro",
    stars: 5,
  },
];

// ──────────────────────────────────────────────────────────
// Subcomponente: renderiza las estrellas según la puntuación
// Recibe un número (1-5) y devuelve los emojis correspondientes
// ──────────────────────────────────────────────────────────
const Stars = ({ count }) => {
  // Genera un array de longitud `count` y mapea cada posición a "★"
  return (
    <span className="testimonial-card__stars" aria-label={`${count} estrellas`}>
      {"★".repeat(count)}
    </span>
  );
};

// ──────────────────────────────────────────────────────────
// Componente Testimonials
// Renderiza las cards de testimonios en un grid de 3 columnas.
// ──────────────────────────────────────────────────────────
const Testimonials = () => {
  return (
    /* Sección de testimonios — fondo blanco */
    <section className="section section--white" id="testimonios">
      <div className="container">

        {/* ── Título de la sección ── */}
        <h2 className="section__title">Lo que dicen nuestros clientes</h2>

        {/* ── Subtítulo ── */}
        <p className="section__subtitle">
          Más de 600 empresas confían en nosotros
        </p>

        {/*
          Grid de testimonios.
          PREPARADO PARA SLIDER: en el futuro reemplazar este div por
          un componente Slider que controle el índice activo con useState
          y mueva las cards horizontalmente con CSS transform.
        */}
        <div className="testimonials__grid">

          {/* Iteramos sobre el array TESTIMONIALS para generar cada card */}
          {TESTIMONIALS.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.id}>

              {/* Estrellas de valoración */}
              <Stars count={testimonial.stars} />

              {/* Texto del testimonio */}
              <p className="testimonial-card__text">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Pie de la card: nombre y negocio */}
              <footer className="testimonial-card__footer">
                <span className="testimonial-card__name">{testimonial.name}</span>
                <span className="testimonial-card__business">{testimonial.business}</span>
              </footer>

            </article>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Testimonials;
