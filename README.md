# PeoplePulse AI

> **"Understand your people before problems become attrition."**  
> An AI-powered B2B SaaS Employee Intelligence + Grievance Management Platform.

---

## 🌟 What is PeoplePulse AI?

PeoplePulse AI is a modern Employee Voice and People Intelligence platform. Unlike traditional HRMS platforms that manage payroll or attendance, PeoplePulse AI is purpose-built for:
1. **LISTEN:** Daily 15-second mood check-ins, team feedback, and 3-minute guided grievance submissions.
2. **UNDERSTAND:** Multi-tenant isolated AI categorization, sentiment tracking, and recurring issue root-cause clustering.
3. **ACT:** AI-suggested HR response drafts, SLA timers, case assignments, and human-approved action recommendations.
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
   - Submit your daily mood rating with 5 intuitive emoji tiers.
   - Click **"Submit a Grievance"** (`/employee/speak-up`) to test the guided form with the **Anonymous Toggle**.
   - Copy your one-time **Private Case Passcode**.
2. **Anonymous Case Tracker (`/track-case`):**
   - Click the **"Load Demo Case (PP-GR-2026-1001)"** button to inspect an active case without signing in.
   - Read HR replies and send an anonymous update directly.
3. **HR Intelligence Console (`/hr/dashboard`):**
   - View the AI Morning Briefing: *"Good morning. Here's what needs your attention."*
   - Click the **"View Breakdown"** button on the People Health Score card to inspect the transparent formula:  
     $$\text{Score} = 0.35(M) + 0.25(S) + 0.20(R) + 0.20(V)$$
   - Explore the **Grievance Inbox** (`/hr/grievances`) and open a case to inspect the **AI Grievance Analysis Panel** and **Confidential HR Internal Notes**.
   - Open **AI Intelligence & Q&A** (`/hr/insights`) to ask natural language questions like *"Why has Operations mood declined?"*.
   - Open **Organization & Roster** (`/admin/onboarding`) to download the sample employee CSV template and test bulk roster imports.

---

## ☁️ Connecting Supabase (When Ready for Cloud Production)

When you are ready to deploy with live cloud PostgreSQL and Supabase Auth, follow these exact click-by-click instructions:

### Step 1: Create a Free Supabase Project
1. Go to **[supabase.com](https://supabase.com)** and sign in.
2. Click **"New project"**, select an organization, and choose a project name (e.g. `peoplepulse-prod`).
3. Set a strong database password and click **"Create new project"**.

### Step 2: Copy API Keys
1. In your Supabase Dashboard, click the **Settings icon (⚙️)** in the left sidebar.
2. Navigate to **"API"**.
3. Copy the **Project URL** and paste it into your `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the **anon / public key** and paste it into your `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Copy the **service_role key** (secret) and paste it into your `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.

### Step 3: Run Database Migrations
1. In the Supabase Dashboard, click the **SQL Editor** tab in the left sidebar.
2. Open `supabase/migrations/01_initial_schema.sql` from this codebase, copy all contents, paste into the SQL Editor, and click **Run**.
3. Open `supabase/migrations/02_rls_and_security.sql`, paste, and click **Run**.
4. Open `supabase/migrations/03_triggers_and_automation.sql`, paste, and click **Run**.
5. Open `supabase/seed.sql`, paste, and click **Run** to populate the Northstar Technologies demo dataset!

---

## 🤖 Google Gemini AI API Configuration

All AI interactions run strictly **server-side** with zero exposure to client browsers.

1. Go to **[Google AI Studio](https://aistudio.google.com/)**.
2. Click **"Get API key"** $\rightarrow$ **"Create API key in new project"**.
3. Copy your key and add it to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_PROVIDER=gemini
   ```
*(If no API key is provided, PeoplePulse AI automatically runs in mock mode with realistic outputs so all UI and tests work seamlessly!)*

---

## 🧪 Running Automated Tests

Run the full Vitest automated test suite:

```bash
npm test
```

This verifies:
- Multi-tenant data isolation
- Zero-knowledge anonymous grievance confidentiality
- Internal HR notes seclusion
- Deterministic critical safety and harassment screening
- People Health Score mathematical calculations

---

## 📚 Complete Documentation

Detailed technical design documents are available in the `docs/` folder:
- [`docs/architecture.md`](docs/architecture.md) — System design, multi-tenant boundaries & AI pipeline
- [`docs/database.md`](docs/database.md) — PostgreSQL schema, foreign keys, indexes & RLS policies
- [`docs/security.md`](docs/security.md) — Threat model, zero-knowledge anonymity & audit logging
- [`docs/anonymous-grievances.md`](docs/anonymous-grievances.md) — Tokenized two-way anonymous mailbox architecture
- [`docs/ai-safety.md`](docs/ai-safety.md) — Hard rules against automated employment decisions & deterministic screener
- [`docs/product.md`](docs/product.md) — Product requirements, persona workflows & People Health Score formula
