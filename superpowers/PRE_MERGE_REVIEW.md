# Pre-merge Review

Run in order: lint → typecheck → relevant unit/integration tests → build → E2E for critical flows → architecture check → security/privacy check → docs/ADR/migration check → independent Reviewer Agent.

`npm run verify` is the baseline gate. Output must state commands/results, acceptance evidence, findings, waivers with owner/expiry and GO/NO-GO.
