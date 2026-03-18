import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Buscamos el token en el LocalStorage
  const token = localStorage.getItem('token');
  
  // 2. Si existe, clonamos la petición y le pegamos la cabecera de Autorización
  if (token) {
    const peticionClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Pasamos la petición con el token
    return next(peticionClonada);
  }
  
  // Si no hay token, dejamos que la petición siga normal
  return next(req);
};