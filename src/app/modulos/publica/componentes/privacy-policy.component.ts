import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <header class="legal-header">
        <h1>Política de Privacidad</h1>
        <p class="ultima-actualizacion">Última actualización: 2 de enero de 2026</p>
      </header>

      <main class="legal-content">
        <section>
          <h2>1. Introducción</h2>
          <p>
            InnoAd ("nosotros", "nuestro", "nos") respeta la privacidad de nuestros usuarios.
            Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información.
          </p>
        </section>

        <section>
          <h2>2. Información que Recopilamos</h2>
          <p>Recopilamos información que proporcionas directamente, incluyendo:</p>
          <ul>
            <li><strong>Información de Registro:</strong> Nombre, email, empresa, teléfono</li>
            <li><strong>Información de Perfil:</strong> Foto de perfil, biografía, ubicación</li>
            <li><strong>Contenido:</strong> Anuncios, descripciones, archivos que subes</li>
            <li><strong>Información de Pago:</strong> Datos de tarjeta (procesados de forma segura)</li>
          </ul>
          <p>También recopilamos automáticamente:</p>
          <ul>
            <li><strong>Datos de Uso:</strong> Cómo interactúas con nuestro servicio</li>
            <li><strong>Datos de Dispositivo:</strong> Tipo de dispositivo, SO, navegador</li>
            <li><strong>Datos de Ubicación:</strong> Ubicación aproximada basada en IP</li>
            <li><strong>Cookies y Tecnologías similares</strong></li>
          </ul>
        </section>

        <section>
          <h2>3. Cómo Usamos Tu Información</h2>
          <p>Usamos tu información para:</p>
          <ul>
            <li>Proporcionar, mantener y mejorar nuestros servicios</li>
            <li>Procesar transacciones y enviar información relacionada</li>
            <li>Enviar comunicaciones marketing (puedes optar por no recibir)</li>
            <li>Responder a tus solicitudes y preguntas</li>
            <li>Personalizar tu experiencia</li>
            <li>Analizar tendencias y uso del servicio</li>
            <li>Cumplir con obligaciones legales</li>
            <li>Mejorar la seguridad y prevenir fraude</li>
          </ul>
        </section>

        <section>
          <h2>4. Compartición de Información</h2>
          <p>
            No vendemos tu información personal. Podemos compartirla solo en estos casos:
          </p>
          <ul>
            <li><strong>Proveedores de Servicios:</strong> Para procesar pagos, enviar emails, etc.</li>
            <li><strong>Análisis:</strong> Con herramientas como Google Analytics (sin identificación)</li>
            <li><strong>Por Ley:</strong> Si es requerido por autoridades legales</li>
            <li><strong>Seguridad:</strong> Para prevenir fraude o proteger derechos</li>
            <li><strong>Cambio de Control:</strong> En caso de venta o fusión</li>
          </ul>
        </section>

        <section>
          <h2>5. Seguridad de Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información:
          </p>
          <ul>
            <li>Encriptación SSL/TLS para datos en tránsito</li>
            <li>Almacenamiento encriptado de datos sensibles</li>
            <li>Firewalls y sistemas de detección de intrusiones</li>
            <li>Acceso limitado a información personal</li>
            <li>Auditorías de seguridad regulares</li>
          </ul>
          <p>
            Sin embargo, ningún método de transmisión es 100% seguro.
            No podemos garantizar seguridad absoluta.
          </p>
        </section>

        <section>
          <h2>6. Derechos de Privacidad</h2>
          <p>
            Dependiendo de tu ubicación, tienes derechos que incluyen:
          </p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar qué datos tenemos sobre ti</li>
            <li><strong>Corrección:</strong> Actualizar información inexacta</li>
            <li><strong>Eliminación:</strong> Solicitar borrar tus datos (con excepciones)</li>
            <li><strong>Portabilidad:</strong> Obtener tus datos en formato portable</li>
            <li><strong>Consentimiento:</strong> Retirar consentimiento en cualquier momento</li>
          </ul>
          <p>
            Para ejercer estos derechos, contáctanos en privacy@innoad.com
          </p>
        </section>

        <section>
          <h2>7. Retención de Datos</h2>
          <p>
            Retenemos tu información mientras tu cuenta esté activa o según sea necesario para proporcionar servicios.
            Puedes solicitar la eliminación de tu cuenta en cualquier momento.
            Algunos datos pueden retenerse por razones legales o de cumplimiento.
          </p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            InnoAd usa cookies para mejorar tu experiencia:
          </p>
          <ul>
            <li><strong>Esenciales:</strong> Necesarias para funcionalidad básica</li>
            <li><strong>Preferencias:</strong> Recuerdan tus configuraciones</li>
            <li><strong>Analytics:</strong> Nos ayudan a entender cómo usas el servicio</li>
            <li><strong>Marketing:</strong> Para mostrar anuncios relevantes</li>
          </ul>
          <p>
            Puedes controlar cookies en la configuración de tu navegador.
            Desactivarlas puede afectar la funcionalidad.
          </p>
        </section>

        <section>
          <h2>9. Comunicaciones Marketing</h2>
          <p>
            Podemos enviarte emails sobre nuevas características, promociones y actualizaciones.
            Puedes desuscribirte haciendo clic en el enlace "Desuscribir" en cualquier email.
          </p>
        </section>

        <section>
          <h2>10. Cambios en esta Política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad en cualquier momento.
            La fecha de última actualización está en la parte superior.
            El uso continuado del servicio implica aceptación de cambios.
          </p>
        </section>

        <section>
          <h2>11. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta Política de Privacidad, contáctanos:
          </p>
          <ul>
            <li>Email: privacy@innoad.com</li>
            <li>Teléfono: [Tu Teléfono]</li>
            <li>Dirección: [Tu Dirección]</li>
          </ul>
        </section>

        <section>
          <h2>12. Cumplimiento con Regulaciones</h2>
          <p>
            InnoAd cumple con regulaciones de privacidad incluyendo:
          </p>
          <ul>
            <li>GDPR (Unión Europea)</li>
            <li>CCPA (California, USA)</li>
            <li>PIPEDA (Canadá)</li>
            <li>Leyes locales de protección de datos</li>
          </ul>
        </section>
      </main>

      <footer class="legal-footer">
        <button class="btn-volver" (click)="volver()">← Volver</button>
      </footer>
    </div>
  `,
  styles: [`
    .legal-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .legal-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .legal-header h1 {
      color: #0066cc;
      margin-bottom: 0.5rem;
    }

    .ultima-actualizacion {
      color: #666;
      font-size: 0.9rem;
    }

    .legal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      line-height: 1.8;
    }

    section {
      margin-bottom: 2rem;
    }

    h2 {
      color: #0066cc;
      border-bottom: 2px solid #0066cc;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }

    p {
      color: #333;
      text-align: justify;
    }

    ul {
      margin-left: 2rem;
      color: #333;
    }

    li {
      margin: 0.5rem 0;
    }

    strong {
      color: #0052a3;
    }

    .legal-footer {
      text-align: center;
      margin-top: 2rem;
    }

    .btn-volver {
      padding: 0.75rem 1.5rem;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .btn-volver:hover {
      background: #0052a3;
    }

    @media (max-width: 768px) {
      .legal-container {
        padding: 1rem;
      }

      .legal-content {
        padding: 1rem;
      }

      h2 {
        font-size: 1.2rem;
      }

      p {
        text-align: left;
      }
    }
  `]
})
export class PrivacyPolicyComponent {
  volver(): void {
    window.history.back();
  }
}
