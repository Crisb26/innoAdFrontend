/**
 * 🎨 SERVICIO DE UTILIDADES DE ESTILO
 * Proporciona métodos para aplicar estilos dinámicamente
 */

import { Injectable } from '@angular/core';
import { coloresInnoAd, transiciones, espaciado, borderRadius } from '../config/colores.config';

@Injectable({
  providedIn: 'root',
})
export class EstiloService {
  /**
   * Obtiene un color de la paleta
   */
  obtenerColor(nombre: keyof typeof coloresInnoAd): string {
    return coloresInnoAd[nombre] || '#4F46E5';
  }

  /**
   * Obtiene una transición
   */
  obtenerTransicion(tipo: 'fast' | 'normal' | 'slow' | 'suave'): string {
    return transiciones[tipo];
  }

  /**
   * Obtiene espaciado
   */
  obtenerEspaciado(tamano: keyof typeof espaciado): string {
    return espaciado[tamano];
  }

  /**
   * Obtiene border radius
   */
  obtenerRadio(tamano: keyof typeof borderRadius): string {
    return borderRadius[tamano];
  }

  /**
   * Aplicar gradiente a un elemento
   */
  aplicarGradiente(elemento: HTMLElement, tipo: 'indigo' | 'purple' | 'pink' | 'completo'): void {
    const gradientes = {
      indigo: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
      purple: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
      pink: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      completo: coloresInnoAd.gradientPrincipal,
    };

    elemento.style.background = gradientes[tipo];
  }

  /**
   * Aplicar sombra neon a un elemento
   */
  aplicarSombraNeon(elemento: HTMLElement, color: 'indigo' | 'purple' | 'pink'): void {
    const sombras = {
      indigo: coloresInnoAd.sombra.indigo,
      purple: coloresInnoAd.sombra.purple,
      pink: coloresInnoAd.sombra.pink,
    };

    elemento.style.boxShadow = sombras[color];
  }

  /**
   * Aplicar animación a un elemento
   */
  aplicarAnimacion(
    elemento: HTMLElement,
    animacion: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'pulse' | 'spin',
    duracion: number = 300
  ): void {
    elemento.style.animation = `${animacion} ${duracion}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`;
  }

  /**
   * Remover animación
   */
  removerAnimacion(elemento: HTMLElement): void {
    elemento.style.animation = 'none';
  }

  /**
   * Aplicar efecto de hover lift
   */
  aplicarHoverLift(elemento: HTMLElement, intesidad: number = 5): void {
    elemento.addEventListener('mouseenter', () => {
      elemento.style.transform = `translateY(-${intesidad}px)`;
      elemento.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.2)';
    });

