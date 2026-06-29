# Lumis Backend Application Service
## Built with Express, TypeScript, Prisma & PostgreSQL (pgvector)

This is the decoupled backend service folder for the Lumis Platform. Follow the instructions below to configure the database, initialize schemas, and launch the development server.

---

## 1. Quick Setup & Configuration

### Prerequisites
* **Node.js**: Version 18+ or 20+
* **PostgreSQL**: Local or hosted instance (with pgvector extensions enabled if vectorizing chunks)

### Installation
Run npm installs inside this directory:
```bash
cd backend
npm install
```

### Environment Setup
Create a `.env` file in the `backend/` root directory containing these parameters:
```env
# Database connection string matching PostgreSQL configs
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumis_db?schema=public"

# App Server Port
PORT=5000

# Secret JWT Key
JWT_SECRET="your_jwt_signing_secret_key"
```

---

## 2. Database Sync & Migrations

Sync schemas and generate the local Prisma Client binding classes:
```bash
# Generate Prisma Client models
npm run prisma:generate

# Execute migration setups
npm run prisma:migrate
```

---

## 3. Running Services

Start the development server with live-reloads:
```bash
npm run dev
```

*   **API Root URL**: `http://localhost:5000`
*   **Health Check Route**: `http://localhost:5000/health`
*   **Documentation routes**:
    *   Auth APIs: `/api/auth/login`, `/api/auth/register`, `/api/auth/verify-otp`
    *   Documents APIs: `/api/documents`, `/api/documents/:id/moderate`
    *   AI APIs: `/api/ai/chat`
