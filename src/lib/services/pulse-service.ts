// PEOPLEPULSE AI — Employee Pulse & Voice Service
// Supports Supabase PostgreSQL and Persistent File/In-Memory Storage with strict tenant isolation

import { persistentStore } from '../store/persistent-store';
import { EmployeePulse, Feedback, Suggestion, MoodScore, MoodLabel } from '../types/database';
import { K_ANONYMITY_MIN_COHORT } from '../constants';
import { createAdminClient } from '../supabase/admin';

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
  isDemo?: boolean;
}

export const PulseService = {
  // Check if Supabase connection is currently active
  async isSupabaseAvailable(): Promise<boolean> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.from('organizations').select('id').limit(1);
      return !error && !!data;
    } catch {
      return false;
    }
  },

  async submitPulse(input: PulseSubmissionInput): Promise<EmployeePulse> {
    const isDemo = Boolean(input.isDemo);

    // 1. If not demo and Supabase is reachable, write to Supabase
    if (!isDemo) {
      const supabaseActive = await this.isSupabaseAvailable();
      if (supabaseActive) {
        const admin = createAdminClient();
        const { data, error } = await admin
          .from('employee_pulses')
          .insert({
            organization_id: input.organizationId,
            submitter_id: input.isAnonymous ? null : input.submitterId || null,
            department_id: input.departmentId || null,
            mood_score: input.moodScore,
            mood_label: input.moodLabel,
            category: input.category || 'General',
            comment: input.comment || null,
            is_anonymous: input.isAnonymous,
            allow_hr_followup: input.allowHrFollowup,
          })
          .select()
          .single();

        if (!error && data) {
          return data as EmployeePulse;
        }
      }
    }

    // 2. Persistent Store Handler (Used for Demo Mode and Local/Fallback)
    const store = persistentStore.read(isDemo);

    // Idempotency: Prevent duplicate submissions within 30 seconds from same user
    if (!input.isAnonymous && input.submitterId) {
      const thirtySecAgo = new Date(Date.now() - 30_000).toISOString();
      const existing = store.pulses.find(
        (p) =>
          p.submitter_id === input.submitterId &&
          p.created_at >= thirtySecAgo &&
          p.mood_score === input.moodScore
      );
      if (existing) {
        return existing;
      }
    }

    const newPulse: EmployeePulse = {
      id: `pulse-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization_id: input.organizationId,
      submitter_id: input.isAnonymous ? null : input.submitterId || null,
      department_id: input.departmentId || null,
      mood_score: input.moodScore,
      mood_label: input.moodLabel,
      category: input.category || 'General',
      comment: input.comment || undefined,
      is_anonymous: input.isAnonymous,
      allow_hr_followup: input.allowHrFollowup,
      created_at: new Date().toISOString(),
    };

    store.pulses.unshift(newPulse);
    persistentStore.write(isDemo, store);
    return newPulse;
  },

  async getOrgPulses(organizationId: string, days = 30, isDemo = false): Promise<EmployeePulse[]> {
    if (!isDemo) {
      const supabaseActive = await this.isSupabaseAvailable();
      if (supabaseActive) {
        const admin = createAdminClient();
        const cutoff = new Date(Date.now() - days * 86400000).toISOString();
        const { data } = await admin
          .from('employee_pulses')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false });

        if (data) return data as EmployeePulse[];
      }
    }

    const store = persistentStore.read(isDemo);
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return store.pulses.filter(
      (p) => p.organization_id === organizationId && p.created_at >= cutoff
    );
  },

  async getEmployeePulseHistory(submitterId: string, isDemo = false): Promise<EmployeePulse[]> {
    if (!isDemo) {
      const supabaseActive = await this.isSupabaseAvailable();
      if (supabaseActive) {
        const admin = createAdminClient();
        const { data } = await admin
          .from('employee_pulses')
          .select('*')
          .eq('submitter_id', submitterId)
          .order('created_at', { ascending: false });

        if (data) return data as EmployeePulse[];
      }
    }

    const store = persistentStore.read(isDemo);
    return store.pulses
      .filter((p) => p.submitter_id === submitterId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getDepartmentMoodAverages(
    organizationId: string,
    days = 30,
    isDemo = false
  ): Promise<Array<{
    departmentId: string;
    departmentName: string;
    averageMood: number | null;
    submissionCount: number;
    hasPrivacyThreshold: boolean;
  }>> {
    const pulses = await this.getOrgPulses(organizationId, days, isDemo);
    const store = persistentStore.read(isDemo);
    const departments = store.departments.filter((d) => d.organization_id === organizationId);

    return departments.map((dept) => {
      const deptPulses = pulses.filter((p) => p.department_id === dept.id);
      const count = deptPulses.length;
      const meetsPrivacy = count >= K_ANONYMITY_MIN_COHORT;

      if (count === 0) {
        return {
          departmentId: dept.id,
          departmentName: dept.name,
          averageMood: null,
          submissionCount: 0,
          hasPrivacyThreshold: false,
        };
      }

      const sum = deptPulses.reduce((acc, curr) => acc + curr.mood_score, 0);
      const avg = Number((sum / count).toFixed(1));

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        averageMood: meetsPrivacy ? avg : null,
        submissionCount: count,
        hasPrivacyThreshold: meetsPrivacy,
      };
    });
  },

  async submitSuggestion(input: {
    organizationId: string;
    submitterId?: string;
    title: string;
    description: string;
    departmentId?: string;
    isAnonymous: boolean;
  }): Promise<Suggestion> {
    return {
      id: `sug-${Date.now()}`,
      organization_id: input.organizationId,
      submitter_id: input.isAnonymous ? null : input.submitterId || null,
      department_id: input.departmentId || null,
      title: input.title,
      description: input.description,
      impact_area: 'General',
      status: 'Submitted',
      is_anonymous: input.isAnonymous,
      upvotes_count: 0,
      created_at: new Date().toISOString(),
    };
  },

  async submitFeedback(input: {
    organizationId: string;
    submitterId?: string;
    type: string;
    title: string;
    content: string;
    departmentId?: string;
    isAnonymous: boolean;
  }): Promise<Feedback> {
    return {
      id: `fb-${Date.now()}`,
      organization_id: input.organizationId,
      submitter_id: input.isAnonymous ? null : input.submitterId || null,
      department_id: input.departmentId || null,
      type: input.type as any,
      title: input.title,
      content: input.content,
      is_anonymous: input.isAnonymous,
      created_at: new Date().toISOString(),
    };
  },
};
