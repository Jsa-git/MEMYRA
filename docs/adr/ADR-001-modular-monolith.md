# ADR-001 — Modular monolith

## Context

Produto inicial exige evolução rápida, boundaries claros e baixo custo operacional.

## Decision

Um monólito modular com contratos entre módulos e camadas somente onde agregam valor.

## Alternatives

Microserviços; aplicação Next.js sem boundaries; monorepo multi-serviço.

## Consequences

Deploy simples e transações locais; exige disciplina para evitar acoplamento. Extração futura depende de evidência.

## Status

Accepted — 2026-09-02.
