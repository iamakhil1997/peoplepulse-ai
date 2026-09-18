# Anonymous Grievances & Two-Way Tokenized Mailbox

## Overview
Traditional whistleblowing and grievance systems force a bad tradeoff:
1. **Identified Grievance:** Complete communication, but high fear of retaliation.
2. **One-Way Anonymous Form:** Protects identity, but HR cannot ask clarifying questions or provide status updates.

**PeoplePulse AI solves this with the Tokenized Anonymous Mailbox.**

```
[Employee Submits Anonymously]
       │
       ▼
[Server Generates Case No: PP-GR-2026-1001 + Passcode: pp_sec_9f81...]
       │
       ▼
[Employee Returns to /track-case and enters Passcode]
       │
       ▼
[Two-way messaging with HR while identity remains 100% hidden]
```

## Guarantees
1. **No Identity Column:** The `submitter_id` database column is strictly `NULL`.
2. **No Tracking Footprint:** Device fingerprinting and IP retention are explicitly disabled on anonymous endpoints.
3. **Internal Note Wall:** Internal HR investigation deliberations are never returned to the anonymous mailbox.
