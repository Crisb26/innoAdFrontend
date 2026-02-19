import { Injectable, signal, effect } from '@angular/core';

export type Tema = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class TemaServicio {
  private temaSignal = signal<Tema>(this.obtenerTemaGuardado());
  public tema$ = this.temaSignal.asReadonly();

  constructor() {
    // Aplicar tema cuando cambia
    effect(() => {
      const tema = this.temaSignal();
      this.aplicarTema(tema);
      localStorage.setItem('tema-innoad', tema);
    });
  }

  /**
   * Alternar entre tema claro y oscuro
   */
  alternarTema(): void {
    const temaActual = this.temaSignal();
    const nuevoTema = temaActual === 'light' ? 'dark' : 'light';
    this.temaSignal.set(nuevoTema);
  }

  /**
   * Establecer tema específico
   */
  establecerTema(tema: Tema): void {
    this.temaSignal.set(tema);
  }

  /**
   * Obtener tema actual
   */
  obtenerTema(): Tema {
    return this.temaSignal();
  }

  /**
   * Aplicar tema al documento
   */
  private aplicarTema(tema: Tema): void {
    const html = document.documentElement;

    if (tema === 'dark') {
      html.classList.add('dark-mode');
      html.style.setProperty('color-scheme', 'dark');
    } else {
      html.classList.remove('dark-mode');
      html.style.setProperty('color-scheme', 'light');
    }

    // Aplicar variables CSS
    if (tema === 'dark') {
      html.style.setProperty('--bg-primary', '#1a1a1a');
      html.style.setProperty('--bg-secondary', '#2d2d2d');
      html.style.setProperty('--text-primary', '#ffffff');
      html.style.setProperty('--text-secondary', '#b0b0b0');
      html.style.setProperty('--border-color', '#404040');
      html.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
    } else {
      html.style.setProperty('--bg-primary', '#ffffff');
      html.style.setProperty('--bg-secondary', '#f5f5f5');
      html.style.setProperty('--text-primary', '#000000');
      html.style.setProperty('--text-secondary', '#666666');
      html.style.setProperty('--border-color', '#e0e0e0');
      html.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    }
  }

  /**
   * Obtener tema guardado o detectar preferencia del sistema
   */
  private obtenerTemaGuardado(): Tema {
    // Primero verificar localStorage
    const temaGuardado = localStorage.getItem('tema-innoad') as Tema | null;
    if (temaGuardado) {
      return temaGuardado;
    }

    // Luego verificar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }
}
