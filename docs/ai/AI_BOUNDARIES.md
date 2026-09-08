# Limites da IA

## Encaixe na experiência

A IA é contextual e assíncrona: atua após um checkpoint, durante uma comparação ou quando a pessoa pede explicação sobre a rotina. Não existe chat persistente como navegação principal. A aplicação consome um contrato `AIProvider` estruturado e mantém a capacidade desligada até provider, instruções, retenção e avaliação serem aprovados.

O modelo nunca cria o plano de uso. Duração, frequência e intervalo vêm do protocolo oficial ou de uma escolha explícita de acompanhamento feita pela pessoa. Dicas são selecionadas de conteúdo cosmético revisado; não são geradas livremente para uma condição inferida da foto.

## Pode

Explicar rotina; organizar jornada; responder sobre utilização aprovada; incentivar consistência; orientar captura; ajudar a comparar registros e apontar diferenças visuais aparentes com linguagem cautelosa.

## Não pode

Diagnosticar, prescrever medicamento, afirmar doença/condição, substituir profissional, prometer cura, inventar porcentagem clínica ou criar score de “saúde da pele” sem validação formal. Deve recusar inferências médicas e orientar busca profissional quando o usuário pedir avaliação clínica, sem afirmar diagnóstico.

## Porta conceitual

`AIProvider.generate(request, policyContext): AIResult` será uma porta da aplicação. O request minimiza dados e declara finalidade/capacidades; result inclui conteúdo, versão de política/modelo, flags e rastreabilidade segura. Implementações ficam na infraestrutura. Nenhum provider está integrado.

Antes de usar fotos: decisão de produto, privacy/security review, consentimento/fundamento aplicável, contrato com fornecedor, retenção, região, avaliação de segurança, redaction e opt-out. Outputs precisam de avaliação contra diagnósticos, claims, certeza indevida e vazamento.
