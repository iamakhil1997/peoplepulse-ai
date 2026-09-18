-- ====================================================================
-- PEOPLEPULSE AI — AUTOMATION, TRIGGERS & ANONYMOUS TRACKING RPC
-- ====================================================================

-- 1. Automatic Case Number Generation Sequence
CREATE SEQUENCE IF NOT EXISTS grievance_case_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT;
    seq_val INT;
BEGIN
    IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
        current_yr := to_char(NOW(), 'YYYY');
        seq_val := nextval('grievance_case_seq');
        NEW.case_number := 'PP-GR-' || current_yr || '-' || LPAD(seq_val::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_case_number
BEFORE INSERT ON grievances
FOR EACH ROW
EXECUTE FUNCTION generate_case_number();

-- 2. Automatic SLA Due Date Calculator
CREATE OR REPLACE FUNCTION calculate_grievance_sla()
RETURNS TRIGGER AS $$
DECLARE
    sla_hours INT := 48; -- default medium
BEGIN
    IF NEW.sla_due_at IS NULL THEN
        IF NEW.severity_employee = 'Critical' OR NEW.priority = 'Critical' OR NEW.risk_level = 'CRITICAL' THEN
            sla_hours := 12;
        ELSIF NEW.severity_employee = 'High' OR NEW.priority = 'High' OR NEW.risk_level = 'HIGH' THEN
            sla_hours := 24;
        ELSIF NEW.severity_employee = 'Low' OR NEW.priority = 'Low' OR NEW.risk_level = 'LOW' THEN
            sla_hours := 96;
        ELSE
            sla_hours := 48;
        END IF;
        NEW.sla_due_at := NOW() + (sla_hours || ' hours')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_grievance_sla
BEFORE INSERT ON grievances
FOR EACH ROW
EXECUTE FUNCTION calculate_grievance_sla();

-- 3. Anonymous Case Verification RPC (Zero-Knowledge Lookup)
-- This function allows an anonymous employee with a valid case_number and raw passcode
-- to read their case and conversation history without authenticating or exposing identity.
CREATE OR REPLACE FUNCTION verify_and_get_anonymous_grievance(
    p_case_number VARCHAR,
    p_access_token VARCHAR
)
RETURNS JSONB AS $$
DECLARE
    v_grievance RECORD;
    v_messages JSONB;
    v_is_valid BOOLEAN := FALSE;
BEGIN
    -- Fetch grievance by case number
    SELECT * INTO v_grievance 
    FROM grievances 
    WHERE case_number = p_case_number AND is_anonymous = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Case not found or invalid token.');
    END IF;

    -- Verify token hash using crypt
    -- Note: Passcodes are stored hashed with pgcrypto crypt()
    IF v_grievance.access_token_hash IS NOT NULL AND 
       (v_grievance.access_token_hash = crypt(p_access_token, v_grievance.access_token_hash) OR v_grievance.access_token_hash = p_access_token) THEN
        v_is_valid := TRUE;
    END IF;

    IF NOT v_is_valid THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid access token for this case.');
    END IF;

    -- Fetch conversation history (strictly excluding internal HR notes)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'sender_role', m.sender_role,
            'message_text', m.message_text,
            'created_at', m.created_at,
            'attachments', m.attachments
        ) ORDER BY m.created_at ASC
    ), '[]'::jsonb) INTO v_messages
    FROM grievance_messages m
    WHERE m.grievance_id = v_grievance.id AND m.is_internal_note = FALSE;

    -- Return safe public case payload
    RETURN jsonb_build_object(
        'success', true,
        'case', jsonb_build_object(
            'id', v_grievance.id,
            'case_number', v_grievance.case_number,
            'title', v_grievance.title,
            'description', v_grievance.description,
            'category_selected', v_grievance.category_selected,
            'status', v_grievance.status,
            'severity_employee', v_grievance.severity_employee,
            'created_at', v_grievance.created_at,
            'sla_due_at', v_grievance.sla_due_at,
            'allow_hr_followup', v_grievance.allow_hr_followup
        ),
        'messages', v_messages
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
