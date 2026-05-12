// Script de migración: crea la tabla claims si no existe.
// Ejecutar UNA VEZ: node src/scripts/createClaimsTable.js

import pool from "../config/db.js";

const sql = `
  CREATE TABLE IF NOT EXISTS claims (
    id                         INT AUTO_INCREMENT PRIMARY KEY,
    user_id                    INT NOT NULL,
    correlativo                VARCHAR(30)  NOT NULL UNIQUE,
    codigo_seguimiento         VARCHAR(20)  NOT NULL UNIQUE,

    nombre                     VARCHAR(100) NOT NULL,
    primer_apellido            VARCHAR(100) NOT NULL,
    segundo_apellido           VARCHAR(100),
    tipo_documento             VARCHAR(20)  NOT NULL,
    numero_documento           VARCHAR(20)  NOT NULL,
    celular                    VARCHAR(9)   NOT NULL,
    departamento               VARCHAR(100) NOT NULL,
    provincia                  VARCHAR(100) NOT NULL,
    distrito                   VARCHAR(100) NOT NULL,
    direccion                  VARCHAR(255) NOT NULL,
    referencia                 VARCHAR(255),
    correo_electronico         VARCHAR(100) NOT NULL,
    es_menor_edad              TINYINT(1)   NOT NULL DEFAULT 0,

    tipo_reclamo               ENUM('RECLAMO','QUEJA')       NOT NULL,
    tipo_consumo               ENUM('Producto','Servicio')   NOT NULL,
    numero_pedido              VARCHAR(100),
    monto_reclamado            DECIMAL(10,2) NOT NULL,
    descripcion_producto_servicio VARCHAR(255) NOT NULL,
    descripcion_reclamo        TEXT NOT NULL,
    fecha_compra_consumo       DATE,

    pedido_cliente             TEXT NOT NULL,

    estado ENUM('PENDIENTE','EN_PROCESO','COMPLETADO') NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

try {
  await pool.query(sql);
  console.log("✓ Tabla claims creada correctamente");
  process.exit(0);
} catch (error) {
  console.error("Error creando tabla claims:", error.message);
  process.exit(1);
}
