# Detecção de Fraude em Cartão de Crédito

Pipeline de Machine Learning para identificar transações fraudulentas em
dados de cartão de crédito, usando Regressão Logística, Random Forest e
técnicas de balanceamento de classes (Undersampling e SMOTE).

Este projeto é uma revisão organizada e corrigida de um script original de
aula, transformado em um pipeline modular, testado e documentado.

---

## 📁 Estrutura do projeto

```
deteccao-fraude/
├── README.md                    # este arquivo
├── requirements.txt              # dependências do projeto
├── executar_tudo.py               # roda tudo (dados + modelo + testes) de uma vez
│
├── basedados/                    # dados usados pelo projeto
│   ├── gerar_dados.py             # gera a base sintética (creditcard.csv)
│   └── creditcard.csv             # base de dados (gerada automaticamente)
│
├── modelo/                       # o pipeline de ML em si
│   └── deteccao_fraude.py         # carregamento, features, treino, avaliação
│
├── testes/                       # testes automatizados
│   ├── test_deteccao_fraude.py    # 26 testes unitários + integração (pytest)
│   └── resultado_testes.txt       # última execução dos testes (log salvo)
│
└── visual/                       # saídas visuais
    ├── class_distribution.png
    ├── feature_importance.png
    ├── roc_curve_*.png
    ├── precision_recall_curve_*.png
    ├── confusion_matrix_*.png
    ├── gerar_video.py             # gera o vídeo-resumo do pipeline
    └── videos/
        └── resumo_pipeline.mp4    # vídeo animado resumindo o pipeline
```

---

## 🚀 Como rodar

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Rodar tudo de uma vez (recomendado)

```bash
python3 executar_tudo.py
```

Isso vai: gerar a base de dados (se ainda não existir), treinar e avaliar
os modelos, gerar os gráficos em `visual/` e rodar a suíte de testes,
salvando o resultado em `testes/resultado_testes.txt`.

### 3. Rodar as etapas separadamente

```bash
python3 basedados/gerar_dados.py        # gera a base de dados
python3 modelo/deteccao_fraude.py        # treina e avalia os modelos
python3 -m pytest testes/ -v              # roda os testes
python3 visual/gerar_video.py             # gera o vídeo-resumo (precisa de ffmpeg)
```

---

## 🗃️ Sobre a base de dados

O script original usava a base pública do Kaggle *"Credit Card Fraud
Detection"* (transações europeias de setembro/2013, com colunas `Time`,
`V1`...`V28` — resultado de uma PCA — `Amount` e `Class`).

**Este ambiente não tem acesso à internet** para baixar o CSV original
(nem do link do TensorFlow, nem do Kaggle). Para o projeto rodar fim a fim
sem depender de download externo, foi criado um **gerador de dados
sintéticos** (`basedados/gerar_dados.py`) que reproduz a mesma estrutura de
colunas e uma proporção de fraude realista (a base real tem ~0,17% de
fraude; a sintética usa ~0,6% para garantir exemplos suficientes nos testes
e gráficos).

**Para usar a base real** (recomendado para a entrega final/TCC):

1. Baixe o arquivo em: <https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud>
2. Salve como `basedados/creditcard.csv`
3. Rode `python3 modelo/deteccao_fraude.py` novamente — o script detecta e
   usa o arquivo real automaticamente (veja a função `carregar_dados`).

---

## 🛠️ Correções feitas no script original

O arquivo `DeteccaoFraude.py` enviado continha vários erros que impediam a
execução. Todos foram corrigidos em `modelo/deteccao_fraude.py` (a lista
completa e comentada está no docstring do próprio arquivo):

