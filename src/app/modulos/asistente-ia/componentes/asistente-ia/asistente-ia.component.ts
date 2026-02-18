import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicioIA } from '../../servicios/servicio-ia.service';
import { ServicioUtilidades } from '../../../../core/servicios/servicio-utilidades.service';
import { AyudaService } from '../../../../core/servicios/ayuda.servicio';

/**
 * Interfaz para las interacciones con la IA
 */
interface InteraccionIA {
  id?: number;
  pregunta: string;
  respuesta?: string;
  tiempoRespuesta?: number;
  idRol: number;
  estado: 'PENDIENTE' | 'RESPONDIDO' | 'ERROR';
  timestamp: number;
  tokensUsados?: number;
  costoPregunta?: number;
}

/**
 * Interfaz para estadísticas de uso
 */
interface EstadisticasIA {
  totalPreguntas: number;
  totalRespuestas: number;
  tiempoPromedioRespuesta: number;
  tokensTotalesUsados: number;
  costoTotal: number;
  modeloActual: string;
  ultimaActualizacion: number;
}

/**
 * Interfaz para configuración de IA disponible
 */
interface ConfiguracionIADisponible {
  id: number;
  nombre: string;
  descripcion: string;
  modelo: string;
  maxTokens: number;
  temperatura: number;
  habilitada: boolean;
}

/**
 * Componente del Asistente IA con respuestas en streaming
 */
@Component({
  selector: 'app-asistente-ia',
  templateUrl: './asistente-ia.component.html',
  styleUrls: ['./asistente-ia.component.scss']
})
export class AsistenteIAComponent implements OnInit, OnDestroy {
  
  // ViewChild para scroll automático
  @ViewChild('contenedorRespuestas') contenedorRespuestas?: ElementRef<HTMLDivElement>;
  
  // Configuración
  idRolUsuario: number = 1; // Se obtiene de la sesión
  configuracionesIA: ConfiguracionIADisponible[] = [];
  configuracionSeleccionada?: ConfiguracionIADisponible;
  
  // Datos del componente
  pregunta: string = '';
  interacciones: InteraccionIA[] = [];
  estadisticas?: EstadisticasIA;
  
  // Estado
  cargando: boolean = false;
  procesandoRespuesta: boolean = false;
  error: string | null = null;
  
  // Historial y búsqueda
  mostrarHistorial: boolean = false;
  busquedaHistorial: string = '';
  
  // Para destruir suscripciones
  private destruir$ = new Subject<void>();
  
  constructor(
    private servicioIA: ServicioIA,
    private servicioUtilidades: ServicioUtilidades
  ) {}

  private readonly ayuda = inject(AyudaService);
  
  /**
   * Método para comparar objetos en selects de Angular
   */
  compareFn(obj1: any, obj2: any): boolean {
    return this.servicioUtilidades.compararPorId(obj1, obj2);
  }
  
  ngOnInit(): void {
    // Obtener el rol del usuario desde la sesión
    this.idRolUsuario = parseInt(sessionStorage.getItem('idRol') || '1', 10);
    
    // Cargar configuraciones disponibles
    this.cargarConfiguracionesIA();
    
    // Cargar historial de interacciones
    this.cargarHistorial();
    
    // Cargar estadísticas
    this.cargarEstadisticas();

    // Mostrar tour introductorio del asistente IA
    setTimeout(() => {
      this.ayuda.startTourOnce('asistente_ia', [
        { element: '.titulo-asistente h2', intro: 'Este es tu asistente IA — formula preguntas y recibe respuestas.' , position: 'bottom' },
        { element: '.selector-configuracion select', intro: 'Selecciona el modelo y la configuración de IA.', position: 'left' },
        { element: '.campo-pregunta', intro: 'Escribe tu pregunta aquí y presiona Ctrl+Enter para enviar.', position: 'top' },
        { element: '.btn-enviar-normal', intro: 'Envía la pregunta y recibe la respuesta completa.', position: 'left' },
        { element: '.btn-enviar-streaming', intro: 'Envía usando streaming para ver la respuesta en tiempo real.', position: 'left' }
      ], { showProgress: true });
    }, 500);
  }
  
