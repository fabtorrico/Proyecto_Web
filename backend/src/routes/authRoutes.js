// ============================================================
// authRoutes.js — Definición de rutas de autenticación
// Cada ruta apunta a su handler en authController
// ============================================================

import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// POST /api/login
// Body esperado: { correo: string, password: string }
router.post("/login", login);

export default router;
