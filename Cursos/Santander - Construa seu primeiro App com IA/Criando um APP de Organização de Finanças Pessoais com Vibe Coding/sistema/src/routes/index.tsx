import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboard, getProfile } from "@/lib/app.functions";
import { useRequireAuth, useSession } from "@/hooks/use-session";
import {
  categoryEmoji,
  categoryLabel,
  formatBRL,
  formatDate,
  SUGGESTED_SHARE,
  type CategoryId,
  type GoalRow,
  type TransactionRow,
} from "@/lib/finance";
import { AppShell } from "@/components/app-shell";
import { ArrowDownLeft, ArrowUpRight, LogOut, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { loading, signedIn, session } = useSession();
  useRequireAuth();
  const navigate = useNavigate();

  const enabled = signedIn;
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled,
  });
  const dashQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    enabled,
  });

  const onboarded = profileQuery.data?.onboarded;
  useEffect(() => {
    if (enabled && profileQuery.isSuccess && onboarded === false) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [enabled, profileQuery.isSuccess, onboarded, navigate]);

  if (loading || !signedIn || dashQuery.isLoading || profileQuery.isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  const dash = dashQuery.data;
  if (!dash) return null;

  const balance = dash.monthIncome - dash.monthExpense;
  const firstName = (dash.profile?.display_name ?? "").split(" ")[0];
  const maxCategory = Math.max(1, ...Object.values(dash.byCategory));
  const income = Number(dash.profile?.monthly_income ?? 0) || dash.monthIncome;

  const alerts = (Object.entries(dash.byCategory) as [CategoryId, number][])
    .map(([category, spent]) => {
      const limit = income * (SUGGESTED_SHARE[category] ?? 0.05);
      return { category, spent, limit, ratio: limit > 0 ? spent / limit : 0 };
    })
    .filter((a) => a.ratio >= 0.8)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 2);

  const hasNoTransactions = dash.recent.length === 0;

  return (
    <AppShell
      right={
        <button
          type="button"
          aria-label="Sair da conta"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth", replace: true });
          }}
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
        >
          <LogOut className="size-4" />
        </button>
      }
    >
      <div className="space-y-5">
        <section className="hero-gradient animate-rise rounded-3xl p-5 text-primary-foreground shadow-float">
          <p className="text-sm text-primary-foreground/80">
            {firstName ? `Olá, ${firstName}` : "Olá"} · este mês
          </p>
          <p className="mt-1 font-display text-4xl font-bold tracking-tight">
            {formatBRL(balance)}
          </p>
          <p className="mt-0.5 text-xs text-primary-foreground/70">saldo do mês</p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-2xl bg-white/12 px-3 py-2.5 backdrop-blur-sm">
              <p className="flex items-center gap-1 text-xs text-primary-foreground/75">
                <ArrowUpRight className="size-3.5" /> Entradas
              </p>
              <p className="mt-0.5 text-sm font-semibold">{formatBRL(dash.monthIncome)}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/12 px-3 py-2.5 backdrop-blur-sm">
              <p className="flex items-center gap-1 text-xs text-primary-foreground/75">
                <ArrowDownLeft className="size-3.5" /> Saídas
              </p>
              <p className="mt-0.5 text-sm font-semibold">{formatBRL(dash.monthExpense)}</p>
            </div>
          </div>
        </section>

        {hasNoTransactions && (
          <section className="animate-rise rounded-3xl border border-dashed border-border bg-card p-6 text-center">
            <p className="font-display text-lg font-semibold">Comece pelo mais fácil</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              Fale com o agente como se fosse um amigo: "gastei 42 reais no almoço".
            </p>
            <Link
              to="/chat"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircle className="size-4" /> Conversar com o agente
            </Link>
          </section>
        )}

        {alerts.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Alertas gentis</h2>
            {alerts.map((a) => (
              <p
                key={a.category}
                className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground"
              >
                <span className="font-medium text-foreground">
                  {categoryLabel(a.category)}
                </span>{" "}
                passou de {Math.round(a.ratio * 100)}% do limite sugerido do mês. Vale
                dar uma olhadinha — sem pressa.
              </p>
            ))}
          </section>
        )}

        {Object.keys(dash.byCategory).length > 0 && (
          <section className="animate-rise rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Para onde foi o dinheiro</h2>
            <div className="mt-4 space-y-3">
              {(Object.entries(dash.byCategory) as [CategoryId, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([category, spent]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {categoryEmoji(category)} {categoryLabel(category)}
                      </span>
                      <span className="text-muted-foreground">{formatBRL(spent)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                        style={{ width: `${Math.max(6, (spent / maxCategory) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {dash.goals.length > 0 && <GoalsPreview goals={dash.goals} />}

        {dash.recent.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Últimos lançamentos</h2>
              <Link to="/historico" className="text-xs font-medium text-primary hover:underline">
                ver tudo
              </Link>
            </div>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70 bg-card">
              {dash.recent.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-base">
                    {categoryEmoji(t.category)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryLabel(t.category)} · {formatDate(t.occurred_at)}
                    </p>
                  </div>
                  <span
                    className={
                      t.type === "income"
                        ? "text-sm font-semibold text-income"
                        : "text-sm font-semibold text-expense"
                    }
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatBRL(Number(t.amount))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function GoalsPreview({ goals }: { goals: GoalRow[] }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Suas metas</h2>
        <Link to="/metas" className="text-xs font-medium text-primary hover:underline">
          ver todas
        </Link>
      </div>
      <div className="space-y-2">
        {goals.slice(0, 2).map((g) => {
          const pct = Math.min(
            100,
            Math.round((Number(g.saved_amount) / Math.max(1, Number(g.target_amount))) * 100),
          );
          return (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary">
                <Sparkles className="size-4 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{g.title}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export type { TransactionRow };
