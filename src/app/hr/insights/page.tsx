'use client';

import React, { useState } from 'react';
import { HRLayout } from '@/components/layout/HRLayout';
import {
  ArrowRight,
  CheckCircle2,
  Database,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Search,
  Send,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_QUESTIONS = [
  'What needs my attention today?',
  'What are employees complaining about?',
  'Why has Operations mood declined?',
  'Which departments have increasing grievance volumes?',
  'Summarize unresolved critical grievances.',
  'What actions should HR prioritize this week?',
];

export default function HRInsightsPage() {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [currentResult, setCurrentResult] = useState<any | null>(null);

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setIsAsking(true);
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentResult(data.data);
      } else {
        toast.error(data.error || 'Failed to process query.');
      }
    } catch (e) {
      toast.error('Network error.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <HRLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Multi-Tenant Isolated AI Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Ask PeoplePulse Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            Synthetic demo analytics only. Free-text AI questions are disabled until reviewed redaction is available.
          </p>
        </div>

        {/* Query Input Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <input
              type="text"
              disabled
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about employee sentiment, grievance spikes, or team culture..."
              className="flex-1 text-sm rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              onClick={() => handleAsk()}
              disabled
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-purple-500/20 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAsking ? 'Synthesizing...' : 'Ask AI'}</span>
            </button>
          </form>

          {/* Quick-Prompt Chips */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 text-xs font-medium text-slate-700 transition-all text-left"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Answer Card */}
        {currentResult && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">AI Synthesized Intelligence</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Tenant Context: Northstar Technologies</span>
            </div>

            {/* Main Answer */}
            <div className="text-sm sm:text-base text-slate-800 leading-relaxed bg-purple-50/40 p-5 rounded-xl border border-purple-100">
              {currentResult.answer}
            </div>

            {/* Key Findings */}
            {currentResult.keyFindings && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Key Findings & Evidence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentResult.keyFindings.map((finding: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Follow-up Actions */}
            {currentResult.suggestedFollowUpActions && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recommended HR Action Plans
                </h4>
                <div className="space-y-2">
                  {currentResult.suggestedFollowUpActions.map((action: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs font-medium text-blue-950 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>{action}</span>
                      </div>
                      <span className="text-[11px] text-blue-700 font-semibold uppercase">Actionable</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Sources & Disclaimer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  <strong>Sources:</strong> {currentResult.dataSourcesReferenced?.join(', ') || 'Internal Org Cache'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <Shield className="h-3 w-3 text-blue-600" />
                <span>Synthetic demo data only; production tenant controls are not enabled</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
}
