import { Injectable } from '@angular/core';

declare const window: any;

export interface AyudaStep {
  element?: string; // selector opcional
  intro: string;
  position?: 'top' | 'right' | 'left' | 'bottom' | 'auto';
}

@Injectable({ providedIn: 'root' })
export class AyudaService {
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  // CDN de Intro.js (no modifica package.json)
  private cssUrl = 'https://unpkg.com/intro.js/minified/introjs.min.css';
  private jsUrl = 'https://unpkg.com/intro.js/minified/intro.min.js';

  constructor() {}

  private ensureLoaded(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      try {
        // Agregar CSS
        if (!document.querySelector(`link[href="${this.cssUrl}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = this.cssUrl;
          document.head.appendChild(link);
        }

        // Agregar script
        if (!document.querySelector(`script[src="${this.jsUrl}"]`)) {
          const script = document.createElement('script');
          script.src = this.jsUrl;
          script.async = true;
          script.onload = () => {
            this.loaded = true;
            resolve();
          };
          script.onerror = (e) => reject(e);
          document.body.appendChild(script);
        } else {
          // script ya presente: esperar un tick
          setTimeout(() => { this.loaded = true; resolve(); }, 50);
        }
      } catch (err) {
        reject(err);
      }
    });

    return this.loadPromise;
  }

  // Inicia un tour y marca que ya se mostró (localStorage)
  async startTourOnce(tourId: string, steps: AyudaStep[], options: any = {}) {
    try {
      const key = this.storageKey(tourId);
      if (localStorage.getItem(key) === '1') return;
      await this.startTour(tourId, steps, options);
      localStorage.setItem(key, '1');
    } catch (e) {
      // No bloquear la app por problemas de ayuda
      console.warn('AyudaService.startTourOnce error', e);
    }
  }

  async startTour(tourId: string, steps: AyudaStep[], options: any = {}) {
    await this.ensureLoaded();

    const introFactory = window.introJs || (window as any).introJs;
    if (!introFactory) {
      console.warn('Intro.js no disponible');
      return;
    }

    const intro = introFactory();

    // Mapear pasos al formato de intro.js
    const introSteps = (steps || []).map(s => {
      const step: any = { intro: s.intro };
      if (s.element) step.element = document.querySelector(s.element) || undefined;
      if (s.position) step.position = s.position;
      return step;
    });

    intro.setOptions({ steps: introSteps, ...options });
    try {
      await intro.start();
    } catch (e) {
      // intro.js puede lanzar si hay pasos inválidos; ignorar
      console.warn('Intro.js start error', e);
    }
  }

  resetTour(tourId: string) {
    localStorage.removeItem(this.storageKey(tourId));
  }

  private storageKey(id: string) { return `innoad_tour_shown_${id}`; }
}
