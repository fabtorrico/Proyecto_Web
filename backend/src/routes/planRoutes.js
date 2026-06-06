// ============================================================
// planRoutes.js — Rutas de planes
// Expone el endpoint público GET /api/plans para que el frontend
// pueda obtener los planes disponibles sin necesidad de JWT.
// ============================================================

import express  from "express";
import { getPlans } from "../controllers/planController.js";

const router = express.Router();

// GET /api/plans — retorna todos los planes de la tabla `plans`
router.get("/plans", getPlans);

export default router;
