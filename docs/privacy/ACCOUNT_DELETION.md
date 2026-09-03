# Design de exclusão de conta

## Objetivo

Permitir futuramente a exclusão verificável de uma conta e de seus dados relacionados sem deixar imagens ou derivados órfãos. Esta fase documenta o fluxo; não expõe endpoint de exclusão.

## Fluxo planejado

1. Exigir sessão recente e reconfirmação apropriada.
2. Registrar solicitação auditável com identificadores opacos e sem conteúdo sensível.
3. Bloquear novas gravações da conta durante a operação.
4. Excluir objetos e derivados no storage privado, filas e caches.
5. Em transação, excluir o usuário e os registros relacionais dependentes: jornadas, áreas, consentimentos, sessões e contas de autenticação.
6. Registrar conclusão fora dos dados apagados, respeitando política de retenção.
7. Tratar backups por expiração documentada e impedir restauração parcial da conta.

As cascatas atuais cobrem apenas PostgreSQL. A exclusão nativa do Better Auth permanece desabilitada até existir o orquestrador que também cubra storage e auditoria.

## Decisões pendentes

Prazo operacional, retenção de evidências, tratamento de backups, canal de confirmação e base jurídica precisam de validação antes de disponibilizar o recurso.
