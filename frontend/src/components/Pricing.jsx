// ============================================================
// Pricing.jsx — Sección de planes y precios
// 9 planes en 3 filas de 3. Diseño limpio tipo SaaS.
// Estructura de cada card: ícono → nombre → precio → features → botón → soporte
// Todo el contenido centrado para consistencia visual.
// ============================================================

import "../assets/css/home.css"; // Estilos globales del proyecto

// ──────────────────────────────────────────────────────────
// Array completo de 9 planes (3 filas × 3 columnas).
// price: string con el monto, o null para mostrar "Precio a Tratar".
// support: incluye emoji 🎧 para refuerzo visual de confianza.
// ──────────────────────────────────────────────────────────
const PLANS = [
  // ── Fila 1: Planes del Libro de Reclamaciones ──
  {
    id: 1,
    icon: "📅",
    name: "Plan Básico – 1 Año",
    price: "149",
    period: "/año",
    featured: false,
    support: "🎧 Soporte Básico por 1 Año",
    features: [
      "Enlace y QR Personalizado",
      "Formulario de Reclamaciones",
      "PDFs Automáticos",
      "1 RUC registrado",
    ],
  },
  {
    id: 2,
    icon: "📅",
    name: "Plan Básico – 2 Años",
    price: "249",
    period: "/2 años",
    featured: true,
    support: "🎧 Soporte Prioritario por 2 Años",
    features: [
      "Enlace y QR Personalizado",
      "Formulario de Reclamaciones",
      "PDFs Automáticos",
      "1 Usuario, 1 RUC",
    ],
  },
  {
    id: 3,
    icon: "📅",
    name: "Plan Básico – 3 Años",
    price: "299",
    period: "/3 años",
    featured: false,
    support: "🎧 Soporte Prioritario por 3 Años",
    features: [
      "Enlace y QR Personalizado",
      "Formulario de Reclamaciones",
      "PDFs Automáticos",
      "1 Usuario, 1 RUC",
    ],
  },

  // ── Fila 2: Planes para Diseñadores Web ──
  {
    id: 4,
    icon: "👨\u200d💻",
    name: "Plan Diseñador Junior",
    price: "299",
    period: "/año",
    featured: false,
    support: "🎧 Soporte Básico por 1 Año",
    features: [
      "Enlace y QR Personalizado",
      "Formulario de Reclamaciones",
      "PDFs Automáticos",
      "3 Usuarios",
      "3 RUC",
    ],
  },
  {
    id: 5,
    icon: "👨‍💼",
    name: "Plan Diseñador Senior",
    price: "499",
    period: "/año",
    featured: true,
    support: "🎧 Soporte Prioritario por 1 Año",
    features: [
      "Enlace y QR Personalizado",
      "Formulario de Reclamaciones",
      "PDFs Automáticos",
      "7 Usuarios",
      "7 RUC",
    ],
  },
  {
    id: 6,
    icon: "🏢",
    name: "Plan Diseñador Agencia",
    price: "899",
    period: "/año",
    featured: false,
    support: "🎧 Soporte Dedicado por 1 Año",
    features: [
      "Enlace y QR Personalizado",
      "Formulario de Reclamaciones",
      "PDFs Automáticos",
      "15 Usuarios",
      "15 RUC",
    ],
  },

];

// ──────────────────────────────────────────────────────────
// Subcomponente PricingCard
// Todo el contenido centrado: ícono, nombre, precio, features, botón y soporte.
// Si price === null se muestra "Precio a Tratar" en lugar del monto.
// ──────────────────────────────────────────────────────────
const PricingCard = ({ plan }) => (
  <div className={`pricing-card ${plan.featured ? "pricing-card--featured" : ""}`}>

    {/* ── Badge "MÁS POPULAR" — solo en planes featured ── */}
    {plan.featured && (
      <span className="pricing-card__badge">MÁS POPULAR</span>
    )}

    {/* ── Ícono centrado del plan ── */}
    <div className="pricing-card__icon" aria-hidden="true">
      {plan.icon}
    </div>

    {/* ── Nombre del plan ── */}
    <h3 className="pricing-card__name">{plan.name}</h3>

    {/* ── Precio: "S/ 149/año" o "Precio a Tratar" si price es null ── */}
    <div className="pricing-card__price">
      {plan.price !== null ? (
        /* Precio numérico con moneda y período */
        <>
          <span className="pricing-card__currency">S/ </span>
          {plan.price}
          <span className="pricing-card__period">{plan.period}</span>
        </>
      ) : (
        /* Plan de cotización — sin monto fijo */
        <span className="pricing-card__price--custom">Precio a Tratar</span>
      )}
    </div>

    {/* ── Lista de beneficios (check verde via CSS ::before) ── */}
    <ul className="pricing-card__features">
      {plan.features.map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>

    {/* ── Botón CTA — redirige a pasarela de pago externa (MercadoPago)
         target="_blank" abre en nueva pestaña sin cerrar la landing.
         rel="noopener noreferrer" evita que la nueva pestaña acceda
         al objeto window de esta página (seguridad). ── */}
    <a
      href="https://link.mercadopago.com.pe/librodereclamaciones"
      target="_blank"
      rel="noopener noreferrer"
      className="pricing-card__btn"
      aria-label={`Empezar con el plan ${plan.name}`}
    >
      🚀 Empezar Ahora
    </a>

    {/* ── Texto de soporte con emoji 🎧 — genera confianza ── */}
    <p className="pricing-card__support">{plan.support}</p>

  </div>
);

// ──────────────────────────────────────────────────────────
// Componente Pricing
// Un solo grid de 6 cards (3×2) sin subtítulos de grupo.
// Layout: título → grid limpio.
// ──────────────────────────────────────────────────────────
const Pricing = () => {
  return (
    /* Sección de precios — fondo claro para que las cards blancas destaquen */
    <section className="section section--gray" id="planes">
      <div className="container">

        {/* ── Título con emojis para mayor atractivo visual ── */}
        <h2 className="section__title pricing__main-title">
          🚀 Elige el Plan Perfecto para tu Negocio 💼
        </h2>

        {/* ── Grid de 9 planes — 3 por fila, 3 filas ── */}
        <div className="pricing__grid">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;
