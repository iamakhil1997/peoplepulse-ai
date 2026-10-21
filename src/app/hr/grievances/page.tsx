'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HRLayout } from '@/components/layout/HRLayout';
import { GRIEVANCE_STATUS_CONFIG, RISK_LEVEL_CONFIG } from '@/lib/constants';
import {
  AlertOctagon,
  Clock,
  Filter,
  Inbox,
  Lock,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HRGrievanceInboxPage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNASSIGNED' | 'CRITICAL' | 'ANONYMOUS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadInbox = (manual = false) => {
    if (manual) setIsRefreshing(true);
    fetch('/api/grievances')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGrievances(data.data || []);
          if (manual) toast.success('Grievance queue refreshed from database.');
        } else {
          toast.error(data.error || 'Failed to load queue.');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadInbox();
    // Auto-refresh every 8 seconds for cross-portal coordination
    const interval = setInterval(() => loadInbox(false), 8_000);
    return () => clearInterval(interval);
  }, []);

  const filteredGrievances = grievances.filter((g) => {
    if (filterTab === 'UNASSIGNED' && g.assigned_to_user_id) return false;
    if (filterTab === 'CRITICAL' && g.risk_level !== 'CRITICAL' && g.priority !== 'Critical') return false;
    if (filterTab === 'ANONYMOUS' && !g.is_anonymous) return false;
    if (filterTab === 'RESOLVED' && g.status !== 'Resolved' && g.status !== 'Closed') return false;
    if (filterTab === 'ALL' && (g.status === 'Resolved' || g.status === 'Closed')) return true;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchCase = g.case_number.toLowerCase().includes(q);
      const matchCat = g.category_selected.toLowerCase().includes(q);
      if (!matchTitle && !matchCase && !matchCat) return false;
    }

    return true;
  });

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grievance & Case Triage Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live case queue supporting anonymous two-way dialogue, RBAC reviewer assignment, and audit history
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadInbox(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing…' : 'Sync Queue'}</span>
            </button>
            <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              Active Cases: {grievances.length}
            </span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
            {(['ALL', 'UNASSIGNED', 'CRITICAL', 'ANONYMOUS', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  filterTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, case number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Case List */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">Loading live case queue...</div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No matching grievances found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted cases from employees will immediately appear in this synchronized workspace.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGrievances.map((g) => {
              const statusCfg = (GRIEVANCE_STATUS_CONFIG as any)[g.status] || {
                label: g.status,
                color: 'bg-slate-100 text-slate-800 border-slate-200',
              };
              const riskCfg = (RISK_LEVEL_CONFIG as any)[g.risk_level] || {
                label: g.risk_level,
                color: 'bg-slate-100 text-slate-700',
              };

              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {g.case_number}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      {g.is_anonymous && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                          <Lock className="h-2.5 w-2.5" />
                          <span>Zero-Knowledge Anonymous</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>SLA Due: {new Date(g.sla_due_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{g.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{g.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500">
                        Category: <strong className="text-slate-700">{g.category_selected}</strong>
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${riskCfg.color}`}>
                        {riskCfg.label}
                      </span>
                    </div>

                    <Link
                      href={`/hr/grievances/${g.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                    >
                      Manage Case &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </HRLayout>
  );
}
