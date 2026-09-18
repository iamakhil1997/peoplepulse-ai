// PEOPLEPULSE AI — In-Memory Multi-Tenant Store & Seeder
// Enables immediate out-of-the-box local development & testing without requiring Supabase cloud setup

import {
  Organization,
  Department,
  User,
  EmployeeProfile,
  EmployeePulse,
  Feedback,
  Suggestion,
  Grievance,
  GrievanceMessage,
  AIAnalysis,
  RecurringIssue,
  AIInsight,
  ActionRecommendation,
  AuditLog,
  UserRole,
} from '../types/database';

export interface DatabaseState {
  organizations: Organization[];
  departments: Department[];
  users: User[];
  employeeProfiles: EmployeeProfile[];
  employeePulses: EmployeePulse[];
  feedback: Feedback[];
  suggestions: Suggestion[];
  grievances: Grievance[];
  grievanceMessages: GrievanceMessage[];
  aiAnalyses: AIAnalysis[];
  recurringIssues: RecurringIssue[];
  aiInsights: AIInsight[];
  actionRecommendations: ActionRecommendation[];
  auditLogs: AuditLog[];
}

const ORG_ID = '00000000-0000-0000-0000-000000000001';

const INITIAL_STATE: DatabaseState = {
  organizations: [
    {
      id: ORG_ID,
      name: 'Northstar Technologies',
      slug: 'northstar-tech',
      industry: 'Enterprise Cloud Software',
      employee_count_tier: '50-250',
      country: 'United States',
      timezone: 'America/New_York',
      k_anonymity_threshold: 5,
      sla_settings: { critical_hours: 12, high_hours: 24, medium_hours: 48, low_hours: 96 },
      is_active: true,
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  departments: [
    { id: '00000000-0000-0000-0001-000000000001', organization_id: ORG_ID, name: 'Engineering', code: 'ENG', parent_department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000002', organization_id: ORG_ID, name: 'Sales', code: 'SAL', parent_department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000003', organization_id: ORG_ID, name: 'Operations', code: 'OPS', parent_department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000004', organization_id: ORG_ID, name: 'People & HR', code: 'HR', parent_department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000005', organization_id: ORG_ID, name: 'Finance', code: 'FIN', parent_department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000006', organization_id: ORG_ID, name: 'Customer Support', code: 'SUP', parent_department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  users: [
    { id: '00000000-0000-0000-0003-000000000001', organization_id: ORG_ID, email: 'alex.morgan@northstar.demo', role_name: 'HR_Admin', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0003-000000000002', organization_id: ORG_ID, email: 'sarah.chen@northstar.demo', role_name: 'HR', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0003-000000000003', organization_id: ORG_ID, email: 'david.ross@northstar.demo', role_name: 'Org_Admin', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0003-000000000004', organization_id: ORG_ID, email: 'marcus.vance@northstar.demo', role_name: 'Employee', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0003-000000000005', organization_id: ORG_ID, email: 'elena.rostova@northstar.demo', role_name: 'Employee', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0003-000000000006', organization_id: ORG_ID, email: 'priya.patel@northstar.demo', role_name: 'Employee', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0003-000000000007', organization_id: ORG_ID, email: 'jordan.lee@northstar.demo', role_name: 'Employee', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  employeeProfiles: [
    { id: '00000000-0000-0000-0004-000000000001', organization_id: ORG_ID, user_id: '00000000-0000-0000-0003-000000000001', first_name: 'Alex', last_name: 'Morgan', job_title: 'Head of People & Culture', department_id: '00000000-0000-0000-0001-000000000004', hire_date: '2023-01-15', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0004-000000000002', organization_id: ORG_ID, user_id: '00000000-0000-0000-0003-000000000002', first_name: 'Sarah', last_name: 'Chen', job_title: 'Senior People Partner', department_id: '00000000-0000-0000-0001-000000000004', hire_date: '2023-06-01', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0004-000000000003', organization_id: ORG_ID, user_id: '00000000-0000-0000-0003-000000000003', first_name: 'David', last_name: 'Ross', job_title: 'VP Operations & Admin', department_id: '00000000-0000-0000-0001-000000000003', hire_date: '2022-03-10', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0004-000000000004', organization_id: ORG_ID, user_id: '00000000-0000-0000-0003-000000000004', first_name: 'Marcus', last_name: 'Vance', job_title: 'Senior Backend Engineer', department_id: '00000000-0000-0000-0001-000000000001', hire_date: '2023-09-18', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0004-000000000005', organization_id: ORG_ID, user_id: '00000000-0000-0000-0003-000000000005', first_name: 'Elena', last_name: 'Rostova', job_title: 'Operations Lead', department_id: '00000000-0000-0000-0001-000000000003', hire_date: '2022-11-05', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0004-000000000006', organization_id: ORG_ID, user_id: '00000000-0000-0000-0003-000000000006', first_name: 'Priya', last_name: 'Patel', job_title: 'Customer Support Specialist', department_id: '00000000-0000-0000-0001-000000000006', hire_date: '2024-02-01', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0004-000000000007', organization_id: ORG_ID, user_id: '00000000-0000-0000-0003-000000000007', first_name: 'Jordan', last_name: 'Lee', job_title: 'Account Executive', department_id: '00000000-0000-0000-0001-000000000002', hire_date: '2023-04-12', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  employeePulses: [
    { id: 'p-1', organization_id: ORG_ID, submitter_id: '00000000-0000-0000-0003-000000000004', department_id: '00000000-0000-0000-0001-000000000001', mood_score: 5, mood_label: 'Great', category: 'Engineering', comment: 'Great sprint planning session today. Team alignment feels very crisp!', is_anonymous: false, allow_hr_followup: true, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'p-2', organization_id: ORG_ID, submitter_id: null, department_id: '00000000-0000-0000-0001-000000000003', mood_score: 2, mood_label: 'Low', category: 'Workload', comment: 'Consistently logging 12+ hour shifts this week due to understaffed queue.', is_anonymous: true, allow_hr_followup: false, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'p-3', organization_id: ORG_ID, submitter_id: null, department_id: '00000000-0000-0000-0001-000000000003', mood_score: 1, mood_label: 'Very Low', category: 'Workload', comment: 'Weekend on-call escalation without comp time is leading to severe burnout.', is_anonymous: true, allow_hr_followup: false, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'p-4', organization_id: ORG_ID, submitter_id: '00000000-0000-0000-0003-000000000006', department_id: '00000000-0000-0000-0001-000000000006', mood_score: 4, mood_label: 'Good', category: 'Culture', comment: 'Appreciated the recognition in the team all-hands.', is_anonymous: false, allow_hr_followup: true, created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: 'p-5', organization_id: ORG_ID, submitter_id: '00000000-0000-0000-0003-000000000007', department_id: '00000000-0000-0000-0001-000000000002', mood_score: 3, mood_label: 'Okay', category: 'Compensation', comment: 'Pipeline is strong, but commission tiers remain ambiguous.', is_anonymous: false, allow_hr_followup: true, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'p-6', organization_id: ORG_ID, submitter_id: null, department_id: '00000000-0000-0000-0001-000000000001', mood_score: 5, mood_label: 'Great', category: 'Career Growth', comment: 'Super excited about the new microservices architecture migration.', is_anonymous: true, allow_hr_followup: false, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: 'p-7', organization_id: ORG_ID, submitter_id: null, department_id: '00000000-0000-0000-0001-000000000003', mood_score: 2, mood_label: 'Low', category: 'Management', comment: 'Communication from shift leads has been very reactive.', is_anonymous: true, allow_hr_followup: false, created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 'p-8', organization_id: ORG_ID, submitter_id: '00000000-0000-0000-0003-000000000004', department_id: '00000000-0000-0000-0001-000000000001', mood_score: 4, mood_label: 'Good', category: 'Culture', comment: 'Solid progress on the tech debt sprint.', is_anonymous: false, allow_hr_followup: true, created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  ],
  feedback: [
    { id: 'fb-1', organization_id: ORG_ID, submitter_id: '00000000-0000-0000-0003-000000000004', department_id: '00000000-0000-0000-0001-000000000001', type: 'Praise', title: 'Kudos to the DevOps Team', content: 'The recent CI/CD deployment pipeline upgrade cut our build times by 60%. Huge win!', is_anonymous: false, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'fb-2', organization_id: ORG_ID, submitter_id: null, department_id: '00000000-0000-0000-0001-000000000003', type: 'Concern', title: 'Operations Staffing Levels', content: 'We have seen 3 resignations in logistics without backfill, leading to double shift burdens.', is_anonymous: true, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  ],
  suggestions: [
    { id: 'sug-1', organization_id: ORG_ID, submitter_id: '00000000-0000-0000-0003-000000000006', department_id: '00000000-0000-0000-0001-000000000006', title: 'Async Standups for Support Staff', description: 'Replacing our 8:30 AM mandatory video sync with a Slack async check-in would allow us to cover early morning EMEA tickets.', impact_area: 'Productivity', status: 'Under Review', is_anonymous: false, upvotes_count: 8, created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  ],
  grievances: [
    {
      id: '00000000-0000-0000-0005-000000000001',
      organization_id: ORG_ID,
      case_number: 'PP-GR-2026-1001',
      is_anonymous: true,
      submitter_id: null,
      access_token_hash: 'demo-passcode-1001',
      title: 'Repeated mandatory unlogged overtime in Operations shift',
      description: 'For the third consecutive week, the evening operations lead has instructed the team to stay 2-3 hours past scheduled shift without logging overtime hours in the system. When questioned, we were told it is part of "meeting deliverables" and questioning it would impact performance reviews.',
      category_selected: 'Workload',
      category_ai_suggested: 'Policy & Overtime Compliance',
      department_id: '00000000-0000-0000-0001-000000000003',
      incident_date: '2026-08-28',
      severity_employee: 'Critical',
      severity_assessed: 'Critical',
      risk_level: 'HIGH',
      has_safety_red_flag: false,
      status: 'Investigation',
      priority: 'Critical',
      allow_hr_followup: true,
      preferred_response_method: 'Platform Case Inbox',
      assigned_to_user_id: '00000000-0000-0000-0003-000000000001',
      sla_due_at: new Date(Date.now() + 8 * 3600000).toISOString(),
      resolved_at: null,
      closed_at: null,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0005-000000000002',
      organization_id: ORG_ID,
      case_number: 'PP-GR-2026-1002',
      is_anonymous: false,
      submitter_id: '00000000-0000-0000-0003-000000000006',
      access_token_hash: null,
      title: 'Inconsistent Promotion Review Criteria in Customer Support',
      description: 'I was promised a level progression review after 6 months of hitting 98% CSAT. The review was postponed twice with no clear timeline, while newly hired peers received title adjustments without explanation.',
      category_selected: 'Career Growth',
      category_ai_suggested: 'Performance Management & Transparency',
      department_id: '00000000-0000-0000-0001-000000000006',
      incident_date: '2026-08-20',
      severity_employee: 'Medium',
      severity_assessed: 'Medium',
      risk_level: 'MEDIUM',
      has_safety_red_flag: false,
      status: 'Under Review',
      priority: 'Medium',
      allow_hr_followup: true,
      preferred_response_method: 'Platform Case Inbox',
      assigned_to_user_id: '00000000-0000-0000-0003-000000000002',
      sla_due_at: new Date(Date.now() + 28 * 3600000).toISOString(),
      resolved_at: null,
      closed_at: null,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0005-000000000003',
      organization_id: ORG_ID,
      case_number: 'PP-GR-2026-1003',
      is_anonymous: true,
      submitter_id: null,
      access_token_hash: 'demo-passcode-1003',
      title: 'Exclusionary conduct and verbal hostility during sprint retrospective',
      description: 'During our team retrospective on Thursday, a senior engineer repeatedly made dismissive and intimidating remarks targeting junior members when discussing the release outage, stating "some people clearly do not belong in tech". It created an extremely hostile atmosphere.',
      category_selected: 'Workplace Behaviour',
      category_ai_suggested: 'Harassment & Psychological Safety',
      department_id: '00000000-0000-0000-0001-000000000001',
      incident_date: '2026-09-02',
      severity_employee: 'High',
      severity_assessed: 'Critical',
      risk_level: 'CRITICAL',
      has_safety_red_flag: true,
      status: 'Escalated',
      priority: 'Critical',
      allow_hr_followup: true,
      preferred_response_method: 'Platform Case Inbox',
      assigned_to_user_id: '00000000-0000-0000-0003-000000000001',
      sla_due_at: new Date(Date.now() + 4 * 3600000).toISOString(),
      resolved_at: null,
      closed_at: null,
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0005-000000000004',
      organization_id: ORG_ID,
      case_number: 'PP-GR-2026-1004',
      is_anonymous: false,
      submitter_id: '00000000-0000-0000-0003-000000000007',
      access_token_hash: null,
      title: 'Tier-2 Enterprise Deal Commission Calculation Discrepancy',
      description: 'The Q2 commission payout did not include the multi-year expansion clause for the Acme Corp contract.',
      category_selected: 'Salary / Benefits',
      category_ai_suggested: 'Compensation',
      department_id: '00000000-0000-0000-0001-000000000002',
      incident_date: '2026-08-15',
      severity_employee: 'Low',
      severity_assessed: 'Low',
      risk_level: 'LOW',
      has_safety_red_flag: false,
      status: 'Resolved',
      priority: 'Low',
      allow_hr_followup: true,
      preferred_response_method: 'Platform Case Inbox',
      assigned_to_user_id: '00000000-0000-0000-0003-000000000002',
      sla_due_at: new Date(Date.now() - 10 * 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 8 * 3600000).toISOString(),
      closed_at: null,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  grievanceMessages: [
    { id: 'm-1', organization_id: ORG_ID, grievance_id: '00000000-0000-0000-0005-000000000001', sender_role: 'EMPLOYEE', sender_user_id: null, message_text: 'Thank you for receiving this. This has happened on June 12, June 18, and June 24.', is_internal_note: false, created_at: new Date(Date.now() - 22 * 3600000).toISOString() },
    { id: 'm-2', organization_id: ORG_ID, grievance_id: '00000000-0000-0000-0005-000000000001', sender_role: 'HR', sender_user_id: '00000000-0000-0000-0003-000000000001', message_text: 'Hello. Thank you for bringing this forward. Your anonymity is completely protected. Could you confirm if overtime instructions were communicated verbally or via team chat/email?', is_internal_note: false, created_at: new Date(Date.now() - 16 * 3600000).toISOString() },
    { id: 'm-3', organization_id: ORG_ID, grievance_id: '00000000-0000-0000-0005-000000000001', sender_role: 'HR', sender_user_id: '00000000-0000-0000-0003-000000000001', message_text: 'INTERNAL NOTE: Checked badge swipe records against timesheet submissions for Shift B; there is a distinct 2.5 hr discrepancy on the dates reported. Scheduling meeting with VP of Operations.', is_internal_note: true, created_at: new Date(Date.now() - 14 * 3600000).toISOString() },
    { id: 'm-4', organization_id: ORG_ID, grievance_id: '00000000-0000-0000-0005-000000000001', sender_role: 'EMPLOYEE', sender_user_id: null, message_text: 'It was communicated verbally at the 4 PM shift handover meeting.', is_internal_note: false, created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  aiAnalyses: [
    {
      id: 'ai-1',
      organization_id: ORG_ID,
      grievance_id: '00000000-0000-0000-0005-000000000001',
      summary: 'Employee reports repeated uncompensated mandatory overtime on Operations Shift B, accompanied by implied threats to performance reviews.',
      category: 'Policy Compliance & Compensation',
      subcategory: 'Unrecorded Overtime / FLSA Risk',
      sentiment_score: -0.82,
      urgency: 'High',
      risk_level: 'HIGH',
      key_topics: ['overtime', 'mandatory hours', 'operations shift', 'performance review coercion', 'burnout'],
      possible_policy_area: 'Fair Labor Standards & Overtime Policy (Section 4.2)',
      similar_issue_keywords: ['overtime', 'workload', 'burnout'],
      recommended_hr_response: 'Acknowledge receipt immediately, assure complete confidentiality, and request clarification on whether instructions were written or verbal while initiating an audit of shift hours.',
      recommended_next_actions: [
        { action: 'Audit Operations Shift B time logs', priority: 'High' },
        { action: 'Conduct confidential check-in with Operations Leadership', priority: 'High' },
      ],
      escalation_recommended: true,
      reasoning_summary: 'Repeated unrecorded overtime carries both legal compliance risk and severe team burnout implications.',
      model_version: 'gemini-1.5-pro',
      created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
    {
      id: 'ai-2',
      organization_id: ORG_ID,
      grievance_id: '00000000-0000-0000-0005-000000000003',
      summary: 'Report of hostile and intimidating verbal behavior by a senior engineer targeting junior team members in sprint retrospective.',
      category: 'Workplace Conduct & Culture',
      subcategory: 'Psychological Safety & Intimidation',
      sentiment_score: -0.91,
      urgency: 'Immediate',
      risk_level: 'CRITICAL',
      key_topics: ['hostile environment', 'intimidation', 'sprint retrospective', 'junior staff psychological safety'],
      possible_policy_area: 'Code of Conduct & Anti-Harassment Policy (Section 2.1)',
      recommended_hr_response: 'Provide prompt support to submitter, re-affirm non-retaliation commitment, and initiate fact-finding inquiry with attendees.',
      recommended_next_actions: [
        { action: 'Review sprint retrospective meeting notes and attendees', priority: 'Critical' },
        { action: 'Interview meeting facilitator', priority: 'Critical' },
      ],
      escalation_recommended: true,
      reasoning_summary: 'Violates workplace respect policy and triggers high risk for junior engineering attrition and team dysfunction.',
      model_version: 'gemini-1.5-pro',
      created_at: new Date(Date.now() - 17 * 3600000).toISOString(),
    },
  ],
  recurringIssues: [
    {
      id: 'rec-1',
      organization_id: ORG_ID,
      topic_title: 'Workload Pressure & Overtime Burnout',
      department_id: '00000000-0000-0000-0001-000000000003',
      issue_count: 8,
      trend_direction: 'INCREASING',
      sentiment_label: 'Negative',
      supporting_case_numbers: ['PP-GR-2026-1001', 'PP-GR-2026-1005'],
      first_detected_at: new Date(Date.now() - 21 * 86400000).toISOString(),
      last_detected_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
    {
      id: 'rec-2',
      organization_id: ORG_ID,
      topic_title: 'Promotion & Review Timeline Transparency',
      department_id: '00000000-0000-0000-0001-000000000006',
      issue_count: 4,
      trend_direction: 'STABLE',
      sentiment_label: 'Neutral-Negative',
      supporting_case_numbers: ['PP-GR-2026-1002'],
      first_detected_at: new Date(Date.now() - 35 * 86400000).toISOString(),
      last_detected_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    },
  ],
  aiInsights: [
    {
      id: 'ins-1',
      organization_id: ORG_ID,
      insight_type: 'CRITICAL_ALERT',
      headline: '1 Critical Grievance in Engineering requires expedited triage',
      evidence_summary: 'Case PP-GR-2026-1003 involving retrospective hostility is at 4 hours remaining in SLA window.',
      confidence_score: 0.98,
      affected_department_id: '00000000-0000-0000-0001-000000000001',
      recommended_action: 'Review investigation notes and assign dedicated people partner today.',
      is_dismissed: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'ins-2',
      organization_id: ORG_ID,
      insight_type: 'EMERGING_SIGNAL',
      headline: 'Operations mood has declined 14% over the last 3 weeks',
      evidence_summary: 'Average pulse in Operations dropped from 3.8 to 2.4 across 18 submissions citing mandatory overtime.',
      confidence_score: 0.92,
      affected_department_id: '00000000-0000-0000-0001-000000000003',
      recommended_action: 'Schedule a confidential workload alignment review with Operations leadership.',
      is_dismissed: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'ins-3',
      organization_id: ORG_ID,
      insight_type: 'RECURRING_ISSUE',
      headline: 'Workload & Overtime complaints cluster in Operations',
      evidence_summary: '8 individual feedback and grievance items detect overlapping topics of unrecorded overtime and shift length.',
      confidence_score: 0.89,
      affected_department_id: '00000000-0000-0000-0001-000000000003',
      recommended_action: 'Launch targeted 3-question Pulse Survey on shift handover fairness.',
      is_dismissed: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'ins-4',
      organization_id: ORG_ID,
      insight_type: 'POSITIVE_SIGNAL',
      headline: 'Engineering sentiment improved for the third consecutive week',
      evidence_summary: 'Mood average rose to 4.4 following adoption of async sprint planning and tech debt buffer.',
      confidence_score: 0.94,
      affected_department_id: '00000000-0000-0000-0001-000000000001',
      recommended_action: 'Share best practices from Engineering retrospective cadence with Customer Support.',
      is_dismissed: false,
      created_at: new Date().toISOString(),
    },
  ],
  actionRecommendations: [
    {
      id: 'act-1',
      organization_id: ORG_ID,
      title: 'Launch Operations Workload & Staffing Pulse Survey',
      description: 'Deploy a lightweight 3-question survey to all 32 Operations staff to benchmark shift balance and overtime logging confidence.',
      category: 'Pulse Survey',
      priority: 'High',
      status: 'Approved',
      assigned_hr_user_id: '00000000-0000-0000-0003-000000000001',
      approved_by_user_id: '00000000-0000-0000-0003-000000000001',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'act-2',
      organization_id: ORG_ID,
      title: 'Publish Customer Support Promotion Criteria Roadmap',
      description: 'Create an open Notion/Confluence guide clarifying CSAT weight, tenure requirements, and quarterly review windows.',
      category: 'Policy Update',
      priority: 'Medium',
      status: 'Proposed',
      assigned_hr_user_id: '00000000-0000-0000-0003-000000000002',
      approved_by_user_id: null,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  auditLogs: [
    { id: 'aud-1', organization_id: ORG_ID, actor_user_id: '00000000-0000-0000-0003-000000000001', actor_role: 'HR_Admin', action: 'STATUS_CHANGED', resource_type: 'grievance', resource_id: '00000000-0000-0000-0005-000000000001', metadata: { old_status: 'New', new_status: 'Investigation' }, ip_hash: 'anon-hash-88', created_at: new Date(Date.now() - 18 * 3600000).toISOString() },
  ],
};

// Singleton in-memory state
class MemoryDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  getState(): DatabaseState {
    return this.state;
  }

  reset(): void {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
  }
}

const globalForDb = globalThis as unknown as { mockDb?: MemoryDatabase };
export const mockDb = globalForDb.mockDb || new MemoryDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.mockDb = mockDb;
