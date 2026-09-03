# Banco local e migrations

## Desenvolvimento

Forneça um PostgreSQL local e copie `.env.example` para `.env.local`. Use uma base descartável, nunca dados reais. Em seguida execute os scripts `db:generate`, `db:migrate` e `db:seed` definidos no workspace.

## Deploy

Ordem: backup/observabilidade aplicável → migration aditiva com credencial própria → aplicação → smoke test. O runtime deve usar usuário de menor privilégio e TLS em preview/produção. Não execute seed de desenvolvimento fora de local/teste.

## Recovery

A migration inicial só cria enums, tabelas, índices e FKs. Antes de dados reais, uma base local pode ser descartada e recriada. Depois do primeiro ambiente persistente, prefira roll-forward com nova migration; nunca edite uma migration já aplicada. Qualquer rollback destrutivo exige backup verificado e autorização explícita.
