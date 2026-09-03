# Desenvolvimento local

Instale Node 22+ e pnpm 11.19.0. Execute `pnpm install`, copie `.env.example` para `.env.local` sem dados reais, configure um PostgreSQL descartável e rode `npm run db:generate`, `npm run db:migrate` e `npm run db:seed`. Depois use `npm run dev`. Preview e production recebem secrets no provedor; nunca reutilize credenciais. O ator de desenvolvimento é proibido em produção.

Antes de PR: `npm run verify`. Para falhas, execute o gate isolado. Storage ainda não existe nesta fase. Não aponte ambientes locais para dados de produção.
