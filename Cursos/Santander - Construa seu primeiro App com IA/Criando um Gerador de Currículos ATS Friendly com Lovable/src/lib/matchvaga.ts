export type KeywordGroup = "hard_skill" | "tool" | "soft_skill" | "requirement";

export type Keyword = {
  term: string;
  group: KeywordGroup;
  required: boolean;
  found: boolean;
  evidence: string | null;
};

export type AtsChecklistItem = {
  item: string;
  ok: boolean;
  tip: string;
};

export type AnalysisResult = {
  keywords: Keyword[];
  ats_checklist: AtsChecklistItem[];
  suggestions: string[];
  adjusted_resume: string;
  changes: string[];
};

export const GROUP_LABELS: Record<KeywordGroup, string> = {
  hard_skill: "Hard skills",
  tool: "Ferramentas",
  soft_skill: "Soft skills",
  requirement: "Requisitos",
};

export const APP_RULE =
  "O MatchVaga melhora como você se apresenta. Ele nunca inventa experiência, curso ou ferramenta que você não tem.";

export const MIN_CHARS = 200;
export const MAX_CHARS = 8000;

/** Obrigatória peso 2, desejável peso 1. match = encontrados / possíveis × 100 */
export function calcMatch(keywords: Keyword[]): number {
  const possible = keywords.reduce((sum, k) => sum + (k.required ? 2 : 1), 0);
  if (possible === 0) return 0;
  const found = keywords.reduce(
    (sum, k) => sum + (k.found ? (k.required ? 2 : 1) : 0),
    0,
  );
  return Math.round((found / possible) * 100);
}

export function matchLabel(match: number): "Baixo" | "Médio" | "Alto" {
  if (match < 50) return "Baixo";
  if (match < 75) return "Médio";
  return "Alto";
}

export const SAMPLE_JOB = `Vaga: Estágio em Desenvolvimento de Software (híbrido — São Paulo/SP)

Sobre a vaga:
Buscamos pessoa estudante de Tecnologia para atuar junto ao time de produto no desenvolvimento e manutenção de aplicações web. Você vai participar de todo o ciclo: refinamento, implementação, testes e deploy.

Responsabilidades:
- Desenvolver telas e componentes em React com TypeScript;
- Consumir e criar APIs REST em Node.js;
- Escrever consultas SQL em banco PostgreSQL;
- Versionar código com Git e abrir pull requests com descrição clara;
- Escrever testes automatizados básicos;
- Participar das cerimônias ágeis (dailies, planning, retrô) em squad com Scrum.

Requisitos obrigatórios:
- Cursando Ciência da Computação, Sistemas de Informação, Análise e Desenvolvimento de Sistemas ou correlatos, com formatura a partir de dezembro de 2026;
- Lógica de programação e conhecimento em JavaScript;
- Git;
- Inglês intermediário para leitura de documentação técnica.

Desejável:
- React, TypeScript, Node.js;
- SQL e PostgreSQL;
- Docker;
- Noções de testes automatizados (Jest);
- Experiência com projetos pessoais ou de faculdade publicados no GitHub.

Competências comportamentais: comunicação clara, trabalho em equipe, proatividade, organização e vontade de aprender.`;

export const SAMPLE_RESUME = `Ana Beatriz Moraes
São Paulo, SP | ana.moraes.dev@email.com | (11) 90000-0000
github.com/anabmoraes | linkedin.com/in/anabmoraes

Objetivo
Estágio na área de desenvolvimento de software.

Formação
Análise e Desenvolvimento de Sistemas — Faculdade Municipal de Tecnologia
Cursando, previsão de conclusão em julho de 2027.

Habilidades
Lógica de programação, HTML, CSS, JavaScript, conhecimentos em banco de dados, versionamento, inglês (leio artigos técnicos sem dificuldade).

Projetos
RootCity (projeto da faculdade, 2025)
Site que mostra pontos de coleta de recicláveis do bairro. Fiz as telas em JavaScript e o consumo de uma API de mapas. Trabalhei em grupo de quatro pessoas, usando quadro de tarefas e reuniões semanais.

Controle de Gastos (projeto pessoal, 2026)
Aplicação para registrar despesas. Fiz o cadastro, a listagem e um resumo por categoria. Guardei os dados em um banco relacional e escrevi as consultas.

Experiência
Atendente — Livraria Página Viva (2024 a 2025)
Atendimento ao público, organização do estoque e fechamento de caixa. Ajudei a montar a planilha de controle de entrada de livros.

Cursos
Introdução à programação web (60h, 2024)
Bootcamp de front-end (80h, 2025)

Idiomas
Português nativo, inglês intermediário.`;
