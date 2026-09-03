# Autenticação local e por ambiente

## Configuração

Defina `DATABASE_URL`, `BETTER_AUTH_URL` e `BETTER_AUTH_SECRET`. O secret deve ser aleatório, ter pelo menos 32 caracteres e ser diferente por ambiente. Nunca use o valor de exemplo fora do desenvolvimento.

Local usa HTTP e cookie HttpOnly/SameSite Lax; production requer HTTPS e cookie Secure. `BETTER_AUTH_URL` e origens confiáveis devem apontar para a origem exata da aplicação. Não habilite cookies entre subdomínios sem nova revisão.

## Operação

Aplicar migrations antes do deploy e fazer smoke test de cadastro, login, rota protegida e logout. Não registrar payloads de credenciais, e-mail, cookie, token ou sessão. Rotação do secret e invalidação coordenada de sessões exigem runbook específico antes da produção.

Verificação e recuperação por e-mail não estão habilitadas porque ainda não existe provider de entrega aprovado. Rate limiting de cadastro/login é obrigatório antes da abertura pública.
