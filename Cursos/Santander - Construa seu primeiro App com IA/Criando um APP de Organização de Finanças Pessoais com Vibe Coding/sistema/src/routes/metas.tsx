import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Target } from "lucide-react";
import { listGoals, setGoalStatus } from "@/lib/app.functions";
import { useRequireAuth, useSession } from "@/hooks/use-session";
import { AppShell } from "@/components/app-shell";
import { formatDate, formatBRL } from "@/lib/finance";
import { toast } from "sonner";

export const Route = createFileRoute("/metas")({
  component: GoalsPage,
});

type Plan = { monthly_saving?: number | string; months?: number; deadline?: string };

function GoalCard({
  goal,
  onComplete,
  busy,
}: {
  goal: {
    id: string;
    title: string;
    target_amount: number;
    saved_amount: number;
    deadline: string | null;
    plan: unknown;
  };
  onComplete: () => void;
  busy: boolean;
}) {
  const target = Number(goal.target_amount);
  const saved = Number(goal.saved_amount);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const plan = goal.plan as Plan | null;

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{goal.title}</p>
          {goal.deadline ? (
            <p className="text-xs text-muted-foreground">Até {formatDate(goal.deadline)}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Sem prazo definido</p>
          )}
        </div>
        <span
          className={
            pct >= 100
              ? "shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground"
              : "shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground"
          }
        >
          {pct}%
        </span>
      </div>

      <p className="mt-3 text-sm">
        <span className="font-semibold">{formatBRL(saved)}</span>
        <span className="text-muted-foreground"> de {formatBRL(target)}</span>
      </p>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {plan && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {plan.monthly_saving != null && (
            <li>
              💡 Guardando {formatBRL(Number(plan.monthly_saving))} por mês você
              chega lá.
            </li>
          )}
          {plan.months != null && <li>Prazo estimado: {plan.months} meses.</li>}
        </ul>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onComplete}
          disabled={busy}
          className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          {pct >= 100 ? "Marcar como realizada ✓" : "Marcar como realizada"}
        </button>
      </div>
    </div>
  );
}

function GoalsPage() {
  const { loading, signedIn } = useSession();
  useRequireAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = [null, null] as const;

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: () => listGoals(),
    enabled: signedIn,
  });

  async function handleComplete(id: string) {
    try {
      await setGoalStatus({ data: { id, status: "completed" } });
      await queryClient.invalidateQueries({ queryKey: ["goals"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meta realizada! Que orgulho. 🎉");
    } catch {
      toast.error("Não foi possível atualizar a meta.");
    }
  }

  if (loading || !signedIn) return null;

  const goals = goalsQuery.data ?? [];

  return (
    <AppShell title="Metas">
      {goalsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : goals.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <Target className="size-6 text-primary" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold">
            Nenhuma meta ainda
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Fale com o agente: “quero juntar R$ 2.000 em 6 meses” — ele monta o
            plano mensal pra você.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/chat" })}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              busy={busyId === goal.id}
              onComplete={() => handleComplete(goal.id)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
