// PEOPLEPULSE AI — Employee Pulse & Voice Service

import { mockDb } from '../store/mock-db';
import { EmployeePulse, Feedback, Suggestion, MoodScore, MoodLabel } from '../types/database';
import { K_ANONYMITY_MIN_COHORT } from '../constants';

export interface PulseSubmissionInput {
  organizationId: string;
  submitterId?: string | null;
  departmentId?: string | null;
  moodScore: MoodScore;
  moodLabel: MoodLabel;
  category?: string;
  comment?: string;
  isAnonymous: boolean;
  allowHrFollowup: boolean;
}

export const PulseService = {
  async submitPulse(input: PulseSubmissionInput): Promise<EmployeePulse> {
    const db = mockDb.getState();
    const newPulse: EmployeePulse = {
      id: `p-${Date.now()}`,
      organization_id: input.organizationId,
      submitter_id: input.isAnonymous ? null : input.submitterId || null,
      department_id: input.departmentId || null,
      mood_score: input.moodScore,
      mood_label: input.moodLabel,
      category: input.category || 'General',
      comment: input.comment || '',
      is_anonymous: input.isAnonymous,
      allow_hr_followup: input.allowHrFollowup,
      created_at: new Date().toISOString(),
    };

    db.employeePulses.unshift(newPulse);
    return newPulse;
  },

  async getOrgPulses(organizationId: string, days = 30): Promise<EmployeePulse[]> {
    const db = mockDb.getState();
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return db.employeePulses.filter(
      (p) => p.organization_id === organizationId && p.created_at >= cutoff
    );
  },

  async getDepartmentMoodAverages(
    organizationId: string,
    days = 30
  ): Promise<Array<{
    departmentId: string;
    departmentName: string;
    averageMood: number | null;
    submissionCount: number;
    hasPrivacyThreshold: boolean;
  }>> {
    const db = mockDb.getState();
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const depts = db.departments.filter((d) => d.organization_id === organizationId);
    const pulses = db.employeePulses.filter(
      (p) => p.organization_id === organizationId && p.created_at >= cutoff
    );

    return depts.map((dept) => {
      const deptPulses = pulses.filter((p) => p.department_id === dept.id);
      const count = deptPulses.length;
      const hasThreshold = count >= K_ANONYMITY_MIN_COHORT;

      if (!hasThreshold) {
        return {
          departmentId: dept.id,
          departmentName: dept.name,
          averageMood: null, // Guarded for privacy
          submissionCount: count,
          hasPrivacyThreshold: false,
        };
      }

      const totalScore = deptPulses.reduce((acc, curr) => acc + curr.mood_score, 0);
      const avg = count > 0 ? Number((totalScore / count).toFixed(2)) : null;

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        averageMood: avg,
        submissionCount: count,
        hasPrivacyThreshold: true,
      };
    });
  },

  async submitFeedback(input: {
    organizationId: string;
    submitterId?: string | null;
    departmentId?: string | null;
    type: Feedback['type'];
    title: string;
    content: string;
    isAnonymous: boolean;
  }): Promise<Feedback> {
    const db = mockDb.getState();
    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      organization_id: input.organizationId,
      submitter_id: input.isAnonymous ? null : input.submitterId || null,
      department_id: input.departmentId || null,
      type: input.type,
      title: input.title,
      content: input.content,
      is_anonymous: input.isAnonymous,
      created_at: new Date().toISOString(),
    };
    db.feedback.unshift(newFeedback);
    return newFeedback;
  },

  async submitSuggestion(input: {
    organizationId: string;
    submitterId?: string | null;
    departmentId?: string | null;
    title: string;
    description: string;
    impactArea?: string;
    isAnonymous: boolean;
  }): Promise<Suggestion> {
    const db = mockDb.getState();
    const newSuggestion: Suggestion = {
      id: `sug-${Date.now()}`,
      organization_id: input.organizationId,
      submitter_id: input.isAnonymous ? null : input.submitterId || null,
      department_id: input.departmentId || null,
      title: input.title,
      description: input.description,
      impact_area: input.impactArea || 'General',
      status: 'Submitted',
      is_anonymous: input.isAnonymous,
      upvotes_count: 1,
      created_at: new Date().toISOString(),
    };
    db.suggestions.unshift(newSuggestion);
    return newSuggestion;
  },
};
