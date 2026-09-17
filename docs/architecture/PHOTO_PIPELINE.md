# Pipeline de fotografias

## Fluxo implementado

1. **Capture**: guia região, lado, orientação, distância e luz.
2. **Validation**: JPEG/PNG/WebP, até 4.000.000 bytes enviados, assinatura, decodificação, dimensões e limite de pixels. O cliente aceita arquivos de até 20 MB para preparação local, limita o maior lado a 1.600 px e regrava JPEG antes do upload, sem filtros. Multipart deve permanecer abaixo do limite operacional da função.
3. **Metadata**: o servidor decodifica, autorrotaciona e regrava JPEG com `sharp`; EXIF e GPS não seguem para o objeto privado.
4. **Upload**: somente após autenticação, ownership e consentimento `PHOTO_PROCESSING` versionado.
5. **Storage**: adapter Supabase usa credencial server-only e bucket `skin-photos` privado. A `storageKey` opaca é persistida; URL assinada e credenciais não são persistidas no registro. A chave de objeto é um UUID gerado pelo servidor por tentativa, nunca o `uploadId` do cliente.
6. **Access**: URL assinada de 60 segundos, emitida somente após autorização por objeto e com `no-store`.
7. **Comparison**: seleção de dois registros autorizados da mesma jornada, com primeiro/último como padrão. Imagens integrais e sem alinhamento automático, por URLs de 60 segundos mantidas em memória. O usuário pode solicitar nova assinatura em caso de erro. Nenhuma derivação pública é criada.
8. **Deletion**: remove o objeto antes do registro; exclusão de conta limpa objetos antes do cascade relacional.

O bucket e as credenciais são configuração operacional. Se ausentes, upload falha fechado com `PHOTO_STORAGE_NOT_CONFIGURED`.

## PhotoRecord

`id`, `journeyId`, `skinAreaId`, `capturedAt`, `storageKey`, `width`, `height`, `orientation`, `framing`, `distance`, `lighting`, `qualityStatus`, `processingStatus`, `createdAt`. Não há device fingerprint, EXIF ou GPS. Não persistir binário no banco nem URL pública; `storageKey` não é URL.

Estados devem ser explícitos e extensíveis. Análise avançada não é requisito atual; futuros processors entram por portas assíncronas e não alteram o registro original.

## Revisão Pelmorya — 16/09/2026

- `ACCEPTED` significa arquivo validado, não qualidade da captura ou comparabilidade. Novos registros persistem `NOT_ASSESSED` para iluminação/enquadramento, independentemente dos valores enviados. Valores antigos continuam legíveis, sem selo de análise.
- O contrato aceita `CENTERED`/`EVEN` para compatibilidade e `NOT_ASSESSED` para clientes novos. Nenhuma inferência de imagem foi adicionada.
- Retries preservam o `uploadId`. A unicidade no banco escolhe o vencedor; a tentativa perdedora só remove seu próprio objeto. Commit com resposta perdida é reconciliado antes de limpar. Rejeições definitivas de unicidade/FK são diferenciadas de resultado desconhecido.
- Resultado ambíguo sem reconciliação conserva o objeto para evitar perda. Um reconciliador de objetos órfãos e um ciclo durável de exclusão continuam PENDENTES; não declarar esta parte pronta para produção.
- Importação pede a data da foto explicitamente; `File.lastModified` deixou de representar captura. Janela aceita permanece sete dias e até cinco minutos de tolerância futura. A origem/precisão da data ainda não tem campo próprio no banco.
- O backend continua autorizado por ator/jornada/consentimento. Timeout não prova falha de gravação. Câmera deve ser validada em Safari iOS/Chrome Android físicos antes de release.
