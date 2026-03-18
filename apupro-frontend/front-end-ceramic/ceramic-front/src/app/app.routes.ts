import { Routes } from '@angular/router';

// Rutas a tus componentes
import { Login } from './page/auth/login/login';
import { Registro } from './page/auth/registro/registro';
import { Dashboard } from './page/dashboard/dashboard';

// Importación del Guardia de Seguridad (Asegúrate de que auth-guard.ts esté dentro de la carpeta service)
import { authGuard } from './service/auth-guard';

export const routes: Routes = [
  // Rutas PÚBLICAS (No requieren sesión)
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  
  // Rutas PRIVADAS (Protegidas por JWT)
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard] 
  },

  // Ruta comodín: Cualquier otra URL redirige al login
  { path: '**', redirectTo: 'login' }
];