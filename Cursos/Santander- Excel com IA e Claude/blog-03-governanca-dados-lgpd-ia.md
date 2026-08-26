# Governança de Dados e LGPD: o Risco Invisível de Usar IA no Dia a Dia Comercial

Cursos de "Excel com IA" ensinam a colar uma tabela em um chat de inteligência artificial e pedir um resumo, uma fórmula ou um relatório. É rápido, é impressionante — e é também o ponto exato onde a maioria das empresas cria um risco de compliance sem perceber.

O problema não é a IA. É o que entra nela.

## O que costuma ir parar em ferramentas de IA sem controle

Em operações comerciais, é comum que planilhas de trabalho contenham, junto com os dados "de negócio": CPF ou CNPJ de clientes, e-mails, telefones, endereços completos, histórico de compras, condições comerciais negociadas. Quando essa planilha é colada inteira em uma ferramenta de IA generativa para "gerar um relatório mais rápido", esses dados saem do ambiente controlado da empresa e entram em um sistema externo — muitas vezes sem que ninguém tenha avaliado se aquilo é permitido pela LGPD (Lei Geral de Proteção de Dados).

Isso não significa que IA e dados de clientes sejam incompatíveis. Significa que existe uma diferença entre usar IA **corretamente** e usar IA **sem pensar no que está sendo compartilhado**.

## Os princípios básicos que resolvem 80% do risco

- **Minimização**: a IA só precisa dos dados necessários para a tarefa. Se o objetivo é analisar volume de vendas por região, não é necessário incluir CPF, e-mail ou telefone do cliente — remover ou anonimizar essas colunas antes de qualquer análise já elimina a maior parte do risco.
- **Saber onde os dados ficam**: ferramentas de IA corporativas (com contrato empresarial) costumam ter garantias de que os dados não são usados para treinar modelos públicos. Ferramentas de uso pessoal, gratuitas, geralmente não têm essa garantia — e é aí que a maior parte dos vazamentos acidentais acontece.
- **Anonimização antes da automação**: em pipelines automatizados (como cruzamento de bases de clientes, fornecedores ou produtos), é possível estruturar o processo para que dados sensíveis sejam tratados separadamente dos dados analíticos, reduzindo exposição sem perder a utilidade da análise.
- **Rastro de decisão**: se uma IA participa de um processo que afeta um cliente (por exemplo, prioridade de atendimento, condição comercial diferenciada), a LGPD espera que a empresa consiga explicar como essa decisão foi tomada — "a IA decidiu" não é uma resposta aceitável em uma auditoria.

## Isso não é burocracia — é proteção da própria operação

Um vazamento de dados de clientes não é apenas um problema jurídico abstrato. Em um negócio B2B, onde a base de clientes é um dos ativos mais valiosos da empresa, um incidente de exposição de dados comerciais sensíveis (preços negociados, volumes, contatos) pode custar relacionamentos que levaram anos para construir.

A boa notícia é que governança de dados não exige desistir de usar IA — exige adicionar uma pergunta simples antes de colar qualquer planilha em qualquer ferramenta: **"esse dado precisa mesmo estar aqui para essa tarefa?"**. Na maioria das vezes, a resposta é não, e a análise continua funcionando perfeitamente sem ele.
