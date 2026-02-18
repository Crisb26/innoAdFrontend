import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, interval, switchMap } from 'rxjs/operators';
import { PublicacionServicio, Publicacion } from '../../../core/servicios/publicacion.servicio';

@Component({
  selector: 'app-feed-publico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feed-container">
      <!-- Header -->
      <header class="feed-header">
        <h1>[]� InnoAd - Publicidad en Vivo</h1>
        <p class="subtitulo">Descubre las mejores marcas en las principales ubicaciones</p>
      </header>

      <!-- Feed principal -->
      <div class="feed-main">
        <!-- Publicación destacada -->
        <div *ngIf="publicacionActual" class="publicacion-destacada">
          <div class="media-container">
            <img *ngIf="publicacionActual.contenido.tipo === 'IMAGEN'"
                 [src]="publicacionActual.contenido.url"
                 [alt]="publicacionActual.titulo"
                 class="media">
            <video *ngIf="publicacionActual.contenido.tipo === 'VIDEO'"
                   [src]="publicacionActual.contenido.url"
                   autoplay
                   loop
                   class="media"
                   (error)="$event.target.style.display = 'none'">
            </video>
          </div>

          <!-- Info de la publicación -->
          <div class="publicacion-info">
            <div class="info-cliente">
              <h2>{{ publicacionActual.usuarioNombre }}</h2>
              <p class="ubicacion">[]� {{ ubicacionActual }}</p>
            </div>

            <div class="info-publicacion">
              <h3>{{ publicacionActual.titulo }}</h3>
              <p>{{ publicacionActual.descripcion }}</p>
            </div>

            <div class="info-rotacion">
              <small>Siguiente publicación en: <strong>{{ tiempoRestante }}s</strong></small>
              <div class="progress-bar">
                <div class="progress" [style.width.%]="porcentajeProgreso"></div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <button class="btn-explorar" (click)="navegarRegistro()">
            ¿Quieres Anunciar Aquí? → Registrate
          </button>
        </div>

        <!-- Sin publicaciones -->
        <div *ngIf="!publicacionActual" class="sin-publicaciones-feed">
          <div class="contenido-vacio">
            <h2>[]� Pantallas Disponibles</h2>
            <p>Las publicaciones aparecerán aquí en vivo</p>
            <button class="btn-anunciar" (click)="navegarRegistro()">
              Comienza a Anunciar
            </button>
          </div>
        </div>
      </div>

      <!-- Grid de miniaturas de próximas publicaciones -->
      <div class="publicaciones-proximas">
        <h2>Próximas Publicaciones</h2>
        <div class="grid-miniaturas">
          <div *ngFor="let pub of publicacionesProximas; let i = index" 
               class="miniatura"
               [class.activa]="i === 0">
            <img [src]="pub.contenido.url" 
                 [alt]="pub.titulo"
                 (error)="$event.target.src = '/assets/imagenes/placeholder.jpg'">
            <div class="miniatura-info">
              <p class="titulo">{{ pub.titulo | slice:0:20 }}...</p>
              <p class="cliente">{{ pub.usuarioNombre }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de información -->
      <section class="info-section">
        <div class="info-card">
          <h3>[]� ¿Qué es InnoAd?</h3>
          <p>
            Plataforma de publicidad digital en centros comerciales y ubicaciones estratégicas.
            Alcanza a miles de clientes en tiempo real.
          </p>
        </div>

        <div class="info-card">
          <h3>[]� Comienza Hoy</h3>
          <p>
            Registra tu marca y comienza a transmitir tus publicidades en las mejores pantallas
            de tu ciudad.
          </p>
          <button class="btn-info" (click)="navegarRegistro()">Registrarse</button>
        </div>

        <div class="info-card">
          <h3>[]� Métricas en Tiempo Real</h3>
          <p>
            Visualiza el desempeño de tus publicidades con estadísticas detalladas de
            reproducción y engagement.
          </p>
        </div>
      </section>

      <!-- Ubicaciones disponibles -->
      <section class="ubicaciones-section">
        <h2>[]� Ubicaciones Disponibles</h2>
        <div class="ubicaciones-grid">
          <div *ngFor="let ub of ubicacionesDisponibles" class="ubicacion-card">
            <h4>{{ ub.ciudad }}</h4>
            <p class="lugares">{{ ub.cantidadLugares }} lugares</p>
            <ul class="lista-lugares">
              <li *ngFor="let lugar of ub.lugares | slice:0:3">{{ lugar }}</li>
              <li *ngIf="ub.lugares.length > 3" class="mas">+{{ ub.lugares.length - 3 }} más</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="feed-footer">
        <p>© 2024 InnoAd. Publicidad Inteligente para tu Negocio</p>
        <div class="footer-links">
          <a href="#" (click)="navegarRegistro()">Registrarse</a>
          <a href="#">Contacto</a>
          <a href="#">Sobre Nosotros</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .feed-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
      color: white;
    }

    .feed-header {
      padding: 3rem 2rem;
      text-align: center;
      background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .feed-header h1 {
      margin: 0;
      font-size: 2.5rem;
      color: #fff;
    }

    .subtitulo {
      margin: 0.5rem 0 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
    }

    .feed-main {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto 2rem;
    }

    .publicacion-destacada {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.5s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .media-container {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 */
      background: #000;
      overflow: hidden;
    }

    .media {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .publicacion-info {
      padding: 2rem;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
    }

    .info-cliente {
      margin-bottom: 1.5rem;
    }

    .info-cliente h2 {
      margin: 0;
      font-size: 1.8rem;
      color: #fff;
    }

    .ubicacion {
      margin: 0.5rem 0 0 0;
      color: #4dabf7;
      font-size: 1rem;
    }

    .info-publicacion {
      margin-bottom: 2rem;
    }

    .info-publicacion h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.3rem;
    }

    .info-publicacion p {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
    }

    .info-rotacion {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin-top: 0.5rem;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background: linear-gradient(90deg, #4dabf7, #00ffff);
      border-radius: 2px;
      transition: width 1s linear;
    }

    .btn-explorar {
      display: block;
      width: calc(100% - 2rem);
      margin: 0 1rem 1rem 1rem;
      padding: 1rem;
      background: linear-gradient(135deg, #4dabf7, #00ffff);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-explorar:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(77, 171, 247, 0.4);
    }

    .sin-publicaciones-feed {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      text-align: center;
    }

    .contenido-vacio {
      padding: 3rem;
    }

    .contenido-vacio h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .contenido-vacio p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2rem;
    }

    .btn-anunciar {
      padding: 1rem 2rem;
      background: #51cf66;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-anunciar:hover {
      background: #37b24d;
      transform: translateY(-2px);
    }

    .publicaciones-proximas {
      max-width: 1000px;
      margin: 0 auto 3rem;
      padding: 0 2rem;
    }

    .publicaciones-proximas h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
    }

    .grid-miniaturas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .miniatura {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      opacity: 0.7;
    }

    .miniatura:hover,
    .miniatura.activa {
      border-color: #4dabf7;
      opacity: 1;
    }

    .miniatura img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      display: block;
    }

    .miniatura-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
      padding: 0.75rem 0.5rem;
      color: white;
      font-size: 0.75rem;
    }

    .miniatura-info .titulo {
      margin: 0;
      font-weight: 600;
    }

    .miniatura-info .cliente {
      margin: 0.25rem 0 0 0;
      opacity: 0.8;
    }

    .info-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 3rem auto;
      padding: 0 2rem;
    }

    .info-card {
      background: rgba(77, 171, 247, 0.1);
      border: 1px solid rgba(77, 171, 247, 0.3);
      border-radius: 8px;
      padding: 2rem;
      transition: all 0.3s ease;
    }

    .info-card:hover {
      background: rgba(77, 171, 247, 0.2);
      transform: translateY(-4px);
    }

    .info-card h3 {
      margin-top: 0;
      color: #4dabf7;
      font-size: 1.2rem;
    }

    .info-card p {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .btn-info {
      padding: 0.75rem 1.5rem;
      background: #4dabf7;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .btn-info:hover {
      background: #1c92e0;
    }

    .ubicaciones-section {
      max-width: 1000px;
      margin: 0 auto 3rem;
      padding: 0 2rem;
    }

    .ubicaciones-section h2 {
      margin-top: 0;
      margin-bottom: 2rem;
    }

    .ubicaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .ubicacion-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .ubicacion-card:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-4px);
    }

    .ubicacion-card h4 {
      margin: 0 0 0.5rem 0;
      color: #4dabf7;
      font-size: 1.1rem;
    }

    .lugares {
      margin: 0 0 1rem 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    .lista-lugares {
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .lista-lugares li {
      padding: 0.25rem 0;
    }

    .lista-lugares .mas {
      color: #4dabf7;
      font-weight: 600;
    }

    .feed-footer {
      text-align: center;
      padding: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
    }

    .feed-footer p {
      margin: 0 0 1rem 0;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .footer-links a {
      color: #4dabf7;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: #00ffff;
    }
  `]
})
export class FeedPublicoComponent implements OnInit, OnDestroy {
  publicacionActual: Publicacion | null = null;
  publicacionesProximas: Publicacion[] = [];
  ubicacionesDisponibles: any[] = [];
  tiempoRestante = 30;
  porcentajeProgreso = 100;

  private destroy$ = new Subject<void>();
  private intervaloRotacion: any;

  constructor(
    private publicacionServicio: PublicacionServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPublicacionesPublicadas();
    this.iniciarRotacion();
  }

  ngOnDestroy(): void {
    if (this.intervaloRotacion) {
      clearInterval(this.intervaloRotacion);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPublicacionesPublicadas(): void {
    this.publicacionServicio.obtenerPublicacionesPublicadas()
      .pipe(takeUntil(this.destroy$))
      .subscribe(publicaciones => {
        if (publicaciones.length > 0) {
          this.publicacionActual = publicaciones[0];
          this.publicacionesProximas = publicaciones.slice(1, 5);
          this.ubicacionesDisponibles = this.agruparPorCiudad(publicaciones);
        }
      });
  }

  private agruparPorCiudad(publicaciones: Publicacion[]): any[] {
    const agrupadas: { [key: string]: string[] } = {};

    publicaciones.forEach(pub => {
      pub.ubicaciones.forEach(ub => {
        if (!agrupadas[ub.ciudad]) {
          agrupadas[ub.ciudad] = [];
        }
        if (!agrupadas[ub.ciudad].includes(ub.ubicacion)) {
          agrupadas[ub.ciudad].push(ub.ubicacion);
        }
      });
    });

    return Object.keys(agrupadas).map(ciudad => ({
      ciudad,
      cantidadLugares: agrupadas[ciudad].length,
      lugares: agrupadas[ciudad]
    }));
  }

  get ubicacionActual(): string {
    if (!this.publicacionActual || this.publicacionActual.ubicaciones.length === 0) {
      return '';
    }
    const ub = this.publicacionActual.ubicaciones[0];
    return `${ub.ciudad} - ${ub.ubicacion}`;
  }

  private iniciarRotacion(): void {
    const duracionSegundos = 30;
    let segundosRestantes = duracionSegundos;

    this.intervaloRotacion = setInterval(() => {
      segundosRestantes--;
      this.tiempoRestante = segundosRestantes;
      this.porcentajeProgreso = (segundosRestantes / duracionSegundos) * 100;

      if (segundosRestantes <= 0) {
        this.rotarPublicacion();
        segundosRestantes = duracionSegundos;
      }
    }, 1000);
  }

  private rotarPublicacion(): void {
    if (this.publicacionesProximas.length > 0) {
      const siguiente = this.publicacionesProximas.shift();
      if (siguiente && this.publicacionActual) {
        this.publicacionesProximas.push(this.publicacionActual);
        this.publicacionActual = siguiente;
      }
    }
  }

  navegarRegistro(): void {
    this.router.navigate(['/autenticacion/registro']);
  }
}
