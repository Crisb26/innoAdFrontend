import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicacionServicio } from '../../../core/servicios/publicacion.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

interface PublicacionCard {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'PUBLICADO' | 'FINALIZADO';
  ubicaciones: number;
  costoTotal: number;
  fechaCreacion: string;
  progreso: number; // 0-100
}

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="usuario-dashboard-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1>👤 Panel de Usuario</h1>
          <p class="subtitulo">Gestiona tus publicidades y seguimiento</p>
        </div>
        <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
      </header>

      <!-- Navegación rápida -->
      <nav class="quick-nav">
        <a routerLink="/publicacion/seleccionar-ubicaciones" class="nav-link activo">
          <span class="icono">✨</span>
          <span>Crear Publicidad</span>
        </a>
        <a routerLink="/usuario/mis-publicidades" class="nav-link">
          <span class="icono">📋</span>
          <span>Mis Publicidades</span>
        </a>
        <a routerLink="/usuario/estadisticas" class="nav-link">
          <span class="icono">📊</span>
          <span>Estadísticas</span>
        </a>
        <a routerLink="/usuario/facturacion" class="nav-link">
          <span class="icono">💳</span>
          <span>Facturación</span>
        </a>
      </nav>

      <!-- Contenido principal -->
      <main class="contenido-principal">
        <!-- Tarjetas de acción rápida -->
        <section class="seccion-acciones">
          <h2>🚀 Acciones Rápidas</h2>
          <div class="acciones-grid">
            <!-- Crear nueva publicidad -->
            <div class="accion-card crear">
              <div class="card-header">
                <span class="icono-grande">➕</span>
              </div>
              <h3>Crear Nueva Publicidad</h3>
              <p>Lanza una nueva campaña para tus productos o servicios</p>
              <button class="btn-action" (click)="irACrearPublicidad()">
                Comenzar
              </button>
            </div>

            <!-- Ver mis publicidades -->
            <div class="accion-card mis-publicidades">
              <div class="card-header">
                <span class="icono-grande">📺</span>
              </div>
              <h3>Mis Publicidades</h3>
              <p class="cantidad">{{ publicidades.length }} publicidades</p>
              <p>Revisa el estado de todas tus campañas</p>
              <button class="btn-action" (click)="irAMisPublicidades()">
                Ver
              </button>
            </div>

            <!-- Estadísticas -->
            <div class="accion-card estadisticas">
              <div class="card-header">
                <span class="icono-grande">📈</span>
              </div>
              <h3>Estadísticas</h3>
              <p>Analiza el desempeño de tus publicidades</p>
              <button class="btn-action" (click)="irAEstadisticas()">
                Analizar
              </button>
            </div>

            <!-- Facturación -->
            <div class="accion-card facturacion">
              <div class="card-header">
                <span class="icono-grande">💰</span>
              </div>
              <h3>Facturación</h3>
              <p class="monto">Saldo a pagar: ${{ saldoPendiente | number:'1.2' }}</p>
              <button class="btn-action" (click)="irAFacturacion()">
                Ver Facturas
              </button>
            </div>
          </div>
        </section>

        <!-- Publicidades recientes -->
        <section class="seccion-recientes">
          <div class="section-header">
            <h2>📰 Publicidades Recientes</h2>
            <a routerLink="/usuario/mis-publicidades" class="link-ver-todas">
              Ver todas →
            </a>
          </div>

          <div *ngIf="publicidades.length === 0" class="sin-publicidades">
            <div class="empty-state">
              <span class="empty-icono">📭</span>
              <h3>Aún no tienes publicidades</h3>
              <p>Crea tu primera publicidad para comenzar</p>
              <button class="btn-crear-primera" (click)="irACrearPublicidad()">
                ✨ Crear primera publicidad
              </button>
            </div>
          </div>

          <div *ngIf="publicidades.length > 0" class="publicidades-list">
            <div *ngFor="let pub of publicidades | slice:0:3" 
                 class="publicidad-item"
                 [class.pendiente]="pub.estado === 'PENDIENTE'"
                 [class.aprobado]="pub.estado === 'APROBADO'"
                 [class.rechazado]="pub.estado === 'RECHAZADO'"
                 [class.publicado]="pub.estado === 'PUBLICADO'"
                 [class.finalizado]="pub.estado === 'FINALIZADO'">
              
              <div class="pub-header">
                <div class="pub-info">
                  <h4>{{ pub.titulo }}</h4>
                  <p class="pub-descripcion">{{ pub.descripcion | slice:0:80 }}...</p>
                </div>
                <span class="badge" [ngClass]="'badge-' + pub.estado.toLowerCase()">
                  {{ getEstadoLabel(pub.estado) }}
                </span>
              </div>

              <div class="pub-detalles">
                <span class="detalle">
                  📍 {{ pub.ubicaciones }} ubicación(es)
                </span>
                <span class="detalle">
                  💰 ${{ pub.costoTotal | number:'1.2' }}
                </span>
                <span class="detalle">
                  📅 {{ pub.fechaCreacion | date:'short' }}
                </span>
              </div>

              <div class="pub-progreso">
                <div class="barra-progreso">
                  <div class="progreso-interior" [style.width.%]="pub.progreso"></div>
                </div>
                <span class="porcentaje">{{ pub.progreso }}% completado</span>
              </div>

              <button class="btn-ver-detalles" (click)="verDetalles(pub.id)">
                Ver detalles →
              </button>
            </div>
          </div>
        </section>

        <!-- Resumen de actividad -->
        <section class="seccion-actividad">
          <h2>📊 Resumen de Actividad</h2>
          <div class="actividad-grid">
            <div class="card-actividad">
              <h3>Total Publicidades</h3>
              <p class="numero">{{ publicidades.length }}</p>
            </div>
            <div class="card-actividad">
              <h3>En Revisión</h3>
              <p class="numero">{{ contar('PENDIENTE') }}</p>
            </div>
            <div class="card-actividad">
              <h3>Publicadas</h3>
              <p class="numero">{{ contar('PUBLICADO') }}</p>
            </div>
            <div class="card-actividad">
              <h3>Costo Total</h3>
              <p class="numero">${{ calcularCostoTotal() | number:'1.2' }}</p>
            </div>
          </div>
        </section>

        <!-- Información útil -->
        <section class="seccion-info">
          <h2>💡 Información Útil</h2>
          <div class="info-grid">
            <div class="info-card">
              <h3>¿Cómo crear una publicidad?</h3>
              <ol>
                <li>Haz clic en "Crear Nueva Publicidad"</li>
                <li>Completa los datos de tu campaña</li>
                <li>Selecciona las ubicaciones donde se transmitirá</li>
                <li>Sube tu contenido (video o imagen)</li>
                <li>Envía para aprobación</li>
              </ol>
            </div>
            <div class="info-card">
              <h3>Proceso de Aprobación</h3>
              <p>Todas las publicidades son revisadas por nuestro equipo técnico en un máximo de 24 horas.</p>
              <p><strong>Criterios:</strong></p>
              <ul>
                <li>✓ Contenido apropiado</li>
                <li>✓ Buena calidad de video/imagen</li>
                <li>✓ Descripción clara</li>
              </ul>
            </div>
            <div class="info-card">
              <h3>Costos</h3>
              <p>El costo se calcula según:</p>
              <ul>
                <li>Número de ubicaciones</li>
                <li>Cantidad de pisos por ubicación</li>
                <li>Duración de la campaña (días)</li>
              </ul>
              <p>Se cobra al momento de aprobación de tu publicidad.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .usuario-dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .header {
      background: linear-gradient(135deg, #1a5490 0%, #0d3a6e 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      margin: 0 0 0.25rem 0;
      font-size: 2rem;
    }

    .subtitulo {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .quick-nav {
      display: flex;
      gap: 0;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .nav-link {
      flex: 1;
      padding: 1.25rem;
      text-decoration: none;
      color: #666;
      font-weight: 600;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;
      text-align: center;
    }

    .nav-link:hover {
      background: #f5f5f5;
      color: #1a5490;
    }

    .nav-link.activo {
      color: #1a5490;
      border-bottom-color: #1a5490;
    }

    .nav-link .icono {
      font-size: 1.5rem;
    }

    .contenido-principal {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .seccion-acciones,
    .seccion-recientes,
    .seccion-actividad,
    .seccion-info {
      margin-bottom: 3rem;
    }

    .seccion-acciones h2,
    .seccion-recientes h2,
    .seccion-actividad h2,
    .seccion-info h2 {
      color: #1a5490;
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .acciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .accion-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border-top: 4px solid #1a5490;
    }

    .accion-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .accion-card.crear {
      border-top-color: #4dabf7;
    }

    .accion-card.mis-publicidades {
      border-top-color: #51cf66;
    }

    .accion-card.estadisticas {
      border-top-color: #ff922b;
    }

    .accion-card.facturacion {
      border-top-color: #ae3ec9;
    }

    .card-header {
      margin-bottom: 1rem;
      text-align: center;
    }

    .icono-grande {
      font-size: 3rem;
      display: block;
    }

    .accion-card h3 {
      margin: 1rem 0 0.5rem 0;
      color: #333;
    }

    .accion-card p {
      margin: 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .accion-card .cantidad,
    .accion-card .monto {
      font-weight: 600;
      color: #1a5490;
    }

    .btn-action {
      width: 100%;
      padding: 0.75rem;
      margin-top: 1rem;
      background: #1a5490;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-action:hover {
      background: #0d3a6e;
      transform: translateY(-2px);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .link-ver-todas {
      color: #1a5490;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .link-ver-todas:hover {
      color: #0d3a6e;
    }

    .sin-publicidades {
      background: white;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-icono {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
      color: #666;
    }

    .btn-crear-primera {
      padding: 0.75rem 1.5rem;
      background: #1a5490;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-crear-primera:hover {
      background: #0d3a6e;
    }

    .publicidades-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .publicidad-item {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #ccc;
      transition: all 0.3s ease;
    }

    .publicidad-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .publicidad-item.pendiente {
      border-left-color: #ff922b;
      background: #fffbf0;
    }

    .publicidad-item.aprobado {
      border-left-color: #51cf66;
      background: #f0f9ff;
    }

    .publicidad-item.rechazado {
      border-left-color: #ff6b6b;
      background: #fff5f5;
    }

    .publicidad-item.publicado {
      border-left-color: #1a5490;
      background: #f0f8ff;
    }

    .publicidad-item.finalizado {
      border-left-color: #868e96;
      background: #f8f9fa;
    }

    .pub-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .pub-info h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .pub-descripcion {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-pendiente {
      background: #ff922b;
      color: white;
    }

    .badge-aprobado {
      background: #51cf66;
      color: white;
    }

    .badge-rechazado {
      background: #ff6b6b;
      color: white;
    }

    .badge-publicado {
      background: #1a5490;
      color: white;
    }

    .badge-finalizado {
      background: #868e96;
      color: white;
    }

    .pub-detalles {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .detalle {
      color: #666;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .pub-progreso {
      margin-bottom: 1rem;
    }

    .barra-progreso {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .progreso-interior {
      height: 100%;
      background: linear-gradient(90deg, #1a5490 0%, #4dabf7 100%);
      transition: width 0.3s ease;
    }

    .porcentaje {
      display: block;
      font-size: 0.8rem;
      color: #999;
    }

    .btn-ver-detalles {
      padding: 0.5rem 1rem;
      background: #f0f0f0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      color: #1a5490;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-ver-detalles:hover {
      background: #1a5490;
      color: white;
    }

    .seccion-actividad {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .actividad-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .card-actividad {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .card-actividad h3 {
      margin: 0 0 0.75rem 0;
      color: #333;
      font-size: 0.95rem;
    }

    .card-actividad .numero {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a5490;
    }

    .seccion-info {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .info-card {
      padding: 1.5rem;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #1a5490;
    }

    .info-card h3 {
      margin-top: 0;
      color: #1a5490;
    }

    .info-card ol,
    .info-card ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
      color: #666;
      line-height: 1.8;
    }

    .info-card li {
      margin-bottom: 0.5rem;
    }

    .info-card p {
      margin: 0.5rem 0;
      color: #666;
      line-height: 1.6;
    }
  `]
})
export class UsuarioDashboardComponent implements OnInit, OnDestroy {
  publicidades: PublicacionCard[] = [];
  saldoPendiente = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private publicacionServicio: PublicacionServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que es usuario
    if (!this.permisosServicio.esUsuario()) {
      this.router.navigate(['/sin-permisos']);
      return;
    }

    this.cargarPublicidades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPublicidades(): void {
    // Simulación de datos hasta que el backend esté listo
    this.publicidades = [
      {
        id: 1,
        titulo: 'Gran Promoción de Verano',
        descripcion: 'Descuentos hasta 50% en todos los productos',
        estado: 'PUBLICADO',
        ubicaciones: 5,
        costoTotal: 2500,
        fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        progreso: 100
      },
      {
        id: 2,
        titulo: 'Nuevo Catálogo de Productos',
        descripcion: 'Mira nuestra nueva colección de primavera',
        estado: 'APROBADO',
        ubicaciones: 3,
        costoTotal: 1500,
        fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        progreso: 50
      },
      {
        id: 3,
        titulo: 'Evento Especial Este Fin de Semana',
        descripcion: 'No te pierdas nuestro evento con ofertas exclusivas',
        estado: 'PENDIENTE',
        ubicaciones: 2,
        costoTotal: 800,
        fechaCreacion: new Date().toISOString(),
        progreso: 20
      }
    ];

    this.calcularSaldo();
  }

  calcularSaldo(): void {
    this.saldoPendiente = this.publicidades
      .filter(p => p.estado === 'APROBADO' || p.estado === 'PUBLICADO')
      .reduce((total, p) => total + p.costoTotal, 0);
  }

  contar(estado: string): number {
    return this.publicidades.filter(p => p.estado === estado as any).length;
  }

  calcularCostoTotal(): number {
    return this.publicidades.reduce((total, p) => total + p.costoTotal, 0);
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: '⏳ En Revisión',
      APROBADO: '✅ Aprobado',
      RECHAZADO: '❌ Rechazado',
      PUBLICADO: '📡 En Transmisión',
      FINALIZADO: '✓ Finalizado'
    };
    return labels[estado] || estado;
  }

  irACrearPublicidad(): void {
    this.router.navigate(['/publicacion/seleccionar-ubicaciones']);
  }

  irAMisPublicidades(): void {
    this.router.navigate(['/usuario/mis-publicidades']);
  }

  irAEstadisticas(): void {
    this.router.navigate(['/usuario/estadisticas']);
  }

  irAFacturacion(): void {
    this.router.navigate(['/usuario/facturacion']);
  }

  verDetalles(publicidadId: number): void {
    this.router.navigate(['/usuario/publicidades', publicidadId]);
  }

  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}
