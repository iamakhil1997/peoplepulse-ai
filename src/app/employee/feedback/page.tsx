'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { FEEDBACK_TYPES } from '@/lib/constants';
import { FeedbackType } from '@/lib/types/database';
import { CheckCircle2, MessageSquare, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeFeedbackPage() {
  const [type, setType] = useState<FeedbackType>('Praise');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter both a title and details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          content,
          isAnonymous,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Feedback submitted successfully!');
        setIsSuccess(true);
      } else {
        toast.error(data.error || 'Submission failed.');
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

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-10">
        <div className="mb-4">
          <Link href="/employee" className="text-xs font-semibold text-blue-600 hover:underline">
            &larr; Back to Employee Home
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Share Feedback & Ideas</h1>
          <p className="text-sm text-slate-600 mt-1">
            Public demo is read-only. Do not enter feedback or real employee information; submissions are disabled.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {FEEDBACK_TYPES.map((t) => {
                    const isSelected = type === t.type;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setType(t.type as FeedbackType)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block">{t.label}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{t.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Huge appreciation for the DevOps sprint deployment..."
                  className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details, examples, or suggestions for action..."
                  className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="font-medium">Submit as anonymous</span>
                </label>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Synthetic demo only</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Submissions disabled in public demo</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Feedback Shared!</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                Thank you for contributing your voice. Feedback is synthesized by AI to detect organizational opportunities.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setTitle('');
                  setContent('');
                }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Send another message
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
