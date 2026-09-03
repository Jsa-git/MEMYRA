# Observabilidade

Começar pequeno: logs estruturados JSON com `timestamp`, `level`, `event`, `correlationId` e IDs opacos; propagação de correlation ID em HTTP/jobs; error tracking com scrubbing; métricas agregadas de disponibilidade, latência, erros e jobs; auditoria separada para consentimento, acesso e exclusão de fotos.

Não registrar corpo de requisição, PII, imagens, storage keys completas, URLs assinadas, cookies, tokens ou prompts com conteúdo pessoal. Fornecedor e retenção permanecem TODO antes de produção.
