// PEOPLEPULSE AI — Executive Dashboard Analytics API
// Supports live database querying with persistent fallback and demo mode isolation

import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { getSession } from '@/lib/auth/get-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const orgId = session?.organizationId || searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const isDemo = Boolean(session?.isDemo);

    const metrics = await AnalyticsService.getExecutiveDashboardMetrics(orgId, isDemo);
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
