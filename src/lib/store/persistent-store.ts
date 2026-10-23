// PEOPLEPULSE AI — Persistent Storage Layer
// Synthetic demo storage only. This file store is NOT suitable for company data,
// is not durable on serverless hosts, and must never be used for production tenants.

import fs from 'fs';
import path from 'path';
import {
  EmployeePulse,
  Grievance,
  GrievanceMessage,
  GrievanceStatusHistory,
  Department,
  Organization,
} from '../types/database';
import { DEMO_PERSONAS } from '../auth/demo-session';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

const STORAGE_DIR = process.env.VERCEL ? '/tmp/peoplepulse_data' : path.join(process.cwd(), '.data');
const PROD_STORE_FILE = path.join(STORAGE_DIR, 'pulse_prod_store.json');
const DEMO_STORE_FILE = path.join(STORAGE_DIR, 'pulse_demo_store.json');

export interface StorageSchema {
  organizations: Organization[];
  departments: Department[];
  pulses: EmployeePulse[];
  grievances: Grievance[];
  grievanceMessages: GrievanceMessage[];
  grievanceStatusHistory: GrievanceStatusHistory[];
}

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignore if exists or read-only
    }
  }
}

function createDefaultState(isDemo: boolean): StorageSchema {
  const now = Date.now();

  const org: Organization = {
    id: DEMO_ORG_ID,
    name: isDemo ? 'Northstar Technologies (Demo Mode)' : 'Northstar Technologies',
    slug: isDemo ? 'northstar-demo' : 'northstar-tech',
    industry: 'Enterprise Cloud Software',
    employee_count_tier: '50-250',
    country: 'United States',
    timezone: 'America/New_York',
    k_anonymity_threshold: 5,
    sla_settings: {
      critical_hours: 12,
      high_hours: 24,
      medium_hours: 48,
      low_hours: 96,
    },
    is_active: true,
    created_at: new Date(now - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const departments: Department[] = [
    { id: '00000000-0000-0000-0001-000000000001', organization_id: DEMO_ORG_ID, name: 'People & HR', code: 'HR', parent_department_id: null, created_at: new Date(now - 30 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000002', organization_id: DEMO_ORG_ID, name: 'Engineering', code: 'ENG', parent_department_id: null, created_at: new Date(now - 30 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000003', organization_id: DEMO_ORG_ID, name: 'Ethics & Compliance', code: 'ETH', parent_department_id: null, created_at: new Date(now - 30 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0001-000000000004', organization_id: DEMO_ORG_ID, name: 'Operations', code: 'OPS', parent_department_id: null, created_at: new Date(now - 30 * 86400000).toISOString(), updated_at: new Date().toISOString() },
  ];

  const pulses: EmployeePulse[] = [
    {
      id: 'pulse-seed-1',
      organization_id: DEMO_ORG_ID,
      submitter_id: 'demo-usr-employee-01',
      department_id: '00000000-0000-0000-0001-000000000002',
      mood_score: 4,
      mood_label: 'Good',
      category: 'Productivity',
      comment: 'Sprint goals are on track and collaboration is great.',
      is_anonymous: false,
      allow_hr_followup: true,
      created_at: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: 'pulse-seed-2',
      organization_id: DEMO_ORG_ID,
      submitter_id: null,
      department_id: '00000000-0000-0000-0001-000000000002',
      mood_score: 3,
      mood_label: 'Okay',
      category: 'Workload',
      comment: undefined,
      is_anonymous: true,
      allow_hr_followup: false,
      created_at: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      id: 'pulse-seed-3',
      organization_id: DEMO_ORG_ID,
      submitter_id: null,
      department_id: '00000000-0000-0000-0001-000000000004',
      mood_score: 5,
      mood_label: 'Great',
      category: 'Culture',
      comment: 'Appreciated the team recognition today.',
      is_anonymous: true,
      allow_hr_followup: true,
      created_at: new Date(now - 4 * 3600000).toISOString(),
    },
  ];

  const g1: Grievance = {
    id: 'demo-gr-001',
    organization_id: DEMO_ORG_ID,
    case_number: 'PP-DEMO-2026-001',
    is_anonymous: false,
    submitter_id: DEMO_PERSONAS.Employee.id,
    access_token_hash: null,
    title: '[DEMO] Unclear Shift Handover in Cloud Infrastructure',
    description: 'During on-call rotations, the handover checklist lacks verified deploy alerts, causing delay in triage.',
    category_selected: 'Workload',
    category_ai_suggested: 'Process & Workload Management',
    department_id: DEMO_PERSONAS.Employee.departmentId,
    incident_date: new Date(now - 3 * 86400000).toISOString().split('T')[0],
    severity_employee: 'Medium',
    severity_assessed: 'Medium',
    risk_level: 'MEDIUM',
    has_safety_red_flag: false,
    status: 'Under Review',
    priority: 'Medium',
    allow_hr_followup: true,
    preferred_response_method: 'Platform Case Inbox',
    assigned_to_user_id: DEMO_PERSONAS.Reviewer.id,
    sla_due_at: new Date(now + 24 * 3600000).toISOString(),
    resolved_at: null,
    closed_at: null,
    created_at: new Date(now - 3 * 86400000).toISOString(),
    updated_at: new Date(now - 1 * 86400000).toISOString(),
  };

  const g2: Grievance = {
    id: 'demo-gr-002',
    organization_id: DEMO_ORG_ID,
    case_number: 'PP-DEMO-2026-002',
    is_anonymous: true,
    submitter_id: null,
    access_token_hash: 'demo-passcode-1002',
    title: '[DEMO] Anonymous: Safety Equipment Maintenance Request',
    description: 'Server room air filtration unit has had a warning light on for 5 days. Needs prompt inspection.',
    category_selected: 'Facilities',
    category_ai_suggested: 'Workplace Safety & Equipment',
    department_id: '00000000-0000-0000-0001-000000000004',
    incident_date: new Date(now - 2 * 86400000).toISOString().split('T')[0],
    severity_employee: 'Low',
    severity_assessed: 'Low',
    risk_level: 'LOW',
    has_safety_red_flag: false,
    status: 'Investigation',
    priority: 'Low',
    allow_hr_followup: true,
    preferred_response_method: 'Platform Case Inbox',
    assigned_to_user_id: DEMO_PERSONAS.HR_Admin.id,
    sla_due_at: new Date(now + 48 * 3600000).toISOString(),
    resolved_at: null,
    closed_at: null,
    created_at: new Date(now - 2 * 86400000).toISOString(),
    updated_at: new Date(now - 12 * 3600000).toISOString(),
  };

  const g3: Grievance = {
    id: 'demo-gr-003',
    organization_id: DEMO_ORG_ID,
    case_number: 'PP-DEMO-2026-003',
    is_anonymous: false,
    submitter_id: 'demo-usr-other-01',
    access_token_hash: null,
    title: '[DEMO] Flexible Working Hours Coordination',
    description: 'Requesting standardized core collaboration hours across the product team for remote colleagues.',
    category_selected: 'Policy',
    category_ai_suggested: 'Remote Work & Policy',
    department_id: DEMO_PERSONAS.Employee.departmentId,
    incident_date: new Date(now - 5 * 86400000).toISOString().split('T')[0],
    severity_employee: 'Low',
    severity_assessed: 'Low',
    risk_level: 'LOW',
    has_safety_red_flag: false,
    status: 'Resolved',
    priority: 'Low',
    allow_hr_followup: true,
    preferred_response_method: 'Platform Case Inbox',
    assigned_to_user_id: DEMO_PERSONAS.Reviewer.id,
    sla_due_at: new Date(now - 24 * 3600000).toISOString(),
    resolved_at: new Date(now - 12 * 3600000).toISOString(),
    closed_at: null,
    created_at: new Date(now - 5 * 86400000).toISOString(),
    updated_at: new Date(now - 12 * 3600000).toISOString(),
  };

  const m1: GrievanceMessage = {
    id: 'demo-msg-001',
    organization_id: DEMO_ORG_ID,
    grievance_id: g1.id,
    sender_role: 'EMPLOYEE',
    sender_user_id: DEMO_PERSONAS.Employee.id,
    message_text: 'Attached the handover checklist template for reference.',
    is_internal_note: false,
    attachments: [],
    created_at: new Date(now - 2 * 86400000).toISOString(),
  };

  const m2: GrievanceMessage = {
    id: 'demo-msg-002',
    organization_id: DEMO_ORG_ID,
    grievance_id: g1.id,
    sender_role: 'HR',
    sender_user_id: DEMO_PERSONAS.Reviewer.id,
    message_text: 'Thank you for raising this. We are scheduling a 15-minute review with the lead.',
    is_internal_note: false,
    attachments: [],
    created_at: new Date(now - 1 * 86400000).toISOString(),
  };

  const h1: GrievanceStatusHistory = {
    id: 'demo-hist-001',
    organization_id: DEMO_ORG_ID,
    grievance_id: g1.id,
    changed_by_user_id: DEMO_PERSONAS.Reviewer.id,
    old_status: 'Submitted',
    new_status: 'Under Review',
    reason: 'Initial triage complete, assigned to Ethics & Compliance.',
    created_at: new Date(now - 2 * 86400000).toISOString(),
  };

  return {
    organizations: [org],
    departments,
    pulses,
    grievances: [g1, g2, g3],
    grievanceMessages: [m1, m2],
    grievanceStatusHistory: [h1],
  };
}

class PersistentStore {
  private inMemoryCache: Record<string, StorageSchema> = {};

  private getStoreFilePath(isDemo: boolean): string {
    return isDemo ? DEMO_STORE_FILE : PROD_STORE_FILE;
  }

  public read(isDemo: boolean): StorageSchema {
    if (!isDemo) {
      throw new Error('File-backed storage is restricted to synthetic demo data.');
    }
    const key = isDemo ? 'demo' : 'prod';
    const filePath = this.getStoreFilePath(isDemo);

    if (this.inMemoryCache[key]) {
      return this.inMemoryCache[key];
    }

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.inMemoryCache[key] = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn(`[PersistentStore] Read from file ${filePath} failed:`, e);
    }

    const initial = createDefaultState(isDemo);
    this.inMemoryCache[key] = initial;
    this.write(isDemo, initial);
    return initial;
  }

  public write(isDemo: boolean, data: StorageSchema): void {
    if (!isDemo) {
      throw new Error('File-backed storage is restricted to synthetic demo data.');
    }
    const key = isDemo ? 'demo' : 'prod';
    this.inMemoryCache[key] = data;
    const filePath = this.getStoreFilePath(isDemo);

    try {
      ensureDirectoryExists(filePath);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn(`[PersistentStore] Write to file ${filePath} failed:`, e);
    }
  }

  public reset(isDemo = true): void {
    if (!isDemo) {
      throw new Error('File-backed storage is restricted to synthetic demo data.');
    }
    const initial = createDefaultState(isDemo);
    this.write(isDemo, initial);
  }
}

export const persistentStore = new PersistentStore();
