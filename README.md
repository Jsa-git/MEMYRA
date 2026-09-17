# Pelmorya

Harness e plataforma de acompanhamento cosmético Pelmorya (anteriormente MEMYRA). A pele tem memória; o software acompanha uma mesma região ao longo do tempo. Há identidade por e-mail/senha, jornadas, captura privada, rotina, check-ins e comparação visual. IA, recuperação por e-mail e lifecycle durável de exclusão continuam pendentes. Consulte `docs/ux/PELMORYA_IMPLEMENTATION_STATUS.md`: o upgrade é local e ainda não está liberado para produção.

## Pré-requisitos e comandos

- Node.js 22+ (validado com 24.19.0)
- pnpm 11.19.0 (`corepack enable` se necessário)
- `pnpm install`
- `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build`
- `npm run check:architecture`, `npm run check:security`, `npm run verify`
- `npm run test:e2e:public`: smoke sem login ou mutação de dados; requer navegador Playwright instalado (ou `PLAYWRIGHT_CHANNEL=msedge` com Edge instalado).
- Banco local: `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`

Ambientes: local usa `.env.local`; preview e production usam secrets do provedor. `DATABASE_URL`, `BETTER_AUTH_URL` e um `BETTER_AUTH_SECRET` aleatório com pelo menos 32 caracteres são obrigatórios para autenticação. Copie `.env.example`, nunca publique secrets. Comece por `AGENTS.md`, `docs/product/PRODUCT.md` e `docs/architecture/ARCHITECTURE.md`.
