# ADR-008 — Better Auth para identidade

## Context

O ator sintético do primeiro slice não oferece identidade nem isolamento reais. O V1 precisa de cadastro e login por e-mail, sessão persistente e ownership derivado exclusivamente da sessão, mantendo Next.js 16, Prisma 7 e PostgreSQL.

## Decision

Usar Better Auth 1.7.2 com `@better-auth/prisma-adapter` 1.7.2 e e-mail/senha. As tabelas User, Session, Account e Verification vivem no PostgreSQL existente, com IDs UUID. O handler oficial é montado em `/api/auth/[...all]`; páginas e APIs validam a sessão no servidor e convertem somente `session.user.id` em `ActorContext`. Development e production usam o mesmo modelo; não existe fallback sintético. OAuth permanece preparado pelo modelo Account, mas não configurado.

Cookies seguros são exigidos em production, a origem confiável é explícita e secrets permanecem server-side. A exclusão nativa de usuário fica desabilitada até existir um caso de uso que coordene banco, storage futuro, derivados, auditoria e retenção.

Consentimentos são registros próprios e históricos, separados da autenticação. `PHOTO_PROCESSING` não será solicitado antes do pipeline de fotografias, e nenhum consentimento é criado sem texto e versão reais.

## Alternatives

Auth.js; provedor SaaS como Clerk/Auth0; autenticação própria; manter o ator de desenvolvimento.

## Consequences

O projeto ganha sessões e credenciais maduras sem acoplar domínio ou aplicação ao fornecedor. Novas tabelas e secrets operacionais são necessários. Verificação e recuperação por e-mail dependem de provedor futuro. Atualizações do Better Auth exigem revisão do schema gerado e migration explícita. ADR-007 fica substituído.

## Status

Accepted — 2026-09-03.
