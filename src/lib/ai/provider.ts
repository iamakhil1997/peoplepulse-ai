// PEOPLEPULSE AI — AI Provider Abstraction Interface

import { RiskLevel, SeverityLevel } from '../types/database';

export interface GrievanceAnalysisInput {
  caseNumber: string;
  title: string;
  description: string;
  categorySelected: string;
  severityEmployee: SeverityLevel;
  departmentName?: string;
}

export interface GrievanceAnalysisOutput {
  summary: string;
  category: string;
  subcategory: string;
  sentiment_score: number; // -1.0 to 1.0
  urgency: 'Low' | 'Medium' | 'High' | 'Immediate';
  risk_level: RiskLevel;
  key_topics: string[];
  possible_policy_area: string;
  similar_issue_keywords: string[];
  recommended_hr_response: string;
  recommended_next_actions: Array<{ action: string; priority: string }>;
  escalation_recommended: boolean;
  reasoning_summary: string;
  model_version: string;
}

export interface MorningBriefingInput {
  organizationName: string;
  activeGrievanceCount: number;
  criticalGrievanceCount: number;
  averageMood30Days: number;
  recentMoodTrend: string;
  departmentStats: Array<{
    name: string;
    averageMood: number;
    grievanceCount: number;
  }>;
  recentGrievancesSample: Array<{
    caseNumber: string;
    category: string;
    riskLevel: string;
    title: string;
  }>;
}

export interface MorningBriefingOutput {
  greeting: string;
  summary: string;
  insights: Array<{
    type: 'CRITICAL_ALERT' | 'EMERGING_SIGNAL' | 'RECURRING_ISSUE' | 'POSITIVE_SIGNAL';
    headline: string;
    evidence: string;
    confidence: number;
    affectedDepartment?: string;
    recommendedAction: string;
  }>;
}

export interface HRQueryInput {
  question: string;
  orgContext: {
    orgName: string;
    totalEmployeesApprox: number;
    grievanceSummary: string;
    pulseSummary: string;
    recurringIssuesSummary: string;
  };
}

export interface HRQueryOutput {
  answer: string;
  keyFindings: string[];
  suggestedFollowUpActions: string[];
  dataSourcesReferenced: string[];
  disclaimer: string;
}

export interface AIAssistantProvider {
  providerName: string;
  analyzeGrievance(input: GrievanceAnalysisInput): Promise<GrievanceAnalysisOutput>;
  generateMorningBriefing(input: MorningBriefingInput): Promise<MorningBriefingOutput>;
  answerHRQuery(input: HRQueryInput): Promise<HRQueryOutput>;
}
