---
name: testing
description: Select and implement the smallest effective MEMYRA unit, integration, contract, or E2E coverage for a change.
---

# Testing

## Purpose

Verify behavior and prevent meaningful regressions.

## When to use

Behavioral changes, bug fixes, contracts and critical flows.

## When not to use

Documentation-only edits unless executable examples changed.

## Inputs

Acceptance criteria, risk, interfaces and failure modes.

## Process

Choose lowest sufficient layer; cover happy path, boundary and important failure/authorization cases; use synthetic data; run focused tests then verify.

## Checklist

- Behavior over implementation
- Negative/privacy cases where relevant
- Deterministic and isolated
- Failure observed before fix when feasible

## Expected output

Tests mapped to acceptance criteria and commands/results.
