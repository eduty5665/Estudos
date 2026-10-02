# MatchVaga ATS — Documentação do sistema

## 1. O que é

O MatchVaga ATS é uma aplicação web que compara um currículo com a descrição de uma vaga. Ela:

1. calcula o **match** (0–100%) entre o currículo e a vaga;
2. mostra as **palavras-chave** da vaga, separando as encontradas das que faltam;
3. avalia o currículo com um **checklist ATS** (formato legível por robôs de recrutamento);
4. dá **sugestões priorizadas**;
5. pede que a pessoa **confirme** o que ela realmente tem;
6. gera um **currículo ATS friendly** em texto, pronto para copiar ou baixar (.txt).

ATS (Applicant Tracking System) é o sistema que as empresas usam para filtrar e ranquear candidatos antes de alguém do RH ler o currículo.

### Regra fixa do produto

> O MatchVaga melhora **como** você se apresenta. Ele **nunca inventa** experiência, curso, empresa, cargo, data, certificação ou ferramenta que você não tem.

Essa regra aparece na tela (alerta no topo e rodapé) e também está no prompt enviado à IA.

### Privacidade

- Não há login, banco de dados nem histórico. Nada é salvo.
- Os textos vão ao servidor apenas para a análise e são descartados.
- A tela avisa para não colar CPF, RG ou endereço completo.

---

## 2. Fluxo de uso

```text
[Cola vaga + currículo] -> [Analisar]
        |
        v
[Loading em 3 etapas] -> [Resultado: match, palavras-chave, checklist, sugestões]
        |
        v
[Confirma palavras que faltam e diz onde usou] -> [Gerar currículo ATS friendly]
        |
        v
[Currículo ajustado + lista de mudanças] -> Copiar | Baixar .txt | Nova análise
```

1. **Entrada** — dois campos de texto (vaga e currículo), cada um com 200 a 8.000 caracteres e contador. No desktop ficam lado a lado; no celular, em abas.
2. **Carregar exemplo** — preenche uma vaga e um currículo fictícios para teste.
3. **Analisar** — chama o servidor. Durante a espera aparecem as etapas "Lendo a vaga…", "Procurando evidências no currículo…", "Calculando o match…".
4. **Resultado** — match com rótulo (Baixo/Médio/Alto), palavras-chave em 4 grupos, checklist e sugestões.
5. **Confirmação** — para cada palavra que falta, a pessoa pode marcar "eu tenho isso" e escrever onde usou. Só o que for confirmado entra no currículo novo.
6. **Currículo final** — nova chamada à IA, agora com as confirmações; mostra o novo match, o texto e o que mudou.

---

## 3. Cálculo do match

Arquivo: `src/lib/matchvaga.ts` (`calcMatch`).

- Palavra **obrigatória** vale peso **2**; **desejável** vale peso **1**.
- `match = (soma dos pesos encontrados / soma de todos os pesos) × 100`, arredondado.
- Faixas (`matchLabel`): até 49% **Baixo**, 50–74% **Médio**, 75%+ **Alto**.

O cálculo é feito na tela, a partir da lista de palavras-chave devolvida pela IA — assim a nota é sempre coerente com o que a pessoa vê.

---

## 4. Grupos de palavras-chave

| Grupo | Significado |
|---|---|
| `hard_skill` | Conhecimentos técnicos (ex.: SQL, TypeScript) |
| `tool` | Ferramentas (ex.: Git, Docker) |
| `soft_skill` | Comportamentais (ex.: comunicação) |
| `requirement` | Requisitos formais (ex.: curso, formatura, idioma) |

Na tela: **verde** = encontrada (clique mostra o trecho do currículo que comprova), **âmbar** = faltando, **estrela** = obrigatória.

---

## 5. Checklist ATS

A IA avalia:
- títulos de seção padrão;
- contatos no topo;
- datas legíveis;
- ausência de tabelas, colunas e ícones;
- tamanho adequado.

Cada item mostra se está ok e uma dica curta (em um acordeão).

---

## 6. Currículo ajustado

Formato: texto simples (Markdown leve), coluna única, sem tabelas, ícones ou emojis. Ordem das seções:

