# Leitura da linha de identificadores de transações
entrada = input()
# Cria uma lista com as transações sem duplicatas, mantendo a ordem da primeira ocorrência
transacoes = entrada.split()
transacoes_unicas = []
for transacao in transacoes:
    if transacao not in transacoes_unicas:
        transacoes_unicas.append(transacao)
print(' '.join(transacoes_unicas))