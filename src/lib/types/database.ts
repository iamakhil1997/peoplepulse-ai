// PEOPLEPULSE AI — Database Type Definitions

export type UserRole = 'Employee' | 'HR' | 'HR_Admin' | 'Org_Admin' | 'Super_Admin';

export type GrievanceStatus = 
  | 'New' 
  | 'Under Review' 
  | 'Awaiting Employee' 
  | 'Investigation' 
  | 'Action Required' 
  | 'Resolved' 
  | 'Closed' 
  | 'Escalated';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type MoodLabel = 'Very Low' | 'Low' | 'Okay' | 'Good' | 'Great';

export type FeedbackType = 'Praise' | 'Suggestion' | 'Concern' | 'General Feedback';
export type SuggestionStatus = 'Submitted' | 'Under Review' | 'Planned' | 'Implemented' | 'Archived';
export type InsightType = 'CRITICAL_ALERT' | 'EMERGING_SIGNAL' | 'RECURRING_ISSUE' | 'POSITIVE_SIGNAL';
export type RecommendationStatus = 'Proposed' | 'Approved' | 'In Progress' | 'Completed' | 'Dismissed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  employee_count_tier?: string;
  country?: string;
  timezone?: string;
  k_anonymity_threshold: number;
  sla_settings: {
    critical_hours: number;
    high_hours: number;
    medium_hours: number;
    low_hours: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  code?: string;
  parent_department_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  role_name: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeProfile {
  id: string;
  organization_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  department_id?: string | null;
  hire_date?: string;
  avatar_url?: string;
  department?: Department;
  created_at: string;
  updated_at: string;
}

export interface EmployeePulse {
  id: string;
  organization_id: string;
  submitter_id?: string | null;
  department_id?: string | null;
  mood_score: MoodScore;
  mood_label: MoodLabel;
  category?: string;
  comment?: string;
  is_anonymous: boolean;
  allow_hr_followup: boolean;
  created_at: string;
  department?: Department;
}

export interface Feedback {
  id: string;
  organization_id: string;
  submitter_id?: string | null;
  department_id?: string | null;
  type: FeedbackType;
  title: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  department?: Department;
}

export interface Suggestion {
  id: string;
  organization_id: string;
  submitter_id?: string | null;
  department_id?: string | null;
  title: string;
  description: string;
  impact_area?: string;
  status: SuggestionStatus;
  is_anonymous: boolean;
  upvotes_count: number;
  created_at: string;
  department?: Department;
}

export interface Grievance {
  id: string;
  organization_id: string;
  case_number: string;
  is_anonymous: boolean;
  submitter_id?: string | null;
  access_token_hash?: string | null;
  title: string;
  description: string;
  category_selected: string;
  category_ai_suggested?: string;
  department_id?: string | null;
  incident_date?: string | null;
  severity_employee: SeverityLevel;
  severity_assessed?: SeverityLevel;
  risk_level: RiskLevel;
  has_safety_red_flag: boolean;
  status: GrievanceStatus;
  priority: SeverityLevel;
  allow_hr_followup: boolean;
  preferred_response_method: string;
  assigned_to_user_id?: string | null;
  sla_due_at?: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
  assigned_to?: User & { profile?: EmployeeProfile };
  ai_analysis?: AIAnalysis;
  messages?: GrievanceMessage[];
}

export interface GrievanceMessage {
  id: string;
  organization_id: string;
  grievance_id: string;
  sender_role: 'EMPLOYEE' | 'HR' | 'SYSTEM';
  sender_user_id?: string | null;
  message_text: string;
  is_internal_note: boolean;
  attachments?: any[];
  created_at: string;
  sender_name?: string;
}

export interface AIAnalysis {
  id: string;
  organization_id: string;
  grievance_id: string;
  summary: string;
  category?: string;
  subcategory?: string;
  sentiment_score?: number;
  urgency?: string;
  risk_level: RiskLevel;
  key_topics: string[];
  possible_policy_area?: string;
  similar_issue_keywords?: string[];
  recommended_hr_response?: string;
  recommended_next_actions: Array<{ action: string; priority: string }>;
  escalation_recommended: boolean;
  reasoning_summary?: string;
  model_version: string;
  created_at: string;
}

export interface RecurringIssue {
  id: string;
  organization_id: string;
  topic_title: string;
  department_id?: string | null;
  issue_count: number;
  trend_direction: 'INCREASING' | 'STABLE' | 'DECREASING';
  sentiment_label: string;
  supporting_case_numbers: string[];
  first_detected_at: string;
  last_detected_at: string;
  created_at: string;
  department?: Department;
}

export interface AIInsight {
  id: string;
  organization_id: string;
  insight_type: InsightType;
  headline: string;
  evidence_summary: string;
  confidence_score: number;
  affected_department_id?: string | null;
  recommended_action: string;
  is_dismissed: boolean;
  created_at: string;
  affected_department?: Department;
}

export interface ActionRecommendation {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category?: string;
  priority: SeverityLevel;
  status: RecommendationStatus;
  assigned_hr_user_id?: string | null;
  approved_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
  assigned_hr?: User & { profile?: EmployeeProfile };
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_user_id?: string | null;
  actor_role?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: Record<string, any>;
  ip_hash?: string;
  created_at: string;
}


export interface GrievanceStatusHistory {
  id: string;
  organization_id: string;
  grievance_id: string;
  changed_by_user_id?: string | null;
  old_status?: GrievanceStatus | string | null;
  new_status: GrievanceStatus | string;
  reason?: string | null;
  created_at: string;
}
