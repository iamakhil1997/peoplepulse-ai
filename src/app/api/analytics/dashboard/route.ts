// PEOPLEPULSE AI — Executive Dashboard Analytics API

import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || '00000000-0000-0000-0000-000000000001';
    const metrics = await AnalyticsService.getExecutiveDashboardMetrics(orgId);
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
