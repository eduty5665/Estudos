import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AiGatewayError";
  }
}

/**
 * Calls Lovable AI through the gateway and returns the final text.
 * The call is streamed and consumed server-side.
 */
export async function callLovableAi(messages: ModelMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new AiGatewayError(500, "Serviço de IA não configurado.");
  }

  const provider = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => (typeof m.content === "string" ? m.content : ""))
    .join("\n\n");
  const rest = messages.filter((m) => m.role !== "system");

  const result = streamText({
    model: provider.responses(MODEL),
    ...(system ? { instructions: system } : {}),
    messages: rest,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    return await result.text;
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode)
        : undefined;
    if (status === 429) {
      throw new AiGatewayError(429, "Muitas análises agora. Espere alguns segundos e tente de novo.");
    }
    if (status === 402) {
      throw new AiGatewayError(402, "Os créditos de IA do projeto acabaram. Recarregue para continuar analisando.");
    }
    if (status === 403) {
      throw new AiGatewayError(403, "O acesso ao serviço de IA foi bloqueado para este projeto.");
    }
    console.error("Lovable AI error", error);
    throw new AiGatewayError(status ?? 500, "Não conseguimos concluir a análise. Tente novamente.");
  }
}

/** Extracts the first JSON object from a model answer. */
export function parseJsonAnswer<T>(text: string): T {
  const cleaned = text.replace(/```json/gi, "```").trim();
  const fenced = cleaned.match(/```([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? cleaned).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new AiGatewayError(502, "A IA respondeu em um formato inesperado. Tente novamente.");
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    throw new AiGatewayError(502, "A IA respondeu em um formato inesperado. Tente novamente.");
  }
}
