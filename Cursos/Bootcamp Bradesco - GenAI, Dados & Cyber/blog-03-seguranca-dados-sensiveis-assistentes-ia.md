# A decisão de segurança mais importante do meu projeto de IA foi não usar dados reais

Um dos momentos mais reveladores ao construir um assistente virtual comercial com IA não foi sobre código. Foi sobre uma pergunta simples que quase me levou a tomar uma decisão errada: "por que não usar os dados reais de clientes da empresa para deixar a demonstração mais realista?"

A resposta curta é: porque um projeto de portfólio público não é o lugar certo para dado sensível de negócio, mesmo com boa intenção. A resposta longa é o que este texto tenta explicar — e é, na prática, um resumo dos fundamentos de cibersegurança que todo projeto de IA aplicada deveria levar a sério desde o design.

## Dado de terceiro não é seu para expor

O primeiro princípio, básico e frequentemente esquecido, é que nomes de clientes, CNPJs e condições comerciais são dados de terceiros. Publicar isso em um repositório público — mesmo em um projeto educacional, mesmo sem más intenções — cria exposição real sob legislações de proteção de dados como a LGPD. Não importa que a intenção seja demonstrar competência técnica; o dado não deixa de ser sensível por causa do contexto do projeto.

A decisão tomada foi substituir tudo por dados **fictícios, mas estruturalmente realistas**: nomes de empresa inventados, mantendo os padrões reais e não sensíveis do negócio (regiões de atendimento, perfil de compra). O resultado técnico é idêntico para fins de demonstração — o assistente responde igualmente bem — mas o risco de exposição desaparece.

## Informação estratégica também é ativo a proteger

Existe uma segunda camada de risco, menos óbvia que dado pessoal: informação comercial estratégica. Uma tabela de cross-reference de código de peça (de fabricante original para código interno de uma empresa) parece só um detalhe técnico, mas é, na prática, propriedade intelectual de catálogo. Expor essa tabela real publicamente daria a um concorrente visibilidade sobre a operação de produto de uma empresa sem nenhum esforço.

A mesma lógica de cibersegurança que se aplica a senhas e dados pessoais se aplica aqui: **classifique a informação antes de decidir onde ela pode circular**. Nem todo dado sensível é dado pessoal — muito dado sensível é dado de negócio.

## IA generativa aumenta a superfície de risco, não reduz

Um erro comum é achar que, por a IA estar "só respondendo perguntas", o risco de segurança é menor do que em um sistema tradicional. É o contrário. Um assistente de IA generativa que tem acesso a uma base de conhecimento tende a expor, em algum momento, informação que o usuário nem perguntou diretamente — basta a pergunta certa ser feita de um jeito inesperado.

Por isso, todo o desenho do assistente comercial que construí seguiu uma regra simples de segurança por design: a IA generativa nunca teve liberdade para responder qualquer coisa. Ela é restrita a um contexto pré-definido e fechado, com um prompt de sistema que instrui explicitamente a recusar responder o que está fora desse contexto. Isso não é só uma boa prática de qualidade de resposta — é uma camada de contenção de risco. Um assistente que "inventa" também é um assistente que pode, sem querer, inventar ou vazar informação que não deveria estar ali.

## Arquitetura importa mais do que parece

Outro ponto de cibersegurança que aparece cedo em qualquer projeto de IA aplicada: onde a chave de API fica guardada. Ao evoluir o mesmo assistente para uma versão web, a arquitetura escolhida foi propositalmente um backend (Flask) fazendo a chamada para a API de IA, em vez de o navegador do usuário chamar a API diretamente.

A diferença parece um detalhe técnico, mas é uma decisão de segurança fundamental: chamar uma API de IA diretamente do JavaScript do navegador exigiria expor a chave de acesso no código-fonte do cliente — visível para qualquer pessoa que abrir o inspecionador do navegador. Um backend simples resolve isso guardando a chave como variável de ambiente, nunca exposta ao usuário final.

## Segurança não é um módulo à parte — é uma lente

O maior aprendizado prático de cibersegurança nesse processo não veio de nenhuma ferramenta específica de segurança, veio de uma mudança de hábito: perguntar, em cada decisão de design, **"quem mais teria acesso a isso, e o que essa pessoa poderia fazer com isso?"** — antes de decidir onde um dado mora, quem chama uma API, e o que um assistente de IA tem permissão de dizer.

Cibersegurança essencial não é uma etapa que se faz depois que o projeto funciona. É a pergunta que muda, desde o início, como o projeto é desenhado.
