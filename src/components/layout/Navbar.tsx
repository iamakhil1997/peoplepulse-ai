'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  Key,
  Users,
  Building2,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

const DEMO_PERSONAS = [
  { name: 'Alex Morgan', role: 'HR Admin', email: 'alex.morgan@northstar.demo', dept: 'People & HR' },
  { name: 'Sarah Chen', role: 'HR Specialist', email: 'sarah.chen@northstar.demo', dept: 'People & HR' },
  { name: 'David Ross', role: 'Org Admin', email: 'david.ross@northstar.demo', dept: 'Operations' },
  { name: 'Marcus Vance', role: 'Employee', email: 'marcus.vance@northstar.demo', dept: 'Engineering' },
  { name: 'Elena Rostova', role: 'Employee', email: 'elena.rostova@northstar.demo', dept: 'Operations' },
];

export function Navbar() {
  const pathname = usePathname();
  const [selectedPersona, setSelectedPersona] = useState(DEMO_PERSONAS[0]);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  const isHR = pathname.startsWith('/hr');
  const isEmployee = pathname.startsWith('/employee');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">PeoplePulse</span>
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                AI
              </span>
            </div>
          </Link>

          {/* Org Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Northstar Technologies</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/employee"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isEmployee
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Employee Voice
          </Link>

          <Link
            href="/hr/dashboard"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isHR
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            HR Intelligence
          </Link>

          <Link
            href="/admin/onboarding"
            className={`hidden md:inline-flex px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isAdmin
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Roster & Org
          </Link>

          <Link
            href="/track-case"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Key className="h-3.5 w-3.5 text-emerald-600" />
            <span>Track Case</span>
          </Link>

          {/* Persona Switcher Dropdown for Testing */}
          <div className="relative ml-1 sm:ml-2">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              title="Switch demo user persona to test RBAC roles"
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">{selectedPersona.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 font-mono border">
                {selectedPersona.role}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 mb-1">
                  Switch Demo Persona
                </div>
                {DEMO_PERSONAS.map((p) => (
                  <button
                    key={p.email}
                    onClick={() => {
                      setSelectedPersona(p);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedPersona.email === p.email
                        ? 'bg-blue-50 text-blue-800 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.dept}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border font-mono">
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
