# Bolso Claro — Documentação do Sistema

> App de finanças pessoais com IA, mobile-first, em português. O usuário registra gastos conversando ("gastei 42 reais no almoço"), e o agente categoriza, mostra o impacto nas metas e monta planos de economia.

---

## 1. Visão geral

| Item | Descrição |
|---|---|
| Nome | Bolso Claro |
| Público | Brasileiros de 18 a 35 anos |
| Plataforma | Web, pensada para celular (mobile-first) |
| Idioma | Português do Brasil |
| Identidade | Paleta calma em verde e azul, ícone de cofrinho (PiggyBank) |
| Tom do agente | Amigável, sem julgamento, nunca dá bronca |

### Problema
Anotar gastos em planilhas ou apps cheios de formulários é chato, e por isso as pessoas desistem. O Bolso Claro troca formulários por uma conversa.

### Escopo do MVP
- Chat com agente de IA (várias conversas com histórico)
- Categorização automática de gastos e receitas
- Painel com saldo do mês, gastos por categoria e últimas transações
- Metas com plano de economia mensal
- Alertas gentis ao chegar em 80% do limite
- Lançamento manual no Histórico

### Fora do escopo
Open Finance, investimentos, contas compartilhadas (multiusuário) e aconselhamento financeiro regulado.

---

## 2. Telas e fluxos

| Tela | Rota | O que faz |
|---|---|---|
| Login / Cadastro | `/auth` | Entrar ou criar conta com e-mail e senha (é preciso confirmar o e-mail) |
| Onboarding | `/onboarding` | 3 passos: nome, renda mensal e objetivo principal (poupar, sair das dívidas, realizar um sonho, se organizar) |
| Início | `/` | Saldo do mês, entradas e saídas, gastos por categoria, alertas de 80% e últimas transações |
| Conversas | `/chat` | Lista de conversas com "há X minutos", criar e apagar |
| Conversa | `/chat/$threadId` | Chat com o agente, com sugestões prontas e botão de nova conversa |
| Metas | `/metas` | Cards com progresso, plano mensal, sugestões e botão "Marcar como realizada" |
| Histórico | `/historico` | Transações agrupadas por dia e formulário de lançamento rápido |

### Fluxo principal
```text
Cadastro -> Confirma e-mail -> Onboarding -> Início
   -> Conversas -> "gastei 42 reais no almoço"
   -> Agente confirma: "Registrei R$ 42,00 em Alimentação, ok?"
   -> Transação salva -> aparece no Início e no Histórico
```

### Sugestões do chat
- "Gastei 42 reais no almoço"
- "Recebi 3000 de salário"
- "Quero juntar R$ 2.000 em 6 meses"

---

## 3. O agente de IA

### Regras de comportamento
1. Fala sempre em português, com tom leve e acolhedor.
2. Nunca dá bronca nem julga os gastos.
3. Quando falta informação (valor, por exemplo), faz uma pergunta curta.
4. Confirma o que entendeu ao registrar.
5. Não recomenda investimentos nem dá aconselhamento financeiro regulado.
6. Usa o contexto do usuário: perfil, 30 últimas transações e metas ativas.

### Ferramentas (ações que o agente executa)
| Ferramenta | Parâmetros | Efeito |
|---|---|---|
| `add_transaction` | descrição, valor, tipo (entrada/saída), categoria, data (opcional) | Registra uma transação |
| `create_goal` | título, valor-alvo, prazo, economia mensal, sugestões (todos opcionais, exceto título e valor) | Cria uma meta com plano |
| `update_goal_saved` | nome da meta, valor | Soma um valor guardado à meta |

### Modelo
Lovable AI Gateway, com resposta em streaming e até 25 etapas de raciocínio/ferramentas por mensagem.

---

## 4. Categorias

Definidas em `src/lib/finance.ts` (`CATEGORIES`), cada uma com id, emoji e nome. Exemplos: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Compras, Assinaturas, Salário, Outros. Categorias desconhecidas são normalizadas para "Outros" (`normalizeCategory`).

---

## 5. Arquitetura

```text
Navegador (React 19 + TanStack Router)
   |-- server functions (createServerFn)  -> dados do app
   |-- POST /api/chat (streaming)         -> agente de IA + ferramentas
                    |
             Lovable Cloud (banco, auth, segurança por linha)
                    |
             Lovable AI Gateway (modelo de linguagem)
```

