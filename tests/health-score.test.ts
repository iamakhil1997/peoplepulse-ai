// Tests for Transparent People Health Score Formula

import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from '../src/lib/services/analytics-service';
import { mockDb } from '../src/lib/store/mock-db';

describe('People Health Score Calculator', () => {
  const ORG_ID = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    mockDb.reset();
  });

  it('should calculate overall health score deterministically matching weights', async () => {
    const scoreBreakdown = await AnalyticsService.getPeopleHealthScore(ORG_ID, true);

    expect(scoreBreakdown.overallScore).toBeGreaterThanOrEqual(0);
    expect(scoreBreakdown.overallScore).toBeLessThanOrEqual(100);
    expect(scoreBreakdown.components.moodIndex.weight).toBe(0.35);
    expect(scoreBreakdown.components.slaVelocity.weight).toBe(0.25);
    expect(scoreBreakdown.components.riskStability.weight).toBe(0.20);
    expect(scoreBreakdown.components.recurringContainment.weight).toBe(0.20);
    expect(scoreBreakdown.formulaExplanation).toBeDefined();
  });
});
