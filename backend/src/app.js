// ============================================================
// app.js — Punto de entrada del servidor Express
// Configura middleware global y monta las rutas
// ============================================================

import express           from "express";
import cors              from "cors";
import dotenv            from "dotenv";
import path              from "path";
import { fileURLToPath } from "url";
import authRoutes  from "./routes/authRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import planRoutes  from "./routes/planRoutes.js";

// __dirname no existe en módulos ESM; se reconstruye manualmente.
// app.js está en backend/src, por eso "../uploads" apunta a backend/uploads.
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Carga las variables de entorno desde backend/.env
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware global ──────────────────────────────────────

// CORS: permite peticiones desde el frontend React (localhost:5173)
// En producción reemplazar origin por el dominio real
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Parsea el body de los requests como JSON
app.use(express.json());

// ── Archivos estáticos ────────────────────────────────────
// Sirve los archivos de uploads/claims en /uploads/claims/{nombre}
// Necesario para que el botón "VER ARCHIVO ADJUNTO" del Dashboard pueda abrirlos.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Rutas ──────────────────────────────────────────────────

// Todas las rutas de autenticación bajo /api
app.use("/api", authRoutes);

// Rutas públicas del libro de reclamaciones (sin JWT)
app.use("/api", claimRoutes);

// Rutas de planes — lectura pública desde la tabla `plans`
app.use("/api", planRoutes);

// ── Frontend React (produccion) ───────────────────────────
// El build de Vite se copia en backend/public antes del deploy.
// app.js esta en backend/src, asi que "../public" apunta a backend/public.
// express.static sirve assets concretos (JS, CSS, imagenes, favicons).
const frontendPath = path.join(__dirname, "../public");

app.use(express.static(frontendPath));

// Fallback SPA para React Router.
// React Router maneja rutas del lado del cliente (/login, /dashboard, etc.).
// Cuando el usuario recarga o accede directamente a esas URLs, el servidor
// no tiene esas rutas registradas y devolveria 404.
// La solucion es devolver index.html para cualquier ruta que NO sea /api
// ni /uploads — React toma el control desde ahi.
// Se usa app.use con middleware en lugar de app.get("*") para evitar
// conflictos con algunos proxies y plataformas de hosting que interpretan
// el wildcard de forma diferente y pueden causar 503.
app.use((req, res, next) => {
  // Dejar pasar peticiones al backend sin tocarlas
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  // Para cualquier otra ruta: entregar index.html y dejar que React Router
  // decida qué componente renderizar segun la URL.
  return res.sendFile(path.join(frontendPath, "index.html"));
});

// ── Iniciar servidor ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
