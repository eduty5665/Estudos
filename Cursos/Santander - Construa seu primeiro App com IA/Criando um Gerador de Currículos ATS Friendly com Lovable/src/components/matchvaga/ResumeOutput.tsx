import { Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { RuleAlert } from "@/components/matchvaga/RuleAlert";
import { MatchScore } from "@/components/matchvaga/MatchScore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResumeOutput({
  resume,
  changes,
  match,
  onRestart,
}: {
  resume: string;
  changes: string[];
  match: number;
  onRestart: () => void;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(resume);
      toast.success("Currículo copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  function download() {
    const blob = new Blob([resume], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "curriculo-ats-friendly.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <RuleAlert />

      <Card className="panel">
        <CardHeader>
          <CardTitle>Currículo ajustado</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-sans text-sm leading-relaxed">
            {resume}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={copy}>
              <Copy className="size-4" /> Copiar texto
            </Button>
            <Button variant="secondary" onClick={download}>
              <Download className="size-4" /> Baixar .txt
            </Button>
            <Button variant="ghost" onClick={onRestart}>
              <RotateCcw className="size-4" /> Nova análise
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="panel">
          <CardHeader>
            <CardTitle>O que mudou</CardTitle>
          </CardHeader>
          <CardContent>
            {changes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
            ) : (
              <ul className="space-y-2 text-sm text-foreground/80">
                {changes.map((change, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {change}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="panel">
          <CardHeader>
            <CardTitle>Match estimado do novo currículo</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchScore match={match} title="Novo match" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
