import { NextResponse } from 'next/server';
import { requireDemoApiSession } from '@/lib/auth/demo-api-access';
import { answerPublicHRTopic } from '@/lib/ai/public-hr-knowledge';

export const dynamic = 'force-dynamic';

const requestWindows = new Map<string, { count: number; expiresAt: number }>();

export async function GET(request: Request) {
  const access = await requireDemoApiSession({ managerOnly: true });
  if (access.response) return access.response;

  const sessionId = access.session!.id;
  const now = Date.now();
  const window = requestWindows.get(sessionId);
  if (window && window.expiresAt > now && window.count >= 6) {
    return NextResponse.json({ success: false, error: 'Please wait before requesting another answer.' }, { status: 429 });
  }
  requestWindows.set(sessionId, !window || window.expiresAt <= now
    ? { count: 1, expiresAt: now + 60_000 }
    : { count: window.count + 1, expiresAt: window.expiresAt });

  const topic = new URL(request.url).searchParams.get('topic') || '';
  const result = await answerPublicHRTopic(topic);
  if (!result) {
    return NextResponse.json({ success: false, error: 'Choose one of the available public HR topics.' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: result });
}
