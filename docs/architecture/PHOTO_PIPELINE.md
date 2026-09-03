# Pipeline de fotografias

## Fluxo futuro

1. **Capture**: guia região, lado, orientação, distância e luz.
2. **Validation**: formato, tamanho, dimensões e qualidade mínima no cliente/servidor.
3. **Metadata**: lista permitida e minimizada; remover EXIF desnecessário e todo GPS.
4. **Upload**: autorização por usuário/objeto, chave opaca e upload direto assinado curto.
5. **Storage**: bucket privado, criptografia, bloqueio de acesso público e lifecycle.
6. **Processing**: fila/idempotência, derivados privados, status explícito e falha recuperável.
7. **Comparison**: apenas registros autorizados da mesma região, com contexto de captura.
8. **Deletion**: revogar acesso, remover originais/derivados e auditar conclusão/retenção legal.

## PhotoRecord conceitual

`id`, `journeyId`, `skinAreaId`, `capturedAt`, `storageKey`, `width`, `height`, device metadata mínimo, `orientation`, capture guidance metadata, `qualityStatus`, `processingStatus`. Não persistir binário no banco nem URL pública; `storageKey` não é URL. Nunca armazenar GPS.

Estados devem ser explícitos e extensíveis. Análise avançada não é requisito atual; futuros processors entram por portas assíncronas e não alteram o registro original.
