'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HRLayout } from '@/components/layout/HRLayout';
import { GRIEVANCE_STATUS_CONFIG, RISK_LEVEL_CONFIG } from '@/lib/constants';
import {
  AlertCircle,
  AlertOctagon,
  Clock,
  Filter,
  Inbox,
  Lock,
  Search,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';

export default function HRGrievanceInboxPage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNASSIGNED' | 'CRITICAL' | 'ANONYMOUS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/grievances')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGrievances(data.data || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredGrievances = grievances.filter((g) => {
    // Tab Filter
    if (filterTab === 'UNASSIGNED' && g.assigned_to_user_id) return false;
    if (filterTab === 'CRITICAL' && g.risk_level !== 'CRITICAL' && g.priority !== 'Critical') return false;
    if (filterTab === 'ANONYMOUS' && !g.is_anonymous) return false;
    if (filterTab === 'RESOLVED' && g.status !== 'Resolved' && g.status !== 'Closed') return false;
    if (filterTab === 'ALL' && (g.status === 'Resolved' || g.status === 'Closed')) return true; // Show all in ALL

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchCase = g.case_number.toLowerCase().includes(q);
      const matchCat = g.category_selected.toLowerCase().includes(q);
      const matchDept = g.department?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchCase && !matchCat && !matchDept) return false;
    }

    return true;
  });

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grievance Inbox</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Triage, assign, and resolve workplace concerns with AI decision-support
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 bg-white border px-3 py-1.5 rounded-lg shadow-sm">
              Total Cases: {grievances.length}
            </span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: 'All Cases' },
              { key: 'UNASSIGNED', label: 'Unassigned' },
              { key: 'CRITICAL', label: 'Critical' },
              { key: 'ANONYMOUS', label: 'Anonymous' },
              { key: 'RESOLVED', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by case #, topic, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Case List */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading grievance queue...</div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-base">No cases match your filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try switching tabs or adjusting search query.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGrievances.map((g) => {
              const statusCfg = (GRIEVANCE_STATUS_CONFIG as any)[g.status] || {
                label: g.status,
                color: 'bg-slate-100 text-slate-700',
              };
              const riskCfg = (RISK_LEVEL_CONFIG as any)[g.risk_level] || {
                label: g.risk_level,
                color: 'bg-slate-100 text-slate-700',
              };

              return (
                <Link
                  key={g.id}
                  href={`/hr/grievances/${g.id}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {g.case_number}
                        </span>

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                          {g.status}
                        </span>

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${riskCfg.color}`}>
                          {riskCfg.label}
                        </span>

                        {g.is_anonymous ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Lock className="h-3 w-3" />
                            <span>Anonymous Submitter</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            <User className="h-3 w-3" />
                            <span>Identified Submitter</span>
                          </span>
                        )}

                        {g.has_safety_red_flag && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full animate-pulse">
                            <AlertOctagon className="h-3 w-3" />
                            <span>Critical Safety Screener Alert</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {g.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {g.description}
                      </p>

                      {/* AI Summary Badge if present */}
                      {g.ai_analysis && (
                        <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 mt-0.5 shrink-0" />
                          <div className="line-clamp-1">
                            <span className="font-bold">AI Diagnosis:</span> {g.ai_analysis.summary}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Metadata */}
                    <div className="sm:text-right space-y-1.5 shrink-0 text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div>
                        <span className="text-slate-400">Department:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {g.department?.name || 'Company Wide'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400">Category:</span>{' '}
                        <span className="font-semibold text-slate-800">{g.category_selected}</span>
                      </div>

                      <div className="flex items-center sm:justify-end gap-1 font-medium text-slate-700">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span>SLA Due: {new Date(g.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="pt-1">
                        <span className="text-slate-400">Assignee:</span>{' '}
                        <span className="font-semibold text-slate-900">
                          {g.assigned_to?.profile ? `${g.assigned_to.profile.first_name} ${g.assigned_to.profile.last_name}` : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </HRLayout>
  );
}
