import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Key,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">PeoplePulse</span>
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/track-case"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Key className="h-3.5 w-3.5 text-emerald-600" />
              <span>Track Anonymous Case</span>
            </Link>
            <Link
              href="/hr/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-14 sm:pt-20 pb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>AI Operating System for Employee Voice & Grievance Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight sm:leading-none">
            {APP_TAGLINE}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            PeoplePulse AI connects daily mood check-ins, zero-knowledge anonymous grievances, and predictive root-cause clustering to help HR teams resolve workplace issues before they escalate.
          </p>

          {/* Core Interactive Portal Entry Cards */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* 1. Employee Voice Portal */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  Employee Voice Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Daily mood check-ins (&lt; 15 sec), 3-minute guided grievance submissions, and team feedback boxes.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/employee"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open Employee Space</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. HR Intelligence Console */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
                  HR Intelligence & Triage
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Morning AI briefings, transparent People Health Score, SLA tracking, and private two-way anonymous case management.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/hr/dashboard"
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open HR Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Encrypted Anonymous Tracker */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Key className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
                  Track Anonymous Case
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Verify your private passcode to track status, read HR messages, and send updates without any authentication cookies.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/track-case"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Enter Case Passcode</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars Section */}
        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Product Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                The 4-Step Intelligence Cycle
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase">Step 1</span>
                <h3 className="font-bold text-slate-900 text-base">LISTEN</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Daily mood pulses, team praise, constructive suggestions, and anonymous grievances.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-purple-600 uppercase">Step 2</span>
                <h3 className="font-bold text-slate-900 text-base">UNDERSTAND</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  AI root-cause categorization, sentiment tracking, and recurring complaint clustering.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-amber-600 uppercase">Step 3</span>
                <h3 className="font-bold text-slate-900 text-base">ACT</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Suggested HR response drafts, SLA timers, case assignments, and human-approved action items.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-600 uppercase">Step 4</span>
                <h3 className="font-bold text-slate-900 text-base">IMPROVE</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transparent People Health Score tracking and department-level organizational trends.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust Safeguards */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Built on Strict Privacy & Safety Guarantees</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 block text-sm">🔒 Zero-Knowledge Anonymity</span>
              <p className="text-slate-600 leading-relaxed">
                Anonymous grievance submitter IDs, session cookies, and IP addresses are never saved to the database.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 block text-sm">🚨 Rule-Based Safety Screener</span>
              <p className="text-slate-600 leading-relaxed">
                Critical life safety, self-harm, harassment, and retaliation signals trigger immediate deterministic red flags.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 block text-sm">🛡️ Minimum Cohort Gate</span>
              <p className="text-slate-600 leading-relaxed">
                Small department feedback ($N &lt; 5$) is automatically guarded from drill-downs to prevent identity de-anonymization.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. Demo Organization: Northstar Technologies.
        </p>
      </footer>
    </div>
  );
}
