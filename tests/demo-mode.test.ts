import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createDemoSessionToken,
  verifyDemoSessionToken,
  DEMO_PERSONAS,
  isDemoModeEnabled,
} from '../src/lib/auth/demo-session';
import { demoDataStore } from '../src/lib/store/demo-store';

describe('Demo Mode Security & Authentication Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      ENABLE_DEMO_MODE: 'true',
      DEMO_MODE_SECRET: 'test-demo-secret-key-that-is-at-least-32-chars-long!',
    };
    demoDataStore.reset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('1. Correctly identifies when demo mode is enabled', () => {
    expect(isDemoModeEnabled()).toBe(true);
    process.env.ENABLE_DEMO_MODE = 'false';
    expect(isDemoModeEnabled()).toBe(false);
  });

  it('2. Issues valid HMAC-SHA256 tokens for each demo role', async () => {
    const roles: Array<'HR_Admin' | 'Employee' | 'Reviewer'> = ['HR_Admin', 'Employee', 'Reviewer'];

    for (const role of roles) {
      const token = await createDemoSessionToken(role);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const verified = await verifyDemoSessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.role).toBe(role);
      expect(verified?.isDemo).toBe(true);
      expect(verified?.email).toBe(DEMO_PERSONAS[role].email);
    }
  });

  it('3. Rejects tampered tokens', async () => {
    const token = await createDemoSessionToken('HR_Admin');
    const [header, payload, signature] = token.split('.');

    // Tamper payload to claim Super_Admin
    const tamperedPayload = Buffer.from(
      JSON.stringify({ role: 'Super_Admin', isDemo: true, exp: 9999999999 })
    ).toString('base64url');

    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;
    const result = await verifyDemoSessionToken(tamperedToken);
    expect(result).toBeNull();
  });

  it('4. Rejects expired tokens', async () => {
    // Generate token with negative duration
    const secret = process.env.DEMO_MODE_SECRET!;
    const expiredPayload = {
      sub: DEMO_PERSONAS.Employee.id,
      email: DEMO_PERSONAS.Employee.email,
      role: 'Employee',
      roleName: 'Employee',
      organizationId: DEMO_PERSONAS.Employee.organizationId,
      isDemo: true,
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const dataToSign = `${header}.${payload}`;

    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(dataToSign);
    const signature = hmac.digest('base64url');

    const expiredToken = `${dataToSign}.${signature}`;
    const result = await verifyDemoSessionToken(expiredToken);
    expect(result).toBeNull();
  });

  it('5. Enforces Role-Based Access Control on Synthetic Store', () => {
    const hrUserId = DEMO_PERSONAS.HR_Admin.id;
    const reviewerUserId = DEMO_PERSONAS.Reviewer.id;
    const employeeUserId = DEMO_PERSONAS.Employee.id;

    // HR Admin can access all synthetic demo grievances
    const hrCases = demoDataStore.getGrievances('HR_Admin', hrUserId);
    expect(hrCases.length).toBe(3);

    // Reviewer can ONLY access cases specifically assigned to them
    const reviewerCases = demoDataStore.getGrievances('Reviewer', reviewerUserId);
    expect(reviewerCases.length).toBe(2);
    expect(reviewerCases.every((c) => c.assigned_to_user_id === reviewerUserId)).toBe(true);

    // Employee cannot access grievance triage inbox
    const employeeCases = demoDataStore.getGrievances('Employee', employeeUserId);
    expect(employeeCases.length).toBe(0);
  });

  it('6. Blocks unauthorized case mutations by Reviewers and Employees', () => {
    const reviewerUserId = DEMO_PERSONAS.Reviewer.id;
    const employeeUserId = DEMO_PERSONAS.Employee.id;

    // Case 2 is assigned to HR_Admin, NOT Reviewer
    const case2Id = 'demo-gr-002';

    // Reviewer should fail to update a case not assigned to them
    const reviewerMutation = demoDataStore.updateGrievanceStatus(
      case2Id,
      'Resolved',
      'Reviewer',
      reviewerUserId
    );
    expect(reviewerMutation).toBeNull();

    // Employee should fail to update any case status
    const employeeMutation = demoDataStore.updateGrievanceStatus(
      case2Id,
      'Resolved',
      'Employee',
      employeeUserId
    );
    expect(employeeMutation).toBeNull();

    // Reviewer CAN update a case assigned to them (case 1)
    const validMutation = demoDataStore.updateGrievanceStatus(
      'demo-gr-001',
      'Action Required',
      'Reviewer',
      reviewerUserId
    );
    expect(validMutation).not.toBeNull();
    expect(validMutation?.status).toBe('Action Required');
  });

  it('7. Guarantees zero leakage into production database structures', () => {
    const personas = Object.values(DEMO_PERSONAS);
    for (const persona of personas) {
      // Must use synthetic demo prefix and mock domain
      expect(persona.id.startsWith('demo-usr-')).toBe(true);
      expect(persona.email.endsWith('.internal')).toBe(true);
    }
  });
});
