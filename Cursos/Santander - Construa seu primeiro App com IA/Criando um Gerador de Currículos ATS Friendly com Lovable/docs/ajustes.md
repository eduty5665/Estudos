# Ajustes após a primeira geração

Depois da primeira versão, testei a aplicação com o exemplo e com currículos de estudante. Os ajustes abaixo foram pedidos no chat do Lovable; os marcados com 🎯 foram feitos **selecionando o elemento na tela** e pedindo a mudança só nele.

Cada ajuste aponta onde ele ficou no código, para quem quiser conferir.

## 1. Loading em etapas
**Problema:** a análise leva alguns segundos e a tela parecia travada.
```markdown
Enquanto a análise roda, mostre um card com as etapas "Lendo a vaga…",
"Procurando evidências no currículo…" e "Calculando o match…", trocando a cada
poucos segundos, e esqueletos (Skeleton) no lugar do match e das palavras-chave.
```
📍 `src/routes/index.tsx` (`LOADING_STEPS`, `runSteps`)

## 2. Erros da IA com mensagem clara
**Problema:** quando a IA falhava, o loading ficava infinito.
```markdown
Trate os erros da chamada à IA no servidor e devolva { ok: false, error, status }.
Mensagens: 429 "Muitas análises agora. Espere alguns segundos e tente de novo.";
402 "Os créditos de IA do projeto acabaram."; 403 "O acesso ao serviço de IA foi bloqueado".
Mostre a mensagem em toast, encerre o loading e mantenha os textos digitados.
```
📍 `src/lib/ai.server.ts` (`AiGatewayError`), `src/routes/index.tsx` (`toast.error`)

## 3. Leitura tolerante do JSON
**Problema:** às vezes a IA devolvia o JSON dentro de um bloco de código, e a tela quebrava.
```markdown
Antes de fazer JSON.parse, remova cercas de código e pegue do primeiro "{" ao último "}".
Depois normalize cada campo (term, group, required, found, evidence), descartando itens
inválidos e limitando as sugestões a 6. Se não houver JSON, mostre
"A IA respondeu em um formato inesperado. Tente novamente."
```
📍 `src/lib/ai.server.ts` (`parseJsonAnswer`), `src/lib/analyze.functions.ts` (`sanitize`)

## 4. Layout no celular 🎯
**Problema:** os dois campos lado a lado ficavam estreitos demais.
```markdown
Abaixo de 768 px, troque os dois Textareas por Tabs "Vaga" e "Currículo".
```
📍 `src/routes/index.tsx` (`Tabs` com `md:hidden`)

## 5. Botão de exemplo
**Problema:** quem abre pelo portfólio não tem vaga e currículo à mão.
```markdown
Adicione o botão "Carregar exemplo" ao lado de Analisar, preenchendo uma vaga de
estágio em desenvolvimento e um currículo fictício de estudante de ADS.
```
📍 `src/lib/matchvaga.ts` (`SAMPLE_JOB`, `SAMPLE_RESUME`)

## 6. Lista "Para estudar" ao vivo 🎯
**Problema:** não ficava claro o que seria deixado de fora do currículo.
```markdown
Na etapa de confirmação, mostre abaixo da lista um bloco âmbar "Para estudar" com as
palavras-chave ainda desmarcadas, atualizado conforme a pessoa marca ou desmarca.
Deixe o campo "Onde?" desabilitado até a caixa ser marcada.
```
📍 `src/components/matchvaga/ConfirmStep.tsx`

## 7. "O que mudou" e "Novo match" ao lado do currículo 🎯
**Problema:** a lista de alterações ficava escondida e não dava para comparar o match.
```markdown
Abaixo do currículo ajustado, mostre dois cards lado a lado: "O que mudou" (lista)
e "Match estimado do novo currículo" (mesmo componente do match original).
Repita o alerta com a regra do MatchVaga acima do currículo.
```
📍 `src/components/matchvaga/ResumeOutput.tsx`

## 8. Publicação
Em **Publish**: título "MatchVaga ATS — seu currículo passa no ATS dessa vaga?", descrição com a proposta e imagem social gerada pelo Lovable. As mesmas meta tags ficaram no código.

📍 `src/routes/index.tsx` (`head`)

---

## Ajuste ainda não feito: exportação em PDF

O prompt abaixo está pronto para a próxima rodada. Ficou para depois porque copiar e baixar .txt já cobrem o núcleo, e o PDF precisa ser testado com cuidado (PDF salvo como imagem não é lido por ATS).

```markdown
Na tela do currículo ajustado, adicione o botão "Baixar PDF" ao lado de "Baixar .txt".
Gere o PDF no navegador com jsPDF: coluna única, fonte Helvetica 11, margens de 2 cm,
títulos de seção em negrito, quebra de página automática, sem tabelas, ícones ou imagens.
O texto precisa ser selecionável (não gere o PDF a partir de imagem/canvas).
Nome do arquivo: curriculo-ats-friendly.pdf. Não altere mais nada.
```
