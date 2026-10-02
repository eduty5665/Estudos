# Mega prompt — MatchVaga ATS (versão final, v3)

> Colado no Lovable no modo **Plan** para revisar a abordagem antes de construir.

---

## Contexto

Crie o **MatchVaga ATS**, uma aplicação web que compara um currículo com uma descrição de vaga, mostra o match, as palavras-chave encontradas e as que faltam, e gera uma versão ATS friendly do currículo, pronta para exportar.

Público: estudantes e pessoas buscando **estágio ou primeiro emprego em tecnologia**.

- Idioma: português do Brasil.
- Design system: **shadcn/ui** (Card, Tabs, Textarea, Button, Badge, Progress, Alert, Accordion, Checkbox, Tooltip, Toast/Sonner, Skeleton).
- Ícones: lucide-react. **Não gere imagens.**
- Back-end: **Lovable Cloud** com uma edge function que chama o **Lovable AI**. Nenhuma chave no front-end.
- Sem login, sem banco de dados, sem histórico. Nada é salvo.
- Responsivo, com foco em celular.

## Regra da aplicação (obrigatória)

> **O MatchVaga melhora como você se apresenta. Ele nunca inventa experiência, curso ou ferramenta que você não tem.**

- Mostre essa frase num Alert fixo na tela de entrada e acima do currículo gerado.
- Repita a regra nas instruções de sistema enviadas ao modelo.

## Paleta

| Uso | Cor |
|---|---|
| Primária (índigo) | `#4F46E5` |
| Encontrada / sucesso | `#10B981` |
| Faltante / atenção | `#F59E0B` |
| Erro | `#EF4444` |
| Fundo | `#F8FAFC` |
| Texto | `#0F172A` |

Mapeie as cores para as variáveis de tema do shadcn/ui. Suporte a modo escuro. Fonte Inter.

## Fluxo e telas

### 1. Entrada (`/`)
- Título: "Seu currículo passa no ATS dessa vaga?". Subtítulo curto explicando o que é ATS.
- Dois Textareas lado a lado no desktop e em Tabs no celular: **Descrição da vaga** e **Seu currículo (texto)**. Contador de caracteres, limite de 8.000 cada.
- Botão "Carregar exemplo", que preenche uma vaga de estágio em desenvolvimento e um currículo fictício de estudante.
- Botão principal "Analisar", desabilitado se algum campo tiver menos de 200 caracteres.
- Aviso de privacidade: "Nada é salvo. Não cole CPF, RG ou endereço completo."

### 2. Análise (mesma página, seção de resultado)
- Loading com etapas: "Lendo a vaga…", "Procurando evidências no currículo…", "Calculando o match…".
- **Match** em destaque (0–100%) com Progress e rótulo: até 49% "Baixo", 50–74% "Médio", 75%+ "Alto". Tooltip explicando o cálculo.
- **Palavras-chave** em quatro grupos (hard skills, ferramentas, soft skills, requisitos). Badges verdes para encontradas e âmbar para faltantes; ícone de estrela para obrigatórias. Ao clicar numa encontrada, mostre o trecho do currículo que serviu de evidência.
- **Checklist ATS** (Accordion): títulos de seção padrão, contatos no topo, datas legíveis, sem tabelas/colunas/ícones, tamanho adequado. Cada item com ok/atenção e dica.
- **Sugestões** priorizadas (máx. 6).

### 3. Confirmação
- Para cada palavra-chave faltante: Checkbox "Eu tenho isso" + campo curto "Onde?" (ex.: "Projeto da faculdade RootCity").
- Faltantes não confirmadas viram a lista "Para estudar", e **nunca** entram no currículo.
- Botão "Gerar currículo ATS friendly".

### 4. Currículo ajustado
- Alert com a regra da aplicação.
- Currículo em coluna única, com seções: Dados de contato, Objetivo, Formação, Competências, Projetos, Experiência, Cursos, Idiomas.
- Painel "O que mudou": lista de alterações (ex.: "Seção Habilidades renomeada para Competências", "'Conhecimentos em BD' reescrito como 'SQL (PostgreSQL)'").
- Novo match estimado do currículo gerado.
- Ações: Copiar texto, Baixar .txt, Nova análise.

## Back-end

Edge function `analyze`:
- Entrada: `{ job, resume, confirmed?: [{ keyword, where }] }`.
- Valida tamanho (200 a 8.000 caracteres).
- Chama o Lovable AI usando **tool calling / saída estruturada** e retorna:

```json
{
  "keywords": [
    { "term": "SQL", "group": "hard_skill|tool|soft_skill|requirement",
      "required": true, "found": true, "evidence": "trecho do currículo ou null" }
  ],
  "ats_checklist": [ { "item": "Títulos de seção padrão", "ok": false, "tip": "..." } ],
  "suggestions": [ "..." ],
  "adjusted_resume": "texto em Markdown simples",
  "changes": [ "..." ]
}
```

- O **match é calculado no front-end** a partir de `keywords`: obrigatória peso 2, desejável peso 1; `match = encontrados / possíveis × 100`, arredondado.
- Instruções ao modelo: usar somente fatos do currículo e das confirmações; nunca criar empresas, cargos, datas, cursos, certificações ou ferramentas; pode reescrever, reorganizar, usar o vocabulário da vaga para algo que existe e padronizar títulos.
- Trate erros 429 (limite) e 402 (créditos) com mensagens amigáveis em toast.

## Fora do escopo

Login, banco de dados, histórico, dashboard, upload de PDF/DOCX e e-mails.
