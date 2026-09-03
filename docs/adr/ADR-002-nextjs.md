# ADR-002 — Next.js

## Context

É necessária uma web responsiva/PWA compatível com Vercel e TypeScript.

## Decision

Next.js App Router será shell de apresentação e composição; domínio não dependerá dele.

## Alternatives

SPA Vite + API separada; Remix; framework backend separado.

## Consequences

Integração/deploy simples; risco de acoplamento é mitigado por portas e packages.

## Status

Accepted — 2026-09-02.
