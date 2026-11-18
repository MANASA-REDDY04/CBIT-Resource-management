# CBIT Resource Hub - Database Setup & Execution Guide

This document provides clear, step-by-step instructions for manually initializing and managing the PostgreSQL database for the **CBIT Resource Hub** institutional application.

---

## ⚠️ Important Architectural Rules

1. **Strictly Manual Execution**: No ORMs (SQLAlchemy, Prisma, Django ORM, etc.) and no migration frameworks (Alembic, Flyway, etc.) are used in this application.
2. **Schema Separation**: The FastAPI backend connects directly to PostgreSQL using **Psycopg 3** with raw parameterized SQL queries. The application assumes all tables, constraints, and indexes already exist.
3. **Never auto-create tables on startup**: Schema modifications must be performed by executing SQL scripts explicitly.

---

## 🌐 Configured Render Cloud Database (Singapore)

Your cloud PostgreSQL instance is provisioned on Render:

- **Host**: `dpg-dbrue28n74is738b8l10-a.singapore-postgres.render.com`
- **Database**: `cbit_resource_hub`
- **User**: `cbit_admin`
- **Port**: `5432`
- **SSL**: `require` (enabled)

### Connection Strings:
- **Internal (for Render Web Services)**:
  ```text
  postgresql://cbit_admin:tYCfXKmTyElLxk4DcVSU6RmnxKNbA29i@dpg-dbrue28n74is738b8l10-a/cbit_resource_hub
  ```
- **External (for Local Development & DB Clients)**:
  ```text
  postgresql://cbit_admin:tYCfXKmTyElLxk4DcVSU6RmnxKNbA29i@dpg-dbrue28n74is738b8l10-a.singapore-postgres.render.com/cbit_resource_hub?sslmode=require
  ```

---

## ⚡ Quick 1-Command Initialization (Python Runner)

If you don't have `psql` installed on Windows, execute the provided Python initializer:

```bash
# From project root
python database/init_cloud_db.py
```

This connects directly to your Render instance, executes `schema.sql`, `seed.sql`, and `admin_setup.sql`, and displays the created tables and accounts.

---

The database directory contains three core SQL files:

| File | Purpose |
| :--- | :--- |
| `schema.sql` | Contains all `CREATE TABLE`, `CREATE EXTENSION`, foreign keys, check constraints, and performance indexes. |
| `seed.sql` | Seeds initial CBIT departments, initial partner organisations, standard expertise categories/topics, and sample approved resource persons. |
| `admin_setup.sql` | Inserts the primary System Administrator account and sample accounts for all three user roles with backend-compatible password hashes. |

---

## 📋 Execution Order

The scripts **must** be executed in the following strict order:

1. `schema.sql`
2. `seed.sql`
3. `admin_setup.sql`

---

## 🚀 Execution Instructions

### Option 1: Using `psql` (Command Line)

If you have `psql` installed locally or have shell access to your PostgreSQL server / Render instance:

```bash
# 1. Connect and execute schema.sql
psql "<YOUR_POSTGRESQL_CONNECTION_STRING>" -f database/schema.sql

# 2. Seed initial data
psql "<YOUR_POSTGRESQL_CONNECTION_STRING>" -f database/seed.sql

# 3. Create Admin and role accounts
psql "<YOUR_POSTGRESQL_CONNECTION_STRING>" -f database/admin_setup.sql
```

Alternatively, if connecting interactively:

```bash
psql -h <host> -U <username> -d <database_name>
```

Then in the `psql` prompt:

```sql
\i /path/to/database/schema.sql
\i /path/to/database/seed.sql
\i /path/to/database/admin_setup.sql
```

---

### Option 2: Using pgAdmin, DBeaver, or VS Code Database Client

1. Open your database GUI client (e.g., **DBeaver**, **pgAdmin 4**, or **TablePlus**).
2. Connect to your PostgreSQL database.
3. Open a new SQL Query Editor.
4. Open `schema.sql`, copy all contents, paste into the editor, and click **Execute (Run All)**.
5. Open `seed.sql`, copy all contents, paste into the editor, and click **Execute (Run All)**.
6. Open `admin_setup.sql`, copy all contents, paste into the editor, and click **Execute (Run All)**.

---

### Option 3: Setting Up on Render PostgreSQL (Production)

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **PostgreSQL**.
3. Choose a Name (e.g. `cbit-resource-hub-db`), Database name, and region.
4. Once provisioned, locate the **External Database URL** (for remote execution) or use the **PSQL Command** provided in the Render dashboard.
5. Connect via terminal using the provided `psql` command:
   ```bash
   psql "<RENDER_EXTERNAL_DATABASE_URL>"
   ```
6. Paste the contents of `schema.sql`, followed by `seed.sql`, then `admin_setup.sql`.

---

## 🛡️ Default Accounts Seeded in `admin_setup.sql`

| Role | Email | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@cbit.ac.in` | `Admin@Cbit2025!` | Full System Access, User Management, Approvals, CRUD |
| **AUTHORISED_FACULTY** | `faculty@cbit.ac.in` | `Faculty@Cbit2025!` | Can submit resource persons, edit permitted records |
| **GENERAL_STAFF** | `staff@cbit.ac.in` | `Staff@Cbit2025!` | Directory search, view profiles, browse expertise |

> **Security Note for Production**: After logging in for the first time, immediately change the administrator password from the Admin Profile section or generate a fresh hash using the backend script:
> ```bash
> cd backend
> python -m app.utils.create_admin --email your_email@cbit.ac.in --password "YourStrongPassword"
> ```

---

## 🔍 Verifying the Database

Run this quick SQL query to verify that all tables were created properly:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- `approval_history`
- `audit_logs`
- `departments`
- `expertise`
- `organisations`
- `person_expertise`
- `person_organisations`
- `resource_persons`
- `user_sessions`
- `users`

