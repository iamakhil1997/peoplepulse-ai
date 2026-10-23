'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { GRIEVANCE_CATEGORIES } from '@/lib/constants';
import { SeverityLevel } from '@/lib/types/database';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
  Key,
  Lock,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SpeakUpGrievancePage() {
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categorySelected, setCategorySelected] = useState<string>('Workload');
  const [departmentId, setDepartmentId] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [severityEmployee, setSeverityEmployee] = useState<SeverityLevel>('Medium');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [allowFollowup, setAllowFollowup] = useState(true);
  const [, setIsSubmitting] = useState(false);

  // Success Modal State
  const [submissionResult, setSubmissionResult] = useState<{
    caseNumber: string;
    rawAccessToken?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/organization/onboarding')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.departments) {
          setDepartments(data.data.departments);
          if (data.data.departments.length > 0) {
            setDepartmentId(data.data.departments[0].id);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both a title and a description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categorySelected,
          departmentId: departmentId || undefined,
          incidentDate: incidentDate || undefined,
          severityEmployee,
          isAnonymous,
          allowHrFollowup: allowFollowup,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionResult({
          caseNumber: data.data.caseNumber,
          rawAccessToken: data.data.rawAccessToken,
        });
        toast.success('Demo case submitted.');
      } else {
        toast.error(data.error || 'Submission failed.');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Passcode copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-10">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href="/employee" className="text-xs font-semibold text-blue-600 hover:underline">
            &larr; Back to Employee Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Guided Grievance Submission
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
              &lt; 3 Min
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Read-only public demo: submissions are disabled. Do not enter real workplace concerns or personal information.
          </p>
        </div>

        {/* Anonymity Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-start gap-3 shadow-sm">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Demo privacy notice:</span> This prototype is not approved for real cases. Demo data is stored locally by the application and deployment logs have not been reviewed for anonymity. Grievance text is not sent to Gemini for analysis.
          </div>
        </div>

        {/* Grievance Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Submission Mode</span>
                <span className="text-xs text-slate-500">
                  {isAnonymous
                    ? 'Demo mode omits the submitter ID in the sample record; this is not a production anonymity guarantee.'
                    : 'Identified: HR will know your profile for direct outreach.'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isAnonymous
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  🔒 Anonymous
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !isAnonymous
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  👤 Identified
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Category (Select best match)
              </label>
              <div className="flex flex-wrap gap-2">
                {GRIEVANCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategorySelected(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      categorySelected === cat
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Note: Do not worry if unsure; our AI assistant will assist HR in accurately routing the issue.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Title / Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Unreasonable unrecorded overtime on evening shift..."
                className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description of the Situation *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, when it occurred, who was involved (if you feel comfortable sharing), and how it impacted you or your team..."
                className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Department & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Affected Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General / Organization-Wide</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Incident Date (Optional)
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Severity (As perceived by you)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Low', 'Medium', 'High', 'Critical'] as SeverityLevel[]).map((level) => {
                  const isSelected = severityEmployee === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverityEmployee(level)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? level === 'Critical'
                            ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold ring-2 ring-rose-400/20'
                            : 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-2 ring-blue-400/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs block">{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Communication Option */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={allowFollowup}
                  onChange={(e) => setAllowFollowup(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold block text-slate-900">
                    Allow HR to ask clarifying questions via private case mailbox
                  </span>
                  <span className="text-xs text-slate-500">
                    Recommended. HR can send messages to your case without ever seeing your name or email.
                  </span>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Submissions disabled in public demo</span>
              </button>
            </div>
          </form>
        </div>

        {/* SUCCESS CONFIRMATION MODAL */}
        {submissionResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
              <div className="text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Grievance Registered Successfully</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Your synthetic demo case was recorded in the Northstar sample queue.
                </p>
              </div>

              {/* Case Details Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-200">
                  <span className="text-slate-500 font-medium">Case Number:</span>
                  <span className="font-mono font-bold text-blue-700">{submissionResult.caseNumber}</span>
                </div>

                {submissionResult.rawAccessToken && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Private Access Passcode:
                      </span>
                      <button
                        onClick={() => copyToClipboard(submissionResult.rawAccessToken!)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-sm text-slate-900 break-all select-all font-semibold">
                      {submissionResult.rawAccessToken}
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium pt-1">
                      ⚠️ Please save this passcode! Because you submitted anonymously, this is the only key that can access this case.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  href="/track-case"
                  className="flex-1 text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
                >
                  Go to Case Tracker
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionResult(null);
                    setTitle('');
                    setDescription('');
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
