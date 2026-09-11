class Cliente:
    def __init__(self, nome: str, email: str, saldo: int):
        self.nome = nome
        self.email = email
        self.saldo = saldo

    def is_vip(self) -> bool:
        # Retorna True se o saldo for igual ou maior que 1000, senão False
        return self.saldo >= 1000

# Entrada: nome, email e saldo do cliente (um por linha)
nome = input()
email = input()
saldo = int(input())

cliente = Cliente(nome, email, saldo)

# Saída: imprima "VIP" se o cliente for VIP, senão "REGULAR"
if cliente.is_vip():
    print("VIP")
else:
    print("REGULAR")