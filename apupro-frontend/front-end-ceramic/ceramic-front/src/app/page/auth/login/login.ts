import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Variables que el HTML está buscando
  email = '';
  password = '';

  constructor(private api: ApiService, private router: Router) {}

  // Función que se ejecuta al darle al botón "Ingresar"
  login() {
    if (!this.email || !this.password) {
      Swal.fire('Atención', 'Por favor, ingresa tu correo y contraseña.', 'warning');
      return;
    }

    Swal.fire({ title: 'Iniciando sesión...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    // 🚀 SOLUCIÓN APLICADA: Ahora usamos exactamente "loginUsuario" como está en tu api.service.ts
    this.api.loginUsuario({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        if (res.success) {
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          Swal.close();
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => {
        Swal.fire('Error', err.error?.message || 'Credenciales incorrectas.', 'error');
      }
    });
  }

  // Función para ir a la página de crear cuenta
  irRegistro() {
    this.router.navigate(['/registro']); 
  }
}