
entrada = input()
abertura_str, fechamento_str = entrada.split()
# Converte os valores para inteiros
abertura = int(abertura_str)
fechamento = int(fechamento_str)
# Compara os valores de abertura e fechamento e imprime o resultado correto
if fechamento > abertura:
    print("ALTA")
elif fechamento < abertura:
    print("BAIXA")
else:
    print("ESTAVEL")