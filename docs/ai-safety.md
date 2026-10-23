# AI Ethics, Safety & Human-in-the-Loop Governance

## Current shared demo behavior

- The HR Knowledge Assistant accepts only a fixed topic identifier. It has no free-text question box and does not read employee or grievance records.
- If Gemini is configured, the server sends a fixed question and curated public-source notes only. Otherwise it returns the local curated summary.
- Grievance narrative analysis uses a deterministic local fallback. Shared-demo case writes and free-text AI Q&A are disabled.
- Outputs include a general-information disclaimer and official-source links. The knowledge pack is not a continuously updated legal database.

## Product principles

1. **AI is decision support, never an arbiter.** It must not determine guilt, legal liability, credibility, or employment outcomes.
2. **Keep case material out of AI until safeguards exist.** No grievance or POSH narrative may go to a provider before data minimization, reviewed redaction, provider review, tenant controls, and audit controls are implemented.
3. **Enforce tenant boundaries before company use.** Every future prompt must be built from authenticated, authorized data for one tenant. Do not treat the current demo as implementing this production guarantee.
4. **Preserve human judgment.** Any later company-data output must be clearly labeled advisory and reviewed by an authorized person.

See [`public-hr-knowledge.md`](public-hr-knowledge.md) for source coverage and limitations.
