# Public HR knowledge assistant

## Scope

The shared PeoplePulse demo provides four fixed-topic summaries for India HR: the four Labour Codes, the Industrial Relations Code grievance committee, POSH confidentiality, and privacy safeguards for HR AI use. The answer route accepts only a predefined topic identifier. It does not accept free-text questions, read employee records, or retrieve grievance data.

If `GEMINI_API_KEY` is configured, the server sends the selected fixed question and the corresponding curated public-source notes to the configured Gemini model. It does not send case or employee data. Without a key or if generation fails, the route returns the local curated summary. The public UI provides direct source links with each answer.

The route uses a best-effort in-memory limit per demo session. This is not a durable or distributed rate limiter and does not make the deployment suitable for company records.

## Source review

Source references were checked on 23 October 2026. The topic notes are concise summaries, not a comprehensive or continuously updated legal database. State and sector rules, notifications, commencement dates, amendments, judgments, establishment facts, and worker categories can change applicability. Review the current official texts and obtain qualified advice for a specific matter.

- Ministry of Labour and Employment, announcement on the four Labour Codes taking effect 21 November 2025: https://labour.gov.in/sites/default/files/pib2209767.pdf
- Ministry of Labour and Employment, Labour Codes and rules: https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-2-ATO5YzMtQWa?archives=true
- India Code, Industrial Relations Code, 2020, section 4: https://www.indiacode.nic.in/bitstream/123456789/22040/1/A2020-35.pdf
- India Code, Sexual Harassment of Women at Workplace Act, 2013: https://www.indiacode.nic.in/handle/123456789/17057
- MeitY, Digital Personal Data Protection Rules, 2025 and official documents: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa
- MeitY, Digital Personal Data Protection Act, 2023: https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf

## Safety boundaries

- This is general information, not legal advice or a conclusion about a person or employer.
- Do not put employee names, identifiers, health/payroll data, complaint narratives, POSH material, or investigation evidence into this public demo.
- Do not use model output to decide hiring, discipline, pay, promotion, termination, or the credibility of a complaint.
- Keep the free-text, tenant-metric, and grievance-analysis AI pathways disabled until company authentication, private tenant storage, data minimization/redaction, provider review, audit, retention/deletion, and access controls are implemented and independently checked.
