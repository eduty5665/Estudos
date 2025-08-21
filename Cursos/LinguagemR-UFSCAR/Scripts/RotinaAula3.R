###Vetores
nota=c(60, 95, 80, 50, 98)
nota
str(nota)#ver estrutura do objeto
nota[5]#ver quinto objeto

###Lista
#definindo a lista
lst=list(nome="Fred",
         esposa="Mary",
         criancas=3,
         idade=c(4,7,9))
lst#imprime a lista
length(lst)#tamanho da lista


###ComandosUteis-Append
nota=c(60, 95, 80, 50, 98)
nota=append(nota,20)
nota


###ComandosUteis-Sort
nota=sort(nota)#crescente
nota
nota=sort(nota, decreasing = TRUE)#decrescente
nota



###Matriz
turma=matrix(c(5,4.5,7,5.2,6.1,
               2.1,6.5,8,7,6.7,
               8.6,7,9.1,8.7,9.3),
             byrow=TRUE,
             nrow=3, ncol=5)
#Colocando nome nas linhas e colunas
rownames(turma)=c("Eduardo","Lucas","Guilherme")
head.matrix="Avaliações"
turma




###MediaMatriz
nl=dim(turma)[1] #numero de linhas
nc=dim(turma)[2] #numero de colunas
soma=0 #objeto que recebera a soma
#for para percorrer as linhas(alunos)
for(i in 1:nl){
  #for para percorrer as colunas(notas)
  for(j in 1:nc){
    soma=soma+turma[i, j]
  }
}
soma
media=soma/(nl*nc)
media
    


#ComandosUteis-Apply
apply(turma, 1, mean)


#ComandosUteis-Tapply
tapply(salario, sexo, mean)




###Tabelas
#Cria-se veetores, depois so apresenta tudo
nome=c("Eduardo", "Lucas", "Guilherme")
curso=c("Superior", "Médio", "Técnico")
idade=c(19, 20, 20)
salario=c(400, 2800, 1300)
sexo=c("M", "M", "M")
df=data.frame(nome, curso, idade, salario, sexo, stringsAsFactors = FALSE)
df




###Subset-Select
df$nome[1]
subset(df, curso=="Médio")
subset(df, select=-nome)
subset(df, select = nome:anos)






###FuncaoC/Lista
idade=c()
modmCadPessoa=function(){
  nome=readline(prompt = "Digite seu nome: ")
  nome=as.character.srcref(nome)
  esposa=readline(prompt = "Digite o nome de sua esposa: ")
  esposa=as.character.srcref(esposa)
  crianca=readline(prompt = "Quantas criancas voce tem? ")
  crianca=as.integer(crianca)
  while(X<crianca){
    idadecrianca=readline(prompt = "Digite a idade das criancas: ")
    idadecrianca=as.integer(idade)
    idade=append(idade, idadecrianca)
    X=X+1
  }
  X=1
  print(nome)
  print(esposa)
  print(crianca)
  print(idadecrianca)
}
modmCadPessoa()

#lst=list(nome,
 #        esposa,
 #        crianca,
 #        idade)
#lst#imprime a lista
#length(lst)#tamanho da lista
