// ============================================================
// uploadMiddleware.js — Configuración de multer para archivos adjuntos
//
// Por qué multer:
//   - Maneja multipart/form-data (necesario para subir archivos desde el frontend).
//   - diskStorage: guarda el archivo físicamente en el servidor.
//   - fileFilter: rechaza extensiones no permitidas antes de guardar.
//
// Los archivos se guardan en: backend/uploads/claims/
// El nombre generado es único: {timestamp}-{random}{ext}
// Esto evita colisiones y no expone el nombre original del archivo.
//
// Por qué no se suben archivos a GitHub:
//   - Los archivos de usuarios son datos sensibles y pueden ser grandes.
//   - uploads/ está en .gitignore para excluirlos del repositorio.
// ============================================================

import multer from "multer";
import path   from "path";
import fs     from "fs";

// Ruta absoluta a la carpeta de uploads.
// process.cwd() apunta a backend/ cuando el servidor se inicia desde ahí.
const uploadDir = path.join(process.cwd(), "uploads", "claims");

// Crear la carpeta si no existe (primera vez o si fue eliminada manualmente)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Extensiones permitidas para archivos adjuntos de reclamos
const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".xls", ".xlsx"];

// ── diskStorage: dónde y cómo guardar cada archivo ──────
const storage = multer.diskStorage({
  // Carpeta destino
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  // Nombre único: {timestamp}-{número aleatorio}{extensión original}
  // Evita colisiones aunque dos usuarios suban archivos con el mismo nombre.
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

// ── fileFilter: rechazar extensiones no permitidas ───────
// El error llega a Express; el middleware de errores lo convierte en 400.
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Formato de archivo no permitido"), false);
  }

  cb(null, true);
};

// ── Instancia de multer lista para usar en las rutas ────
// limits.fileSize: 10 MB máximo por archivo.
export const uploadClaimAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
