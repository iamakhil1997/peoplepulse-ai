// PeoplePulse AI — Secure Demo Mode Authentication & Session Core
// Provides isolated, synthetic personas and HMAC-signed session cookies.
// STRICT ISOLATION: Never accesses Supabase production tables or real user data.

export type DemoRole = 'HR_Admin' | 'Employee' | 'Reviewer';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: DemoRole;
  roleName: string; // Compatible with standard session roleName checks ('HR_Admin', 'Employee', 'Reviewer')
  organizationId: string;
  organizationName: string;
  departmentId: string;
  departmentName: string;
}

export interface DemoSessionPayload {
  sub: string;
  email: string;
  role: DemoRole;
  roleName: string;
  organizationId: string;
  isDemo: true;
  iat: number;
  exp: number; // Unix timestamp in seconds
}

export const DEMO_COOKIE_NAME = 'peoplepulse_demo_session';
export const DEMO_SESSION_DURATION_SEC = 4 * 60 * 60; // 4 hours

// Synthetic personas — zero connection to real production users or auth.users
export const DEMO_PERSONAS: Record<DemoRole, DemoUser> = {
  HR_Admin: {
    id: 'demo-usr-hr-admin-01',
    email: 'demo.hr@northstar.internal',
    name: 'Sarah Connor (Demo HR Admin)',
    role: 'HR_Admin',
    roleName: 'HR_Admin',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'Northstar Technologies (Demo Mode)',
    departmentId: '00000000-0000-0000-0001-000000000001',
    departmentName: 'People Operations',
  },
  Employee: {
    id: 'demo-usr-employee-01',
    email: 'demo.employee@northstar.internal',
    name: 'Alex Rivera (Demo Employee)',
    role: 'Employee',
    roleName: 'Employee',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'Northstar Technologies (Demo Mode)',
    departmentId: '00000000-0000-0000-0001-000000000002',
    departmentName: 'Engineering',
  },
  Reviewer: {
    id: 'demo-usr-reviewer-01',
    email: 'demo.reviewer@northstar.internal',
    name: 'Jordan Hayes (Demo Grievance Reviewer)',
    role: 'Reviewer',
    roleName: 'Reviewer',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'Northstar Technologies (Demo Mode)',
    departmentId: '00000000-0000-0000-0001-000000000003',
    departmentName: 'Ethics & Compliance',
  },
};

// Check if Demo Mode is explicitly enabled on the server
export function isDemoModeEnabled(): boolean {
  return process.env.ENABLE_DEMO_MODE === 'true';
}

// Get the server-side signing secret
export function getDemoSecret(): string | null {
  const secret = process.env.DEMO_MODE_SECRET;
  if (!secret || secret.trim().length < 16) {
    return null;
  }
  return secret.trim();
}

// Simple base64url helpers compatible with Node and Edge runtimes
function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Web Crypto HMAC-SHA256 signature (Edge & Node runtime compatible)
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createDemoSessionToken(role: DemoRole): Promise<string> {
  const secret = getDemoSecret();
  if (!secret) {
    throw new Error('DEMO_MODE_SECRET is not configured or too short.');
  }

  const persona = DEMO_PERSONAS[role];
  if (!persona) {
    throw new Error(`Invalid demo role: ${role}`);
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: DemoSessionPayload = {
    sub: persona.id,
    email: persona.email,
    role: persona.role,
    roleName: persona.roleName,
    organizationId: persona.organizationId,
    isDemo: true,
    iat: now,
    exp: now + DEMO_SESSION_DURATION_SEC,
  };

  const enc = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));

  return `${dataToSign}.${encodedSignature}`;
}

export async function verifyDemoSessionToken(token: string | undefined | null): Promise<DemoSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const secret = getDemoSecret();
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getCryptoKey(secret);
    const enc = new TextEncoder();
    const signatureBytes = base64UrlDecode(encodedSignature);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      enc.encode(dataToSign)
    );

    if (!isValid) return null;

    const decodedPayloadStr = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(decodedPayloadStr) as DemoSessionPayload;

    // Verify expiry
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    if (!payload.isDemo || !DEMO_PERSONAS[payload.role]) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
