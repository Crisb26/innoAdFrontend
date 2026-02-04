import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagina-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mantenimiento-page">
      <div class="mantenimiento-content">
        <div class="icon">🔧</div>
        
        <h1>Estamos en Mantenimiento</h1>
        
        <p class="subtitle">
          Disculpa las molestias. Estamos realizando actualizaciones para mejorar tu experiencia.
        </p>
        
        <div class="details">
          <p>
            <strong>¿Qué está pasando?</strong><br/>
            Nuestro equipo está trabajando para optimizar la plataforma y agregar nuevas funcionalidades.
          </p>
          
          <p>
            <strong>¿Cuándo volveremos?</strong><br/>
            Esperamos estar de vuelta en breve. Te notificaremos cuando todo esté listo.
          </p>
        </div>
        
        <div class="footer">
          <p>Si tienes alguna pregunta, contacta a: <strong>support&#64;innoad.com</strong></p>
          <p class="reload-info">
            <em>Actualiza la página en unos minutos para ver si ya estamos disponibles.</em>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mantenimiento-page {
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .mantenimiento-content {
      background: white;
      border-radius: 16px;
      padding: 3rem 2rem;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      animation: rotate 3s infinite linear;
    }

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin: 0 0 1rem 0;
      font-weight: 600;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .details {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
      text-align: left;
    }

    .details p {
      margin: 1rem 0;
      color: #555;
      line-height: 1.6;
    }

    .details strong {
      color: #333;
      display: block;
      margin-bottom: 0.5rem;
    }

    .footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
      color: #888;
      font-size: 0.95rem;
    }

    .footer p {
      margin: 0.5rem 0;
    }

    .reload-info {
      margin-top: 1rem !important;
      font-style: italic;
      color: #aaa;
    }

    @media (max-width: 600px) {
      .mantenimiento-content {
        padding: 2rem 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .icon {
        font-size: 3rem;
      }
    }
  `]
})
export class PaginaMantenimientoComponent {}
