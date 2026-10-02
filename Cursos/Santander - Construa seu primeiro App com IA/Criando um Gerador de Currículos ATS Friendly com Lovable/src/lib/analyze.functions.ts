import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { AiGatewayError, callLovableAi, parseJsonAnswer } from "./ai.server";
import type { AnalysisResult, AtsChecklistItem, Keyword } from "./matchvaga";

const MIN = 200;
const MAX = 8000;

const textField = z
  .string()
  .min(MIN, `Use ao menos ${MIN} caracteres.`)
  .max(MAX, `Use no máximo ${MAX} caracteres.`);

const analyzeInput = z.object({
  job: textField,
  resume: textField,
  confirmed: z
    .array(z.object({ keyword: z.string().max(120), where: z.string().max(400) }))
    .max(40)
    .optional(),
});

export type AnalyzePayload = z.infer<typeof analyzeInput>;

export type AnalyzeResponse =
  | { ok: true; data: AnalysisResult }
  | { ok: false; error: string; status: number };

const SYSTEM = `Você é um especialista em recrutamento técnico e em sistemas ATS (Applicant Tracking System), escrevendo em português do Brasil.

REGRA ABSOLUTA: você melhora COMO a pessoa se apresenta e NUNCA inventa experiência, curso, empresa, cargo, data, certificação ou ferramenta que a pessoa não tem.
- Use somente fatos presentes no currículo e nas confirmações enviadas pela pessoa.
- Você PODE reescrever, reorganizar, padronizar títulos de seção e usar o vocabulário da vaga para algo que realmente existe no currículo.
- Você NÃO PODE criar empresas, cargos, datas, cursos, certificações, ferramentas ou números de resultado.
- Se uma palavra-chave da vaga não tiver evidência no currículo nem confirmação, ela fica de fora do currículo ajustado.

Responda SEMPRE apenas com um objeto JSON válido, sem texto antes ou depois, neste formato:
{
  "keywords": [{ "term": "SQL", "group": "hard_skill" | "tool" | "soft_skill" | "requirement", "required": true, "found": true, "evidence": "trecho literal do currículo ou null" }],
  "ats_checklist": [{ "item": "Títulos de seção padrão", "ok": false, "tip": "dica curta e prática" }],
  "suggestions": ["no máximo 6 sugestões priorizadas"],
  "adjusted_resume": "currículo em Markdown simples, coluna única",
  "changes": ["o que mudou em relação ao currículo original"]
}

Regras de extração:
- Extraia de 12 a 24 palavras-chave realmente citadas na vaga, distribuídas nos quatro grupos.
- "required": true apenas para requisitos obrigatórios da vaga.
- "found": true apenas quando houver evidência no currículo (ou confirmação da pessoa); nesse caso "evidence" traz o trecho curto que comprova.
- ats_checklist deve avaliar: títulos de seção padrão, contatos no topo, datas legíveis, ausência de tabelas/colunas/ícones, tamanho adequado.
- adjusted_resume deve ter as seções, nesta ordem: Dados de contato, Objetivo, Formação, Competências, Projetos, Experiência, Cursos, Idiomas. Coluna única, sem tabelas, sem ícones, sem emojis.`;

function userPrompt(input: AnalyzePayload) {
  const confirmed = input.confirmed?.filter((c) => c.keyword.trim().length > 0) ?? [];
  return `DESCRIÇÃO DA VAGA:
"""
${input.job}
"""

CURRÍCULO DA PESSOA:
"""
${input.resume}
"""

${
  confirmed.length > 0
    ? `CONFIRMAÇÕES DA PESSOA (ela confirmou ter isso e indicou onde — trate como fato verdadeiro e use no currículo ajustado):
${confirmed.map((c) => `- ${c.keyword}: ${c.where || "sem detalhe informado"}`).join("\n")}`
    : "A pessoa não enviou confirmações adicionais. Não inclua no currículo nada que não esteja no texto original."
}

Analise e devolve o JSON.`;
}

function sanitize(raw: unknown): AnalysisResult {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const groups = new Set(["hard_skill", "tool", "soft_skill", "requirement"]);

  const keywords: Keyword[] = Array.isArray(obj["keywords"])
    ? (obj["keywords"] as Record<string, unknown>[])
        .filter((k) => typeof k?.["term"] === "string" && (k["term"] as string).trim().length > 0)
        .map((k) => ({
          term: String(k["term"]).trim(),
          group: groups.has(String(k["group"])) ? (String(k["group"]) as Keyword["group"]) : "requirement",
          required: Boolean(k["required"]),
          found: Boolean(k["found"]),
          evidence: typeof k["evidence"] === "string" && k["evidence"].trim() ? String(k["evidence"]).trim() : null,
        }))
    : [];

  const ats_checklist: AtsChecklistItem[] = Array.isArray(obj["ats_checklist"])
    ? (obj["ats_checklist"] as Record<string, unknown>[])
        .filter((i) => typeof i?.["item"] === "string")
        .map((i) => ({
          item: String(i["item"]),
          ok: Boolean(i["ok"]),
          tip: typeof i["tip"] === "string" ? String(i["tip"]) : "",
        }))
    : [];

  const suggestions = Array.isArray(obj["suggestions"])
    ? (obj["suggestions"] as unknown[]).filter((s): s is string => typeof s === "string").slice(0, 6)
    : [];

  const changes = Array.isArray(obj["changes"])
    ? (obj["changes"] as unknown[]).filter((s): s is string => typeof s === "string")
    : [];

  return {
    keywords,
    ats_checklist,
    suggestions,
    adjusted_resume: typeof obj["adjusted_resume"] === "string" ? String(obj["adjusted_resume"]) : "",
    changes,
  };
}

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => analyzeInput.parse(data))
  .handler(async ({ data }): Promise<AnalyzeResponse> => {
    try {
      const text = await callLovableAi([
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt(data) },
      ]);
      return { ok: true, data: sanitize(parseJsonAnswer(text)) };
    } catch (error) {
      if (error instanceof AiGatewayError) {
        return { ok: false, error: error.message, status: error.status };
      }
      console.error("analyzeResume failed", error);
      return { ok: false, error: "Não conseguimos concluir a análise. Tente novamente.", status: 500 };
    }
  });
