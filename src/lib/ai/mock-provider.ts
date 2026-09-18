// PEOPLEPULSE AI — Mock AI Provider for Offline Development & Fast Unit Tests

import {
  AIAssistantProvider,
  GrievanceAnalysisInput,
  GrievanceAnalysisOutput,
  HRQueryInput,
  HRQueryOutput,
  MorningBriefingInput,
  MorningBriefingOutput,
} from './provider';
import { screenForCriticalSafetyFlags } from './safety-screener';

export class MockAIProvider implements AIAssistantProvider {
  public providerName = 'mock-local-ai';

  async analyzeGrievance(input: GrievanceAnalysisInput): Promise<GrievanceAnalysisOutput> {
    const safetyCheck = screenForCriticalSafetyFlags(`${input.title} ${input.description}`);
    const isCritical = safetyCheck.hasRedFlag || input.severityEmployee === 'Critical';

    return {
      summary: `Employee submitted a concern categorized under "${input.categorySelected}" regarding "${input.title}".`,
      category: input.categorySelected,
      subcategory: input.categorySelected === 'Workload' ? 'Overtime & Shift Fatigue' : 'Workplace Conduct',
      sentiment_score: isCritical ? -0.88 : -0.52,
      urgency: isCritical ? 'Immediate' : input.severityEmployee === 'High' ? 'High' : 'Medium',
      risk_level: isCritical ? 'CRITICAL' : input.severityEmployee === 'High' ? 'HIGH' : 'MEDIUM',
      key_topics: [input.categorySelected.toLowerCase(), 'workplace climate', 'employee voice'],
      possible_policy_area: 'Code of Conduct & Dispute Resolution (Section 3.1)',
      similar_issue_keywords: [input.categorySelected.toLowerCase(), 'workplace friction'],
      recommended_hr_response: `Hello. Thank you for submitting this report. We take these matters seriously and have assigned your case (${input.caseNumber}) for review. Your confidentiality is fully maintained.`,
      recommended_next_actions: [
        { action: 'Initiate initial fact-finding review', priority: isCritical ? 'High' : 'Medium' },
        { action: 'Review related team sentiment logs', priority: 'Medium' },
      ],
      escalation_recommended: isCritical,
      reasoning_summary: safetyCheck.hasRedFlag
        ? `[CRITICAL SAFETY SIGNAL TRIGGERED] ${safetyCheck.alertNotice}`
        : `Evaluated based on reported employee severity (${input.severityEmployee}) and category specifics.`,
      model_version: this.providerName,
    };
  }

  async generateMorningBriefing(input: MorningBriefingInput): Promise<MorningBriefingOutput> {
    return {
      greeting: `Good morning. Here is your daily People Intelligence Briefing for ${input.organizationName}.`,
      summary: `Pulse ratings average ${input.averageMood30Days.toFixed(1)}/5.0 across teams. There are ${input.activeGrievanceCount} open cases with ${input.criticalGrievanceCount} requiring priority triage.`,
      insights: [
        {
          type: 'CRITICAL_ALERT',
          headline: '1 Critical Grievance in Engineering requires expedited triage',
          evidence: 'Retrospective hostility report is approaching the 12-hour SLA window.',
          confidence: 0.98,
          affectedDepartment: 'Engineering',
          recommendedAction: 'Assign a dedicated people partner for immediate confidential review.',
        },
        {
          type: 'EMERGING_SIGNAL',
          headline: 'Operations mood has declined 14% over the last 3 weeks',
          evidence: 'Average mood dropped from 3.8 to 2.4 across recent submissions citing overtime.',
          confidence: 0.92,
          affectedDepartment: 'Operations',
          recommendedAction: 'Schedule a confidential workload alignment session with team leads.',
        },
        {
          type: 'RECURRING_ISSUE',
          headline: 'Workload & Overtime complaints cluster in Operations',
          evidence: '8 separate feedback items match keywords around unrecorded overtime.',
          confidence: 0.89,
          affectedDepartment: 'Operations',
          recommendedAction: 'Launch a targeted 3-question pulse survey on shift handover clarity.',
        },
        {
          type: 'POSITIVE_SIGNAL',
          headline: 'Engineering team sentiment improved for third consecutive week',
          evidence: 'Mood average rose to 4.4 following async planning adoption.',
          confidence: 0.94,
          affectedDepartment: 'Engineering',
          recommendedAction: 'Share async workflow best practices with other technical teams.',
        },
      ],
    };
  }

  async answerHRQuery(input: HRQueryInput): Promise<HRQueryOutput> {
    return {
      answer: `Based on current records for ${input.orgContext.orgName}, the primary area of friction centers around shift balancing and overtime compensation in Operations, while Engineering and Support are showing stable to positive satisfaction trends.`,
      keyFindings: [
        'Operations accounts for 65% of recent low-mood pulse submissions.',
        'Overtime and shift duration are the highest frequency complaint themes.',
        'Engineering satisfaction has risen 18% month-over-month.',
      ],
      suggestedFollowUpActions: [
        'Launch targeted Operations staffing pulse survey.',
        'Conduct confidential listening sessions with evening shift leads.',
        'Audit recent overtime timesheets against system logs.',
      ],
      dataSourcesReferenced: ['Employee Pulses (Last 30 Days)', 'Active Grievances', 'Recurring Issue Clusters'],
      disclaimer: 'AI Decision Support: Generated for HR guidance and analytical triage only. Does not determine guilt or replace human judgment.',
    };
  }
}
