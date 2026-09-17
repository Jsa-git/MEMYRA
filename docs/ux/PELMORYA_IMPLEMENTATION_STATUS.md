# Pelmorya — implementação da auditoria

Data da implementação: 16/09/2026. Status global da auditoria: **PARTIAL**. A avaliação técnica não aprova release irrestrito; veja a autorização excepcional de publicação abaixo.

## Publicação excepcional — 17/09/2026

- Após receber os riscos e a alternativa de Preview isolada, o responsável pelo projeto solicitou explicitamente publicar em produção, sem ambiente de testes.
- Esta autorização vale somente para esta entrega da identidade Pelmorya e melhorias já revisadas. Não aprova documentos legais, não encerra achados da auditoria e não se estende a releases futuros.
- Destino autorizado: projeto existente `memyra-web` na Vercel, via `main` de `Jsa-git/MEMYRA`. Não alterar credenciais, schema, migrations, buckets ou dados existentes.
- `npm run verify` repetido em 17/09: exit 0; 56 testes aprovados, 5 de integração ignorados. Revisão independente anterior e smoke público registrados abaixo. Não executar testes destrutivos em produção.
- Responsável pela exceção: solicitante/proprietário do projeto. Validade: somente esta publicação; pendências devem voltar à avaliação no próximo release.
- Rollback: restaurar na Vercel o deployment anterior `DDXewMsfSk5Vstg2dQDCfCynEMr7`, origem `4241d6d8c64667a5b50afe40e9e8eea64bab60d6`. Esta entrega não exige reversão de migrations.
- Publicação da revisão `bb941b1` confirmada na Vercel em 17/09, após rebuild sem cache `BnNmcYcKD5FdSePzWpzjEJ8kodDq` (Ready / Production). As páginas públicas responderam 200 e a paleta publicada foi conferida (`#2b1833`, `#f4ecdf`). Nenhuma conta ou foto foi criada para essa conferência. Os registros abaixo descrevem a etapa local anterior.

### Verificação durante a publicação

- A revisão `bb941b1a33c3e546c85b2fd9bdd134035dbfb90b` foi enviada à `main`. O primeiro build da Vercel respondeu com textos novos e CSS antigo; foi solicitado rebuild sem cache do mesmo código, sem mudar o ambiente.
- O CI Linux revelou expansão de glob no comando Vitest: com dois arquivos E2E, o shell passava um deles como filtro posicional. Os padrões de exclusão agora recebem aspas e um teste verifica os argumentos efetivamente entregues pelo shell da plataforma. Nenhum teste é removido ou desabilitado por essa correção.
- A revisão independente da implementação principal permanece registrada. A tentativa de revisão independente adicional deste ajuste de comando ficou indisponível por limite de uso da ferramenta; não contabilizar como revisão concluída.

## Entregue nesta etapa

- Marca Pelmorya na interface/metadata/autenticação e nova família de cores; tipografia maior, foco visível, contêiner centralizado e redução de movimento.
- Introdução em uma tela e criação de jornada em três etapas. Campos de percepção aceitam desconhecido. Jornada criada sem foto pode ser retomada após login; escolhas ainda não confirmadas não são persistidas.
- Trilha visual com cinco marcos clicáveis quando disponíveis, ação principal derivada de regra pura, estado de jornada inativa e dia concluído. Navegação não marca Hoje e Criar ao mesmo tempo.
- Captura com fechar/trocar câmera, repetição de prévia, preparação local para tamanho de upload, data de importação declarada, mesma imagem integral no preview/registro e mensagens recuperáveis.
- UUID de objeto por tentativa no servidor, preservação do vencedor em concorrência, reconciliação de commit ambíguo e tratamento distinto de rejeições definitivas. Arquivo inválido responde 400.
- Qualidade e comparabilidade não são mais simuladas. Checkpoint distingue arquivo validado de avaliação da imagem; comparação escolhe dois registros com visualização integral e retry autorizado.
- Calendário de São Paulo centralizado; consistência da comparação considera início do plano e mesmo dia. Períodos duplicados e check-ins fora da janela são rejeitados. Jornada inativa não aceita configuração de rotina. Alterar plano existente para valores diferentes retorna 409 até existir política de versionamento.
- Recuperação do aceite pendente após criação da conta, mostrar/ocultar senha, textos de privacidade atualizados e páginas informativas acessíveis. São textos de desenvolvimento, **não documentos legais aprovados**.
- Testes de concorrência/idempotência/calendário/contratos negativos de foto e smoke público mobile/desktop. E2E de identidade foi ajustado ao novo wizard, mas não executado nesta sessão.

