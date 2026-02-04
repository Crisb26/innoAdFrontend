import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioWebSocketAlertas, Alerta } from '../../../core/servicios/websocket-alertas.servicio';
import { NotifyX } from 'notifyx-lib';

@Component({
  selector: 'app-centro-alertas-tiempo-real',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centro-alertas-tiempo-real.component.html',
  styleUrls: ['./centro-alertas-tiempo-real.component.scss']
})
export class CentroAlertasTiempoRealComponent implements OnInit, OnDestroy {
  // Signals
  private alertasSignal = signal<Alerta[]>([]);
  public webSocketConectado = signal(false);

  // Filtros
  filtroTipo = '';
  filtroEstado = '';
  textoBusqueda = '';

  // Alerta seleccionada
  alertaSeleccionada: Alerta | null = null;
  alertaAResolverID: number | null = null;
  descripcionResolucion = '';

  // Computed
  public alertasFiltradas = computed(() => {
    let alertas = this.alertasSignal();

    if (this.filtroTipo) {
      alertas = alertas.filter(a => a.tipo === this.filtroTipo);
    }

    if (this.filtroEstado) {
      alertas = alertas.filter(a => a.estado === this.filtroEstado);
    }

    if (this.textoBusqueda) {
      const busquedaBaja = this.textoBusqueda.toLowerCase();
      alertas = alertas.filter(a =>
        a.titulo.toLowerCase().includes(busquedaBaja) ||
        (a.descripcion && a.descripcion.toLowerCase().includes(busquedaBaja))
      );
    }

    return alertas.sort((a, b) => {
      // Ordenar por prioridad y fecha
      if (a.prioridad !== b.prioridad) {
        return b.prioridad - a.prioridad;
      }
      return new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime();
    });
  });

  constructor(private servicioWebSocketAlertas: ServicioWebSocketAlertas) {}

  ngOnInit(): void {
    this.inicializarConexionWebSocket();
    this.cargarAlertasIniciales();
    this.suscribirseANuevasAlertas();
  }

  /**
   * Inicializa la conexión WebSocket
   */
  private inicializarConexionWebSocket(): void {
    this.webSocketConectado.set(this.servicioWebSocketAlertas.conectadoWebSocket());
    
    // Monitorear cambios de conexión
    const intervalo = setInterval(() => {
      this.webSocketConectado.set(this.servicioWebSocketAlertas.conectadoWebSocket());
    }, 1000);

    this.ngOnDestroy = () => clearInterval(intervalo);
  }

  /**
   * Carga las alertas iniciales
   */
  private cargarAlertasIniciales(): void {
    this.servicioWebSocketAlertas.obtenerAlertasActivas().subscribe({
      next: (alertas) => {
        this.alertasSignal.set(alertas);
      },
      error: (error) => {
        console.error('Error cargando alertas:', error);
        NotifyX.error('Error al cargar las alertas');
      }
    });
  }

  /**
   * Se suscribe a nuevas alertas en tiempo real
   */
  private suscribirseANuevasAlertas(): void {
    this.servicioWebSocketAlertas.nuevaAlerta$().subscribe({
      next: (alerta) => {
        if (alerta) {
          const alertas = this.alertasSignal();
          if (!alertas.find(a => a.id === alerta.id)) {
            this.alertasSignal.set([alerta, ...alertas]);
            this.mostrarNotificacionAlerta(alerta);
          }
        }
      }
    });

    this.servicioWebSocketAlertas.resolucionAlerta$().subscribe({
      next: (alerta) => {
        if (alerta) {
          this.actualizarAlertaEnLista(alerta);
          NotifyX.success(`Alerta ${alerta.id} resuelta`);
        }
      }
    });

    this.servicioWebSocketAlertas.escalamientoAlerta$().subscribe({
      next: (alerta) => {
        if (alerta) {
          this.actualizarAlertaEnLista(alerta);
          NotifyX.warning(`Alerta ${alerta.id} escalada a prioridad ${alerta.prioridad}`);
        }
      }
    });
  }

  /**
   * Actualiza una alerta en la lista
   */
  private actualizarAlertaEnLista(alerta: Alerta): void {
    const alertas = this.alertasSignal();
    const index = alertas.findIndex(a => a.id === alerta.id);
    if (index !== -1) {
      alertas[index] = alerta;
      this.alertasSignal.set([...alertas]);
    }
  }

