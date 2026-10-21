// PeoplePulse AI — In-Memory Synthetic Demo Data Store
// STRICT ISOLATION GUARANTEE:
// All mutations and queries during Demo Mode operate solely in memory.
// Demo mode NEVER executes queries against production Supabase or alters real data.

import {
  Grievance,
  GrievanceMessage,
  EmployeePulse,
  Feedback,
  Suggestion,
} from '../types/database';
import { DEMO_PERSONAS, DemoRole } from '../auth/demo-session';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

interface SyntheticDemoState {
  grievances: Grievance[];
  grievanceMessages: GrievanceMessage[];
  pulses: EmployeePulse[];
  feedbacks: Feedback[];
  suggestions: Suggestion[];
}

function createInitialDemoState(): SyntheticDemoState {
  const now = Date.now();

  const g1: Grievance = {
    id: 'demo-gr-001',
    organization_id: DEMO_ORG_ID,
    case_number: 'PP-DEMO-2026-001',
    is_anonymous: false,
    submitter_id: DEMO_PERSONAS.Employee.id,
    access_token_hash: null,
    title: '[DEMO] Unclear Shift Handover in Cloud Infrastructure',
    description: 'During on-call rotations, the handover checklist lacks verified deploy alerts, causing delay in triage.',
    category_selected: 'Workload',
    category_ai_suggested: 'Process & Workload Management',
    department_id: DEMO_PERSONAS.Employee.departmentId,
    incident_date: new Date(now - 3 * 86400000).toISOString().split('T')[0],
    severity_employee: 'Medium',
    severity_assessed: 'Medium',
    risk_level: 'MEDIUM',
    has_safety_red_flag: false,
    status: 'Under Review',
    priority: 'Medium',
    allow_hr_followup: true,
    preferred_response_method: 'Platform Case Inbox',
    assigned_to_user_id: DEMO_PERSONAS.Reviewer.id, // Assigned to Reviewer
    sla_due_at: new Date(now + 24 * 3600000).toISOString(),
    resolved_at: null,
    closed_at: null,
    created_at: new Date(now - 3 * 86400000).toISOString(),
    updated_at: new Date(now - 1 * 86400000).toISOString(),
  };

  const g2: Grievance = {
    id: 'demo-gr-002',
    organization_id: DEMO_ORG_ID,
    case_number: 'PP-DEMO-2026-002',
    is_anonymous: true,
    submitter_id: null,
    access_token_hash: 'demo-anon-token-hash-2',
    title: '[DEMO] Anonymous: Safety Equipment Maintenance Request',
    description: 'Server room air filtration unit has had a warning light on for 5 days. Needs prompt inspection.',
    category_selected: 'Facilities',
    category_ai_suggested: 'Workplace Safety & Equipment',
    department_id: '00000000-0000-0000-0001-000000000003',
    incident_date: new Date(now - 2 * 86400000).toISOString().split('T')[0],
    severity_employee: 'Low',
    severity_assessed: 'Low',
    risk_level: 'LOW',
    has_safety_red_flag: false,
    status: 'Investigation',
    priority: 'Low',
    allow_hr_followup: true,
    preferred_response_method: 'Platform Case Inbox',
    assigned_to_user_id: DEMO_PERSONAS.HR_Admin.id, // Assigned to HR Admin
    sla_due_at: new Date(now + 48 * 3600000).toISOString(),
    resolved_at: null,
    closed_at: null,
    created_at: new Date(now - 2 * 86400000).toISOString(),
    updated_at: new Date(now - 12 * 3600000).toISOString(),
  };

  const g3: Grievance = {
    id: 'demo-gr-003',
    organization_id: DEMO_ORG_ID,
    case_number: 'PP-DEMO-2026-003',
    is_anonymous: false,
    submitter_id: 'demo-usr-other-01',
    access_token_hash: null,
    title: '[DEMO] Flexible Working Hours Coordination',
    description: 'Requesting standardized core collaboration hours across the product team for remote colleagues.',
    category_selected: 'Policy',
    category_ai_suggested: 'Remote Work & Policy',
    department_id: DEMO_PERSONAS.Employee.departmentId,
    incident_date: new Date(now - 5 * 86400000).toISOString().split('T')[0],
    severity_employee: 'Low',
    severity_assessed: 'Low',
    risk_level: 'LOW',
    has_safety_red_flag: false,
    status: 'Resolved',
    priority: 'Low',
    allow_hr_followup: true,
    preferred_response_method: 'Platform Case Inbox',
    assigned_to_user_id: DEMO_PERSONAS.Reviewer.id, // Assigned to Reviewer
    sla_due_at: new Date(now - 24 * 3600000).toISOString(),
    resolved_at: new Date(now - 12 * 3600000).toISOString(),
    closed_at: null,
    created_at: new Date(now - 5 * 86400000).toISOString(),
    updated_at: new Date(now - 12 * 3600000).toISOString(),
  };

  const m1: GrievanceMessage = {
    id: 'demo-msg-001',
    organization_id: DEMO_ORG_ID,
    grievance_id: g1.id,
    sender_role: 'EMPLOYEE',
    sender_user_id: DEMO_PERSONAS.Employee.id,
    message_text: 'Attached the handover checklist template for reference.',
    is_internal_note: false,
    created_at: new Date(now - 2 * 86400000).toISOString(),
  };

  const m2: GrievanceMessage = {
    id: 'demo-msg-002',
    organization_id: DEMO_ORG_ID,
    grievance_id: g1.id,
    sender_role: 'HR',
    sender_user_id: DEMO_PERSONAS.Reviewer.id,
    message_text: 'Thank you for raising this. We are scheduling a 15-minute review with the lead.',
    is_internal_note: false,
    created_at: new Date(now - 1 * 86400000).toISOString(),
  };

  return {
    grievances: [g1, g2, g3],
    grievanceMessages: [m1, m2],
    pulses: [],
    feedbacks: [],
    suggestions: [],
  };
}

