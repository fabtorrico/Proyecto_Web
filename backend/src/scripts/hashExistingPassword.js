// ============================================================
// hashExistingPassword.js — Script de migración única
//
// Convierte la contraseña en texto plano del usuario de prueba
// a un hash bcrypt antes de activar la autenticación con bcrypt.
//
// Ejecutar UNA SOLA VEZ desde la carpeta backend:
//   node src/scripts/hashExistingPassword.js
//
// Después de ejecutarlo, el login solo funcionará con bcrypt.
// ============================================================

import bcrypt from "bcrypt";
import pool from "../config/db.js";

const hashExistingPassword = async () => {
  try {
    const userEmail    = "123@hotmail.com";
    const plainPassword = "123456";

    // Generar hash con factor de costo 10 (equilibrio seguridad/rendimiento)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Actualizar la contraseña en la BD usando consulta parametrizada
    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE correo = ?",
      [hashedPassword, userEmail]
    );

    if (result.affectedRows === 0) {
      console.error("No se encontró el usuario con correo:", userEmail);
      process.exit(1);
    }

    console.log("Contraseña hasheada correctamente para:", userEmail);
    console.log("Hash generado:", hashedPassword);
    process.exit(0);

  } catch (error) {
    console.error("Error hasheando contraseña:", error);
    process.exit(1);
  }
};

hashExistingPassword();
