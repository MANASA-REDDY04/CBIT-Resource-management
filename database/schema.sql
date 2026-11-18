-- ==============================================================================
-- CBIT RESOURCE HUB - DATABASE SCHEMA (PostgreSQL Native SQL)
-- Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_name VARCHAR(150) NOT NULL UNIQUE,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(department_code);

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE
-- ------------------------------------------------------------------------------
-- Roles: 'ADMIN', 'AUTHORISED_FACULTY', 'GENERAL_STAFF'
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'AUTHORISED_FACULTY', 'GENERAL_STAFF')),
    can_create_records BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit_records BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- ------------------------------------------------------------------------------
-- 3. USER SESSIONS TABLE (For Secure Database-Backed Session/Token Management)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- ------------------------------------------------------------------------------
-- 4. ORGANISATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_name VARCHAR(255) NOT NULL UNIQUE,
    organisation_type VARCHAR(100) NOT NULL DEFAULT 'Corporate', -- e.g., 'Corporate', 'Academic', 'Research Institute', 'Government', 'NGO'
    website VARCHAR(255),
    address TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organisations_name ON organisations(organisation_name);
CREATE INDEX IF NOT EXISTS idx_organisations_name_trgm ON organisations USING gin (organisation_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_organisations_type ON organisations(organisation_type);
CREATE INDEX IF NOT EXISTS idx_organisations_active ON organisations(is_active);

-- ------------------------------------------------------------------------------
-- 5. EXPERTISE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expertise_name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL, -- e.g., 'Artificial Intelligence', 'Software Engineering', 'VLSI & Embedded', 'Management'
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expertise_name ON expertise(expertise_name);
CREATE INDEX IF NOT EXISTS idx_expertise_name_trgm ON expertise USING gin (expertise_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_expertise_category ON expertise(category);
CREATE INDEX IF NOT EXISTS idx_expertise_active ON expertise(is_active);

-- ------------------------------------------------------------------------------
-- 6. RESOURCE PERSONS TABLE
-- ------------------------------------------------------------------------------
-- Approval statuses: 'PENDING', 'APPROVED', 'REJECTED'
CREATE TABLE IF NOT EXISTS resource_persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(30) NOT NULL,
    address TEXT,
    professional_biography TEXT,
    professional_profile_url VARCHAR(255),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rp_approval_status ON resource_persons(approval_status);
CREATE INDEX IF NOT EXISTS idx_rp_full_name ON resource_persons(full_name);
CREATE INDEX IF NOT EXISTS idx_rp_full_name_trgm ON resource_persons USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_rp_designation_trgm ON resource_persons USING gin (designation gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_rp_email ON resource_persons(email);
CREATE INDEX IF NOT EXISTS idx_rp_mobile ON resource_persons(mobile_number);
CREATE INDEX IF NOT EXISTS idx_rp_created_by ON resource_persons(created_by);
CREATE INDEX IF NOT EXISTS idx_rp_created_at ON resource_persons(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. PERSON ORGANISATIONS TABLE (Historical & Current associations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS person_organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_person_id UUID NOT NULL REFERENCES resource_persons(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE RESTRICT,
    designation VARCHAR(150) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_person_org_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_po_resource_person ON person_organisations(resource_person_id);
CREATE INDEX IF NOT EXISTS idx_po_organisation ON person_organisations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_po_is_current ON person_organisations(is_current);

-- ------------------------------------------------------------------------------
-- 8. PERSON EXPERTISE TABLE (Many-to-Many association)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS person_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_person_id UUID NOT NULL REFERENCES resource_persons(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_person_expertise UNIQUE (resource_person_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_pe_resource_person ON person_expertise(resource_person_id);
CREATE INDEX IF NOT EXISTS idx_pe_expertise ON person_expertise(expertise_id);

-- ------------------------------------------------------------------------------
-- 9. APPROVAL HISTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_person_id UUID NOT NULL REFERENCES resource_persons(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'UPDATED')),
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approval_history_rp ON approval_history(resource_person_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_created_at ON approval_history(created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

