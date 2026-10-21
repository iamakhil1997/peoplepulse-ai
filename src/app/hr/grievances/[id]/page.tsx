'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HRLayout } from '@/components/layout/HRLayout';
import { GRIEVANCE_STATUS_CONFIG, RISK_LEVEL_CONFIG } from '@/lib/constants';
import { GrievanceStatus } from '@/lib/types/database';
import {
  AlertCircle,
  Clock,
  History,
  Lock,
  MessageSquare,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HRGrievanceDetailPage() {
  const params = useParams();
  const grievanceId = params.id as string;

  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'PUBLIC_CHAT' | 'INTERNAL_NOTES' | 'AUDIT_TRAIL'>('PUBLIC_CHAT');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadCaseDetail = (manual = false) => {
    if (manual) setIsRefreshing(true);
    fetch(`/api/grievances/${grievanceId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
          if (manual) toast.success('Case updated from database.');
        } else {
          toast.error(resData.error || 'Case not found');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadCaseDetail();
    // Auto-refresh every 6 seconds for live two-way synchronization
    const interval = setInterval(() => loadCaseDetail(false), 6_000);
    return () => clearInterval(interval);
  }, [grievanceId]);

  const handleStatusChange = async (newStatus: GrievanceStatus) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/grievances/${grievanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          newStatus,
          reason: `Reviewer set status to ${newStatus}`,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success(`Status updated to "${newStatus}" and recorded in audit trail.`);
        loadCaseDetail();
      } else {
        toast.error(resData.error || 'Status update failed.');
      }
    } catch {
      toast.error('Network error updating status.');
    } finally {
      setStatusUpdating(false);
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
        toast.success(isInternal ? 'Internal HR note added.' : 'Message sent to employee mailbox.');
        setMessageInput('');
        loadCaseDetail();
      } else {
        toast.error(resData.error || 'Failed to send message.');
      }
    } catch {
      toast.error('Network error sending message.');
    } finally {
      setIsSending(false);
    }
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

  const statusCfg = (GRIEVANCE_STATUS_CONFIG as any)[data.status] || { label: data.status, color: 'bg-slate-100 text-slate-800' };
  const riskCfg = (RISK_LEVEL_CONFIG as any)[data.risk_level] || { label: data.risk_level, color: 'bg-slate-100' };

  const publicMessages = (data.messages || []).filter((m: any) => !m.is_internal_note);
  const internalNotes = (data.messages || []).filter((m: any) => m.is_internal_note);
  const auditHistory = data.history || [];

  return (
    <HRLayout>
      <div className="space-y-6 pb-12">
        {/* Breadcrumb & Live Refresh */}
        <div className="flex items-center justify-between">
          <Link href="/hr/grievances" className="text-xs font-semibold text-blue-600 hover:underline">
            &larr; Back to Grievance Queue
          </Link>

          <button
            onClick={() => loadCaseDetail(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
          >
            <RefreshCw className={`h-3 w-3 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing…' : 'Sync Live Case'}</span>
          </button>
        </div>

        {/* Case Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                {data.case_number}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              {data.is_anonymous && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                  <Lock className="h-3 w-3" />
                  <span>Anonymous Complainant</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">
                Opened: <strong className="text-slate-700">{new Date(data.created_at).toLocaleDateString()}</strong>
              </span>
              <span className="text-slate-500">
                SLA: <strong className="text-slate-700">{new Date(data.sla_due_at).toLocaleDateString()}</strong>
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">{data.title}</h1>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {data.description}
            </p>
          </div>

          {/* Status Quick-Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 mr-2">Triage Action:</span>
            {(['Under Review', 'Investigation', 'Action Required', 'Resolved', 'Closed'] as GrievanceStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                disabled={statusUpdating || data.status === st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  data.status === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Mark as {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tabbed Message & Audit Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('PUBLIC_CHAT')}
              className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'PUBLIC_CHAT'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Two-Way Dialogue ({publicMessages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('INTERNAL_NOTES')}
              className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'INTERNAL_NOTES'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-amber-600" />
              <span>HR Internal Notes ({internalNotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('AUDIT_TRAIL')}
              className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'AUDIT_TRAIL'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <History className="h-3.5 w-3.5 text-purple-600" />
              <span>Audit Trail ({auditHistory.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'AUDIT_TRAIL' ? (
              <div className="space-y-3">
                {auditHistory.length === 0 ? (
                  <p className="text-xs text-slate-500">No status changes recorded yet.</p>
                ) : (
                  auditHistory.map((h: any) => (
                    <div key={h.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {h.old_status ? `${h.old_status} → ${h.new_status}` : `Initial Status: ${h.new_status}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600">{h.reason}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages Feed */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {(activeTab === 'PUBLIC_CHAT' ? publicMessages : internalNotes).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      {activeTab === 'PUBLIC_CHAT'
                        ? 'No messages yet. Send a response to communicate with the employee.'
                        : 'No confidential internal notes recorded.'}
                    </p>
                  ) : (
                    (activeTab === 'PUBLIC_CHAT' ? publicMessages : internalNotes).map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                          m.sender_role === 'HR'
                            ? 'bg-blue-50/70 border-blue-200 ml-4'
                            : 'bg-slate-50 border-slate-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className={m.sender_role === 'HR' ? 'text-blue-900' : 'text-slate-800'}>
                            {m.sender_role === 'HR' ? 'HR / Reviewer' : 'Employee Complainant'}
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

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      activeTab === 'PUBLIC_CHAT'
                        ? 'Write a safe response to the employee...'
                        : 'Add a confidential HR note (never shown to employee)...'
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !messageInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
