---
name: security-review
description: Perform a scoped MEMYRA security review of auth, authorization, uploads, storage, secrets, dependencies, AI, and sensitive operations.
---

# Security review

## Purpose

Find exploitable boundary failures using the threat model.

## When to use

Sensitive flows, new dependencies/providers, upload/auth/storage/AI or release review.

## When not to use

As a substitute for ordinary correctness testing.

## Inputs

Diff/architecture, assets, trust boundaries and attacker goals.

## Process

Trace untrusted inputs and privileges; test access control, disclosure, injection, abuse and failure modes; rank by likelihood/impact; recommend smallest fix.

## Checklist

- Object authorization and secret hygiene
- Upload/URL/cache/log controls
- Dependency and abuse surface
- Critical findings block release

## Expected output

Prioritized findings with evidence, remediation and residual risk.
