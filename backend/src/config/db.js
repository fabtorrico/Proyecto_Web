// ============================================================
// db.js — Configuración del pool de conexiones a MySQL
// Usa mysql2/promise para soporte de async/await
// ============================================================

import mysql from "mysql2/promise";

// createPool mantiene múltiples conexiones abiertas y las reutiliza,
// evitando el overhead de abrir/cerrar una conexión en cada request.
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "Demacia@123",
  database: process.env.DB_NAME     || "proyecto_web",
  // Limita el número de conexiones simultáneas para no saturar MySQL
  connectionLimit: 10,
});

export default pool;
