###Resto
num1=10
num2=3
divisao=num1/num2; divisao
resto=num1%%num2; resto


###Funcao
modm=function(num1, num2){
  divisao=num1/num2
  resto=num1%%num2
  return(list(divisao=divisao, resto=resto))
}
modm(10,3)
#Com outros valores
modm(9,3)


###FuncaoIfElse
modmpar=function(num){
  if(num%%2==0)
    print(paste("Número", num, "é par"))
    else
      print(paste("Número", num, "é impar"))
}
modmpar(16)


###FuncaoMenor10
modm10=function(num){
  if(num<10)
    print(paste(num, "menor que 10"))
    else
      print(paste("Número igual ou maior que 10"))
}
modm10(8)
modm10(10)
modm10(11)


##FuncaoCarro
modmCarro=function(idade){
  if(idade<=3)
    print(paste("Seu carro é novo"))
  else
    print(paste("Seu carro é antigo"))
}
modmCarro(8)
modmCarro(2)
modmCarro(3)


##FuncaoC/Entrada
modmCarro2=function(){
  idade=readline(prompt = "Quantos anos seu carro tem? ")
  idade=as.integer(idade)
  if(idade<=3)
    print(paste("Seu carro é novo"))
  else
    print(paste("Seu carro é antigo"))
}
modmCarro2()


##FuncaoIfElseJuntos
modmCarro3=function(){
  idade=readline(prompt = "Quantos anos seu carro tem? ")
  idade=as.integer(idade)
  ifelse(idade<=3, "Seu carro é novo", "Seu carro é antigo")
}
modmCarro3()

##FuncaoEscola
modmEscola=function(){
  n1=readline(prompt = "Qual foi a primeira nota? ")
  n1=as.integer(n1)
  n2=readline(prompt = "Qual foi a segunda nota? ")
  n2=as.integer(n2)
  media=(n1+n2)/2
  print(paste("A sua média foi", media))
  ifelse(media>=6, "Parabéns", "Estude Mais")
}
modmEscola()


###Funcao10-Final
modn10=function(num){
  num=readline(prompt = "Digite um número: ")
  num=as.integer(num)
  if(num<10)
    print(paste(num, "menor que 10"))
  else if(num == 10)
    print(paste(num, "igual que 10"))
  else
    print(paste(num, "maior que 10"))
}
modn10()


###RepeticaoForSimples
for(i in seq(1,5)){
  print(i)
}


###FuncaoRepeticaoFor
modmgeraFor=function(){
  num=readline(prompt = "Digite o limite: ")
  num=as.integer(num)
  for (x in seq(1, num, 1)) {
    print(x)
  }
  print("FIM")
}
modmgeraFor()


###RepeticaoWhileSimples
x=1
while(X<11){
  print(X)
  X=X+1
}


###FuncaoRepeticaoWhile
modmgerawhile=function(){
  num=readline(prompt = "Digite o limite: ")
  num=as.integer(num)
  while(x<num){
    print(x)
    x=x+1
  }
  print("FIM")
}
modmgerawhile()


##TestandoSeq
?seq
seq(0, 1, lenght = 5)
seq(0, 1, by = 0.25)
seq(1.575, 5.125, by = 0.05)
seq(17)
