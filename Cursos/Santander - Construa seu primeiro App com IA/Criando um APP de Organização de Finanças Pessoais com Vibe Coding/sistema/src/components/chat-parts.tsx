import { useEffect, useRef } from "react";
import { DefaultChatTransport, type ToolUIPart, type UIMessage } from "ai";
import type { LucideIcon } from "lucide-react";
import { PiggyBank, ReceiptText, Target, Wrench } from "lucide-react";
import { categoryLabel, formatBRL } from "@/lib/finance";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

const TOOL_META: Record<string, { label: string; Icon: LucideIcon }> = {
  add_transaction: { label: "Lançamento", Icon: ReceiptText },
  create_goal: { label: "Nova meta", Icon: Target },
  update_goal_saved: { label: "Aporte na meta", Icon: PiggyBank },
};

type ToolResult = {
  ok?: boolean;
  type?: string;
  amount?: number | string;
  category?: string;
  goal?: string;
  guardado?: number | string;
  title?: string;
  target_amount?: number | string;
};

function toolSummary(part: ToolUIPart): { label: string; Icon: LucideIcon; done: boolean } {
  const name = part.type.startsWith("tool-") ? part.type.slice(5) : part.type;
  const meta = TOOL_META[name] ?? { label: name, Icon: Wrench };
  const out = part.output as ToolResult | undefined;

  if (part.state === "output-error" || (out && out.ok === false)) {
    return { label: "Não consegui salvar", Icon: meta.Icon, done: false };
  }
  if (part.state !== "output-available" || !out?.ok) {
    return { label: meta.label, Icon: meta.Icon, done: false };
  }

  if (name === "add_transaction") {
    const isIncome = out.type === "income";
    return {
      label: `${isIncome ? "+" : "−"} ${formatBRL(Number(out.amount))} · ${categoryLabel(String(out.category))}`,
      Icon: meta.Icon,
      done: true,
    };
  }
  if (name === "update_goal_saved") {
    return {
      label: `+ ${formatBRL(Number(out.guardado))} em ${out.goal}`,
      Icon: meta.Icon,
      done: true,
    };
  }
  if (name === "create_goal") {
    return {
      label: `${out.title} · alvo ${formatBRL(Number(out.target_amount))}`,
      Icon: meta.Icon,
      done: true,
    };
  }
  return { label: meta.label, Icon: meta.Icon, done: true };
}

function ChatToolPart({ part }: { part: ToolUIPart }) {
  const { label, Icon, done } = toolSummary(part);

  return (
    <div className="space-y-1">
      <div
        className={
          done
            ? "inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
            : "inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground"
        }
      >
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <Tool defaultOpen={false} className="rounded-2xl border-border/60">
        <ToolHeader title="Ver detalhes" type={part.type} state={part.state} />
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput output={part.output} errorText={part.errorText} />
        </ToolContent>
      </Tool>
    </div>
  );
}

export function ChatMessage({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    const text = message.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { text: string }).text)
      .join("");
    return (
      <Message from="user" className="justify-end">
        <MessageContent className="max-w-[85%] rounded-3xl rounded-br-md border-0 bg-primary px-4 py-2.5 text-primary-foreground">
          {text}
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant" className="items-start">
      <MessageContent className="max-w-full rounded-3xl rounded-bl-md border-0 bg-card px-4 py-3">
        <div className="space-y-2">
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              const text = (part as { text: string }).text;
              if (!text.trim()) return null;
              return <MessageResponse key={index}>{text}</MessageResponse>;
            }
            if (part.type.startsWith("tool-")) {
              return <ChatToolPart key={index} part={part as ToolUIPart} />;
            }
            return null;
          })}
        </div>
      </MessageContent>
    </Message>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex items-center gap-2 pl-1">
      <span className="flex size-7 items-center justify-center rounded-full bg-secondary">
        <PiggyBank className="size-4 text-primary" />
      </span>
      <Shimmer className="text-sm text-muted-foreground">Pensando…</Shimmer>
    </div>
  );
}

export function useAutoFocusTextarea(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => {
      ref.current?.querySelector("textarea")?.focus();
    }, 50);
    return () => window.clearTimeout(id);
  }, [enabled]);
  return ref;
}

export function createChatTransport(
  conversationId: string,
  getHeaders: () => Promise<Record<string, string>>,
) {
  return new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest: async ({ messages }) => ({
      headers: await getHeaders(),
      body: { conversationId, messages },
    }),
  });
}
