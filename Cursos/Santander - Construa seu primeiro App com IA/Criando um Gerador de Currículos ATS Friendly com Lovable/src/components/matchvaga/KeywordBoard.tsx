import { useState } from "react";
import { Check, Star, X } from "lucide-react";

import { GROUP_LABELS, type Keyword, type KeywordGroup } from "@/lib/matchvaga";

const GROUP_ORDER: KeywordGroup[] = ["hard_skill", "tool", "soft_skill", "requirement"];

export function KeywordBoard({ keywords }: { keywords: Keyword[] }) {
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const active = keywords.find((k) => k.term === openTerm && k.found && k.evidence);

  return (
    <div className="space-y-5">
      {GROUP_ORDER.map((group) => {
        const items = keywords.filter((k) => k.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
              {GROUP_LABELS[group]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {items.map((k) => (
                <button
                  key={`${group}-${k.term}`}
                  type="button"
                  onClick={() => setOpenTerm(openTerm === k.term ? null : k.term)}
                  disabled={!k.found || !k.evidence}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    k.found
                      ? "border-success/40 bg-success-soft text-success"
                      : "border-warning/40 bg-warning-soft text-warning-foreground",
                    k.found && k.evidence ? "cursor-pointer hover:border-success" : "cursor-default",
                    openTerm === k.term && k.found ? "ring-2 ring-success/40" : "",
                  ].join(" ")}
                >
                  {k.found ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  {k.term}
                  {k.required && <Star className="size-3 fill-current" />}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {active && (
        <div className="rounded-lg border border-success/30 bg-success-soft/60 p-3 text-sm">
          <p className="font-semibold text-success">Evidência de “{active.term}” no seu currículo</p>
          <p className="mt-1 text-foreground/80">“{active.evidence}”</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Verde: encontrada no currículo. Âmbar: faltando. A estrela marca requisito obrigatório da
        vaga. Clique numa verde para ver o trecho que serviu de evidência.
      </p>
    </div>
  );
}
