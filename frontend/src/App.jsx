// Routes y Route son los componentes de react-router-dom
// que definen qué componente renderizar según la URL actual
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";    // Página principal (landing)
import Login from "./pages/Login";  // Página de inicio de sesión

function App() {
  return (
    // Routes evalua cada <Route> y renderiza el que coincide con la URL
    <Routes>
      {/* Ruta raíz: muestra la landing page */}
      <Route path="/" element={<Home />} />
      {/* Ruta /login: muestra el formulario de acceso */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;