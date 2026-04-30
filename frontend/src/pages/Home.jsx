// ============================================================
// Home.jsx — Página principal (Landing Page)
// Orquesta todos los componentes en el orden correcto
// ============================================================

// ── Importación de componentes de sección ──
import Navbar       from "../components/Navbar";       // Barra de navegación fija
import Hero         from "../components/Hero";         // Sección principal / portada
import Benefits     from "../components/Benefits";     // Beneficios del servicio
import HowItWorks   from "../components/HowItWorks";   // Pasos del proceso
import Testimonials from "../components/Testimonials"; // Reseñas de clientes
import Pricing      from "../components/Pricing";      // Planes y precios
import Footer       from "../components/Footer";       // Pie de página y contacto

// ── Importación de estilos globales de la landing ──
import "../assets/css/home.css";

// ──────────────────────────────────────────────────────────
// Componente Home
// Página principal de la aplicación.
// Renderiza los componentes en orden visual de arriba hacia abajo.
// ──────────────────────────────────────────────────────────
const Home = () => {
  return (
    /*
      Elemento raíz de la página.
      Cada sección está separada en su propio componente para
      facilitar el mantenimiento, reutilización y escalabilidad.
    */
    <div className="home-page">

      {/* 1. Navbar — fijo arriba, visible en toda la página */}
      <Navbar />

      {/* 2. Hero — primera sección visible al cargar */}
      <Hero />

      {/* 3. Benefits — qué incluye el servicio */}
      <Benefits />

      {/* 4. HowItWorks — pasos del proceso de contratación */}
      <HowItWorks />

      {/* 5. Testimonials — reseñas de clientes reales */}
      <Testimonials />

      {/* 6. Pricing — planes disponibles con precios */}
      <Pricing />

      {/* 7. Footer — contacto, enlaces y redes sociales */}
      <Footer />

    </div>
  );
};

export default Home;
