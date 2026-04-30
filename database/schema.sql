CREATE DATABASE proyecto_web;
USE proyecto_web;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  web VARCHAR(255),
  razon_social VARCHAR(255) NOT NULL,
  ruc VARCHAR(11) NOT NULL,
  direccion VARCHAR(255),
  logo_url VARCHAR(255)
);

INSERT INTO users (
  nombre, apellido, correo, password, web,
  razon_social, ruc, direccion, logo_url
) VALUES (
  'Fabricio',
  'Torrico',
  '123@hotmail.com',
  '123456',
  '',
  'razon',
  '99999999999',
  'abc',
  ''
);