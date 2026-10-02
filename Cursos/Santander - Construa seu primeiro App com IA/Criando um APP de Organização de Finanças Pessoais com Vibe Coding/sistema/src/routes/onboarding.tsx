import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProfile, saveOnboarding } from "@/lib/app.functions";
import { useRequireAuth, useSession } from "@/hooks/use-session";
import { AppShell } from "@/components/app-shell";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const OBJECTIVES = [
  { id: "poupar", label: "Começar a poupar" },
  { id: "dividas", label: "Sair das dívidas" },
  { id: "sonho", label: "Realizar um sonho" },
  { id: "organizar", label: "Só organizar os gastos" },
];

function OnboardingPage() {
  const { loading, signedIn } = useSession();
  useRequireAuth();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: signedIn,
  });
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [objective, setObjective] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadedName, setLoadedName] = useState(false);

  useEffect(() => {
    const p = profileQuery.data;
    if (p && !loadedName) {
      setName(p.display_name ?? "");
      setLoadedName(true);
    }
  }, [profileQuery.data, loadedName]);

  if (loading || !signedIn || profileQuery.isLoading) return null;

  const canSave = name.trim().length > 0 && objective !== null;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setBusy(true);
    try {
      const parsedIncome = income ? Number(income.replace(/[^\d,.]/g, "").replace(",", ".")) : null;
      await saveOnboarding({
        data: {
          display_name: name.trim(),
          monthly_income: parsedIncome !== null && Number.isFinite(parsedIncome) ? parsedIncome : null,
          main_goal: objective,
        },
      });
      navigate({ to: "/chat", replace: true });
    } catch {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Bem-vindo(a)">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Vamos deixar seu bolso claro
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Três perguntas rápidas — o agente usa isso para montar seu plano.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="onb-name" className="text-sm font-medium">
            Como te chamamos?
          </label>
          <input
            id="onb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome ou apelido"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring/40 transition focus:ring-2"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="onb-income" className="text-sm font-medium">
            Renda por mês <span className="text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="onb-income"
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Ex.: 3000"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-ring/40 transition focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">O que você quer agora?</span>
          <div className="grid grid-cols-2 gap-2">
            {OBJECTIVES.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setObjective(o.id)}
                className={
                  objective === o.id
                    ? "rounded-2xl border-2 border-primary bg-secondary px-4 py-3 text-sm font-semibold text-foreground"
                    : "rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50"
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSave || busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          Entrar no app
        </button>
      </form>
    </AppShell>
  );
}
