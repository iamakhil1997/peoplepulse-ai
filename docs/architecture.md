# PeoplePulse AI — Technical Architecture & System Design

## 1. Overview
PeoplePulse AI is a multi-tenant B2B SaaS Employee Intelligence and Grievance Management platform designed to bridge employee voice with proactive HR decision support.

```
DATA (Listen) → DETECT (Understand) → DIAGNOSE (Analyze) → RECOMMEND (Suggest) → ACT (Resolve) → IMPROVE (Trend)
```

## 2. Current deployment boundary
The shared deployment is a synthetic-data demo, not a production multi-tenant system. It uses a local JSON store for sample records; public writes and free-text AI Q&A are disabled. Company accounts, durable tenant-isolated storage, production RLS enforcement, retention/deletion, and independently verified tenant controls are not implemented. Do not put real employee or company records into this deployment.

The target architecture requires authenticated tenant identity to be derived server-side, authorization checked on each request, and database policies verified with cross-tenant negative tests. Schema columns or an RLS file by themselves do not satisfy that requirement. See [`security.md`](security.md) for launch gates.

## 3. Current AI paths
- Gemini credentials, when configured, are used server-side.
- The fixed-topic HR Knowledge Assistant can send only its selected public topic and curated official-source notes. It cannot access employee or grievance records.
- The shared demo’s grievance narrative analysis uses a local deterministic fallback. Free-text questions and case submissions are disabled.
- Other AI use involving company or case data remains a future capability requiring reviewed redaction, provider handling, tenant authorization, retention controls, and audit.

## 4. Key Subsystems
1. **Employee Voice Demo:** Synthetic sample workflows for mood, grievance, feedback, and roster views. The shared deployment is read-only; write APIs are disabled.
2. **Anonymous Grievance Mailbox (synthetic demo prototype only):**
   - Newly created anonymous demo cases omit the submitter ID and store a digest of the generated passcode.
   - The demo tracker omits internal notes from its response. This is not a production anonymity, logging, or authorization guarantee.
   - Case submission and replies are disabled in the shared deployment.
3. **HR Intelligence Workspace:**
   - Executive AI Morning Briefing.
   - Transparent People Health Score calculation.
   - Synthetic Grievance Inbox with SLA timers.
   - Deterministic demo analysis panel; grievance narratives are not sent to Gemini.
   - Fixed-topic public HR knowledge answers with official source links. Employee-data Q&A remains disabled in the shared demo.
4. **Organization & Roster Demo:** Synthetic roster display and CSV template download; changes and imports are disabled in the shared deployment.
