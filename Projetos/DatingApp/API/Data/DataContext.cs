using System;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext(DbContextOptions options) : DbContext(options)
{

    // Definindo uma tabela chamada Users
    public DbSet<AppUser> Users { get; set; }

}