  /**
   * Muestra notificación visual de nueva alerta
   */
  private mostrarNotificacionAlerta(alerta: Alerta): void {
    let notificacion = '';
    
    switch (alerta.tipo) {
      case 'CRITICA':
        notificacion = `⚠️ Alerta Crítica: ${alerta.titulo}`;
        NotifyX.error(notificacion);
        break;
      case 'ADVERTENCIA':
        notificacion = `⚡ Advertencia: ${alerta.titulo}`;
        NotifyX.warning(notificacion);
        break;
      case 'INFO':
        notificacion = `ℹ️ Información: ${alerta.titulo}`;
        NotifyX.info(notificacion);
        break;
      case 'EXITO':
        notificacion = `✅ Éxito: ${alerta.titulo}`;
        NotifyX.success(notificacion);
        break;
    }
  }

  /**
   * Aplica los filtros
   */
  public aplicarFiltros(): void {
    // Los filtros se aplican automáticamente a través del computed alertasFiltradas
  }

  /**
   * Cuenta alertas por tipo
   */
  public contarPorTipo(tipo: string): number {
    return this.alertasSignal().filter(a => a.tipo === tipo && a.estado === 'ACTIVA').length;
  }

  /**
   * Obtiene el color correspondiente al tipo de alerta
   */
  public obtenerColorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      'CRITICA': '#ff6b6b',
      'ADVERTENCIA': '#ffa500',
      'INFO': '#667eea',
      'EXITO': '#28a745'
    };
    return colores[tipo] || '#ccc';
  }

  /**
   * Abre el modal para resolver una alerta
   */
  public abrirModalResolver(alerta: Alerta): void {
    this.alertaAResolverID = alerta.id || null;
    this.descripcionResolucion = '';
    
    // Usar Bootstrap Modal
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('modalResolver')
    );
    modal.show();
  }

  /**
   * Confirma la resolución de una alerta
   */
  public confirmarResolver(): void {
    if (!this.alertaAResolverID) return;

    const usuarioId = localStorage.getItem('userId') || 'Sistema';
    
    this.servicioWebSocketAlertas.resolverAlerta(
      this.alertaAResolverID,
      usuarioId,
      this.descripcionResolucion
    ).subscribe({
      next: (alerta) => {
        this.actualizarAlertaEnLista(alerta);
        NotifyX.success('Alerta resuelta exitosamente');
        
        // Cerrar modal
        const modal = (window as any).bootstrap.Modal.getInstance(
          document.getElementById('modalResolver')
        );
        modal?.hide();
      },
      error: (error) => {
        console.error('Error resolviendo alerta:', error);
        NotifyX.error('Error al resolver la alerta');
      }
    });
  }

  /**
   * Escala una alerta
   */
  public escalarAlerta(id: number): void {
    this.servicioWebSocketAlertas.escalarAlerta(id).subscribe({
      next: (alerta) => {
        this.actualizarAlertaEnLista(alerta);
        NotifyX.warning(`Alerta escalada a prioridad ${alerta.prioridad}/5`);
      },
      error: (error) => {
        console.error('Error escalando alerta:', error);
        NotifyX.error('Error al escalar la alerta');
      }
    });
  }

  /**
   * Ignora una alerta
   */
  public ignorarAlerta(id: number): void {
    this.servicioWebSocketAlertas.ignorarAlerta(id).subscribe({
      next: (alerta) => {
        this.actualizarAlertaEnLista(alerta);
        NotifyX.info('Alerta ignorada');
      },
      error: (error) => {
        console.error('Error ignorando alerta:', error);
        NotifyX.error('Error al ignorar la alerta');
      }
    });
  }

  /**
   * Muestra los detalles de una alerta
   */
  public mostrarDetalles(alerta: Alerta): void {
    this.alertaSeleccionada = alerta;
    
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('modalDetalles')
    );
    modal.show();
  }

  /**
   * Limpia todas las alertas resueltas
   */
  public limpiarAlertas(): void {
    if (confirm('¿Deseas limpiar las alertas resueltas?')) {
      const alertasActivas = this.alertasSignal().filter(a => a.estado === 'ACTIVA');
      this.alertasSignal.set(alertasActivas);
      NotifyX.success('Alertas limpias');
    }
  }

  /**
   * Reconecta el WebSocket
   */
  public reconectarWebSocket(): void {
    this.servicioWebSocketAlertas.reconectar();
    NotifyX.info('Intentando reconectar...');
    setTimeout(() => {
      this.webSocketConectado.set(this.servicioWebSocketAlertas.conectadoWebSocket());
      this.cargarAlertasIniciales();
    }, 2000);
  }

  ngOnDestroy(): void {
    this.servicioWebSocketAlertas.desconectar();
  }
}
