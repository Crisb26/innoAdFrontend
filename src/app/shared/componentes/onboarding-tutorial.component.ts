import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TutorialPaso {
  paso: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  icono: string;
  credenciales?: any[];
  elementos?: string[];
}

@Component({
  selector: 'app-onboarding-tutorial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tutorial-overlay" *ngIf="mostrarTutorial">
      <div class="tutorial-modal">
        <!-- Header -->
        <div class="tutorial-header">
          <h2>{{ pasoActual.titulo }}</h2>
          <button class="cerrar-btn" (click)="cerrarTutorial()">✕</button>
        </div>

        <!-- Barra de progreso -->
        <div class="progreso-container">
          <div class="progreso-bar">
            <div class="progreso-fill" [style.width.%]="(pasoActual.paso / totalPasos) * 100"></div>
          </div>
          <span class="progreso-texto">Paso {{ pasoActual.paso }} de {{ totalPasos }}</span>
        </div>

        <!-- Contenido -->
        <div class="tutorial-contenido">
          <div class="icono-grande">{{ getIcono(pasoActual.icono) }}</div>
          
          <h3>{{ pasoActual.descripcion }}</h3>
          
          <p class="contenido-texto">{{ pasoActual.contenido }}</p>

          <!-- Credenciales (si existen) -->
          <div *ngIf="pasoActual.credenciales" class="credenciales-box">
            <h4>[]� Credenciales Disponibles:</h4>
            <div class="credenciales-lista">
              <div *ngFor="let cred of pasoActual.credenciales" class="credencial-item">
                <span class="usuario">{{ cred.usuario }}</span>
                <span class="tipo">({{ cred.tipo }})</span>
              </div>
            </div>
          </div>

          <!-- Elementos (si existen) -->
          <div *ngIf="pasoActual.elementos" class="elementos-box">
            <h4>[]� Elementos principales:</h4>
            <ul>
              <li *ngFor="let elem of pasoActual.elementos">{{ elem }}</li>
            </ul>
          </div>
        </div>

        <!-- Botones -->
        <div class="tutorial-botones">
          <button 
            class="btn-anterior" 
            (click)="pasoAnterior()"
            [disabled]="pasoActual.paso === 1">
            ← Anterior
          </button>
          
          <button 
            class="btn-saltar" 
            (click)="cerrarTutorial()">
            Saltar Tutorial
          </button>
          
          <button 
            class="btn-siguiente" 
            (click)="pasoSiguiente()"
            [disabled]="pasoActual.paso === totalPasos">
            Siguiente →
          </button>
        </div>

        <!-- Indicadores de pasos -->
        <div class="paso-indicadores">
          <div 
            *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]"
            class="indicador"
            [class.activo]="i === pasoActual.paso"
            (click)="irAlPaso(i)">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tutorial-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .tutorial-modal {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px;
      padding: 40px;
      max-width: 700px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
      border: 2px solid #00ffff;
      color: #fff;
    }

    .tutorial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #00ffff;
      padding-bottom: 20px;
    }

    .tutorial-header h2 {
      margin: 0;
      color: #00ffff;
      font-size: 24px;
    }

    .cerrar-btn {
      background: none;
      border: none;
      color: #00ffff;
      font-size: 28px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .cerrar-btn:hover {
      transform: scale(1.2);
      color: #ff0066;
    }

    .progreso-container {
      margin-bottom: 25px;
    }

    .progreso-bar {
      height: 10px;
      background: rgba(0, 255, 255, 0.2);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progreso-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ffff, #00ff88);
      transition: width 0.4s ease;
    }

    .progreso-texto {
      font-size: 12px;
      color: #00ffff;
    }

    .tutorial-contenido {
      text-align: center;
      margin-bottom: 30px;
    }

    .icono-grande {
      font-size: 80px;
      margin-bottom: 20px;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .tutorial-contenido h3 {
      color: #00ffff;
      margin-bottom: 15px;
      font-size: 18px;
    }

    .contenido-texto {
      line-height: 1.6;
      color: #ccc;
      white-space: pre-wrap;
      margin-bottom: 20px;
      text-align: left;
    }

    .credenciales-box, .elementos-box {
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid #00ffff;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      text-align: left;
    }

    .credenciales-box h4, .elementos-box h4 {
      margin: 0 0 10px 0;
      color: #00ffff;
    }

    .credenciales-lista {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .credencial-item {
      display: flex;
      gap: 10px;
      padding: 8px;
      background: rgba(0, 255, 255, 0.05);
      border-radius: 5px;
      font-size: 14px;
    }

    .usuario {
      font-weight: bold;
      color: #00ff88;
    }

    .tipo {
      color: #999;
    }

    .elementos-box ul {
      margin: 0;
      padding-left: 20px;
    }

    .elementos-box li {
      color: #ccc;
      margin-bottom: 5px;
    }

    .tutorial-botones {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    button {
      padding: 12px 20px;
      border: 2px solid #00ffff;
      background: transparent;
      color: #00ffff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;
    }

    button:hover:not(:disabled) {
      background: #00ffff;
      color: #1a1a2e;
      transform: translateY(-2px);
    }

    button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-siguiente {
      order: 3;
    }

    .btn-anterior {
      order: 1;
    }

    .btn-saltar {
      order: 2;
      border-color: #ff0066;
      color: #ff0066;
    }

    .btn-saltar:hover {
      background: #ff0066;
      color: white;
    }

    .paso-indicadores {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .indicador {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(0, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .indicador:hover {
      background: rgba(0, 255, 255, 0.6);
      border-color: #00ffff;
    }

    .indicador.activo {
      background: #00ffff;
      transform: scale(1.3);
    }
  `]
})
export class OnboardingTutorialComponent implements OnInit {
  @Output() tutorialCerrado = new EventEmitter<void>();

  mostrarTutorial = false;
  pasoActual: TutorialPaso = {
    paso: 1,
    titulo: '¡Bienvenido a InnoAd!',
    descripcion: 'Cargando...',
    contenido: '',
    icono: 'rocket'
  };
  totalPasos = 10;
  pasos: TutorialPaso[] = [];

  constructor() {}

  ngOnInit() {
    this.cargarTutorial();
  }

  cargarTutorial() {
    // Solo mostrar si el usuario no ha visto el tutorial antes
    if (localStorage.getItem('innoad_onboarding_completado') === '1') return;

    this.pasos = [
      {
        paso: 1,
        titulo: '¡Bienvenido a InnoAd! 🚀',
        descripcion: 'La plataforma de publicidad digital inteligente',
        contenido: 'InnoAd es un sistema de gestión de publicidad digital que te permite crear, aprobar y publicar contenido en pantallas ubicadas en diferentes lugares.',
        icono: 'rocket'
      },
      {
        paso: 2,
        titulo: 'Tu Rol en el Sistema 🔑',
        descripcion: '¿Quién eres en InnoAd?',
        contenido: 'InnoAd tiene tres roles:\n\n👤 Usuario: Puedes crear y subir publicaciones, pagar campañas y ver estadísticas.\n\n🔧 Técnico: Revisas y apruebas publicaciones, gestionas pantallas y equipos.\n\n👑 Administrador: Control total del sistema, usuarios y configuración.',
        icono: 'login'
      },
      {
        paso: 3,
        titulo: 'Crear una Publicación 📢',
        descripcion: 'El primer paso para publicar tu contenido',
        contenido: 'Ve a Publicación > Crear para subir tu contenido multimedia (imágenes o videos).\n\nPuedes previsualizar cómo se verá en las pantallas antes de enviarlo.',
        icono: 'megaphone'
      },
      {
        paso: 4,
        titulo: 'Seleccionar Ubicaciones 📍',
        descripcion: 'Elige dónde mostrar tu publicidad',
        contenido: 'Selecciona las ciudades, lugares y pisos donde quieres que se muestre tu publicidad.\n\nEl sistema calcula automáticamente el costo según la duración y las ubicaciones elegidas.',
        icono: 'monitor'
      },
      {
        paso: 5,
        titulo: 'Pago y Aprobación 💳',
        descripcion: 'Proceso de pago y revisión',
        contenido: 'Después de crear tu publicación deberás completar el pago.\n\nUn técnico revisará tu contenido y lo aprobará antes de publicarse en las pantallas.',
        icono: 'file'
      },
      {
        paso: 6,
        titulo: 'Panel del Técnico 🔧',
        descripcion: 'Revisión y publicación de contenido',
        contenido: 'Como técnico, en tu panel puedes:\n• Ver publicaciones pendientes de aprobación\n• Aprobar o rechazar contenido\n• Gestionar las pantallas conectadas\n• Monitorear el estado de los equipos',
        icono: 'settings'
      },
      {
        paso: 7,
        titulo: 'Gestión de Campañas 📊',
        descripcion: 'Organiza tus campañas publicitarias',
        contenido: 'Las campañas agrupan múltiples publicaciones. Puedes:\n• Programar fechas de inicio y fin\n• Asignar pantallas específicas\n• Ver el rendimiento en tiempo real\n• Controlar el presupuesto',
        icono: 'chart'
      },
      {
        paso: 8,
        titulo: 'Estadísticas e Informes 📈',
        descripcion: 'Mide el impacto de tu publicidad',
        contenido: 'En la sección de Estadísticas encontrarás:\n• Impresiones y visualizaciones\n• Rendimiento por ubicación\n• Reportes exportables\n• Gráficas en tiempo real',
        icono: 'graph'
      },
      {
        paso: 9,
        titulo: 'InnoBot - Tu Asistente IA 🤖',
        descripcion: 'Ayuda inteligente siempre disponible',
        contenido: 'InnoBot es el asistente de inteligencia artificial de InnoAd.\n\n¡Encuéntralo en la esquina inferior derecha! Puedes preguntarle sobre:\n• Cómo usar el sistema\n• Dudas sobre tu cuenta\n• Recomendaciones de campañas\n• Ayuda técnica',
        icono: 'lightbulb'
      },
      {
        paso: 10,
        titulo: '¡Listo para Empezar! ✅',
        descripcion: '¡Ya conoces InnoAd!',
        contenido: 'Ya tienes todo lo que necesitas para empezar.\n\nRecuerda que puedes volver a ver este tutorial desde la configuración en cualquier momento.\n\n¡Bienvenido a la familia InnoAd! 🎉',
        icono: 'check'
      }
    ];

    this.totalPasos = this.pasos.length;
    this.mostrarTutorial = true;
    this.irAlPaso(1);
  }

  irAlPaso(numero: number) {
    const paso = this.pasos.find(p => p.paso === numero);
    if (paso) {
      this.pasoActual = paso;
    }
  }

  pasoSiguiente() {
    if (this.pasoActual.paso < this.totalPasos) {
      this.irAlPaso(this.pasoActual.paso + 1);
    }
  }

  pasoAnterior() {
    if (this.pasoActual.paso > 1) {
      this.irAlPaso(this.pasoActual.paso - 1);
    }
  }

  cerrarTutorial() {
    this.mostrarTutorial = false;
    localStorage.setItem('innoad_onboarding_completado', '1');
    this.tutorialCerrado.emit();
  }

  getIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      rocket: '[]�',
      login: '[]�',
      chart: '[]�',
      megaphone: '[]�',
      monitor: '[]�',
      file: '[]�',
      graph: '[]�',
      settings: '[]�',
      lightbulb: '[]�',
      check: '[]'
    };
    return iconos[tipo] || '[]�';
  }
}
