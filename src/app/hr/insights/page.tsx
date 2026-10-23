'use client';

import React, { useState } from 'react';
import { HRLayout } from '@/components/layout/HRLayout';
import { Database, ExternalLink, Loader2, Shield, Sparkles } from 'lucide-react';

const TOPICS = [
  { id: 'labour-codes', label: 'India labour codes: what changed?' },
  { id: 'grievance-committee', label: 'When is a statutory grievance committee required?' },
  { id: 'posh-confidentiality', label: 'How should POSH information be handled?' },
  { id: 'privacy-and-ai', label: 'What should HR keep out of AI prompts?' },
] as const;

type PublicAnswer = {
  question: string;
  answer: string;
  keyFindings: string[];
  sources: Array<{ title: string; url: string }>;
  disclaimer: string;
  model: string;
};

export default function HRInsightsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [answer, setAnswer] = useState<PublicAnswer | null>(null);
  const [error, setError] = useState('');

  const askTopic = async (topicId: string) => {
    setIsLoading(true);
    setSelectedTopic(topicId);
    setError('');
    setAnswer(null);
    try {
      const response = await fetch(`/api/ai/public-knowledge?topic=${encodeURIComponent(topicId)}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Could not load this topic.');
      }
      setAnswer(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this topic.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HRLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>India HR knowledge · public sources</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            HR Knowledge Assistant
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
            Choose a reviewed topic for a source-grounded overview. Only the selected topic and public-source notes can be sent to the configured AI provider; this page does not accept employee or case details.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Database className="h-4 w-4" />
            Pick a topic
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => askTopic(topic.id)}
                disabled={isLoading}
                className={`rounded-xl border p-4 text-left text-sm font-semibold transition-colors disabled:opacity-60 ${selectedTopic === topic.id ? 'border-purple-400 bg-purple-50 text-purple-900' : 'border-slate-200 bg-white text-slate-800 hover:border-purple-300 hover:bg-purple-50/50'}`}
              >
                {topic.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
            <Shield className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Public-reference demo only. Do not enter employee names, grievance narratives, POSH records, health or payroll details. This assistant cannot review a particular employee matter.</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing the selected topic…
          </div>
        )}

        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

        {answer && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6" aria-live="polite">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{answer.question}</h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-800">{answer.answer}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Key points</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                {answer.keyFindings.map((finding) => <li key={finding}>{finding}</li>)}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Official sources</h3>
              <ul className="space-y-2 text-sm">
                {answer.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 underline underline-offset-2 hover:text-blue-900">
                      {source.title}<ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">{answer.disclaimer}</p>
          </section>
        )}
      </div>
    </HRLayout>
  );
}
