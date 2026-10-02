# Exemplo de uso

Este exemplo usa os mesmos dados fictícios do botão **Carregar exemplo** da aplicação (`src/lib/matchvaga.ts`).

> ⚠️ **O resultado abaixo é ilustrativo.** Ele foi montado seguindo as regras da aplicação (grupos, pesos e cálculo do match), para explicar o raciocínio. A IA pode extrair palavras-chave um pouco diferentes a cada análise; os prints em [`../prints`](../prints) mostram uma execução real.

## Entrada

**Vaga (resumo):** Estágio em Desenvolvimento de Software, híbrido, São Paulo/SP.

- **Obrigatórios:** cursando CC, SI, ADS ou correlatos; lógica de programação e JavaScript; Git; inglês intermediário para leitura técnica.
- **Desejáveis:** React, TypeScript, Node.js; SQL e PostgreSQL; Docker; testes (Jest); projetos publicados no GitHub; APIs REST; Scrum.
- **Comportamentais:** comunicação clara, trabalho em equipe, proatividade, organização.

**Currículo (resumo):** Ana Beatriz Moraes, cursando ADS (conclusão em julho de 2027). Habilidades: lógica, HTML, CSS, JavaScript, "conhecimentos em banco de dados", "versionamento", inglês. Projetos: RootCity (telas em JavaScript, consumo de API de mapas, grupo de quatro pessoas) e Controle de Gastos (banco relacional, consultas escritas por ela). Experiência como atendente de livraria. Perfil no GitHub no cabeçalho.

## Análise

| Palavra-chave | Grupo | Tipo | Situação | Evidência no currículo |
|---|---|---|---|---|
| Cursando ADS ou correlato | Requisito | ⭐ obrigatória | ✅ | "Análise e Desenvolvimento de Sistemas — Cursando" |
| Lógica de programação | Hard skill | ⭐ obrigatória | ✅ | "Lógica de programação" |
| JavaScript | Hard skill | ⭐ obrigatória | ✅ | "Fiz as telas em JavaScript" |
| Git | Ferramenta | ⭐ obrigatória | ✅ (sinônimo) | "versionamento" |
| Inglês intermediário | Requisito | ⭐ obrigatória | ✅ | "inglês intermediário" |
| SQL | Hard skill | desejável | ✅ (sinônimo) | "banco relacional e escrevi as consultas" |
| APIs REST | Hard skill | desejável | ✅ | "consumo de uma API de mapas" |
| GitHub | Ferramenta | desejável | ✅ | "github.com/anabmoraes" |
| Trabalho em equipe | Soft skill | desejável | ✅ | "grupo de quatro pessoas" |
| Organização | Soft skill | desejável | ✅ | "organização do estoque" |
| React | Hard skill | desejável | ⚠️ faltante | — |
| TypeScript | Hard skill | desejável | ⚠️ faltante | — |
| Node.js | Hard skill | desejável | ⚠️ faltante | — |
| PostgreSQL | Ferramenta | desejável | ⚠️ faltante | — |
| Docker | Ferramenta | desejável | ⚠️ faltante | — |
| Jest | Ferramenta | desejável | ⚠️ faltante | — |
| Scrum | Ferramenta | desejável | ⚠️ faltante | "quadro de tarefas" não comprova Scrum |
| Comunicação | Soft skill | desejável | ⚠️ faltante | — |
| Proatividade | Soft skill | desejável | ⚠️ faltante | — |

### Cálculo do match

| | Quantidade | Peso | Pontos possíveis | Pontos encontrados |
|---|---|---|---|---|
| Obrigatórias | 5 (5 encontradas) | 2 | 10 | 10 |
| Desejáveis | 14 (5 encontradas) | 1 | 14 | 5 |
| **Total** | | | **24** | **15** |

`match = 15 ÷ 24 × 100 = 62,5` → **63% (Médio)**

A leitura é boa: Ana cumpre **todos** os obrigatórios, e o que puxa o match para baixo são os desejáveis.

## Confirmação

| Palavra-chave | Marcou "Eu tenho"? | Onde? |
|---|---|---|
| Comunicação | ✅ | "Atendimento ao público na Livraria Página Viva" |
| Todas as outras | ❌ | — |

**Para estudar:** React, TypeScript, Node.js, PostgreSQL, Docker, Jest, Scrum, Proatividade.

## Currículo ajustado (trecho)

> **Objetivo**
> Estágio em Desenvolvimento de Software.
>
> **Formação**
> Análise e Desenvolvimento de Sistemas — Faculdade Municipal de Tecnologia. Cursando, conclusão prevista para julho de 2027.
>
> **Competências**
> JavaScript · HTML · CSS · Lógica de programação · SQL · Git e GitHub · Consumo de APIs REST · Trabalho em equipe · Comunicação · Organização
>
> **Projetos**
> **RootCity** (projeto acadêmico, 2025). Desenvolvi as telas em JavaScript e a integração com uma API de mapas para exibir pontos de coleta de recicláveis. Equipe de quatro pessoas, com quadro de tarefas e reuniões semanais.
> **Controle de Gastos** (projeto pessoal, 2026). Implementei cadastro, listagem e resumo de despesas por categoria, com banco de dados relacional e consultas SQL.
>
> **Experiência**
> **Atendente** — Livraria Página Viva (2024–2025). Atendimento ao público, organização do estoque e fechamento de caixa; apoio na criação da planilha de controle de entrada de livros.

**O que mudou:**
- Objetivo alinhado ao cargo da vaga.
- "Habilidades" renomeada para "Competências".
- "Conhecimentos em banco de dados" reescrito como "SQL", com base no projeto Controle de Gastos.
- "Versionamento" reescrito como "Git e GitHub".
- "Consumo de uma API de mapas" destacado como "Consumo de APIs REST".
- "Comunicação" incluída após confirmação (atendimento ao público).
- Projetos reescritos com verbos de ação e tecnologias.

**Novo match:** 16 ÷ 24 × 100 = 66,7 → **67% (Médio)**

## Por que o match não subiu mais

Porque a regra funcionou. React, TypeScript, Node.js, PostgreSQL, Docker e Jest **não aparecem em lugar nenhum** do currículo e não foram confirmados, então não entraram. Colocá-los levaria o match acima de 90%, mas criaria um currículo que desmorona na primeira pergunta da entrevista.

O caminho honesto para subir o match é a lista **Para estudar**: um projeto pequeno em React com TypeScript publicado no GitHub já transforma três faltantes em encontradas na próxima análise.
