# Antes de colocar IA em cima dos seus dados, arrume a casa

Existe uma tentação forte, quando se aprende IA generativa, de achar que ela resolve o problema de dados desorganizados por mágica. Não resolve. E dois projetos recentes me deixaram isso muito claro: um assistente virtual comercial e uma planilha de planejamento financeiro pessoal. Nos dois casos, o trabalho que fez a diferença não foi o prompt bonito — foi a estrutura dos dados por trás dele.

## O JSON chato que salvou o projeto

Ao construir um assistente de IA para responder perguntas comerciais, fiscais e financeiras de uma empresa, a primeira decisão de design não foi sobre qual modelo de IA usar. Foi sobre **como estruturar a base de conhecimento**. A escolha final foi simples: arquivos JSON, um por domínio (produtos, garantia, fiscal, financeiro), cada item com um formato fixo:

```json
{
  "id": "fis-001",
  "categoria": "ICMS-ST em Autopeças",
  "pergunta_exemplos": ["...", "...", "..."],
  "resposta": "...",
  "escalonar_para": "Departamento Fiscal/Contábil"
}
```

Isso é, na essência, o mesmo princípio de qualquer banco de dados bem desenhado: campos consistentes, chaves previsíveis, sem ambiguidade. A diferença entre um JSON bem estruturado e um "amontoado de texto sobre a empresa" é a diferença entre um assistente que funciona e um que erra de forma imprevisível.

## Planilha não é só Excel bonito — é modelo de dados

Um raciocínio parecido apareceu na construção de uma planilha de planejamento financeiro pessoal, feita em duas abas: uma de orçamento mensal (receitas, despesas fixas, variáveis, supérfluas) e outra de simulação de reserva de emergência, com fórmulas que calculam automaticamente a meta de 3, 6 ou 12 meses de custo de vida, dependendo do perfil profissional da pessoa.

O que faz essa planilha útil não é a cor das células. É que cada categoria de gasto tem um lugar fixo, e os totais são calculados por fórmula — nunca digitados manualmente. Isso é exatamente o que se aprende nos fundamentos de dados com Excel, SQL e BI: **um dado sem estrutura é uma opinião; um dado estruturado é uma base para decisão**.

## SQL, Excel e Python resolvem o mesmo problema com sotaques diferentes

Um ponto que vale destacar para quem está no início da trilha de dados: Excel, SQL e Python não são três ferramentas concorrentes — são três sotaques da mesma pergunta: **"como eu organizo, filtro e agrego essa informação de forma confiável?"**

- Em Excel, isso vira tabela dinâmica e fórmula.
- Em SQL, vira `SELECT`, `GROUP BY`, `JOIN`.
- Em Python, vira estrutura de dados (listas, dicionários) e, mais adiante, bibliotecas como pandas.

Quando comparei duas visões de dados do mesmo problema — os itens de produto de um catálogo e o cross-reference de código original de fabricante para código interno — o modelo mental foi idêntico ao de uma tabela relacional: uma tabela de produtos, uma tabela de "de-para" de códigos, e a lógica de busca conectando as duas. Só a sintaxe muda.

## O erro mais caro: pular a etapa "chata"

A etapa mais fácil de pular — e a mais cara quando pulada — é validar a estrutura dos dados antes de automatizar em cima deles. Um exemplo real: ao testar a busca de clientes por nome em um protótipo, um bug bobo apareceu — uma palavra genérica do setor ("auto", presente em vários nomes fictícios de cliente) fazia o sistema encontrar o cliente errado. A causa não era o modelo de IA; era a falta de uma regra clara de desambiguação nos dados.

Isso ilustra um princípio central de qualquer disciplina de dados, seja em Excel, SQL ou Python: **o problema raramente está na ferramenta; está no modelo de dados que alimenta a ferramenta**. Antes de perguntar "qual fórmula eu uso" ou "qual biblioteca resolve isso", vale perguntar: minha estrutura de dados representa bem a realidade que quero descrever? Ela evita ambiguidade? Ela é fácil de auditar quando algo dá errado?

## Dados bons são a fundação, não o enfeite

Fundamentos de dados não são o "capítulo chato" antes da parte divertida com IA. São a fundação sem a qual a IA generativa amplifica erro em vez de corrigir. Um assistente de IA em cima de uma base de conhecimento mal estruturada não fica "menos inteligente" — fica **imprevisível**, que é pior. E uma planilha financeira sem categorização clara de gastos não gera insight — gera a ilusão de controle.

A ordem que funciona na prática é sempre a mesma: primeiro estrutura, depois automação, depois inteligência artificial por cima. Inverter essa ordem é a forma mais comum de gastar tempo construindo algo sofisticado sobre uma base que não aguenta o peso.
