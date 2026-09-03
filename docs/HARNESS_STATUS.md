# Harness Status — 2026-09-03

Legenda: **READY** verificável agora; **PARTIAL** fundação pronta, depende da V1/fornecedor; **TODO** não iniciado intencionalmente.

| Área                                 | Estado  | Evidência / próximo passo                                                  |
| ------------------------------------ | ------- | -------------------------------------------------------------------------- |
| Git, workspace e lockfile            | READY   | Git inicializado; pnpm workspaces e lockfile reproduzível                  |
| Node/package manager                 | READY   | Node 24.19.0; pnpm 11.19.0; engines Node 22+                               |
| Next.js/React/TypeScript shell       | READY   | Route groups públicos/protegidos e shell mobile-first                      |
| Lint, formatting, strict types       | READY   | ESLint flat config, Prettier e TS project references                       |
| Unit test harness                    | READY   | Vitest executável                                                          |
| Integration tests                    | PARTIAL | Auth/ownership/cascatas prontos; execução local requer `TEST_DATABASE_URL` |
| E2E                                  | PARTIAL | Identity + Journey desktop/mobile prontos; execução depende da CI          |
| CI PR e E2E                          | READY   | Workflows separados e permissões mínimas                                   |
| AGENTS.md / contribuição / segurança | READY   | Regras de escopo, DoD, foto, IA, API e migrations                          |
| Produto e V1 scope                   | READY   | Identity, Create Journey, hub e retomada implementados                     |
| Modular-monolith boundaries          | READY   | Pacotes, documento, ADR e check inicial                                    |
| PostgreSQL / Prisma                  | READY   | Prisma 7, schema, migration, repository específico, seed e CI              |
| Auth / OAuth                         | PARTIAL | Better Auth e-mail/senha pronto; OAuth e e-mail transacional adiados       |
| Object storage privado               | PARTIAL | Arquitetura/controles prontos; sem provider/upload                         |
| Photo pipeline                       | PARTIAL | Lifecycle e PhotoRecord conceituais; sem câmera/processamento              |
| Privacy/LGPD readiness               | PARTIAL | Modelo e gates definidos; retenção/base legal/DPIA dependem de revisão     |
| Threat model                         | READY   | Ativos, fronteiras, ameaças e controles priorizados                        |
| AI boundaries / AIProvider           | PARTIAL | Porta conceitual e proibições; sem integração/evals                        |
| Design system                        | READY   | Tokens, primitives acessíveis e shell mobile-first                         |
| Observability                        | PARTIAL | Contrato leve; provider/retention TODO antes de produção                   |
| Feature flags                        | PARTIAL | Convenção/config exemplos; serviço/runtime aguardam features               |
| Skills locais                        | READY   | 11 skills nativas em `skills/*/SKILL.md`                                   |
| Agentes especializados               | READY   | 10 definições com missão, arquivos, skills, autoridade e escalation        |
| Superpowers                          | READY   | 6 workflows compostos documentados                                         |
| Toolkit                              | READY   | Env, arquitetura e segurança executáveis; types/tests/build compostos      |
| Dead code / accessibility gates      | PARTIAL | Accessibility lint ativo; dead-code analyzer aguarda maior volume          |
| Dependency governance                | READY   | Versões fixas, lockfile e allowlist de install scripts                     |
| Journey ownership e hub              | READY   | Create/list/get/update owner-scoped; empty/loading/error e retomada        |
| Consent foundation                   | READY   | Modelo versionado/revogável; nenhum aceite fictício ou foto exigida        |
| `npm run verify`                     | READY   | Inclui schema, accessibility lint, testes e build do slice                 |

## Riscos e pendências deliberadas

- O E2E e os testes de integração foram descobertos localmente, mas a execução completa com PostgreSQL e Chromium aguarda o workflow CI.
- Compatibilidade PWA, runtime de produção e política de upgrades do Next.js devem ser testadas com fluxos reais na V1.
- Provider de e-mail/verificação, banco gerenciado, storage, observabilidade e IA não foram escolhidos.
- Política jurídica de retenção, base legal/consentimento e direitos LGPD requer validação especializada antes de dados reais.
- Checks de arquitetura/segurança são baselines heurísticos; devem crescer com módulos reais.
- Rate limiting, verificação e recuperação por e-mail são necessários antes da abertura pública.
- O primeiro commit permanece bloqueado por permissão de escrita em `.git`; a árvore de trabalho está integralmente não rastreada.

Próximo marco requer autorização explícita para PHOTO PIPELINE V1.