class DemoDataStore {
  private state: SyntheticDemoState;

  constructor() {
    this.state = createInitialDemoState();
  }

  public reset(): void {
    this.state = createInitialDemoState();
  }

  public getGrievances(role: DemoRole, userId: string): Grievance[] {
    if (role === 'HR_Admin') {
      // HR Admin can view all synthetic demo cases
      return [...this.state.grievances];
    }
    if (role === 'Reviewer') {
      // Reviewer can ONLY access cases specifically assigned to them
      return this.state.grievances.filter((g) => g.assigned_to_user_id === userId);
    }
    if (role === 'Employee') {
      // Employees cannot access the HR Grievance triage inbox
      return [];
    }
    return [];
  }

  public getGrievanceById(id: string, role: DemoRole, userId: string): { grievance: Grievance; messages: GrievanceMessage[] } | null {
    const grievance = this.state.grievances.find((g) => g.id === id);
    if (!grievance) return null;

    // RBAC enforcement:
    // HR_Admin: full access
    // Reviewer: must be assigned
    // Employee: must be submitter
    if (role === 'Reviewer' && grievance.assigned_to_user_id !== userId) {
      return null;
    }
    if (role === 'Employee' && grievance.submitter_id !== userId) {
      return null;
    }

    const messages = this.state.grievanceMessages.filter((m) => m.grievance_id === id);
    return { grievance, messages };
  }

  public updateGrievanceStatus(
    id: string,
    newStatus: any,
    role: DemoRole,
    userId: string
  ): Grievance | null {
    const target = this.state.grievances.find((g) => g.id === id);
    if (!target) return null;

    if (role === 'Reviewer' && target.assigned_to_user_id !== userId) {
      return null;
    }
    if (role === 'Employee') {
      return null;
    }

    target.status = newStatus;
    target.updated_at = new Date().toISOString();
    return target;
  }

  public addMessage(
    grievanceId: string,
    messageText: string,
    isInternalNote: boolean,
    role: DemoRole,
    userId: string
  ): GrievanceMessage | null {
    const grievance = this.state.grievances.find((g) => g.id === grievanceId);
    if (!grievance) return null;

    if (role === 'Reviewer' && grievance.assigned_to_user_id !== userId) {
      return null;
    }

    const newMessage: GrievanceMessage = {
      id: `demo-msg-${Date.now()}`,
      organization_id: DEMO_ORG_ID,
      grievance_id: grievanceId,
      sender_role: role === 'Employee' ? 'EMPLOYEE' : 'HR',
      sender_user_id: userId,
      message_text: messageText,
      is_internal_note: isInternalNote,
      created_at: new Date().toISOString(),
    };

    this.state.grievanceMessages.push(newMessage);
    return newMessage;
  }

  public addPulse(pulse: Omit<EmployeePulse, 'id' | 'created_at'>): EmployeePulse {
    const newPulse: EmployeePulse = {
      id: `demo-pulse-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...pulse,
    };
    this.state.pulses.push(newPulse);
    return newPulse;
  }
}

export const demoDataStore = new DemoDataStore();
