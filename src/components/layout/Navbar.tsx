'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth/session-context';
import {
  ShieldCheck,
  Sparkles,
  Key,
  Building2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useSession();

  const isHR = pathname.startsWith('/hr');
  const isEmployee = pathname.startsWith('/employee');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {/* Prominent Demo Mode Security Banner if in Demo Session */}
      {user?.isDemo && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="h-4 w-4 text-slate-950 flex-shrink-0" />
            <span>
              <strong>DEMO MODE ACTIVE:</strong> Operating on synthetic, non-sensitive demo data. Real employee records and production databases are strictly isolated.
            </span>
          </div>
        </div>
      )}

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
              <span>{user?.organizationName || 'Northstar Technologies'}</span>
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

            {/* Only display HR link if authorized */}
            {(!user || user.roleName !== 'Employee') && (
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
            )}

            {/* Only display Admin link if admin role */}
            {user && ['HR_Admin', 'Org_Admin', 'Super_Admin'].includes(user.roleName) && (
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
            )}

            <Link
              href="/track-case"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Key className="h-3.5 w-3.5 text-emerald-600" />
              <span>Track Case</span>
            </Link>

            {/* Authenticated User Status & Logout */}
            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {user.roleName}
                  </div>
                </div>

                <a
                  href="/auth/logout"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </a>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
