# ADR-004 — Object storage privado

## Context

Fotos não pertencem ao banco e têm alto impacto de privacidade.

## Decision

Storage S3-compatible com bucket privado, public access block, chaves opacas e URLs assinadas temporárias após autorização.

## Alternatives

Filesystem; blobs no PostgreSQL; CDN pública.

## Consequences

Escala e lifecycle adequados; requer política, CORS, expiração, exclusão de derivados e testes contra exposição.

## Status

Accepted — 2026-09-02.
