'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HRLayout } from '@/components/layout/HRLayout';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  MessageSquare,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

export default function HRDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const exportSummaryReport = () => {
    if (!data) return;
    const report = `PEOPLEPULSE AI — EXECUTIVE REPORT
Organization: Northstar Technologies
Generated At: ${new Date().toLocaleString()}
--------------------------------------------------
People Health Score: ${data.healthScore.overallScore}/100 (${data.healthScore.grade})
Avg Employee Mood: ${data.avgMood}/5.0
Active Grievances: ${data.activeGrievanceCount}
Critical Issues: ${data.criticalGrievanceCount}
SLA Adherence: ${data.slaComplianceRate}%
Formula: ${data.healthScore.formulaExplanation}
--------------------------------------------------
Recurring Clusters:
${data.recurringIssues.map((r: any) => `- ${r.topic_title} (${r.issue_count} cases, ${r.trend_direction})`).join('\n')}
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PeoplePulse_Executive_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Executive intelligence summary exported.');
  };

  if (isLoading || !data) {
    return (
      <HRLayout>
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Generating People Intelligence Briefing...</p>
        </div>
      </HRLayout>
    );
  }

  const {
    healthScore,
    avgMood,
    activeGrievanceCount,
    criticalGrievanceCount,
    slaComplianceRate,
    moodTrend,
    categoryDistribution,
    departmentDistribution,
    recurringIssues,
    aiInsights,
  } = data;

  return (
    <HRLayout>
      <div className="space-y-8 pb-12">
        {/* TOP AI BRIEFING: "Good morning. Here's what needs your attention." */}
        <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                    AI HR Morning Briefing
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Good morning. Here&apos;s what needs your attention.
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportSummaryReport}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Report</span>
                </button>
                <Link
                  href="/hr/insights"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-xs font-semibold text-blue-200 transition-colors flex items-center gap-1.5"
                >
                  <span>Ask People Intelligence</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* AI Signal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiInsights.map((insight: any, i: number) => {
                const isCritical = insight.insight_type === 'CRITICAL_ALERT';
                const isSignal = insight.insight_type === 'EMERGING_SIGNAL';
                const isRecurring = insight.insight_type === 'RECURRING_ISSUE';
                const isPositive = insight.insight_type === 'POSITIVE_SIGNAL';

                return (
                  <div
                    key={insight.id || i}
                    className="rounded-xl p-4 bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isCritical
                              ? 'bg-rose-500 text-white'
                              : isSignal
                              ? 'bg-amber-500 text-white'
                              : isRecurring
                              ? 'bg-purple-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {insight.insight_type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-white/60">
                          {Math.round(insight.confidence_score * 100)}% conf
                        </span>
                      </div>

                      <h2 className="font-bold text-sm text-white leading-snug line-clamp-2">
                        {insight.headline}
                      </h2>
                      <p className="text-xs text-white/70 mt-1.5 line-clamp-2">
                        {insight.evidence_summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      <span className="text-[11px] font-medium text-blue-200 block truncate">
                        💡 {insight.recommended_action}
                      </span>
                      <Link
                        href={isCritical ? '/hr/grievances' : '/hr/insights'}
                        className="mt-2 text-[11px] font-semibold text-white hover:text-blue-300 flex items-center gap-1"
                      >
                        <span>Investigate</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EXECUTIVE KPI SCORECARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* People Health Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  People Health
                </span>
                <button
                  onClick={() => setShowFormulaModal(true)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  title="View transparent score calculation formula"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {healthScore.overallScore}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 100</span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                    healthScore.overallScore >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {healthScore.grade}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Transparent Formula</span>
              <button
                onClick={() => setShowFormulaModal(true)}
                className="font-semibold text-blue-600 hover:underline"
              >
                View Breakdown &rarr;
              </button>
            </div>
          </div>

          {/* Average Mood */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Avg Employee Mood
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {avgMood}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                <span className="ml-auto text-xs font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                  +0.3
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Last 30 days weighted avg
            </div>
          </div>

          {/* Active Grievances */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Grievances
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeGrievanceCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">cases in queue</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <Link href="/hr/grievances" className="font-semibold text-blue-600 hover:underline">
                Manage Inbox &rarr;
              </Link>
            </div>
          </div>

          {/* Critical Risk */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Critical Issues
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                  {criticalGrievanceCount}
                </span>
                {criticalGrievanceCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-bold animate-pulse">
                    Urgent
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Requires immediate triage
            </div>
          </div>

          {/* SLA Adherence */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                SLA Compliance
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {slaComplianceRate}%
                </span>
                <span className="ml-auto text-xs font-semibold text-emerald-600">On Target</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Avg resolution: 28 hrs
            </div>
          </div>
        </section>

        {/* ANALYTICS CHARTS & RECURRING CLUSTERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Trend Timeline (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Employee Mood Trend Over Time</h2>
                <p className="text-xs text-slate-500 mt-0.5">Aggregated weekly pulse ratings (1.0 to 5.0 scale)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Weekly Pulse
              </span>
            </div>

            {/* Interactive Recharts Area Chart */}
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[1, 5]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} / 5.0`, 'Average Mood']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Department Breakdown with K-Anonymity Safeguard */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Department Sentiment & Grievance Breakdown
              </h3>

              <div className="space-y-2.5">
                {departmentDistribution.map((dept: any) => (
                  <div
                    key={dept.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{dept.name}</span>
                      <span className="ml-2 text-xs text-slate-500 font-medium">
                        ({dept.grievanceCount} active cases)
                      </span>
                    </div>

                    <div>
                      {dept.isPrivacyGuarded ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          <Shield className="h-3 w-3" />
                          <span>Cohort &lt; 5 (Privacy Guarded)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Avg Mood:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              dept.averageMood >= 4
                                ? 'bg-emerald-100 text-emerald-800'
                                : dept.averageMood <= 2.5
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {dept.averageMood} / 5.0
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recurring Issue Clusters & Root-Cause (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Recurring Issue Clusters</h2>
                  <p className="text-xs text-slate-500 mt-0.5">AI root-cause grouping across complaints</p>
                </div>
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>

              <div className="space-y-3">
                {recurringIssues.map((issue: any) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{issue.topic_title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          issue.trend_direction === 'INCREASING'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {issue.trend_direction}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Found across <span className="font-bold text-slate-800">{issue.issue_count} separate cases</span>.
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Supporting Cases:</span>
                      <span className="font-mono font-semibold text-blue-600">
                        {issue.supporting_case_numbers.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/hr/insights"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Explore Full Topic Intelligence &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* TRANSPARENT HEALTH SCORE MODAL */}
        {showFormulaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Transparent People Health Score Formula
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deterministic calculation with zero black-box obscurity
                  </p>
                </div>
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Mathematical Formula Box */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 font-mono text-xs text-blue-900 leading-relaxed font-semibold">
                {healthScore.formulaExplanation}
              </div>

              {/* Component breakdown */}
              <div className="space-y-3">
                {Object.entries(healthScore.components).map(([key, comp]: [string, any]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{comp.label}</span>
                      <span className="text-xs font-mono font-bold text-blue-700">
                        Score: {comp.score}/100 &times; {comp.weight * 100}% = +{comp.contribution} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{comp.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Close Breakdown
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
}
