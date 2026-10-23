# PeoplePulse AI

> **"Understand your people before problems become attrition."**  
> An AI-powered B2B SaaS Employee Intelligence + Grievance Management Platform.

> [!WARNING]
> **Read-only demo. Do not enter real employee, company, grievance, POSH, medical, or investigation data.** Shared demo submissions and free-text AI questions are disabled. The current app does not yet provide production company accounts, durable tenant-isolated case storage, retention/deletion controls, or a reviewed redaction pipeline. Demo storage is local and may be lost.

---

## 🌟 What is PeoplePulse AI?

PeoplePulse AI is a modern Employee Voice and People Intelligence platform. Unlike traditional HRMS platforms that manage payroll or attendance, PeoplePulse AI is purpose-built for:
1. **LISTEN:** Explore synthetic examples of daily mood check-ins, team feedback, and guided grievance workflows. Public demo writes are disabled.
2. **UNDERSTAND:** Explore synthetic example dashboards and fixed-topic HR knowledge from official public sources.
3. **ACT:** Preview intended HR workflows, such as case triage and response drafts. Write actions are disabled in the shared demo.
4. **IMPROVE:** A transparent, deterministic **People Health Score (0–100)** and privacy-guarded department analytics.

---

## 🚀 Quick Start Guide (For Non-Technical Founders)

You can run PeoplePulse AI locally in **less than 2 minutes** without setting up any cloud accounts or databases!

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- Terminal (Command Prompt / PowerShell on Windows, or Terminal on macOS/Linux)

### 2. Run Locally in Development Mode
Open your terminal in the project directory and run:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start the local server
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧭 Navigating the Demo Experience

PeoplePulse AI comes pre-loaded with a realistic demo organization: **Northstar Technologies** (120 employees across Engineering, Operations, Customer Support, Sales, People & HR, and Finance).

### Three Core Entry Points:
1. **Employee Voice Space (`/employee`):**
   - Preview the synthetic daily mood workflow and five emoji tiers.
   - View the guided grievance form and anonymous-mode example. Public submissions and passcode creation are disabled.
2. **Anonymous Case Tracker (`/track-case`):**
   - Use the synthetic demo case to inspect the sample case workflow.
   - Replies and updates are disabled in the shared demo.
3. **HR Intelligence Console (`/hr/dashboard`):**
   - View the AI Morning Briefing: *"Good morning. Here's what needs your attention."*
   - Click the **"View Breakdown"** button on the People Health Score card to inspect the transparent formula:  
     $$\text{Score} = 0.35(M) + 0.25(S) + 0.20(R) + 0.20(V)$$
   - Explore synthetic cases in the **Grievance Inbox** (`/hr/grievances`) and open a case to inspect the demo analysis panel and internal-note display. Case updates and replies are disabled.
   - Open **HR Knowledge Assistant** (`/hr/insights`) to explore selected India HR topics grounded in official public sources. It does not answer questions about employee or case records.
   - Open **Organization & Roster** (`/admin/onboarding`) to view the synthetic roster and download a sample CSV template. Roster changes and imports are disabled in the public demo.

---

## Company data deployment status

**Company accounts are not ready for real data.** Do not connect a production Supabase project or run the SQL files against a database containing data. The initial migration is only a starting schema, and the app does not yet enforce tenant isolation through every data path or provide retention/deletion workflows. Shared demo APIs are read-only and intended for synthetic data only. See [`docs/security.md`](docs/security.md) for the current status and launch gates.

---

## 🤖 Google Gemini AI API Configuration

AI provider credentials stay server-side. Grievance narrative analysis and free-text AI queries are disabled pending a reviewed redaction and provider-handling layer. If Gemini is configured, the HR Knowledge Assistant sends only one selected fixed topic and its curated public-source notes; no employee or case records are included. Without an API key, it returns the curated source summary.

1. Go to **[Google AI Studio](https://aistudio.google.com/)**.
2. Click **"Get API key"** $\rightarrow$ **"Create API key in new project"**.
3. Copy your key and add it to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_PROVIDER=gemini
   ```
*(Without an API key, the HR Knowledge Assistant returns a curated source summary.)*

---

## 🧪 Running Automated Tests

Run the full Vitest automated test suite:

```bash
npm test
```

The test suite contains checks for demo workflows and selected service behavior. Passing those checks would not certify production security, multi-tenant isolation, legal compliance, or anonymous-case confidentiality.

---

## 📚 Complete Documentation

Detailed technical design documents are available in the `docs/` folder:
- [`docs/architecture.md`](docs/architecture.md) — System design, multi-tenant boundaries & AI pipeline
- [`docs/database.md`](docs/database.md) — PostgreSQL schema, foreign keys, indexes & RLS policies
- [`docs/security.md`](docs/security.md) — Current demo-only security status and production launch gates
- [`docs/public-hr-knowledge.md`](docs/public-hr-knowledge.md) — Fixed-topic India HR public knowledge scope and sources
- [`docs/anonymous-grievances.md`](docs/anonymous-grievances.md) — Anonymous case feature limits and intended design
- [`docs/ai-safety.md`](docs/ai-safety.md) — Hard rules against automated employment decisions & deterministic screener
- [`docs/product.md`](docs/product.md) — Product requirements, persona workflows & People Health Score formula
