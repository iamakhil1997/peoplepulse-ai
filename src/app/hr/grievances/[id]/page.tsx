'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HRLayout } from '@/components/layout/HRLayout';
import { GRIEVANCE_STATUS_CONFIG, RISK_LEVEL_CONFIG } from '@/lib/constants';
import { GrievanceStatus } from '@/lib/types/database';
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Copy,
  Lock,
  MessageSquare,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HRGrievanceDetailPage() {
  const params = useParams();
  const grievanceId = params.id as string;

  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PUBLIC_CHAT' | 'INTERNAL_NOTES'>('PUBLIC_CHAT');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadCaseDetail = () => {
    fetch(`/api/grievances/${grievanceId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        } else {
          toast.error(resData.error || 'Case not found');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCaseDetail();
  }, [grievanceId]);

  const handleStatusChange = async (newStatus: GrievanceStatus) => {
    try {
      const res = await fetch(`/api/grievances/${grievanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          newStatus,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success(`Status updated to "${newStatus}"`);
        loadCaseDetail();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsSending(true);
    const isInternal = activeTab === 'INTERNAL_NOTES';

    try {
      const res = await fetch(`/api/grievances/${grievanceId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: messageInput.trim(),
          isInternalNote: isInternal,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success(isInternal ? 'Internal note added.' : 'Message sent to employee mailbox.');
        setMessageInput('');
        loadCaseDetail();
      } else {
        toast.error(resData.error || 'Failed to send message.');
      }
    } catch (err) {
      toast.error('Network error.');
    } finally {
      setIsSending(false);
    }
  };

  const applyAIDraftResponse = (draft: string) => {
    setActiveTab('PUBLIC_CHAT');
    setMessageInput(draft);
    toast.info('AI suggested draft populated into message box.');
  };

  if (isLoading || !data) {
    return (
      <HRLayout>
        <div className="py-20 text-center text-sm text-slate-500 font-medium">
          Loading case workspace...
        </div>
      </HRLayout>
    );
  }

  const statusCfg = (GRIEVANCE_STATUS_CONFIG as any)[data.status] || { label: data.status, color: 'bg-slate-100' };
  const riskCfg = (RISK_LEVEL_CONFIG as any)[data.risk_level] || { label: data.risk_level, color: 'bg-slate-100' };

  const publicMessages = (data.messages || []).filter((m: any) => !m.is_internal_note);
  const internalNotes = (data.messages || []).filter((m: any) => m.is_internal_note);

  return (
    <HRLayout>
      <div className="space-y-6 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/hr/grievances" className="text-xs font-semibold text-blue-600 hover:underline">
            &larr; Back to Grievance Inbox
          </Link>
          <span className="text-xs text-slate-400 font-mono">Case ID: {data.id}</span>
        </div>

        {/* Case Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {data.case_number}
                </span>

                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                  {data.status}
                </span>

                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${riskCfg.color}`}>
                  {riskCfg.label}
                </span>

                {data.is_anonymous ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" />
                    <span>Anonymous Submitter (Identity Protected)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    <User className="h-3 w-3" />
                    <span>Identified Employee</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{data.title}</h1>
            </div>

            {/* Quick Status Control */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</label>
              <select
                value={data.status}
                onChange={(e) => handleStatusChange(e.target.value as GrievanceStatus)}
                className="text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Awaiting Employee">Awaiting Employee</option>
                <option value="Investigation">Investigation</option>
                <option value="Action Required">Action Required</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Metadata Subgrid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="font-semibold text-slate-900">{data.department?.name || 'Company Wide'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Selected Category</span>
              <span className="font-semibold text-slate-900">{data.category_selected}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Incident Date</span>
              <span className="font-semibold text-slate-900">
                {data.incident_date ? new Date(data.incident_date).toLocaleDateString() : 'Ongoing / Not Specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Target SLA Window</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>{data.sla_due_at ? new Date(data.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: Original Statement + Message Timeline & Internal Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Complaint */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Original Employee Statement
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {data.description}
              </div>
            </div>

            {/* Conversation & Notes Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Tab Header */}
              <div className="flex border-b bg-slate-50/70 p-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('PUBLIC_CHAT')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'PUBLIC_CHAT'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Two-Way Dialogue ({publicMessages.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('INTERNAL_NOTES')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'INTERNAL_NOTES'
                      ? 'bg-amber-50 text-amber-900 shadow-sm border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5 text-amber-700" />
                  <span>HR Internal Notes ({internalNotes.length})</span>
                </button>
              </div>

              {/* Tab Notice */}
              {activeTab === 'INTERNAL_NOTES' && (
                <div className="p-3 bg-amber-50/80 border-b border-amber-200 text-[11px] font-semibold text-amber-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700" />
                  <span>Confidential to HR: Internal notes and evidence logs are strictly hidden from the employee.</span>
                </div>
              )}

              {/* Message List */}
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                {(activeTab === 'PUBLIC_CHAT' ? publicMessages : internalNotes).length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    {activeTab === 'PUBLIC_CHAT'
                      ? 'No messages in public dialogue yet.'
                      : 'No confidential internal HR notes recorded yet.'}
                  </div>
                ) : (
                  (activeTab === 'PUBLIC_CHAT' ? publicMessages : internalNotes).map((msg: any) => {
                    const isHR = msg.sender_role === 'HR';
                    const isSys = msg.sender_role === 'SYSTEM';

                    if (isSys) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="text-[11px] font-medium bg-slate-100 border text-slate-600 px-3 py-1 rounded-full">
                            ⚙️ {msg.message_text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isHR ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-600">
                            {isHR
                              ? 'HR People Partner'
                              : data.is_anonymous
                              ? 'Anonymous Submitter'
                              : 'Employee'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            msg.is_internal_note
                              ? 'bg-amber-100/80 text-amber-950 border border-amber-300 rounded-tr-none'
                              : isHR
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.message_text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={
                    activeTab === 'PUBLIC_CHAT'
                      ? 'Send a question or update to the employee mailbox...'
                      : 'Add a private investigation note (visible only to HR)...'
                  }
                  className="flex-1 text-xs sm:text-sm rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !messageInput.trim()}
                  className={`px-4 py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                    activeTab === 'INTERNAL_NOTES'
                      ? 'bg-amber-700 hover:bg-amber-800'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{activeTab === 'INTERNAL_NOTES' ? 'Add Note' : 'Send'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT 1 COL: AI Decision-Support Intelligence Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    AI Grievance Analysis
                  </h2>
                </div>
                <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                  {data.ai_analysis?.model_version || 'Gemini'}
                </span>
              </div>

              {data.ai_analysis ? (
                <div className="space-y-4 text-xs">
                  {/* Summary */}
                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                      Structured Executive Summary
                    </span>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {data.ai_analysis.summary}
                    </p>
                  </div>

                  {/* Classification & Sentiment */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">AI Suggested Area</span>
                      <span className="font-bold text-slate-800 line-clamp-1">
                        {data.ai_analysis.category || data.category_selected}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Sentiment Tone</span>
                      <span className="font-bold text-slate-800">
                        {data.ai_analysis.sentiment_score !== undefined
                          ? `${data.ai_analysis.sentiment_score} (Negative)`
                          : 'Negative'}
                      </span>
                    </div>
                  </div>

                  {/* Policy Cross-Reference */}
                  {data.ai_analysis.possible_policy_area && (
                    <div>
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                        Applicable Company Policy
                      </span>
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 font-medium">
                        📜 {data.ai_analysis.possible_policy_area}
                      </div>
                    </div>
                  )}

                  {/* Key Topics Tags */}
                  {data.ai_analysis.key_topics && (
                    <div>
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1.5">
                        Key Extracted Topics
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.ai_analysis.key_topics.map((topic: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px]"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Draft Response */}
                  {data.ai_analysis.recommended_hr_response && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 text-[11px]">
                          Suggested Acknowledgment Draft
                        </span>
                        <button
                          type="button"
                          onClick={() => applyAIDraftResponse(data.ai_analysis.recommended_hr_response)}
                          className="text-[11px] font-semibold text-purple-700 hover:underline flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Use Draft</span>
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-950 text-[11px] leading-relaxed italic">
                        &quot;{data.ai_analysis.recommended_hr_response}&quot;
                      </div>
                    </div>
                  )}

                  {/* Next Action Checklist */}
                  {data.ai_analysis.recommended_next_actions && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                        Recommended Next Steps
                      </span>
                      <div className="space-y-1.5">
                        {data.ai_analysis.recommended_next_actions.map((act: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                            <span>{act.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ethical Disclaimer */}
                  <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>AI Decision Support:</strong> For HR guidance only. AI does not determine guilt or replace human investigation.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  AI analysis generated automatically on submission.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
