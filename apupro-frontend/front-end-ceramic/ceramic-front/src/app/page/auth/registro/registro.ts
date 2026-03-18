import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {
  // 'rol' inicializado en 'usuario' por defecto
  usuario = { 
    dni: '', nombre: '', apellido: '', email: '', 
    password: '', confirmPassword: '', telefono: '', 
    direccion: '', ocupacionNombre: '', rol: 'usuario' 
  };
  
  cargandoReniec = false;
  verPass = false;

  constructor(private api: ApiService, private router: Router) {}

  togglePass() { this.verPass = !this.verPass; }

  buscarDNI() {
    if (this.usuario.dni.length !== 8) return;
    this.cargandoReniec = true;
    this.api.consultarReniec(this.usuario.dni).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.usuario.nombre = res.nombre;
          this.usuario.apellido = res.apellido;
        }
        this.cargandoReniec = false;
      },
      error: () => {
        Swal.fire('Error', 'DNI no encontrado', 'error');
        this.cargandoReniec = false;
      }
    });
  }

  // VALIDACIÓN: 8 carac, Mayús, Minús, Núm y Símbolo (AHORA INCLUYE EL PUNTO)
  esPasswordSegura(pass: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    return regex.test(pass);
  }

  registrar() {
    // 1. Validar que primero se haya buscado el DNI
    if (!this.usuario.nombre) {
      Swal.fire('Atención', 'Primero debes validar tu DNI', 'warning');
      return;
    }

    // 2. Validación estricta: Ningún campo obligatorio puede estar vacío
    if (!this.usuario.dni || !this.usuario.apellido || 
        !this.usuario.email || !this.usuario.telefono || !this.usuario.direccion || 
        !this.usuario.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor, llena todos los datos obligatorios antes de continuar.'
      });
      return;
    }

    // 3. Validación de formato de Correo Electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.usuario.email)) {
      Swal.fire('Correo Inválido', 'Por favor ingresa un correo electrónico real.', 'error');
      return;
    }

    // 4. Validación de Contraseña Segura
    if (!this.esPasswordSegura(this.usuario.password)) {
      Swal.fire('Seguridad', 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (incluyendo el punto).', 'error');
      return;
    }

    // 5. Confirmación de Contraseña
    if (this.usuario.password !== this.usuario.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    // Si pasa todas las validaciones (La Doble Cerradura funciona), recién enviamos al servidor
    Swal.fire({ title: 'Creando cuenta...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    this.api.registrarUsuario(this.usuario).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Mensaje personalizado según lo que eligió
          let tipo = this.usuario.rol === 'Empleador' ? 'Cliente' : 'Especialista';
          Swal.fire('Éxito', `Cuenta de ${tipo} creada correctamente`, 'success')
            .then(() => this.router.navigate(['/login']));
        }
      },
      error: (err: any) => Swal.fire('Error', err.error?.message || 'Error al registrar', 'error')
    });
  }
}