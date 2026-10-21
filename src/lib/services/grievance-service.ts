// PEOPLEPULSE AI — Grievance Service & Two-Way Anonymous Case Manager
// Supports Supabase PostgreSQL and Persistent File Storage with status history audit logs

import { persistentStore } from '../store/persistent-store';
import { mockDb } from '../store/mock-db';
import {
  Grievance,
  GrievanceMessage,
  GrievanceStatus,
  SeverityLevel,
  AIAnalysis,
  GrievanceStatusHistory,
} from '../types/database';
import { screenForCriticalSafetyFlags } from '../ai/safety-screener';
import { createAdminClient } from '../supabase/admin';

export interface SubmitGrievanceInput {
  organizationId: string;
  submitterId?: string | null;
  departmentId?: string | null;
  title: string;
  description: string;
  categorySelected: string;
  incidentDate?: string | null;
  severityEmployee: SeverityLevel;
  isAnonymous: boolean;
  allowHrFollowup: boolean;
  preferredResponseMethod?: string;
  isDemo?: boolean;
}

export interface GrievanceSubmissionResult {
  grievance: Grievance;
  caseNumber: string;
  rawAccessToken?: string;
  aiAnalysis?: AIAnalysis;
}

export const GrievanceService = {
  async isSupabaseAvailable(): Promise<boolean> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.from('organizations').select('id').limit(1);
      return !error && !!data;
    } catch {
      return false;
    }
  },

  async submitGrievance(input: SubmitGrievanceInput): Promise<GrievanceSubmissionResult> {
    const isDemo = Boolean(input.isDemo);
    const store = persistentStore.read(isDemo);

    const currentYear = new Date().getFullYear();
    const caseSequence = 1000 + store.grievances.length + 1;
    const caseNumber = `PP-GR-${currentYear}-${caseSequence}`;

    let rawAccessToken: string | undefined = undefined;
    let accessTokenHash: string | null = null;

    if (input.isAnonymous) {
      rawAccessToken = `pp_sec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      accessTokenHash = rawAccessToken;
    }

    const safetyCheck = screenForCriticalSafetyFlags(`${input.title} ${input.description}`);
    const hasSafetyFlag = safetyCheck.hasRedFlag;
    const riskLevel = hasSafetyFlag ? 'CRITICAL' : input.severityEmployee === 'Critical' ? 'CRITICAL' : input.severityEmployee === 'High' ? 'HIGH' : 'MEDIUM';

    const slaHours = riskLevel === 'CRITICAL' ? 12 : riskLevel === 'HIGH' ? 24 : input.severityEmployee === 'Low' ? 96 : 48;
    const slaDueAt = new Date(Date.now() + slaHours * 3600000).toISOString();

    const newGrievance: Grievance = {
      id: `gr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization_id: input.organizationId,
      case_number: caseNumber,
      is_anonymous: input.isAnonymous,
      submitter_id: input.isAnonymous ? null : input.submitterId || null,
      access_token_hash: accessTokenHash,
      title: input.title,
      description: input.description,
      category_selected: input.categorySelected,
      department_id: input.departmentId || null,
      incident_date: input.incidentDate || null,
      severity_employee: input.severityEmployee,
      severity_assessed: hasSafetyFlag ? 'Critical' : input.severityEmployee,
      risk_level: riskLevel,
      has_safety_red_flag: hasSafetyFlag,
      status: hasSafetyFlag ? 'Escalated' : 'New',
      priority: hasSafetyFlag ? 'Critical' : input.severityEmployee,
      allow_hr_followup: input.allowHrFollowup,
      preferred_response_method: input.preferredResponseMethod || 'Platform Case Inbox',
      assigned_to_user_id: null,
      sla_due_at: slaDueAt,
      resolved_at: null,
      closed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If Supabase is available and not demo mode, persist to Supabase
    if (!isDemo) {
      const supabaseActive = await this.isSupabaseAvailable();
      if (supabaseActive) {
        try {
          const admin = createAdminClient();
          await admin.from('grievances').insert(newGrievance);
        } catch {
          // Fall through to persistent store
        }
      }
    }

    // Persist to store & mockDb for test compatibility
    store.grievances.unshift(newGrievance);
    mockDb.getState().grievances.unshift(newGrievance);

    // Initial audit log entry
    const initialHistory: GrievanceStatusHistory = {
      id: `hist-${Date.now()}`,
      organization_id: input.organizationId,
      grievance_id: newGrievance.id,
      changed_by_user_id: input.isAnonymous ? null : input.submitterId || null,
      old_status: null,
      new_status: newGrievance.status,
      reason: 'Grievance submitted by employee.',
      created_at: new Date().toISOString(),
    };
    store.grievanceStatusHistory.unshift(initialHistory);

    persistentStore.write(isDemo, store);

    return {
      grievance: newGrievance,
      caseNumber,
      rawAccessToken,
    };
  },

  async getHRGrievanceInbox(organizationId: string, role?: string, userId?: string, isDemo = false): Promise<Grievance[]> {
    const store = persistentStore.read(isDemo);
    let grievances = store.grievances.filter((g) => g.organization_id === organizationId);

    // Also include mockDb records for legacy unit test compatibility
    const mockGrievances = mockDb.getState().grievances.filter((g) => g.organization_id === organizationId);
    for (const mg of mockGrievances) {
      if (!grievances.some((g) => g.id === mg.id || g.case_number === mg.case_number)) {
        grievances.push(mg);
      }
    }

    // Scoped access: Reviewers can only access cases assigned to them
    if (role === 'Reviewer' && userId) {
      grievances = grievances.filter((g) => g.assigned_to_user_id === userId);
    }

    // Employees cannot access the HR triage inbox
    if (role === 'Employee') {
      return [];
    }

    return grievances;
  },

  async getGrievanceDetail(
    organizationId: string,
    grievanceId: string,
    role?: string,
    userId?: string,
    isDemo = false
  ): Promise<{ grievance: Grievance; messages: GrievanceMessage[]; history: GrievanceStatusHistory[] } | null> {
    const store = persistentStore.read(isDemo);
    let grievance = store.grievances.find(
      (g) => g.id === grievanceId && g.organization_id === organizationId
    );

    if (!grievance) {
      grievance = mockDb.getState().grievances.find((g) => g.id === grievanceId && g.organization_id === organizationId);
    }

    if (!grievance) return null;

    // RBAC check
    if (role === 'Reviewer' && userId && grievance.assigned_to_user_id !== userId) {
      return null;
    }
    if (role === 'Employee' && userId && grievance.submitter_id !== userId) {
      return null;
    }

    const messages = store.grievanceMessages
      .filter((m) => m.grievance_id === grievanceId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const history = store.grievanceStatusHistory
      .filter((h) => h.grievance_id === grievanceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { grievance, messages, history };
  },

  async updateStatus(input: {
    organizationId: string;
    grievanceId: string;
    changedByUserId: string;
    newStatus: GrievanceStatus;
    reason?: string;
    role?: string;
    isDemo?: boolean;
  }): Promise<Grievance | null> {
    const isDemo = Boolean(input.isDemo);
    const store = persistentStore.read(isDemo);
    const grievance = store.grievances.find(
      (g) => g.id === input.grievanceId && g.organization_id === input.organizationId
    );

    if (!grievance) return null;

    // Permissions check
    if (input.role === 'Employee') return null;
    if (input.role === 'Reviewer' && grievance.assigned_to_user_id !== input.changedByUserId) {
      return null;
    }

    const oldStatus = grievance.status;
    grievance.status = input.newStatus;
    grievance.updated_at = new Date().toISOString();

    if (input.newStatus === 'Resolved') {
      grievance.resolved_at = new Date().toISOString();
    }
    if (input.newStatus === 'Closed') {
      grievance.closed_at = new Date().toISOString();
    }

    // Record in history audit table
    const auditRecord: GrievanceStatusHistory = {
      id: `hist-${Date.now()}`,
      organization_id: input.organizationId,
      grievance_id: input.grievanceId,
      changed_by_user_id: input.changedByUserId,
      old_status: oldStatus,
      new_status: input.newStatus,
      reason: input.reason || `Status updated to ${input.newStatus}`,
      created_at: new Date().toISOString(),
    };
    store.grievanceStatusHistory.unshift(auditRecord);

    persistentStore.write(isDemo, store);
    return grievance;
  },

  async assignGrievance(input: {
    organizationId: string;
    grievanceId: string;
    assignedByUserId: string;
    assignedToUserId: string;
    isDemo?: boolean;
  }): Promise<Grievance | null> {
    const isDemo = Boolean(input.isDemo);
    const store = persistentStore.read(isDemo);
    const grievance = store.grievances.find((g) => g.id === input.grievanceId);
    if (!grievance) return null;

    grievance.assigned_to_user_id = input.assignedToUserId;
    grievance.updated_at = new Date().toISOString();

    persistentStore.write(isDemo, store);
    return grievance;
  },

  async addMessage(input: {
    organizationId: string;
    grievanceId: string;
    senderUserId?: string | null;
    senderRole: 'EMPLOYEE' | 'HR' | 'SYSTEM';
    messageText: string;
    isInternalNote: boolean;
    isDemo?: boolean;
  }): Promise<GrievanceMessage | null> {
    const isDemo = Boolean(input.isDemo);
    const store = persistentStore.read(isDemo);
    const grievance = store.grievances.find((g) => g.id === input.grievanceId);
    if (!grievance) return null;

    const message: GrievanceMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization_id: input.organizationId,
      grievance_id: input.grievanceId,
      sender_role: input.senderRole,
      sender_user_id: input.senderUserId || null,
      message_text: input.messageText,
      is_internal_note: input.isInternalNote,
      attachments: [],
      created_at: new Date().toISOString(),
    };

    store.grievanceMessages.push(message);
    mockDb.getState().grievanceMessages.push(message);
    persistentStore.write(isDemo, store);
    return message;
  },

  // Alias for backward compatibility with tests
  async addHRMessage(input: {
    organizationId: string;
    grievanceId: string;
    hrUserId?: string | null;
    messageText: string;
    isInternalNote?: boolean;
    isDemo?: boolean;
  }): Promise<GrievanceMessage | null> {
    return this.addMessage({
      organizationId: input.organizationId,
      grievanceId: input.grievanceId,
      senderUserId: input.hrUserId || null,
      senderRole: 'HR',
      messageText: input.messageText,
      isInternalNote: Boolean(input.isInternalNote),
      isDemo: input.isDemo,
    });
  },

  async trackAnonymousGrievance(caseNumber: string, passcode: string, isDemo = true) {
    const store = persistentStore.read(isDemo);
    let grievance = store.grievances.find(
      (g) => g.case_number === caseNumber && g.access_token_hash === passcode
    );

    // Fallback check against mockDb
    if (!grievance) {
      grievance = mockDb.getState().grievances.find(
        (g) => g.case_number === caseNumber && g.access_token_hash === passcode
      );
    }

    if (!grievance) {
      return { success: false, error: 'Case not found or invalid credentials.' };
    }

    // Filter out internal notes for anonymous complainant
    const allMessages = [...store.grievanceMessages, ...mockDb.getState().grievanceMessages];
    const publicMessages = allMessages
      .filter((m) => m.grievance_id === grievance!.id && !m.is_internal_note)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      success: true,
      case: {
        id: grievance.id,
        case_number: grievance.case_number,
        title: grievance.title,
        description: grievance.description,
        category_selected: grievance.category_selected,
        status: grievance.status,
        severity_employee: grievance.severity_employee,
        created_at: grievance.created_at,
        sla_due_at: grievance.sla_due_at,
        allow_hr_followup: grievance.allow_hr_followup,
      },
      messages: publicMessages,
    };
  },
};
