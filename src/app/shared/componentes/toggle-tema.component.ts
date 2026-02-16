import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemaServicio } from '@core/servicios/tema.servicio';

@Component({
  selector: 'app-toggle-tema',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="toggle-tema"
      (click)="alternarTema()"
      [title]="tema() === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'"
      attr.aria-label="Alternar tema"
    >
      @if (tema() === 'light') {
        🌙 <!-- Luna para modo oscuro -->
      } @else {
        ☀️ <!-- Sol para modo claro -->
      }
    </button>
  `,
  styles: [`
    .toggle-tema {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: var(--bg-secondary, rgba(0, 0, 0, 0.1));
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    :host-context(.dark-mode) .toggle-tema {
      color: #ffd700;

      &:hover {
        background-color: rgba(255, 215, 0, 0.1);
      }
    }

    :host-context(:not(.dark-mode)) .toggle-tema {
      color: #ff8c00;

      &:hover {
        background-color: rgba(255, 140, 0, 0.1);
      }
    }
  `]
})
export class ToggleTemaComponent {
  private temaServicio = inject(TemaServicio);

  tema = this.temaServicio.tema$;

  alternarTema(): void {
    this.temaServicio.alternarTema();
  }
}
