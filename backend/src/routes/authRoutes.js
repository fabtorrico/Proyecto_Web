// ============================================================
// authRoutes.js — Definición de rutas de autenticación
// Cada ruta apunta a su handler en authController
// ============================================================

import express from "express";
import { login, getUser, updateUserProfile, updateBusinessData, updateUserPassword } from "../controllers/authController.js";
// Middleware que verifica el JWT en el header Authorization de cada petición privada
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/login
router.post("/login", login);

// GET /api/user/:id — devuelve datos frescos del usuario desde la BD
router.get("/user/:id", verifyToken, getUser);

// PUT /api/users/:id/profile — actualiza nombre, apellido, correo, web
router.put("/users/:id/profile", verifyToken, updateUserProfile);

// PUT /api/users/:id/business — actualiza razon_social, ruc, direccion, logo_url
router.put("/users/:id/business", verifyToken, updateBusinessData);

// PUT /api/users/:id/password — verifica antigua contraseña y actualiza por la nueva
router.put("/users/:id/password", verifyToken, updateUserPassword);

export default router;