## Matriz de acompanhamento da auditoria

READY abaixo significa implementação local com evidência no escopo indicado, não aprovação de produção.

| Achado                       | Status  | Evidência / restante                                                                                           |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| A01 · Upload concorrente     | PARTIAL | Corrida de exclusão corrigida e unitários; integração real e reconciliador de resultado desconhecido pendentes |
| A02 · Limite de upload       | PARTIAL | Preparação local/limite 4 MB; validar payload real na Vercel e câmera física                                   |
| A03 · Qualidade fictícia     | READY   | Metadados não avaliados e cópia verdadeira em checkpoint/comparação                                            |
| A04 · Exclusão recuperável   | TODO    | Exige estado durável/retry/reconciliação e integração isolada; fluxo antigo ainda não atômico                  |
| A05 · Consentimento          | PARTIAL | Links/recuperação implementados; documentos definitivos e enforcement global ainda pendentes                   |
| A06 · Recuperação de acesso  | PARTIAL | Mostrar senha entregue; e-mail transacional/reset dependem de configuração e decisão                           |
| A07 · Onboarding             | PARTIAL | Intro + 3 etapas e retomada pós-criação; rascunho pré-confirmação ainda não salvo                              |
| A08 · Falhas de rede         | PARTIAL | Fluxos principais com try/finally/timeouts; teste de interrupção no dispositivo pendente                       |
| A09 · Próximo passo          | READY   | Regra compartilhada testada; ação diária/inativa coerente                                                      |
| A10 · Trilha                 | PARTIAL | Marcos visuais/acesso aos registros; validar usabilidade autenticada e separar formulários longos              |
| A11 · Câmera                 | PARTIAL | Controles/preview integral/cancelamento; QA físico pendente                                                    |
| A12 · Data de importação     | PARTIAL | Data explícita; origem/precisão ainda sem coluna dedicada                                                      |
| A13 · Métricas               | PARTIAL | Dias/denominadores corrigidos; histórico versionado de planos ainda não existe                                 |
| A14 · Contratos de rotina    | PARTIAL | Datas/períodos/status/401/409 tratados; integração de concorrência pendente                                    |
| A15 · Comparação             | PARTIAL | Par selecionável, imagem integral/retry; zoom dedicado e QA privado pendentes                                  |
| A16 · Tipografia             | PARTIAL | Escala/contraste atualizados; público verificado; privado/leitor de tela pendentes                             |
| A17 · Design system          | PARTIAL | Primitives/tema atualizados; aliases antigos preservados e catálogo incompleto                                 |
| A18 · Privacidade em ajustes | PARTIAL | Cópia/links corrigidos; revogação/exportação/canal de atendimento pendentes                                    |
| A19 · Uso por produto        | TODO    | Nenhum conteúdo de rótulo ou protocolo foi inventado                                                           |
| A20 · Quality gates          | PARTIAL | Novos unitários/contratos/smoke; integração completa e E2E privado pendentes                                   |
| A21 · Checkout/docs          | PARTIAL | Este registro documenta o estado; raiz e checkout de publicação ainda separados                                |
| A22 · Operação/PWA/IA        | TODO    | Não introduzidos sem decisões de retenção, custos e avaliação                                                  |

