'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  CheckSquare,
  Users,
  Building2,
  Shield,
  HelpCircle,
} from 'lucide-react';

const HR_LINKS = [
  { href: '/hr/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/hr/grievances', label: 'Grievance Inbox', icon: Inbox },
  { href: '/hr/insights', label: 'AI Intelligence & Q&A', icon: Sparkles },
  { href: '/hr/actions', label: 'Action Plans', icon: CheckSquare },
  { href: '/admin/onboarding', label: 'Organization & Roster', icon: Users },
];

export function HRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Secondary Sub-nav for HR */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 gap-4 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {HR_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/hr/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span>AI Decision Support Active</span>
          </div>
        </div>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
