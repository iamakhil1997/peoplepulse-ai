// PEOPLEPULSE AI — Natural Language People Intelligence Query API

import { NextResponse } from 'next/server';

export async function POST() {
  // The shared public demo has no reviewed redaction layer. Never accept free-text questions for AI processing.
  return NextResponse.json(
    { success: false, error: 'AI questions are disabled in this shared demo until sensitive text redaction is available.' },
    { status: 503 }
  );
}
