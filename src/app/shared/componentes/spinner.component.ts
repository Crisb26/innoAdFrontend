import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type TamanioSpinner = 'pequeno' | 'mediano' | 'grande';
type TipoSpinner = 'indigo' | 'purple' | 'pink' | 'multi';

/**
 * Componente de Spinner Premium
 * Múltiples estilos y tamaños
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contenedor-spinner" [class]="'spinner-' + tipo() + ' ' + 'spinner-' + tamanio()">
      @switch (tipo()) {
        @case ('indigo') {
          <div class="spinner-indigo"></div>
        }
        @case ('purple') {
          <div class="spinner-purple"></div>
        }
        @case ('pink') {
          <div class="spinner-pink"></div>
        }
        @case ('multi') {
          <div class="spinner-multi">
            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
          </div>
        }
      }
      
      @if (mostrarTexto()) {
        <p class="texto-spinner">{{ textoSpinner() }}</p>
      }
    </div>
  `,
  styles: [`
    .contenedor-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
    
    .texto-spinner {
      color: #cbd5e1;
      font-size: 0.95em;
      text-align: center;
      margin: 0;
      animation: pulse 2s ease-in-out infinite;
    }
    
    /* TAMAÑOS */
    .spinner-pequeno {
      --spinner-size: 30px;
    }
    
    .spinner-mediano {
      --spinner-size: 50px;
    }
    
    .spinner-grande {
      --spinner-size: 80px;
    }
    
    /* ESTILOS */
    
    /* Spinner Índigo */
    .spinner-indigo .spinner-indigo {
      width: var(--spinner-size);
      height: var(--spinner-size);
      border: 4px solid rgba(79, 70, 229, 0.2);
      border-top-color: #4F46E5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    /* Spinner Púrpura */
    .spinner-purple .spinner-purple {
      width: var(--spinner-size);
      height: var(--spinner-size);
      border: 4px solid rgba(168, 85, 247, 0.2);
      border-top-color: #A855F7;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    /* Spinner Rosa */
    .spinner-pink .spinner-pink {
      width: var(--spinner-size);
      height: var(--spinner-size);
      border: 4px solid rgba(236, 72, 153, 0.2);
      border-top-color: #EC4899;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    /* Spinner Multi - Anillos concéntricos */
    .spinner-multi {
      position: relative;
      width: var(--spinner-size);
      height: var(--spinner-size);
    }
    
    .spinner-multi .ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-radius: 50%;
      animation: spin 2s linear infinite;
    }
    
    .spinner-multi .ring-1 {
      border-top-color: #4F46E5;
      border-right-color: #4F46E5;
    }
    
    .spinner-multi .ring-2 {
      width: calc(var(--spinner-size) * 0.65);
      height: calc(var(--spinner-size) * 0.65);
      top: calc((var(--spinner-size) * 0.35) / 2);
      left: calc((var(--spinner-size) * 0.35) / 2);
      border-top-color: #A855F7;
      border-left-color: #A855F7;
      animation: spin 1.5s linear infinite reverse;
    }
    
    .spinner-multi .ring-3 {
      width: calc(var(--spinner-size) * 0.35);
      height: calc(var(--spinner-size) * 0.35);
      top: calc((var(--spinner-size) * 0.65) / 2);
      left: calc((var(--spinner-size) * 0.65) / 2);
      border-top-color: #EC4899;
      border-right-color: #EC4899;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 0.6;
      }
      50% {
        opacity: 1;
      }
    }
  `]
})
export class SpinnerComponent {
  @Input() tamanio = signal<TamanioSpinner>('mediano');
  @Input() tipo = signal<TipoSpinner>('multi');
  @Input() mostrarTexto = signal(true);
  @Input() textoSpinner = signal('Cargando...');
}
