# Instruções para agentes — MEMYRA

## Missão e limites

MEMYRA é uma marca premium de cosméticos. O software apoia adesão, consistência, registro e percepção de evolução por rotina, fotografia padronizada e linha do tempo. Ele não é produto médico.

**Nunca invente requisitos médicos ou claims do produto.**

**Nunca implemente diagnóstico médico sem uma decisão formal do projeto.**

**Nunca exponha imagens privadas através de URLs públicas.**

## Navegação e arquitetura

- `apps/web`: apresentação Next.js; não contém regra de domínio.
- `packages/domain`: regras puras e contratos do negócio.
- `packages/validation`: validação de fronteira/DTOs.
- `packages/database`: adapters PostgreSQL e migrations futuras.
- `packages/ui`: primitives acessíveis e tokens.
- `packages/config` e `packages/testing`: configuração tipada e utilitários de teste.
- `docs`: fonte das decisões; `skills`, `agents` e `superpowers`: instruções/workflows reutilizáveis.

O sistema é um monólito modular. Dependências apontam apresentação → aplicação → domínio; infraestrutura implementa portas e não vaza tipos de framework. Não crie camadas vazias ou abstrações especulativas.

## Forma de trabalhar

Antes de editar: leia o contexto, localize o boundary, declare escopo e critérios de aceite. Altere somente os arquivos necessários. É proibido modificar grandes áreas sem necessidade ou “resolver” problemas não relacionados. Prefira mudanças pequenas, reversíveis e verificáveis; preserve trabalho existente.

Depois de editar: rode testes relevantes e `npm run verify`; atualize documentação quando comportamento, contrato, operação, risco ou decisão mudar. Nunca declare pronto com falhas conhecidas.

## Segurança, privacidade e dados

Colete o mínimo; não registre PII, imagens, prompts sensíveis, tokens ou URLs assinadas em logs. Imagens usam bucket privado, chaves opacas, autorização por objeto e URLs assinadas temporárias. Não envie imagem a terceiro sem finalidade documentada, base/consentimento aplicável e revisão. GPS é proibido. Exclusão, retenção e consentimento devem ser rastreáveis. Secrets ficam no provedor e nunca no Git.

IA pode educar, organizar, orientar captura e descrever diferenças aparentes com cautela. Não diagnostica, prescreve, promete cura, afirma doença ou inventa percentual/score clínico. Escale qualquer ambiguidade médica, legal ou de claim.

## Contratos e banco

APIs devem ter schema explícito, validação na borda, erros estáveis, autorização e testes de contrato. Quebra exige versão/plano e documentação. Migrations são aditivas primeiro, pequenas, revisadas, compatíveis com deploy anterior, testadas em cópia não sensível e acompanhadas de rollback/roll-forward. Nunca edite migration já aplicada.

## Comandos e definição de pronto

Use `npm run lint`, `typecheck`, `test`, `test:e2e`, `build`, `check:architecture`, `check:security` e `verify`. Pronto significa: aceite atendido; lint, tipos, testes e build verdes; contratos e docs coerentes; migration segura; revisão de privacidade para dados/fotos; nenhuma imagem pública; revisão independente quando relevante.
