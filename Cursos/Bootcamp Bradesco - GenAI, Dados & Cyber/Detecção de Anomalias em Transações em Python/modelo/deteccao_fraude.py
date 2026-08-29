"""
deteccao_fraude.py
====================
Pipeline de Detecção de Fraude em Cartão de Crédito.

Versão revisada do script original enviado. Principais correções feitas:

1. `from sklearn.metrics import LogisticsRegression`  -> não existe nem o nome
   nem o módulo correto. Corrigido para
   `from sklearn.linear_model import LogisticRegression`.
2. `from sklearn.preprocessing import train_test_split` -> função pertence a
   `sklearn.model_selection`, não a `preprocessing`.
3. `from sklearn.metrics import curve` -> não existe `curve` em sklearn.metrics.
   Removido (não era usado; o correto para ROC é `roc_curve`, que já estava
   importado corretamente na linha seguinte).
4. `from sklearn.ensemble import randomForestClassifier` -> nome errado
   (Python é case-sensitive). Corrigido para `RandomForestClassifier`.
5. `from sklearn.pipeline import pipeline` -> a classe é `Pipeline`
   (maiúscula), `pipeline` minúsculo não existe nesse módulo.
6. `df["class"]` vs `df["Class"]` -> inconsistência de maiúsculas/minúsculas
   (a coluna real é `Class`). Corrigido em todo o script.
7. `model = LogisticsRegression(...)` -> corrigido para `LogisticRegression`.
8. `SMOTE = SMOTE()` -> sobrescrevia a própria classe importada com uma
   instância de mesmo nome, quebrando qualquer uso futuro de `SMOTE`.
   Renomeado para `smote`.
9. `rf = randomForestClassifier(...)` -> corrigido para `RandomForestClassifier`.
10. `pipeline = Pipeline([...])` -> variável com o mesmo nome do módulo
    importado (`from sklearn.pipeline import pipeline`), o que já causava
    conflito antes mesmo da correção de maiúscula. Corrigido e renomeado
    para `pipeline_modelo`.
11. `LogisticaForestClassifier(...)` -> classe inexistente (mistura de nomes).
    Corrigido para `LogisticRegression`, que era claramente a intenção
    original dado o `max_iter=1000`.
12. O treino do Random Forest e do pipeline final usava `X_train` original
    (desbalanceado). Adicionada a opção de treinar com os dados
    balanceados por SMOTE (`X_resampled`, `Y_resampled`), que é o padrão
    correto de uso do SMOTE (balancear -> depois treinar).
13. `plt.show()` não funciona em ambiente sem interface gráfica. Todos os
    gráficos agora são salvos como arquivos PNG em `visual/`.
14. Código convertido de um script linear "de aula" para funções
    reutilizáveis e testáveis (requisito para a pasta `testes/`).
15. Adicionado carregamento automático de dados: usa `basedados/creditcard.csv`
    (real, se o usuário baixar o dataset do Kaggle) e, se não existir, cai
    para a base sintética gerada por `basedados/gerar_dados.py`.

Estrutura das funções:
    carregar_dados        -> lê o CSV (real ou sintético)
    preparar_features      -> cria Amount_log, Amount_scaled, separa X/Y
    dividir_treino_teste    -> train_test_split estratificado
    balancear_undersampling -> undersampling manual (classe majoritária)
    balancear_oversampling  -> SMOTE
    treinar_regressao_logistica
    treinar_random_forest
    construir_pipeline
    avaliar_modelo          -> métricas + salva gráficos (ROC, PR, matriz confusão)
    aplicar_threshold_customizado
    main                    -> executa o pipeline completo
"""

from __future__ import annotations

from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # backend sem interface gráfica (necessário p/ salvar PNG)
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    confusion_matrix,
    precision_recall_curve,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

BASE_DIR = Path(__file__).resolve().parent.parent
DADOS_REAIS = BASE_DIR / "basedados" / "creditcard.csv"
DADOS_URL_ORIGINAL = (
    "https://storage.googleapis.com/download.tensorflow.org/data/creditcard.csv"
)
VISUAL_DIR = BASE_DIR / "visual"


