// PEOPLEPULSE AI — Analytics & People Intelligence Engine

import { mockDb } from '../store/mock-db';
import { HEALTH_SCORE_WEIGHTS, K_ANONYMITY_MIN_COHORT } from '../constants';
import { getAIProvider } from '../ai';

export interface PeopleHealthScoreBreakdown {
  overallScore: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'At Risk' | 'Critical';
  components: {
    moodIndex: { score: number; weight: number; contribution: number; label: string; description: string };
    slaVelocity: { score: number; weight: number; contribution: number; label: string; description: string };
    riskStability: { score: number; weight: number; contribution: number; label: string; description: string };
    recurringContainment: { score: number; weight: number; contribution: number; label: string; description: string };
  };
  formulaExplanation: string;
}

export const AnalyticsService = {
  async getPeopleHealthScore(organizationId: string): Promise<PeopleHealthScoreBreakdown> {
    const db = mockDb.getState();
    const cutoff30 = new Date(Date.now() - 30 * 86400000).toISOString();

    // 1. Mood Component (M: 0-100)
    const pulses = db.employeePulses.filter(
      (p) => p.organization_id === organizationId && p.created_at >= cutoff30
    );
    let moodIndex = 75; // Baseline
    if (pulses.length > 0) {
      const avgScore = pulses.reduce((acc, curr) => acc + curr.mood_score, 0) / pulses.length;
      moodIndex = Math.round(((avgScore - 1) / 4) * 100); // Maps 1..5 to 0..100
    }

    // 2. SLA & Resolution Velocity (S: 0-100)
    const grievances = db.grievances.filter((g) => g.organization_id === organizationId);
    const resolvedGrievances = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed');
    let slaVelocity = 80;
    if (grievances.length > 0) {
      const onTimeCount = grievances.filter((g) => {
        if (!g.sla_due_at) return true;
        if (g.resolved_at) return new Date(g.resolved_at) <= new Date(g.sla_due_at);
        return new Date() <= new Date(g.sla_due_at);
      }).length;
      slaVelocity = Math.round((onTimeCount / grievances.length) * 100);
    }

    // 3. Risk & Critical Issue Stability (R: 0-100)
    const activeCritical = grievances.filter((g) => g.status !== 'Resolved' && g.status !== 'Closed' && (g.risk_level === 'CRITICAL' || g.priority === 'Critical')).length;
    const activeHigh = grievances.filter((g) => g.status !== 'Resolved' && g.status !== 'Closed' && (g.risk_level === 'HIGH' || g.priority === 'High')).length;
    const riskDeductions = activeCritical * 15 + activeHigh * 5;
    const riskStability = Math.max(0, Math.min(100, 100 - riskDeductions));

    // 4. Recurring Issue Containment (V: 0-100)
    const recurring = db.recurringIssues.filter((r) => r.organization_id === organizationId);
    const increasingCount = recurring.filter((r) => r.trend_direction === 'INCREASING').length;
    const recurringContainment = Math.max(0, Math.min(100, 100 - increasingCount * 18));

    // Calculate Overall Weighted Score
    const overallScore = Math.round(
      moodIndex * HEALTH_SCORE_WEIGHTS.MOOD_WEIGHT +
      slaVelocity * HEALTH_SCORE_WEIGHTS.SLA_WEIGHT +
      riskStability * HEALTH_SCORE_WEIGHTS.RISK_WEIGHT +
      recurringContainment * HEALTH_SCORE_WEIGHTS.RECURRING_WEIGHT
    );

    let grade: PeopleHealthScoreBreakdown['grade'] = 'Good';
    if (overallScore >= 85) grade = 'Excellent';
    else if (overallScore >= 70) grade = 'Good';
    else if (overallScore >= 55) grade = 'Fair';
    else if (overallScore >= 40) grade = 'At Risk';
    else grade = 'Critical';

    return {
      overallScore,
      grade,
      components: {
        moodIndex: {
          score: moodIndex,
          weight: HEALTH_SCORE_WEIGHTS.MOOD_WEIGHT,
          contribution: Number((moodIndex * HEALTH_SCORE_WEIGHTS.MOOD_WEIGHT).toFixed(1)),
          label: 'Employee Mood Index',
          description: `Average mood score (${pulses.length} responses in 30 days)`,
        },
        slaVelocity: {
          score: slaVelocity,
          weight: HEALTH_SCORE_WEIGHTS.SLA_WEIGHT,
          contribution: Number((slaVelocity * HEALTH_SCORE_WEIGHTS.SLA_WEIGHT).toFixed(1)),
          label: 'SLA & Resolution Velocity',
          description: `${resolvedGrievances.length} resolved cases; ${slaVelocity}% SLA adherence`,
        },
        riskStability: {
          score: riskStability,
          weight: HEALTH_SCORE_WEIGHTS.RISK_WEIGHT,
          contribution: Number((riskStability * HEALTH_SCORE_WEIGHTS.RISK_WEIGHT).toFixed(1)),
          label: 'Risk & Safety Stability',
          description: `${activeCritical} active critical & ${activeHigh} active high-risk cases`,
        },
        recurringContainment: {
          score: recurringContainment,
          weight: HEALTH_SCORE_WEIGHTS.RECURRING_WEIGHT,
          contribution: Number((recurringContainment * HEALTH_SCORE_WEIGHTS.RECURRING_WEIGHT).toFixed(1)),
          label: 'Recurring Issue Containment',
          description: `${recurring.length} active clusters (${increasingCount} increasing)`,
        },
      },
      formulaExplanation:
        'People Health Score = (0.35 × Mood Index) + (0.25 × SLA Velocity) + (0.20 × Risk Stability) + (0.20 × Recurring Issue Containment)',
    };
  },

  async getExecutiveDashboardMetrics(organizationId: string) {
    const db = mockDb.getState();
    const cutoff30 = new Date(Date.now() - 30 * 86400000).toISOString();

    const healthScore = await this.getPeopleHealthScore(organizationId);
    const pulses = db.employeePulses.filter((p) => p.organization_id === organizationId && p.created_at >= cutoff30);
    const avgMood = pulses.length > 0 ? (pulses.reduce((acc, curr) => acc + curr.mood_score, 0) / pulses.length).toFixed(1) : '4.0';

    const grievances = db.grievances.filter((g) => g.organization_id === organizationId);
    const activeGrievances = grievances.filter((g) => g.status !== 'Resolved' && g.status !== 'Closed');
    const criticalIssues = activeGrievances.filter((g) => g.risk_level === 'CRITICAL' || g.priority === 'Critical');

    // Mood timeline (last 7 data points)
    const moodTrend = [
      { day: 'Mon', score: 4.2, label: 'Good' },
      { day: 'Tue', score: 3.9, label: 'Okay' },
      { day: 'Wed', score: 3.6, label: 'Okay' },
      { day: 'Thu', score: 3.4, label: 'Low' },
      { day: 'Fri', score: 3.8, label: 'Good' },
      { day: 'Sat', score: 3.9, label: 'Good' },
      { day: 'Today', score: Number(avgMood), label: 'Current' },
    ];

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    grievances.forEach((g) => {
      categoryCounts[g.category_selected] = (categoryCounts[g.category_selected] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Department breakdown with K-Anonymity privacy check
    const depts = db.departments.filter((d) => d.organization_id === organizationId);
    const departmentDistribution = depts.map((dept) => {
      const deptPulses = pulses.filter((p) => p.department_id === dept.id);
      const deptGrievances = grievances.filter((g) => g.department_id === dept.id);
      const isPrivacyGuarded = deptPulses.length < K_ANONYMITY_MIN_COHORT;

      return {
        id: dept.id,
        name: dept.name,
        grievanceCount: deptGrievances.length,
        pulseCount: deptPulses.length,
        averageMood: isPrivacyGuarded ? null : Number((deptPulses.reduce((a, c) => a + c.mood_score, 0) / (deptPulses.length || 1)).toFixed(2)),
        isPrivacyGuarded,
      };
    });

    return {
      healthScore,
      avgMood,
      activeGrievanceCount: activeGrievances.length,
      criticalGrievanceCount: criticalIssues.length,
      totalGrievanceCount: grievances.length,
      slaComplianceRate: healthScore.components.slaVelocity.score,
      moodTrend,
      categoryDistribution,
      departmentDistribution,
      recurringIssues: db.recurringIssues.filter((r) => r.organization_id === organizationId),
      aiInsights: db.aiInsights.filter((i) => i.organization_id === organizationId && !i.is_dismissed),
      actionRecommendations: db.actionRecommendations.filter((a) => a.organization_id === organizationId),
    };
  },

  async queryPeopleIntelligence(organizationId: string, question: string) {
    const db = mockDb.getState();
    const org = db.organizations.find((o) => o.id === organizationId);
    const pulses = db.employeePulses.filter((p) => p.organization_id === organizationId);
    const grievances = db.grievances.filter((g) => g.organization_id === organizationId);
    const recurring = db.recurringIssues.filter((r) => r.organization_id === organizationId);

    const grievanceSummary = `Active Cases: ${grievances.filter((g) => g.status !== 'Resolved').length}. Categories: ${grievances.map((g) => g.category_selected).join(', ')}. Top issues: unrecorded overtime in operations, compensation transparency.`;
    const pulseSummary = `Total Pulses: ${pulses.length}. Mood distribution: ${pulses.filter((p) => p.mood_score <= 2).length} low/very-low responses, mainly in Operations.`;
    const recurringIssuesSummary = `Recurring Clusters: ${recurring.map((r) => `${r.topic_title} (${r.issue_count} cases, ${r.trend_direction})`).join('; ')}`;

    const aiProvider = getAIProvider();
    return aiProvider.answerHRQuery({
      question,
      orgContext: {
        orgName: org?.name || 'Northstar Technologies',
        totalEmployeesApprox: 120,
        grievanceSummary,
        pulseSummary,
        recurringIssuesSummary,
      },
    });
  },
};
