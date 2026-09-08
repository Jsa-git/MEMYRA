# Create Journey — vertical slice 01

## Resultado

Uma pessoa autenticada inicia a jornada REEDUCA, escolhe região/lado, contexto percebido, tempo aproximado e objetivo cosmético, revisa os dados, cria a jornada no PostgreSQL, reabre, edita, arquiva e reativa o acompanhamento.

## Escopo

Inclui UI mobile-first, autenticação, consentimentos essenciais versionados, domínio, validação, casos de uso, repository Prisma, edição e arquivamento. Não inclui fotos, rotina, check-in, IA, analytics ou texto médico livre.

## Vocabulário

Contextos: marca pós-acne; marca após machucado; alteração de tonalidade; marca pós-inflamatória; outra; não sei informar. Tempo é uma faixa percebida, não data clínica. Objetivos descrevem acompanhamento, consistência, uniformidade percebida ou registro da trajetória.

## Critérios de aceite

- Campos e combinações inválidas são rejeitados no cliente e no servidor.
- Identidade, IDs, status e timestamps são definidos no servidor.
- Payload com campos extras, inclusive `userId`, é rejeitado.
- Criação de Journey e SkinArea é atômica.
- Reabertura sempre consulta ID e owner; recurso ausente ou de outro owner resulta em 404 uniforme.
- Refresh mantém dados persistidos.
- Em produção, o ator fictício não pode ser habilitado.
- Nenhuma linguagem sugere diagnóstico, cura ou eficácia garantida.
- Edição e status sempre exigem ownership e preservam a data inicial.
- Cadastro exige aceite explícito dos termos e da política de privacidade.
- Exclusão confirmada remove a conta e seus dados relacionais por cascade.
