# 🏢 Simulador de Investimentos em Fundos Imobiliários (FIIs)

Projeto desenvolvido como desafio prático do bootcamp **DIO — Excel**, aplicando conceitos de fórmulas financeiras, formatação condicional e boas práticas de planilhas para construir uma ferramenta de simulação de investimentos em Fundos de Investimento Imobiliário (FIIs).

## 📌 Sobre o projeto

A planilha permite simular, mês a mês, a evolução de um investimento em FIIs a partir de:

- um aporte inicial;
- aportes mensais constantes;
- uma taxa de dividendo mensal estimada (rendimento distribuído sobre o patrimônio);
- uma taxa de valorização mensal estimada da cota;
- a opção de reinvestir ou não os dividendos recebidos.

Como saída, o modelo calcula automaticamente:

- **Valor total investido** (soma de todos os aportes);
- **Patrimônio acumulado** ao final do período simulado;
- **Total de dividendos recebidos** no período;
- **Dividendo do último mês**;
- **Rentabilidade total** sobre o valor investido;
- uma **tabela de evolução mês a mês**, com aporte, dividendo do mês, dividendos acumulados e patrimônio acumulado.

## 🎯 Objetivos de aprendizagem aplicados

- Construção de ferramentas de simulação financeira em Excel;
- Aplicação de fórmulas de rendimento mensal e cálculo de dividendos;
- Uso de referências absolutas e relativas para permitir a expansão automática da tabela mês a mês;
- Separação clara entre células de entrada (input) e células calculadas (fórmulas), com formatação visual (destaque em amarelo/azul para inputs);
- Documentação técnica do processo para compartilhamento via GitHub.

## 🗂️ Estrutura da planilha

O arquivo [`Simulador_Investimentos_FII.xlsx`](./Simulador_Investimentos_FII.xlsx) contém uma única aba, **Simulador**, dividida em três blocos:

| Bloco | Conteúdo |
|---|---|
| **1. Dados de Entrada** | Campos editáveis (destacados em amarelo): valor inicial, aporte mensal, taxa de dividendo mensal, valorização mensal da cota, período em meses e opção de reinvestimento |
| **2. Resultados da Simulação** | Indicadores consolidados calculados por fórmula a partir da tabela mensal |
| **3. Evolução Mês a Mês** | Tabela com a projeção detalhada, mês a mês, até o limite do período informado |

### Como usar

1. Abra o arquivo `Simulador_Investimentos_FII.xlsx`.
2. Preencha apenas as **células amarelas** (bloco "1. Dados de Entrada") com os valores desejados.
3. Os resultados (bloco 2) e a tabela de evolução (bloco 3) são recalculados automaticamente pelo Excel.

> A tabela suporta simulações de até 360 meses (30 anos). Meses além do período informado ficam automaticamente em branco.

## 🧮 Lógica de cálculo

Para cada mês `n` (a partir do mês 2), o patrimônio é calculado como:

```
Patrimônio(n) = (Patrimônio(n-1) + Aporte) × (1 + Valorização mensal) + Dividendo(n) × Reinvestir
Dividendo(n)  = Patrimônio(n-1) × Taxa de dividendo mensal
```

No mês 1, o "Patrimônio(0)" é substituído pelo valor inicial investido.

Os indicadores consolidados (bloco 2) usam `INDEX` para buscar a linha correspondente ao último mês do período simulado, evitando fórmulas de matriz não suportadas por todas as versões do Excel/LibreOffice.

## ⚠️ Premissas e limitações

- A taxa de dividendo e a taxa de valorização mensal são **estimativas fixas** definidas pelo usuário; na prática, o rendimento e a cotação de um FII variam mês a mês conforme o mercado, a vacância dos imóveis, a taxa Selic/CDI e outros fatores.
- O modelo **não considera** taxas de corretagem, come-cotas (não aplicável a FIIs) ou custos de custódia.
- Dividendos de FIIs são isentos de Imposto de Renda para pessoa física, conforme a Lei nº 11.196/2005, art. 3º, inciso III, desde que atendidas as condições legais (ex.: fundo com no mínimo 50 cotistas e cotista com menos de 10% das cotas do fundo). O modelo assume esse cenário de isenção e não desconta IR dos dividendos.
- Este é um simulador educacional para fins de estudo — **não constitui recomendação de investimento**.

## 🛠️ Tecnologias utilizadas

- Microsoft Excel (fórmulas nativas: `IF`, `INDEX`)
- Formatação condicional de células de entrada vs. saída
- Boas práticas de organização de planilhas financeiras

## 📚 Referências

- Aulas do bootcamp DIO sobre Excel e simulação de investimentos
- Lei nº 11.196/2005 (isenção de IR sobre dividendos de FIIs para pessoa física)

## 📎 Autor

Projeto desenvolvido por **Bruno** como parte do bootcamp DIO.
