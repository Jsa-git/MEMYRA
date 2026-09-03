---
name: database-change
description: Plan and verify safe MEMYRA PostgreSQL schema changes and migrations using expand-contract and rollback planning.
---

# Database change

## Purpose

Prevent unsafe, incompatible or irreversible data changes.

## When to use

Schema, index, constraint, migration or backfill work.

## When not to use

Queries/tests that do not alter schema or production data.

## Inputs

Current schema, data volume, deployment order and invariants.

## Process

Model ownership; prefer additive migration; separate backfill/constraint/removal; assess locks; test old/new compatibility; define roll-forward/rollback. Never edit applied migration.

## Checklist

- Backward-compatible deployment
- Lock/data-loss risk assessed
- Migration and integration test
- Recovery plan documented

## Expected output

Migration plan/files, verification evidence and recovery procedure.
