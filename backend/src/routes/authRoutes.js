// ============================================================
// authRoutes.js — Definición de rutas de autenticación
// Cada ruta apunta a su handler en authController
// ============================================================

import express from "express";
import { login, register, getUser, updateUserProfile, updateBusinessData, updateUserPassword, getCompanyBook } from "../controllers/authController.js";
// Middleware que verifica el JWT en el header Authorization de cada petición privada
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/login
router.post("/login", login);

// POST /api/register — ruta pública, no requiere JWT
// Crea un nuevo usuario con contraseña hasheada con bcrypt
router.post("/register", register);

// GET /api/user/:id — devuelve datos frescos del usuario desde la BD
router.get("/user/:id", verifyToken, getUser);

// PUT /api/users/:id/profile — actualiza nombre, apellido, correo, web
router.put("/users/:id/profile", verifyToken, updateUserProfile);

// PUT /api/users/:id/business — actualiza razon_social, ruc, direccion, logo_url
router.put("/users/:id/business", verifyToken, updateBusinessData);

// PUT /api/users/:id/password — verifica antigua contraseña y actualiza por la nueva
router.put("/users/:id/password", verifyToken, updateUserPassword);

// GET /api/company-book — ruta PUBLICA, no requiere JWT.
// Devuelve los datos de la empresa corporativa de Certia (users.id = 1).
// Usada por el enlace "Libro de Reclamaciones" del footer para mostrar
// siempre el libro oficial, independientemente del usuario logueado.
router.get("/company-book", getCompanyBook);

export default router;
