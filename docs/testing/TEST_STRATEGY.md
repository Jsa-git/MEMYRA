# Estratégia de testes

Pirâmide: unitários para invariantes do domínio; integração para PostgreSQL, storage, auth e API; E2E apenas para fluxos fundamentais. Testes devem observar comportamento e contratos, não implementação.

Identity + Journey possui E2E Playwright que cadastra, valida o empty state, cria e retoma uma jornada, recarrega, encerra e recupera a sessão, além de negar acesso cruzado por página e API. O mesmo cenário roda em desktop e 390 px. Fluxos críticos futuros: capture photo, upload, routine, check-in, comparison e delete data. Cada um inclui caminho feliz, autorização, falha recuperável e privacidade. Upload/exclusão exigem testes negativos de acesso cruzado.

PR roda unit/integration; E2E tem workflow separado com PostgreSQL efêmero, migration, seed sintético e Chromium. Fixtures nunca contêm dados reais. Flaky test é defeito: corrigir ou isolar com responsável e prazo, nunca apenas repetir indefinidamente.
