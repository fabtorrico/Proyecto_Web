// ============================================================
// app.js — Punto de entrada del servidor Express
// Configura middleware global y monta las rutas
// ============================================================

import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";
import authRoutes from "./routes/authRoutes.js";

// Carga las variables de entorno desde backend/.env
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware global ──────────────────────────────────────

// CORS: permite peticiones desde el frontend React (localhost:5173)
// En producción reemplazar origin por el dominio real
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST"],
}));

// Parsea el body de los requests como JSON
app.use(express.json());

// ── Rutas ──────────────────────────────────────────────────

// Todas las rutas de autenticación bajo /api
app.use("/api", authRoutes);

// ── Healthcheck básico ────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", mensaje: "Servidor LRPeru en funcionamiento" });
});

// ── Iniciar servidor ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
