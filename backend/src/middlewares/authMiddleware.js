// ============================================================
// authMiddleware.js — Middleware de verificación JWT
//
// JWT (JSON Web Token) es un estándar para autenticación stateless.
// El cliente envía el token en cada petición privada mediante el header:
//   Authorization: Bearer <token>
//
// El middleware extrae el token, lo verifica con JWT_SECRET y,
// si es válido, adjunta el payload decodificado en req.user
// para que los controladores puedan usarlo.
//
// Si el token falta, está malformado o expiró, responde 401.
// ============================================================

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Extraer el header Authorization (formato: "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // jwt.verify valida la firma y la expiración del token.
    // Si el token fue alterado o expiró, lanza una excepción.
    // El payload decodificado (id, correo) queda disponible en req.user.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();

  } catch (error) {
    // No exponer detalles del error al cliente por seguridad
    console.error("[verifyToken] error:", error.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