## Validação e limites

- `npm run verify` executado novamente ao fechar a etapa: **exit code 0**, incluindo lint, tipos, schema, verificações estáticas, 56 testes e build Next.js. Os 5 testes de integração permanecem ignorados nesta configuração.
- Vitest após testes de contrato: **56 aprovados e 5 ignorados**. Integração depende de `TEST_DATABASE_URL` isolada; não usar produção.
- Smoke público: **4 aprovados** via Edge instalado, com Playwright em perfis desktop e viewport 390 × 844. Comando: `$env:PLAYWRIGHT_CHANNEL='msedge'; node node_modules/@playwright/test/cli.js test --config playwright.public.config.ts`. O Chromium gerenciado não está instalado neste ambiente. O canal é opcional; CI continua usando Chromium instalado no workflow.
- Login/cadastro inspecionados visualmente em 390 e 320 px. Nenhuma conta foi criada nem formulário de cadastro enviado.
- O usuário escolheu continuar **sem sessão autenticada**. Telas privadas foram revisadas estaticamente; não afirmar QA visual completo.
- Prévia pública local: `http://127.0.0.1:3100/login`. Ambiente local consultado não tinha `BETTER_AUTH_URL` disponível ao servidor; acesso autenticado requer configuração própria e não foi contornado.
- Revisão independente realizada em duas passagens. Correções incorporadas: limpeza de rejeições definitivas, fallback de reprodução, timeout, decode 400, recuperação de consentimento em exceção, reconciliação de check-in local e foco de inputs. Permanecem os bloqueadores de release desta página.

## Contratos e compatibilidade

- Pacotes `@memyra/*`, tabelas, cookies e domínio público não foram renomeados. Marca de exibição não exige migration.
- `POST /photos`: limite menor e erros 400/413 explícitos. Clientes antigos que enviem arquivos maiores precisam atualizar/reduzir a imagem. Chaves existentes de storage não são alteradas.
- `PUT /routine`: idêntico ao plano atual continua aceito; mudanças de plano retornam `PLAN_CHANGE_REQUIRES_NEW_CYCLE`. Corrida de criação retorna `PLAN_ALREADY_EXISTS`, sem sobrescrever o vencedor. Não há UI de edição com promessa de versionamento.
- `POST /check-ins`: data precisa estar entre início do plano e hoje em São Paulo; períodos distintos no schema de plano.
- `GET /api/me` acrescenta `resumePath` sem remover `onboardingCompleted`. A conclusão antiga do onboarding representa introdução vista, não primeira foto feita.
- A versão de consentimento `2026-09-08` já era literal no schema antes da auditoria: a observação de versão arbitrária em A05 foi excessiva. O problema restante é correspondência com texto aprovado, retomada e gestão de escolhas. Não reescrever evidência de aceites históricos como se fosse uma nova política.

## Bloqueadores antes de publicar

1. Desenhar/testar lifecycle de exclusão e reconciliador de objetos órfãos em banco/storage isolados, com migration aditiva se necessária. Preservar dados em resultados ambíguos é deliberado; não prometer limpeza completa agora.
2. Aprovar documentos legais, controlador/canal de atendimento e retenção; escolher/configurar provedor de e-mail para recuperação. Páginas informativas atuais não substituem essa aprovação.
3. Rodar integração e E2E privados com dados sintéticos; câmera física, teclado/leitor de tela e revisão visual dos fluxos completos.
4. Consolidar checkout de publicação com mudanças revisadas e decidir deploy/rollback. Nada foi enviado ao GitHub nesta execução.

O desenvolvimento ocorre na raiz indicada pelo ambiente. `work/publish` continua o checkout Git anterior, não foi sobrescrito nem publicado. Antes de deploy, transferir apenas mudanças revisadas, excluindo secrets/caches, e validar o mesmo commit que será entregue.
