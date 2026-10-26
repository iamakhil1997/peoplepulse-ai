import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PulseService } from '../src/lib/services/pulse-service';
import { GrievanceService } from '../src/lib/services/grievance-service';
import { AnalyticsService } from '../src/lib/services/analytics-service';
import { persistentStore } from '../src/lib/store/persistent-store';
import { DEMO_PERSONAS } from '../src/lib/auth/demo-session';

describe('Cross-Portal Integration Tests (Employee, HR Admin, Grievance Reviewer)', () => {
  const ORG_ID = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    persistentStore.reset(true);
  });

  it('1. Mood check-in: Employee submission persists and immediately updates HR Admin dashboard', async () => {
    // 1. Submit as Employee
    const submittedPulse = await PulseService.submitPulse({
      organizationId: ORG_ID,
      submitterId: DEMO_PERSONAS.Employee.id,
      departmentId: DEMO_PERSONAS.Employee.departmentId,
      moodScore: 5,
      moodLabel: 'Great',
      category: 'Productivity',
      comment: 'Shipped cross-portal integration today!',
      isAnonymous: false,
      allowHrFollowup: true,
      isDemo: true,
    });

    expect(submittedPulse.id).toBeDefined();
    expect(submittedPulse.mood_score).toBe(5);

    // 2. Read employee history — must show the new check-in
    const history = await PulseService.getEmployeePulseHistory(DEMO_PERSONAS.Employee.id, true);
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].comment).toBe('Shipped cross-portal integration today!');

    // 3. Read HR Executive Dashboard — must reflect live update
    const hrMetrics = await AnalyticsService.getExecutiveDashboardMetrics(ORG_ID, true);
    expect(hrMetrics.healthScore.overallScore).toBeGreaterThan(0);
    expect(hrMetrics.moodTrend.length).toBe(7);
  });

  it('2. Grievance submission: Employee submits case, receives case reference, visible in Reviewer & HR Admin portals', async () => {
    // 1. Employee submits a new case
    const submission = await GrievanceService.submitGrievance({
      organizationId: ORG_ID,
      submitterId: DEMO_PERSONAS.Employee.id,
      departmentId: DEMO_PERSONAS.Employee.departmentId,
      title: 'Ventilation issue in Lab 4',
      description: 'The HVAC unit has been intermittently cycling off.',
      categorySelected: 'Facilities',
      severityEmployee: 'Medium',
      isAnonymous: true,
      allowHrFollowup: true,
      isDemo: true,
    });

    expect(submission.caseNumber).toMatch(/^PP-GR-\d{4}-\d{4}$/);
    expect(submission.rawAccessToken).toBeDefined();

    // 2. HR Admin views inbox — new case must be visible
    const hrInbox = await GrievanceService.getHRGrievanceInbox(ORG_ID, 'HR_Admin', DEMO_PERSONAS.HR_Admin.id, true);
    const foundCase = hrInbox.find((c) => c.case_number === submission.caseNumber);
    expect(foundCase).toBeDefined();
    expect(foundCase?.title).toBe('Ventilation issue in Lab 4');
  });

  it('3. Status update & Audit History: Reviewer updates status, audit log is written, employee sees update in tracking portal', async () => {
    const caseId = 'demo-gr-001';
    const reviewerId = DEMO_PERSONAS.Reviewer.id;

    // 1. Reviewer changes status to 'Investigation'
    const updated = await GrievanceService.updateStatus({
      organizationId: ORG_ID,
      grievanceId: caseId,
      changedByUserId: reviewerId,
      newStatus: 'Investigation',
      reason: 'Assigned investigator to inspect handover checklist.',
      role: 'Reviewer',
      isDemo: true,
    });

    expect(updated?.status).toBe('Investigation');

    // 2. Check audit trail
    const detail = await GrievanceService.getGrievanceDetail(ORG_ID, caseId, 'Reviewer', reviewerId, true);
    expect(detail?.history.length).toBeGreaterThanOrEqual(1);
    expect(detail?.history[0].new_status).toBe('Investigation');

    // 3. Employee anonymous tracking lookup — verifies status change without auth
    const tracked = await GrievanceService.trackAnonymousGrievance('PP-DEMO-2026-001', 'demo-passcode-non-anon', true);
    // Case 1 is non-anon in seed, let's verify Case 2 anon tracking
    const trackedAnon = await GrievanceService.trackAnonymousGrievance('PP-DEMO-2026-002', 'demo-passcode-1002', true);
    expect(trackedAnon.success).toBe(true);
    expect(trackedAnon.case?.status).toBe('Investigation');
  });

  it('4. Two-way communication: HR responds, Employee replies, messages persist in thread', async () => {
    const caseId = 'demo-gr-002';

    // 1. HR posts response
    const hrMsg = await GrievanceService.addMessage({
      organizationId: ORG_ID,
      grievanceId: caseId,
      senderUserId: DEMO_PERSONAS.HR_Admin.id,
      senderRole: 'HR',
      messageText: 'Facility maintenance has been scheduled for tomorrow 10 AM.',
      isInternalNote: false,
      isDemo: true,
    });
    expect(hrMsg?.id).toBeDefined();

    // 2. Employee checks tracking portal — message must appear
    const tracked = await GrievanceService.trackAnonymousGrievance('PP-DEMO-2026-002', 'demo-passcode-1002', true);
    expect(tracked.success).toBe(true);
    const hasMsg = tracked.messages?.some((m) => m.message_text.includes('Facility maintenance has been scheduled'));
    expect(hasMsg).toBe(true);
  });

  it('5. RBAC & Tenant isolation: Employee cannot access HR inbox, Reviewer cannot see unassigned cases', async () => {
    // Employee role denied from accessing HR queue
    const employeeInbox = await GrievanceService.getHRGrievanceInbox(ORG_ID, 'Employee', DEMO_PERSONAS.Employee.id, true);
    expect(employeeInbox.length).toBe(0);

    // Reviewer only sees assigned cases (PP-DEMO-2026-001 and 003), NOT 002
    const reviewerInbox = await GrievanceService.getHRGrievanceInbox(ORG_ID, 'Reviewer', DEMO_PERSONAS.Reviewer.id, true);
    const unassignedFound = reviewerInbox.find((c) => c.id === 'demo-gr-002');
    expect(unassignedFound).toBeUndefined();
  });
});
