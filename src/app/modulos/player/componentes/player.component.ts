import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';

interface Contenido {
  id: string;
  titulo: string;
  tipo: 'imagen' | 'video' | 'texto' | 'html';
  url: string;
  duracion: number;
  orden: number;
  configuracion: {
    efectoTransicion?: 'fade' | 'slide' | 'zoom' | 'none';
    repetir?: boolean;
  };
}

/**
 * Componente Player para Raspberry Pi
 *
 * Este componente reproduce contenido en pantalla completa
 * y se sincroniza automáticamente con el servidor
 */
@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./player.component.scss'],
  template: `
    <div class="player-container" [class.fullscreen]="!modoPrueba()">
      <!-- Indicador de Estado -->
      <div class="estado-conexion" [class.visible]="mostrarEstado()">
        <div class="punto-estado" [class.conectado]="conectado()" [class.error]="error()"></div>
        <span>{{ estadoTexto() }}</span>
      </div>

      <!-- Contenido Principal -->
      <div class="contenido-actual" [class.fade-in]="animacionActiva()">
        @if (contenidoActual()) {
          @switch (contenidoActual()?.tipo) {
            @case ('imagen') {
              <img
                [src]="contenidoActual()!.url"
                [alt]="contenidoActual()!.titulo"
                class="media-contenido imagen-contenido"
                (error)="onErrorCarga()"
              />
            }
            @case ('video') {
              <video
                [src]="contenidoActual()!.url"
                class="media-contenido video-contenido"
                autoplay
                [muted]="true"
                (ended)="siguienteContenido()"
                (error)="onErrorCarga()"
              ></video>
            }
            @case ('texto') {
              <div class="texto-contenido">
                <h1>{{ contenidoActual()!.titulo }}</h1>
                <p>{{ contenidoActual()!.url }}</p>
              </div>
            }
            @case ('html') {
              <iframe
                [src]="sanitizarUrl(contenidoActual()!.url)"
                class="html-contenido"
                frameborder="0"
                (error)="onErrorCarga()"
              ></iframe>
            }
          }

          <!-- Información del Contenido (Solo en modo prueba) -->
          @if (modoPrueba()) {
            <div class="info-contenido">
              <h3>{{ contenidoActual()!.titulo }}</h3>
              <p>Tipo: {{ contenidoActual()!.tipo }} | Duración: {{ contenidoActual()!.duracion }}s</p>
              <p>{{ indiceActual() + 1 }} de {{ playlist().length }}</p>
            </div>
          }
        } @else {
          <!-- Pantalla de Espera -->
          <div class="pantalla-espera">
            <div class="logo-innoad">
              <h1>InnoAd</h1>
              <p>Sistema de Publicidad Digital</p>
            </div>
            @if (cargando()) {
              <div class="loader-grande"></div>
              <p>Cargando contenido...</p>
            } @else {
              <p>No hay contenido para mostrar</p>
              <p class="texto-small">Asigna contenido a esta pantalla desde el panel de control</p>
            }
          </div>
        }
      </div>

      <!-- Controles (Solo en modo prueba) -->
      @if (modoPrueba()) {
        <div class="controles-player">
          <button class="btn-control" (click)="anteriorContenido()">◀ Anterior</button>
          <button class="btn-control" (click)="pausarReproduccion()">
            {{ pausado() ? '▶ Play' : '⏸ Pausa' }}
          </button>
          <button class="btn-control" (click)="siguienteContenido()">Siguiente ▶</button>
          <button class="btn-control" (click)="recargarPlaylist()">Recargar</button>
        </div>
      }

      <!-- Información del Dispositivo (Solo modo prueba) -->
      @if (modoPrueba()) {
        <div class="info-dispositivo">
          <p><strong>Código Pantalla:</strong> {{ codigoPantalla() }}</p>
          <p><strong>Última Actualización:</strong> {{ ultimaActualizacion() }}</p>
          <p><strong>Contenidos en Playlist:</strong> {{ playlist().length }}</p>
        </div>
      }
    </div>
  `
})
export class PlayerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  // Signals para el estado
  protected readonly conectado = signal(false);
  protected readonly error = signal(false);
  protected readonly cargando = signal(true);
  protected readonly pausado = signal(false);
  protected readonly mostrarEstado = signal(true);
  protected readonly modoPrueba = signal(false);
  protected readonly estadoTexto = signal('Conectando...');
  protected readonly animacionActiva = signal(false);

  // Datos
  protected readonly codigoPantalla = signal('');
  protected readonly playlist = signal<Contenido[]>([]);
  protected readonly contenidoActual = signal<Contenido | null>(null);
  protected readonly indiceActual = signal(0);
  protected readonly ultimaActualizacion = signal('');

  private subscripciones: Subscription[] = [];
  private temporizadorContenido?: any;
  private temporizadorSincronizacion?: any;

  ngOnInit(): void {
    // Obtener código de pantalla de la URL
    this.route.queryParams.subscribe(params => {
      const codigo = params['codigo'];
      const token = params['token'];
      const prueba = params['prueba'];

      this.codigoPantalla.set(codigo || 'SIN-CODIGO');
      this.modoPrueba.set(prueba === 'true');

      if (codigo && token) {
        this.inicializarPlayer(codigo, token);
      } else if (prueba) {
        this.cargarPlaylistPrueba();
      } else {
        this.error.set(true);
        this.estadoTexto.set('Error: Código o token no válido');
        this.cargando.set(false);
      }
    });

    // Ocultar estado después de 5 segundos
    setTimeout(() => {
      if (!this.modoPrueba()) {
        this.mostrarEstado.set(false);
      }
    }, 5000);

    // Prevenir que la pantalla se apague
    this.prevenirSuspension();
  }

  ngOnDestroy(): void {
    this.subscripciones.forEach(sub => sub.unsubscribe());
    if (this.temporizadorContenido) {
      clearTimeout(this.temporizadorContenido);
    }
    if (this.temporizadorSincronizacion) {
      clearInterval(this.temporizadorSincronizacion);
    }
  }

  private async inicializarPlayer(codigo: string, token: string): Promise<void> {
    try {
      // Aquí harías la autenticación con el backend
      // const respuesta = await fetch(`/api/v1/dispositivos/autenticar`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ codigo, tokenDispositivo: token })
      // });

      // Simulación
      setTimeout(() => {
        this.conectado.set(true);
        this.estadoTexto.set('Conectado');
        this.cargarPlaylist();
        this.iniciarSincronizacionAutomatica();
      }, 1000);

    } catch (error) {
      this.error.set(true);
      this.estadoTexto.set('Error de conexión');
      this.cargando.set(false);
    }
  }

  private async cargarPlaylist(): Promise<void> {
    try {
      // Aquí obtendrías la playlist del backend
      // const respuesta = await fetch(`/api/v1/dispositivos/playlist`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      // Simulación con datos de prueba
      this.cargarPlaylistPrueba();

    } catch (error) {
      console.error('Error al cargar playlist:', error);
      this.cargando.set(false);
    }
  }

  private cargarPlaylistPrueba(): void {
    const playlistPrueba: Contenido[] = [
      {
        id: '1',
        titulo: 'Promoción de Verano',
        tipo: 'imagen',
        url: 'https://via.placeholder.com/1920x1080/00d9ff/ffffff?text=Promoción+de+Verano',
        duracion: 10,
        orden: 1,
        configuracion: { efectoTransicion: 'fade' }
      },
      {
        id: '2',
        titulo: 'Video Institucional',
        tipo: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duracion: 20,
        orden: 2,
        configuracion: { efectoTransicion: 'fade' }
      },
      {
        id: '3',
        titulo: 'Bienvenidos',
        tipo: 'texto',
        url: 'Bienvenidos a InnoAd - La mejor plataforma de publicidad digital',
        duracion: 8,
        orden: 3,
        configuracion: { efectoTransicion: 'fade' }
      }
    ];

    this.playlist.set(playlistPrueba);
    this.cargando.set(false);
    this.ultimaActualizacion.set(new Date().toLocaleString());

    if (playlistPrueba.length > 0) {
      this.reproducirContenido(0);
    }
  }

  private reproducirContenido(indice: number): void {
    if (this.pausado()) return;

    const contenido = this.playlist()[indice];
    if (!contenido) return;

    this.indiceActual.set(indice);
    this.animacionActiva.set(true);
    this.contenidoActual.set(contenido);

    // Reportar reproducción al servidor
    this.reportarReproduccion(contenido.id);

    // Para videos, la duración la maneja el evento 'ended'
    if (contenido.tipo !== 'video') {
      this.temporizadorContenido = setTimeout(() => {
        this.siguienteContenido();
      }, contenido.duracion * 1000);
    }
  }

  protected siguienteContenido(): void {
    const siguienteIndice = (this.indiceActual() + 1) % this.playlist().length;
    this.reproducirContenido(siguienteIndice);
  }

  protected anteriorContenido(): void {
    const playlist = this.playlist();
    const anteriorIndice = this.indiceActual() === 0 ? playlist.length - 1 : this.indiceActual() - 1;
    if (this.temporizadorContenido) {
      clearTimeout(this.temporizadorContenido);
    }
    this.reproducirContenido(anteriorIndice);
  }

  protected pausarReproduccion(): void {
    this.pausado.set(!this.pausado());

    if (this.pausado()) {
      if (this.temporizadorContenido) {
        clearTimeout(this.temporizadorContenido);
      }
    } else {
      const contenido = this.contenidoActual();
      if (contenido && contenido.tipo !== 'video') {
        this.temporizadorContenido = setTimeout(() => {
          this.siguienteContenido();
        }, contenido.duracion * 1000);
      }
    }
  }

  protected recargarPlaylist(): void {
    this.cargando.set(true);
    this.cargarPlaylist();
  }

  protected onErrorCarga(): void {
    console.error('Error al cargar el contenido');
    this.siguienteContenido();
  }

  protected sanitizarUrl(url: string): any {
    // En producción, usar DomSanitizer de Angular
    return url;
  }

  private reportarReproduccion(contenidoId: string): void {
    // Aquí enviarías al backend la información de reproducción
    // fetch('/api/v1/dispositivos/reproduccion', {
    //   method: 'POST',
    //   body: JSON.stringify({ contenidoId, fechaInicio: new Date() })
    // });
    console.log('Reproduciendo:', contenidoId);
  }

  private iniciarSincronizacionAutomatica(): void {
    // Sincronizar con el servidor cada 5 minutos
    this.temporizadorSincronizacion = setInterval(() => {
      this.cargarPlaylist();
      this.reportarEstadoDispositivo();
    }, 5 * 60 * 1000);
  }

  private reportarEstadoDispositivo(): void {
    // Aquí reportarías el estado del dispositivo al servidor
    // fetch('/api/v1/dispositivos/estado', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     estado: 'conectada',
    //     contenidoActual: this.contenidoActual()?.id
    //   })
    // });
  }

  private prevenirSuspension(): void {
    // Prevenir que la pantalla se apague
    if ('wakeLock' in navigator) {
      // @ts-ignore
      navigator.wakeLock.request('screen').catch((err: any) => {
        console.warn('No se pudo activar Wake Lock:', err);
      });
    }
  }
}

