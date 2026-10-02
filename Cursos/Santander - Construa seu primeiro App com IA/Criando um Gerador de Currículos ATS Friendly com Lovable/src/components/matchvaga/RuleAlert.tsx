import { ShieldCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { APP_RULE } from "@/lib/matchvaga";

export function RuleAlert() {
  return (
    <Alert className="border-primary/30 bg-accent/60">
      <ShieldCheck className="size-4 text-primary" />
      <AlertTitle className="text-primary">Regra do MatchVaga</AlertTitle>
      <AlertDescription className="text-foreground/80">{APP_RULE}</AlertDescription>
    </Alert>
  );
}
