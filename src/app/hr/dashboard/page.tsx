'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HRLayout } from '@/components/layout/HRLayout';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Clock,
  Download,
  HelpCircle,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const fetchMetrics = (manual = false) => {
    if (manual) setIsRefreshing(true);
    fetch('/api/analytics/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
          if (manual) toast.success('Dashboard metrics refreshed from database.');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 8 seconds for real-time synchronization across portals
    const interval = setInterval(() => fetchMetrics(false), 8_000);
    return () => clearInterval(interval);
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
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PeoplePulse_Executive_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (isLoading || !data) {
    return (
      <HRLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Querying live organizational database...</p>
        </div>
      </HRLayout>
    );
  }

  const { healthScore } = data;

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Intelligence Overview</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live continuous telemetry aggregating mood check-ins, case queues, and SLA adherence
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMetrics(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing…' : 'Sync Live'}</span>
            </button>

            <button
              onClick={exportSummaryReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Primary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Health Score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">People Health Score</span>
              <button onClick={() => setShowFormulaModal(true)} title="View Formula Breakdown">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600" />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{healthScore.overallScore}</span>
              <span className="text-xs font-bold text-emerald-600">/ 100</span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {healthScore.grade}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Live multi-factor composite index</p>
          </div>

          {/* Card 2: Average Mood */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Mood</span>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{data.avgMood}</span>
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500">From continuous employee check-ins</p>
          </div>

          {/* Card 3: Active Grievances */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Grievances</span>
              <Link href="/hr/grievances">
                <ArrowUpRight className="h-4 w-4 text-slate-400 hover:text-blue-600" />
              </Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{data.activeGrievanceCount}</span>
              {data.criticalGrievanceCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  {data.criticalGrievanceCount} Critical
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Across all complaint categories</p>
          </div>

          {/* Card 4: SLA Adherence */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Adherence</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{data.slaComplianceRate}%</span>
              <span className="text-xs text-slate-500 font-medium">on-time</span>
            </div>
            <p className="text-[11px] text-slate-500">Triage & resolution response pace</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">7-Day Continuous Mood Trajectory</h3>
                <p className="text-xs text-slate-500">Daily average mood score trend (1.0 - 5.0)</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                Auto-Updating
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.moodTrend}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[1, 5]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgMood" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorMood)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Department Wellbeing Index</h3>
                <p className="text-xs text-slate-500">Synthetic demo metrics. Small-group privacy has not been independently verified.</p>
              </div>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="space-y-3 pt-2">
              {data.departmentMoods.map((dept: any) => (
                <div key={dept.departmentId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.departmentName}</span>
                    <span className="font-mono text-slate-600">
                      {dept.hasPrivacyThreshold && dept.averageMood ? `${dept.averageMood} / 5.0 (demo)` : 'Demo threshold label'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.hasPrivacyThreshold ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${dept.averageMood ? (dept.averageMood / 5) * 100 : 40}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
