"""
executar_tudo.py
==================
Script de conveniência: roda o projeto inteiro em sequência.

    python3 executar_tudo.py

Passos executados:
1. Gera a base de dados (se `basedados/creditcard.csv` ainda não existir)
2. Roda o pipeline completo de treino/avaliação (modelo/deteccao_fraude.py)
3. Roda a suíte de testes (pytest) e salva o resultado em
   testes/resultado_testes.txt
"""

import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PYTHON = sys.executable


def rodar(comando: list[str], titulo: str):
    print("\n" + "=" * 70)
    print(titulo)
    print("=" * 70)
    resultado = subprocess.run(comando, cwd=BASE_DIR)
    if resultado.returncode != 0:
        print(f"\n[ERRO] Etapa '{titulo}' falhou (código {resultado.returncode}).")
        sys.exit(resultado.returncode)


def main():
    dados_path = BASE_DIR / "basedados" / "creditcard.csv"
    if not dados_path.exists():
        rodar([PYTHON, "basedados/gerar_dados.py"], "1/3 — Gerando base de dados sintética")
    else:
        print(f"Base de dados já existe em {dados_path}, pulando geração.")

    rodar([PYTHON, "modelo/deteccao_fraude.py"], "2/3 — Treinando e avaliando modelos")

    print("\n" + "=" * 70)
    print("3/3 — Rodando testes automatizados")
    print("=" * 70)
    resultado_path = BASE_DIR / "testes" / "resultado_testes.txt"
    with open(resultado_path, "w") as f:
        proc = subprocess.run(
            [PYTHON, "-m", "pytest", "testes/", "-v"],
            cwd=BASE_DIR, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
        )
        f.write(proc.stdout)
        print(proc.stdout)

    print(f"\nResultado dos testes salvo em: {resultado_path}")
    print("\nProjeto executado com sucesso. Veja os gráficos em /visual.")


if __name__ == "__main__":
    main()