1. Dados de contato
2. Objetivo
3. Formação
4. Competências
5. Projetos
6. Experiência
7. Cursos
8. Idiomas

---

## 7. Arquitetura técnica

### Stack
- **TanStack Start** (React 19 + Vite 7), TypeScript
- **Tailwind CSS v4** + componentes **shadcn/ui**, ícones **lucide-react**, avisos **sonner**
- **Vercel AI SDK** (`ai`, `@ai-sdk/openai`) chamando o **Lovable AI Gateway**
- Modelo: `openai/gpt-6-astra` (API Responses, com raciocínio `medium`)
- Validação de entrada com **zod**

### Estrutura de pastas

```text
src/
  routes/
    __root.tsx            Layout raiz, <head>, fontes, Toaster, TooltipProvider
    index.tsx             Página única do app (entrada, resultado, geração)
  components/
    matchvaga/
      RuleAlert.tsx        Alerta com a regra anti-invenção
      MatchScore.tsx       Porcentagem, barra e rótulo Baixo/Médio/Alto
      KeywordBoard.tsx     Palavras-chave por grupo, com evidência clicável
      AtsChecklistPanel.tsx Checklist ATS em acordeão
      ConfirmStep.tsx      Confirmação das palavras que faltam
      ResumeOutput.tsx     Currículo final: copiar, baixar .txt, nova análise
    ui/                    Componentes shadcn/ui
  lib/
    matchvaga.ts           Tipos, regra, limites, calcMatch, exemplos
    analyze.functions.ts   Função de servidor analyzeResume (prompt + validação)
    ai.server.ts           Chamada à IA (somente servidor) e leitura do JSON
  styles.css               Tema (cores em oklch, modo escuro, utilitário .panel)
```

### Caminho de uma análise

```text
index.tsx (navegador)
  -> useServerFn(analyzeResume)({ job, resume, confirmed? })
     -> analyze.functions.ts (servidor)
        - valida com zod (200–8000 caracteres; até 40 confirmações)
        - monta SYSTEM prompt + prompt do usuário
        -> ai.server.ts: callLovableAi()
           - streamText no gateway, instruções separadas das mensagens
           - store:false, reasoning medium
        <- texto da IA
        - parseJsonAnswer(): extrai o JSON
        - sanitize(): normaliza campos e tipos
     <- { ok: true, data } | { ok: false, error, status }
  -> atualiza a tela / mostra aviso de erro
```

### Formato do JSON devolvido pela IA

```json
{
  "keywords": [
    { "term": "SQL", "group": "hard_skill", "required": true, "found": false, "evidence": null }
  ],
  "ats_checklist": [
    { "item": "Títulos de seção padrão", "ok": true, "tip": "..." }
  ],
  "suggestions": ["até 6 sugestões"],
  "adjusted_resume": "currículo em texto",
  "changes": ["o que mudou"]
}
```

### Segurança
- A chave da IA (`LOVABLE_API_KEY`) fica apenas no servidor; o arquivo `ai.server.ts` nunca vai para o navegador.
- Toda entrada é validada no servidor com zod.
- Erros da IA viram mensagens amigáveis:
  - **429** — muitas análises ao mesmo tempo, espere e tente de novo;
  - **402** — créditos de IA do projeto acabaram;
  - **403** — acesso à IA bloqueado;
  - formato inesperado — pede para tentar de novo.

### Visual
- Paleta: índigo `#4F46E5` (primária), verde `#10B981` (encontrado), âmbar `#F59E0B` (faltando), vermelho `#EF4444` (baixo), fundo `#F8FAFC`, texto `#0F172A`, definidos como variáveis em `styles.css` (com modo escuro).
- Fonte Inter. Layout mobile-first.

---

## 8. Como rodar localmente

```bash
bun install
bun run dev        # abre em http://localhost:8080
```

Variável necessária no servidor: `LOVABLE_API_KEY` (fornecida automaticamente no Lovable).

Build de produção: `bun run build`.

---

## 9. Limitações conhecidas

- A análise depende da IA; resultados podem variar um pouco entre execuções.
- Aceita apenas texto colado (sem upload de PDF/DOCX).
- Exportação apenas em .txt / copiar texto.
