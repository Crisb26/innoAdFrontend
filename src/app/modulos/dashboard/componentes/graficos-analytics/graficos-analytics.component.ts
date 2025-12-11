import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Subject, interval, takeUntil, switchMap } from 'rxjs';

interface DatosGrafico {
  labels: string[];
  datasets: Dataset[];
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
}

@Component({
  selector: 'app-graficos-analytics',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="contenedor-graficos">
      <div class="encabezado">
        <h2>Graficos Analíticos</h2>
        <p>Visualización de métricas en tiempo real</p>
      </div>

      <div class="controles">
        <button
          *ngFor="let p of periodos"
          [class.activo]="periodoSeleccionado === p"
          (click)="cambiarPeriodo(p)"
          [disabled]="cargando"
          class="btn-periodo"
        >
          {{ p }}
        </button>
      </div>

      <div class="indicador-carga" *ngIf="cargando">
        <div class="spinner"></div>
        <p>Generando gráficos...</p>
      </div>

      <div class="grid-graficos" *ngIf="!cargando && datosGraficos">
        <div class="tarjeta-grafico">
          <h3>Mensajes Chat vs Preguntas IA</h3>
          <div class="canvas-placeholder">
            <p>Gráfico de líneas: Chat y IA por hora</p>
          </div>
        </div>

        <div class="tarjeta-grafico">
          <h3>Tasa de Éxito IA</h3>
          <div class="canvas-placeholder">
            <p>Gráfico de barras: Evolución diaria</p>
          </div>
        </div>

        <div class="tarjeta-grafico">
          <h3>Costos de IA</h3>
          <div class="canvas-placeholder">
            <p>Gráfico de área: Acumulado por día</p>
          </div>
        </div>

        <div class="tarjeta-grafico">
          <h3>Disponibilidad del Sistema</h3>
          <div class="canvas-placeholder">
            <p>Gráfico gauge: Porcentaje de uptime</p>
          </div>
        </div>
      </div>

      <div class="seccion-exportar">
        <h3>Exportar Reportes</h3>
        <div class="botones-exportar">
          <button class="btn-exportar pdf" (click)="exportarPDF()" [disabled]="cargando">
            Descargar PDF
          </button>
          <button class="btn-exportar csv" (click)="exportarCSV()" [disabled]="cargando">
            Descargar CSV
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-graficos {
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .encabezado {
      color: white;
      margin-bottom: 2rem;
      text-align: center;
    }

    .encabezado h2 {
      margin: 0;
      font-size: 2rem;
    }

    .encabezado p {
      margin: 0.5rem 0 0 0;
      opacity: 0.95;
    }

    .controles {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn-periodo {
      padding: 0.8rem 2rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-radius: 2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-periodo:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .btn-periodo.activo {
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      border-color: white;
    }

    .indicador-carga {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: white;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .grid-graficos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .tarjeta-grafico {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .tarjeta-grafico:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    }

    .tarjeta-grafico h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .canvas-placeholder {
      background: #f5f5f5;
      border: 2px dashed #ddd;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      min-height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    .seccion-exportar {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .seccion-exportar h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .botones-exportar {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-exportar {
      padding: 1rem 2rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .btn-exportar.pdf {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-exportar.csv {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .btn-exportar:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .btn-exportar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .contenedor-graficos {
        padding: 1rem;
      }

      .grid-graficos {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .encabezado h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class GraficosAnalyticsComponent implements OnInit, OnDestroy {
  periodos = ['ultima-hora', 'hoy', 'semanal'];
  periodoSeleccionado = 'hoy';
  cargando = false;
  datosGraficos: DatosGrafico | null = null;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarGraficos();
    // Auto-refresh cada 60 segundos
    interval(60000)
      .pipe(
        switchMap(() => {
          this.cargando = true;
          return this.http.get<DatosGrafico>(`/api/graficos/${this.periodoSeleccionado}`);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (datos) => {
          this.datosGraficos = datos;
          this.cargando = false;
        },
        (error) => {
          console.error('Error cargando gráficos', error);
          this.cargando = false;
        }
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarGraficos() {
    this.cargando = true;
    this.http.get<DatosGrafico>(`/api/graficos/${this.periodoSeleccionado}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (datos) => {
          this.datosGraficos = datos;
          this.cargando = false;
        },
        (error) => {
          console.error('Error cargando gráficos', error);
          this.cargando = false;
        }
      );
  }

  cambiarPeriodo(periodo: string) {
    this.periodoSeleccionado = periodo;
    this.cargarGraficos();
  }

  exportarPDF() {
    this.cargando = true;
    this.http.get(`/api/reportes/pdf/${this.periodoSeleccionado}`, {
      responseType: 'blob'
    }).pipe(takeUntil(this.destroy$)).subscribe(
      (blob) => {
        this.descargarArchivo(blob, `reporte_${this.periodoSeleccionado}.pdf`);
        this.cargando = false;
      },
      (error) => {
        console.error('Error exportando PDF', error);
        this.cargando = false;
      }
    );
  }

  exportarCSV() {
    this.cargando = true;
    this.http.get(`/api/reportes/csv/${this.periodoSeleccionado}`, {
      responseType: 'blob'
    }).pipe(takeUntil(this.destroy$)).subscribe(
      (blob) => {
        this.descargarArchivo(blob, `reporte_${this.periodoSeleccionado}.csv`);
        this.cargando = false;
      },
      (error) => {
        console.error('Error exportando CSV', error);
        this.cargando = false;
      }
    );
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
