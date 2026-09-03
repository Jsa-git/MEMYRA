---
name: release-check
description: Determine whether a MEMYRA change is ready to merge or deploy using executable gates and independent review evidence.
---

# Release check

## Purpose

Give an evidence-based go/no-go decision.

## When to use

Before merge/deploy or completion of relevant work.

## When not to use

During initial exploration with no candidate change.

## Inputs

Diff, acceptance criteria, CI results, ADR/docs and risk reviews.

## Process

Run `npm run verify`; run E2E when critical flows change; inspect architecture/security/privacy/docs/migrations; require independent review; list waivers with owner/expiry.

## Checklist

- Gates green
- Acceptance evidence present
- Sensitive reviews complete
- No undocumented contract/migration risk

## Expected output

GO or NO-GO with command evidence and blockers.
