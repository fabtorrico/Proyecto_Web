// ============================================================
// claimRoutes.js — Rutas del libro de reclamaciones
// ============================================================

import express from "express";
import { createClaim, getPendingClaims, getCompletedClaims, respondClaim } from "../controllers/claimController.js";
import { verifyToken }            from "../middlewares/authMiddleware.js";
// uploadClaimAttachment: middleware multer que procesa el archivo antes de createClaim.
// Lee el campo "archivo_adjunto" del formulario multipart y lo guarda en uploads/claims/.
import { uploadClaimAttachment }  from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// POST /api/claims — ruta pública, no requiere JWT.
// uploadClaimAttachment.single("archivo_adjunto") procesa el archivo si existe;
// si no se envía archivo, req.file queda undefined y el reclamo se guarda sin adjunto.
router.post(
  "/claims",
  uploadClaimAttachment.single("archivo_adjunto"),
  createClaim
);

// GET /api/claims/pending — ruta protegida con JWT
// Solo devuelve reclamos del usuario autenticado (filtro por user_id del token)
router.get("/claims/pending",   verifyToken, getPendingClaims);

// GET /api/claims/completed — ruta protegida con JWT
// Solo devuelve reclamos completados del usuario autenticado
router.get("/claims/completed", verifyToken, getCompletedClaims);

// PUT /api/claims/:claimId/respond — ruta protegida con JWT
// Guarda respuesta oficial, fecha_respuesta y cambia estado a completado.
// Sólo puede ejecutarlo el dueño del reclamo (validación de ownership en el controller).
router.put("/claims/:claimId/respond", verifyToken, respondClaim);

export default router;
