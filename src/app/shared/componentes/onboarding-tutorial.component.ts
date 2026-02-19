import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
          <button class="cerrar-btn" (click)="cerrarTutorial()">‚úï</button>
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
            <h4>[]ã Credenciales Disponibles:</h4>
            <div class="credenciales-lista">
              <div *ngFor="let cred of pasoActual.credenciales" class="credencial-item">
                <span class="usuario">{{ cred.usuario }}</span>
                <span class="tipo">({{ cred.tipo }})</span>
              </div>
            </div>
          </div>

          <!-- Elementos (si existen) -->
          <div *ngIf="pasoActual.elementos" class="elementos-box">
            <h4>[]ç Elementos principales:</h4>
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
            ‚Üê Anterior
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
            Siguiente ‚Üí
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
    titulo: '[]Ø Bienvenido',
    descripcion: 'Cargando...',
    contenido: '',
    icono: 'rocket'
  };
  totalPasos = 10;
  pasos: TutorialPaso[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarTutorial();
  }

  cargarTutorial() {
    this.http.get<any>('http://localhost:8080/api/onboarding/tutorial').subscribe(
      (response) => {
        if (response.tutorialCompleto) {
          this.pasos = response.tutorialCompleto;
          this.totalPasos = this.pasos.length;
          this.mostrarTutorial = true;
          this.irAlPaso(1);
        }
      },
      (error) => {
        console.error('Error cargando tutorial:', error);
      }
    );
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
    this.tutorialCerrado.emit();
  }

  getIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      rocket: '[]Ä',
      login: '[]ê',
      chart: '[]ä',
      megaphone: '[]£',
      monitor: '[]∫',
      file: '[]¨',
      graph: '[]à',
      settings: '[]ß',
      lightbulb: '[]°',
      check: '[]'
    };
    return iconos[tipo] || '[]å';
  }
}
