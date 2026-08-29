"""
gerar_video.py
================
Gera um pequeno vídeo (MP4) resumindo visualmente o pipeline:
1. Distribuição de classes (desbalanceamento)
2. Efeito do SMOTE (antes/depois do balanceamento)
3. Curva ROC comparando os 3 modelos treinados

Requer ffmpeg instalado no sistema (usado pelo backend de animação do
matplotlib).

Rodar com:
    python3 visual/gerar_video.py
"""

import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.animation as animation
import matplotlib.pyplot as plt
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from basedados.gerar_dados import gerar_base
from modelo.deteccao_fraude import (
    balancear_oversampling,
    dividir_treino_teste,
    preparar_features,
    treinar_random_forest,
    treinar_regressao_logistica,
)
from sklearn.metrics import roc_curve, roc_auc_score

OUT_DIR = Path(__file__).resolve().parent / "videos"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def preparar_dados_para_video():
    df = gerar_base(n_total=6000, taxa_fraude=0.01, seed=1)
    X, Y = preparar_features(df)
    X_train, X_test, Y_train, Y_test = dividir_treino_teste(X, Y)
    X_res, Y_res = balancear_oversampling(X_train, Y_train)

    modelo_lr = treinar_regressao_logistica(X_train, Y_train)
    modelo_rf = treinar_random_forest(X_res, Y_res, n_estimators=60, max_depth=8)

    probs_lr = modelo_lr.predict_proba(X_test)[:, 1]
    probs_rf = modelo_rf.predict_proba(X_test)[:, 1]

    return df, Y_train, Y_res, Y_test, probs_lr, probs_rf


def gerar_video():
    df, Y_train, Y_res, Y_test, probs_lr, probs_rf = preparar_dados_para_video()

    fpr_lr, tpr_lr, _ = roc_curve(Y_test, probs_lr)
    fpr_rf, tpr_rf, _ = roc_curve(Y_test, probs_rf)
    auc_lr = roc_auc_score(Y_test, probs_lr)
    auc_rf = roc_auc_score(Y_test, probs_rf)

    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle("Pipeline de Detecção de Fraude — Resumo Visual", fontsize=14, fontweight="bold")

    n_frames = 40

    def init():
        for ax in axes:
            ax.clear()
        return []

    def update(frame):
        for ax in axes:
            ax.clear()

        progresso = (frame + 1) / n_frames

        # --- Painel 1: distribuição de classes (aparece nos primeiros frames)
        ax = axes[0]
        contagem = df["Class"].value_counts().sort_index()
        alpha = min(progresso * 3, 1.0)
        ax.bar(["Normal", "Fraude"], contagem.values, color=["#2563eb", "#dc2626"], alpha=alpha)
        ax.set_yscale("log")
        ax.set_title("1. Base desbalanceada")
        ax.set_ylabel("Quantidade (escala log)")

        # --- Painel 2: efeito do SMOTE (barras crescendo)
        ax = axes[1]
        alpha2 = min(max((progresso - 0.25) * 3, 0), 1.0)
        antes = Y_train.value_counts().sort_index()
        depois = Y_res.value_counts().sort_index()
        x = np.arange(2)
        largura = 0.35
        ax.bar(x - largura / 2, antes.values, largura, label="Antes (treino)",
               color="#94a3b8", alpha=alpha2)
        ax.bar(x + largura / 2, depois.values * alpha2, largura, label="Depois (SMOTE)",
               color="#16a34a", alpha=alpha2)
        ax.set_xticks(x, ["Normal", "Fraude"])
        ax.set_title("2. Balanceamento com SMOTE")
        if alpha2 > 0.1:
            ax.legend(fontsize=8)

        # --- Painel 3: curva ROC sendo desenhada progressivamente
        ax = axes[2]
        alpha3 = min(max((progresso - 0.5) * 2, 0), 1.0)
        n_pts_lr = max(int(len(fpr_lr) * alpha3), 2)
        n_pts_rf = max(int(len(fpr_rf) * alpha3), 2)
        ax.plot(fpr_lr[:n_pts_lr], tpr_lr[:n_pts_lr], color="#2563eb",
                label=f"Regressão Logística (AUC={auc_lr:.3f})")
        ax.plot(fpr_rf[:n_pts_rf], tpr_rf[:n_pts_rf], color="#dc2626",
                label=f"Random Forest (AUC={auc_rf:.3f})")
        ax.plot([0, 1], [0, 1], linestyle="--", color="gray", linewidth=0.8)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1.02)
        ax.set_xlabel("Falsos Positivos")
        ax.set_ylabel("Verdadeiros Positivos")
        ax.set_title("3. Comparação — Curva ROC")
        if alpha3 > 0.05:
            ax.legend(fontsize=8, loc="lower right")

        return []

    anim = animation.FuncAnimation(
        fig, update, init_func=init, frames=n_frames, blit=False
    )

    out_path = OUT_DIR / "resumo_pipeline.mp4"
    writer = animation.FFMpegWriter(fps=8, bitrate=1800)
    anim.save(out_path, writer=writer)
    plt.close(fig)
    print(f"Vídeo salvo em: {out_path}")


if __name__ == "__main__":
    gerar_video()
