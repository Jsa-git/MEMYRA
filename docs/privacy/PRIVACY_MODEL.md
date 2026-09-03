# Modelo de privacidade

Fotos de pele e dados associados são dados pessoais potencialmente sensíveis pelo contexto. Aplicam-se finalidade, necessidade, transparência, segurança, prevenção, não discriminação e prestação de contas da LGPD; validação jurídica específica permanece necessária.

## Controles

- Private by default, menor privilégio e autorização por recurso.
- Consentimento quando aplicável registra finalidade, versão, instante e revogação; base legal não deve ser presumida por código.
- Coleta mínima: sem GPS; device metadata reduzido; sem dados em logs/analytics.
- TLS em trânsito e criptografia gerenciada em repouso; URLs assinadas curtas e não persistidas.
- Retenção definida por categoria; exclusão de foto/conta inclui derivados, filas, backups conforme política e comprovante operacional.
- Exportação/acesso/correção/oposição devem ser projetáveis; terceiros recebem somente o necessário e nunca silenciosamente.

## Revisão

Qualquer nova finalidade, terceiro, biometria/análise, compartilhamento, telemetria ou retenção exige avaliação de privacidade e atualização deste documento/ADR. Incidentes seguem runbook próprio antes do lançamento.

## Identidade e consentimento operacional

Identity coleta e-mail e credencial protegida pelo provedor de autenticação; o nome técnico permanece genérico enquanto não houver finalidade de produto para coletá-lo. Sessões podem registrar IP e user-agent pelo provider e sua necessidade/retenção deve ser revisada antes de produção. Consentimentos são evidências históricas versionadas, nunca um booleano simples no usuário. `PHOTO_PROCESSING` não é solicitado nesta fase.