  /**
   * Carga las configuraciones de IA disponibles
   */
  private cargarConfiguracionesIA(): void {
    this.cargando = true;
    
    this.servicioIA.obtenerConfiguracionesIA()
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (configuraciones: ConfiguracionIADisponible[]) => {
          this.configuracionesIA = configuraciones.filter(config => config.habilitada);
          
          // Seleccionar la primera habilitada por defecto
          if (this.configuracionesIA.length > 0) {
            this.configuracionSeleccionada = this.configuracionesIA[0];
          }
          
          this.cargando = false;
        },
        (error: any) => {
          console.error('Error cargando configuraciones IA:', error);
          this.error = 'Error cargando configuraciones de IA';
          this.cargando = false;
        }
      );
  }
  
  /**
   * Carga el historial de interacciones
   */
  private cargarHistorial(): void {
    this.servicioIA.obtenerHistorial(this.idRolUsuario, 0, 50)
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (respuesta: any) => {
          // Convertir respuesta del servidor a formato local
          this.interacciones = respuesta.content.map((item: any) => ({
            id: item.id,
            pregunta: item.pregunta,
            respuesta: item.respuesta,
            tiempoRespuesta: item.tiempoRespuesta,
            idRol: item.idRol,
            estado: 'RESPONDIDO',
            timestamp: new Date(item.fechaCreacion).getTime(),
            tokensUsados: item.tokensUsados,
            costoPregunta: item.costoPregunta
          }));
          
          this.desplazarAlFinal();
        },
        (error: any) => {
          console.error('Error cargando historial:', error);
          // No mostrar error al usuario, solo en consola
        }
      );
  }
  
  /**
   * Carga las estadísticas de uso
   */
  private cargarEstadisticas(): void {
    this.servicioIA.obtenerEstadisticas(this.idRolUsuario)
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (estadisticas: EstadisticasIA) => {
          this.estadisticas = estadisticas;
        },
        (error: any) => {
          console.error('Error cargando estadísticas:', error);
          // Crear estadísticas vacías por defecto
          this.estadisticas = {
            totalPreguntas: 0,
            totalRespuestas: 0,
            tiempoPromedioRespuesta: 0,
            tokensTotalesUsados: 0,
            costoTotal: 0,
            modeloActual: 'GPT-4',
            ultimaActualizacion: Date.now()
          };
        }
      );
  }
  
  /**
   * Envía una pregunta a la IA y recibe respuesta en streaming
   */
  enviarPregunta(): void {
    if (!this.pregunta.trim() || this.procesandoRespuesta) {
      return;
    }
    
    // Crear interacción local
    const nuevaInteraccion: InteraccionIA = {
      pregunta: this.pregunta,
      respuesta: '',
      estado: 'PENDIENTE',
      timestamp: Date.now(),
      idRol: this.idRolUsuario,
      tiempoRespuesta: 0
    };
    
    // Agregar a la lista
    this.interacciones.push(nuevaInteraccion);
    
    // Limpiar entrada
    const preguntaTexto = this.pregunta;
    this.pregunta = '';
    
    // Marcar como procesando
    this.procesandoRespuesta = true;
    this.error = null;
    
    // Enviar al servicio
    const tiempoInicio = Date.now();
    
    this.servicioIA.hacerPregunta(
      preguntaTexto,
      this.configuracionSeleccionada?.id || 1,
      this.idRolUsuario
    )
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (respuesta: any) => {
          const tiempoFinal = Date.now();
          
          // Actualizar última interacción con respuesta
          if (this.interacciones.length > 0) {
            const ultimaInteraccion = this.interacciones[this.interacciones.length - 1];
            ultimaInteraccion.respuesta = respuesta.respuesta;
            ultimaInteraccion.estado = 'RESPONDIDO';
            ultimaInteraccion.tiempoRespuesta = tiempoFinal - tiempoInicio;
            ultimaInteraccion.tokensUsados = respuesta.tokensUsados;
            ultimaInteraccion.costoPregunta = respuesta.costo;
            ultimaInteraccion.id = respuesta.id;
          }
          
          // Actualizar estadísticas
          if (this.estadisticas) {
            this.estadisticas.totalPreguntas++;
            this.estadisticas.totalRespuestas++;
            this.estadisticas.tokensTotalesUsados += respuesta.tokensUsados || 0;
            this.estadisticas.costoTotal += respuesta.costo || 0;
            this.estadisticas.ultimaActualizacion = Date.now();
          }
          
          this.procesandoRespuesta = false;
          this.desplazarAlFinal();
        },
        (error: any) => {
          console.error('Error al enviar pregunta:', error);
          this.error = error.message || 'Error procesando la pregunta';
          
          // Marcar como error
          if (this.interacciones.length > 0) {
            const ultimaInteraccion = this.interacciones[this.interacciones.length - 1];
            ultimaInteraccion.estado = 'ERROR';
            ultimaInteraccion.respuesta = 'Error: ' + this.error;
          }
          
          this.procesandoRespuesta = false;
        }
      );
  }
  
  /**
   * Envía una pregunta con streaming (respuesta en tiempo real)
   */
  enviarPreguntaConStreaming(): void {
    if (!this.pregunta.trim() || this.procesandoRespuesta) {
      return;
    }
    
    // Crear interacción local
    const nuevaInteraccion: InteraccionIA = {
      pregunta: this.pregunta,
      respuesta: '',
      estado: 'PENDIENTE',
      timestamp: Date.now(),
      idRol: this.idRolUsuario
    };
    
    // Agregar a la lista
    this.interacciones.push(nuevaInteraccion);
    
    // Limpiar entrada
    const preguntaTexto = this.pregunta;
    this.pregunta = '';
    
    // Marcar como procesando
    this.procesandoRespuesta = true;
    this.error = null;
    
    const tiempoInicio = Date.now();
    const indiceInteraccion = this.interacciones.length - 1;
    
    this.servicioIA.hacerPreguntaConStreaming(
      preguntaTexto,
      this.configuracionSeleccionada?.id || 1,
      this.idRolUsuario
    )
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (evento: any) => {
          if (evento.tipo === 'CHUNK') {
            // Acumular el texto de respuesta
            const interaccion = this.interacciones[indiceInteraccion];
            interaccion.respuesta += evento.contenido;
            interaccion.estado = 'RESPONDIDO';
            this.desplazarAlFinal();
            
          } else if (evento.tipo === 'COMPLETO') {
            // Respuesta completada
            const tiempoFinal = Date.now();
            const interaccion = this.interacciones[indiceInteraccion];
            interaccion.tiempoRespuesta = tiempoFinal - tiempoInicio;
            interaccion.tokensUsados = evento.tokensUsados;
            interaccion.costoPregunta = evento.costo;
            interaccion.id = evento.id;
            
            // Actualizar estadísticas
            if (this.estadisticas) {
              this.estadisticas.totalPreguntas++;
              this.estadisticas.totalRespuestas++;
              this.estadisticas.tokensTotalesUsados += evento.tokensUsados || 0;
              this.estadisticas.costoTotal += evento.costo || 0;
              this.estadisticas.ultimaActualizacion = Date.now();
            }
            
            this.procesandoRespuesta = false;
            
          } else if (evento.tipo === 'ERROR') {
            // Error durante streaming
            this.error = evento.mensaje;
            const interaccion = this.interacciones[indiceInteraccion];
            interaccion.estado = 'ERROR';
            interaccion.respuesta = 'Error: ' + this.error;
            this.procesandoRespuesta = false;
          }
        }
      );
  }
  
  /**
   * Obtiene las interacciones filtradas por búsqueda
   */
  get interaccionesFiltradas(): InteraccionIA[] {
    if (!this.busquedaHistorial.trim()) {
      return this.interacciones;
    }
    
    const busqueda = this.busquedaHistorial.toLowerCase();
    return this.interacciones.filter(
      interaccion =>
        interaccion.pregunta.toLowerCase().includes(busqueda) ||
        (interaccion.respuesta && interaccion.respuesta.toLowerCase().includes(busqueda))
    );
  }
  
  /**
   * Reutiliza una pregunta anterior y la envía nuevamente
   */
  reutilizarPregunta(pregunta: string): void {
    this.pregunta = pregunta;
    this.mostrarHistorial = false;
    
    // Notificar al usuario
    NotifyX.default.info('🔄 Pregunta cargada', {
      timeout: 2000,
      position: 'bottom-right'
    });
    
    // Hacer scroll al input
    setTimeout(() => {
      const input = document.querySelector('.campo-busqueda') as HTMLInputElement;
      input?.focus();
      input?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
  
  /**
   * Copia una respuesta al portapapeles con feedback visual
   */
  copiarRespuesta(texto: string, event?: Event): void {
    const boton = (event?.currentTarget as HTMLButtonElement);
    
    navigator.clipboard.writeText(texto).then(
      () => {
        // Feedback visual
        if (boton) {
          boton.classList.add('copiado');
          
          // Cambiar texto del botón temporalmente
          const textoOriginal = boton.innerHTML;
          boton.innerHTML = '✓ ¡Copiado!';
          
          setTimeout(() => {
            boton.classList.remove('copiado');
            boton.innerHTML = textoOriginal;
          }, 1500);
        }
        
        // Notificación
        NotifyX.default.success('✓ Copiado al portapapeles', {
          timeout: 2000,
          position: 'bottom-right'
        });
        
        console.log('✓ Texto copiado al portapapeles exitosamente');
      },
      (error) => {
        console.error('✗ Error al copiar:', error);
        NotifyX.default.error('✗ Error al copiar', {
          timeout: 2000,
          position: 'bottom-right'
        });
      }
    );
  }
  
  /**
   * Descarga el historial como JSON
   */
  descargarHistorial(): void {
    const datos = {
      fechaDescarga: new Date().toISOString(),
      totalInteracciones: this.interacciones.length,
      estadisticas: this.estadisticas,
      interacciones: this.interacciones
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `historial-ia-${Date.now()}.json`;
    enlace.click();
    window.URL.revokeObjectURL(url);
  }
  
  /**
   * Limpia el historial
   */
  limpiarHistorial(): void {
    if (confirm('¿Estás seguro de que deseas limpiar el historial? Esta acción no se puede deshacer.')) {
      this.servicioIA.limpiarHistorial(this.idRolUsuario)
        .pipe(takeUntil(this.destruir$))
        .subscribe(
          () => {
            this.interacciones = [];
            this.error = null;
          },
          (error: any) => {
            console.error('Error al limpiar historial:', error);
            this.error = 'Error al limpiar el historial';
          }
        );
    }
  }
  
  /**
   * Desplaza el contenedor al final
   */
  private desplazarAlFinal(): void {
    setTimeout(() => {
      if (this.contenedorRespuestas) {
        this.contenedorRespuestas.nativeElement.scrollTop = 
          this.contenedorRespuestas.nativeElement.scrollHeight;
      }
    }, 0);
  }
  
  /**
   * Formatea un timestamp a fecha legible
   */
  formatearFecha(timestamp: number): string {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    
    if (fecha.toDateString() === ahora.toDateString()) {
      return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }
    
    return fecha.toLocaleDateString('es-CO');
  }
  
  /**
   * Calcula el tiempo promedio de respuesta en segundos
   */
  get tiempoPromedioFormato(): string {
    if (!this.estadisticas || this.estadisticas.tiempoPromedioRespuesta === 0) {
      return '0s';
    }
    
    if (this.estadisticas.tiempoPromedioRespuesta < 1000) {
      return Math.round(this.estadisticas.tiempoPromedioRespuesta) + 'ms';
    }
    
    return (this.estadisticas.tiempoPromedioRespuesta / 1000).toFixed(1) + 's';
  }
  
  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }
}
