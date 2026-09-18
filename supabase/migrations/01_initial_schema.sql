-- ====================================================================
-- PEOPLEPULSE AI — MULTI-TENANT DATABASE SCHEMA (V1)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing if needed
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS action_recommendations CASCADE;
DROP TABLE IF EXISTS recurring_issues CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS ai_analysis CASCADE;
DROP TABLE IF EXISTS grievance_status_history CASCADE;
DROP TABLE IF EXISTS grievance_assignments CASCADE;
DROP TABLE IF EXISTS grievance_messages CASCADE;
DROP TABLE IF EXISTS grievances CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS employee_pulses CASCADE;
DROP TABLE IF EXISTS employee_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    employee_count_tier VARCHAR(50) DEFAULT '10-50',
    country VARCHAR(100) DEFAULT 'United States',
    timezone VARCHAR(100) DEFAULT 'UTC',
    k_anonymity_threshold INT DEFAULT 5,
    sla_settings JSONB DEFAULT '{"critical_hours": 12, "high_hours": 24, "medium_hours": 48, "low_hours": 96}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- 3. Roles (RBAC: Employee, HR, HR Admin, Org Admin, Super Admin)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for system-wide roles
    name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users (Maps to Auth Identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role_name VARCHAR(50) NOT NULL DEFAULT 'Employee', -- 'Employee', 'HR', 'HR_Admin', 'Org_Admin', 'Super_Admin'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- 5. Employee Profiles
CREATE TABLE employee_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(150),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    hire_date DATE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Employee Pulses (Daily/Weekly Mood Check-ins)
CREATE TABLE employee_pulses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    submitter_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL when is_anonymous = TRUE
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL, -- Stored for aggregation even if anonymous
    mood_score INT NOT NULL CHECK (mood_score BETWEEN 1 AND 5), -- 1: Very Low, 2: Low, 3: Okay, 4: Good, 5: Great
    mood_label VARCHAR(50) NOT NULL,
    category VARCHAR(100), -- Workload, Culture, Management, etc.
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    allow_hr_followup BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Feedback
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    submitter_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if anonymous
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'General Feedback', -- 'Praise', 'Suggestion', 'Concern', 'General Feedback'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Suggestions
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    submitter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact_area VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Submitted', -- 'Submitted', 'Under Review', 'Planned', 'Implemented', 'Archived'
    is_anonymous BOOLEAN DEFAULT FALSE,
    upvotes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Grievances (Case Management Core)
CREATE TABLE grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. PP-GR-2026-0042
    is_anonymous BOOLEAN DEFAULT FALSE,
    submitter_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Strictly NULL if is_anonymous = TRUE
    access_token_hash VARCHAR(255), -- Hashed passcode for anonymous two-way tracking
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_selected VARCHAR(100) NOT NULL,
    category_ai_suggested VARCHAR(100),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    incident_date DATE,
    severity_employee VARCHAR(50) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    severity_assessed VARCHAR(50),
    risk_level VARCHAR(50) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    has_safety_red_flag BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'New', -- 'New', 'Under Review', 'Awaiting Employee', 'Investigation', 'Action Required', 'Resolved', 'Closed', 'Escalated'
    priority VARCHAR(50) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    allow_hr_followup BOOLEAN DEFAULT TRUE,
    preferred_response_method VARCHAR(50) DEFAULT 'Platform Case Inbox',
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sla_due_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Grievance Messages (Two-Way Communication + HR Internal Notes)
CREATE TABLE grievance_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL, -- 'EMPLOYEE', 'HR', 'SYSTEM'
    sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous employee
    message_text TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT FALSE, -- CRITICAL: HR-only notes never shown to employee
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Grievance Assignments History
CREATE TABLE grievance_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Grievance Status History
CREATE TABLE grievance_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI Grievance Analysis
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    grievance_id UUID UNIQUE NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    sentiment_score NUMERIC(4,2), -- -1.0 to 1.0
    urgency VARCHAR(50), -- Low, Medium, High, Immediate
    risk_level VARCHAR(50), -- LOW, MEDIUM, HIGH, CRITICAL
    key_topics TEXT[],
    possible_policy_area VARCHAR(200),
    similar_issue_keywords TEXT[],
    recommended_hr_response TEXT,
    recommended_next_actions JSONB DEFAULT '[]'::jsonb,
    escalation_recommended BOOLEAN DEFAULT FALSE,
    reasoning_summary TEXT,
    model_version VARCHAR(50) DEFAULT 'gemini-1.5-pro',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Recurring Issues (Root-Cause Clusters)
CREATE TABLE recurring_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    topic_title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    issue_count INT DEFAULT 1,
    trend_direction VARCHAR(50) DEFAULT 'INCREASING', -- 'INCREASING', 'STABLE', 'DECREASING'
    sentiment_label VARCHAR(50) DEFAULT 'Negative',
    supporting_case_numbers TEXT[],
    first_detected_at TIMESTAMPTZ DEFAULT NOW(),
    last_detected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AI Insights (Morning Briefing & Proactive Signals)
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'CRITICAL_ALERT', 'EMERGING_SIGNAL', 'RECURRING_ISSUE', 'POSITIVE_SIGNAL'
    headline VARCHAR(255) NOT NULL,
    evidence_summary TEXT NOT NULL,
    confidence_score NUMERIC(3,2) DEFAULT 0.85,
    affected_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    recommended_action TEXT NOT NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Action Recommendations (Approved by HR)
CREATE TABLE action_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- 'Pulse Survey', 'Workload Review', 'Listening Session', 'Policy Update'
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Proposed', -- 'Proposed', 'Approved', 'In Progress', 'Completed', 'Dismissed'
    assigned_hr_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Audit Logs (Immutable Audit Trail)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL, -- 'CASE_CREATED', 'CASE_VIEWED', 'STATUS_CHANGED', 'NOTE_ADDED', etc.
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE AND TENANT ISOLATION
-- ====================================================================
CREATE INDEX idx_departments_org ON departments(organization_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_employee_profiles_org ON employee_profiles(organization_id);
CREATE INDEX idx_employee_pulses_org ON employee_pulses(organization_id, created_at DESC);
CREATE INDEX idx_employee_pulses_dept ON employee_pulses(department_id);
CREATE INDEX idx_grievances_org ON grievances(organization_id, status);
CREATE INDEX idx_grievances_case_num ON grievances(case_number);
CREATE INDEX idx_grievance_messages_case ON grievance_messages(grievance_id, created_at ASC);
CREATE INDEX idx_ai_insights_org ON ai_insights(organization_id, is_dismissed);
CREATE INDEX idx_recurring_issues_org ON recurring_issues(organization_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);
