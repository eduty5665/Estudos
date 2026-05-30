# Ideias de Design — RD Station CRM Guia Interativo

## Contexto
Página web interativa para apresentar o guia de uso do RD Station CRM, focando nas mudanças da carteira de clientes e etapas do funil de vendas. Público-alvo: equipe de vendas interna.

---

<response>
<text>
## Ideia 1: "CRM Blueprint" — Estética de Planta Técnica Digital

**Design Movement**: Bauhaus funcionalista com influência de dashboards de SaaS moderno.

**Core Principles**:
1. Informação como arquitetura — cada seção é um "módulo" com bordas e grids precisos.
2. Hierarquia tipográfica agressiva — títulos grandes e contrastantes vs. corpo pequeno e denso.
3. Cor como sinalização — apenas teal (#00A99D) e laranja (#F97316) para indicar ação/alerta.
4. Espaço negativo como respiração — seções separadas por faixas brancas generosas.

**Color Philosophy**: Fundo quase-branco (#F8FAFC), texto escuro (#1E293B), teal primário (#0D9488), laranja de alerta (#F97316). Minimalismo funcional.

**Layout Paradigm**: Seções em largura total com conteúdo em grid assimétrico (3:2 ou 2:3). Sem sidebar. Scroll vertical linear.

**Signature Elements**:
1. Cards de etapas do funil com linhas de conexão animadas.
2. Contador de progresso lateral (sticky) mostrando em qual seção o usuário está.

**Interaction Philosophy**: Hover revela detalhes adicionais. Clique em etapas do funil expande descrição.

**Animation**: Fade-in suave ao scroll. Linha de progresso do funil se preenche conforme o usuário avança.

**Typography System**: Sora (display, 700/800) + Inter (body, 400/500). Títulos em 48-64px, subtítulos em 24px, corpo em 16px.
</text>
<probability>0.07</probability>
</response>

---

<response>
<text>
## Ideia 2: "Warm Operator" — Estética de Manual Corporativo Humanizado

**Design Movement**: Editorial moderno com influência de publicações de negócios premium (Harvard Business Review meets Notion).

**Core Principles**:
1. Tipografia como elemento visual primário — fontes grandes e expressivas dominam.
2. Calor humano — paleta quente, fotos de pessoas, linguagem direta.
3. Progressão narrativa — a página conta uma história do "antes" ao "depois".
4. Interatividade discreta — animações sutis que não distraem.

**Color Philosophy**: Fundo creme (#FFFBF5), texto carvão (#292524), teal da RD (#0F766E), laranja quente (#EA580C). Evoca confiança e acessibilidade.

**Layout Paradigm**: Seções alternadas — texto à esquerda/imagem à direita, depois invertido. Funil representado como timeline horizontal interativa.

**Signature Elements**:
1. Timeline horizontal do funil com cards clicáveis.
2. Seção "Antes vs. Depois" com slider interativo.

**Interaction Philosophy**: Tabs para navegar entre etapas. Accordion para boas práticas.

**Animation**: Slide-in lateral ao entrar na viewport. Cards do funil se iluminam em sequência.

**Typography System**: Playfair Display (headings) + Lato (body). Contraste entre serifado e sem serifa para profundidade visual.
</text>
<probability>0.08</probability>
</response>

---

<response>
<text>
## Ideia 3: "Neon Grid" — Estética de Dashboard Futurista

**Design Movement**: Dark mode tech com influência de interfaces de monitoramento e analytics.

**Core Principles**:
1. Fundo escuro como tela — o conteúdo "brilha" sobre o escuro.
2. Dados como arte — gráficos e visualizações são elementos decorativos.
3. Gradientes de neon — teal e laranja como luzes em fundo escuro.
4. Grid explícito — linhas de grade visíveis como referência estrutural.

**Color Philosophy**: Fundo #0F172A (azul-escuro), texto #E2E8F0, teal neon #2DD4BF, laranja #FB923C. Alto contraste e impacto visual.

**Layout Paradigm**: Sidebar de navegação fixa + área de conteúdo principal. Funil representado como gráfico de barras interativo.

**Signature Elements**:
1. Gráfico de funil animado mostrando conversão entre etapas.
2. Cards com bordas de gradiente neon.

**Interaction Philosophy**: Sidebar com navegação por seção. Hover em cards revela métricas.

**Animation**: Glow effect no hover. Números contam de 0 ao valor final ao entrar na viewport.

**Typography System**: Space Grotesk (display) + DM Sans (body). Fontes técnicas e modernas.
</text>
<probability>0.06</probability>
</response>

---

## Decisão Final
**Escolhida: Ideia 2 — "Warm Operator"**

Razão: O público-alvo é uma equipe de vendas interna que precisa aprender e adotar uma nova ferramenta. A estética "Warm Operator" equilibra profissionalismo com acessibilidade, tornando o conteúdo fácil de absorver. A timeline interativa do funil é o elemento central que melhor comunica a mudança de processo.
