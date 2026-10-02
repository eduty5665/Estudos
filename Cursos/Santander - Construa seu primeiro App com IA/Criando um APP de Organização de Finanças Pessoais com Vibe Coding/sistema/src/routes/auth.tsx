import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { Loader2, PiggyBank } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { signedIn, loading } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && signedIn) {
      router.navigate({ to: "/", replace: true });
    }
  }, [loading, signedIn, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name || undefined } },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (!data.session) {
          toast.success(
            "Conta criada! Confirme seu e-mail pelo link que enviamos para entrar.",
            { duration: 8000 },
          );
          setMode("signin");
          return;
        }
        router.navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast.error(
            error.message === "Invalid login credentials"
              ? "E-mail ou senha incorretos."
              : error.message,
          );
          return;
        }
        router.navigate({ to: "/", replace: true });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google agora.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="hero-gradient px-6 pb-14 pt-16 text-primary-foreground">
        <span className="flex size-14 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
          <PiggyBank className="size-7" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
          Bolso Claro
        </h1>
        <p className="mt-2 max-w-sm text-sm text-primary-foreground/85">
          Suas finanças organizadas conversando. Sem planilha, sem culpa.
        </p>
      </div>

      <div className="mx-4 -mt-8 rounded-3xl border border-border/70 bg-card p-6 shadow-float">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                mode === m
                  ? "rounded-full bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-soft"
                  : "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground"
              }
            >
              {m === "signin" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Como te chamamos?
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring/40 transition focus:ring-2"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring/40 transition focus:ring-2"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring/40 transition focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Entrar" : "Criar minha conta"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-input bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.15.57 4.32 1.69l3.22-3.22C17.55 1.64 15.0.64 12 .64 7.42.64 3.44 3.26 1.53 7.1l3.76 2.92C6.17 7.32 8.86 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.36 12.26c0-.85-.08-1.67-.22-2.45H12v4.64h6.36c-.27 1.46-1.1 2.7-2.34 3.53l3.65 2.83c2.13-1.97 3.69-4.88 3.69-8.55z"
            />
            <path
              fill="#FBBC05"
              d="M5.29 14.3a6.9 6.9 0 0 1 0-4.28L1.53 7.1a11.36 11.36 0 0 0 0 10.12l3.76-2.92z"
            />
            <path
              fill="#34A853"
              d="M12 23.36c3.04 0 5.6-1 7.46-2.72l-3.65-2.83c-1.02.68-2.32 1.09-3.81 1.09-3.14 0-5.83-2.28-6.71-5.38l-3.76 2.92c1.91 3.84 5.89 6.92 10.47 6.92z"
            />
          </svg>
          Continuar com Google
        </button>
      </div>

      <p className="mx-auto mt-6 max-w-xs px-4 text-center text-xs leading-relaxed text-muted-foreground">
        O agente organiza seus gastos, sugere planos de economia e nunca dá bronca.
        Sem recomendações de investimento.
      </p>
    </div>
  );
}
