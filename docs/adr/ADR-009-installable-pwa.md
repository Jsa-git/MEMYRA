# ADR-009 — Pelmorya instalável, sem persistência offline de dados

## Context

O usuário solicitou uma versão para a tela inicial do celular e uma página de instalação elegante, reutilizando a aplicação existente. Não solicitou distribuição em lojas nem um novo backend.

## Decision

Usar PWA no mesmo domínio Next.js/Vercel: manifest com identidade estável `/`, início `/journey`, display standalone, ícones PNG 180/192/512 e suporte Apple. `/instalar` captura o prompt nativo quando disponível; sem suporte oferece passos explícitos para Safari, Chrome e Edge. Aceitar o prompt não equivale a instalação concluída: somente `appinstalled` ou modo standalone confirma o estado detectável.

Service worker próprio mínimo: rede para navegações, sem CacheStorage, IndexedDB, fila offline, analytics ou captura em background. Quando a rede falha, responde somente HTML genérico embutido com status 503. APIs, imagens, requisições RSC, métodos não GET e outras origens não são interceptados. O worker não guarda fotos, PII, tokens ou respostas privadas. Cache HTTP normal e memória do navegador não são apagados por essa política; não prometer apagamento de dados do dispositivo.

Não forçar ativação de atualizações nem recarregar durante captura. Worker servido sem cache; atualizações assumem controle após fechar clientes da versão anterior. Nenhuma migration, dependência nova, alteração de conta, bucket ou permissão de câmera.

## Alternatives

- App nativo/Capacitor: exigiria empacotamento, distribuição e manutenção adicional sem necessidade para o pedido inicial.
- Link falso de download/APK: não instala em iOS e não corresponde ao produto entregue.
- Biblioteca genérica de cache offline: desnecessária e amplia riscos sobre fotografias privadas.

## Consequences

- Não é APK/IPA nem publicação na App Store/Play Store. Instalação depende de HTTPS, suporte e confirmação do usuário.
- iOS requer ação no menu Compartilhar. Webviews e navegação privada podem não oferecer instalação. Não há garantia de prompt em todo Android.
- A pessoa pode precisar entrar novamente no app instalado. As jornadas permanecem no mesmo backend; instalação não cria uma conta nova.
- Internet obrigatória para autenticação, jornada, fotos e rotina. Sem push, sincronização offline ou diagnóstico.
- Desinstalar o ícone não exclui a conta ou fotos do servidor.

## Status

Accepted para implementação em 17/09/2026. Validação real de instalação em iPhone/Android físico permanece necessária; eventos simulados não provam instalação no sistema operacional.

## Referências

- [Next.js PWA](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [MDN: beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)
- [Apple: adicionar app à tela inicial](https://support.apple.com/en-ca/guide/iphone/iphea86e5236/ios)
