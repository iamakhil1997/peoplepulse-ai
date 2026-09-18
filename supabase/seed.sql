-- ====================================================================
-- PEOPLEPULSE AI — REALISTIC NORTHSTAR TECHNOLOGIES SEED DATA
-- ====================================================================

-- 1. Organization: Northstar Technologies
INSERT INTO organizations (
    id, name, slug, industry, employee_count_tier, country, timezone, k_anonymity_threshold, sla_settings
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Northstar Technologies',
    'northstar-tech',
    'Enterprise Cloud Software',
    '50-250',
    'United States',
    'America/New_York',
    5,
    '{"critical_hours": 12, "high_hours": 24, "medium_hours": 48, "low_hours": 96}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Departments
INSERT INTO departments (id, organization_id, name, code) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Engineering', 'ENG'),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Sales', 'SAL'),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Operations', 'OPS'),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'People & HR', 'HR'),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Finance', 'FIN'),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'Customer Support', 'SUP')
ON CONFLICT (id) DO NOTHING;

-- 3. Roles
INSERT INTO roles (id, organization_id, name, description, is_system_role) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'Employee', 'Standard employee with voice and grievance tracking capabilities', TRUE),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'HR', 'People partner with case management and sentiment access', TRUE),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'HR_Admin', 'Senior HR leadership with full organization intelligence and configuration access', TRUE),
('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'Org_Admin', 'Company administrator for org setup and employee roster management', TRUE),
('00000000-0000-0000-0002-000000000005', NULL, 'Super_Admin', 'Platform administrator', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Users (Demo Accounts)
INSERT INTO users (id, organization_id, email, role_name) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'alex.morgan@northstar.demo', 'HR_Admin'),
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'sarah.chen@northstar.demo', 'HR'),
('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 'david.ross@northstar.demo', 'Org_Admin'),
('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'marcus.vance@northstar.demo', 'Employee'),
('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 'elena.rostova@northstar.demo', 'Employee'),
('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000001', 'priya.patel@northstar.demo', 'Employee'),
('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000001', 'jordan.lee@northstar.demo', 'Employee')
ON CONFLICT (id) DO NOTHING;

-- 5. Employee Profiles
INSERT INTO employee_profiles (id, organization_id, user_id, first_name, last_name, job_title, department_id, hire_date) VALUES
('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000001', 'Alex', 'Morgan', 'Head of People & Culture', '00000000-0000-0000-0001-000000000004', '2023-01-15'),
('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000002', 'Sarah', 'Chen', 'Senior People Partner', '00000000-0000-0000-0001-000000000004', '2023-06-01'),
('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000003', 'David', 'Ross', 'VP Operations & Admin', '00000000-0000-0000-0001-000000000003', '2022-03-10'),
('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000004', 'Marcus', 'Vance', 'Senior Backend Engineer', '00000000-0000-0000-0001-000000000001', '2023-09-18'),
('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000005', 'Elena', 'Rostova', 'Operations Lead', '00000000-0000-0000-0001-000000000003', '2022-11-05'),
('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000006', 'Priya', 'Patel', 'Customer Support Specialist', '00000000-0000-0000-0001-000000000006', '2024-02-01'),
('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000007', 'Jordan', 'Lee', 'Account Executive', '00000000-0000-0000-0001-000000000002', '2023-04-12')
ON CONFLICT (id) DO NOTHING;

-- 6. Historical Employee Pulses (Generating realistic trends)
INSERT INTO employee_pulses (organization_id, submitter_id, department_id, mood_score, mood_label, category, comment, is_anonymous, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0001-000000000001', 5, 'Great', 'Engineering', 'Great sprint planning session today. Team alignment feels very crisp!', FALSE, NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000001', NULL, '00000000-0000-0000-0001-000000000003', 2, 'Low', 'Workload', 'Consistently logging 12+ hour shifts this week due to understaffed queue.', TRUE, NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000001', NULL, '00000000-0000-0000-0001-000000000003', 1, 'Very Low', 'Workload', 'Weekend on-call escalation without comp time is leading to severe burnout.', TRUE, NOW() - INTERVAL '3 days'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000006', 4, 'Good', 'Culture', 'Appreciated the recognition in the team all-hands.', FALSE, NOW() - INTERVAL '4 days'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0001-000000000002', 3, 'Okay', 'Compensation', 'Pipeline is strong, but commission tiers remain ambiguous.', FALSE, NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0000-000000000001', NULL, '00000000-0000-0000-0001-000000000001', 5, 'Great', 'Career Growth', 'Super excited about the new microservices architecture migration.', TRUE, NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000001', NULL, '00000000-0000-0000-0001-000000000003', 2, 'Low', 'Management', 'Communication from shift leads has been very reactive.', TRUE, NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0001-000000000001', 4, 'Good', 'Culture', 'Solid progress on the tech debt sprint.', FALSE, NOW() - INTERVAL '8 days');

-- 7. Feedback & Suggestions
INSERT INTO feedback (organization_id, submitter_id, department_id, type, title, content, is_anonymous) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0001-000000000001', 'Praise', 'Kudos to the DevOps Team', 'The recent CI/CD deployment pipeline upgrade cut our build times by 60%. Huge win!', FALSE),
('00000000-0000-0000-0000-000000000001', NULL, '00000000-0000-0000-0001-000000000003', 'Concern', 'Operations Staffing Levels', 'We have seen 3 resignations in logistics without backfill, leading to double shift burdens.', TRUE);

INSERT INTO suggestions (organization_id, submitter_id, department_id, title, description, impact_area, status) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000006', 'Async Standups for Support Staff', 'Replacing our 8:30 AM mandatory video sync with a Slack async check-in would allow us to cover early morning EMEA tickets.', 'Productivity', 'Under Review');

-- 8. Grievances (Key Demo Cases)
INSERT INTO grievances (
    id, organization_id, case_number, is_anonymous, submitter_id, access_token_hash,
    title, description, category_selected, category_ai_suggested, department_id,
    severity_employee, risk_level, has_safety_red_flag, status, priority,
    assigned_to_user_id, sla_due_at, created_at
) VALUES
(
    '00000000-0000-0000-0005-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'PP-GR-2026-1001',
    TRUE,
    NULL, -- Strictly NULL for anonymity
    '$2a$10$w8T0M9tH0wXqA1gE4mI.Le2q7a6T8Zf3e0V2Q7K1p0N9U8Y7X6W5V', -- Hashed passcode for demo tracking
    'Repeated mandatory unlogged overtime in Operations shift',
    'For the third consecutive week, the evening operations lead has instructed the team to stay 2-3 hours past scheduled shift without logging overtime hours in the system. When questioned, we were told it is part of "meeting deliverables" and questioning it would impact performance reviews.',
    'Workload',
    'Policy & Overtime Compliance',
    '00000000-0000-0000-0001-000000000003',
    'Critical',
    'HIGH',
    FALSE,
    'Investigation',
    'Critical',
    '00000000-0000-0000-0003-000000000001',
    NOW() + INTERVAL '8 hours',
    NOW() - INTERVAL '1 day'
),
(
    '00000000-0000-0000-0005-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'PP-GR-2026-1002',
    FALSE,
    '00000000-0000-0000-0003-000000000006',
    NULL,
    'Inconsistent Promotion Review Criteria in Customer Support',
    'I was promised a level progression review after 6 months of hitting 98% CSAT. The review was postponed twice with no clear timeline, while newly hired peers received title adjustments without explanation.',
    'Career Growth',
    'Performance Management & Transparency',
    '00000000-0000-0000-0001-000000000006',
    'Medium',
    'MEDIUM',
    FALSE,
    'Under Review',
    'Medium',
    '00000000-0000-0000-0003-000000000002',
    NOW() + INTERVAL '28 hours',
    NOW() - INTERVAL '2 days'
),
(
    '00000000-0000-0000-0005-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'PP-GR-2026-1003',
    TRUE,
    NULL,
    '$2a$10$w8T0M9tH0wXqA1gE4mI.Le2q7a6T8Zf3e0V2Q7K1p0N9U8Y7X6W5V',
    'Exclusionary conduct and verbal hostility during sprint retrospective',
    'During our team retrospective on Thursday, a senior engineer repeatedly made dismissive and intimidating remarks targeting junior members when discussing the release outage, stating "some people clearly do not belong in tech". It created an extremely hostile atmosphere.',
    'Workplace Behaviour',
    'Harassment & Psychological Safety',
    '00000000-0000-0000-0001-000000000001',
    'High',
    'CRITICAL',
    TRUE, -- Safety flag triggered by policy screener
    'Escalated',
    'Critical',
    '00000000-0000-0000-0003-000000000001',
    NOW() + INTERVAL '4 hours',
    NOW() - INTERVAL '18 hours'
),
(
    '00000000-0000-0000-0005-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'PP-GR-2026-1004',
    FALSE,
    '00000000-0000-0000-0003-000000000007',
    NULL,
    'Tier-2 Enterprise Deal Commission Calculation Discrepancy',
    'The Q2 commission payout did not include the multi-year expansion clause for the Acme Corp contract.',
    'Salary / Benefits',
    'Compensation',
    '00000000-0000-0000-0001-000000000002',
    'Low',
    'LOW',
    FALSE,
    'Resolved',
    'Low',
    '00000000-0000-0000-0003-000000000002',
    NOW() - INTERVAL '10 hours',
    NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Grievance Messages & Internal Notes
INSERT INTO grievance_messages (organization_id, grievance_id, sender_role, sender_user_id, message_text, is_internal_note, created_at) VALUES
-- Case 1001 Messages
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0005-000000000001', 'EMPLOYEE', NULL, 'Thank you for receiving this. This has happened on June 12, June 18, and June 24.', FALSE, NOW() - INTERVAL '22 hours'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0005-000000000001', 'HR', '00000000-0000-0000-0003-000000000001', 'Hello. Thank you for bringing this forward. Your anonymity is completely protected. Could you confirm if overtime instructions were communicated verbally or via team chat/email?', FALSE, NOW() - INTERVAL '16 hours'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0005-000000000001', 'HR', '00000000-0000-0000-0003-000000000001', 'INTERNAL NOTE: Checked badge swipe records against timesheet submissions for Shift B; there is a distinct 2.5 hr discrepancy on the dates reported. Scheduling meeting with VP of Operations.', TRUE, NOW() - INTERVAL '14 hours'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0005-000000000001', 'EMPLOYEE', NULL, 'It was communicated verbally at the 4 PM shift handover meeting.', FALSE, NOW() - INTERVAL '8 hours');

-- 10. AI Grievance Analysis
INSERT INTO ai_analysis (
    organization_id, grievance_id, summary, category, subcategory, sentiment_score,
    urgency, risk_level, key_topics, possible_policy_area, recommended_hr_response,
    recommended_next_actions, escalation_recommended, reasoning_summary
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0005-000000000001',
    'Employee reports repeated uncompensated mandatory overtime on Operations Shift B, accompanied by implied threats to performance reviews.',
    'Policy Compliance & Compensation',
    'Unrecorded Overtime / FLSA Risk',
    -0.82,
    'High',
    'HIGH',
    ARRAY['overtime', 'mandatory hours', 'operations shift', 'performance review coercion', 'burnout'],
    'Fair Labor Standards & Overtime Policy (Section 4.2)',
    'Acknowledge receipt immediately, assure complete confidentiality, and request clarification on whether instructions were written or verbal while initiating an audit of shift hours.',
    '[{"action": "Audit Operations Shift B time logs", "priority": "High"}, {"action": "Conduct confidential check-in with Operations Leadership", "priority": "High"}]'::jsonb,
    TRUE,
    'Repeated unrecorded overtime carries both legal compliance risk and severe team burnout implications.'
),
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0005-000000000003',
    'Report of hostile and intimidating verbal behavior by a senior engineer targeting junior team members in sprint retrospective.',
    'Workplace Conduct & Culture',
    'Psychological Safety & Intimidation',
    -0.91,
    'Immediate',
    'CRITICAL',
    ARRAY['hostile environment', 'intimidation', 'sprint retrospective', 'junior staff psychological safety'],
    'Code of Conduct & Anti-Harassment Policy (Section 2.1)',
    'Provide prompt support to submitter, re-affirm non-retaliation commitment, and initiate fact-finding inquiry with attendees.',
    '[{"action": "Review sprint retrospective meeting notes and attendees", "priority": "Critical"}, {"action": "Interview meeting facilitator", "priority": "Critical"}]'::jsonb,
    TRUE,
    'Violates workplace respect policy and triggers high risk for junior engineering attrition and team dysfunction.'
)
ON CONFLICT (grievance_id) DO NOTHING;

-- 11. Recurring Issues Clusters
INSERT INTO recurring_issues (
    organization_id, topic_title, department_id, issue_count, trend_direction,
    sentiment_label, supporting_case_numbers, first_detected_at, last_detected_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Workload Pressure & Overtime Burnout',
    '00000000-0000-0000-0001-000000000003',
    8,
    'INCREASING',
    'Negative',
    ARRAY['PP-GR-2026-1001', 'PP-GR-2026-1005'],
    NOW() - INTERVAL '21 days',
    NOW()
),
(
    '00000000-0000-0000-0000-000000000001',
    'Promotion & Review Timeline Transparency',
    '00000000-0000-0000-0001-000000000006',
    4,
    'STABLE',
    'Neutral-Negative',
    ARRAY['PP-GR-2026-1002'],
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '2 days'
);

-- 12. AI Morning Briefing Insights
INSERT INTO ai_insights (
    organization_id, insight_type, headline, evidence_summary,
    confidence_score, affected_department_id, recommended_action
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'CRITICAL_ALERT',
    '1 Critical Grievance in Engineering requires expedited triage',
    'Case PP-GR-2026-1003 involving retrospective hostility is at 4 hours remaining in SLA window.',
    0.98,
    '00000000-0000-0000-0001-000000000001',
    'Review investigation notes and assign dedicated people partner today.'
),
(
    '00000000-0000-0000-0000-000000000001',
    'EMERGING_SIGNAL',
    'Operations mood has declined 14% over the last 3 weeks',
    'Average pulse in Operations dropped from 3.8 to 2.4 across 18 submissions citing mandatory overtime.',
    0.92,
    '00000000-0000-0000-0001-000000000003',
    'Schedule a confidential workload alignment review with Operations leadership.'
),
(
    '00000000-0000-0000-0000-000000000001',
    'RECURRING_ISSUE',
    'Workload & Overtime complaints cluster in Operations',
    '8 individual feedback and grievance items detect overlapping topics of unrecorded overtime and shift length.',
    0.89,
    '00000000-0000-0000-0001-000000000003',
    'Launch targeted 3-question Pulse Survey on shift handover fairness.'
),
(
    '00000000-0000-0000-0000-000000000001',
    'POSITIVE_SIGNAL',
    'Engineering sentiment improved for the third consecutive week',
    'Mood average rose to 4.4 following adoption of async sprint planning and tech debt buffer.',
    0.94,
    '00000000-0000-0000-0001-000000000001',
    'Share best practices from Engineering retrospective cadence with Customer Support.'
);

-- 13. Action Recommendations
INSERT INTO action_recommendations (
    organization_id, title, description, category, priority, status, assigned_hr_user_id
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Launch Operations Workload & Staffing Pulse Survey',
    'Deploy a lightweight 3-question survey to all 32 Operations staff to benchmark shift balance and overtime logging confidence.',
    'Pulse Survey',
    'High',
    'Approved',
    '00000000-0000-0000-0003-000000000001'
),
(
    '00000000-0000-0000-0000-000000000001',
    'Publish Customer Support Promotion Criteria Roadmap',
    'Create an open Notion/Confluence guide clarifying CSAT weight, tenure requirements, and quarterly review windows.',
    'Policy Update',
    'Medium',
    'Proposed',
    '00000000-0000-0000-0003-000000000002'
);
