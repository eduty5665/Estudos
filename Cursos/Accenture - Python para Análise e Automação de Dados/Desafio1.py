# Lê o valor total da compra como inteiro
valor_compra = int(input())

# Estrutura condicional para decidir e imprimir a mensagem correta
if valor_compra < 50:
    print("Obrigado por comprar conosco!")
elif valor_compra <= 99:
    print("Parabens! Voce ganhou um brinde!")
elif valor_compra <= 199:
    print("Desconto de 10 reais aplicado!")
else:
    print("Desconto de 25 reais aplicado!")