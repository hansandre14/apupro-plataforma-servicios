import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // --- SPRINT 1: AUTENTICACIÓN Y RENIEC ---
  consultarReniec(dni: string) {
    return this.http.post(`${this.apiUrl}/reniec`, { dni: dni });
  }

  registrarUsuario(usuario: any) {
    return this.http.post(`${this.apiUrl}/registro`, usuario);
  }

  loginUsuario(credenciales: any) {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  setToken(token: string, usuario: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  // --- SPRINT 2: CATÁLOGO ---
  getTrabajos() {
    return this.http.get(`${this.apiUrl}/trabajos`);
  }
  crearTrabajo(trabajo: any) {
    return this.http.post(`${this.apiUrl}/trabajos`, trabajo);
  }
  getMisTrabajosPublicados(usuarioId: number) {
    return this.http.get(`${this.apiUrl}/trabajos/usuario/${usuarioId}`);
  }
  actualizarTrabajo(id: number, datos: any) {
    return this.http.put(`${this.apiUrl}/trabajos/${id}`, datos);
  }
  eliminarTrabajo(id: number) {
    return this.http.delete(`${this.apiUrl}/trabajos/${id}`);
  }

  // --- SPRINT 3: SOLICITUDES ---
  postular(datos: any) {
    return this.http.post(`${this.apiUrl}/postulaciones`, datos);
  }

  getMisPostulaciones(usuarioId: number) {
    return this.http.get(`${this.apiUrl}/postulaciones/usuario/${usuarioId}`);
  }

  // --- SPRINT 4: PAGOS EN LÍNEA ---
  registrarPago(pago: any) {
    return this.http.post(`${this.apiUrl}/pagos`, pago);
  }
  subirVoucherYape(postulacionId: number, formData: FormData) {
    return this.http.post(`${this.apiUrl}/pagos/${postulacionId}/voucher`, formData);
  }
  verificarPago(postulacionId: number) {
    return this.http.put(`${this.apiUrl}/pagos/${postulacionId}/verificar`, {});
  }

  // 🚀 SPRINT 5: Enviar Calificación y Finalizar Trabajo
  enviarResenaYFinalizar(postulacionId: number, datos: any) {
    return this.http.post(`${this.apiUrl}/postulaciones/${postulacionId}/resena`, datos);
  }

  // =================================================================
  // ✅ FASE 2: Función para enviar la foto y el CV
  // =================================================================
  actualizarPerfilConArchivos(usuarioId: number, formData: FormData) {
    return this.http.post(`${this.apiUrl}/usuarios/${usuarioId}/archivos`, formData);
  }

  // =================================================================
  // ✅ NUEVO (FASE 3): PANEL DEL EMPLEADOR
  // =================================================================
  getPostulantesParaEmpleador(empleadorId: number) {
    return this.http.get(`${this.apiUrl}/empleador/${empleadorId}/postulantes`);
  }

  actualizarEstadoPostulacion(id: number, estado: string) {
    return this.http.put(`${this.apiUrl}/postulaciones/${id}/estado`, { estado: estado });
  }
  
  // 🚀  Obtener Reputación
  getReputacion(usuarioId: number) {
    return this.http.get(`${this.apiUrl}/usuarios/${usuarioId}/reputacion`);
  }
  //  Obtener comentarios de reseñas
  getResenasDetalle(usuarioId: number) {
    return this.http.get(`${this.apiUrl}/usuarios/${usuarioId}/resenas-detalle`);
  }
  // 🚀 NUEVA RUTA PARA OCUPACIONES
  getOcupaciones() {
    return this.http.get(`${this.apiUrl}/ocupaciones`);
  }

  //  (ADMIN)
  getAdminStats() { return this.http.get(`${this.apiUrl}/admin/stats`); }
  getAdminUsuarios() { return this.http.get(`${this.apiUrl}/admin/usuarios`); }
  eliminarUsuario(id: number) { return this.http.delete(`${this.apiUrl}/admin/usuarios/${id}`); }
}