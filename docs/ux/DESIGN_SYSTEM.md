# Fundação do design system

Direção: premium, tecnológica, científica, humana e minimalista — “um produto de acompanhamento premium aplicado à pele”. Priorizar fotografia, jornada, tempo, consistência e evolução.

Marca atual: **Pelmorya**. Paleta aprovada: ameixa `#2B1833` (65%), marfim `#F4ECDF` (15%), violeta `#8066A3` (10%), verde elétrico `#A7C957` (5%) e grafite `#18181F` (5%). Proporções orientam a composição, não cada tela. Superfícies derivam da ameixa; fotografia permanece neutra, integral e sem filtro. Evitar dashboard SaaS genérico, estética hospitalar e excesso de cartões.

Princípios: contraste AA, teclado/foco visível, HTML semântico, instruções claras, toque de 44–48 px como meta do projeto, movimento reduzido e estados identificados por texto. Corpo/labels 16 px, apoio 14 px, metadados 12 px. Texto marfim sobre ameixa e grafite sobre verde; não usar marfim sobre violeta para texto pequeno. Fontes e nomes de pacotes técnicos permanecem compatíveis; não renomear tabelas/cookies por estética.

## Linguagem de experiência V1

A metáfora principal é a **Trilha da Memória**: um caminho vertical que torna visíveis o ponto atual, os marcos concluídos, o próximo cuidado e os passos futuros. A progressão usa consistência, conclusão de ciclos e checkpoints; nunca usa score clínico, ranking, culpa ou promessa de resultado.

A viewport de referência é 390 px, com verificação adicional em 320 px. Conteúdo centralizado até 576 px, texto de leitura alinhado à esquerda e navegação inferior. Cada tela prioriza uma ação. Caminho com marcos alternados, estados explícitos e links para conteúdo real; conquistas representam registros, nunca resultado clínico.

Movimento é breve e funcional: o marco atual pode respirar suavemente e conclusões podem receber confirmação discreta. Toda animação deve ser removida quando `prefers-reduced-motion` estiver ativo.

## Implementação em andamento

A migração mantém aliases `forest`, `sand` e `mineral` para compatibilidade dos componentes existentes; seus valores são da nova família ameixa. Novos elementos usam `plum`, `violet`, `accent`, `surface`, `ivory` e `graphite`. Consolidação completa de primitives e regressão visual privada continuam pendentes. Ver `PELMORYA_IMPLEMENTATION_STATUS.md`; não confundir prévia visual com aprovação de release.
