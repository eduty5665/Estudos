import { useEffect, useMemo, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ArrowLeft, Plus } from "lucide-react";
import {
  getConversationMessages,
  listConversations,
} from "@/lib/app.functions";
import { useRequireAuth, useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import {
  createChatTransport,
  ChatMessage,
  ThinkingBubble,
  useAutoFocusTextarea,
} from "@/components/chat-parts";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const { loading, signedIn } = useSession();
  useRequireAuth();
  const navigate = useNavigate();

  const messagesQuery = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => getConversationMessages({ data: { id: threadId } }),
    enabled: signedIn,
    retry: false,
  });

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
    enabled: signedIn,
  });

  useEffect(() => {
    if (messagesQuery.isError) {
      toast.error("Conversa não encontrada.");
      navigate({ to: "/chat", replace: true });
    }
  }, [messagesQuery.isError, navigate]);

  if (loading || !signedIn || messagesQuery.isPending) {
    return (
      <div className="app-canvas flex h-dvh flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <span className="size-9 animate-pulse rounded-full bg-secondary" />
          <span className="h-4 w-40 animate-pulse rounded-full bg-secondary" />
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Carregando conversa…
        </div>
      </div>
    );
  }

  const initialMessages: UIMessage[] = (messagesQuery.data ?? []).map((m) => ({
    id: m.message_id,
    role:
      m.role === "user" ? "user" : m.role === "assistant" ? "assistant" : "system",
    parts: (m.parts ?? []) as UIMessage["parts"],
  }));

  const title =
    conversationsQuery.data?.find((c) => c.id === threadId)?.title ?? "Conversa";

  return (
    <ChatWindow
      key={threadId}
      conversationId={threadId}
      title={title}
      initialMessages={initialMessages}
    />
  );
}

const SUGGESTIONS = [
  "Gastei 42 reais no almoço",
  "Recebi 3000 de salário",
  "Quero juntar R$ 2.000 em 6 meses",
];

function ChatWindow({
  conversationId,
  title,
  initialMessages,
}: {
  conversationId: string;
  title: string;
  initialMessages: UIMessage[];
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const composerRef = useAutoFocusTextarea(true);

  const getHeaders = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const transport = useMemo(() => createChatTransport(conversationId, getHeaders), [conversationId]);

  const { messages, sendMessage, status, stop } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onError: (event) => {
      toast.error(event.message || "Não foi possível falar com o agente agora.");
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onFinish: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const busy = status === "submitted" || status === "streaming";

  async function handleSubmit({ text }: { text?: string }) {
    const value = text?.trim();
    if (!value || busy) return;
    await sendMessage({ text: value });
    composerRef.current?.querySelector("textarea")?.focus();
  }

  return (
    <div className="app-canvas flex h-dvh flex-col bg-background">
      <header className="flex items-center gap-2 border-b border-border/60 bg-background px-3 py-2.5">
        <button
          type="button"
          aria-label="Voltar para conversas"
          onClick={() => navigate({ to: "/chat" })}
          className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Bolso Claro</p>
        </div>
      </header>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-xl space-y-4 px-4 py-4">
          {messages.length === 0 ? (
            <div className="pt-8">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Oi! Sobre o que vamos conversar?
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Pode falar de dinheiro do jeito que você fala no dia a dia — eu
                organizo tudo por você.
              </p>
              <div className="mt-5 space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSubmit({ text: s })}
                    className="w-full rounded-2xl border border-border/70 bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/50"
                  >
                    “{s}”
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {status === "submitted" && <ThinkingBubble />}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div
        ref={composerRef}
        className="border-t border-border/60 bg-background px-4 pb-[4.75rem] pt-3"
      >
        <PromptInput
          onSubmit={handleSubmit}
          className="rounded-3xl border-input bg-card"
        >
          <PromptInputTextarea
            rows={1}
            placeholder="Escreva como fala: “gastei 45 no almoço”"
            aria-label="Mensagem para o agente"
          />
          <PromptInputFooter className="justify-end pt-1">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>

      <button
        type="button"
        aria-label="Nova conversa"
        onClick={() => navigate({ to: "/chat" })}
        className="fixed bottom-[5.75rem] right-[max(1rem,calc(50%-14rem))] z-20 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
      >
        <Plus className="size-5" />
      </button>
    </div>
  );
}
