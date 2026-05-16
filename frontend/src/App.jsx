import { Routes, Route } from "react-router-dom";
import Home               from "./pages/Home";
import Login              from "./pages/Login";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import Dashboard          from "./pages/Dashboard";
import Register           from "./pages/Register";
// Vista pública del libro de reclamaciones — accesible por clientes externos
import PublicClaimBook    from "./pages/PublicClaimBook";
// Vista imprimible del aviso del libro para tienda física
import PrintNotice        from "./pages/PrintNotice";

function App() {
  return (
    <Routes>
      <Route path="/"                    element={<Home />} />
      <Route path="/login"               element={<Login />} />
      <Route path="/registro"             element={<Register />} />
      <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/dashboard"           element={<Dashboard />} />
      {/* Ruta pública única por empresa: /libro/:slug */}
      <Route path="/libro/:slug"         element={<PublicClaimBook />} />
      {/* Vista imprimible A4 del aviso: /aviso/:slug */}
      <Route path="/aviso/:slug"         element={<PrintNotice />} />
    </Routes>
  );
}

export default App;