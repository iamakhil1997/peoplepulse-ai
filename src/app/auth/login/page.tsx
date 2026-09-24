'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/employee';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Show error messages from URL params (e.g. from middleware)
  useEffect(() => {
    if (errorParam === 'account_not_found') {
      setErrorMessage(
        'Your account was not found in PeoplePulse. Please contact your HR administrator.'
      );
    }
  }, [errorParam]);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // After clicking the magic link, Supabase redirects here
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        shouldCreateUser: false, // Only allow pre-provisioned users to sign in
      },
    });

    setIsLoading(false);

    if (error) {
      // Supabase returns a generic message for security — do not expose internals
      setErrorMessage(
        'We could not send a login link. Please check your email address or contact your HR administrator.'
      );
      return;
    }

    setMagicLinkSent(true);
  };

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
          <p className="text-slate-600 text-sm">
            We sent a secure login link to{' '}
            <span className="font-semibold text-slate-800">{email}</span>.
          </p>
          <p className="text-slate-500 text-xs">
            The link expires in 60 minutes. You can close this tab after clicking the link.
          </p>
          <button
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/25 mx-auto">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            PeoplePulse{' '}
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 align-middle">
              AI
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your workspace</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-5">
        {errorMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
          <p className="text-slate-500 text-sm mt-1">
            Enter your work email and we'll send a secure login link — no password needed.
          </p>
        </div>

        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending link…
              </>
            ) : (
              <>
                Send Login Link
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          <span>Magic links are single-use and expire in 60 minutes.</span>
        </div>
      </div>

      {/* Anonymous case tracking link */}
      <p className="text-center text-xs text-slate-500">
        Tracking an anonymous grievance?{' '}
        <a href="/track-case" className="text-emerald-600 font-semibold hover:underline">
          Use your case passcode →
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
