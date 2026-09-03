# ADR-007 — Ator temporário de desenvolvimento

## Context

O primeiro vertical slice precisa persistir e reabrir uma jornada, mas autenticação pertence à próxima fase autorizada. Aceitar `userId` do navegador criaria um bypass de autorização.

## Decision

Enquanto Identity não existir, a aplicação resolve um único ator fictício exclusivamente no servidor. Ele é habilitado apenas em `local` e `test`, nunca vem do payload e toda leitura usa `journeyId + userId`. Produção falha de forma segura sem um provedor de identidade real.

## Alternatives

Antecipar autenticação; aceitar usuário do cliente; manter a jornada somente em memória; publicar um modo demo compartilhado.

## Consequences

O slice pode provar persistência e ownership sem implementar sessão própria. Não existe isolamento real entre pessoas usando a mesma instância local, e preview/produção permanecem indisponíveis até autenticação. O adapter será removido ou substituído na fase de Identity.

## Status

Superseded by ADR-008 — 2026-09-03.