### Tecnologias
- TanStack Start v1 (React 19, Vite 7), SSR na borda
- Tailwind CSS v4 com tokens de cor semânticos (oklch)
- Vercel AI SDK (`ai`, `@ai-sdk/react`) para o chat em streaming
- Lovable Cloud: banco Postgres, autenticação e RLS
- Componentes shadcn/ui e AI Elements

### Estrutura de pastas
```text
src/
  routes/
    index.tsx            Início (dashboard)
    auth.tsx             Login e cadastro
    onboarding.tsx       Onboarding em 3 passos
    chat.tsx             Lista de conversas
    chat.$threadId.tsx   Conversa com o agente
    metas.tsx            Metas
    historico.tsx        Histórico + lançamento manual
    api/chat.ts          Endpoint do agente (streaming)
  lib/
    finance.ts           Categorias, formatação (R$, datas), tipos
    app.functions.ts     Server functions do app
  components/
    chat-parts.tsx       Mensagens, "pensando...", transporte do chat
    ai-elements/         Componentes de chat
    ui/                  Componentes de interface
```

---

## 6. Dados

Todas as tabelas têm segurança por linha: cada usuário só vê e altera os próprios dados.

| Tabela | Campos principais |
|---|---|
| `profiles` | id do usuário, display_name, monthly_income, main_goal, onboarded |
| `conversations` | id, user_id, title, created_at, updated_at |
| `messages` | conversation_id, message_id, role, parts (conteúdo), created_at |
| `transactions` | id, user_id, description, amount, type (income/expense), category, occurred_at, source (chat/manual) |
| `goals` | id, user_id, title, target_amount, saved_amount, deadline, monthly_saving, suggestions, status (active/completed/cancelled) |

---

## 7. Server functions (`src/lib/app.functions.ts`)

Todas exigem usuário logado.

| Função | Descrição |
|---|---|
| `getProfile` | Lê o perfil |
| `saveOnboarding` | Salva nome, renda e objetivo |
| `listConversations` / `createConversation` / `deleteConversation` | Gerencia conversas |
| `getConversationMessages` | Carrega o histórico de uma conversa |
| `addTransaction` | Lançamento manual (source = manual) |
| `listTransactions` | Lista transações |
| `listGoals` | Lista metas (sem as canceladas) |
| `setGoalStatus` | Marca meta como realizada ou cancelada |
| `getDashboard` | Totais do mês, gastos por categoria, alertas e últimas transações |

## 8. Endpoint do agente — `POST /api/chat`

1. Valida o token do usuário (401 se inválido).
2. Confere se a conversa pertence ao usuário (404 se não).
3. Salva a mensagem do usuário.
4. Monta o contexto (perfil, transações, metas) e o prompt do agente.
5. Transmite a resposta em streaming, executando as ferramentas.
6. Ao terminar, salva a resposta e renomeia "Nova conversa" com o início da primeira mensagem.

Corpo: `{ conversationId: string, messages: UIMessage[] }`.

---

## 9. Regras de negócio

- **Saldo do mês** = entradas − saídas no mês corrente.
- **Alerta gentil**: aparece quando os gastos atingem 80% da renda mensal informada.
- **Plano de meta**: economia mensal = (valor-alvo − já guardado) ÷ meses até o prazo.
- **Valores** exibidos em reais (`formatBRL`) e datas no formato brasileiro.

---

## 10. Segurança e privacidade

- Autenticação por e-mail com confirmação.
- Segurança por linha em todas as tabelas.
- Chaves de IA ficam só no servidor.
- Nenhum dado bancário real é conectado no MVP.

## 11. Acessibilidade e design

- Pensado primeiro para celular, com navegação inferior.
- Contraste adequado, textos legíveis e rótulos nos botões.
- Cores definidas por tokens (nunca fixas nos componentes), com suporte a tema escuro.

## 12. Como testar

1. Crie uma conta e confirme pelo link no e-mail.
2. Complete o onboarding.
3. Em Conversas, escreva "gastei 42 reais no almoço".
4. Veja o gasto no Início e no Histórico.
5. Escreva "quero juntar R$ 2.000 em 6 meses" e confira em Metas.

## 13. Próximos passos

- Gráficos de evolução mensal
- Limites por categoria
- Lembretes e notificações
- Importação de extrato (CSV)
- Open Finance (fase futura)
