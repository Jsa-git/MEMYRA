---
name: repo-navigator
description: Locate MEMYRA architecture, domain boundaries, decisions, and relevant files before a scoped repository change.
---

# Repo navigator

## Purpose

Build a fast, evidence-based change map.

## When to use

At the start of unfamiliar or cross-file work.

## When not to use

For a known one-file typo with no behavioral impact.

## Inputs

Requested outcome, affected flow, known files.

## Process

Read `AGENTS.md`, product/architecture docs and relevant ADRs; use `rg` to trace contracts/tests; report boundary and likely files before editing.

## Checklist

- Scope and out-of-scope explicit
- Owners/contracts/tests located
- Privacy/medical triggers identified

## Expected output

A compact file map, constraints, unknowns and verification commands.
