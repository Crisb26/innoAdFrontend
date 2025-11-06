import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contenedor-mantenimiento">
      <div class="fondo-animado">
        <div class="circulo circulo-1"></div>
        <div class="circulo circulo-2"></div>
        <div class="circulo circulo-3"></div>
      </div>

      <div class="tarjeta-mantenimiento">
        <div class="logo-animado">
          <svg class="icono-engranaje" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m4.22-13a10 10 0 0 1 0 14M7.78 3a10 10 0 0 0 0 14m9.9-11.31 4.24-4.24m-14.14 0L3.54 5.69m14.14 14.14 4.24 4.24m-14.14 0-4.24-4.24"></path>
          </svg>
          <div class="logo-texto">
            <h1>InnoAd</h1>
          </div>
        </div>

        <h2 class="titulo-principal">Sistema en Mantenimiento</h2>
        <p class="mensaje-principal">Estamos realizando mejoras para ofrecerte una mejor experiencia</p>

        <div class="barra-progreso">
          <div class="barra-progreso-fill"></div>
        </div>

        <div class="info-contacto">
          <p class="subtexto">Tiempo estimado: 30 minutos</p>
          <div class="contacto-items">
            <div class="contacto-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>soporte&#64;innoad.com</span>
            </div>
            <div class="contacto-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>

        <p class="mensaje-final">Gracias por tu paciencia</p>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
      padding: 2rem;
    }

    .fondo-animado {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
    }

    .circulo {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: flotar 20s infinite ease-in-out;
    }

    .circulo-1 {
      width: 300px;
      height: 300px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    .circulo-2 {
      width: 200px;
      height: 200px;
      top: 60%;
      right: 15%;
      animation-delay: 5s;
    }

    .circulo-3 {
      width: 250px;
      height: 250px;
      bottom: 10%;
      left: 50%;
      animation-delay: 10s;
    }

    @keyframes flotar {
      0%, 100% {
        transform: translateY(0) scale(1);
        opacity: 0.3;
      }
      50% {
        transform: translateY(-50px) scale(1.1);
        opacity: 0.6;
      }
    }

    .tarjeta-mantenimiento {
      max-width: 600px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
      animation: aparecer 0.6s ease-out;
    }

    @keyframes aparecer {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo-animado {
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .icono-engranaje {
      color: #667eea;
      animation: girar 4s linear infinite;
      filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
    }

    @keyframes girar {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .logo-texto h1 {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .titulo-principal {
      font-size: 2rem;
      color: #2d3748;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .mensaje-principal {
      color: #718096;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .barra-progreso {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin: 2rem 0;
    }

    .barra-progreso-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 10px;
      animation: progreso 2s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
    }

    @keyframes progreso {
      0% {
        width: 0%;
      }
      50% {
        width: 70%;
      }
      100% {
        width: 100%;
      }
    }

    .info-contacto {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .subtexto {
      color: #718096;
      margin-bottom: 1rem;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .contacto-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .contacto-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #667eea;
      font-size: 0.9rem;
      justify-content: center;
    }

    .contacto-item svg {
      color: #667eea;
    }

    .contacto-item span {
      color: #2d3748;
      font-weight: 500;
    }

    .mensaje-final {
      color: #718096;
      font-size: 1rem;
      margin-top: 1.5rem;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .contenedor-mantenimiento {
        padding: 1rem;
      }

      .tarjeta-mantenimiento {
        padding: 2rem 1.5rem;
      }

      .icono-engranaje {
        width: 80px;
        height: 80px;
      }

      .logo-texto h1 {
        font-size: 2rem;
      }

      .titulo-principal {
        font-size: 1.5rem;
      }

      .circulo {
        display: none;
      }
    }
  `]
})
export class MantenimientoComponent {}
