# PeoplePulse AI — Current Security Status

## Current status: synthetic demo only

Do not enter real employee or grievance data. The application does not currently provide a production-ready private company account system, durable tenant-isolated case storage, configurable retention/deletion, or an independently verified security boundary. Read APIs require a signed synthetic demo session. Submission, case update, reply, roster import, mood check-in, feedback, and free-text AI query endpoints are disabled in the shared deployment. A separate fixed-topic HR Knowledge Assistant can send only its selected topic and curated public-source notes to Gemini; it has no access to employee or case data. The demo store is a local JSON file and is not suitable for company records.

These controls are intentional safeguards, not a claim that the product is ready for sensitive data. Documentation below describes limited implementation behavior and future requirements; it is not a security certification.

## 1. Anonymous demo passcodes
When the synthetic demo submits an anonymous case, the service omits `submitter_id`, generates a cryptographically random passcode, and stores a SHA-256 digest for newly created passcodes. This does **not** establish zero-knowledge anonymity: deployment, network, browser, and operational logs have not been independently reviewed, and seeded demo cases may use fixed example passcodes. Do not use this feature for real cases.

## 2. Minimum Cohort Privacy Gate (K-Anonymity)
In small teams, aggregated feedback could allow managers to de-anonymize individuals.
The current demo UI includes threshold-oriented presentation, but no independent privacy review has established that every aggregation path enforces a minimum group size or prevents inference. Do not rely on dashboard aggregates to anonymize real employee data.

## 3. Confidential Internal Notes Seclusion
- HR case managers often take private notes or record sensitive evidence during investigations.
The anonymous tracking service filters internal notes from its response, and the demo messaging route checks access to the case before writing. This is limited demo behavior and is not a guarantee for all database, API, export, or future integration paths.

## 4. Server-Side AI Execution
- API keys for Google Gemini are never delivered to the client browser.
- Provider credentials are used on the server. Grievance narrative analysis uses a local deterministic fallback and is not sent to Gemini. Free-text demo Q&A is disabled because a reviewed redaction layer is not available. The fixed-topic public knowledge route does not accept arbitrary user text or load employee/case data; only curated public-source notes and a fixed question are provided to Gemini. The topic list is not a continuously updated legal database.

## Required before company data

Implement and independently verify tenant-derived authorization on every route; durable database and private object storage; role/assignment controls; encryption and key management; retention, legal hold, deletion, export, and backup expiry; request throttling and audit logging; complete AI data minimization/redaction and provider review; and cross-tenant negative access checks. Keep sensitive POSH and investigation workflows separately reviewed. Do not treat the current SQL schema or RLS file alone as sufficient authorization.
