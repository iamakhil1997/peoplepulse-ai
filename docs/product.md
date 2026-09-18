# PeoplePulse AI — Product Requirements & Persona Workflows

## 1. Product Persona Workflows

### Employee Persona
1. **Daily Check-In:** Select 1 of 5 moods (`Great`, `Good`, `Okay`, `Low`, `Very Low`) with optional context notes.
2. **Grievance Submission:** Complete a guided 3-minute form with category selector, severity level, and anonymous toggle.
3. **Case Tracking:** Access `/track-case` using their one-time passcode to exchange messages with HR without revealing identity.
4. **Voice & Ideas:** Submit praise, suggestions, or constructive concerns to leadership.

### HR Case Manager Persona
1. **Daily Morning Briefing:** Review AI-prioritized cards (Critical Alerts, Emerging Signals, Recurring Issues).
2. **Grievance Triage:** Filter cases by SLA timer, risk level, department, or anonymity.
3. **Investigation Workspace:** Review AI executive summary, key topics, policy cross-reference, and draft acknowledgment response.
4. **Confidential Collaboration:** Record internal investigation notes secluded from the employee.
5. **Action Plans:** Approve and advance recommended workplace interventions.

### HR Admin & Org Leadership Persona
1. **Executive Health Scorecard:** Monitor the transparent People Health Score ($0–100$) and department trends.
2. **People Intelligence Q&A:** Ask natural language queries like *"Why has Operations mood declined?"* to receive data-backed synthesis.
3. **Onboarding & Roster:** Manage departments and bulk-import employee rosters via CSV.

---

## 2. People Health Score: Transparent Formula

$$\text{People Health Score} = 0.35(M) + 0.25(S) + 0.20(R) + 0.20(V)$$

- **$M$ (Mood Index):** Weighted average of last 30-day pulse check-ins.
- **$S$ (SLA & Resolution Velocity):** Percentage of cases resolved within target SLA windows.
- **$R$ (Risk & Safety Stability):** Penalty deductions based on active critical and high-risk cases.
- **$V$ (Recurring Issue Containment):** Containment ratio of resolving vs. newly emerging topic clusters.
