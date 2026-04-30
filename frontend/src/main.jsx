import React from "react";
import ReactDOM from "react-dom/client";
// BrowserRouter habilita la navegación por URL en toda la app
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./assets/css/home.css";

// Renderizamos la app envuelta en BrowserRouter para que
// cualquier componente hijo pueda usar <Link>, useNavigate, etc.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
