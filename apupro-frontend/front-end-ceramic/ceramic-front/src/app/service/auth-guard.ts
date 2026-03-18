import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos el enrutador para poder redirigir al usuario
  const router = inject(Router);
  
  // Buscamos si existe la pulsera VIP (el token)
  const token = localStorage.getItem('token');

  if (token) {
    // Si tiene token, le abrimos la puerta (retorna true)
    return true;
  } else {
    // Si NO tiene token, lo pateamos de vuelta a la página de login
    router.navigate(['/login']);
    return false;
  }
};