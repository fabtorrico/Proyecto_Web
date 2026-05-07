// ============================================================
// authRoutes.js — Definición de rutas de autenticación
// Cada ruta apunta a su handler en authController
// ============================================================

import express from "express";
import { login, getUser } from "../controllers/authController.js";

const router = express.Router();

// POST /api/login
router.post("/login", login);

// GET /api/user/:id — devuelve datos frescos del usuario desde la BD
router.get("/user/:id", getUser);

export default router;
