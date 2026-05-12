// ============================================================
// claimRoutes.js — Rutas del libro de reclamaciones
// ============================================================

import express from "express";
import { createClaim, getPendingClaims, getCompletedClaims } from "../controllers/claimController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/claims — ruta pública, no requiere JWT
router.post("/claims", createClaim);

// GET /api/claims/pending — ruta protegida con JWT
// Solo devuelve reclamos del usuario autenticado (filtro por user_id del token)
router.get("/claims/pending", verifyToken, getPendingClaims);

// GET /api/claims/completed — ruta protegida con JWT
// Solo devuelve reclamos completados del usuario autenticado
router.get("/claims/completed", verifyToken, getCompletedClaims);

export default router;
