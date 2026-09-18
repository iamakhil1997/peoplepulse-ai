import { NextResponse } from 'next/server';
import { PulseService } from '@/lib/services/pulse-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, content, isAnonymous, department, sentiment } = body;

    // Hardcoding the mock context for the demo
    const employeeId = isAnonymous ? undefined : 'emp-2';
    const organizationId = 'org-1';

    let result;
    if (type === 'suggestion') {
      result = await PulseService.submitSuggestion({
        organizationId,
        employeeId,
        content,
        department,
        isAnonymous: !!isAnonymous
      });
    } else {
      result = await PulseService.submitFeedback({
        organizationId,
        employeeId,
        content,
        department,
        sentiment,
        isAnonymous: !!isAnonymous
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
