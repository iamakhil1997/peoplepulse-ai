// Tests for Deterministic Critical Safety Screener

import { describe, it, expect } from 'vitest';
import { screenForCriticalSafetyFlags } from '../src/lib/ai/safety-screener';

describe('Deterministic Safety Screener', () => {
  it('should flag self-harm signals immediately as Critical', () => {
    const text = 'I am feeling overwhelmed and have had thoughts to harm myself and end it all.';
    const result = screenForCriticalSafetyFlags(text);
    expect(result.hasRedFlag).toBe(true);
    expect(result.recommendedSeverity).toBe('Critical');
    expect(result.matchedCategories).toContain('Self-Harm & Suicide Risk');
  });

  it('should flag physical violence threats as Critical', () => {
    const text = 'The supervisor threatened to bring a gun to the office tomorrow.';
    const result = screenForCriticalSafetyFlags(text);
    expect(result.hasRedFlag).toBe(true);
    expect(result.recommendedSeverity).toBe('Critical');
    expect(result.matchedCategories).toContain('Physical Violence & Weapons');
  });

  it('should flag severe sexual misconduct as Critical', () => {
    const text = 'An incident of unwanted touching occurred after hours during the team retreat.';
    const result = screenForCriticalSafetyFlags(text);
    expect(result.hasRedFlag).toBe(true);
    expect(result.recommendedSeverity).toBe('Critical');
    expect(result.matchedCategories).toContain('Severe Sexual Harassment / Assault');
  });

  it('should flag retaliation threats as High risk', () => {
    const text = 'My manager threatened to fire if I report this shift discrepancy to HR.';
    const result = screenForCriticalSafetyFlags(text);
    expect(result.hasRedFlag).toBe(true);
    expect(result.recommendedSeverity).toBe('High');
    expect(result.matchedCategories).toContain('Illegal Retaliation & Whistleblower Suppression');
  });

  it('should return normal for standard workplace grievances', () => {
    const text = 'The air conditioning in the 3rd floor meeting room has not been working properly.';
    const result = screenForCriticalSafetyFlags(text);
    expect(result.hasRedFlag).toBe(false);
    expect(result.recommendedSeverity).toBe('Normal');
  });
});
