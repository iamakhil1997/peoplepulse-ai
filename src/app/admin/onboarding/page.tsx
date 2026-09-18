'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HRLayout } from '@/components/layout/HRLayout';
import {
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Plus,
  Shield,
  Upload,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOnboardingPage() {
  const [orgData, setOrgData] = useState<any | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Department Form
  const [newDeptName, setNewDeptName] = useState('');
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const loadData = () => {
    fetch('/api/organization/onboarding')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrgData(data.data.org);
          setDepartments(data.data.departments || []);
          setEmployees(data.data.employees || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setIsCreatingDept(true);
    try {
      const res = await fetch('/api/organization/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_department',
          departmentName: newDeptName.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Department "${newDeptName}" created.`);
        setNewDeptName('');
        loadData();
      } else {
        toast.error(data.error || 'Failed to create department.');
      }
    } catch (e) {
      toast.error('Network error.');
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      toast.error('Please paste CSV content or upload a template file.');
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch('/api/organization/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvText }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Imported ${data.importedCount} employees into roster.`);
        setCsvText('');
        loadData();
      } else {
        toast.error(data.errors?.join(', ') || 'Failed to import CSV.');
      }
    } catch (e) {
      toast.error('Network error during import.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    window.location.href = '/api/organization/onboarding?sample=csv';
  };

  return (
    <HRLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Organization Setup & Roster Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage company structure, departments, and bulk employee onboarding
          </p>
        </div>

        {/* Company Settings Card */}
        {orgData && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Organization Profile
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Company Name</span>
                <span className="font-bold text-slate-900 text-sm">{orgData.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Industry</span>
                <span className="font-semibold text-slate-800">{orgData.industry}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Headcount Tier</span>
                <span className="font-semibold text-slate-800">{orgData.employee_count_tier} employees</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">K-Anonymity Threshold</span>
                <span className="font-semibold text-slate-800">Min. {orgData.k_anonymity_threshold} responses</span>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column: Department Manager & Bulk CSV Import */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Departments ({departments.length})
                </h2>
              </div>

              <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto">
                {departments.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <span>{d.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border">
                      {d.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Department */}
            <form onSubmit={handleCreateDepartment} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="New Department name..."
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isCreatingDept || !newDeptName.trim()}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Bulk CSV Import */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Bulk CSV Employee Import
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Template CSV</span>
                </button>
              </div>

              <form onSubmit={handleImportCSV} className="space-y-3">
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Paste CSV contents here: first_name,last_name,email,department,job_title,hire_date,role..."
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  disabled={isImporting || !csvText.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isImporting ? 'Processing Roster...' : 'Upload & Import Employees'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Employee Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Current Employee Roster ({employees.length})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Job Title</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td className="py-3 font-mono text-slate-500">{emp.email}</td>
                    <td className="py-3">{emp.job_title}</td>
                    <td className="py-3">{emp.department?.name || 'General'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border text-[10px] font-bold text-slate-700">
                        {emp.role_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
