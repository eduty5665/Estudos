import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { currentMonthRange, normalizeCategory, todayISO } from "@/lib/finance";

type ChatRequestBody = {
  conversationId?: string;
  messages?: unknown;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
        if (!token) {
          return new Response("Não autenticado", { status: 401 });
        }

        const url = (process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"]) as string;
        const anonKey = (process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) as string;
        if (!url || !anonKey) {
          return new Response("Configuração ausente", { status: 500 });
        }

        const { data: userData, error: userError } = await createClient(url, anonKey, {
          auth: { persistSession: false },
        }).auth.getUser(token);
        if (userError || !userData.user) {
          return new Response("Não autenticado", { status: 401 });
        }
        const userId = userData.user.id;

        const db = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const body = (await request.json()) as ChatRequestBody;
        const conversationId = body.conversationId;
        const rawMessages = body.messages;
        if (!conversationId || !Array.isArray(rawMessages)) {
          return new Response("Requisição inválida", { status: 400 });
        }
        const messages = rawMessages as UIMessage[];

        // A conversa precisa pertencer ao usuário autenticado.
        const { data: conversation } = await db
          .from("conversations")
          .select("id, title")
          .eq("id", conversationId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!conversation) {
          return new Response("Conversa não encontrada", { status: 404 });
        }

        // Persiste a última mensagem do usuário (idempotente).
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await db.from("messages").upsert(
            {
              conversation_id: conversationId,
              user_id: userId,
              message_id: lastUser.id,
              role: "user",
              parts: lastUser.parts,
            },
            { onConflict: "conversation_id,message_id" },
          );
        }

        // Contexto financeiro do usuário para o agente.
        const { start, end } = currentMonthRange();
        const [profileRes, txRes, goalsRes] = await Promise.all([
          db.from("profiles").select("*").eq("id", userId).maybeSingle(),
          db
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .order("occurred_at", { ascending: false })
            .limit(30),
          db
            .from("goals")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active"),
        ]);

        const profile = profileRes.data;
        const transactions = txRes.data ?? [];
        const goals = goalsRes.data ?? [];

        const monthTx = transactions.filter(
          (t) => t.occurred_at >= start && t.occurred_at <= end,
        );
        const monthIncome = monthTx
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + Number(t.amount), 0);
        const monthExpense = monthTx
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + Number(t.amount), 0);

        const contextBlock = JSON.stringify(
          {
            hoje: todayISO(),
            usuario: {
              nome: profile?.display_name ?? null,
              renda_mensal: profile?.monthly_income ?? null,
              objetivo_principal: profile?.main_goal ?? null,
            },
            mes_atual: {
              receitas: Number(monthIncome.toFixed(2)),
              despesas: Number(monthExpense.toFixed(2)),
              saldo: Number((monthIncome - monthExpense).toFixed(2)),
              por_categoria: monthTx.reduce<Record<string, number>>((acc, t) => {
                if (t.type === "expense") {
                  acc[t.category] = Number(
                    ((acc[t.category] ?? 0) + Number(t.amount)).toFixed(2),
                  );
                }
                return acc;
              }, {}),
            },
            ultimos_lancamentos: transactions.slice(0, 15).map((t) => ({
              data: t.occurred_at,
              descricao: t.description,
              valor: Number(t.amount),
              tipo: t.type,
              categoria: t.category,
            })),
            metas_ativas: goals.map((g) => ({
              id: g.id,
              titulo: g.title,
              valor_alvo: Number(g.target_amount),
              guardado: Number(g.saved_amount),
              prazo: g.deadline,
            })),
          },
          null,
          2,
        );

        const systemPrompt = `Você é o agente financeiro do app "Bolso Claro", um assistente de finanças pessoais em português do Brasil.

PERSONALIDADE
- Amigável, direto e SEM JULGAMENTO. Nunca reclama nem dá bronca por gastos.
- Fala como uma pessoa querida: usa o primeiro nome do usuário às vezes, frases curtas, no máximo 3 frases por resposta (listas de até 5 itens quando fizer sentido).
- Usa emojis com parcimônia (no máximo 1 por resposta).

COMO REGISTRAR FINANÇAS
- Quando o usuário mencionar um gasto ou receita em linguagem natural (ex.: "gastei 60 no mercado", "recebi 3000 de salário"), use a ferramenta add_transaction imediatamente.
- Categorias válidas: alimentacao, transporte, moradia, lazer, saude, educacao, compras, servicos, outros. Escolha a mais adequada.
- Confirme de forma curta o que registrou, ex.: "Registrei R$ 60 em Alimentação ✅". Se faltar informação essencial (valor ou o que foi), pergunte de forma curta antes de registrar.
- Nunca invente valores.

METAS
- Quando o usuário definir uma meta (ex.: "quero juntar R$ 2.000 em 6 meses"), calcule quanto guardar por mês com base na renda e nos gastos, sugira 2 a 3 cortes concretos por categoria usando os dados reais, e use a ferramenta create_goal com monthly_saving e suggestions preenchidos.
- Quando o usuário disser que guardou/aportou dinheiro numa meta, use update_goal_saved e comemore de forma leve.
- Se um valor de meta ficar irrealista com base na renda, diga com gentileza e sugira um ajuste.

LIMITES
- NÃO dê recomendação de investimentos nem aconselhamento financeiro regulado. Se perguntarem, diga que isso é melhor com um profissional e volte ao plano de economia.
- Responda sempre em português do Brasil, com valores no formato R$ 1.234,56.

CONTEXTO ATUAL DO USUÁRIO (dados reais do app):
${contextBlock}`;

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("IA não configurada", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key, // satisfaz o SDK; o gateway autentica pelo header abaixo
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });

        const addTransactionTool = tool({
          description:
            "Registra uma receita (income) ou despesa (expense) do usuário no app.",
          inputSchema: z.object({
            description: z.string().describe("Descrição curta do lançamento"),
            amount: z.number().describe("Valor em reais, sempre positivo"),
            type: z.enum(["income", "expense"]),
            category: z.string().describe("Categoria: alimentacao, transporte, moradia, lazer, saude, educacao, compras, servicos ou outros"),
            occurred_at: z.string().optional().describe("Data YYYY-MM-DD; omita para hoje"),
          }),
          execute: async ({ description, amount, type, category, occurred_at }) => {
            const cat = normalizeCategory(category);
            const { data, error } = await db
              .from("transactions")
              .insert({
                user_id: userId,
                description,
                amount: Math.abs(amount),
                type,
                category: cat,
                occurred_at: occurred_at ?? todayISO(),
                source: "chat",
              })
              .select("id, amount, category, type")
              .single();
            if (error) return { ok: false, message: error.message };
            return { ok: true, ...data };
          },
        });

        const createGoalTool = tool({
          description:
            "Cria uma meta de economia com plano mensal sugerido. Use depois de calcular o plano.",
          inputSchema: z.object({
            title: z.string().describe("Título curto da meta"),
            target_amount: z.number().describe("Valor total a juntar em reais"),
            deadline: z.string().optional().describe("Prazo YYYY-MM-DD, se informado"),
            monthly_saving: z.number().optional().describe("Quanto guardar por mês, em reais"),
            suggestions: z.array(z.string()).optional().describe("2 a 3 sugestões de corte por categoria"),
          }),
          execute: async ({ title, target_amount, deadline, monthly_saving, suggestions }) => {
            const { data, error } = await db
              .from("goals")
              .insert({
                user_id: userId,
                title,
                target_amount,
                deadline: deadline ?? null,
                plan: {
                  monthly_saving,
                  suggestions: suggestions ?? [],
                },
              })
              .select("id, title, target_amount")
              .single();
            if (error) return { ok: false, message: error.message };
            return { ok: true, ...data };
          },
        });

        const updateGoalSavedTool = tool({
          description: "Adiciona um valor guardado a uma meta existente do usuário.",
          inputSchema: z.object({
            goal_title: z.string().describe("Título da meta mencionada pelo usuário"),
            amount: z.number().describe("Valor guardado em reais"),
          }),
          execute: async ({ goal_title, amount }) => {
            const { data: goal } = await db
              .from("goals")
              .select("id, title, saved_amount")
              .eq("user_id", userId)
              .eq("status", "active")
              .ilike("title", `%${goal_title}%`)
              .maybeSingle();
            if (!goal) return { ok: false, message: "Meta não encontrada" };
            const next = Number(goal.saved_amount) + Math.abs(amount);
            const { error } = await db
              .from("goals")
              .update({ saved_amount: next })
              .eq("id", goal.id);
            if (error) return { ok: false, message: error.message };
            return { ok: true, goal: goal.title, guardado: next };
          },
        });

        const result = streamText({
          model: lovable.responses("openai/gpt-6-astra"),
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
          tools: {
            add_transaction: addTransactionTool,
            create_goal: createGoalTool,
            update_goal_saved: updateGoalSavedTool,
          },
          stopWhen: stepCountIs(25),
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          onError: () =>
            "Não consegui responder agora. Tente de novo em instantes.",
          onFinish: async ({ messages: finished }) => {
            const rows = finished
              .filter((m) => m.role === "assistant" || m.role === "user")
              .map((m) => ({
                conversation_id: conversationId,
                user_id: userId,
                message_id: m.id,
                role: m.role,
                parts: m.parts,
              }));
            if (rows.length > 0) {
              await db
                .from("messages")
                .upsert(rows, { onConflict: "conversation_id,message_id" });
            }
            if (lastUser && conversation.title === "Nova conversa") {
              const text = lastUser.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join(" ")
                .trim();
              if (text) {
                await db
                  .from("conversations")
                  .update({ title: text.slice(0, 48) })
                  .eq("id", conversationId);
              }
            }
          },
        });

        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
