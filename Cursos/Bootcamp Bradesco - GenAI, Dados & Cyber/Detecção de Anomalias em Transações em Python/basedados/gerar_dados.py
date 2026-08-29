"""
gerar_dados.py
================
Gera uma base de dados SINTÉTICA que reproduz a estrutura do dataset público
"Credit Card Fraud Detection" (Time, V1-V28, Amount, Class), usado no script
original.

Por que uma base sintética?
----------------------------
O ambiente de execução deste projeto não tem acesso à internet para baixar o
arquivo original (https://storage.googleapis.com/.../creditcard.csv nem o
Kaggle). Para que o projeto rode "fim a fim" sem depender de download externo,
geramos aqui uma base artificial com as mesmas colunas, a mesma proporção de
fraude do mundo real (~0,17%) e um padrão estatístico plausível (as fraudes
têm distribuição levemente diferente em algumas variáveis V e no Amount,
assim como acontece na base real após a PCA).

Para usar a base REAL (recomendado para o TCC/entrega final):
1. Baixe o creditcard.csv em: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
2. Coloque o arquivo em `basedados/creditcard.csv`
3. Rode novamente `modelo/deteccao_fraude.py` — ele detecta e usa o arquivo
   real automaticamente se ele existir (veja `carregar_dados` em
   modelo/deteccao_fraude.py).
"""

import numpy as np
import pandas as pd
from pathlib import Path

SEED = 42
N_TOTAL = 12000          # número de transações simuladas
TAXA_FRAUDE = 0.006       # 0,6% de fraude (a base real é ~0,17%;
                           # usamos uma taxa um pouco maior para que os
                           # testes e gráficos tenham exemplos suficientes)
N_FEATURES_V = 28         # V1..V28, como na base real (saída de um PCA)

OUT_PATH = Path(__file__).parent / "creditcard.csv"


def gerar_base(n_total: int = N_TOTAL, taxa_fraude: float = TAXA_FRAUDE,
               seed: int = SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    n_fraude = max(int(n_total * taxa_fraude), 20)
    n_normal = n_total - n_fraude

    # --- Transações normais -------------------------------------------------
    tempo_normal = rng.integers(0, 172800, size=n_normal)  # até 48h em segundos
    V_normal = rng.normal(loc=0.0, scale=1.0, size=(n_normal, N_FEATURES_V))
    amount_normal = np.round(rng.gamma(shape=2.0, scale=35.0, size=n_normal), 2)

    # --- Transações fraudulentas ---------------------------------------------
    # Fraudes tendem a se concentrar em horários específicos e têm padrão
    # diferente em algumas variáveis latentes (simulando o que a PCA real
    # capturaria em transações anômalas).
    tempo_fraude = rng.integers(0, 172800, size=n_fraude)
    V_fraude = rng.normal(loc=0.0, scale=1.0, size=(n_fraude, N_FEATURES_V))
    # Desloca algumas colunas (padrão anômalo)
    colunas_anomalas = [1, 3, 10, 14, 17]
    for c in colunas_anomalas:
        V_fraude[:, c] += rng.normal(loc=3.5, scale=1.2, size=n_fraude)
    amount_fraude = np.round(rng.gamma(shape=1.3, scale=90.0, size=n_fraude), 2)

    # --- Monta o DataFrame ----------------------------------------------------
    colunas_v = [f"V{i}" for i in range(1, N_FEATURES_V + 1)]

    df_normal = pd.DataFrame(V_normal, columns=colunas_v)
    df_normal.insert(0, "Time", tempo_normal)
    df_normal["Amount"] = amount_normal
    df_normal["Class"] = 0

    df_fraude = pd.DataFrame(V_fraude, columns=colunas_v)
    df_fraude.insert(0, "Time", tempo_fraude)
    df_fraude["Amount"] = amount_fraude
    df_fraude["Class"] = 1

    df = pd.concat([df_normal, df_fraude], ignore_index=True)
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)  # embaralha
    df = df.sort_values("Time").reset_index(drop=True)

    return df


def main():
    df = gerar_base()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_PATH, index=False)
    print(f"Base sintética gerada: {OUT_PATH}")
    print(f"Total de transações: {len(df)}")
    print(f"Fraudes: {df['Class'].sum()} ({df['Class'].mean() * 100:.3f}%)")


if __name__ == "__main__":
    main()
