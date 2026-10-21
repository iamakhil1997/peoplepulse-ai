'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { GRIEVANCE_STATUS_CONFIG } from '@/lib/constants';
import {
  AlertCircle,
  Clock,
  Key,
  Lock,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrackCasePage() {
  const [caseNumber, setCaseNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [caseData, setCaseData] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const handleLookup = async (e?: React.FormEvent, customCase?: string, customPasscode?: string, manual = false) => {
    if (e) e.preventDefault();
    const cNum = customCase || caseNumber;
    const pCode = customPasscode || passcode;

    if (!cNum.trim() || !pCode.trim()) {
      toast.error('Please enter both your Case Number and Access Passcode.');
      return;
    }

    if (manual) setIsRefreshing(true);
    else if (!caseData) setIsLoading(true);

    try {
      const res = await fetch('/api/anonymous/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseNumber: cNum.trim(), passcode: pCode.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setCaseData(data.data.case);
        setMessages(data.data.messages || []);
        if (manual) toast.success('Case status refreshed from database.');
      } else {
        if (!manual) toast.error(data.error || 'Case not found or invalid credentials.');
      }
    } catch {
      toast.error('Network error during case lookup.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Safe polling auto-refresh when case is opened
  useEffect(() => {
    if (!caseData || !caseNumber || !passcode) return;
    const interval = setInterval(() => {
      handleLookup(undefined, caseNumber, passcode, false);
    }, 6_000);
    return () => clearInterval(interval);
  }, [caseData, caseNumber, passcode]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !caseData) return;

    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/grievances/${caseData.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: replyText.trim(),
          isInternalNote: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Your message has been securely sent to the review team.');
        setReplyText('');
        handleLookup(undefined, caseNumber, passcode, true);
      } else {
        toast.error(data.error || 'Failed to send message.');
      }
    } catch {
      toast.error('Network error sending message.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const statusCfg = caseData
    ? (GRIEVANCE_STATUS_CONFIG as any)[caseData.status] || {
        label: caseData.status,
        color: 'bg-slate-100 text-slate-800',
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Lock className="h-3.5 w-3.5" />
            <span>Zero-Knowledge Case Tracking Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Confidential Case Status & Messages
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Check live review progress and communicate directly with HR or Reviewers without revealing your identity.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <form onSubmit={(e) => handleLookup(e, caseNumber, passcode, false)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="case-number" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Case Number:
                </label>
                <input
                  id="case-number"
                  type="text"
                  placeholder="e.g. PP-DEMO-2026-001"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="access-passcode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Access Passcode:
                </label>
                <input
                  id="access-passcode"
                  type="text"
                  placeholder="e.g. demo-passcode-1002"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !caseNumber.trim() || !passcode.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition"
            >
              <Key className="h-3.5 w-3.5" />
              <span>{isLoading ? 'Decrypting Case Status…' : 'Open Case Status'}</span>
            </button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">Demo shortcut:</span>
            <button
              type="button"
              onClick={() => {
                setCaseNumber('PP-DEMO-2026-002');
                setPasscode('demo-passcode-1002');
                handleLookup(undefined, 'PP-DEMO-2026-002', 'demo-passcode-1002', false);
              }}
              className="text-blue-600 hover:underline font-mono"
            >
              Load Demo Case PP-DEMO-2026-002
            </button>
          </div>
        </div>

        {/* Live Case Details */}
        {caseData && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                  {caseData.case_number}
                </span>
                {statusCfg && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLookup(undefined, caseNumber, passcode, true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
                >
                  <RefreshCw className={`h-3 w-3 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing…' : 'Sync Live'}</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">{caseData.title}</h2>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {caseData.description}
              </p>
            </div>

            {/* Two-Way Anonymous Messages */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                  <span>Secure Communication Channel</span>
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Zero-Knowledge Protected
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No messages in this case thread yet.
                  </p>
                ) : (
                  messages.map((m: any) => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        m.sender_role === 'EMPLOYEE'
                          ? 'bg-blue-50/70 border-blue-200 ml-4'
                          : 'bg-slate-50 border-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className={m.sender_role === 'EMPLOYEE' ? 'text-blue-900' : 'text-slate-800'}>
                          {m.sender_role === 'EMPLOYEE' ? 'You (Complainant)' : 'People Team / Reviewer'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{m.message_text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Box */}
              {caseData.allow_hr_followup && (
                <form onSubmit={handleSendReply} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Send an anonymous response to the case reviewer..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || !replyText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
