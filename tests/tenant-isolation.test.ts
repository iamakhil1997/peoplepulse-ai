// Tests for Tenant Isolation & Multi-Org Separation

import { describe, it, expect, beforeEach } from 'vitest';
import { GrievanceService } from '../src/lib/services/grievance-service';
import { PulseService } from '../src/lib/services/pulse-service';
import { mockDb } from '../src/lib/store/mock-db';

describe('Multi-Tenant SaaS Boundary Enforcement', () => {
  const ORG_A = '00000000-0000-0000-0000-000000000001';
  const ORG_B = '00000000-0000-0000-0000-000000000002';

  beforeEach(() => {
    mockDb.reset();
  });

  it('should prevent HR from Org B from viewing Grievances of Org A', async () => {
    const orgAGrievances = await GrievanceService.getHRGrievanceInbox(ORG_A, 'HR_Admin', undefined, true);
    const orgBGrievances = await GrievanceService.getHRGrievanceInbox(ORG_B, 'HR_Admin', undefined, true);

    expect(orgAGrievances.length).toBeGreaterThan(0);
    expect(orgBGrievances.length).toBe(0); // Org B has no records
  });

  it('should isolate pulse analytics across organization boundaries', async () => {
    // Submit pulse to Org B
    await PulseService.submitPulse({
      organizationId: ORG_B,
      moodScore: 5,
      moodLabel: 'Great',
      isAnonymous: false,
      allowHrFollowup: false,
      isDemo: true,
    });

    const pulsesA = await PulseService.getOrgPulses(ORG_A, 30, true);
    const pulsesB = await PulseService.getOrgPulses(ORG_B, 30, true);

    expect(pulsesB.length).toBe(1);
    const hasLeaked = pulsesA.some((p) => p.organization_id === ORG_B);
    expect(hasLeaked).toBe(false);
  });
});
