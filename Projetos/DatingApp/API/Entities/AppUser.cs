using System;

namespace API.Entities;

public class AppUser
{
    // O EntityFramework precisa de um Id pra considerar como chave primaria
    // Quando o Id é tipado como Int, o EntityFramework entende que esse campo deve ser autoincrement
    public int Id { get; set; }
    public required string UserName { get; set; }
    public required Byte[] PasswordHash { get; set; }
    public required Byte[] PasswordHashSalt { get; set; }

}
