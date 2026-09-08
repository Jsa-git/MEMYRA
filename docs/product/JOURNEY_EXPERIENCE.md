# Experiência da jornada MEMYRA

Status: aprovado para implementação incremental.

## Objetivo

Conduzir a pessoa por um caminho mobile-first simples: entender a proposta, criar uma jornada, registrar a mesma região, seguir a rotina oficial, fazer check-ins e comparar checkpoints ao longo do tempo.

## Caminho principal

1. Conta e consentimentos essenciais.
2. Onboarding curto sobre rotina, fotografia padronizada e evolução.
3. Criação da primeira jornada.
4. Câmera guiada dentro do app; captura antecede o envio.
5. Checkpoint com fotografia privada, contexto de captura e próxima data sugerida pelo protocolo cadastrado.
6. Rotina e registro de uso.
7. Novo checkpoint e comparação visual cautelosa.

## IA no fluxo

A IA aparece como assistência contextual, não como conversa permanente. Os pontos de entrada são: orientação de captura, resumo após checkpoint, comparação entre dois registros e explicação da rotina. A saída deve ser estruturada em observações aparentes, qualidade da captura, consist cosmetic-safe e próximos passos já aprovados.

A IA não identifica condição, diagnostica, prescreve, promete resultado, determina eficácia clínica ou cria protocolo. Dicas específicas só podem ser selecionadas de uma biblioteca cosmética revisada. O plano de uso vem do cadastro oficial do produto, nunca do modelo.

## Checkpoint

Cada checkpoint possui fotografia, data, região, orientação, iluminação, distância, qualidade, estado da análise e vínculo cronológico. A página individual mostra esses dados, o resumo seguro, a rotina vigente e a próxima comparação. A URL da fotografia é temporária e nunca persistida.

## Critérios de aceite

- Mobile é a viewport primária; conteúdo centralizado e ação principal alcançável com uma mão.
- Um toque em enviar produz no máximo um `PhotoRecord`.
- Câmera abre no fluxo e a pessoa revisa a captura antes do envio.
- Upload original perde EXIF/GPS antes do storage privado.
- Checkpoints de outro usuário retornam 404 uniforme.
- Sem provider/protocolo aprovado, a UI mostra estado pendente claro e não inventa análise ou tratamento.

## Trilha da Memória

A home responde primeiro “qual é o cuidado de hoje?” e apresenta uma única ação recomendada. A página da jornada organiza a trajetória como uma trilha com os estados concluído, atual, próximo e bloqueado. Os marcos iniciais são início, primeira fotografia, ciclo de cuidado, check-in do dia, próxima fotografia e comparação.

Gamificação é adulta e não competitiva: consistência recente, progresso do ciclo, memórias registradas e celebrações discretas. Não existem moedas, ranking, punição por quebra de sequência ou indicadores de saúde da pele.
