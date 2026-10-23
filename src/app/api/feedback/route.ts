import { NextResponse } from 'next/server';
import { PulseService } from '@/lib/services/pulse-service';
import { requireDemoApiSession } from '@/lib/auth/demo-api-access';

export async function POST(request: Request) {
  try {
    const access = await requireDemoApiSession({ writeDisabled: true });
    if (access.response) return access.response;
    const session = access.session!;
    const body = await request.json();
    const { type, content, isAnonymous } = body;

    const employeeId = isAnonymous ? undefined : session.id;
    const organizationId = session.organizationId;
    const department = session.departmentId;

    let result;
    if (type === 'suggestion') {
      result = await PulseService.submitSuggestion({
        organizationId,
        submitterId: employeeId,
        title: 'Employee Suggestion',
        description: content,
        departmentId: department ?? undefined,
        isAnonymous: !!isAnonymous
      });
    } else {
      result = await PulseService.submitFeedback({
        organizationId,
        submitterId: employeeId,
        type: type || 'General',
        title: 'Employee Feedback',
        content,
        departmentId: department ?? undefined,
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
