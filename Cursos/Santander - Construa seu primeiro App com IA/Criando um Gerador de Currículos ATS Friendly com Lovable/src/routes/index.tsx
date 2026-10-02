import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { FileSearch, Info, Lightbulb, ListChecks, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { AtsChecklistPanel } from "@/components/matchvaga/AtsChecklistPanel";
import { ConfirmStep, type Confirmation } from "@/components/matchvaga/ConfirmStep";
import { KeywordBoard } from "@/components/matchvaga/KeywordBoard";
import { MatchScore } from "@/components/matchvaga/MatchScore";
import { ResumeOutput } from "@/components/matchvaga/ResumeOutput";
import { RuleAlert } from "@/components/matchvaga/RuleAlert";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResume } from "@/lib/analyze.functions";
import {
  APP_RULE,
  MAX_CHARS,
  MIN_CHARS,
  SAMPLE_JOB,
  SAMPLE_RESUME,
  calcMatch,
  type AnalysisResult,
} from "@/lib/matchvaga";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchVaga ATS — seu currículo passa no ATS dessa vaga?" },
      {
        name: "description",
        content:
          "Cole a vaga e o seu currículo, veja o match, as palavras-chave que faltam e gere uma versão ATS friendly pronta para exportar.",
      },
      { property: "og:title", content: "MatchVaga ATS — seu currículo passa no ATS dessa vaga?" },
      {
        property: "og:description",
        content:
          "Compare currículo e vaga, descubra as palavras-chave que faltam e gere um currículo ATS friendly em segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LOADING_STEPS = [
  "Lendo a vaga…",
  "Procurando evidências no currículo…",
  "Calculando o match…",
];

