/**
 * Servicio de utilidades para exportación de datos
 * Genera PDF, CSV, Excel con datos de reportes y analítica
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServicioExportacion {

  /**
   * Exporta datos a CSV
   */
  public exportarCSV(
    datos: Array<Record<string, any>>,
    nombreArchivo: string,
    encabezados?: string[]
  ): void {
    try {
      // Preparar encabezados
      const headers = encabezados || (datos.length > 0 ? Object.keys(datos[0]) : []);
      
      // Crear filas CSV
      const filas: string[] = [];
      filas.push(headers.join(','));
      
      datos.forEach(fila => {
        const valores = headers.map(header => {
          const valor = fila[header] ?? '';
          // Escapar comillas y comas en valores
          return typeof valor === 'string' && valor.includes(',') 
            ? `"${valor.replace(/"/g, '""')}"` 
            : valor;
        });
        filas.push(valores.join(','));
      });
      
      const csv = filas.join('\n');
      this.descargarArchivo(csv, `${nombreArchivo}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('Error exportando CSV:', error);
      throw error;
    }
  }

  /**
   * Exporta datos a PDF simple
   */
  public exportarPDFSimple(
    titulo: string,
    contenido: string,
    nombreArchivo: string
  ): void {
    try {
      const elemento = document.createElement('div');
      elemento.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>${titulo}</h1>
          <p>Fecha: ${new Date().toLocaleDateString('es-CO')}</p>
          <hr>
          ${contenido}
        </div>
      `;
      
      // Usar html2pdf si está disponible
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        html2pdf()
          .set({
            margin: 10,
            filename: `${nombreArchivo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
          })
          .from(elemento)
          .save();
      } else {
        // Fallback: crear un archivo de texto si html2pdf no está disponible
        this.descargarArchivo(
          `${titulo}\n\n${contenido}`,
          `${nombreArchivo}.txt`,
          'text/plain;charset=utf-8;'
        );
      }
    } catch (error) {
      console.error('Error exportando PDF:', error);
      throw error;
    }
  }

  /**
   * Exporta tabla HTML a PDF
   */
  public exportarTablaPDF(
    tabla: HTMLTableElement,
    titulo: string,
    nombreArchivo: string
  ): void {
    try {
      const html2pdf = (window as any).html2pdf;
      if (!html2pdf) {
        // Fallback: exportar a CSV desde tabla
        this.exportarTablaCSV(tabla, nombreArchivo);
        return;
      }

      const contenedor = document.createElement('div');
      contenedor.innerHTML = `
        <h1>${titulo}</h1>
        <p>Fecha: ${new Date().toLocaleDateString('es-CO')}</p>
        <hr>
      `;
      contenedor.appendChild(tabla.cloneNode(true));

      html2pdf()
        .set({
          margin: 10,
          filename: `${nombreArchivo}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
        })
        .from(contenedor)
        .save();
    } catch (error) {
      console.error('Error exportando tabla a PDF:', error);
      throw error;
    }
  }

  /**
   * Exporta tabla HTML a CSV
   */
  public exportarTablaCSV(
    tabla: HTMLTableElement,
    nombreArchivo: string
  ): void {
    try {
      const filas: string[] = [];

      // Encabezados
      const encabezados: string[] = [];
      tabla.querySelectorAll('thead th').forEach(th => {
        encabezados.push((th as HTMLElement).innerText);
      });
      filas.push(encabezados.join(','));

      // Datos
      tabla.querySelectorAll('tbody tr').forEach(tr => {
        const valores: string[] = [];
        tr.querySelectorAll('td').forEach(td => {
          valores.push((td as HTMLElement).innerText);
        });
        filas.push(valores.join(','));
      });

      const csv = filas.join('\n');
      this.descargarArchivo(csv, `${nombreArchivo}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('Error exportando tabla a CSV:', error);
      throw error;
    }
  }

  /**
   * Exporta datos JSON a Excel (CSV formateado)
   */
  public exportarExcel(
    datos: Array<Record<string, any>>,
    nombreArchivo: string,
    encabezados?: string[]
  ): void {
    try {
      // Usar la misma lógica que CSV pero con formato Excel
      this.exportarCSV(datos, nombreArchivo, encabezados);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      throw error;
    }
  }

  /**
   * Descarga un archivo desde un Blob
   */
  private descargarArchivo(
    contenido: string,
    nombreArchivo: string,
    tipoContenido: string
  ): void {
    try {
      const blob = new Blob([contenido], { type: tipoContenido });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      
      enlace.href = url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      
      // Limpiar
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      throw error;
    }
  }

  /**
   * Copia un elemento al portapapeles
   */
  public copiarAlPortapapeles(texto: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto);
    } else {
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve();
    }
  }

  /**
   * Abre una vista previa de impresión
   */
  public abrirVistaPrevia(elemento: HTMLElement, titulo: string): void {
    try {
      const ventana = window.open('', '', 'width=800,height=600');
      if (!ventana) {
        throw new Error('No se pudo abrir la ventana de vista previa');
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          ${elemento.innerHTML}
          <script>
            window.print();
          </script>
        </body>
        </html>
      `;

      ventana.document.write(html);
      ventana.document.close();
    } catch (error) {
      console.error('Error abriendo vista previa:', error);
    }
  }
}
