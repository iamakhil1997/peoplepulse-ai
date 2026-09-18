'use client';

import React, { useState, useEffect } from 'react';
import { HRLayout } from '@/components/layout/HRLayout';
import {
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  Lightbulb,
  Plus,
  Shield,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HRActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setActions(data.data.actionRecommendations || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Approved' ? 'In Progress' : currentStatus === 'In Progress' ? 'Completed' : 'Approved';
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );
    toast.success(`Action status updated to "${nextStatus}".`);
  };

  return (
    <HRLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recommended Action Plans
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Human-approved organizational interventions derived from pulse sentiment and grievance trends
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border shadow-sm text-slate-600">
              {actions.length} Action Items
            </span>
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-3">
          {actions.map((act) => {
            const isCompleted = act.status === 'Completed';
            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {act.category || 'General HR'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        act.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {act.priority} Priority
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{act.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(act.id, act.status)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isCompleted ? 'Completed' : 'Advance Progress'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HRLayout>
  );
}
