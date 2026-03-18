import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../service/api.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  usuarioActual: any = null;
  vistaActual: string = 'catalogo'; 
  trabajos: any[] = [];
  trabajosFiltrados: any[] = []; 
  misPostulaciones: any[] = [];
  misPostulantes: any[] = [];
  completitudPerfil: number = 0; 

  fotoParaSubir: File | null = null;
  cvParaSubir: File | null = null;
  mensajePropuesta: string = '';
  servicioSeleccionadoId: number | null = null;

  // 🚀 Variables para Autocompletado y Ocupaciones
  ocupacionesBD: any[] = [];
  nuevoServicio = { categoria: '', titulo: '', ubicacion: '', salario: null as number | null };
  
  pagoActual = { postulacion_id: 0, especialista: '', telefono_especialista: '', servicio: '', monto: 0 };
  voucherParaSubir: File | null = null; 
  voucherSeleccionado: any = null;

  reputacion = { promedio: '0.0', total_resenas: 0 };
  terminoBusqueda: string = '';
  resenasViendo: any[] = [];
  especialistaViendo: any = null;

  resenaActual = { postulacion_id: 0, cliente_id: 0, especialista_id: 0, puntuacion: 5, comentario: '' };

  misTrabajosPublicados: any[] = [];
  trabajoEditando: any = { id: 0, titulo: '', ubicacion: '', salario: null };

  adminStats: any = { total_usuarios: 0, total_trabajos: 0, dinero_movido: 0 };
  adminUsuarios: any[] = [];

  isDarkMode: boolean = false;
  cargandoDatos: boolean = true; 

  constructor(private api: ApiService, private router: Router) {}

  get esAdmin(): boolean {
    return this.usuarioActual?.email === 'admin@admin.com';
  }

  ngOnInit(): void {
    const theme = localStorage.getItem('apupro_theme');
    if (theme === 'dark') this.isDarkMode = true;

    const userStr = localStorage.getItem('usuario');
    if (!userStr) { this.router.navigate(['/login']); return; }
    this.usuarioActual = JSON.parse(userStr);
    
    if (this.esAdmin) {
      this.vistaActual = 'admin';
      this.cargarAdminData();
    } else {
      this.calcularProgreso();
      this.vistaActual = 'catalogo'; 
      this.cargarTrabajos();           
      this.cargarMisPostulaciones();   
      this.cargarPostulantes();     
      this.cargarReputacion(); 
      this.cargarOcupaciones(); // Cargamos la lista de la BD al iniciar
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('apupro_theme', this.isDarkMode ? 'dark' : 'light');
  }

  obtenerInsignias(usuario: any, rep: any = null): any[] {
    let insignias: any[] = [];
    if (!usuario) return insignias;

    if (usuario.dni && usuario.dni.toString().length === 8) {
      insignias.push({ icono: 'fa-shield-alt', color: 'text-success', border: 'border-success', texto: 'Identidad Verificada' });
    }

    let total = rep ? rep.total_resenas : (usuario.total_resenas || 0);
    let prom = rep ? parseFloat(rep.promedio) : (parseFloat(usuario.promedio_estrellas) || 0);

    if (total >= 3 && prom >= 4.5) {
      insignias.push({ icono: 'fa-fire', color: 'text-danger', border: 'border-danger', texto: 'Top Abancay' });
    } else if (total === 0) {
      insignias.push({ icono: 'fa-seedling', color: 'text-info', border: 'border-info', texto: 'Nuevo Talento' });
    }

    if (usuario.telefono && usuario.direccion && usuario.ocupacionNombre) {
      insignias.push({ icono: 'fa-bolt', color: 'text-warning', border: 'border-warning', texto: 'Socio Pro' });
    }

    return insignias;
  }

  get cantidadNotificaciones(): number {
    let count = 0;
    if (this.vistaActual === 'panel-empleador') {
      count += this.misPostulantes.filter(p => p.estado === 'pendiente').length;
    } else if (this.vistaActual === 'postulaciones') {
      count += this.misPostulaciones.filter(p => p.estado === 'aceptado' || (p.estado === 'verificado' && p.estado_pago === 'verificado')).length;
    }
    return count;
  }

  contactarWhatsApp(telefono: string, nombre: string, tituloServicio: string) {
    if (!telefono || telefono === 'Sin registrar') {
      Swal.fire('Sin número', 'Este usuario no tiene un celular registrado.', 'info');
      return;
    }
    let num = telefono.replace(/\s+/g, '');
    if (!num.startsWith('51') && !num.startsWith('+51')) num = '51' + num;
    if (num.startsWith('+')) num = num.substring(1);
    const mensaje = `¡Hola ${nombre}! Te contacto desde ApuPro por el servicio de "${tituloServicio}".`;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  cambiarVista(vista: string): void {
    this.vistaActual = vista;
    this.cargandoDatos = true; 
    setTimeout(() => {
      if (vista === 'postulaciones') this.cargarMisPostulaciones();
      else if (vista === 'catalogo') this.cargarTrabajos();
      else if (vista === 'panel-empleador') { this.cargarPostulantes(); this.cargarMisTrabajosPublicados(); }
      else if (vista === 'admin' && this.esAdmin) this.cargarAdminData(); 
      else if (vista === 'perfil') this.cargandoDatos = false; 
    }, 600);
  }

  // =================================================================
  // 🚀 MAGIA ANTI-BUG: Filtramos para no ver nuestros propios anuncios
  // =================================================================
  cargarTrabajos(): void { 
    this.api.getTrabajos().subscribe({ 
      next: (res: any) => { 
        if(res.success) { 
          // Solo guardamos los trabajos cuyo usuario_id sea diferente al mío
          const trabajosAjenos = res.data.filter((t: any) => t.usuario_id !== this.usuarioActual.id);
          this.trabajos = trabajosAjenos; 
          this.trabajosFiltrados = trabajosAjenos; 
        } 
        this.cargandoDatos = false; 
      }, 
      error: () => this.cargandoDatos = false 
    }); 
  }
  
  // Cargar la lista para el Autocompletado (Datalist)
  cargarOcupaciones() {
    this.api.getOcupaciones().subscribe({
      next: (res: any) => { if(res.success) this.ocupacionesBD = res.data; }
    });
  }

  // Seleccionar rápidamente mediante los Chips
  seleccionarChip(categoria: string) {
    this.nuevoServicio.categoria = categoria;
    this.nuevoServicio.titulo = 'Necesito un experto en...';
  }

  abrirModalPropuesta(id: number) { this.servicioSeleccionadoId = id; this.mensajePropuesta = ''; const m = new (window as any).bootstrap.Modal(document.getElementById('modalPropuesta')!); m.show(); }
  confirmarPropuesta() { if (!this.mensajePropuesta || this.mensajePropuesta.length < 10) { Swal.fire('Atención', 'Escribe un mensaje detallado.', 'warning'); return; } Swal.fire({ title: 'Enviando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() }); this.api.postular({ usuario_id: this.usuarioActual.id, trabajo_id: this.servicioSeleccionadoId, mensaje: this.mensajePropuesta, estado: 'Pendiente' }).subscribe({ next: (res: any) => { if (res.success) { const m = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalPropuesta')!); if (m) m.hide(); Swal.fire('¡Enviada!', 'El cliente revisará tu mensaje.', 'success'); this.cargarMisPostulaciones(); } }, error: (err) => Swal.fire('Error', 'No se pudo enviar.', 'error') }); }
  yaPostulo(trabajoId: number): boolean { return this.misPostulaciones.some(p => p.trabajo_id === trabajoId); }

  abrirModalNuevoServicio() { 
    this.nuevoServicio = { categoria: '', titulo: '', ubicacion: '', salario: null }; 
    const m = new (window as any).bootstrap.Modal(document.getElementById('modalNuevoServicio')!); 
    m.show(); 
  }

  publicarServicio() { 
    if (!this.nuevoServicio.titulo || !this.nuevoServicio.ubicacion || !this.nuevoServicio.salario) { 
      Swal.fire('Atención', 'Llena todos los campos.', 'warning'); return; 
    } 
    Swal.fire({ title: 'Publicando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() }); 

    const tituloFinal = this.nuevoServicio.categoria ? `[${this.nuevoServicio.categoria}] ${this.nuevoServicio.titulo}` : this.nuevoServicio.titulo;

    const datosAPublicar = {
       titulo: tituloFinal,
       ubicacion: this.nuevoServicio.ubicacion,
       salario: this.nuevoServicio.salario,
       usuario_id: this.usuarioActual.id
    };

    this.api.crearTrabajo(datosAPublicar).subscribe({ 
      next: (res: any) => { 
        if (res.success) { 
          const m = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalNuevoServicio')!); 
          if (m) m.hide(); 
          Swal.fire('¡Publicado!', '', 'success'); 
          this.cargarTrabajos(); 
          this.cargarMisTrabajosPublicados(); 
        } 
      }, 
      error: (err) => Swal.fire('Error', 'Hubo un problema.', 'error') 
    }); 
  }

  abrirModalEditarTrabajo(t: any) { this.trabajoEditando = { id: t.id, titulo: t.titulo, ubicacion: t.ubicacion, salario: t.salario }; const m = new (window as any).bootstrap.Modal(document.getElementById('modalEditarTrabajo')!); m.show(); }
  guardarEdicionTrabajo() { if (!this.trabajoEditando.titulo || !this.trabajoEditando.salario) { Swal.fire('Atención', 'Llena los campos.', 'warning'); return; } Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() }); this.api.actualizarTrabajo(this.trabajoEditando.id, this.trabajoEditando).subscribe({ next: (res: any) => { if (res.success) { const m = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEditarTrabajo')!); if (m) m.hide(); Swal.fire('¡Actualizado!', '', 'success'); this.cargarTrabajos(); this.cargarMisTrabajosPublicados(); } }, error: (err) => Swal.fire('Error', 'No se pudo actualizar.', 'error') }); }
  eliminarTrabajo(id: number) { Swal.fire({ title: '¿Eliminar anuncio?', text: 'Se borrará de la plataforma.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Sí, eliminar' }).then((result) => { if (result.isConfirmed) { Swal.fire({ title: 'Eliminando...', didOpen: () => Swal.showLoading() }); this.api.eliminarTrabajo(id).subscribe({ next: (res: any) => { if (res.success) { Swal.fire('¡Eliminado!', '', 'success'); this.cargarTrabajos(); this.cargarMisTrabajosPublicados(); } }, error: (err) => Swal.fire('No permitido', err.error?.message || 'No se puede eliminar.', 'error') }); } }); }

  cargarMisTrabajosPublicados(): void { this.api.getMisTrabajosPublicados(this.usuarioActual.id).subscribe({ next: (res: any) => { if (res.success) this.misTrabajosPublicados = res.data; } }); }
  cargarMisPostulaciones(): void { this.api.getMisPostulaciones(this.usuarioActual.id).subscribe({ next: (res: any) => { if(res.success) this.misPostulaciones = res.data; this.cargandoDatos = false; }, error: () => this.cargandoDatos = false }); }
  cargarPostulantes(): void { this.api.getPostulantesParaEmpleador(this.usuarioActual.id).subscribe({ next: (res: any) => { if(res.success) this.misPostulantes = res.data; this.cargandoDatos = false; }, error: () => this.cargandoDatos = false }); }

  abrirModalPago(postulacion: any) { this.pagoActual = { postulacion_id: postulacion.postulacion_id, especialista: postulacion.nombre + ' ' + postulacion.apellido, telefono_especialista: postulacion.telefono || '999 999 999', servicio: postulacion.trabajo_titulo, monto: 50.00 }; this.voucherParaSubir = null; const m = new (window as any).bootstrap.Modal(document.getElementById('modalPagoYape')!); m.show(); }
  onVoucherSeleccionado(event: any) { const file = event.target.files[0]; if (file) this.voucherParaSubir = file; }
  confirmarPagoYape() { if (!this.voucherParaSubir) return; Swal.fire({ title: 'Subiendo...', didOpen: () => Swal.showLoading() }); const formData = new FormData(); formData.append('voucher', this.voucherParaSubir); this.api.subirVoucherYape(this.pagoActual.postulacion_id, formData).subscribe({ next: (res: any) => { if (res.success) { const m = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalPagoYape')!); if (m) m.hide(); Swal.fire('¡Enviado!', '', 'success'); this.cargarPostulantes(); } } }); }
  abrirModalVerVoucher(postulacion: any) { this.voucherSeleccionado = postulacion; const m = new (window as any).bootstrap.Modal(document.getElementById('modalVerVoucher')!); m.show(); }
  confirmarVoucher() { Swal.fire({ title: '¿Confirmar?', showCancelButton: true }).then((result) => { if (result.isConfirmed) { this.api.verificarPago(this.voucherSeleccionado.id).subscribe({ next: (res: any) => { if (res.success) { const m = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalVerVoucher')!); if(m) m.hide(); Swal.fire('Confirmado', '', 'success'); this.cargarMisPostulaciones(); } } }); } }); }
  rechazarVoucher() { const m = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalVerVoucher')!); if(m) m.hide(); Swal.fire('Rechazado', '', 'info'); }

  abrirModalResena(postulante: any) { this.resenaActual = { postulacion_id: postulante.postulacion_id, cliente_id: this.usuarioActual.id, especialista_id: postulante.candidato_id, puntuacion: 5, comentario: '' }; const m = new (window as any).bootstrap.Modal(document.getElementById('modalResena')!); m.show(); }
  setEstrellas(cantidad: number) { this.resenaActual.puntuacion = cantidad; }
  enviarResena() { if (!this.resenaActual.comentario) return; Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() }); this.api.enviarResenaYFinalizar(this.resenaActual.postulacion_id, this.resenaActual).subscribe({ next: (res: any) => { if (res.success) { const m = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalResena')!); if (m) m.hide(); Swal.fire('Finalizado', '', 'success'); this.cargarPostulantes(); } } }); }

  calcularProgreso() { let puntos = 0; if (this.usuarioActual.dni) puntos += 25; if (this.usuarioActual.direccion) puntos += 25; if (this.usuarioActual.ocupacion_id || this.usuarioActual.ocupacionNombre) puntos += 25; if (this.usuarioActual.telefono) puntos += 25; this.completitudPerfil = puntos; }
  cerrarSesion(): void { this.api.logout(); this.router.navigate(['/login']); }

  onFotoSeleccionada(event: any) { const file = event.target.files[0]; if (file) { this.fotoParaSubir = file; const reader = new FileReader(); reader.onload = (e: any) => this.usuarioActual.foto = e.target.result; reader.readAsDataURL(file); } }
  onCvSeleccionado(event: any) { const file = event.target.files[0]; if (file) { this.cvParaSubir = file; Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'PDF cargado', showConfirmButton: false, timer: 1500 }); } }
  actualizarPerfil() { Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() }); const formData = new FormData(); if (this.fotoParaSubir) formData.append('foto', this.fotoParaSubir); if (this.cvParaSubir) formData.append('cv', this.cvParaSubir); if (this.usuarioActual.biografia) formData.append('biografia', this.usuarioActual.biografia); if (this.usuarioActual.telefono) formData.append('telefono', this.usuarioActual.telefono); if (this.usuarioActual.direccion) formData.append('direccion', this.usuarioActual.direccion); if (this.usuarioActual.ocupacionNombre) formData.append('ocupacion', this.usuarioActual.ocupacionNombre); this.api.actualizarPerfilConArchivos(this.usuarioActual.id, formData).subscribe({ next: (res: any) => { if (res.success) { if (res.datosActualizados) this.usuarioActual = {...this.usuarioActual, ...res.datosActualizados}; localStorage.setItem('usuario', JSON.stringify(this.usuarioActual)); this.calcularProgreso(); Swal.fire('¡Éxito!', 'Perfil actualizado.', 'success'); } } }); }
  cambiarEstadoCandidato(postulacionId: number, nuevoEstado: string): void { Swal.fire({ title: `¿${nuevoEstado}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí' }).then((result) => { if (result.isConfirmed) { this.api.actualizarEstadoPostulacion(postulacionId, nuevoEstado).subscribe({ next: (res: any) => { if (res.success) { Swal.fire('¡Actualizado!', '', 'success'); this.cargarPostulantes(); } } }); } }); }
  cargarReputacion(): void { this.api.getReputacion(this.usuarioActual.id).subscribe({ next: (res: any) => { if (res.success && res.data) { this.reputacion.total_resenas = res.data.total_resenas; this.reputacion.promedio = parseFloat(res.data.promedio).toFixed(1); } } }); }
  filtrarTrabajos() { const termino = this.terminoBusqueda.toLowerCase(); this.trabajosFiltrados = this.trabajos.filter(t => t.titulo.toLowerCase().includes(termino) || t.ubicacion.toLowerCase().includes(termino) || (t.empresa && t.empresa.toLowerCase().includes(termino))); }
  abrirModalVerResenas(especialista: any) { this.especialistaViendo = especialista; Swal.fire({ title: 'Cargando...', didOpen: () => Swal.showLoading() }); const id = especialista.candidato_id || especialista.id; this.api.getResenasDetalle(id).subscribe({ next: (res: any) => { Swal.close(); if (res.success) { this.resenasViendo = res.data; const m = new (window as any).bootstrap.Modal(document.getElementById('modalVerResenas')!); m.show(); } } }); }

  cargarAdminData() { this.cargandoDatos = true; this.api.getAdminStats().subscribe({ next: (res: any) => { if (res.success) this.adminStats = res.data; } }); this.api.getAdminUsuarios().subscribe({ next: (res: any) => { if (res.success) this.adminUsuarios = res.data; this.cargandoDatos = false; }, error: () => this.cargandoDatos = false }); }

  eliminarUsuarioSistema(id: number) { Swal.fire({ title: '¿Banear usuario?', text: 'Se eliminará su cuenta.', icon: 'error', showCancelButton: true, confirmButtonText: 'Sí, Banear', confirmButtonColor: '#dc3545' }).then(result => { if(result.isConfirmed) { Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() }); this.api.eliminarUsuario(id).subscribe({ next: (res: any) => { if (res.success) { Swal.fire('Baneado', 'Usuario eliminado.', 'success'); this.cargarAdminData(); } }, error: (err) => Swal.fire('Acción denegada', err.error?.message || 'No se pudo eliminar.', 'error') }); } }); }
}