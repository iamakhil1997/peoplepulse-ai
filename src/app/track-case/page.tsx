'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { GRIEVANCE_STATUS_CONFIG } from '@/lib/constants';
import {
  AlertCircle,
  Clock,
  Key,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrackCasePage() {
  const [caseNumber, setCaseNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [caseData, setCaseData] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const handleLookup = async (e?: React.FormEvent, customCase?: string, customPasscode?: string) => {
    if (e) e.preventDefault();
    const cNum = customCase || caseNumber;
    const pCode = customPasscode || passcode;

    if (!cNum.trim() || !pCode.trim()) {
      toast.error('Please enter both your Case Number and Access Passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/anonymous/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseNumber: cNum, passcode: pCode }),
      });

      const data = await res.json();
      if (data.success) {
        setCaseData(data.data.case);
        setMessages(data.data.messages || []);
        toast.success('Case verified. Loading conversation mailbox.');
      } else {
        toast.error(data.error || 'Invalid credentials or case not found.');
      }
    } catch (err) {
      toast.error('Network error during case lookup.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoCase = () => {
    setCaseNumber('PP-GR-2026-1001');
    setPasscode('demo-passcode-1001');
    handleLookup(undefined, 'PP-GR-2026-1001', 'demo-passcode-1001');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/anonymous/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseNumber: caseData.case_number,
          passcode,
          messageText: replyText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setReplyText('');
        toast.success('Anonymous reply delivered to HR case manager.');
      } else {
        toast.error(data.error || 'Failed to send reply.');
      }
    } catch (err) {
      toast.error('Error sending message.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const statusConfig = caseData ? (GRIEVANCE_STATUS_CONFIG as any)[caseData.status] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
            <Key className="h-3.5 w-3.5" />
            <span>Encrypted Case Mailbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Anonymous Case Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Track investigation updates, read HR responses, and reply anonymously without signing in.
          </p>
        </div>

        {!caseData ? (
          /* Lookup Card */
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <form onSubmit={(e) => handleLookup(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Case Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PP-GR-2026-1001"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Private Access Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter secret token / passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50"
              >
                {isLoading ? 'Verifying Key...' : 'Unlock Case Mailbox'}
              </button>
            </form>

            {/* Quick Demo Button */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500 block mb-2 font-medium">Want to test with sample demo case?</span>
              <button
                type="button"
                onClick={loadDemoCase}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Load Demo Case (PP-GR-2026-1001)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Case Workspace */
          <div className="space-y-6">
            {/* Top Status Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {caseData.case_number}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        statusConfig ? statusConfig.color : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {caseData.status}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{caseData.title}</h2>
                </div>

                <button
                  onClick={() => {
                    setCaseData(null);
                    setMessages([]);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold self-start"
                >
                  &larr; Check another case
                </button>
              </div>

              {/* Case Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block font-medium">Category</span>
                  <span className="font-semibold text-slate-800">{caseData.category_selected}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Reported Severity</span>
                  <span className="font-semibold text-slate-800">{caseData.severity_employee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Submitted Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Target SLA Window</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>{caseData.sla_due_at ? new Date(caseData.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</span>
                  </span>
                </div>
              </div>

              {/* Original Description */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900 block mb-1">Original Report:</span>
                {caseData.description}
              </div>
            </div>

            {/* Conversation Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6 border-b pb-3">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Two-Way Confidential Conversation
                </h3>
              </div>

              <div className="space-y-4 mb-6">
                {messages.map((msg, index) => {
                  const isEmployee = msg.sender_role === 'EMPLOYEE';
                  const isSystem = msg.sender_role === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={msg.id || index} className="text-center my-3">
                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-medium">
                          ⚙️ {msg.message_text} &bull; {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isEmployee ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {isEmployee ? 'You (Anonymous Submitter)' : 'HR People Partner'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isEmployee
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        {msg.message_text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an anonymous reply or provide additional details to HR..."
                  className="flex-1 text-xs sm:text-sm rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSendingReply || !replyText.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
