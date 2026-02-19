import { Component, inject, OnInit } from '@angular/core';
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
        <span class="icon-sol">☀️</span>
      } @else {
        <span class="icon-luna">🌙</span>
      }
    </button>
  `,
  styles: [`
    .toggle-tema {
      background: none;
      border: 2px solid var(--color-primario, #00d4ff);
      font-size: 20px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);

      &:hover {
        background-color: rgba(0, 212, 255, 0.1);
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }

      .icon-sol {
        animation: rotateSol 0.6s ease-out;
      }

      .icon-luna {
        animation: rotateLuna 0.6s ease-out;
      }
    }

    @keyframes rotateSol {
      from {
        transform: rotate(-180deg);
        opacity: 0;
      }
      to {
        transform: rotate(0deg);
        opacity: 1;
      }
    }

    @keyframes rotateLuna {
      from {
        transform: rotate(180deg);
        opacity: 0;
      }
      to {
        transform: rotate(0deg);
        opacity: 1;
      }
    }
  `]
})
export class ToggleTemaComponent implements OnInit {
  private temaServicio = inject(TemaServicio);

  tema = this.temaServicio.tema$;

  ngOnInit(): void {
    // Inicializar tema al cargar
    const temaGuardado = localStorage.getItem('tema-innoad');
    if (temaGuardado) {
      this.temaServicio.establecerTema(temaGuardado as 'light' | 'dark');
    }
  }

  alternarTema(): void {
    this.temaServicio.alternarTema();
  }
}
