import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contenedor-mantenimiento">
      <div class="tarjeta-mantenimiento">
        <h1 class="titulo-mantenimiento">🔧</h1>
        <h2>Sistema en Mantenimiento</h2>
        <p>Estamos realizando mejoras en el sistema.</p>
        <p class="subtexto">Volveremos pronto...</p>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-mantenimiento {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .tarjeta-mantenimiento {
      max-width: 500px;
    }

    .titulo-mantenimiento {
      font-size: 5rem;
      margin-bottom: 1rem;
    }

    .subtexto {
      color: #b4b8d0;
      margin-top: 1rem;
    }
  `]
})
export class MantenimientoComponent {}
