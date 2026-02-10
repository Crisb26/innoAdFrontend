import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GuiaServicio {
  private introLoaded = false;

  private loadCss(href: string): Promise<void> {
    return new Promise((res, rej) => {
      if (document.querySelector(`link[href="${href}"]`)) return res();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => res();
      link.onerror = (e) => rej(e);
      document.head.appendChild(link);
    });
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => res();
      s.onerror = (e) => rej(e);
      document.body.appendChild(s);
    });
  }

  async ensureIntroJs(): Promise<void> {
    if (this.introLoaded) return;

    const css = 'https://unpkg.com/intro.js/minified/introjs.min.css';
    const js = 'https://unpkg.com/intro.js/minified/intro.min.js';

    await this.loadCss(css);
    await this.loadScript(js);

    this.introLoaded = true;
  }

  async startTour(steps: Array<any>): Promise<void> {
    try {
      await this.ensureIntroJs();

      const introJs = (window as any).introJs;
      if (!introJs) return;

      const instance = introJs();
      instance.setOptions({ steps, showBullets: true, exitOnOverlayClick: true, nextLabel: 'Siguiente', prevLabel: 'Anterior', doneLabel: 'Finalizar' });
      instance.start();
    } catch (e) {
      console.warn('No se pudo iniciar la guía (intro.js):', e);
    }
  }
}
