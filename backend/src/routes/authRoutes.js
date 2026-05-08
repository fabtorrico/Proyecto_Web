// ============================================================
// authRoutes.js — Definición de rutas de autenticación
// Cada ruta apunta a su handler en authController
// ============================================================

import express from "express";
import { login, getUser, updateUserProfile, updateBusinessData, updateUserPassword } from "../controllers/authController.js";

const router = express.Router();

// POST /api/login
router.post("/login", login);

// GET /api/user/:id — devuelve datos frescos del usuario desde la BD
router.get("/user/:id", getUser);

// PUT /api/users/:id/profile — actualiza nombre, apellido, correo, web
router.put("/users/:id/profile", updateUserProfile);

// PUT /api/users/:id/business — actualiza razon_social, ruc, direccion, logo_url
router.put("/users/:id/business", updateBusinessData);

// PUT /api/users/:id/password — verifica antigua contraseña y actualiza por la nueva
router.put("/users/:id/password", updateUserPassword);

export default router;
