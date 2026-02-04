/**
 * 🎨 DIRECTIVA DE ANIMACIONES PROFESIONALES
 * Aplica animaciones a elementos automáticamente
 * Uso: <div appAnimacion="fadeIn"></div>
 */

import { Directive, ElementRef, Input, OnInit } from '@angular/core';

type AnimacionType = 
  | 'fadeIn' 
  | 'slideInDown' 
  | 'slideInUp' 
  | 'slideInLeft' 
  | 'slideInRight' 
  | 'pulse' 
  | 'spin' 
  | 'bounce'
  | 'none';

@Directive({
  selector: '[appAnimacion]',
  standalone: true,
})
export class AnimacionDirective implements OnInit {
  @Input() appAnimacion: AnimacionType = 'fadeIn';
  @Input() duracion: number = 300; // ms
  @Input() retraso: number = 0; // ms

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const elemento = this.el.nativeElement;

    // Aplicar duración y retraso
    elemento.style.animationDuration = `${this.duracion}ms`;
    elemento.style.animationDelay = `${this.retraso}ms`;

    // Aplicar animación
    if (this.appAnimacion !== 'none') {
      elemento.style.animation = `${this.appAnimacion} ${this.duracion}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    }

    // Inyectar keyframes si es necesario
    this.inyectarKeyframes();
  }

  private inyectarKeyframes() {
    const style = document.createElement('style');
    const animaciones = {
      fadeIn: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `,
      slideInDown: `
        @keyframes slideInDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `,
      slideInUp: `
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `,
      slideInLeft: `
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `,
      slideInRight: `
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `,
      spin: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `,
      bounce: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `,
    };

    if (animaciones[this.appAnimacion]) {
      style.textContent = animaciones[this.appAnimacion];
      document.head.appendChild(style);
    }
  }
}

/**
 * 🎨 DIRECTIVA PARA HOVER EFFECTS
 * Uso: <div appHoverEfecto="lift"></div>
 */

type EfectoHover = 'lift' | 'glow' | 'scale' | 'underline' | 'colorShift';

@Directive({
  selector: '[appHoverEfecto]',
  standalone: true,
})
export class HoverEfectoDirective implements OnInit {
  @Input() appHoverEfecto: EfectoHover = 'lift';
  @Input() intensidad: number = 1;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const elemento = this.el.nativeElement;

    switch (this.appHoverEfecto) {
      case 'lift':
        elemento.style.cursor = 'pointer';
        elemento.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
        elemento.addEventListener('mouseenter', () => {
          elemento.style.transform = `translateY(-${5 * this.intensidad}px)`;
          elemento.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.2)';
        });
        elemento.addEventListener('mouseleave', () => {
          elemento.style.transform = 'translateY(0)';
          elemento.style.boxShadow = 'none';
        });
        break;

      case 'glow':
        elemento.style.cursor = 'pointer';
        elemento.style.transition = 'all 300ms';
        elemento.addEventListener('mouseenter', () => {
          elemento.style.boxShadow = `0 0 20px rgba(79, 70, 229, ${0.5 * this.intensidad})`;
        });
        elemento.addEventListener('mouseleave', () => {
          elemento.style.boxShadow = 'none';
        });
        break;

      case 'scale':
        elemento.style.cursor = 'pointer';
        elemento.style.transition = 'all 300ms';
        elemento.addEventListener('mouseenter', () => {
          elemento.style.transform = `scale(${1 + 0.05 * this.intensidad})`;
        });
        elemento.addEventListener('mouseleave', () => {
          elemento.style.transform = 'scale(1)';
        });
        break;

      case 'underline':
        elemento.style.position = 'relative';
        const underline = document.createElement('div');
        underline.style.position = 'absolute';
        underline.style.bottom = '-2px';
        underline.style.left = '0';
        underline.style.width = '0';
        underline.style.height = '2px';
        underline.style.background = 'linear-gradient(135deg, #4F46E5, #A855F7)';
        underline.style.transition = 'width 300ms';
        elemento.appendChild(underline);

        elemento.addEventListener('mouseenter', () => {
          underline.style.width = '100%';
        });
        elemento.addEventListener('mouseleave', () => {
          underline.style.width = '0';
        });
        break;

      case 'colorShift':
        elemento.style.cursor = 'pointer';
        elemento.style.transition = 'all 300ms';
        const originalColor = elemento.style.color || 'currentColor';
        elemento.addEventListener('mouseenter', () => {
          elemento.style.color = '#A855F7';
        });
        elemento.addEventListener('mouseleave', () => {
          elemento.style.color = originalColor;
        });
        break;
    }
  }
}

/**
 * 🎨 DIRECTIVA PARA TRANSICIONES SUAVES
 * Uso: <div appTransicion="normal"></div>
 */

type TransicionType = 'rapida' | 'normal' | 'lenta' | 'suave';

@Directive({
  selector: '[appTransicion]',
  standalone: true,
})
export class TransicionDirective implements OnInit {
  @Input() appTransicion: TransicionType = 'normal';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const duraciones = {
      rapida: '150ms',
      normal: '300ms',
      lenta: '500ms',
      suave: '300ms',
    };

    const elemento = this.el.nativeElement;
    elemento.style.transition = `all ${duraciones[this.appTransicion]} cubic-bezier(0.4, 0, 0.2, 1)`;
  }
}
