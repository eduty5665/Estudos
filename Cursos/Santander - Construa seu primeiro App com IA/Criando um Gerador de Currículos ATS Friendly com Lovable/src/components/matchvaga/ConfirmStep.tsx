import { BookOpen, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Keyword } from "@/lib/matchvaga";

export type Confirmation = { checked: boolean; where: string };

export function ConfirmStep({
  missing,
  confirmations,
  onChange,
  onGenerate,
  generating,
}: {
  missing: Keyword[];
  confirmations: Record<string, Confirmation>;
  onChange: (term: string, value: Confirmation) => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  const toStudy = missing.filter((k) => !confirmations[k.term]?.checked);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Marque somente o que você realmente tem e diga onde isso aparece. O que ficar desmarcado vai
        para a lista “Para estudar” e nunca entra no currículo.
      </p>

      <div className="space-y-3">
        {missing.map((k) => {
          const value = confirmations[k.term] ?? { checked: false, where: "" };
          return (
            <div
              key={k.term}
              className="rounded-lg border border-border bg-muted/40 p-3 sm:flex sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id={`confirm-${k.term}`}
                  checked={value.checked}
                  onCheckedChange={(checked) =>
                    onChange(k.term, { ...value, checked: checked === true })
                  }
                />
                <Label htmlFor={`confirm-${k.term}`} className="cursor-pointer font-medium">
                  Eu tenho {k.term}
                </Label>
              </div>
              <Input
                className="mt-2 sm:mt-0 sm:flex-1"
                placeholder="Onde? Ex.: Projeto da faculdade RootCity"
                value={value.where}
                disabled={!value.checked}
                maxLength={200}
                onChange={(event) => onChange(k.term, { ...value, where: event.target.value })}
              />
            </div>
          );
        })}
      </div>

      {toStudy.length > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning-soft/60 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning-foreground">
            <BookOpen className="size-4" /> Para estudar
          </p>
          <p className="mt-1 text-sm text-foreground/75">
            {toStudy.map((k) => k.term).join(", ")}
          </p>
        </div>
      )}

      <Button size="lg" className="w-full sm:w-auto" onClick={onGenerate} disabled={generating}>
        <Sparkles className="size-4" />
        {generating ? "Gerando currículo…" : "Gerar currículo ATS friendly"}
      </Button>
    </div>
  );
}