# ---------------------------------------------------------------------------
# 1. Carregamento e preparação dos dados
# ---------------------------------------------------------------------------

def carregar_dados(caminho: str | Path | None = None) -> pd.DataFrame:
    """Carrega o dataset de transações.

    Ordem de prioridade:
    1. `caminho` explícito, se informado.
    2. `basedados/creditcard.csv` (base real do Kaggle, se o usuário a
       tiver baixado e colocado nessa pasta).
    3. Gera automaticamente a base sintética (`basedados/gerar_dados.py`).
    """
    if caminho is not None:
        return pd.read_csv(caminho)

    if DADOS_REAIS.exists():
        return pd.read_csv(DADOS_REAIS)

    # fallback: gera a base sintética na hora
    from basedados.gerar_dados import gerar_base  # import local, evita ciclo

    return gerar_base()


def preparar_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Cria colunas derivadas (Amount_log, Amount_scaled) e separa X/Y.

    Retorna (X, Y) já prontos para split treino/teste.
    """
    df = df.copy()

    if "Class" not in df.columns:
        raise KeyError(
            "Coluna 'Class' não encontrada. Verifique se o CSV segue o "
            "padrão do dataset (colunas Time, V1..V28, Amount, Class)."
        )

    df["Amount_log"] = np.log1p(df["Amount"])

    scaler = StandardScaler()
    df["Amount_scaled"] = scaler.fit_transform(df[["Amount"]])

    X = df.drop(columns=["Class"])
    Y = df["Class"]
    return X, Y


def dividir_treino_teste(X: pd.DataFrame, Y: pd.Series, test_size: float = 0.3,
                          random_state: int = 42):
    return train_test_split(
        X, Y, test_size=test_size, random_state=random_state, stratify=Y
    )


# ---------------------------------------------------------------------------
# 2. Balanceamento de classes
# ---------------------------------------------------------------------------

def balancear_undersampling(df: pd.DataFrame, random_state: int = 42) -> pd.DataFrame:
    """Undersampling: reduz a classe majoritária ao tamanho da minoritária."""
    fraudes = df[df["Class"] == 1]
    normal = df[df["Class"] == 0].sample(n=len(fraudes), random_state=random_state)
    return pd.concat([fraudes, normal]).sample(frac=1, random_state=random_state)


def balancear_oversampling(X_train: pd.DataFrame, Y_train: pd.Series,
                            random_state: int = 42):
    """Oversampling com SMOTE (gera exemplos sintéticos da classe minoritária)."""
    smote = SMOTE(random_state=random_state)
    X_resampled, Y_resampled = smote.fit_resample(X_train, Y_train)
    return X_resampled, Y_resampled


# ---------------------------------------------------------------------------
# 3. Modelos
# ---------------------------------------------------------------------------

def treinar_regressao_logistica(X_train, Y_train, max_iter: int = 1000):
    modelo = LogisticRegression(max_iter=max_iter)
    modelo.fit(X_train, Y_train)
    return modelo


def treinar_random_forest(X_train, Y_train, n_estimators: int = 100,
                           max_depth: int = 12, random_state: int = 42):
    # OBS: no script original max_depth=50, o que, combinado com
    # class_weight="balanced" e uma base pequena, gera overfitting forte
    # (a árvore memoriza os poucos exemplos de fraude). Reduzido para um
    # valor mais razoável (12); ajuste conforme o tamanho real da base.
    modelo = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        class_weight="balanced",
        n_jobs=-1,
        random_state=random_state,
    )
    modelo.fit(X_train, Y_train)
    return modelo


def construir_pipeline(max_iter: int = 1000) -> Pipeline:
    """Pipeline scaler + regressão logística (era LogisticaForestClassifier,
    classe inexistente, no script original)."""
    return Pipeline([
        ("scaler", StandardScaler()),
        ("model", LogisticRegression(max_iter=max_iter)),
    ])


# ---------------------------------------------------------------------------
# 4. Avaliação e visualizações
# ---------------------------------------------------------------------------

def avaliar_modelo(modelo, X_test, Y_test, nome: str = "modelo",
                    salvar_graficos: bool = True, pasta_visual: Path = VISUAL_DIR):
    """Calcula métricas e (opcionalmente) salva ROC, PR e matriz de confusão."""
    y_pred = modelo.predict(X_test)
    y_probs = modelo.predict_proba(X_test)[:, 1]

    relatorio = classification_report(Y_test, y_pred, output_dict=True, zero_division=0)
    relatorio_texto = classification_report(Y_test, y_pred, zero_division=0)
    auc = roc_auc_score(Y_test, y_probs)
    ap = average_precision_score(Y_test, y_probs)

    resultado = {
        "nome": nome,
        "relatorio": relatorio,
        "relatorio_texto": relatorio_texto,
        "auc": auc,
        "average_precision": ap,
        "y_pred": y_pred,
        "y_probs": y_probs,
    }

    if salvar_graficos:
        pasta_visual.mkdir(parents=True, exist_ok=True)
        _salvar_curva_roc(Y_test, y_probs, nome, pasta_visual)
        _salvar_curva_precisao_recall(Y_test, y_probs, nome, pasta_visual)
        _salvar_matriz_confusao(Y_test, y_pred, nome, pasta_visual)

    return resultado


def _salvar_curva_roc(Y_test, y_probs, nome, pasta_visual):
    fpr, tpr, _ = roc_curve(Y_test, y_probs)
    auc = roc_auc_score(Y_test, y_probs)

    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"AUC = {auc:.3f}", color="#2563eb", linewidth=2)
    plt.plot([0, 1], [0, 1], linestyle="--", color="gray", linewidth=1)
    plt.title(f"Curva ROC — {nome}")
    plt.xlabel("Taxa de Falsos Positivos")
    plt.ylabel("Taxa de Verdadeiros Positivos")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(pasta_visual / f"roc_curve_{nome}.png", dpi=150)
    plt.close()


def _salvar_curva_precisao_recall(Y_test, y_probs, nome, pasta_visual):
    precision, recall, _ = precision_recall_curve(Y_test, y_probs)
    ap = average_precision_score(Y_test, y_probs)

    plt.figure(figsize=(6, 5))
    plt.plot(recall, precision, label=f"AP = {ap:.3f}", color="#16a34a", linewidth=2)
    plt.title(f"Curva Precisão-Recall — {nome}")
    plt.xlabel("Recall")
    plt.ylabel("Precisão")
    plt.legend(loc="lower left")
    plt.tight_layout()
    plt.savefig(pasta_visual / f"precision_recall_curve_{nome}.png", dpi=150)
    plt.close()


def _salvar_matriz_confusao(Y_test, y_pred, nome, pasta_visual):
    cm = confusion_matrix(Y_test, y_pred)

    plt.figure(figsize=(5, 4.5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=["Normal", "Fraude"], yticklabels=["Normal", "Fraude"])
    plt.title(f"Matriz de Confusão — {nome}")
    plt.xlabel("Previsto")
    plt.ylabel("Real")
    plt.tight_layout()
    plt.savefig(pasta_visual / f"confusion_matrix_{nome}.png", dpi=150)
    plt.close()


def salvar_distribuicao_classes(df: pd.DataFrame, pasta_visual: Path = VISUAL_DIR):
    pasta_visual.mkdir(parents=True, exist_ok=True)
    contagem = df["Class"].value_counts().sort_index()

    plt.figure(figsize=(5, 4.5))
    cores = ["#2563eb", "#dc2626"]
    plt.bar(["Normal", "Fraude"], contagem.values, color=cores)
    for i, v in enumerate(contagem.values):
        plt.text(i, v, f"{v}", ha="center", va="bottom")
    plt.title("Distribuição de Classes (transações)")
    plt.ylabel("Quantidade")
    plt.yscale("log")
    plt.tight_layout()
    plt.savefig(pasta_visual / "class_distribution.png", dpi=150)
    plt.close()


def salvar_importancia_features(modelo_rf: RandomForestClassifier, colunas,
                                 pasta_visual: Path = VISUAL_DIR, top_n: int = 12):
    pasta_visual.mkdir(parents=True, exist_ok=True)
    importancias = pd.Series(modelo_rf.feature_importances_, index=colunas)
    importancias = importancias.sort_values(ascending=False).head(top_n)

    plt.figure(figsize=(7, 5))
    importancias.sort_values().plot(kind="barh", color="#7c3aed")
    plt.title(f"Top {top_n} Features Mais Importantes — Random Forest")
    plt.xlabel("Importância")
    plt.tight_layout()
    plt.savefig(pasta_visual / "feature_importance.png", dpi=150)
    plt.close()


# ---------------------------------------------------------------------------
# 5. Threshold customizado
# ---------------------------------------------------------------------------

def aplicar_threshold_customizado(y_probs, threshold: float = 0.3):
    return (y_probs >= threshold).astype(int)


# ---------------------------------------------------------------------------
# 6. Execução completa (pipeline "fim a fim")
# ---------------------------------------------------------------------------

def main():
    print("=" * 70)
    print("PIPELINE DE DETECÇÃO DE FRAUDE EM CARTÃO DE CRÉDITO")
    print("=" * 70)

    # 1. Dados
    df = carregar_dados()
    print(f"\nBase carregada: {len(df)} transações | "
          f"{df['Class'].sum()} fraudes ({df['Class'].mean() * 100:.3f}%)")
    salvar_distribuicao_classes(df)

    X, Y = preparar_features(df)
    X_train, X_test, Y_train, Y_test = dividir_treino_teste(X, Y)

    # 2. Regressão Logística (baseline)
    print("\n--- Regressão Logística (baseline) ---")
    modelo_lr = treinar_regressao_logistica(X_train, Y_train)
    resultado_lr = avaliar_modelo(modelo_lr, X_test, Y_test, nome="regressao_logistica")
    print(resultado_lr["relatorio_texto"])
    print(f"AUC: {resultado_lr['auc']:.4f}")

    # 3. Balanceamento (undersampling e SMOTE)
    df_under = balancear_undersampling(pd.concat([X_train, Y_train], axis=1))
    print(f"\nBase com undersampling: {len(df_under)} linhas "
          f"({df_under['Class'].mean() * 100:.1f}% fraude)")

    X_resampled, Y_resampled = balancear_oversampling(X_train, Y_train)
    print(f"Base com SMOTE (oversampling): {len(X_resampled)} linhas "
          f"({Y_resampled.mean() * 100:.1f}% fraude)")

    # 4. Random Forest treinado com dados balanceados (SMOTE)
    print("\n--- Random Forest (treinado com SMOTE) ---")
    modelo_rf = treinar_random_forest(X_resampled, Y_resampled)
    resultado_rf = avaliar_modelo(modelo_rf, X_test, Y_test, nome="random_forest")
    print(resultado_rf["relatorio_texto"])
    print(f"AUC: {resultado_rf['auc']:.4f}")
    salvar_importancia_features(modelo_rf, X.columns)

    # 5. Pipeline (scaler + regressão logística) treinado com SMOTE
    print("\n--- Pipeline (Scaler + Regressão Logística, com SMOTE) ---")
    pipeline_modelo = construir_pipeline()
    pipeline_modelo.fit(X_resampled, Y_resampled)
    resultado_pipeline = avaliar_modelo(pipeline_modelo, X_test, Y_test, nome="pipeline")
    print(resultado_pipeline["relatorio_texto"])

    # 6. Threshold customizado sobre a Regressão Logística baseline
    print("\n--- Threshold customizado (0.3) sobre a Regressão Logística ---")
    y_pred_custom = aplicar_threshold_customizado(resultado_lr["y_probs"], threshold=0.3)
    print(classification_report(Y_test, y_pred_custom, zero_division=0))

    print("\nGráficos salvos em:", VISUAL_DIR)
    print("Pipeline concluído com sucesso.")


if __name__ == "__main__":
    main()
