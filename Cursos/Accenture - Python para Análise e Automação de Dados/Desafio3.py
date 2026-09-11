# Lê a entrada do usuário (nome do cliente)
entrada = input()

# Remove espaços extras no início/fim e divide a string em palavras
# split() sem argumento já ignora espaços múltiplos entre palavras
palavras = entrada.strip().split()

# Capitalize cada palavra (primeira letra maiúscula, demais minúsculas)
palavras_formatadas = [palavra.capitalize() for palavra in palavras]

# Junte as palavras com um único espaço entre elas
nome_formatado = ' '.join(palavras_formatadas)

# Exiba o nome formatado
print(nome_formatado)