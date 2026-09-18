// PEOPLEPULSE AI — Application Constants

import { MoodLabel, MoodScore } from '../types/database';

export const APP_NAME = 'PeoplePulse AI';
export const APP_TAGLINE = 'Understand your people before problems become attrition.';

export const MOOD_OPTIONS: Array<{
  score: MoodScore;
  label: MoodLabel;
  emoji: string;
  color: string;
  description: string;
}> = [
  { score: 5, label: 'Great', emoji: '😄', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', description: 'Feeling energised, engaged & supported' },
  { score: 4, label: 'Good', emoji: '🙂', color: 'text-teal-500 bg-teal-50 border-teal-200', description: 'Things are going well overall' },
  { score: 3, label: 'Okay', emoji: '😐', color: 'text-amber-500 bg-amber-50 border-amber-200', description: 'Average day, steady pace' },
  { score: 2, label: 'Low', emoji: '🙁', color: 'text-orange-500 bg-orange-50 border-orange-200', description: 'Facing friction or mild stress' },
  { score: 1, label: 'Very Low', emoji: '😣', color: 'text-rose-500 bg-rose-50 border-rose-200', description: 'Significant stress, frustration or distress' },
];

export const GRIEVANCE_CATEGORIES = [
  'Workload',
  'Manager / Supervisor',
  'Team Conflict',
  'Salary / Benefits',
  'Workplace Behaviour',
  'Harassment / Misconduct',
  'Discrimination',
  'Safety',
  'Policy',
  'Leave',
  'Performance Management',
  'Career Growth',
  'Facilities',
  'Other',
] as const;

export const FEEDBACK_TYPES = [
  { type: 'Praise', label: 'Praise & Kudos', description: 'Recognize a colleague, team, or initiative', icon: 'Sparkles' },
  { type: 'Suggestion', label: 'Suggestion', description: 'Propose an idea to improve workplace culture or operations', icon: 'Lightbulb' },
  { type: 'Concern', label: 'Concern', description: 'Raise an early observation or team friction point', icon: 'AlertTriangle' },
  { type: 'General Feedback', label: 'General Feedback', description: 'Share open thoughts with the People team', icon: 'MessageSquare' },
] as const;

export const GRIEVANCE_STATUS_CONFIG = {
  'New': { label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Under Review': { label: 'Under Review', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'Awaiting Employee': { label: 'Awaiting Employee', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Investigation': { label: 'Investigation', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Action Required': { label: 'Action Required', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  'Resolved': { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'Closed': { label: 'Closed', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  'Escalated': { label: 'Escalated', color: 'bg-red-100 text-red-900 border-red-300 font-semibold' },
};

export const RISK_LEVEL_CONFIG = {
  'LOW': { label: 'Low Risk', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  'MEDIUM': { label: 'Medium Risk', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  'HIGH': { label: 'High Risk', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  'CRITICAL': { label: 'Critical Risk', color: 'text-rose-800 bg-rose-50 border-rose-300 animate-pulse' },
};

export const K_ANONYMITY_MIN_COHORT = 5;

export const HEALTH_SCORE_WEIGHTS = {
  MOOD_WEIGHT: 0.35,
  SLA_WEIGHT: 0.25,
  RISK_WEIGHT: 0.20,
  RECURRING_WEIGHT: 0.20,
};
