# O que muda quando IA generativa encontra dinheiro de verdade

Existe uma diferença enorme entre um assistente de IA que erra sobre a capital de um país e um assistente de IA que erra sobre o valor de uma parcela, o imposto de uma venda ou a garantia de um produto. No mercado financeiro e comercial, o custo de um erro de IA não é constrangimento — é dinheiro, é confiança do cliente, é risco regulatório. Este texto é sobre o que aprendi construindo dois projetos com essa característica em comum: um caderno de estudos sobre finanças pessoais e um assistente virtual comercial com componente fiscal e financeiro.

## A régua muda quando o assunto é dinheiro

Nos dois projetos, a mesma pergunta apareceu de formas diferentes: **até onde a IA pode "opinar" sobre um assunto financeiro sem se tornar um risco?**

A resposta prática foi consistente nos dois casos: a IA pode **explicar conceitos** com segurança (o que é ICMS-ST, o que é reserva de emergência, como funciona marcação a mercado), mas não pode **decidir por alguém** em uma situação financeira específica (qual alíquota exata aplicar, quanto investir, se uma operação está fiscalmente correta). Todo conteúdo fiscal do assistente comercial carrega um aviso fixo: "conteúdo educacional e organizacional, não constitui orientação fiscal definitiva". Essa frase não é só uma formalidade jurídica — é uma linha de design que impede o assistente de simular uma autoridade que ele não tem.

## Um exemplo concreto: impostos não são "sim ou não"

Uma das perguntas mais interessantes que testamos foi: "como lançar um pedido para fora do estado sem gerar imposto duplicado para uma revenda?" A resposta ingênua de uma IA mal orientada seria tentar dar um passo a passo definitivo. A resposta correta é mais sutil: explicar que o objetivo não é "não pagar imposto", e sim entender que o ICMS de toda a cadeia já pode ter sido recolhido antecipadamente — e que a validação final depende de três fatores específicos (CFOP correto, cadastro do cliente, enquadramento no convênio interestadual) que precisam ser confirmados por um profissional do setor fiscal.

Esse é o tipo de nuance que separa um assistente de IA financeiro responsável de um que "parece" ajudar, mas na prática empurra risco para quem confiou na resposta.

## Cibersegurança e IA financeira são a mesma conversa

O módulo de cibersegurança de qualquer trilha de dados e IA costuma vir separado do módulo de IA generativa, mas no mercado financeiro essas duas coisas são, na prática, inseparáveis. Um assistente de IA que responde sobre limite de crédito, condição de pagamento ou dado de cliente está, por definição, lidando com informação sensível. Isso significa que toda decisão de arquitetura de IA nesse contexto é também uma decisão de segurança: onde os dados moram, quem pode consultá-los, e o que a IA tem permissão de revelar.

No assistente comercial que desenvolvi, essa fronteira apareceu de forma bem concreta: dados de cliente e de produto usados na demonstração são inteiramente fictícios, propositalmente, para que o projeto pudesse existir como material de portfólio sem expor informação real de negócio. Isso não é uma limitação do projeto — é a mesma decisão que qualquer instituição financeira precisa tomar antes de colocar um assistente de IA na frente de dado real: **separar ambiente de demonstração de ambiente de produção, com regras de acesso diferentes para cada um**.

## O assistente perfeito para o mercado financeiro não é o mais fluente — é o mais confiável

Um erro fácil de cometer, especialmente depois de ver o quanto a IA generativa consegue soar natural, é confundir fluência com confiabilidade. Um assistente financeiro bem-feito não é aquele que nunca hesita — é aquele que hesita exatamente quando deveria. Nos testes do assistente comercial, isso virou até um número concreto: em um conjunto de 19 perguntas de teste, o assistente recusou corretamente 100% das perguntas fora do seu escopo de conhecimento, em vez de arriscar uma resposta inventada.

Esse número importa mais do que qualquer resposta brilhante que o assistente tenha dado. No mercado financeiro, o valor de uma IA não está em quantas perguntas ela responde — está em quão bem ela reconhece as perguntas que não deveria responder sozinha.

## Fechando o ciclo: dados, IA e segurança como uma coisa só

Depois desses dois projetos, fica mais claro por que um bootcamp de IA generativa, dados e cibersegurança trata esses três temas como uma trilha única, e não como três cursos separados. Um assistente de IA para o mercado financeiro só é bom se a base de dados por trás dele for confiável, só é seguro se a arquitetura tratar informação sensível com cuidado, e só é responsável se souber, de forma explícita, onde termina sua competência e começa a de um profissional humano.

Não é sobre construir a IA mais impressionante. É sobre construir a IA em que alguém, de fato, pode confiar o próprio dinheiro.
