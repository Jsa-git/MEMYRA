# Pipeline de fotografias

## Fluxo implementado

1. **Capture**: guia região, lado, orientação, distância e luz.
2. **Validation**: JPEG/PNG/WebP, até 10 MB, assinatura do arquivo, dimensões e limite de pixels.
3. **Metadata**: o servidor decodifica, autorrotaciona e regrava JPEG com `sharp`; EXIF e GPS não seguem para o objeto privado.
4. **Upload**: somente após autenticação, ownership e consentimento `PHOTO_PROCESSING` versionado.
5. **Storage**: adapter Supabase usa chave server-only e bucket `skin-photos` privado; nenhuma chave ou URL assinada é persistida.
6. **Access**: URL assinada de 60 segundos, emitida somente após autorização por objeto e com `no-store`.
7. **Comparison**: ainda não implementada; registros permanecem ligados à mesma `SkinArea`.
8. **Deletion**: remove o objeto antes do registro; exclusão de conta limpa objetos antes do cascade relacional.

O bucket e as credenciais são configuração operacional. Se ausentes, upload falha fechado com `PHOTO_STORAGE_NOT_CONFIGURED`.

## PhotoRecord

`id`, `journeyId`, `skinAreaId`, `capturedAt`, `storageKey`, `width`, `height`, `orientation`, `framing`, `distance`, `lighting`, `qualityStatus`, `processingStatus`, `createdAt`. Não há device fingerprint, EXIF ou GPS. Não persistir binário no banco nem URL pública; `storageKey` não é URL.

Estados devem ser explícitos e extensíveis. Análise avançada não é requisito atual; futuros processors entram por portas assíncronas e não alteram o registro original.
