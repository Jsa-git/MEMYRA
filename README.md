# MEMYRA

Harness de engenharia e slices iniciais da plataforma web/PWA MEMYRA. A pele tem memória; o software acompanha uma mesma região ao longo do tempo. O estado atual inclui identidade por e-mail/senha, sessões persistentes, ownership e hub de jornadas. Fotos, rotina, check-in e IA ainda não foram implementados.

## Pré-requisitos e comandos

- Node.js 22+ (validado com 24.19.0)
- pnpm 11.19.0 (`corepack enable` se necessário)
- `pnpm install`
- `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build`
- `npm run check:architecture`, `npm run check:security`, `npm run verify`
- Banco local: `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`

Ambientes: local usa `.env.local`; preview e production usam secrets do provedor. `DATABASE_URL`, `BETTER_AUTH_URL` e um `BETTER_AUTH_SECRET` aleatório com pelo menos 32 caracteres são obrigatórios para autenticação. Copie `.env.example`, nunca publique secrets. Comece por `AGENTS.md`, `docs/product/PRODUCT.md` e `docs/architecture/ARCHITECTURE.md`.
