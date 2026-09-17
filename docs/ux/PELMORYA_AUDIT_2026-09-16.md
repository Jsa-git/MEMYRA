# Pelmorya — auditoria e plano de evolução

Data: 16/09/2026. Status: auditoria concluída dentro da cobertura abaixo; melhorias propostas, não implementadas. Nova marca e paleta informadas pelo responsável pelo produto.

## 1. Parecer executivo

A aplicação tem uma base aproveitável: conta, jornadas com ownership, captura interna, storage privado, rotina, checkpoints e comparação visual. Não recomendo reescrever a stack. Recomendo consolidar a experiência e corrigir os riscos de integridade antes de ampliar funcionalidades.

O problema não se resume às cores. Há fragmentação entre a promessa de uma jornada guiada e os estados reais do produto: onboarding longo, próximos passos inconsistentes, fotografia com pouca recuperação de erros, indicadores pouco explicados e componentes pouco padronizados. A aparência atual privilegia títulos editoriais, espaços vazios e cartões, enquanto o núcleo do produto — fotografar a mesma região e acompanhar o cuidado — tem menos protagonismo.

A direção recomendada é **Pelmorya: um caminho pessoal de cuidado**, com identidade ameixa, tipografia legível, fotografia neutra e marcos interativos. Engajamento vem da clareza do próximo passo e da memória construída, não de competição, promessas de melhora ou pontuação da pele.

## 2. Cobertura e limites da auditoria

- Inspeção do código das rotas públicas/protegidas, componentes, autenticação, APIs, modelo de dados, storage, validações, testes, CI e documentação.
- Inspeção visual e DOM de login/cadastro publicados. Login observado em 325 × 800; cadastro em 325 × 800 e 390 × 844. Em 1440 × 900, verificação de largura por DOM e captura parcial da superfície disponível. Não houve overflow horizontal nas medições públicas realizadas.
- As telas privadas foram auditadas pelo código, **não percorridas com uma sessão autenticada nesta execução**. Não foram criadas contas, enviadas fotos nem alterados dados em produção.
- `pnpm verify` executado localmente: sucesso; 42 testes aprovados e 5 testes de integração ignorados. E2E não executado nesta auditoria. O workflow de CI prevê PostgreSQL para integração; seu resultado remoto não foi consultado.
- Comparação por hash de 137 arquivos selecionados de `apps`, `packages`, `tests`, `toolkit` e `.github`: nenhum diferente/ausente entre a raiz e `work/publish`. Isso não comprova qual build está publicado. O último commit local de `work/publish` é `4241d6d`.
- Não houve pentest, teste de carga, inspeção das políticas efetivas do Supabase, validação de backups, teste em câmera física iOS/Android ou pesquisa com clientes. Não é certificação de segurança, acessibilidade ou conformidade legal.
- Skills locais utilizadas: `ui-quality`, `security-review` e `privacy-guardian`. Elas orientaram a separação entre evidência, risco e critério de aceite.

Legenda: **C** = observado no código; **V** = observado na interface pública; **R** = recomendação de produto/design; **H** = hipótese que exige reprodução. P1 = corrigir antes de expandir o uso; P2 = próxima entrega de qualidade; P3 = evolução posterior. Não foi estabelecida evidência de incidente ativo.

## 3. Achados prioritários

### A01 · P1 · Limpeza de upload pode apagar um objeto válido [C/H]

Evidência: `apps/web/app/api/journeys/[id]/photos/route.ts:56–73`; `apps/web/src/server/photo-storage.ts`, `uploadPrivatePhoto`.

A chave deriva do `uploadId` recebido. Ela é marcada para limpeza antes de o upload terminar. O storage não permite sobrescrita. Duas requisições concorrentes podem passar pela consulta de existência; a perdedora recebe erro de upload e executa exclusão da mesma chave da vencedora. Reutilização de um identificador conhecido em outra jornada também merece teste de isolamento. O fluxo vulnerável está no código; não foi provocado em produção.

