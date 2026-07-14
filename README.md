# 🚀 Certia

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-black)
![REST API](https://img.shields.io/badge/API-REST-success)
![SaaS](https://img.shields.io/badge/Architecture-SaaS-blue)

## SaaS Platform for Peru's Digital Complaint Book

Production-ready SaaS platform designed to help companies comply with Peru's Digital Complaint Book regulations. The platform provides multi-company management, secure authentication, online payment processing, PDF generation, QR code generation, and a complete complaint management workflow.

---

# 👨‍💻 My Role

I designed and developed the platform end-to-end, including:

- Backend architecture
- REST API development
- Frontend development
- Database modeling
- Authentication & Authorization
- Payment Gateway integration
- PDF generation
- Deployment
- Production support

---

# ✨ Key Features

- Multi-tenant SaaS architecture
- Company management
- JWT Authentication
- RESTful API
- Complaint tracking
- PDF generation
- QR Code generation
- Online payment integration
- Dashboard & Analytics
- Subscription plans
- File uploads
- Responsive interface
- Secure authentication
- Role-based access

---

# 🛠 Tech Stack

## Frontend

| Technology | Version | Purpose |
|------------|----------|---------|
| React | 19 | User Interface |
| Vite | 8 | Build Tool |
| React Router DOM | 7 | SPA Routing |
| qrcode.react | 4 | QR Code generation |
| react-datepicker | 9 | Date filters |
| date-fns | 4 | Date utilities |

---

## Backend

| Technology | Version | Purpose |
|------------|----------|---------|
| Node.js | Latest | Runtime |
| Express | 5 | REST API |
| mysql2/promise | 3 | Database Access |
| jsonwebtoken | 9 | JWT Authentication |
| bcrypt | 6 | Password Hashing |
| multer | 2 | File Upload |
| axios | 1 | HTTP Requests |
| dotenv | 17 | Environment Variables |
| cors | 2 | Cross-Origin Requests |

---

## Database

- MySQL

---

## Payment Gateway

- Izipay LinkPro PaymentForm

---

# 🏗 Architecture

```text
                 React + Vite
                      │
                      ▼
              Express REST API
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     MySQL        JWT Auth      File Uploads
        │
        ▼
 Payment Management (Izipay)
        │
        ▼
   PDF Generation
```

---

# 📂 Project Structure

```text
Certia/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── config/
│   │   └── assets/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│
└── database/
    └── schema.sql
```

---

# 🗄 Database Model

The platform follows a multi-tenant architecture where each registered company manages its own complaint book independently.

| Entity | Description |
|---------|-------------|
| users | Registered companies, credentials, subscription and profile information |
| claims | Customer complaints, tracking information and attachments |
| plans | Available subscription plans |
| payments | Payment history and subscription status |

---

# 🔐 Authentication Flow

```text
User Registration
        │
        ▼
Password Hashing (bcrypt)
        │
        ▼
Store User
        │
        ▼
Login
        │
        ▼
JWT Token Generation
        │
        ▼
Protected REST API
        │
        ▼
JWT Verification Middleware
```

Authentication is implemented using JSON Web Tokens (JWT), allowing secure and stateless communication between the frontend and backend.

---

# 📑 Complaint Management Workflow

```text
Company Registration
        │
        ▼
Complaint Book Generation
        │
        ▼
Unique QR Code Generated
        │
        ▼
Customer Submits Complaint
        │
        ▼
Claim Stored in Database
        │
        ▼
Automatic PDF Generation
        │
        ▼
Company Reviews Claim
        │
        ▼
Official Response
```

Each company has its own complaint book accessible through a unique URL and QR code.

---

# 💳 Payment Workflow

The application integrates with **Izipay LinkPro PaymentForm**.

```text
Customer selects a subscription plan
                │
                ▼
Create Payment Record
                │
                ▼
Generate Payment Order (Izipay)
                │
                ▼
Redirect Customer to Checkout
                │
                ▼
Payment Completed
                │
                ▼
Izipay sends IPN Notification
                │
                ▼
Subscription Activated
```

After a successful payment:

- Payment status is updated.
- Subscription period is activated.
- Company gains access to premium features.
- Expiration dates are automatically calculated.

---

# 📡 REST API

Main endpoints implemented:

## Authentication

```http
POST /api/register
POST /api/login
```

---

## Companies

```http
GET /api/company-book/:slug
```

---

## Claims

```http
POST /api/claims
GET /api/claims/:id
PUT /api/claims/:id/respond
```

---

## Payments

```http
POST /api/payments/create
POST /api/payments/create-order
POST /api/payments/ipn
```

---

## Plans

```http
GET /api/plans
```

---

# 📄 PDF Generation

Every submitted complaint automatically generates a PDF document containing:

- Complaint information
- Customer information
- Company information
- Tracking number
- Submission date

This document is stored for future reference and compliance purposes.

---

# 📁 File Uploads

The platform supports secure file uploads using Multer.

Supported use cases include:

- Evidence attachments
- Images
- Documents

Uploaded files are isolated from the application logic and served through dedicated static routes.

---

# 🔑 Multi-Tenant Design

Each company operates independently.

The application automatically isolates:

- Users
- Claims
- Payments
- Plans
- QR Codes
- Complaint Books

This allows multiple companies to use the same platform securely.

---

# ⚙ Business Logic

The platform automatically handles:

- Subscription activation
- Subscription expiration
- Complaint numbering
- QR generation
- PDF generation
- Payment validation
- Authentication
- Authorization

This significantly reduces manual administrative work for companies.

---

# 🔒 Security

Security was considered from the beginning of the project.

Implemented security mechanisms include:

- JWT Authentication
- Password hashing using bcrypt
- Protected API routes
- Environment variables isolation
- Secure payment validation
- CORS configuration
- Input validation
- Secure file upload handling
- Authentication middleware
- Stateless sessions

Sensitive credentials are never stored inside the repository.

---

# ⚙ Environment Variables

The backend requires a `.env` file containing:

```env
PORT=

DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=

IZIPAY_USERNAME=
IZIPAY_PASSWORD=
IZIPAY_PUBLIC_KEY=
IZIPAY_PRIVATE_KEY=
```

The `.env` file is excluded from version control using `.gitignore`.

---

# 🚀 Local Installation

## Clone repository

```bash
git clone https://github.com/fabtorrico/Proyecto_Web.git
```

---

## Database

```bash
mysql -u root -p < database/schema.sql
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

or

```bash
node src/app.js
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Production build

```bash
npm run build
```

---

# 🌍 Production Deployment

The production deployment follows this workflow:

```text
React + Vite
      │
      ▼
Build (dist/)
      │
      ▼
Express Public Folder
      │
      ▼
Production Server
```

Express serves the compiled React application while exposing REST API endpoints.

---

# 📈 Project Highlights

- Production-ready SaaS
- Multi-tenant architecture
- REST API
- JWT Authentication
- Payment Gateway Integration
- QR Code Generation
- Automatic PDF Generation
- Subscription Management
- Responsive UI
- Secure Backend
- Complete Full Stack Architecture

---

# 💡 Challenges Solved

During the development of Certia, several engineering challenges were addressed:

- Designing a scalable multi-tenant architecture.
- Implementing secure JWT authentication.
- Integrating an external payment gateway (Izipay).
- Automatically generating complaint PDFs.
- Managing subscription plans and expiration dates.
- Designing a maintainable REST API.
- Building a responsive frontend with React.
- Creating reusable backend architecture.

---

# 📚 Lessons Learned

Developing Certia significantly improved my understanding of:

- Full Stack Architecture
- Backend Engineering
- REST API Design
- Authentication & Authorization
- SaaS Product Development
- Payment Gateway Integrations
- Database Design
- Production Deployment
- Software Scalability
- Product Thinking

---

# 🔮 Future Improvements

Potential future enhancements include:

- Docker support
- Kubernetes deployment
- CI/CD pipeline
- Automated testing
- Role-based permissions
- Email notifications
- Multi-language support
- Analytics Dashboard
- AI-powered complaint classification
- Cloud deployment (AWS)

---

# 👨‍💻 About This Project

Certia was developed as a complete SaaS solution focused on solving a real business problem.

The project allowed me to design and implement every major component of a production application, from frontend development to backend architecture, authentication, database modeling, payment integration, deployment, and product design.

Building Certia strengthened both my software engineering skills and my product mindset by requiring technical decisions that balanced scalability, maintainability, security, and user experience.

---

# ⭐ If you found this project interesting, feel free to star the repository.