import { Routes, Route } from "react-router-dom";
import Home               from "./pages/Home";
import Login              from "./pages/Login";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import Dashboard          from "./pages/Dashboard"; // Panel del usuario autenticado

function App() {
  return (
    <Routes>
      {/* Ruta raíz: muestra la landing page */}
      <Route path="/" element={<Home />} />
      {/* Ruta /login: muestra el formulario de acceso */}
      <Route path="/login" element={<Login />} />
      {/* Ruta /politica-privacidad: muestra la política de privacidad */}
      <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
      {/* Ruta /dashboard: panel del usuario tras autenticarse */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;