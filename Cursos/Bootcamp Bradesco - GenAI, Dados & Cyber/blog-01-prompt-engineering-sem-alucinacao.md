# O prompt errado custa mais caro do que parece: lições reais de engenharia de prompts

Toda vez que alguém me pergunta "o que é engenharia de prompts", eu resisto à tentação de responder com a definição de dicionário. Prefiro contar uma história pequena e real: a de uma pergunta que fiz duas vezes para o mesmo assistente de IA, com quase as mesmas palavras, e recebi duas respostas de qualidade completamente diferentes.

## A primeira vez que o prompt "genérico" me traiu

Construindo um caderno de estudos sobre finanças pessoais no NotebookLM, minha primeira tentativa de pergunta foi simples:

> "O que é educação financeira?"

A resposta veio correta, mas genérica — quase um resumo de dicionário, sem nenhuma conexão real com os documentos que eu tinha carregado. O modelo tinha "conhecimento geral" suficiente para responder sem nem precisar olhar para minhas fontes.

Troquei o prompt para:

> "Segundo o Caderno de Educação Financeira do Banco Central, qual é o objetivo central da gestão de finanças pessoais? Cite a fonte e a seção do documento."

A diferença não foi sutil. A segunda resposta veio ancorada exatamente no material que eu queria estudar, com referência à seção específica. Essa é a primeira lição prática de prompt engineering que vale mais que qualquer teoria: **um modelo de IA generativa, por padrão, prefere responder com o que já sabe a admitir que não sabe**. Cabe a quem escreve o prompt fechar essa porta.

## Grounding: a palavra que devia estar em todo prompt de negócio

Esse princípio — restringir a resposta a um contexto específico, em vez de deixar o modelo "completar" com conhecimento geral — tem nome técnico: *grounding*. E ele não é só um truque de estudo. Usei exatamente essa lógica ao construir um assistente virtual comercial (chamado Embrix) para responder perguntas de produtos, garantia, fiscal e financeiro de uma empresa real.

O prompt de sistema do Embrix tem uma frase que parece óbvia, mas muda tudo:

> "Responda SOMENTE com base no CONTEXTO fornecido. Não invente informações que não estejam no contexto. Se o contexto não cobrir a pergunta, diga isso claramente."

Sem essa instrução, testamos uma versão mais "solta" do prompt — e o resultado foi um modelo que tentava "ajudar demais", preenchendo lacunas com suposições plausíveis, mas não verificadas. Em temas neutros isso é inofensivo. Em temas fiscais ou de garantia de produto, uma suposição errada vira um problema real de negócio.

## A cicatriz que ensina mais que o acerto

Um detalhe que ninguém conta quando fala de IA: as falhas ensinam mais do que os sucessos. Durante os testes do Embrix, uma pergunta simples — "como abro uma garantia?" — não foi reconhecida pelo mecanismo de busca, enquanto a versão mais longa "como abrir uma garantia de uma peça com defeito?" funcionou perfeitamente. A causa era boba: o sistema comparava palavras exatas, e "abro" não é a mesma palavra que "abrir" para uma busca literal.

Essa falha, documentada e corrigida, é mais valiosa para quem está aprendendo do que qualquer exemplo de prompt perfeito. Ela mostra o limite real entre dois tipos de IA: uma busca por palavras-chave (rígida, previsível, barata) e uma busca semântica (mais flexível, mas que exige mais infraestrutura). Saber escolher entre as duas — e saber por que uma falhou — é competência de quem entende o que está construindo, não só de quem sabe escrever um prompt bonito.

## Três práticas que sobreviveram a todos os testes

Depois de dezenas de iterações entre os dois projetos, três práticas de prompt se mostraram consistentemente melhores que as alternativas:

1. **Restringir explicitamente a fonte.** "Baseando-se estritamente em X" produz respostas rastreáveis; "me explique X" produz respostas genéricas.
2. **Pedir formato estruturado quando a resposta tem múltiplas partes.** Tabelas comparativas ("Fonte | Definição | Diferença") reduzem a chance de o modelo misturar informações de contextos diferentes.
3. **Instruir explicitamente a recusa.** "Se a fonte não mencionar isso, diga que não sabe" é a linha mais importante contra alucinação — e a mais fácil de esquecer de escrever.

## Prompt engineering não é sobre "conversar melhor" com a IA

O erro mais comum de quem está começando é tratar prompt engineering como um exercício de escrita criativa. Na prática, é um exercício de **engenharia de restrições**: definir com precisão o que o modelo pode e não pode fazer, testar onde essas restrições falham, e documentar a falha para não repeti-la. Isso vale tanto para um estudante organizando um caderno de revisão quanto para uma empresa colocando um assistente de IA na frente de clientes reais.

A régua não é "a resposta soou inteligente". A régua é: **quando o modelo não sabe, ele admite — e quando sabe, ele cita de onde tirou**.
