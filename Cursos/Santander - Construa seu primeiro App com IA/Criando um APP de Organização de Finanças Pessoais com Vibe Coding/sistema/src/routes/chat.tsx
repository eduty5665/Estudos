import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  createConversation,
  deleteConversation,
  listConversations,
} from "@/lib/app.functions";
import { useRequireAuth, useSession } from "@/hooks/use-session";
import { AppShell } from "@/components/app-shell";
import { Loader2, MessageCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  component: ConversationsPage,
});

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}

function ConversationsPage() {
  const { loading, signedIn } = useSession();
  useRequireAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
    enabled: signedIn,
  });

  async function handleNew() {
    try {
      const conversation = await createConversation();
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      await navigate({ to: "/chat/$threadId", params: { threadId: conversation.id } });
    } catch {
      toast.error("Não foi possível criar a conversa.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteConversation({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversa apagada.");
    } catch {
      toast.error("Não foi possível apagar a conversa.");
    }
  }

  if (loading || !signedIn) return null;
  const conversations = conversationsQuery.data ?? [];

  return (
    <AppShell
      title="Conversas"
      right={
        <button
          type="button"
          onClick={handleNew}
          disabled={conversationsQuery.isLoading}
          className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> Nova
        </button>
      }
    >
      {conversationsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <MessageCircle className="size-6 text-primary" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold">Nenhuma conversa ainda</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Comece registrando um gasto do jeito que você fala: "gastei 45 no almoço".
          </p>
          <button
            type="button"
            onClick={handleNew}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" /> Primeira conversa
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-3.5 transition-colors hover:border-primary/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                <MessageCircle className="size-4 text-primary" />
              </span>
              <button
                type="button"
                onClick={() =>
                  navigate({ to: "/chat/$threadId", params: { threadId: c.id } })
                }
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(c.updated_at)}</p>
              </button>
              <button
                type="button"
                aria-label={`Apagar conversa ${c.title}`}
                onClick={() => handleDelete(c.id)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
