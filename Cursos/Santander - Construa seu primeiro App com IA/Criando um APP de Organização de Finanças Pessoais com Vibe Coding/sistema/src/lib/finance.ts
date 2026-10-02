export const CATEGORIES = [
  { id: "alimentacao", label: "Alimentação", emoji: "🍽️" },
  { id: "transporte", label: "Transporte", emoji: "🚌" },
  { id: "moradia", label: "Moradia", emoji: "🏠" },
  { id: "lazer", label: "Lazer", emoji: "🎈" },
  { id: "saude", label: "Saúde", emoji: "💚" },
  { id: "educacao", label: "Educação", emoji: "📚" },
  { id: "compras", label: "Compras", emoji: "🛍️" },
  { id: "servicos", label: "Serviços", emoji: "🧾" },
  { id: "outros", label: "Outros", emoji: "✳️" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

const CATEGORY_MAP = new Map<string, (typeof CATEGORIES)[number]>(
  CATEGORIES.map((c) => [c.id, c]),
);

/** Normaliza texto livre vindo da IA/usuário para uma categoria conhecida. */
export function normalizeCategory(raw: string): CategoryId {
  const value = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  const direct = CATEGORY_MAP.get(value);
  if (direct) return direct.id;
  const aliases: Array<[CategoryId, string[]]> = [
    ["alimentacao", ["food", "mercado", "restaurante", "almoço", "jantar", "cafe", "ifood", "snack"]],
    ["transporte", ["uber", "onibus", "gasolina", "combustivel", "metro", "99", "carro"]],
    ["moradia", ["aluguel", "conta de luz", "luz", "agua", "internet", "condominio", "casa"]],
    ["lazer", ["bar", "cinema", "festa", "jogo", "streaming", "viagem", "show"]],
    ["saude", ["farmacia", "remedio", "medico", "academia", "dentista", "terapia"]],
    ["educacao", ["curso", "livro", "escola", "faculdade", "aula"]],
    ["compras", ["roupa", "presente", "shopping", "eletronico", "amazon", "shopee"]],
    ["servicos", ["assinatura", "plano", "netflix", "spotify", "telefone", "assinaturas"]],
  ];
  for (const [id, words] of aliases) {
    if (words.some((w) => value.includes(w))) return id;
  }
  for (const c of CATEGORIES) {
    const bare = c.id;
    if (value.includes(bare) || bare.includes(value)) return c.id;
  }
  return "outros";
}

export function categoryLabel(id: string): string {
  return CATEGORY_MAP.get(id)?.label ?? "Outros";
}

export function categoryEmoji(id: string): string {
  return CATEGORY_MAP.get(id)?.emoji ?? "✳️";
}

export function formatBRL(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(num) ? num : 0);
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

export function todayISO(): string {
  const now = new Date();
  const off = now.getTimezoneOffset();
  return new Date(now.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** Faixa do mês corrente (inclusive) em YYYY-MM-DD. */
export function currentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toISO = (d: Date) => {
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
  };
  return { start: toISO(start), end: toISO(end) };
}

/** Sugestão gentil de limite por categoria, como fração da renda mensal. */
export const SUGGESTED_SHARE: Record<CategoryId, number> = {
  alimentacao: 0.25,
  transporte: 0.15,
  moradia: 0.3,
  lazer: 0.1,
  saude: 0.08,
  educacao: 0.07,
  compras: 0.07,
  servicos: 0.05,
  outros: 0.05,
};

export type TransactionRow = {
  id: string;
  description: string;
  amount: number | string;
  type: "income" | "expense" | string;
  category: string;
  occurred_at: string;
  source?: string;
};

export type GoalRow = {
  id: string;
  title: string;
  target_amount: number | string;
  saved_amount: number | string;
  deadline: string | null;
  status: string;
  plan: unknown;
};

export type ConversationRow = {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
};

export type StoredMessageRow = {
  id: string;
  message_id: string;
  role: string;
  parts: unknown;
  created_at: string;
};
