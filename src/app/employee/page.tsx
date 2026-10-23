'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { MOOD_OPTIONS } from '@/lib/constants';
import { MoodScore, MoodLabel } from '@/lib/types/database';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeHomePage() {
  const [selectedMood, setSelectedMood] = useState<{ score: MoodScore; label: MoodLabel } | null>(null);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [allowFollowup, setAllowFollowup] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = () => {
    setLoadingHistory(true);
    fetch('/api/pulse?view=history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setHistory(data.data);
          // Check if submitted today
          const todayStr = new Date().toISOString().split('T')[0];
          const hasToday = data.data.some((p: any) => p.created_at.startsWith(todayStr));
          if (hasToday) setSubmittedToday(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    loadHistory();
    // Auto-refresh pulse history every 10 seconds
    const interval = setInterval(loadHistory, 10_000);
    return () => clearInterval(interval);
  }, []);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error('Please select your mood rating first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodScore: selectedMood.score,
          moodLabel: selectedMood.label,
          category: category || 'General',
          comment,
          isAnonymous,
          allowHrFollowup: allowFollowup,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Your daily pulse has been recorded. Thank you for speaking up!');
        setSubmittedToday(true);
        loadHistory();
      } else {
        toast.error(data.error || 'Failed to submit pulse.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10 space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Synthetic Demo Employee Space</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How are you feeling today?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-lg mx-auto">
            Explore the sample workflow with synthetic data. Do not enter personal or real workplace information.
          </p>
        </div>

        {/* Mood Check-in Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {submittedToday ? (
            <div className="text-center py-6 space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Today's Pulse Recorded</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                You have shared your wellbeing status for today. Your check-in is contributing to the organizational health index.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedToday(false)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Submit another mood update
              </button>
            </div>
          ) : (
            <form onSubmit={handleMoodSubmit} className="space-y-6">
              {/* Emojis selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  1. Rate Your Wellbeing Today:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {MOOD_OPTIONS.map((opt) => {
                    const isSelected = selectedMood?.score === opt.score;
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => setSelectedMood({ score: opt.score, label: opt.label })}
                        className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline leading-tight">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Category & Comment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pulse-cat" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Driver (Optional):
                  </label>
                  <select
                    id="pulse-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select driver...</option>
                    <option value="Workload">Workload & Pacing</option>
                    <option value="Team Collaboration">Team Collaboration</option>
                    <option value="Leadership & Management">Leadership & Management</option>
                    <option value="Tooling & Resources">Tooling & Resources</option>
                    <option value="Personal Well-being">Personal Well-being</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pulse-comment" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Context Note (Optional):
                  </label>
                  <input
                    id="pulse-comment"
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Briefly describe what influenced your day..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Privacy toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Submit Anonymously</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={allowFollowup}
                      onChange={(e) => setAllowFollowup(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Allow HR Follow-up</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold shadow-sm transition"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Check-ins disabled in public demo
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Employee Check-in History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Your Recent Submissions</h3>
            </div>
            <span className="text-xs text-slate-400">Updates live across reloads</span>
          </div>

          {loadingHistory ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No previous pulse check-ins found. Submit your first mood above!
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-blue-600 font-mono">
                      {h.mood_score}/5
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{h.mood_label}</span>
                      {h.category && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {h.category}
                        </span>
                      )}
                      {h.comment && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">"{h.comment}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Speak Up Link Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Demo Speak-Up Workflow</span>
            </div>
            <p className="text-xs text-slate-600">
              Preview a sample concern workflow. This prototype is not approved for real grievances or safety reports.
            </p>
          </div>
          <Link
            href="/employee/speak-up"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs text-center whitespace-nowrap shadow-sm transition"
          >
            Open Case Form &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
