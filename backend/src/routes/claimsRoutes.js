// ============================================================
// claimsRoutes.js — Rutas para el libro de reclamaciones público
// ============================================================

import express from "express";
import { createClaim } from "../controllers/claimsController.js";

const router = express.Router();

// POST /api/claims — ruta pública, no requiere JWT
// El cliente (consumidor) no está logueado cuando envía un reclamo
router.post("/claims", createClaim);

export default router;
