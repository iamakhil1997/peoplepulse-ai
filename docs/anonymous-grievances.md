# Anonymous Grievances & Two-Way Tokenized Mailbox

> **Current implementation status:** demo only. Do not submit real grievances. The app has no production-ready private company account, durable case database, retention/deletion controls, or complete privacy review. Anonymous endpoints are disabled unless demo mode is explicitly enabled and use synthetic demo storage only.

## Overview
Traditional whistleblowing and grievance systems force a bad tradeoff:
1. **Identified Grievance:** Complete communication, but high fear of retaliation.
2. **One-Way Anonymous Form:** Protects identity, but HR cannot ask clarifying questions or provide status updates.

The product prototype demonstrates a tokenized anonymous mailbox. It does not yet establish a production anonymity guarantee.

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
[Two-way demo messaging with HR]
```

## Current demo behavior and limits
1. Anonymous demo submissions omit the submitter ID and newly generated passcodes are stored as SHA-256 digests. Older seeded demo cases may still use fixed example passcodes.
2. No independent review has verified network, deployment, browser, or operational logs for identity leakage.
3. The tracking endpoint omits internal notes in its demo response, but all API and storage paths still require a production security review.
4. Real-case anonymous intake remains unavailable until authentication, tenant boundaries, durable storage, retention/deletion, logging, and AI handling are implemented and reviewed.
