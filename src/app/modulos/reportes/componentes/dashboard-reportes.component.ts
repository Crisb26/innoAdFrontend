import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '../../../shared/componentes/navegacion-autenticada.component';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-dashboard-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink, NavegacionAutenticadaComponent],
  styleUrls: ['./dashboard-reportes.component.scss'],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-reportes">
      <div class="header-reportes">
        <div>
          <h1>Reportes y Análisis</h1>
          <p>Visualiza métricas y desempeño de tus campañas</p>
        </div>
        <div class="controles-periodo">
          <button 
            [class.activo]="periodoSeleccionado === 'hoy'"
            (click)="periodoSeleccionado = 'hoy'; cargarReportes()"
          >
            Hoy
          </button>
          <button 
            [class.activo]="periodoSeleccionado === 'semana'"
            (click)="periodoSeleccionado = 'semana'; cargarReportes()"
          >
            Esta Semana
          </button>
          <button 
            [class.activo]="periodoSeleccionado === 'mes'"
            (click)="periodoSeleccionado = 'mes'; cargarReportes()"
          >
            Este Mes
          </button>
          <button class="btn-exportar" (click)="exportarPDF()">
            Descargar PDF
          </button>
          <button class="btn-exportar" (click)="exportarCSV()">
            Descargar CSV
          </button>
        </div>
      </div>

      <div class="seccion-kpis">
        <div class="kpi-card">
          <div class="kpi-header">
            <h3>Reproducciones</h3>
            <span class="icono">play</span>
          </div>
          <div class="kpi-valor">{{ metricas().reproducciones }}</div>
          <div class="kpi-cambio positivo">+12% esta semana</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <h3>Usuarios Activos</h3>
            <span class="icono">users</span>
          </div>
          <div class="kpi-valor">{{ metricas().usuariosActivos }}</div>
          <div class="kpi-cambio positivo">+8% esta semana</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <h3>Contenidos</h3>
            <span class="icono">file</span>
          </div>
          <div class="kpi-valor">{{ metricas().contenidos }}</div>
          <div class="kpi-cambio neutral">Sin cambios</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <h3>Ingresos</h3>
            <span class="icono">dollar</span>
          </div>
          <div class="kpi-valor">\${{ metricas().ingresos }}K</div>
          <div class="kpi-cambio positivo">+25% esta semana</div>
        </div>
      </div>

      <div class="seccion-tablas">
        <div class="tabla-card">
          <h2>Campañas Principales</h2>
          <table>
            <thead>
              <tr>
                <th>Campaña</th>
                <th>Reproducciones</th>
                <th>Usuarios</th>
                <th>Conversión</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Black Friday</strong></td>
                <td>15,234</td>
                <td>3,456</td>
                <td>22.8%</td>
              </tr>
              <tr>
                <td><strong>Verano 2024</strong></td>
                <td>12,890</td>
                <td>2,890</td>
                <td>18.5%</td>
              </tr>
              <tr>
                <td><strong>Promoción General</strong></td>
                <td>9,567</td>
                <td>1,234</td>
                <td>12.8%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="tabla-card">
          <h2>Pantallas por Desempeño</h2>
          <table>
            <thead>
              <tr>
                <th>Pantalla</th>
                <th>Ubicación</th>
                <th>Reproducciones</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pantalla Entrada</strong></td>
                <td>Recepción</td>
                <td>8,234</td>
                <td><span class="badge activa">Activa</span></td>
              </tr>
              <tr>
                <td><strong>Pantalla Pasillo</strong></td>
                <td>Pasillo Principal</td>
                <td>6,890</td>
                <td><span class="badge activa">Activa</span></td>
              </tr>
              <tr>
                <td><strong>Pantalla Sala</strong></td>
                <td>Sala Espera</td>
                <td>4,567</td>
                <td><span class="badge inactiva">Inactiva</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="seccion-detalles">
        <div class="detalles-card">
          <h2>Resumen de Periodo</h2>
          <div class="resumen-list">
            <div class="resumen-item">
              <span class="label">Período Actual</span>
              <span class="valor">{{ periodoSeleccionado | uppercase }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Total Reproducciones</span>
              <span class="valor">{{ metricas().reproducciones }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Usuarios Únicos</span>
              <span class="valor">{{ metricas().usuariosActivos }}</span>
            </div>
            <div class="resumen-item">
              <span class="label">Tasa Conversión Media</span>
              <span class="valor">18.0%</span>
            </div>
            <div class="resumen-item">
              <span class="label">Pantallas Activas</span>
              <span class="valor">2 de 3</span>
            </div>
            <div class="resumen-item">
              <span class="label">Ingresos Totales</span>
              <span class="valor">\${{ metricas().ingresos }}K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardReportesComponent implements OnInit {
  periodoSeleccionado = 'mes';
  
  metricas = signal({
    reproducciones: 38691,
    usuariosActivos: 7580,
    contenidos: 24,
    ingresos: 52
  });

  ngOnInit() {
    this.cargarReportes();
  }

  cargarReportes() {
    console.log('Cargando reportes para:', this.periodoSeleccionado);
  }

  exportarPDF() {
    try {
      const doc = new (window as any).jspdf.jsPDF();
      const titulo = `Reporte de ${this.periodoSeleccionado}`;
      const fecha = new Date().toLocaleDateString('es-CO');
      
      // Encabezado
      doc.setFillColor(30, 41, 59); // Color del tema
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(0, 212, 255);
      doc.setFontSize(18);
      doc.text(titulo, 15, 20);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 15, 26);
      
      // Contenido
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      let y = 50;
      
      // Métricas principales
      doc.text('MÉTRICAS PRINCIPALES', 15, y);
      y += 10;
      
      const metricas = [
        `Reproducciones: ${this.metricas().reproducciones}`,
        `Usuarios Activos: ${this.metricas().usuariosActivos}`,
        `Contenidos: ${this.metricas().contenidos}`,
        `Ingresos: $${this.metricas().ingresos}K`
      ];
      
      metricas.forEach((metrica) => {
        doc.text(metrica, 20, y);
        y += 10;
      });
      
      y += 10;
      doc.text('Periodo seleccionado: ' + this.periodoSeleccionado.toUpperCase(), 15, y);
      
      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(
          `Página ${i} de ${totalPages}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`Reporte_${this.periodoSeleccionado}_${new Date().getTime()}.pdf`);
      
      NotifyX.success('Reporte PDF descargado exitosamente', {
        duration: 3000,
        dismissible: true
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      NotifyX.error('Error al descargar el PDF. Intenta nuevamente.', {
        duration: 3000,
        dismissible: true
      });
    }
  }

  exportarCSV() {
    try {
      const metricas = this.metricas();
      const csv = [
        ['Métrica', 'Valor'],
        ['Reproducciones', metricas.reproducciones.toString()],
        ['Usuarios Activos', metricas.usuariosActivos.toString()],
        ['Contenidos', metricas.contenidos.toString()],
        ['Ingresos', `$${metricas.ingresos}K`],
        [],
        ['Período', this.periodoSeleccionado],
        ['Fecha de Exportación', new Date().toLocaleDateString('es-CO')]
      ]
        .map(row => row.join(','))
        .join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `Reporte_${this.periodoSeleccionado}_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      NotifyX.success('Reporte CSV descargado exitosamente', {
        duration: 3000,
        dismissible: true
      });
    } catch (error) {
      console.error('Error generando CSV:', error);
      NotifyX.error('Error al descargar el CSV. Intenta nuevamente.', {
        duration: 3000,
        dismissible: true
      });
    }
  }
}
