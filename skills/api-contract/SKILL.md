---
name: api-contract
description: Define or review MEMYRA API DTOs, boundary schemas, validation, authorization, versioning, and stable errors.
---

# API contract

## Purpose

Make boundary behavior explicit and testable.

## When to use

Adding/changing HTTP, job, webhook or module contracts.

## When not to use

Pure internal refactors with unchanged contracts.

## Inputs

Consumers, request/response examples, errors and compatibility needs.

## Process

Define DTO/schema at boundary; validate untrusted input; authorize resource; specify stable errors/idempotency; assess compatibility and add contract tests.

## Checklist

- No domain/framework type leakage
- Validation and authorization explicit
- Errors/versioning documented
- Sensitive fields excluded

## Expected output

Typed contract, compatibility note and tests.
