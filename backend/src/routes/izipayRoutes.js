// ============================================================
// izipayRoutes.js — Rutas de integración con Izipay
// POST /api/payments/create-order — obtiene paymentURL (JWT requerido)
// POST /api/payments/ipn           — webhook de Izipay (público, sin JWT)
// ============================================================

import express                          from "express";
import { createPaymentOrder, handleIPN } from "../controllers/izipayController.js";
import { verifyToken }                  from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /create-order — inicia el flujo con Izipay y devuelve paymentURL.
router.post("/create-order", verifyToken, createPaymentOrder);

// POST /ipn — webhook público llamado por Izipay al completar el pago.
// NO lleva verifyToken: Izipay no tiene token JWT del usuario.
// La autenticidad se valida internamente con HMAC-SHA256.
router.post("/ipn", handleIPN);

export default router;
