// PEOPLEPULSE AI — Natural Language People Intelligence Query API

import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { organizationId = '00000000-0000-0000-0000-000000000001', question } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ success: false, error: 'Question cannot be empty' }, { status: 400 });
    }

    const response = await AnalyticsService.queryPeopleIntelligence(organizationId, question.trim());
    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
