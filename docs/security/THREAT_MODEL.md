# Threat model

## Ativos e fronteiras

Ativos: contas, consentimentos, fotos originais/derivadas, metadados, sessões e trilha de auditoria. Fronteiras: navegador↔Next.js, aplicação↔PostgreSQL, cliente/aplicação↔storage, jobs↔providers.

## Ameaças prioritárias e controles

- IDOR/acesso cruzado: autorização por objeto e testes negativos.
- Bucket/URL pública: bloqueio público, policy-as-code futura, assinatura curta e auditoria.
- Upload hostil: allowlist de tipo real, limites, re-encode/scan isolado e nomes opacos.
- Vazamento por EXIF/log/cache: stripping, minimização, `no-store` onde sensível e redaction.
- Roubo de sessão/secrets: cookies seguros, rotação, vault do provedor e menor privilégio.
- Injection/SSRF/supply chain: validação de borda, egress control futuro, lockfile, review e audit.
- IA/prompt injection: conteúdo de usuário é não confiável; ferramentas mínimas, output filtrado e nenhum diagnóstico.
- Exclusão incompleta: job idempotente, tombstone, derivados rastreados e evidência auditável.

## Processo

Reavaliar em auth, upload, compartilhamento, processamento externo e IA. Risco crítico bloqueia release. Logs de auditoria registram ator, ação, recurso opaco, resultado, timestamp e correlationId — nunca conteúdo da foto.
