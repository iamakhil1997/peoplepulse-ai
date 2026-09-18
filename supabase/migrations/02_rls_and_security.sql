-- ====================================================================
-- PEOPLEPULSE AI — ROW LEVEL SECURITY & ANONYMOUS VERIFICATION
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_pulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get current authenticated user's organization_id
CREATE OR REPLACE FUNCTION get_auth_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function: Get current authenticated user's role_name
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS VARCHAR AS $$
    SELECT role_name FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ====================================================================
-- POLICIES BY TABLE
-- ====================================================================

-- 1. Organizations
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id = get_auth_user_org_id());

CREATE POLICY "Org Admins can update their organization"
    ON organizations FOR UPDATE
    USING (id = get_auth_user_org_id() AND get_auth_user_role() IN ('Org_Admin', 'Super_Admin'));

-- 2. Departments
CREATE POLICY "Users can view departments in their org"
    ON departments FOR SELECT
    USING (organization_id = get_auth_user_org_id());

CREATE POLICY "Admins can manage departments in their org"
    ON departments FOR ALL
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR_Admin', 'Org_Admin', 'Super_Admin'));

-- 3. Users & Profiles
CREATE POLICY "Users can view users in same org"
    ON users FOR SELECT
    USING (organization_id = get_auth_user_org_id());

CREATE POLICY "Users can view profiles in same org"
    ON employee_profiles FOR SELECT
    USING (organization_id = get_auth_user_org_id());

CREATE POLICY "Employees can update their own profile"
    ON employee_profiles FOR UPDATE
    USING (user_id = auth.uid());

-- 4. Employee Pulses (Privacy Guarded)
CREATE POLICY "Employees can insert their own pulse"
    ON employee_pulses FOR INSERT
    WITH CHECK (organization_id = get_auth_user_org_id());

CREATE POLICY "Employees can view their own identified pulses"
    ON employee_pulses FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND submitter_id = auth.uid());

CREATE POLICY "HR can view aggregated or permitted pulses in org"
    ON employee_pulses FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin', 'Super_Admin'));

-- 5. Feedback & Suggestions
CREATE POLICY "Users can view feedback in their org"
    ON feedback FOR SELECT
    USING (organization_id = get_auth_user_org_id());

CREATE POLICY "Users can insert feedback in their org"
    ON feedback FOR INSERT
    WITH CHECK (organization_id = get_auth_user_org_id());

CREATE POLICY "Users can view suggestions in their org"
    ON suggestions FOR SELECT
    USING (organization_id = get_auth_user_org_id());

CREATE POLICY "Users can insert suggestions in their org"
    ON suggestions FOR INSERT
    WITH CHECK (organization_id = get_auth_user_org_id());

-- 6. Grievances (Confidential Access)
CREATE POLICY "Employees can view their own non-anonymous grievances"
    ON grievances FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND submitter_id = auth.uid());

CREATE POLICY "HR and Admins can view all grievances in org"
    ON grievances FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin'));

CREATE POLICY "Employees can submit grievances"
    ON grievances FOR INSERT
    WITH CHECK (organization_id = get_auth_user_org_id());

CREATE POLICY "HR can update grievances in org"
    ON grievances FOR UPDATE
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin'));

-- 7. Grievance Messages (INTERNAL NOTES STRICT SECLUSION)
CREATE POLICY "HR can view all messages including internal notes in org"
    ON grievance_messages FOR SELECT
    USING (
        organization_id = get_auth_user_org_id() 
        AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin')
    );

CREATE POLICY "Employees can view only non-internal messages of own grievance"
    ON grievance_messages FOR SELECT
    USING (
        organization_id = get_auth_user_org_id()
        AND is_internal_note = FALSE
        AND EXISTS (
            SELECT 1 FROM grievances g 
            WHERE g.id = grievance_id AND g.submitter_id = auth.uid()
        )
    );

CREATE POLICY "HR and Employees can insert messages"
    ON grievance_messages FOR INSERT
    WITH CHECK (organization_id = get_auth_user_org_id());

-- 8. AI Insights, Recurring Issues & Analytics
CREATE POLICY "HR can view AI insights in org"
    ON ai_insights FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin'));

CREATE POLICY "HR can view recurring issues in org"
    ON recurring_issues FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin'));

CREATE POLICY "HR can view AI analysis for grievances in org"
    ON ai_analysis FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin'));

CREATE POLICY "HR can view and manage action recommendations in org"
    ON action_recommendations FOR ALL
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR', 'HR_Admin', 'Org_Admin'));

-- 9. Audit Logs
CREATE POLICY "HR Admins can view audit logs in org"
    ON audit_logs FOR SELECT
    USING (organization_id = get_auth_user_org_id() AND get_auth_user_role() IN ('HR_Admin', 'Org_Admin', 'Super_Admin'));
