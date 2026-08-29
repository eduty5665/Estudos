"""
test_deteccao_fraude.py
=========================
Testes automatizados (pytest) para o pipeline de detecção de fraude.

Rodar com:
    pytest testes/ -v

Rodar e salvar relatório em arquivo (feito também pelo executar_testes.py):
    pytest testes/ -v > testes/resultado_testes.txt
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from basedados.gerar_dados import gerar_base
from modelo.deteccao_fraude import (
    aplicar_threshold_customizado,
    avaliar_modelo,
    balancear_oversampling,
    balancear_undersampling,
    carregar_dados,
    construir_pipeline,
    dividir_treino_teste,
    preparar_features,
    treinar_random_forest,
    treinar_regressao_logistica,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def df_pequeno():
    """Base sintética pequena e rápida, só para os testes."""
    return gerar_base(n_total=1500, taxa_fraude=0.02, seed=7)


@pytest.fixture(scope="module")
def dados_preparados(df_pequeno):
    X, Y = preparar_features(df_pequeno)
    X_train, X_test, Y_train, Y_test = dividir_treino_teste(X, Y, test_size=0.3)
    return X_train, X_test, Y_train, Y_test


# ---------------------------------------------------------------------------
# Testes: geração e carregamento de dados
# ---------------------------------------------------------------------------

class TestDados:
    def test_gerar_base_tem_colunas_esperadas(self, df_pequeno):
        colunas_esperadas = {"Time", "Amount", "Class"} | {f"V{i}" for i in range(1, 29)}
        assert colunas_esperadas.issubset(set(df_pequeno.columns))

    def test_gerar_base_tamanho_correto(self, df_pequeno):
        assert len(df_pequeno) == 1500

    def test_gerar_base_taxa_fraude_aproximada(self, df_pequeno):
        taxa = df_pequeno["Class"].mean()
        # taxa alvo 0.02, tolera variação por causa do mínimo de 20 fraudes
        assert 0.005 <= taxa <= 0.06

    def test_gerar_base_sem_valores_nulos(self, df_pequeno):
        assert df_pequeno.isnull().sum().sum() == 0

    def test_carregar_dados_sem_arquivo_usa_fallback(self):
        # sem caminho explícito e sem creditcard.csv real -> usa gerador sintético
        df = carregar_dados()
        assert "Class" in df.columns
        assert len(df) > 0

    def test_carregar_dados_com_caminho_customizado(self, df_pequeno, tmp_path):
        caminho = tmp_path / "base_teste.csv"
        df_pequeno.to_csv(caminho, index=False)
        df_carregado = carregar_dados(caminho)
        assert len(df_carregado) == len(df_pequeno)


# ---------------------------------------------------------------------------
# Testes: preparação de features
# ---------------------------------------------------------------------------

class TestPreparacaoFeatures:
    def test_preparar_features_retorna_x_y(self, df_pequeno):
        X, Y = preparar_features(df_pequeno)
        assert len(X) == len(Y) == len(df_pequeno)

    def test_preparar_features_remove_class_de_x(self, df_pequeno):
        X, _ = preparar_features(df_pequeno)
        assert "Class" not in X.columns

    def test_preparar_features_cria_colunas_derivadas(self, df_pequeno):
        X, _ = preparar_features(df_pequeno)
        assert "Amount_log" in X.columns
        assert "Amount_scaled" in X.columns

    def test_preparar_features_amount_log_nao_negativo(self, df_pequeno):
        X, _ = preparar_features(df_pequeno)
        assert (X["Amount_log"] >= 0).all()

    def test_preparar_features_levanta_erro_sem_coluna_class(self):
        df_sem_class = pd.DataFrame({"Amount": [1, 2, 3]})
        with pytest.raises(KeyError):
            preparar_features(df_sem_class)


# ---------------------------------------------------------------------------
# Testes: split treino/teste
# ---------------------------------------------------------------------------

class TestSplit:
    def test_dividir_treino_teste_proporcao(self, dados_preparados):
        X_train, X_test, Y_train, Y_test = dados_preparados
        total = len(X_train) + len(X_test)
        assert abs(len(X_test) / total - 0.3) < 0.02

    def test_dividir_treino_teste_estratificado(self, df_pequeno):
        X, Y = preparar_features(df_pequeno)
        X_train, X_test, Y_train, Y_test = dividir_treino_teste(X, Y)
        taxa_original = Y.mean()
        taxa_teste = Y_test.mean()
        # estratificação deve manter a proporção de fraude parecida
        assert abs(taxa_original - taxa_teste) < 0.03


# ---------------------------------------------------------------------------
# Testes: balanceamento
# ---------------------------------------------------------------------------

class TestBalanceamento:
    def test_undersampling_classes_iguais(self, df_pequeno):
        df_under = balancear_undersampling(df_pequeno)
        contagem = df_under["Class"].value_counts()
        assert contagem[0] == contagem[1]

    def test_oversampling_smote_classes_iguais(self, dados_preparados):
        X_train, _, Y_train, _ = dados_preparados
        X_res, Y_res = balancear_oversampling(X_train, Y_train)
        contagem = Y_res.value_counts()
        assert contagem[0] == contagem[1]

    def test_oversampling_smote_aumenta_dataset(self, dados_preparados):
        X_train, _, Y_train, _ = dados_preparados
        X_res, Y_res = balancear_oversampling(X_train, Y_train)
        assert len(X_res) >= len(X_train)


# ---------------------------------------------------------------------------
# Testes: treino dos modelos
# ---------------------------------------------------------------------------

class TestModelos:
    def test_treinar_regressao_logistica_prediz(self, dados_preparados):
        X_train, X_test, Y_train, Y_test = dados_preparados
        modelo = treinar_regressao_logistica(X_train, Y_train, max_iter=200)
        y_pred = modelo.predict(X_test)
        assert len(y_pred) == len(Y_test)
        assert set(np.unique(y_pred)).issubset({0, 1})

    def test_treinar_random_forest_prediz(self, dados_preparados):
        X_train, X_test, Y_train, Y_test = dados_preparados
        modelo = treinar_random_forest(X_train, Y_train, n_estimators=20, max_depth=5)
        y_pred = modelo.predict(X_test)
        assert len(y_pred) == len(Y_test)

    def test_construir_pipeline_treina_e_prediz(self, dados_preparados):
        X_train, X_test, Y_train, Y_test = dados_preparados
        pipeline = construir_pipeline(max_iter=200)
        pipeline.fit(X_train, Y_train)
        y_pred = pipeline.predict(X_test)
        assert len(y_pred) == len(Y_test)

    def test_random_forest_tem_feature_importances(self, dados_preparados):
        X_train, _, Y_train, _ = dados_preparados
        modelo = treinar_random_forest(X_train, Y_train, n_estimators=20, max_depth=5)
        assert len(modelo.feature_importances_) == X_train.shape[1]


# ---------------------------------------------------------------------------
# Testes: avaliação / métricas
# ---------------------------------------------------------------------------

class TestAvaliacao:
    def test_avaliar_modelo_retorna_metricas_esperadas(self, dados_preparados, tmp_path):
        X_train, X_test, Y_train, Y_test = dados_preparados
        modelo = treinar_regressao_logistica(X_train, Y_train, max_iter=200)
        resultado = avaliar_modelo(
            modelo, X_test, Y_test, nome="teste_unitario", pasta_visual=tmp_path
        )
        assert "auc" in resultado
        assert 0.0 <= resultado["auc"] <= 1.0
        assert "relatorio" in resultado
        assert "1" in resultado["relatorio"]  # métricas da classe fraude presentes

    def test_avaliar_modelo_salva_graficos(self, dados_preparados, tmp_path):
        X_train, X_test, Y_train, Y_test = dados_preparados
        modelo = treinar_regressao_logistica(X_train, Y_train, max_iter=200)
        avaliar_modelo(modelo, X_test, Y_test, nome="teste_grafico", pasta_visual=tmp_path)
        assert (tmp_path / "roc_curve_teste_grafico.png").exists()
        assert (tmp_path / "precision_recall_curve_teste_grafico.png").exists()
        assert (tmp_path / "confusion_matrix_teste_grafico.png").exists()

    def test_avaliar_modelo_sem_salvar_graficos(self, dados_preparados, tmp_path):
        X_train, X_test, Y_train, Y_test = dados_preparados
        modelo = treinar_regressao_logistica(X_train, Y_train, max_iter=200)
        avaliar_modelo(
            modelo, X_test, Y_test, nome="sem_grafico",
            salvar_graficos=False, pasta_visual=tmp_path,
        )
        assert not any(tmp_path.iterdir())


# ---------------------------------------------------------------------------
# Testes: threshold customizado
# ---------------------------------------------------------------------------

class TestThreshold:
    def test_threshold_customizado_binario(self):
        probs = np.array([0.1, 0.4, 0.6, 0.9, 0.05])
        y_pred = aplicar_threshold_customizado(probs, threshold=0.3)
        assert list(y_pred) == [0, 1, 1, 1, 0]

    def test_threshold_mais_baixo_gera_mais_positivos(self):
        probs = np.array([0.1, 0.2, 0.35, 0.5, 0.7])
        pred_baixo = aplicar_threshold_customizado(probs, threshold=0.2)
        pred_alto = aplicar_threshold_customizado(probs, threshold=0.6)
        assert pred_baixo.sum() >= pred_alto.sum()


# ---------------------------------------------------------------------------
# Teste de integração: pipeline completo
# ---------------------------------------------------------------------------

class TestIntegracao:
    def test_pipeline_completo_fim_a_fim(self, df_pequeno, tmp_path):
        """Roda o fluxo inteiro (dados -> features -> split -> SMOTE ->
        treino -> avaliação) e garante que nada quebra e que a AUC é
        melhor que um classificador aleatório (0.5)."""
        X, Y = preparar_features(df_pequeno)
        X_train, X_test, Y_train, Y_test = dividir_treino_teste(X, Y)
        X_res, Y_res = balancear_oversampling(X_train, Y_train)

        modelo = treinar_random_forest(X_res, Y_res, n_estimators=30, max_depth=6)
        resultado = avaliar_modelo(
            modelo, X_test, Y_test, nome="integracao", pasta_visual=tmp_path
        )

        assert resultado["auc"] > 0.5
