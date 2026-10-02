import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageCircle, PiggyBank, ReceiptText, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/chat", label: "Conversas", icon: MessageCircle },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/historico", label: "Histórico", icon: ReceiptText },
] as const;

export function AppShell({
  title,
  right,
  children,
  contentClassName,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="app-canvas bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Bolso Claro — início">
            <span className="hero-gradient flex size-9 items-center justify-center rounded-2xl text-primary-foreground shadow-soft">
              <PiggyBank className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              {title ?? "Bolso Claro"}
            </span>
          </Link>
          {right}
        </div>
      </header>

      <main className={cn("px-4 pb-28 pt-4", contentClassName)}>{children}</main>

      <nav
        aria-label="Navegação principal"
        className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/70 bg-card/95 p-1.5 shadow-float backdrop-blur"
      >
        {NAV.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