function Index() {
  const analyze = useServerFn(analyzeResume);

  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generated, setGenerated] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [confirmations, setConfirmations] = useState<Record<string, Confirmation>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const canAnalyze = job.trim().length >= MIN_CHARS && resume.trim().length >= MIN_CHARS;
  const match = useMemo(() => (analysis ? calcMatch(analysis.keywords) : 0), [analysis]);
  const missing = useMemo(
    () => (analysis ? analysis.keywords.filter((k) => !k.found) : []),
    [analysis],
  );

  function runSteps() {
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 2500),
      setTimeout(() => setStep(2), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }

  async function handleAnalyze() {
    setLoading(true);
    setAnalysis(null);
    setGenerated(null);
    setConfirmations({});
    const stop = runSteps();
    try {
      const response = await analyze({ data: { job: job.trim(), resume: resume.trim() } });
      if (!response.ok) {
        toast.error(response.error);
        return;
      }
      setAnalysis(response.data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      toast.error("Não conseguimos falar com o serviço de análise. Tente novamente.");
    } finally {
      stop();
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const confirmed = Object.entries(confirmations)
        .filter(([, value]) => value.checked)
        .map(([keyword, value]) => ({ keyword, where: value.where.trim() }));
      const response = await analyze({
        data: { job: job.trim(), resume: resume.trim(), confirmed },
      });
      if (!response.ok) {
        toast.error(response.error);
        return;
      }
      setGenerated(response.data);
      toast.success("Currículo ATS friendly gerado.");
    } catch {
      toast.error("Não conseguimos gerar o currículo. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }

  function loadSample() {
    setJob(SAMPLE_JOB);
    setResume(SAMPLE_RESUME);
    toast.success("Exemplo carregado. Agora clique em Analisar.");
  }

  function restart() {
    setAnalysis(null);
    setGenerated(null);
    setConfirmations({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen pb-20">
      <header className="bg-gradient-hero px-4 py-14 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <FileSearch className="size-3.5" /> MatchVaga ATS
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-5xl">
            Seu currículo passa no ATS dessa vaga?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            ATS é o sistema que ranqueia candidatos antes de qualquer pessoa do RH ler o seu
            currículo. Compare o seu texto com a vaga, veja o que falta e leve uma versão pronta
            para passar nesse filtro.
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-8 max-w-5xl space-y-6 px-4">
        <RuleAlert />

        <Card className="panel">
          <CardHeader>
            <CardTitle>Cole a vaga e o seu currículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="hidden gap-5 md:grid md:grid-cols-2">
              <Field
                label="Descrição da vaga"
                value={job}
                onChange={setJob}
                placeholder="Cole aqui o texto completo do anúncio da vaga."
              />
              <Field
                label="Seu currículo (texto)"
                value={resume}
                onChange={setResume}
                placeholder="Cole aqui o texto do seu currículo."
              />
            </div>

            <Tabs defaultValue="job" className="md:hidden">
              <TabsList className="w-full">
                <TabsTrigger value="job" className="flex-1">
                  Vaga
                </TabsTrigger>
                <TabsTrigger value="resume" className="flex-1">
                  Currículo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="job" className="mt-4">
                <Field
                  label="Descrição da vaga"
                  value={job}
                  onChange={setJob}
                  placeholder="Cole aqui o texto completo do anúncio da vaga."
                />
              </TabsContent>
              <TabsContent value="resume" className="mt-4">
                <Field
                  label="Seu currículo (texto)"
                  value={resume}
                  onChange={setResume}
                  placeholder="Cole aqui o texto do seu currículo."
                />
              </TabsContent>
            </Tabs>

            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                Nada é salvo. Não cole CPF, RG ou endereço completo.
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={handleAnalyze} disabled={!canAnalyze || loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {loading ? "Analisando…" : "Analisar"}
              </Button>
              <Button variant="secondary" size="lg" onClick={loadSample} disabled={loading}>
                Carregar exemplo
              </Button>
              {!canAnalyze && (
                <span className="text-xs text-muted-foreground">
                  Cada campo precisa de pelo menos {MIN_CHARS} caracteres.
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div ref={resultRef} className="scroll-mt-6 space-y-6">
          {loading && (
            <Card className="panel">
              <CardContent className="space-y-4 pt-6">
                <p className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Loader2 className="size-4 animate-spin" />
                  {LOADING_STEPS[step]}
                </p>
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-3 w-full" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-7 w-24 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis && !loading && (
            <>
              <Card className="panel">
                <CardHeader>
                  <CardTitle>Resultado da análise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <MatchScore match={match} />
                  <KeywordBoard keywords={analysis.keywords} />
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="panel">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="size-4 text-primary" /> Checklist ATS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AtsChecklistPanel items={analysis.ats_checklist} />
                  </CardContent>
                </Card>

                <Card className="panel">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="size-4 text-primary" /> Sugestões priorizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3 text-sm text-foreground/80">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                            {index + 1}
                          </span>
                          {suggestion}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <Card className="panel">
                <CardHeader>
                  <CardTitle>Confirme o que você realmente tem</CardTitle>
                </CardHeader>
                <CardContent>
                  {missing.length === 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Nenhuma palavra-chave faltando. Você já pode gerar a versão ATS friendly.
                      </p>
                      <Button size="lg" onClick={handleGenerate} disabled={generating}>
                        {generating ? "Gerando currículo…" : "Gerar currículo ATS friendly"}
                      </Button>
                    </div>
                  ) : (
                    <ConfirmStep
                      missing={missing}
                      confirmations={confirmations}
                      generating={generating}
                      onChange={(term, value) =>
                        setConfirmations((current) => ({ ...current, [term]: value }))
                      }
                      onGenerate={handleGenerate}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {generated && (
            <ResumeOutput
              resume={generated.adjusted_resume}
              changes={generated.changes}
              match={calcMatch(generated.keywords)}
              onRestart={restart}
            />
          )}
        </div>

        <footer className="pt-6 text-center text-xs text-muted-foreground">
          {APP_RULE} Nada é salvo: sem login, sem banco de dados, sem histórico.
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const short = value.trim().length > 0 && value.trim().length < MIN_CHARS;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-semibold">{label}</label>
        <span
          className={`text-xs tabular-nums ${short ? "text-warning-foreground" : "text-muted-foreground"}`}
        >
          {value.length}/{MAX_CHARS}
        </span>
      </div>
      <Textarea
        value={value}
        maxLength={MAX_CHARS}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-56 resize-y"
      />
    </div>
  );
}
