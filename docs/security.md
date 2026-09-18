# PeoplePulse AI — Security Architecture & Threat Model

## 1. Zero-Knowledge Anonymity Principle
When an employee chooses anonymous submission:
- The `submitter_id` column is set to SQL `NULL`.
- IP address, User-Agent strings, and session identifiers are stripped before database insertion.
- The server generates a random 256-bit access token and returns it once to the employee.
- The token hash is stored in the database.
- The employee uses the token to authenticate to that specific case mailbox without a user account.

## 2. Minimum Cohort Privacy Gate (K-Anonymity)
In small teams, aggregated feedback could allow managers to de-anonymize individuals.
- **Rule:** A minimum threshold of $N \ge 5$ responses is enforced for departmental mood and sentiment filtering.
- **UI Fallback:** If a department has fewer than 5 responses, the score is replaced with:
  *"Insufficient responses to preserve employee privacy."*

## 3. Confidential Internal Notes Seclusion
- HR case managers often take private notes or record sensitive evidence during investigations.
- `is_internal_note = true` is filtered at the database level and server API level.
- Even if an attacker attempts to intercept the anonymous API payload, internal notes are strictly omitted from the serialization response.

## 4. Server-Side AI Execution
- API keys for Google Gemini are never delivered to the client browser.
- All AI prompt construction, sanitization, and parsing occurs inside isolated server endpoints.
