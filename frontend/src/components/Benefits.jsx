// ============================================================
// Benefits.jsx — Sección "¿Por Qué Elegir CERTIA?"
// Enfoque: razones de diferenciación, NO lista de características.
// El objetivo es generar confianza y reducir fricción de compra.
// ============================================================

import "../assets/css/home.css"; // Estilos del proyecto

// ──────────────────────────────────────────────────────────
// Lista de razones para elegir CERTIA.
// Cada objeto: id, ícono emoji, título y descripción persuasiva.
// Definido fuera del componente para evitar recreaciones en cada render.
// ──────────────────────────────────────────────────────────
const BENEFITS = [
  {
    id: 1,
    icon: "🔗",
    title: "Enlace Personalizado",
    desc: "Obtén un enlace único para tu negocio que puedes colocar en tu sitio web o compartir con tus clientes.",
  },
  {
    id: 2,
    icon: "📱",
    title: "Código QR para Tiendas Físicas",
    desc: "Genera un QR que tus clientes pueden escanear para registrar sus reclamaciones desde tu local.",
  },
  {
    id: 3,
    icon: "📈",
    title: "Publicidad Gratuita a tu negocio",
    desc: "Hacemos publicidad gratuita desde el primer plan, publicidad via google.",
  },
  {
    id: 4,
    icon: "📄",
    title: "PDFs Automáticos",
    desc: "Genera y envía PDFs de las reclamaciones automáticamente a tus clientes y a tu correo.",
  },
  {
    id: 5,
    icon: "⚖️",
    title: "Cumple con la Normativa Legal",
    desc: "Cumpliendo los requerimientos obligatorios que pide Sunat e Indecopi.",
  },
  {
    id: 6,
    icon: "⚡",
    title: "Fácil de Implementar",
    desc: "Configura tu libro de reclamaciones en minutos, sin complicaciones técnicas ni procesos largos.",
  },
];

// ──────────────────────────────────────────────────────────
// Componente Benefits
// Renderiza un grid con las cards de beneficios del servicio.
// ──────────────────────────────────────────────────────────
const Benefits = () => {
  return (
    /* Sección de beneficios — fondo blanco */
    <section className="section section--white" id="beneficios">
      <div className="container">

        {/* ── Título principal — enfocado en diferenciación, no en características ── */}
        <h2 className="section__title benefits__title">¿Por Qué Elegir <span style={{ color: "#1e3a8a", fontWeight: 700 }}>CERTIA</span>?</h2>

        {/* ── Grid de cards ── */}
        <div className="benefits__grid">

          {/* Iteramos sobre el array BENEFITS para generar cada card */}
          {BENEFITS.map((benefit) => (
            <div className="benefit-card" key={benefit.id}>

              {/* Ícono representativo de la característica */}
              <div className="benefit-card__icon" aria-hidden="true">
                {benefit.icon}
              </div>

              {/* Título de la característica */}
              <h3 className="benefit-card__title">{benefit.title}</h3>

              {/* Descripción breve */}
              <p className="benefit-card__desc">{benefit.desc}</p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Benefits;
