# Certia — Libro de Reclamaciones Virtual

> Plataforma SaaS para la gestión digital del Libro de Reclamaciones peruano, con soporte multi-empresa, pasarela de pagos y generación automática de documentos PDF.

---

## Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI declarativa con hooks |
| Vite | 8 | Bundler y dev server |
| React Router DOM | 7 | Enrutamiento SPA (client-side) |
| qrcode.react | 4 | Generación de QR por empresa |
| react-datepicker | 9 | Filtros de fecha en el panel |
| date-fns | 4 | Manipulación de fechas |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js + Express | 5 | API REST, ESM modules (`"type": "module"`) |
| mysql2/promise | 3 | Pool de conexiones a MySQL con async/await |
| jsonwebtoken | 9 | Autenticación stateless (JWT) |
| bcrypt | 6 | Hash de contraseñas |
| multer | 2 | Upload de archivos adjuntos a reclamos |
| axios | 1 | Llamadas HTTP a la API de Izipay |
| dotenv | 17 | Variables de entorno |
| cors | 2 | Control de orígenes cruzados |

### Base de datos
| Tecnología | Uso |
|---|---|
| MySQL | Motor relacional principal |

### Pasarela de pagos
| Tecnología | Uso |
|---|---|
| Izipay (LinkPro PaymentForm) | Procesamiento de pagos en soles (PEN) |

---

## Arquitectura

```
Certia/
├── frontend/          # React + Vite (SPA)
│   └── src/
│       ├── pages/     # Dashboard, Login, Register, PublicClaimBook, ...
│       ├── components/# Navbar, Hero, Pricing, Footer, ...
│       └── config/    # api.js — URL base del backend
│
├── backend/           # Node.js + Express (API REST)
│   └── src/
│       ├── app.js         # Entry point, middleware global, rutas
│       ├── config/db.js   # Pool MySQL
│       ├── routes/        # authRoutes, claimRoutes, planRoutes,
│       │                  # paymentRoutes, izipayRoutes
│       ├── controllers/   # Lógica de negocio por dominio
│       └── middlewares/   # verifyToken (JWT), uploadMiddleware (multer)
│
└── database/
    └── schema.sql     # Definición completa de tablas y seeds
```

---

## Modelo de datos

```sql
users       -- Empresas registradas: datos, RUC, logo, plan activo
claims      -- Reclamos recibidos: correlativo, seguimiento, archivos adjuntos
plans       -- Catálogo de planes: mensual (0), 1/2/3 años
payments    -- Historial de pagos: estado pendiente → aprobado via IPN
```

---

## Flujo de autenticación

```
POST /api/register  →  bcrypt hash  →  INSERT users
POST /api/login     →  bcrypt compare  →  JWT firmado (HS256)
Headers: Authorization: Bearer <token>  →  verifyToken middleware
```

---

## Flujo de reclamos (multi-empresa)

```
GET  /api/company-book/:slug   →  Identifica empresa por razon_social
POST /api/claims               →  Crea reclamo con correlativo único + PDF
GET  /api/claims/:id           →  Dashboard: reclamos pendientes / completados
PUT  /api/claims/:id/respond   →  Respuesta oficial + cambio de estado
```

Cada empresa tiene una URL y QR únicos generados desde el `razon_social` como slug.

---

## Flujo de pagos (Izipay)

```
1. POST /api/payments/create
   └── Registra pago pendiente en tabla payments (plan_duracion, monto)

2. POST /api/payments/create-order
   └── Llama a Izipay CreatePaymentOrder (Basic Auth)
   └── Devuelve paymentURL → frontend redirige al usuario

3. POST /api/payments/ipn  [llamado por Izipay, sin JWT]
   └── Lee vads_trans_status, vads_order_id, vads_trans_uuid
   └── Acepta: AUTHORISED | AUTHORISED_TO_VALIDATE | CAPTURED
   └── UPDATE payments SET estado = 'aprobado'
   └── UPDATE users SET plan_duracion, fecha_inicio_plan, fecha_fin_plan
       plan_duracion = 0  →  DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
       plan_duracion = N  →  DATE_ADD(CURDATE(), INTERVAL N YEAR)
```

---

## Planes disponibles

| Plan | `duracion_anios` | Precio |
|---|---|---|
| Plan Mensual | `0` | S/ 25 |
| Plan 1 Año | `1` | S/ 150 |
| Plan 2 Años | `2` | S/ 250 |
| Plan 3 Años | `3` | S/ 300 |

El acceso a la pestaña **Integración** del Dashboard se habilita únicamente cuando `fecha_fin_plan >= hoy`.

---

## Variables de entorno (backend)

El backend requiere un archivo `.env` en `backend/` con las credenciales de base de datos, JWT y pasarela de pagos. Este archivo **no se incluye en el repositorio** (`.gitignore`). Solicitar al administrador del proyecto.

---

## Instalación local

```bash
# Base de datos
mysql -u root -p < database/schema.sql

# Backend
cd backend
npm install
node src/app.js          # producción
node --watch src/app.js  # desarrollo

# Frontend
cd frontend
npm install
npm run dev              # dev server en localhost:5173
npm run build            # build para producción → dist/
```

---

## Deploy a producción

El frontend se compila con `npm run build` y el contenido de `dist/` se copia a `backend/public/`. Express sirve el `index.html` como fallback SPA para todas las rutas no-API.

```
backend/public/
├── index.html
└── assets/   ← JS y CSS compilados por Vite
```

---

## Seguridad aplicada

- Contraseñas hasheadas con **bcrypt** (nunca almacenadas en texto plano)
- Rutas privadas protegidas con **JWT** verificado en cada request
- IPN de Izipay recibe respuesta **HTTP 200** siempre (evita reintentos infinitos)
- Archivos subidos servidos desde `/uploads/` con rutas estáticas aisladas
- Variables sensibles en `.env` excluidas del repositorio