    elemento.addEventListener('mouseleave', () => {
      elemento.style.transform = 'translateY(0)';
      elemento.style.boxShadow = 'none';
    });
  }

  /**
   * Aplicar efecto de hover glow
   */
  aplicarHoverGlow(elemento: HTMLElement, color: 'indigo' | 'purple' | 'pink' = 'indigo'): void {
    const colores = {
      indigo: 'rgba(79, 70, 229, 0.5)',
      purple: 'rgba(168, 85, 247, 0.5)',
      pink: 'rgba(236, 72, 153, 0.5)',
    };

    elemento.addEventListener('mouseenter', () => {
      elemento.style.boxShadow = `0 0 20px ${colores[color]}`;
    });

    elemento.addEventListener('mouseleave', () => {
      elemento.style.boxShadow = 'none';
    });
  }

  /**
   * Aplicar tema oscuro/claro
   */
  aplicarTema(tema: 'light' | 'dark' | 'premium'): void {
    const elemento = document.documentElement;

    const temas = {
      light: {
        '--bg-principal': '#FFFFFF',
        '--texto': '#111827',
        '--borde': '#E5E7EB',
      },
      dark: {
        '--bg-principal': '#0F172A',
        '--texto': '#E2E8F0',
        '--borde': '#334155',
      },
      premium: {
        '--bg-principal': 'linear-gradient(135deg, #0F172A, #1E293B)',
        '--texto': '#CBD5E1',
        '--borde': 'rgba(148, 163, 184, 0.2)',
      },
    };

    Object.keys(temas[tema]).forEach((propiedad) => {
      elemento.style.setProperty(propiedad, temas[tema][propiedad]);
    });
  }

  /**
   * Obtener color basado en estado
   */
  colorPorEstado(estado: 'success' | 'error' | 'warning' | 'info' | 'loading'): string {
    const colores = {
      success: coloresInnoAd.success,
      error: coloresInnoAd.error,
      warning: coloresInnoAd.warning,
      info: coloresInnoAd.info,
      loading: coloresInnoAd.indigo,
    };

    return colores[estado];
  }

  /**
   * Crear clase CSS dinámicamente
   */
  crearClaseCSS(nombre: string, estilos: Record<string, string>): void {
    const style = document.createElement('style');
    let css = `.${nombre} {`;

    Object.keys(estilos).forEach((propiedad) => {
      const propiedad_css = propiedad.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `${propiedad_css}: ${estilos[propiedad]};`;
    });

    css += '}';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Calcular tamaño responsive
   */
  calcularResponsivo(
    base: number,
    movil: number = base * 0.8,
    tablet: number = base * 0.9,
    desktop: number = base
  ): Record<string, string> {
    return {
      '@media (max-width: 480px)': `font-size: ${movil}px;`,
      '@media (min-width: 768px)': `font-size: ${tablet}px;`,
      '@media (min-width: 1024px)': `font-size: ${desktop}px;`,
    };
  }

  /**
   * Aplicar paleta de colores a un elemento
   */
  aplicarPaleta(elemento: HTMLElement, tipo: 'indigo' | 'purple' | 'pink' | 'completo'): void {
    const paletas = {
      indigo: {
        '--color-primario': coloresInnoAd.indigo,
        '--color-light': coloresInnoAd.indigoLight,
        '--color-dark': coloresInnoAd.indigoDark,
      },
      purple: {
        '--color-primario': coloresInnoAd.purple,
        '--color-light': coloresInnoAd.purpleLight,
        '--color-dark': coloresInnoAd.purpleDark,
      },
      pink: {
        '--color-primario': coloresInnoAd.pink,
        '--color-light': coloresInnoAd.pinkLight,
        '--color-dark': coloresInnoAd.pinkDark,
      },
      completo: {
        '--color-indigo': coloresInnoAd.indigo,
        '--color-purple': coloresInnoAd.purple,
        '--color-pink': coloresInnoAd.pink,
      },
    };

    Object.keys(paletas[tipo]).forEach((propiedad) => {
      elemento.style.setProperty(propiedad, paletas[tipo][propiedad]);
    });
  }

  /**
   * Generar clase de botón dinámicamente
   */
  generarClaseBtnProfesional(tipo: 'primario' | 'secundario' | 'success' | 'error'): string {
    const clase = `btn-${tipo}-${Date.now()}`;

    const estilos = {
      primario: `
        background: linear-gradient(135deg, #4F46E5 0%, #A855F7 100%);
        color: #FFFFFF;
        padding: 0.875rem 1.75rem;
        border: none;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3);
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      `,
      secundario: `
        background: transparent;
        color: #A855F7;
        padding: 0.875rem 1.75rem;
        border: 2px solid #A855F7;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      `,
      success: `
        background: #10B981;
        color: #FFFFFF;
        padding: 0.875rem 1.75rem;
        border: none;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 300ms;
      `,
      error: `
        background: #EF4444;
        color: #FFFFFF;
        padding: 0.875rem 1.75rem;
        border: none;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 300ms;
      `,
    };

    const style = document.createElement('style');
    style.textContent = `.${clase} { ${estilos[tipo]} }`;
    document.head.appendChild(style);

    return clase;
  }
}
