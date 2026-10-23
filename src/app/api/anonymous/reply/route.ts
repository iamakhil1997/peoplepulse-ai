// PEOPLEPULSE AI — Anonymous Submitter Reply API
// Supports both standard Supabase and isolated persistent Demo Mode

import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Replies are disabled in this shared demo. Do not submit real case details.' },
    { status: 503 }
  );
}
