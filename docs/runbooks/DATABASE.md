# Banco local e migrations

## Desenvolvimento

Forneça um PostgreSQL local e copie `.env.example` para `.env.local`. Use uma base descartável, nunca dados reais. Em seguida execute os scripts `db:generate`, `db:migrate` e `db:seed` definidos no workspace.

## Deploy

Ordem: backup/observabilidade aplicável → migration aditiva com credencial própria → aplicação → smoke test. O runtime deve usar usuário de menor privilégio e TLS em preview/produção. Não execute seed de desenvolvimento fora de local/teste.

## Recovery

A migration inicial só cria enums, tabelas, índices e FKs. Antes de dados reais, uma base local pode ser descartada e recriada. Depois do primeiro ambiente persistente, prefira roll-forward com nova migration; nunca edite uma migration já aplicada. Qualquer rollback destrutivo exige backup verificado e autorização explícita.

# Supabase connections

MEMYRA uses Supabase as managed PostgreSQL while Prisma remains the database
boundary. Configure `DATABASE_URL` with the transaction-mode pooler for the
application runtime and `DIRECT_URL` with the session-mode pooler or direct
connection for Prisma CLI operations and migrations. Never commit either URL.

With Prisma 7, connection URLs belong in `prisma.config.ts`; do not add `url` or
`directUrl` to `schema.prisma`. The CLI prefers `DIRECT_URL` and falls back to
`DATABASE_URL` for local compatibility.

## Padrões UUID da autenticação

As tabelas `users`, `sessions`, `accounts` e `verifications` geram UUID no
PostgreSQL quando o adapter de autenticação omite o identificador. A migration
é retrocompatível com chamadores que enviam o próprio UUID. Em caso de
regressão antes de novos dados, remova apenas os defaults; não remova colunas ou
registros. Depois de uso em produção, corrija com uma nova migration.

## Compatibilidade do Better Auth

A versão instalada do Better Auth (1.7.2) exige `accounts.issuer` e identifica
contas pela combinação `(issuer, account_id)`. Antes de atualizar o Better Auth,
revise o guia de upgrade e gere o schema esperado pela CLI para detectar mudanças
de contrato antes do deploy.
