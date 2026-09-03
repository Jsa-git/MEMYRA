---
name: architecture-guardian
description: Review MEMYRA changes for modular-monolith boundary violations, framework leakage, and unjustified abstractions.
---

# Architecture guardian

## Purpose

Keep module ownership and dependency direction explicit.

## When to use

New modules, cross-boundary changes, infrastructure or ADR-worthy decisions.

## When not to use

Content-only edits that do not change structure.

## Inputs

Plan/diff, affected modules, current ADRs.

## Process

Map imports and data ownership; test presentation→application→domain direction; prefer public contracts; request ADR for material choices; reject empty layers/speculative generalization.

## Checklist

- Domain framework-free
- No internal-table coupling
- Change is smallest viable shape
- ADR/docs updated if needed

## Expected output

Pass/fail findings with file evidence and required corrections.
