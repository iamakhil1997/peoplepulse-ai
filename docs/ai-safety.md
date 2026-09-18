# AI Ethics, Safety & Human-in-the-Loop Governance

## Core Philosophical Principles
1. **AI is Decision Support, Never an Arbiter:** AI provides summaries, sentiment trends, topic clustering, and response drafts. It **never** determines guilt, evaluates legal liability, or executes termination recommendations.
2. **Deterministic Pre-LLM Safety Screener:** Critical life safety, self-harm, weapons/physical violence, sexual misconduct, and whistleblower retaliation trigger immediate deterministic red flags regardless of LLM generation.
3. **Tenant Boundary Isolation:** LLM context windows only receive sanitized text from the authenticated tenant. No cross-tenant learning or data blending is permitted.
4. **Transparent Disclaimers:** Every AI-generated output is accompanied by clear badges stating:  
   *`"AI Decision Support: Generated for HR guidance only. Does not determine guilt or replace human judgment."`*
