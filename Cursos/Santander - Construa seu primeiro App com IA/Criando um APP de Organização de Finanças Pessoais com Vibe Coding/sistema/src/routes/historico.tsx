import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import {
  addTransaction,
  listTransactions,
} from "@/lib/app.functions";
import { useRequireAuth, useSession } from "@/hooks/use-session";
import { AppShell } from "@/components/app-shell";
import {
  CATEGORIES,
  categoryEmoji,
  categoryLabel,
  formatBRL,
  formatDate,
  todayISO,
} from "@/lib/finance";
import { toast } from "sonner";

export const Route = createFileRoute("/historico")({
  component: HistoryPage,
});

function QuickAddForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState<string>("alimentacao");
  const [occurredAt, setOccurredAt] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  const canSave = description.trim().length > 0 && Number(amount.replace(",", ".")) > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setBusy(true);
    try {
      await addTransaction({
        data: {
          description: description.trim(),
          amount: Number(amount.replace(",", ".")),
          type,
          category,
          occurred_at: occurredAt,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Lançamento salvo!");
      setDescription("");
      setAmount("");
      setBusy(false);
      onDone();
    } catch {
      setBusy(false);
      toast.error("Não foi possível salvar o lançamento.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="O que foi? Ex.: almoço"
        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring/40 transition focus:ring-2"
      />
      <div className="flex gap-2">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor (R$)"
          className="w-36 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring/40 transition focus:ring-2"
        />
        <input
          type="date"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 transition focus:ring-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={
            type === "expense"
              ? "rounded-xl border-2 border-primary bg-secondary px-3 py-2 text-xs font-semibold"
              : "rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground"
          }
        >
          Saída
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={
            type === "income"
              ? "rounded-xl border-2 border-primary bg-secondary px-3 py-2 text-xs font-semibold"
              : "rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground"
          }
        >
          Entrada
        </button>
      </div>
      {type === "expense" && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Categoria"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 transition focus:ring-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      )}
      <button
        type="submit"
        disabled={!canSave || busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        Salvar lançamento
      </button>
    </form>
  );
}

function HistoryPage() {
  const { loading, signedIn } = useSession();
  useRequireAuth();
  const [showForm, setShowForm] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: () => listTransactions(),
    enabled: signedIn,
  });

  if (loading || !signedIn) return null;

  const transactions = transactionsQuery.data ?? [];
  const groups = new Map<string, typeof transactions>();
  for (const t of transactions) {
    const list = groups.get(t.occurred_at) ?? [];
    list.push(t);
    groups.set(t.occurred_at, list);
  }

  return (
    <AppShell title="Histórico">
      <div className="rounded-2xl border border-border/70 bg-card p-2">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <Plus className="size-4 text-primary" /> Lançamento rápido
          </span>
          <span className="text-xs text-muted-foreground">
            {showForm ? "fechar" : "abrir"}
          </span>
        </button>
        {showForm && (
          <div className="px-3 pb-3 pt-1">
            <QuickAddForm onDone={() => setShowForm(false)} />
          </div>
        )}
      </div>

      {transactionsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="font-display text-lg font-semibold">Nada por aqui ainda</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Registre pelo chat ou use o lançamento rápido acima.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {[...groups.entries()].map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {formatDate(day)}
              </h2>
              <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card">
                {items.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm">
                      {t.type === "income" ? "💵" : categoryEmoji(t.category)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.type === "income" ? "Entrada" : categoryLabel(t.category)}
                      </p>
                    </div>
                    <span
                      className={
                        t.type === "income"
                          ? "shrink-0 text-sm font-semibold text-income"
                          : "shrink-0 text-sm font-semibold text-foreground"
                      }
                    >
                      {t.type === "income" ? "+" : "−"} {formatBRL(Number(t.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
