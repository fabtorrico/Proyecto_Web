// ============================================================
// HowItWorks.jsx — Sección "¿Cómo funciona?"
// Muestra los 4 pasos numerados del proceso de contratación
// ============================================================

import "../assets/css/home.css"; // Estilos del proyecto

// ──────────────────────────────────────────────────────────
// Lista de pasos del proceso
// Definida fuera del componente para evitar recreaciones en cada render.
// Cada objeto tiene: id (número visible), título y descripción.
// ──────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "Contacta a un asesor",
    desc: "Nuestro equipo te guiará para elegir el plan perfecto y resolverá todas tus dudas.",
  },
  {
    id: 2,
    title: "Te Creamos la Cuenta",
    desc: "Creamos la cuenta en CERTIA, configuramos tu negocio y recibes tu usuario y contraseña en minutos.",
  },
  {
    id: 3,
    title: "Recibe tu Contrato y Manuales",
    desc: "Obtén tu contrato del servicio junto con guías detalladas para empezar a usar CERTIA.",
  },
  {
    id: 4,
    title: "Gestionas reclamaciones",
    desc: "Administra todas las reclamaciones desde tu panel en certia.com, con enlace y QR personalizados.",
  },
];

// ──────────────────────────────────────────────────────────
// Componente HowItWorks
// Renderiza los pasos numerados sobre fondo gris claro.
// ──────────────────────────────────────────────────────────
const HowItWorks = () => {
  return (
    /* Sección con fondo gris claro — id para navegación interna */
    <section className="section section--gray" id="como-funciona">
      <div className="container">

        {/* ── Título de la sección ── */}
        <h2 className="section__title">¿Cómo funciona <span style={{ color: "#1e3a8a", fontWeight: 700 }}>CERTIA</span>?</h2>

        {/* ── Grid de pasos ── */}
        <div className="steps__grid">

          {/* Iteramos sobre el array STEPS para generar cada paso */}
          {STEPS.map((step) => (
            <div className="step-card" key={step.id}>

              {/* Número grande del paso — color azul */}
              <span className="step-card__number" aria-hidden="true">
                {step.id}
              </span>

              {/* Título del paso */}
              <h3 className="step-card__title">{step.title}</h3>

              {/* Descripción breve del paso */}
              <p className="step-card__desc">{step.desc}</p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
