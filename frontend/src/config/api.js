// ============================================================
// config/api.js — Centralizacion de la URL base del backend
//
// VITE_API_URL se lee desde .env (desarrollo) o .env.production
// (produccion). Nunca escribir localhost aqui directamente.
//
// Uso:
//   import { API_URL, SERVER_URL } from "../config/api";
//   fetch(`${API_URL}/login`)
//   `${SERVER_URL}/uploads/claims/${file}`
// ============================================================

// URL base del API, incluyendo el prefijo /api.
// Desarrollo:  http://localhost:3000/api  (frontend/.env)
// Produccion:  https://certia.pe/api      (frontend/.env.production)
export const API_URL = import.meta.env.VITE_API_URL;

// URL raiz del servidor, sin el prefijo /api.
// Se usa para archivos estaticos servidos por Express (/uploads, etc.).
// Desarrollo:  http://localhost:3000
// Produccion:  https://certia.pe
export const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, "");
