// ============================================================
// paymentRoutes.js — Rutas de pagos
// POST /api/payments/create — registra intención de compra (estado: pendiente)
// Protegido con JWT: solo usuarios autenticados pueden iniciar un pago.
// ============================================================

import express          from "express";
import { createPayment } from "../controllers/paymentController.js";
import { verifyToken }  from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /payments/create — primer paso del flujo de pagos.
// Crea un registro pendiente en la tabla `payments`.
// Base para la futura integración con Izipay (webhook/IPN).
router.post("/create", verifyToken, createPayment);

export default router;
