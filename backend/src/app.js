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

// ── Healthcheck básico ────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", mensaje: "Servidor LRPeru en funcionamiento" });
});

// ── Iniciar servidor ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
