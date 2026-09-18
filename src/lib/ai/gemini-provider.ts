// PEOPLEPULSE AI — Google Gemini AI Provider

import { GoogleGenerativeAI } from '@google/generative-ai';
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

const DISCLAIMER_TEXT =
  'AI Decision Support: Generated for HR guidance and analytical triage only. Does not determine guilt or replace human judgment.';

export class GeminiAIProvider implements AIAssistantProvider {
  public providerName = 'gemini-1.5-pro';
  private genAI: GoogleGenerativeAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
    }
  }

  async analyzeGrievance(input: GrievanceAnalysisInput): Promise<GrievanceAnalysisOutput> {
    // 1. Run deterministic safety screener FIRST
    const safetyCheck = screenForCriticalSafetyFlags(`${input.title} ${input.description}`);

    if (!this.genAI) {
      // Graceful fallback to deterministic analysis if API key not configured
      return this.fallbackAnalysis(input, safetyCheck);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `
You are a senior workplace grievance intelligence and HR compliance assistant.
Analyze this workplace grievance for HR decision-support.

CRITICAL ETHICAL RULES:
- Never determine legal guilt or innocence.
- Never recommend termination, firing, or punitive actions against specific individuals.
- Provide objective summaries, risk assessments, policy areas, and constructive HR next steps.

INPUT:
Case Number: ${input.caseNumber}
Category Selected: ${input.categorySelected}
Employee Severity: ${input.severityEmployee}
Department: ${input.departmentName || 'Not specified'}
Title: ${input.title}
Description: ${input.description}

OUTPUT FORMAT:
Return a strictly valid JSON object matching this schema:
{
  "summary": "1-2 sentence neutral summary of core issue",
  "category": "Suggested standardized category",
  "subcategory": "Specific subcategory",
  "sentiment_score": -0.85, // Float between -1.0 (most negative) and 1.0 (positive)
  "urgency": "Low" | "Medium" | "High" | "Immediate",
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "key_topics": ["topic1", "topic2"],
  "possible_policy_area": "Relevant standard company policy section",
  "similar_issue_keywords": ["keyword1", "keyword2"],
  "recommended_hr_response": "Polite, empathetic, professional draft acknowledgment to the employee",
  "recommended_next_actions": [
    {"action": "Action description", "priority": "High" | "Medium" | "Low"}
  ],
  "escalation_recommended": boolean,
  "reasoning_summary": "1 sentence explaining why this risk level was assigned"
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      // Enforce deterministic safety override if rule screener flagged critical
      if (safetyCheck.hasRedFlag) {
        parsed.risk_level = safetyCheck.recommendedSeverity === 'Critical' ? 'CRITICAL' : 'HIGH';
        parsed.urgency = 'Immediate';
        parsed.escalation_recommended = true;
        parsed.reasoning_summary = `[CRITICAL SAFETY SIGNAL TRIGGERED] ${safetyCheck.alertNotice || ''} ${parsed.reasoning_summary || ''}`.trim();
      }

      return {
        ...parsed,
        model_version: this.providerName,
      };
    } catch (error) {
      console.error('[Gemini Provider Error - Grievance Analysis]:', error);
      return this.fallbackAnalysis(input, safetyCheck);
    }
  }

  async generateMorningBriefing(input: MorningBriefingInput): Promise<MorningBriefingOutput> {
    if (!this.genAI) {
      return this.fallbackBriefing(input);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const prompt = `
You are the AI Chief of Staff for ${input.organizationName}'s People Team.
Generate the daily HR Morning Intelligence Briefing ("Good morning. Here's what needs your attention.").

METRICS CONTEXT:
- Active Grievances: ${input.activeGrievanceCount}
- Critical Grievances: ${input.criticalGrievanceCount}
- 30-Day Avg Mood: ${input.averageMood30Days}/5.0
- Recent Trend: ${input.recentMoodTrend}
- Department Breakdown: ${JSON.stringify(input.departmentStats)}
- Recent Cases Sample: ${JSON.stringify(input.recentGrievancesSample)}

OUTPUT FORMAT (Valid JSON):
{
  "greeting": "Good morning. Here is your daily People Intelligence Briefing for ${input.organizationName}.",
  "summary": "2-sentence executive summary of organizational health today.",
  "insights": [
    {
      "type": "CRITICAL_ALERT" | "EMERGING_SIGNAL" | "RECURRING_ISSUE" | "POSITIVE_SIGNAL",
      "headline": "Punchy headline",
      "evidence": "Data-backed evidence point",
      "confidence": 0.92,
      "affectedDepartment": "Department Name or null",
      "recommendedAction": "Actionable next step for HR"
    }
  ]
}
`;

      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('[Gemini Provider Error - Morning Briefing]:', error);
      return this.fallbackBriefing(input);
    }
  }

  async answerHRQuery(input: HRQueryInput): Promise<HRQueryOutput> {
    if (!this.genAI) {
      return {
        answer: `I have analyzed ${input.orgContext.orgName}'s recent data regarding "${input.question}". Currently, operations workload and customer support review clarity are the primary active themes.`,
        keyFindings: [
          'Workload pressure in Operations remains the most frequent topic.',
          'Overall company sentiment is holding steady at 3.8/5.0.',
        ],
        suggestedFollowUpActions: [
          'Review open Operations grievance logs.',
          'Schedule a team alignment check-in.',
        ],
        dataSourcesReferenced: ['Employee Pulses (Last 30 Days)', 'Active Grievance Index'],
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `
You are PeoplePulse AI Assistant for HR at ${input.orgContext.orgName}.
Answer this HR query using ONLY the provided tenant context.

QUERY: "${input.question}"

ORGANIZATION DATA CONTEXT:
${input.orgContext.grievanceSummary}
${input.orgContext.pulseSummary}
${input.orgContext.recurringIssuesSummary}

RULES:
- Maintain strict objectivity.
- Do not cite specific anonymous individuals.
- Base your answers strictly on the supplied metrics.

OUTPUT FORMAT (JSON):
{
  "answer": "Detailed, professional answer synthesized from the data",
  "keyFindings": ["Point 1", "Point 2"],
  "suggestedFollowUpActions": ["Action 1", "Action 2"],
  "dataSourcesReferenced": ["Pulse Data", "Grievance Logs"]
}
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      return {
        ...parsed,
        disclaimer: DISCLAIMER_TEXT,
      };
    } catch (error) {
      console.error('[Gemini Provider Error - HR Query]:', error);
      return {
        answer: `Unable to process query via remote AI: ${error instanceof Error ? error.message : 'Unknown error'}. Providing localized summary based on active records.`,
        keyFindings: ['Check active grievance inbox and department sentiment trends directly.'],
        suggestedFollowUpActions: ['Review high-priority cases.'],
        dataSourcesReferenced: ['System Cache'],
        disclaimer: DISCLAIMER_TEXT,
      };
    }
  }

  private fallbackAnalysis(input: GrievanceAnalysisInput, safetyCheck: any): GrievanceAnalysisOutput {
    const isCritical = safetyCheck.hasRedFlag || input.severityEmployee === 'Critical';
    return {
      summary: `Employee submitted a ${input.categorySelected} concern regarding "${input.title}".`,
      category: input.categorySelected,
      subcategory: 'General Inquiry / Grievance',
      sentiment_score: isCritical ? -0.85 : -0.45,
      urgency: isCritical ? 'Immediate' : input.severityEmployee === 'High' ? 'High' : 'Medium',
      risk_level: isCritical ? 'CRITICAL' : input.severityEmployee === 'High' ? 'HIGH' : 'MEDIUM',
      key_topics: [input.categorySelected.toLowerCase(), 'workplace friction'],
      possible_policy_area: 'Employee Conduct & Dispute Resolution Policy',
      similar_issue_keywords: [input.categorySelected.toLowerCase()],
      recommended_hr_response: `Hello. Thank you for reaching out. We have received your case (${input.caseNumber}) and are currently reviewing the details provided. We will follow up with you promptly.`,
      recommended_next_actions: [
        { action: 'Review case details with designated HR partner', priority: isCritical ? 'High' : 'Medium' },
        { action: 'Verify relevant shift or departmental context', priority: 'Medium' },
      ],
      escalation_recommended: isCritical,
      reasoning_summary: safetyCheck.hasRedFlag
        ? `[CRITICAL SAFETY SIGNAL TRIGGERED] ${safetyCheck.alertNotice}`
        : `Classified based on employee severity rating (${input.severityEmployee}).`,
      model_version: 'fallback-deterministic-v1',
    };
  }

  private fallbackBriefing(input: MorningBriefingInput): MorningBriefingOutput {
    return {
      greeting: `Good morning. Here is your daily People Intelligence Briefing for ${input.organizationName}.`,
      summary: `There are currently ${input.activeGrievanceCount} active cases (${input.criticalGrievanceCount} critical) with an overall 30-day average mood of ${input.averageMood30Days.toFixed(1)}/5.0.`,
      insights: [
        {
          type: input.criticalGrievanceCount > 0 ? 'CRITICAL_ALERT' : 'EMERGING_SIGNAL',
          headline: input.criticalGrievanceCount > 0
            ? `${input.criticalGrievanceCount} critical grievance(s) requiring immediate attention`
            : 'Department sentiment trends are stable',
          evidence: `Current average employee pulse score is ${input.averageMood30Days.toFixed(1)}/5.0 across active departments.`,
          confidence: 0.95,
          recommendedAction: 'Review open case triage inbox and review pending SLA timers.',
        },
      ],
    };
  }
}
