import { Info } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { matchLabel } from "@/lib/matchvaga";

export function MatchScore({
  match,
  title = "Match com a vaga",
}: {
  match: number;
  title?: string;
}) {
  const label = matchLabel(match);
  const labelTone =
    label === "Alto" ? "text-success" : label === "Médio" ? "text-warning" : "text-destructive";

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {title}
            <Tooltip>
              <TooltipTrigger aria-label="Como o match é calculado">
                <Info className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Cada palavra-chave da vaga vale 1 ponto, e as obrigatórias valem 2. O match é o total
                encontrado no seu currículo dividido pelo total possível.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="mt-1 text-5xl font-extrabold tracking-tight tabular-nums">{match}%</p>
        </div>
        <span className={`text-lg font-semibold ${labelTone}`}>{label}</span>
      </div>
      <Progress value={match} className="h-3" />
    </div>
  );
}
