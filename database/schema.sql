CREATE DATABASE IF NOT EXISTS proyecto_web;
USE proyecto_web;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,

  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,

  correo VARCHAR(100) NOT NULL UNIQUE,

  password VARCHAR(255) NOT NULL,

  web VARCHAR(255),

  razon_social VARCHAR(255) NOT NULL,

  ruc VARCHAR(11) NOT NULL,

  direccion VARCHAR(255) NOT NULL,

  logo_url VARCHAR(255),

  -- Plan contratado
  plan_duracion INT NULL,

  -- Fechas del plan
  fecha_inicio_plan DATE NULL,
  fecha_fin_plan DATE NULL
);

-- ============================================================
-- CLAIMS
-- ============================================================

CREATE TABLE claims (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Empresa propietaria del reclamo
  user_id INT NOT NULL,

  -- Identificadores automáticos
  correlativo VARCHAR(50) NOT NULL UNIQUE,
  codigo_seguimiento VARCHAR(20) NOT NULL UNIQUE,

  -- Datos del consumidor reclamante
  nombre VARCHAR(100) NOT NULL,
  primer_apellido VARCHAR(100) NOT NULL,
  segundo_apellido VARCHAR(100) NOT NULL,

  tipo_documento VARCHAR(50) NOT NULL,
  numero_documento VARCHAR(30) NOT NULL,
  celular VARCHAR(9) NOT NULL,

  departamento VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  distrito VARCHAR(100) NOT NULL,

  direccion TEXT NOT NULL,
  referencia TEXT,

  correo_electronico VARCHAR(150) NOT NULL,

  es_menor_edad ENUM('Si', 'No') NOT NULL,

  -- Información del reclamo
  tipo_reclamo VARCHAR(50) NOT NULL,
  tipo_consumo VARCHAR(50) NOT NULL,

  numero_pedido VARCHAR(100),

  monto_reclamado DECIMAL(10,2) NOT NULL,

  descripcion_producto_servicio TEXT NOT NULL,

  detalle_reclamo TEXT NOT NULL,

  fecha_compra_consumo DATE,

  archivo_adjunto VARCHAR(255),

  -- Pedido del cliente
  pedido_cliente TEXT NOT NULL,

  -- Respuesta de la empresa
  respuesta TEXT NULL,
  fecha_respuesta DATETIME NULL,

  -- Política de privacidad
  acepta_politica BOOLEAN NOT NULL DEFAULT 0,

  -- Estado del reclamo
  estado ENUM(
    'pendiente',
    'completado'
  ) NOT NULL DEFAULT 'pendiente',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_claims_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================================
-- PLANS
-- ============================================================

CREATE TABLE plans (
  id INT AUTO_INCREMENT PRIMARY KEY,

  nombre VARCHAR(100) NOT NULL,

  duracion_anios INT NOT NULL,

  precio DECIMAL(10,2) NOT NULL
);

INSERT INTO plans (
  nombre,
  duracion_anios,
  precio
)
VALUES
('Plan Mensual', 0, 25.00),
('Plan 1 Año', 1, 150.00),
('Plan 2 Años', 2, 250.00),
('Plan 3 Años', 3, 300.00);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,

  plan_duracion INT NOT NULL,

  monto DECIMAL(10,2) NOT NULL,

  estado ENUM(
    'pendiente',
    'aprobado',
    'rechazado',
    'cancelado'
  ) NOT NULL DEFAULT 'pendiente',

  transaction_id VARCHAR(255),

  payment_provider VARCHAR(50)
  NOT NULL DEFAULT 'izipay',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_payments_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);