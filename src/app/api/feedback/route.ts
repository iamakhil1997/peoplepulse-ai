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
        submitterId: employeeId,
        title: 'Employee Suggestion',
        description: content,
        departmentId: department,
        isAnonymous: !!isAnonymous
      });
    } else {
      result = await PulseService.submitFeedback({
        organizationId,
        submitterId: employeeId,
        type: type || 'General',
        title: 'Employee Feedback',
        content,
        departmentId: department,
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
