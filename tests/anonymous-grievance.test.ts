// Tests for Zero-Knowledge Anonymous Grievances & Internal Note Privacy

import { describe, it, expect, beforeEach } from 'vitest';
import { GrievanceService } from '../src/lib/services/grievance-service';
import { mockDb } from '../src/lib/store/mock-db';

describe('Anonymous Grievance & Privacy System', () => {
  const ORG_ID = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    mockDb.reset();
  });

  it('should create an anonymous grievance with NULL submitter_id and generate a private token', async () => {
    const result = await GrievanceService.submitGrievance({
      organizationId: ORG_ID,
      title: 'Anonymous Shift Complaint',
      description: 'Overtime hours not logged on Shift A.',
      categorySelected: 'Workload',
      severityEmployee: 'High',
      isAnonymous: true,
      allowHrFollowup: true,
    });

    expect(result.grievance.is_anonymous).toBe(true);
    expect(result.grievance.submitter_id).toBeNull();
    expect(result.rawAccessToken).toBeDefined();
    expect(result.caseNumber).toMatch(/^PP-GR-\d{4}-\d{4}$/);
  });

  it('should allow lookup with valid case number and token', async () => {
    const tracked = await GrievanceService.trackAnonymousGrievance(
      'PP-GR-2026-1001',
      'demo-passcode-1001'
    );

    expect(tracked.success).toBe(true);
    expect(tracked.case?.case_number).toBe('PP-GR-2026-1001');
    expect(tracked.messages).toBeDefined();
  });

  it('should reject invalid tracking passcodes', async () => {
    const tracked = await GrievanceService.trackAnonymousGrievance(
      'PP-GR-2026-1001',
      'wrong-passcode-123'
    );

    expect(tracked.success).toBe(false);
  });

  it('should NEVER expose internal HR notes to the anonymous tracking mailbox', async () => {
    // Add an internal note to Case 1001
    await GrievanceService.addHRMessage({
      organizationId: ORG_ID,
      grievanceId: '00000000-0000-0000-0005-000000000001',
      hrUserId: '00000000-0000-0000-0003-000000000001',
      messageText: 'CONFIDENTIAL: Private HR internal deliberation.',
      isInternalNote: true,
    });

    // Anonymous Employee queries the case
    const tracked = await GrievanceService.trackAnonymousGrievance(
      'PP-GR-2026-1001',
      'demo-passcode-1001'
    );

    expect(tracked.success).toBe(true);
    const messages = tracked.messages || [];

    // Ensure NO internal notes leaked to employee
    const internalNoteFound = messages.some((m: any) => m.message_text.includes('CONFIDENTIAL') || m.is_internal_note);
    expect(internalNoteFound).toBe(false);
  });
});
