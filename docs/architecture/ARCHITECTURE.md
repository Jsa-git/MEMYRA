# Arquitetura

## Forma

Monólito modular TypeScript implantável inicialmente no Vercel. Next.js é a camada de apresentação/composição; regras permanecem independentes do framework. PostgreSQL será a fonte transacional e storage S3-compatible privado guardará fotos.

## Boundaries de domínio

- **Identity**: autenticação, credenciais e provedores; **User**: perfil mínimo.
- **Journey**: ciclo de acompanhamento; **SkinArea**: região e lado padronizados.
- **PhotoRecord**: referência privada e metadados; **Routine** e **ProductUsage**: plano e adesão.
- **CheckIn**: registro periódico; **Progress**: linha do tempo e comparação não clínica.
- **Consent**: versão/finalidade/evidência; **Notification**: preferências e entrega.
- **AIAdvisor**: porta segura para orientação futura, sem diagnóstico.

Identity, User, Journey, SkinArea e a fundação técnica de Consent estão implementados. Identity usa Better Auth somente na infraestrutura/composição Next.js; aplicação e domínio recebem um `ActorContext` mínimo. Os demais continuam apenas definidos.

## Camadas e dependências

Use `domain` para invariantes puras; `application` para casos de uso e portas; `infrastructure` para PostgreSQL/storage/providers; `presentation` para HTTP/UI. Só separe quando existir comportamento real. Apresentação depende da aplicação; aplicação do domínio; infraestrutura implementa portas. Módulos interagem por contratos públicos, não por tabelas internas.

## Dados, flags e operação

Feature flags são configuração tipada, desligadas por padrão, avaliadas no servidor para capacidades sensíveis e removidas após estabilização. Logs JSON terão timestamp, nível, evento, correlationId e identificadores opacos; nunca foto/PII/token. Error tracking deve sanitizar payloads. Métricas agregadas e trilha de auditoria cobrem operações sensíveis.

## Decisões abertas

Verificação/recuperação de e-mail, PostgreSQL gerenciado e storage; modelo regional; retenção; processamento de imagens; estratégia PWA/offline; observabilidade; provedor de flags e IA. Cada escolha material exige ADR.