| # | Problema no original | Correção |
|---|---|---|
| 1 | `from sklearn.metrics import LogisticsRegression` | `from sklearn.linear_model import LogisticRegression` |
| 2 | `from sklearn.preprocessing import train_test_split` | `from sklearn.model_selection import train_test_split` |
| 3 | `from sklearn.metrics import curve` (não existe) | Removido |
| 4 | `randomForestClassifier` (minúsculo, não existe) | `RandomForestClassifier` |
| 5 | `from sklearn.pipeline import pipeline` (minúsculo) | `from sklearn.pipeline import Pipeline` |
| 6 | `df["class"]` vs `df["Class"]` (inconsistente) | Padronizado para `"Class"` |
| 7 | `SMOTE = SMOTE()` (sobrescrevia a classe) | Renomeado para `smote` |
| 8 | `LogisticaForestClassifier` (classe inexistente) | `LogisticRegression` |
| 9 | Random Forest com `max_depth=50` (overfitting forte) | Reduzido para um valor mais razoável e configurável |
| 10 | SMOTE era calculado mas nunca usado no treino | Random Forest e pipeline agora treinam com os dados balanceados |
| 11 | `plt.show()` (não funciona sem interface gráfica) | Gráficos salvos como PNG em `visual/` |
| 12 | Script linear, sem testes possíveis | Refatorado em funções puras e testáveis |

---

## 🧪 Testes

A suíte em `testes/test_deteccao_fraude.py` tem **26 testes** cobrindo:

- geração e carregamento de dados (colunas, tamanho, taxa de fraude, nulos)
- criação de features (`Amount_log`, `Amount_scaled`)
- divisão treino/teste estratificada
- balanceamento (undersampling e SMOTE)
- treino dos 3 modelos (Regressão Logística, Random Forest, Pipeline)
- métricas de avaliação (classification report, AUC) e geração de gráficos
- threshold customizado
- um teste de integração fim a fim (dados → features → SMOTE → treino → AUC > 0.5)

```bash
python3 -m pytest testes/ -v
```

Resultado da última execução: **26 passed** (log completo em
`testes/resultado_testes.txt`).

---

## 📊 Modelos e métricas

| Modelo | Descrição | Dados de treino |
|---|---|---|
| Regressão Logística | Baseline simples e interpretável | Original (desbalanceado) |
| Random Forest | Captura relações não-lineares, com `class_weight="balanced"` | Balanceado com SMOTE |
| Pipeline (Scaler + Regressão Logística) | Encapsula pré-processamento + modelo em um único objeto | Balanceado com SMOTE |

Para cada modelo são gerados e salvos em `visual/`:

- **Curva ROC** (`roc_curve_*.png`) — capacidade de separar as classes
- **Curva Precisão-Recall** (`precision_recall_curve_*.png`) — mais informativa
  que a ROC quando as classes são muito desbalanceadas, como aqui
- **Matriz de confusão** (`confusion_matrix_*.png`) — erros por tipo (falso
  positivo x falso negativo)
- **Importância das features** (`feature_importance.png`, apenas Random Forest)
- **Distribuição de classes** (`class_distribution.png`)

Também é gerado um **vídeo-resumo** (`visual/videos/resumo_pipeline.mp4`)
que mostra, em ~5 segundos, o desbalanceamento da base, o efeito do SMOTE e
a comparação da curva ROC entre os modelos.

> ⚠️ **Importante sobre os números:** como a base atual é sintética e as
> fraudes foram geradas com um padrão estatístico bem separável, as
> métricas (AUC ≈ 1.0) são otimistas demais e servem apenas para validar
> que o pipeline funciona. Ao trocar pela base real do Kaggle, espere
> métricas mais modestas (AUC ≈ 0.95–0.98 é o resultado típico reportado
> na literatura para esse dataset) — o que é, inclusive, um ótimo ponto a
> discutir na análise crítica do trabalho.

---

## 📌 Próximos passos sugeridos

- Trocar a base sintética pela base real do Kaggle (ver seção acima)
- Testar outros modelos (XGBoost, LightGBM) e comparar com os já implementados
- Fazer *tuning* de hiperparâmetros (GridSearchCV / Optuna)
- Validar o threshold customizado com validação cruzada, não só no conjunto de teste
- Persistir o modelo treinado (`joblib.dump`) para uso em produção/API

---

## 👤 Autoria

Projeto acadêmico — IFSP Catanduva, Gestão de Tecnologia da Informação.
