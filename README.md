# CBIT Resource Hub

**CBIT Resource Hub** is a centralized, production-ready institutional web application designed for **Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad**, to maintain, retrieve, and govern records of external resource persons, guest faculty, industry specialists, and partner organisations.

Built with an enterprise architecture utilizing **Next.js (React + TypeScript)** on the frontend, **FastAPI (Python)** on the backend, and **native PostgreSQL** via **Psycopg 3 with parameterized raw SQL queries** (no ORMs, no migration frameworks, and no Docker).

---

## 🏛️ Key Features & Capabilities

- **Institutional Identity & Role-Based Access Control (RBAC)**:
  - **Admin**: Full platform control, dashboard metrics, staff account administration, profile approval/rejection workflows, organisation & expertise master managers, audit logs.
  - **Authorised Faculty**: Profile creation and submission into administrative review queue, historical organisation mapping, expertise tagging, tracking of personal submissions.
  - **General College Staff**: Search verified directory, browse partner companies, explore research expertise topics, and view contact details.
- **PostgreSQL-Powered Multi-Filter Search**:
  - Raw SQL parameterized queries matching across: Full Name, Organisation, Expertise, Designation, Location / Address, Email, and Mobile number.
  - Case-insensitive `ILIKE` partial matching, pagination, and sorting.
  - Directory strictly returns approved profiles for general staff.
- **Organisation Association History**:
  - Full relational mapping between resource persons and companies/academic institutes.
  - Preserves employment history (current vs past associations, start and end dates).
- **Administrative Approval Workflow**:
  - Submissions from faculty default to `PENDING` status.
  - 1-click Approval or Rejection with mandatory recorded rejection reasons.
- **Production-Ready Render Deployment**:
  - Native Render Web Services for Next.js and FastAPI with Render PostgreSQL.
  - Zero container overhead, fully native runtime configuration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Axios, TanStack Query v5, Zustand, React Hook Form, Zod, Lucide React |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, Psycopg 3 (`psycopg[binary,pool]`), PyJWT, Bcrypt, Raw Parameterized SQL |
| **Database** | PostgreSQL 14+, Native SQL, Parameterized Queries, Connection Pooling |
| **Deployment** | Render Native Web Services (No Docker), Render Managed PostgreSQL |

---

## 📂 Project Structure

```text
cbit-resource-hub/
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── approvals/page.tsx      # Tabbed profile review workflow
│   │   │   ├── departments/page.tsx    # College department manager
│   │   │   ├── expertise/page.tsx      # Topic classifications manager
│   │   │   ├── organisations/page.tsx  # Partner entities manager
│   │   │   └── users/page.tsx          # Staff accounts & permissions
│   │   ├── dashboard/page.tsx          # Real-time DB statistics & feeds
│   │   ├── expertise/page.tsx          # Expertise topic directory & modal
│   │   ├── login/page.tsx              # Institutional SSO sign-in
│   │   ├── organisations/
│   │   │   ├── [id]/page.tsx           # Company detail & associated persons
│   │   │   └── page.tsx                # Organisation directory
│   │   ├── profile/page.tsx            # Staff credentials & permissions
│   │   ├── resource-persons/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/page.tsx       # Safe profile editor
│   │   │   │   └── page.tsx            # Full candidate profile
│   │   │   ├── my-submissions/page.tsx # Faculty submission queue tracker
│   │   │   ├── new/page.tsx            # Multi-association submission form
│   │   │   └── page.tsx                # Multi-filter search directory
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/                     # Sidebar, Header, AppLayout
│   │   └── ui/                         # Button, Input, Modal, Select, Badge, Card, Pagination
│   ├── lib/                            # api.ts (Axios), utils.ts
│   ├── schemas/                        # Zod validation schemas
│   ├── stores/                         # Zustand authentication store
│   └── types/                          # TypeScript contracts
│
├── backend/
│   ├── app/
│   │   ├── api/v1/                     # Auth, Dashboard, Resource Persons, Organisations, Expertise, Departments, Admin
│   │   ├── core/                       # Database (Psycopg3 Pool), Security (Bcrypt/JWT), Config
│   │   ├── dependencies/               # RBAC & token injection
│   │   ├── repositories/               # Raw parameterized SQL repository modules
│   │   ├── schemas/                    # Pydantic v2 schemas
│   │   ├── utils/                      # create_admin CLI utility
│   │   └── main.py                     # FastAPI application setup & CORS
│   ├── tests/                          # Backend security & validation tests
│   └── requirements.txt
│
├── database/
│   ├── schema.sql                      # Native DDL: tables, indexes, UUIDs, constraints
│   ├── seed.sql                        # Initial departments, organisations, expertise, test data
│   ├── admin_setup.sql                 # Admin & staff credentials with backend-hashed passwords
│   └── README.md                       # Manual execution guide
│
├── render.yaml                         # Render Native Services Blueprint
├── .gitignore
└── README.md
```

