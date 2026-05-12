// ============================================================
// claimRoutes.js — Rutas públicas del libro de reclamaciones
// No requieren JWT: el consumidor final no está autenticado.
// ============================================================

import express from "express";
import { createClaim } from "../controllers/claimController.js";

const router = express.Router();

// POST /api/claims — guarda un nuevo reclamo
router.post("/claims", createClaim);

export default router;
