# ADR-003 — PostgreSQL e Prisma

## Context

Jornadas, consentimentos e estados exigem consistência relacional, migrations e typing.

## Decision

PostgreSQL será o banco. Prisma é o ORM planejado por maturidade, migrations explícitas, ecossistema TypeScript e suporte operacional amplo; será instalado apenas quando o primeiro modelo existir.

## Alternatives

Drizzle (mais próximo de SQL, menor abstração); SQL direto (controle maior, mais infraestrutura); outros bancos.

## Consequences

Boa produtividade e schema legível; client/codegen e limites de queries exigem atenção. Migrations seguem expand/contract.

## Status

Accepted and implemented for the first Journey slice — 2026-09-02.
