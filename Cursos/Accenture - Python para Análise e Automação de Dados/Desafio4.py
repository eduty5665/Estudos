# Leitura das listas de clientes de cada projeto
linha1 = input().strip()
linha2 = input().strip()

# Converte cada linha em um conjunto de nomes, garantindo que listas vazias resultem em conjuntos vazios
clientes_projeto1 = set(linha1.split())
clientes_projeto2 = set(linha2.split())

# Identificação dos nomes exclusivos usando a operação de diferença simétrica
exclusivos = clientes_projeto1.symmetric_difference(clientes_projeto2)

# Impressão dos nomes exclusivos em ordem alfabética, ou "Nenhum" se não houver
if exclusivos:
    print(' '.join(sorted(exclusivos)))
else:
    print("Nenhum")