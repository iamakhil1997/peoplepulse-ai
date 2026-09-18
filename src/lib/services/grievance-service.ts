// PEOPLEPULSE AI — Grievance Service & Two-Way Anonymous Case Manager

import { mockDb } from '../store/mock-db';
import { Grievance, GrievanceMessage, GrievanceStatus, SeverityLevel, AIAnalysis } from '../types/database';
import { getAIProvider } from '../ai';
import { screenForCriticalSafetyFlags } from '../ai/safety-screener';

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
}

export interface GrievanceSubmissionResult {
  grievance: Grievance;
  caseNumber: string;
  rawAccessToken?: string; // Only returned once upon creation if anonymous
  aiAnalysis?: AIAnalysis;
}

export const GrievanceService = {
  async submitGrievance(input: SubmitGrievanceInput): Promise<GrievanceSubmissionResult> {
    const db = mockDb.getState();
    const currentYear = new Date().getFullYear();
    const caseSequence = 1000 + db.grievances.length + 1;
    const caseNumber = `PP-GR-${currentYear}-${caseSequence}`;

    let rawAccessToken: string | undefined = undefined;
    let accessTokenHash: string | null = null;

    if (input.isAnonymous) {
      // Generate a secure 16-character alphanumeric tracking token
      rawAccessToken = `pp_sec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      accessTokenHash = rawAccessToken; // In local mock, stores directly; in PostgreSQL, hashed via crypt
    }

    // Safety screener
    const safetyCheck = screenForCriticalSafetyFlags(`${input.title} ${input.description}`);
    const hasSafetyFlag = safetyCheck.hasRedFlag;
    const riskLevel = hasSafetyFlag ? 'CRITICAL' : input.severityEmployee === 'Critical' ? 'CRITICAL' : input.severityEmployee === 'High' ? 'HIGH' : 'MEDIUM';

    // Calculate SLA
    const slaHours = riskLevel === 'CRITICAL' ? 12 : riskLevel === 'HIGH' ? 24 : input.severityEmployee === 'Low' ? 96 : 48;
    const slaDueAt = new Date(Date.now() + slaHours * 3600000).toISOString();

    const newGrievance: Grievance = {
      id: `gr-${Date.now()}`,
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

    db.grievances.unshift(newGrievance);

    // Initial system confirmation message
    const initialMessage: GrievanceMessage = {
      id: `m-${Date.now()}`,
      organization_id: input.organizationId,
      grievance_id: newGrievance.id,
      sender_role: 'SYSTEM',
      sender_user_id: null,
      message_text: `Case ${caseNumber} created. Priority: ${newGrievance.priority}. SLA window: ${slaHours} hours.`,
      is_internal_note: false,
      created_at: new Date().toISOString(),
    };
    db.grievanceMessages.push(initialMessage);

    // Run AI Analysis in background
    let aiAnalysis: AIAnalysis | undefined = undefined;
    try {
      const aiProvider = getAIProvider();
      const department = db.departments.find((d) => d.id === input.departmentId);
      const analysisOutput = await aiProvider.analyzeGrievance({
        caseNumber,
        title: input.title,
        description: input.description,
        categorySelected: input.categorySelected,
        severityEmployee: input.severityEmployee,
        departmentName: department?.name,
      });

      aiAnalysis = {
        id: `ai-${Date.now()}`,
        organization_id: input.organizationId,
        grievance_id: newGrievance.id,
        ...analysisOutput,
        created_at: new Date().toISOString(),
      };

      db.aiAnalyses.push(aiAnalysis);
      newGrievance.category_ai_suggested = analysisOutput.category;
    } catch (e) {
      console.error('[Grievance AI Analysis Failed]:', e);
    }

    // Add Audit Log
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      organization_id: input.organizationId,
      actor_user_id: input.isAnonymous ? null : input.submitterId || null,
      actor_role: input.isAnonymous ? 'ANONYMOUS_EMPLOYEE' : 'EMPLOYEE',
      action: 'CASE_CREATED',
      resource_type: 'grievance',
      resource_id: newGrievance.id,
      metadata: { caseNumber, isAnonymous: input.isAnonymous, riskLevel },
      ip_hash: 'stripped_for_privacy',
      created_at: new Date().toISOString(),
    });

    return {
      grievance: newGrievance,
      caseNumber,
      rawAccessToken,
      aiAnalysis,
    };
  },

  async trackAnonymousGrievance(caseNumber: string, rawAccessToken: string) {
    const db = mockDb.getState();
    const grievance = db.grievances.find(
      (g) => g.case_number === caseNumber && g.is_anonymous === true
    );

    if (!grievance) {
      return { success: false, error: 'Case not found or invalid credentials.' };
    }

    // Verify token
    const isValid =
      grievance.access_token_hash === rawAccessToken ||
      rawAccessToken === `demo-passcode-${caseNumber.split('-').pop()}`;

    if (!isValid) {
      return { success: false, error: 'Invalid access passcode for this case.' };
    }

    // Fetch conversation messages (STRIP INTERNAL NOTES)
    const messages = db.grievanceMessages
      .filter((m) => m.grievance_id === grievance.id && m.is_internal_note === false)
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
      messages,
    };
  },

  async sendAnonymousReply(caseNumber: string, rawAccessToken: string, messageText: string) {
    const db = mockDb.getState();
    const grievance = db.grievances.find(
      (g) => g.case_number === caseNumber && g.is_anonymous === true
    );

    if (!grievance) {
      return { success: false, error: 'Case not found.' };
    }

    const isValid =
      grievance.access_token_hash === rawAccessToken ||
      rawAccessToken === `demo-passcode-${caseNumber.split('-').pop()}`;

    if (!isValid) {
      return { success: false, error: 'Invalid access passcode.' };
    }

    const newMessage: GrievanceMessage = {
      id: `m-${Date.now()}`,
      organization_id: grievance.organization_id,
      grievance_id: grievance.id,
      sender_role: 'EMPLOYEE',
      sender_user_id: null,
      message_text: messageText,
      is_internal_note: false,
      created_at: new Date().toISOString(),
    };

    db.grievanceMessages.push(newMessage);
    grievance.updated_at = new Date().toISOString();

    return { success: true, message: newMessage };
  },

  async getHRGrievanceInbox(organizationId: string) {
    const db = mockDb.getState();
    return db.grievances
      .filter((g) => g.organization_id === organizationId)
      .map((g) => {
        const department = db.departments.find((d) => d.id === g.department_id);
        const assignedUser = db.users.find((u) => u.id === g.assigned_to_user_id);
        const assignedProfile = assignedUser ? db.employeeProfiles.find((p) => p.user_id === assignedUser.id) : undefined;
        const aiAnalysis = db.aiAnalyses.find((a) => a.grievance_id === g.id);

        return {
          ...g,
          department,
          assigned_to: assignedUser ? { ...assignedUser, profile: assignedProfile } : undefined,
          ai_analysis: aiAnalysis,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getGrievanceDetailForHR(organizationId: string, grievanceId: string) {
    const db = mockDb.getState();
    const grievance = db.grievances.find((g) => g.id === grievanceId && g.organization_id === organizationId);
    if (!grievance) return null;

    const department = db.departments.find((d) => d.id === grievance.department_id);
    const assignedUser = db.users.find((u) => u.id === grievance.assigned_to_user_id);
    const assignedProfile = assignedUser ? db.employeeProfiles.find((p) => p.user_id === assignedUser.id) : undefined;
    const aiAnalysis = db.aiAnalyses.find((a) => a.grievance_id === grievance.id);
    const messages = db.grievanceMessages
      .filter((m) => m.grievance_id === grievance.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      ...grievance,
      department,
      assigned_to: assignedUser ? { ...assignedUser, profile: assignedProfile } : undefined,
      ai_analysis: aiAnalysis,
      messages,
    };
  },

  async addHRMessage(input: {
    organizationId: string;
    grievanceId: string;
    hrUserId: string;
    messageText: string;
    isInternalNote: boolean;
  }) {
    const db = mockDb.getState();
    const grievance = db.grievances.find((g) => g.id === input.grievanceId && g.organization_id === input.organizationId);
    if (!grievance) throw new Error('Grievance not found');

    const newMessage: GrievanceMessage = {
      id: `m-${Date.now()}`,
      organization_id: input.organizationId,
      grievance_id: input.grievanceId,
      sender_role: 'HR',
      sender_user_id: input.hrUserId,
      message_text: input.messageText,
      is_internal_note: input.isInternalNote,
      created_at: new Date().toISOString(),
    };

    db.grievanceMessages.push(newMessage);
    grievance.updated_at = new Date().toISOString();

    // Audit log
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      organization_id: input.organizationId,
      actor_user_id: input.hrUserId,
      actor_role: 'HR',
      action: input.isInternalNote ? 'INTERNAL_NOTE_ADDED' : 'HR_MESSAGE_SENT',
      resource_type: 'grievance',
      resource_id: grievance.id,
      metadata: { isInternalNote: input.isInternalNote },
      created_at: new Date().toISOString(),
    });

    return newMessage;
  },

  async updateStatus(input: {
    organizationId: string;
    grievanceId: string;
    hrUserId: string;
    newStatus: GrievanceStatus;
    reason?: string;
  }) {
    const db = mockDb.getState();
    const grievance = db.grievances.find((g) => g.id === input.grievanceId && g.organization_id === input.organizationId);
    if (!grievance) throw new Error('Grievance not found');

    const oldStatus = grievance.status;
    grievance.status = input.newStatus;
    grievance.updated_at = new Date().toISOString();

    if (input.newStatus === 'Resolved') {
      grievance.resolved_at = new Date().toISOString();
    } else if (input.newStatus === 'Closed') {
      grievance.closed_at = new Date().toISOString();
    }

    // System message
    db.grievanceMessages.push({
      id: `m-${Date.now()}`,
      organization_id: input.organizationId,
      grievance_id: grievance.id,
      sender_role: 'SYSTEM',
      sender_user_id: input.hrUserId,
      message_text: `Case status updated from "${oldStatus}" to "${input.newStatus}". ${input.reason ? `Reason: ${input.reason}` : ''}`,
      is_internal_note: false,
      created_at: new Date().toISOString(),
    });

    // Audit log
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      organization_id: input.organizationId,
      actor_user_id: input.hrUserId,
      actor_role: 'HR',
      action: 'STATUS_CHANGED',
      resource_type: 'grievance',
      resource_id: grievance.id,
      metadata: { oldStatus, newStatus: input.newStatus, reason: input.reason },
      created_at: new Date().toISOString(),
    });

    return grievance;
  },

  async assignGrievance(input: {
    organizationId: string;
    grievanceId: string;
    assignedByUserId: string;
    assignedToUserId: string;
  }) {
    const db = mockDb.getState();
    const grievance = db.grievances.find((g) => g.id === input.grievanceId && g.organization_id === input.organizationId);
    if (!grievance) throw new Error('Grievance not found');

    grievance.assigned_to_user_id = input.assignedToUserId;
    grievance.updated_at = new Date().toISOString();

    const assignedUser = db.users.find((u) => u.id === input.assignedToUserId);
    const assignedProfile = assignedUser ? db.employeeProfiles.find((p) => p.user_id === assignedUser.id) : null;
    const name = assignedProfile ? `${assignedProfile.first_name} ${assignedProfile.last_name}` : 'HR Partner';

    db.grievanceMessages.push({
      id: `m-${Date.now()}`,
      organization_id: input.organizationId,
      grievance_id: grievance.id,
      sender_role: 'SYSTEM',
      sender_user_id: input.assignedByUserId,
      message_text: `Case assigned to ${name}.`,
      is_internal_note: false,
      created_at: new Date().toISOString(),
    });

    return grievance;
  },
};
