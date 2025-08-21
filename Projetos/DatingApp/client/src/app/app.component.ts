import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  // imports: [RouterOutlet, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {


  http = inject(HttpClient) // Aqui o estilo de injeção de dependencia pode ser tratado um pouco diferente, ao invés de colocar no construtor, parece bom seguir assim
  title = 'DatingApp';
  users: any;

  // Basicamente o trabalho do Axios quando trabalhei no front do talkme com react. A principal diferença pe sintaxe apenas (sempre né)
  ngOnInit(): void {
    this.http.get('https://localhost:5001/api/users').subscribe({
      next: response => this.users = response,
      error: error => console.log(error),
      complete: () => console.info("The request was complete sucessfully")
    })
  } // Não precisa dar "unsubscribe" na requisição, pois toda requisição HTTP depois de concluida faz isso sozinha 
}
