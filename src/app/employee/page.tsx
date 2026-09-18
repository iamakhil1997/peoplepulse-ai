'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { MOOD_OPTIONS, APP_TAGLINE } from '@/lib/constants';
import { MoodScore, MoodLabel } from '@/lib/types/database';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Key,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Send,
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
      } else {
        toast.error(data.error || 'Failed to submit pulse.');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Safe & Confidential Employee Space</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How are you feeling today?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-lg mx-auto">
            Your voice shapes our team culture. Check in with your daily mood or raise a confidential concern.
          </p>
        </div>

        {/* Pulse Mood Check-in Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-10">
          {!submittedToday ? (
            <form onSubmit={handleMoodSubmit} className="space-y-6">
              {/* Mood Emojis Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood?.score === mood.score;
                  return (
                    <button
                      key={mood.score}
                      type="button"
                      onClick={() => setSelectedMood({ score: mood.score, label: mood.label })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20 scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl mb-2">{mood.emoji}</span>
                      <span className="font-semibold text-slate-900 text-sm">{mood.label}</span>
                      <span className="text-[11px] text-slate-500 mt-1 hidden sm:block leading-tight">
                        {mood.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedMood && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Area / Context (Optional)
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">General Workday</option>
                        <option value="Workload">Workload & Staffing</option>
                        <option value="Team Culture">Team Culture & Vibe</option>
                        <option value="Management">Management & Leadership</option>
                        <option value="Tools & Process">Tools & Process</option>
                        <option value="Career & Growth">Career & Growth</option>
                      </select>
                    </div>

                    <div className="flex items-center sm:pt-6 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="font-medium">Submit anonymously</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={allowFollowup}
                          onChange={(e) => setAllowFollowup(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="font-medium">Allow HR follow-up</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Anything on your mind? (Optional comment)
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share a quick note about what went well or what felt challenging..."
                      className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isAnonymous ? 'Your identity is not stored with this pulse.' : 'Submitted with your profile.'}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Recording...' : 'Record Check-in'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check-in recorded!</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Thank you for checking in today. Your pulse helps your leadership identify workload trends and support needs early.
              </p>
              <button
                onClick={() => setSubmittedToday(false)}
                className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Submit another check-in
              </button>
            </div>
          )}
        </div>

        {/* 4 Primary Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/employee/speak-up"
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                Submit a Grievance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Report harassment, workload coercion, safety violations, or unfair treatment. Can be submitted 100% anonymously.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Open Guided Form &rarr;</span>
            </div>
          </Link>

          <Link
            href="/track-case"
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                Track My Cases
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Look up your anonymous grievance using your private case passcode, read HR replies, and send updates safely.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Enter Access Passcode &rarr;</span>
            </div>
          </Link>

          <Link
            href="/employee/feedback"
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">
                Give Team Feedback
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Send praise and kudos to colleagues, or share concerns regarding processes and workplace dynamics.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-purple-700 group-hover:translate-x-1 transition-transform">
              <span>Share Feedback &rarr;</span>
            </div>
          </Link>

          <Link
            href="/employee/feedback?tab=suggestion"
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                Share a Suggestion
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Propose ideas for operational improvements, team productivity hacks, or culture enhancements.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>Propose Idea &rarr;</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
