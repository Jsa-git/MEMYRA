# Instalação da Pelmorya

Página pública: `/instalar`. O app instalado abre `/journey`, com a autenticação existente. Login e configurações possuem links para instalar.

## Comportamento

- Chrome/Edge compatíveis: botão usa `beforeinstallprompt` quando o navegador disponibiliza o evento. Aceite mostra solicitação em andamento; `appinstalled` confirma. Cancelamento/erro abre ajuda, sem loops de prompts.
- iPhone/iPad: Safari → Compartilhar → Adicionar à Tela de Início → Abrir como App, quando oferecido → Adicionar.
- Instagram/WhatsApp: orientar abrir em navegador externo. Desktop tem instruções próprias. Sem suporte, o app web permanece utilizável.
- Ícones são vetoriais rasterizados pelo Sharp já instalado; gerados estaticamente, sem acesso a fotografias nem fontes remotas na geração.
- Movimento reduzido respeitado. CTA não promete instalação silenciosa, nem versão das lojas.

## Privacidade e offline

Worker `/sw.js` com escopo `/`, sem caches de dados. Navegação offline recebe aviso genérico e botão de nova tentativa; funcionalidades exigem internet. Não testar exclusão ou enviar fotos reais como teste da PWA.

Ao mudar o worker, manter URL e atualizar conteúdo. Evitar `skipWaiting` automático. Para rollback que remova PWA, publicar primeiro worker substituto seguro na mesma URL, que remova apenas seus próprios caches (hoje não há nenhum) e se desregistre após aprovação. Remover apenas o arquivo não desativa workers já instalados. Não usar limpeza global de caches de outros recursos.

## Verificação

1. `npm run verify` — manifest, PNGs e worker exercitados por testes de unidade/contrato.
2. `npm run test:e2e:public` — fallback manual, aceitar/cancelar/falhar prompt simulado, confirmação, 320 px e fallback de navegação com falha de `fetch` injetada no worker real. A emulação offline da página no Edge instalado não corta a rede do worker; o teste injeta a falha no contexto isolado e verifica resposta 503 do worker, sem acessar contas. Local Windows: `PLAYWRIGHT_CHANNEL=msedge` quando Chromium não estiver instalado.
3. Em HTTPS, conferir manifest, ícones e headers do worker. Sem novo banco nem novas credenciais.
4. Em Android Chrome físico: instalar, abrir ícone, verificar modo standalone, login e retorno do background.
5. Em iPhone Safari físico: adicionar pelo menu, conferir ícone/nome, safe areas, permissão de câmera e retomada.

Os itens 4 e 5 não podem ser certificados por emulação desktop. Não confundir teste de prompt simulado com instalação real. Auditoria geral continua parcial conforme `docs/ux/PELMORYA_IMPLEMENTATION_STATUS.md`.
