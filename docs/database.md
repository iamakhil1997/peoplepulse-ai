# PeoplePulse AI — Database Schema & RLS Reference

## 1. Relational Entities Summary

| Table | Purpose | Primary Tenancy Key |
| :--- | :--- | :--- |
| `organizations` | Tenant accounts and global settings | `id` |
| `departments` | Organizational departments & branches | `organization_id` |
| `roles` | RBAC role definitions | `organization_id` |
| `users` | Authenticated system accounts | `organization_id` |
| `employee_profiles` | First name, last name, job title, department link | `organization_id` |
| `employee_pulses` | Daily/weekly 1-5 mood ratings | `organization_id` |
| `feedback` | Praise, concerns, suggestions | `organization_id` |
| `suggestions` | Upvotable improvement proposals | `organization_id` |
| `grievances` | Core case management records | `organization_id` |
| `grievance_messages` | Two-way dialogue + internal notes | `organization_id` |
| `grievance_assignments` | Case assignment tracking | `organization_id` |
| `grievance_status_history` | Status change audit trail | `organization_id` |
| `ai_analysis` | Structured AI decision-support output | `organization_id` |
| `recurring_issues` | Root-cause topic clusters | `organization_id` |
| `ai_insights` | Proactive morning briefing cards | `organization_id` |
| `action_recommendations` | HR-approved action items | `organization_id` |
| `notifications` | In-app user notifications | `organization_id` |
| `audit_logs` | Immutable audit trail | `organization_id` |

## 2. Row Level Security (RLS) Strategy
- **Isolation Rule:** All queries are filtered by `organization_id = get_auth_user_org_id()`.
- **Anonymity Rule:** Rows where `is_anonymous = true` have `submitter_id` set to `NULL`.
- **Internal Notes Seclusion:** `is_internal_note = true` is excluded from employee RLS policies and returned only to authenticated HR/Admin roles.

## 3. Database Functions & Triggers
1. `generate_case_number()`: Automatically assigns sequenced identifiers in format `PP-GR-YYYY-XXXX`.
2. `calculate_grievance_sla()`: Sets SLA target timestamps based on severity and risk level (12 hrs for Critical, 24 hrs for High, 48 hrs for Medium, 96 hrs for Low).
3. `verify_and_get_anonymous_grievance()`: Cryptographic lookup RPC for anonymous passcodes.