---

## 🗄️ Database Setup (Manual Execution)

As per the strict architectural specification, database management is manual. Connect to your PostgreSQL database and execute the scripts in the following order:

```bash
# 1. Execute Schema (Tables, Indexes, UUID Extension, Constraints)
psql "<POSTGRESQL_CONNECTION_STRING>" -f database/schema.sql

# 2. Execute Seed Data (Departments, Initial Partner Companies, Topics)
psql "<POSTGRESQL_CONNECTION_STRING>" -f database/seed.sql

# 3. Create Admin & Test Accounts
psql "<POSTGRESQL_CONNECTION_STRING>" -f database/admin_setup.sql
```

Refer to [`database/README.md`](database/README.md) for detailed instructions with GUI tools (pgAdmin, DBeaver) and Render PostgreSQL.

---

## 🔑 Default Institutional Evaluation Credentials

The initial accounts seeded via `database/admin_setup.sql`:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@cbit.ac.in` | `Admin@Cbit2025!` | Full System Access, Approvals, Staff Administration, Master Data |
| **Authorised Faculty** | `faculty@cbit.ac.in` | `Faculty@Cbit2025!` | Search Directory, Submit Resource Persons (Pending), Track Submissions |
| **General Staff** | `staff@cbit.ac.in` | `Staff@Cbit2025!` | Search Approved Profiles, Browse Organisations & Expertise |

---

## 💻 Local Development Setup

### 1. Backend (FastAPI + Psycopg 3)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and adjust DATABASE_URL
cp .env.example .env

# Run FastAPI backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI OpenAPI Interactive Documentation will be available at:
`http://localhost:8000/docs`

### 2. Frontend (Next.js + Tailwind CSS)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Run Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🚀 Render Deployment Guide (Native Services, No Docker)

Follow this deployment sequence to launch CBIT Resource Hub on **Render**:

### Step 1: Push Repository to GitHub
Push this codebase to your GitHub account repository.

### Step 2: Provision Render PostgreSQL
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **PostgreSQL**.
3. Name: `cbit-resource-hub-db`.
4. Region: Choose your preferred region (e.g. `Oregon`).
5. Plan: `Free`.
6. Once provisioned, copy the **Internal Database URL** (for backend) and **External Database URL** (for manual setup).

### Step 3: Initialize Database Manually
Connect using `psql` or DBeaver using the External Database URL:
```bash
psql "<RENDER_EXTERNAL_DATABASE_URL>" -f database/schema.sql
psql "<RENDER_EXTERNAL_DATABASE_URL>" -f database/seed.sql
psql "<RENDER_EXTERNAL_DATABASE_URL>" -f database/admin_setup.sql
```

### Step 4: Deploy FastAPI Backend Web Service
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `cbit-resource-hub-api`
   - **Environment**: `Python`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `DATABASE_URL`: *(Paste Internal Database URL from Step 2)*
   - `SECRET_KEY`: *(Generate a secure 32+ character random secret)*
   - `APP_ENV`: `production`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
   - `COOKIE_SECURE`: `true`
   - `COOKIE_SAMESITE`: `none`
   - `FRONTEND_URL`: `https://cbit-resource-hub-web.onrender.com` *(Your frontend URL)*
5. Click **Create Web Service**. Note the deployed URL (e.g. `https://cbit-resource-hub-api.onrender.com`).

### Step 5: Deploy Next.js Frontend Web Service
1. Click **New +** > **Web Service**.
2. Connect the same repository.
3. Configure settings:
   - **Name**: `cbit-resource-hub-web`
   - **Environment**: `Node`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://cbit-resource-hub-api.onrender.com` *(Backend URL from Step 4)*
5. Click **Create Web Service**.

Alternatively, you can utilize the included [`render.yaml`](render.yaml) Blueprint to auto-provision all services with 1-click in the Render Blueprints section.

---

## 🔒 Security Architecture

- **Password Hashing**: Bcrypt with salted rounds generated by the backend.
- **Session Protection**: Dual protection through signed JWT tokens and HTTP-only cookies (`SameSite=Lax/None` and `Secure=True` in production).
- **SQL Injection Prevention**: 100% of SQL operations are parameterized via Psycopg 3 tuple bindings.
- **Backend Role Verification**: All role authorizations and record permissions are enforced strictly at the FastAPI middleware/dependency layer.