Correção: reservar uma operação idempotente vinculada ao ator/jornada, usar chave opaca controlada pelo servidor e excluir apenas o objeto comprovadamente criado pela própria tentativa. Recuperar conflitos de unicidade retornando o registro já concluído.

Aceite: duas requisições simultâneas, retry após timeout e reutilização entre jornadas resultam em no máximo um registro/objeto autorizado; nenhum objeto de outra tentativa é removido.

### A02 · P1 · Limite de foto incompatível com o caminho de upload [C]

Evidência: a rota de fotos aceita 10 MiB e recebe `multipart/form-data` pela função Next.js. O cliente não garante redução para um limite operacional menor.

A Vercel documenta limite de payload de 4,5 MB para Functions. Arquivos aceitos pelo contrato local podem receber 413 antes de chegar à validação da aplicação. Fonte: [Vercel Functions limits](https://vercel.com/docs/functions/limitations#request-body-size).

Correção inicial: normalizar/redimensionar antes do envio com margem para multipart, explicitar limite compatível e apresentar erro recuperável. Se fotos maiores forem necessárias, decidir um fluxo privado de upload com staging e validação antes da publicação interna; não tornar o bucket público.

Aceite: casos abaixo/no/acima do limite operacional, imagem de alta resolução, rede lenta e 413 com possibilidade de tentar novamente sem perder a captura.

### A03 · P1 · Qualidade e comparabilidade aparentam ser medidas, mas não são [C]

Evidência: `photo-journal.tsx:142–143` fixa `CENTERED`/`EVEN`; a rota persiste `ACCEPTED` após verificações de arquivo/dimensões. A página de checkpoint apresenta “Boa captura” e “Centralizado”; `compare/page.tsx` usa igualdade desses metadados para apresentar comparabilidade “Boa”.

Correção: distinguir arquivo válido, orientação fornecida, informação declarada e qualidade realmente avaliada. Exibir “Arquivo validado” e “Iluminação não avaliada”, conforme a informação disponível. Não sugerir análise automática inexistente.

Aceite: fotos escuras/descentralizadas não recebem selo de qualidade inferido de constantes. Comparação explica limitações e nunca converte diferença visual em eficácia clínica.

### A04 · P1 · Exclusão entre banco e storage não é recuperável [C/H]

Evidência: `api/account/route.ts:15–20` exclui objetos em paralelo antes da conta; `api/photos/[id]/route.ts` também coordena dois sistemas sem transação conjunta.

Uma falha parcial pode deixar referências sem arquivo; upload concorrente com exclusão pode criar órfãos. Não se observou perda real nesta auditoria.

Correção: estado de exclusão, bloqueio de novas mutações, operações idempotentes e reconciliação com retry. Definir retenção/backups no runbook, sem prometer remoção instantânea de todas as cópias externas.

Aceite: falha do storage, timeout e upload simultâneo convergem para estado consistente; usuário recebe andamento verdadeiro.

### A05 · P1 · Consentimento sem documento acessível e recuperação incompleta [C/V]

Evidência: `components/auth-form.tsx` mostra aceite de Termos/Política sem links; cria a conta antes do POST de consentimento. Se esse POST falha, pede novo login, mas o login só verifica onboarding. `api/consents/route.ts` aceita versão enviada pelo cliente.

Correção: documentos publicados/versionados, referências verificadas pelo servidor e retomada explícita do aceite pendente. Não confundir aceite de termos com escolha opcional para fotos/IA. Validação da base legal é decisão própria, não conclusão desta auditoria técnica.

Aceite: documentos abrem antes do aceite; falha entre cadastro e registro é recuperável; versão inexistente é rejeitada; escolhas ficam rastreáveis.

### A06 · P2 · Recuperação de acesso ausente [C/V]

Evidência: formulário não oferece “Esqueci minha senha” nem revelar senha; `src/server/auth.ts` não configura envio de recuperação/verificação.

Correção: recuperação segura com e-mail transacional, feedback sem enumerar contas e opção de revelar senha. Definir política de verificação de e-mail antes de uso ampliado; não afirmar que falta proteção padrão do Better Auth sem verificá-la.

Aceite: recuperação expirada/inválida/reutilizada, teclado, autofill e retorno ao fluxo interrompido testados.

### A07 · P2 · Onboarding informa muito e não preserva o progresso [C/R]

Evidência: `onboarding-flow.tsx` tem três etapas introdutórias; `journey/new/journey-wizard.tsx` tem seis etapas e estado local. Onboarding é marcado concluído antes da jornada/foto. Uma interrupção perde o rascunho.

Correção: onboarding orientado à ação, introdução breve e dispensável, formulário agrupado em etapas com resultado concreto. Retomar o ponto pendente a partir de estado mínimo seguro; não guardar fotos/PII indiscriminadamente em localStorage.

Aceite: reload, voltar, sessão expirada e interrupção após criar jornada retomam sem duplicação. Exibir uma contagem coerente do fluxo completo, não múltiplas contagens concorrentes.

### A08 · P2 · Falha de rede pode deixar ações travadas [C]

Evidência: `routine-panel.tsx:48–80` e `onboarding-flow.tsx`, `finish`, não tratam rejeição de `fetch` com recuperação completa. O estado de rotina depende do refresh após a resposta.

Correção: `try/catch/finally`, estado pendente por operação, prevenção de duplo envio e feedback persistente com retry. Só celebrar salvamento confirmado.

Aceite: modo offline, timeout e 500 permitem nova tentativa; check-in não alterna incorretamente por props antigas.

### A09 · P2 · Próximo passo e navegação contradizem o estado [C]

Evidência: `journey-hub.tsx`, `featured`/`nextAction`, pode destacar jornada arquivada como “ativa”; não recebe a conclusão dos check-ins de hoje. `primary-navigation.tsx:22` marca Hoje e Nova jornada simultaneamente em `/journey/new`. `journey-path.tsx` pode ter vários marcos “atuais”.

Correção: uma regra compartilhada e testável de próximo passo; estado separado para sem jornada ativa, dia concluído, foto pendente e ciclo finalizado. Apenas um destino principal e um item de navegação atual.

Aceite: testar essas combinações, múltiplas jornadas e reativação; nunca encaminhar para ação proibida pelo backend.

### A10 · P2 · A trilha ainda funciona como lista de tarefas [C/R]

Evidência: `journey-path.tsx` renderiza uma linha vertical com passos; marcos concluídos em geral não abrem detalhes; rotina e fotografia permanecem na mesma página longa. Um `div` é filho direto do `ol`.

Correção: mapa de marcos por capítulo/ciclo, itens navegáveis, estados explícitos e detalhe progressivo. Usar linha decorativa em pseudo-elemento ou fora da lista semântica. Formulários de ação não precisam ficar todos permanentemente expostos.

Aceite: cliente identifica onde está, o que já fez e o próximo passo sem ler a página inteira; todos os registros anteriores continuam acessíveis.

### A11 · P2 · Câmera precisa de um fluxo próprio e enquadramento fiel [C/H]

Evidência: `photo-journal.tsx` usa vídeo/preview `object-cover` em 3:4, mas captura as dimensões integrais do vídeo. Não há fechar câmera/trocar câmera; abertura não tem trava de concorrência. O input “Usar arquivo” inclui `capture`, podendo priorizar câmera no dispositivo.

Correção: estados preparar → permitir → enquadrar → revisar → enviar → confirmado; sair/refazer/trocar câmera; parar tracks em todos os caminhos. Preview e arquivo devem compartilhar geometria; overlays nunca alteram os pixels da pele.

Aceite: Chrome Android/Safari iOS físicos, permissão recusada, rotação, chamada interrompida, captura repetida, fechamento e mudança de aba. Não inferir funcionamento mobile apenas pela emulação de largura.

### A12 · P2 · Data de captura importada não é confiável [C]

Evidência: `photo-journal.tsx:131` usa `File.lastModified`; servidor só aceita últimos sete dias e cinco minutos futuros.

Correção: separar data do envio de data de captura, registrar origem e incerteza. Definir se importação histórica é permitida; explicar restrições antes de enviar. Nunca usar GPS para resolver isso.

Aceite: arquivo copiado/editado, data desconhecida, relógio incorreto e importação antiga com mensagem específica; sem data fabricada.

### A13 · P2 · Métricas misturam calendário e adesão [C]

Evidência: `journey-hub.tsx`, `journey-path.tsx`, `packages/domain/src/journey-progress.ts` e `compare/page.tsx`. O ciclo avança pelo tempo; a consistência usa idade da jornada e períodos atuais. Duas fotos no mesmo dia contam ao menos um dia de intervalo e dois dias no denominador da comparação. Mudanças no plano reinterpretram o histórico.

Correção: distinguir “dia do acompanhamento”, “registros concluídos/previstos” e “fotos registradas”. Definir data de início do plano e política de alterações; centralizar calendário/fuso e denominadores no domínio.

Aceite: mesmo dia, virada de dia, plano criado depois da jornada, troca de frequência, datas futuras e ciclo encerrado. Nada deve se apresentar como percentual de melhora da pele.

### A14 · P2 · Contratos de rotina incompletos [C]

Evidência: `packages/validation/src/routine.ts` aceita períodos duplicados; data de check-in valida formato, não janela de negócio. `api/journeys/[id]/routine/route.ts` não verifica jornada ativa e transforma falha de autenticação em 500.

Correção: períodos distintos, política explícita de data/retroativo, comportamento de edição do ciclo, status e erros estáveis. A UI não substitui autorização/validação do servidor.

Aceite: entradas duplicadas, jornada arquivada, não autenticado e data fora do período com respostas de contrato testadas.

### A15 · P2 · Comparação e checkpoint precisam de contexto e recuperação [C/R]

Evidência: comparação escolhe sempre primeira/última foto; slider vai de 8 a 92 e sua alça visual não é arrastável. Imagens são recortadas por `object-cover`. `checkpoint-photo.tsx` e `photo-comparison.tsx` não oferecem retry/onError de imagem. Data futura no checkpoint é calculada a partir da foto histórica exibida.

Correção: selecionar dois registros, visualizar imagem integral/zoom, arraste e teclado, datas sempre visíveis; nova assinatura autorizada após erro recuperável, sem persistir URL assinada. Separar agenda atual da data planejada naquele checkpoint.

Aceite: orientação diferente, duas fotos no mesmo dia, imagens indisponíveis, rede lenta, troca do par e navegação entre checkpoints sem mostrar imagem antiga como se fosse a nova.

### A16 · P2 · Tipografia e hierarquia exigem uma revisão sistêmica [C/V/R]

Evidência: `globals.css`, `journey-hub.tsx`, `journey-path.tsx` e formulários. Textos auxiliares de aproximadamente 9–11 px, transparências acumuladas, títulos com entrelinha 0,88 e larguras máximas diferentes. No login público, corpo/labels têm 14 px; subtítulo com cor a 62% de opacidade. Isso é evidência de estilos, não uma medição de contraste de todas as telas.

Correção: escala tipográfica única, texto essencial em 16 px, apoio em 14 px, metadados excepcionalmente em 12 px; títulos 32–40 px com entrelinha próxima de 1,1. Contêiner centralizado, texto de leitura alinhado à esquerda, espaço reservado à fotografia e às ações.

Aceite: 320/390/430/768/1440 px, zoom 200%, teclado aberto e nomes longos sem cortes; medir contraste real sobre transparências e todos os estados.

### A17 · P2 · Design system incompleto e marca dispersa [C]

Evidência: `packages/ui/src/primitives.tsx` contém quatro primitives; campos, estados, ícones e cabeçalhos são repetidos nas telas. Marca/paleta antigas estão em layout, auth, onboarding, CSS, cópia e nome da captura.

Correção: tokens semânticos e componentes por uso real: Field, PasswordField, Alert, EmptyState, PageHeader, StatusBadge, JourneyNode, CheckpointCard, PhotoFrame e barra de ação. Estados de foco, erro, loading, disabled e toque fazem parte do componente.

Aceite: rebrand visível coerente e regressão visual por componente/tela; nenhum renomeio de tabela, pacote, cookie ou segredo necessário apenas para trocar a marca.

### A18 · P2 · Ajustes e privacidade estão atrás da funcionalidade atual [C/V]

Evidência: `account-settings.tsx` ainda fala em fotografias “futuras” e captura a ser disponibilizada. Consentimentos são listados como aceitos; não há fluxo de revogação/exportação visível. A existência de `revokedAt` no banco não implementa a experiência.

Correção: centro de privacidade com escolhas reais, histórico legível e ajuda; explicar efeito de retirar consentimento, exclusão e eventual retenção. Corrigir texto imediatamente quando a feature correspondente for entregue.

Aceite: pessoa entende o que é armazenado e consegue solicitar/realizar operações suportadas sem recorrer a linguagem técnica. Revisão jurídica específica continua pendente.

### A19 · P2 · Rotina registra período, não uso de cada produto [C/R]

Evidência: `RoutineCheckIn` armazena data/período/concluído; `RoutinePanel` oferece manhã/noite. Não há registro granular de creme e sabonetes nem conteúdo de uso aprovado integrado.

Correção: definir com produto se “concluir rotina” é suficiente no próximo slice ou se é preciso ProductUsage. Separar acompanhamento de 30/60/90 dias de duração de tratamento. Orientações e quantidade vêm de conteúdo oficial, nunca de suposição ou da foto.

Aceite: nomenclatura representa o que foi realmente registrado; não dizer “produto aplicado” se só houve check-in genérico.

### A20 · P2 · Gates verdes não cobrem os principais riscos novos [C]

Evidência: `package.json`, `toolkit/check-security.mjs`, `check-architecture.mjs`, `playwright.config.ts`, `tests/e2e/identity-and-journeys.spec.ts`. Acessibilidade executa lint; verificações arquiteturais/segurança são padrões estáticos limitados. E2E existente foca identidade/jornada e desvia da primeira captura; o projeto “mobile” só altera viewport do Desktop Chrome.

Correção: testes de contrato/concorrência de upload, exclusão, calendário, rotina, consentimento; E2E completo e fixtures sintéticas; auditoria automatizada de acessibilidade mais teclado/leitor de tela/câmera reais. Confirmar inicialização do servidor e seletores do E2E após mudanças. Não declarar testes quebrados sem execução.

Aceite: integração obrigatória no CI sem skips inesperados, E2E relevante como status obrigatório, matriz mobile física registrada; não confundir lint com certificação.

### A21 · P2 · Governança do código/documentação pode causar entrega errada [C]

Evidência: raiz lista arquivos como untracked; `work/publish` tem checkout versionado separado. `docs/product/V1_SCOPE.md` ainda classifica rotina/check-in/comparação como planejados; status do harness também precisa refletir os slices atuais.

Correção: definir um checkout canônico antes da próxima publicação e atualizar o inventário real. Não copiar pastas cegamente nem commitar `.env`, caches e artefatos. Não mover/deletar repositórios nesta auditoria.

Aceite: revisão, testes e deploy usam o mesmo commit identificável; documentação distingue implementado, parcial e planejado.

### A22 · P3 · Operação, desempenho, PWA e IA precisam de validação própria [C/R]

Há consultas de histórico/listas sem paginação em rotas de fotos/comparação. Não foram encontrados fluxos implementados de PWA/notifications nas fontes inspecionadas. A IA continua definida conceitualmente em `docs/ai/AI_BOUNDARIES.md`, não integrada.

Próximos incrementos: paginação, miniaturas privadas, orçamento de imagem, correlação de erros com códigos seguros e medição de latência sem PII; revisar headers, limites de abuso, backup/restore e acessos efetivos. Não há medição de Core Web Vitals/latência de produção nesta auditoria.

PWA deve primeiro melhorar instalação/estado de rede; nunca colocar fotos, respostas autenticadas ou URLs assinadas em cache indiscriminado. IA fica fora do caminho obrigatório: texto contextual em checkpoint, versão/fonte/limitações, consentimento aplicável e fallback determinístico. Sem chat dominante, diagnóstico, score clínico ou promessa de IA ilimitada gratuita.

## 4. Nova identidade Pelmorya

### Paleta e papéis

As proporções são direção de composição do conjunto da experiência, não obrigação matemática por tela. A fotografia não recebe filtro de marca e não entra nessa proporção.

| Cor aprovada              | Proporção | Papel recomendado                                             |
| ------------------------- | --------- | ------------------------------------------------------------- |
| Ameixa profunda `#2B1833` | 65%       | Canvas principal, trilha e áreas estruturais                  |
| Marfim `#F4ECDF`          | 15%       | Texto sobre ameixa e superfícies claras de leitura/formulário |
| Violeta `#8066A3`         | 10%       | Capítulos, elementos decorativos e indicadores amplos         |
| Verde elétrico `#A7C957`  | 5%        | Ação principal e conclusão; sem excesso de brilho             |
| Grafite `#18181F`         | 5%        | Texto em superfícies claras/verdes e fundo neutro de foto     |

Tokens propostos: `canvas`, `surface`, `surface-inverse`, `text-primary`, `text-secondary`, `action`, `action-text`, `border`, `focus`, `success`, `warning`, `danger`. Os papéis semânticos de erro/aviso precisam de combinações verificadas, ícone e texto; não forçar uma cor aprovada a transmitir um significado inadequado. Cores adicionais só após revisão explícita, não por substituição cega de `forest`.

Contraste calculado a partir dos hexadecimais sRGB, sem transparência:

| Combinação       | Razão aproximada | Uso                                               |
| ---------------- | ---------------- | ------------------------------------------------- |
| Marfim / ameixa  | 13,98:1          | Texto normal e títulos                            |
| Verde / ameixa   | 8,69:1           | Ação/destaque legível                             |
| Grafite / verde  | 9,36:1           | Texto do botão principal                          |
| Grafite / marfim | 15,06:1          | Texto sobre superfície clara                      |
| Violeta / ameixa | 3,39:1           | Não usar para texto normal pequeno                |
| Marfim / violeta | 4,12:1           | Não usar para texto normal pequeno                |
| Verde / marfim   | 1,61:1           | Não usar para texto ou contorno funcional isolado |

Referência: texto normal exige 4,5:1 e texto grande 3:1 no critério AA de [contraste WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Transparência, estados e fundos reais exigem nova medição. Alvos de 44–48 px são uma meta de conforto do projeto; não são o mínimo universal do [critério WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

### Linguagem visual

- Sofisticada, acolhedora e tátil; ameixa como ambiente, marfim como respiro, verde como sinal de ação.
- Sans legível para operação e dados; serif editorial reservada a poucos títulos. Primeiro ajustar escala/peso/entrelinha das fontes existentes; não instalar fonte/biblioteca sem ganho demonstrado.
- Espaçamento em escala consistente; contêiner central de aproximadamente 480–560 px no fluxo mobile, ampliado apenas quando comparação/histórico se beneficiam. Centralizar a estrutura, não todos os parágrafos.
- Substituir símbolos soltos por conjunto pequeno de ícones coerentes. Evitar painel SaaS com cartões para tudo e excesso de caixas dentro de caixas.
- Microinterações breves, confirmação de ação e foco preservado; respeitar redução de movimento, inclusive skeletons. Sem animação contínua em todos os marcos.
- Foto com fundo neutro, sem filtros, retoque, saturação automática ou diferença artificial entre antes/agora.

## 5. Experiência proposta por área

| Área             | Upgrade proposto                                                                        | Principal critério de uso                                                 |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Entrada/cadastro | Pelmorya, benefício claro, senha visível sob demanda, recuperação e links de documentos | Entrar/criar conta sem dúvida sobre segurança e próximos passos           |
| Primeiro uso     | Introdução breve → região/lado → contexto declarado → primeira foto → ciclo             | Retomável; cada etapa produz algo útil                                    |
| Hoje             | Uma ação prioritária, jornada selecionada e semana de cuidado                           | Estado “por hoje, concluído” real; sem pedir novamente o que já foi feito |
| Jornada          | Caminho por capítulos, marco atual, próximos passos e registros abertos por toque       | Ver posição e destino; não percorrer um formulário gigante                |
| Captura          | Tela dedicada, guia discreto, fechar/trocar/refazer/enviar                              | Poucos toques, foto fiel e envio recuperável                              |
| Checkpoint       | Foto primeiro; data/região; observações; cuidado registrado; próximo passo              | Entender o registro sem falsas análises                                   |
| Rotina           | Ritual diário simples, realização confirmada e edição clara                             | Sem frequência cosmética inventada; desfazer erro de toque                |
| Histórico        | Miniaturas privadas, datas e seleção de registros                                       | Encontrar qualquer marco sem lista textual extensa                        |
| Comparação       | Escolha do par, imagem integral/zoom, controle acessível e ressalvas                    | Comparar a mesma área sem manipulação visual                              |
| Ajustes          | Conta, documentos, escolhas, ajuda e exclusão com estado                                | Controle real dos dados e linguagem atualizada                            |

Navegação proposta: **Hoje · Jornada · Registros · Perfil**. Validar a distinção Jornada/Registros em protótipo; se gerar duplicidade, adotar três destinos. “Nova jornada” passa a ação contextual, não destino principal obrigatório. Preservar acesso a várias jornadas sem criar uma floresta de abas.

### Caminho e gamificação responsável

1. **Começo:** região escolhida e primeira memória. Mostra o que falta, sem recompensar volume de fotos.
2. **Constância:** cuidados previstos na semana e rotina registrada; retomada acolhedora após pausa.
3. **Novo olhar:** foto no intervalo escolhido, com guia consistente e data clara.
4. **Minha trajetória:** comparação e resumo do que foi registrado; convite para revisar/continuar o acompanhamento.

Cada capítulo tem estados: pendente, disponível, atual e concluído, expressos por texto/ícone além de cor. Um marco concluído abre seu conteúdo. O atual recebe um destaque sutil e uma ação concreta (“Registrar cuidado”, “Fotografar agora”), não vários “Continuar agora”.

Conquistas possíveis: primeiro registro, semana com registros, ciclo de acompanhamento concluído. Não associar conquista à pele “melhor”, não ranquear pessoas e não incentivar aplicação/fotografia excessiva. Percentuais só com denominador explícito e dados confiáveis.

IA futura: módulo secundário “Sobre este registro”, com informação verdadeira sobre se houve ou não análise. Até existir provider validado, conteúdo educativo revisado deve ser identificado como orientação, não simular uma leitura da foto. “Acelerar tratamento” não é promessa aceita pelo produto.

## 6. Plano de execução recomendado

| Entrega                  | Escopo                                                                                        | Saída verificável                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 0 · Confiabilidade       | A01–A05, erros de rede, contratos de rotina e calendário                                      | Testes de regressão de dados/fotos; nenhum selo de qualidade fictício       |
| 1 · Fundação Pelmorya    | Marca visível, tokens, tipografia, componentes e estados                                      | Login/cadastro/Hoje como referência; contrastes e mobile aprovados          |
| 2 · Jornada contínua     | Onboarding retomável, próximo passo único, mapa de capítulos e navegação                      | Fluxo completo do primeiro acesso ao cuidado diário                         |
| 3 · Fotografia e memória | Captura dedicada, checkpoints, histórico, seleção/visualização de comparações                 | Câmera física e operações privadas testadas ponta a ponta                   |
| 4 · Prontidão de release | Recuperação de conta, privacidade, acessibilidade, operação, documentação e checkout canônico | CI integrado/E2E, revisão independente e rollout reversível                 |
| 5 · Capacidades futuras  | Conteúdo oficial de produtos, IA contextual e lembretes após decisões próprias                | Avaliação de segurança, custo, consentimento e utilidade; flags desligáveis |

Planejamento visual pode ocorrer durante a entrega 0; não liberar apenas um tema novo sobre fluxos com risco de perda de dados. Evitar refatoração massiva: slices pequenos atravessando domínio, API e UI quando necessário. Extrair regras reais para domínio/aplicação, sem criar camadas vazias.

Rebrand não requer trocar PostgreSQL, ORM ou autenticação. Atualizar marca pública, metadata, mensagens e documentos atuais. Manter identificadores técnicos `@memyra/*` temporariamente é compatível com Pelmorya. Troca de domínio/origins/cookies deve ser operação separada, com compatibilidade e plano de redirecionamento. ADRs históricos preservam seu contexto.

## 7. Critérios de aprovação do upgrade

- Primeiro uso, retorno diário, pausa/retomada, múltiplas jornadas, arquivamento e finalização têm estados definidos.
- Um CTA primário por estado; nenhum “próximo passo” já concluído ou indisponível.
- Conteúdo essencial legível em 320–430 px, teclado não cobre a ação/foco, safe areas respeitadas; desktop centralizado sem alargar textos indefinidamente.
- Teclado, leitor de tela, contraste, zoom e movimento reduzido verificados manualmente e com apoio automatizado.
- Concorrência/retry não duplicam nem apagam fotos; nenhuma URL pública; EXIF/GPS removidos; nenhuma foto usada em analytics ou fixtures.
- Preview corresponde ao arquivo e comparação não altera pixels para sugerir resultado. Dados não avaliados são identificados como tais.
- Datas, períodos e métricas consistentes entre Hoje, Jornada, Checkpoint e Comparação.
- Nenhum carregamento infinito; erros acionáveis, retry seguro e confirmação apenas após persistência.
- Documentos/consentimento/revogação/exclusão coerentes com o que realmente funciona.
- Unitários, integração isolada, E2E crítico, lint, tipos e build aprovados no mesmo commit da entrega; não testar mutações destrutivas em produção.
- Smoke test após deploy e rollback definido. Validar credenciais antigas expostas no histórico por rotação/revogação fora do chat; não copiar segredos para o relatório ou repositório.

## 8. Validação realizada nesta auditoria

| Verificação                                            | Resultado                                             |
| ------------------------------------------------------ | ----------------------------------------------------- |
| Contrato de ambiente, arquitetura e segurança estática | Aprovados dentro do alcance limitado dos scripts      |
| Prisma schema                                          | Válido                                                |
| Lint e check:accessibility                             | Aprovados; este último é lint                         |
| TypeScript                                             | Aprovado                                              |
| Testes Vitest                                          | 42 aprovados; 5 ignorados em 2 arquivos de integração |
| Build Next.js                                          | Aprovado                                              |
| `pnpm verify`                                          | Exit code 0                                           |
| E2E e integração com serviços reais                    | Não executados nesta auditoria                        |
| Telas privadas ao vivo/câmera física                   | Não verificadas nesta auditoria                       |
| Deploy ou alteração funcional                          | Não realizados                                        |

Próximo trabalho recomendado: implementar a entrega 0 e a fundação visual Pelmorya, usando os achados e os critérios acima como backlog. A auditoria não autoriza por si só alterar provedores, executar migrations em produção ou publicar um novo deploy.
