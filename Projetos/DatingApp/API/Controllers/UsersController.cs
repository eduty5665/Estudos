using System;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

// https://localhost:5000/api/users
public class UsersController(DataContext context) : BaseApiController
{
    // IEnumerable serve para fazer referencia a seleção de um tipo... algo parecido com List<AppUser> faria em outras linguagens
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers(){
        var users = await context.Users.ToListAsync();
        return users;
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppUser>> GetUsers(int id){
        var user = await context.Users.FindAsync(id);

        if (user == null) return NotFound();

        return user;
    }

}
