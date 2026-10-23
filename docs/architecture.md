# PeoplePulse AI — Technical Architecture & System Design

## 1. Overview
PeoplePulse AI is a multi-tenant B2B SaaS Employee Intelligence and Grievance Management platform designed to bridge employee voice with proactive HR decision support.

```
DATA (Listen) → DETECT (Understand) → DIAGNOSE (Analyze) → RECOMMEND (Suggest) → ACT (Resolve) → IMPROVE (Trend)
```

## 2. Multi-Tenant Architecture
Every operational data row contains `organization_id`.
- **Database Layer:** PostgreSQL Row Level Security (RLS) dynamically filters rows based on the session's authenticated organization ID.
- **Application Layer:** Server-side services and API routes validate that user tokens belong exclusively to the queried organization.
- **AI Context Layer:** Prompts to AI models are constructed strictly in memory on the server using only records from the active tenant.

## 3. Server-Side AI Pipeline
- All LLM interactions are isolated server-side via the `AIAssistantProvider` abstraction layer.
- **Google Gemini:** Primary LLM for summarization, categorization, sentiment extraction, and drafting human-reviewed responses.
- **Deterministic Pre-LLM Screener:** Regex-based critical safety screening for self-harm, weapons/violence, sexual harassment, and illegal retaliation.
- **Zero-Storage Client Security:** API keys are never bundled in client code.

## 4. Key Subsystems
1. **Employee Voice Engine:**
   - Rapid Daily/Weekly Mood Check-In (5 mood tiers).
   - Guided Grievance Submission with Category suggestions and anonymous toggle.
   - Team Praise, Suggestions, and Concerns.
2. **Planned Anonymous Grievance Mailbox (demo prototype only):**
   - Identity withheld (submitter ID = NULL, zero IP tracking).
   - 256-bit hashed access token for return visits.
   - Public message thread accessible via token, while internal HR notes remain strictly secluded.
3. **HR Intelligence Workspace:**
   - Executive AI Morning Briefing.
   - Transparent People Health Score calculation.
   - Filterable Grievance Inbox with SLA timers.
   - AI Decision Support Panel with draft responses and recommended next actions.
   - Natural Language People Intelligence Q&A.
4. **Organization Onboarding & Roster:**
   - Multi-department management.
   - Bulk CSV employee import with live parsing and validation.
