import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <header class="legal-header">
        <h1>Términos y Condiciones</h1>
        <p class="ultima-actualizacion">Última actualización: 2 de enero de 2026</p>
      </header>

      <main class="legal-content">
        <section>
          <h2>1. Aceptación de Términos</h2>
          <p>
            Al acceder y utilizar InnoAd, aceptas estar vinculado por estos términos y condiciones.
            Si no estás de acuerdo con alguna parte de estos términos, por favor no uses nuestra plataforma.
          </p>
        </section>

        <section>
          <h2>2. Descripción del Servicio</h2>
          <p>
            InnoAd es una plataforma integral de gestión de publicidad con inteligencia artificial que permite:
          </p>
          <ul>
            <li>Crear y gestionar campañas publicitarias</li>
            <li>Generar contenido automático con IA</li>
            <li>Analizar rendimiento en tiempo real</li>
            <li>Optimizar targeting y presupuestos</li>
            <li>Acceso a reportes y métricas detalladas</li>
          </ul>
        </section>

        <section>
          <h2>3. Registro de Cuenta</h2>
          <p>
            Para usar InnoAd, debes crear una cuenta con información precisa y actualizada. Eres responsable de:
          </p>
          <ul>
            <li>Mantener la confidencialidad de tu contraseña</li>
            <li>Ser responsable de toda actividad en tu cuenta</li>
            <li>Notificarnos inmediatamente de acceso no autorizado</li>
          </ul>
        </section>

        <section>
          <h2>4. Contenido del Usuario</h2>
          <p>
            Eres responsable de todo contenido que subas a InnoAd, incluyendo anuncios, descripciones y creatividades.
            Garantizas que:
          </p>
          <ul>
            <li>Tienes todos los derechos sobre el contenido</li>
            <li>El contenido cumple con leyes aplicables</li>
            <li>No viola derechos de terceros</li>
            <li>No contiene material ilegal, fraudulento o dañino</li>
          </ul>
        </section>

        <section>
          <h2>5. Pagos y Facturación</h2>
          <p>
            Los planes de InnoAd están sujetos a los siguientes términos de pago:
          </p>
          <ul>
            <li>Se cobra al inicio de cada período de facturación</li>
            <li>Puedes cambiar de plan en cualquier momento</li>
            <li>Primer mes con 50% de descuento (nuevo usuarios)</li>
            <li>No hay reembolso por uso parcial del mes</li>
            <li>InnoAd puede cambiar precios con 30 días de aviso</li>
          </ul>
        </section>

        <section>
          <h2>6. Límites de Responsabilidad</h2>
          <p>
            En la medida permitida por la ley, InnoAd no será responsable por daños indirectos, incidentales,
            especiales o consecuentes. La responsabilidad total no excederá el monto pagado en los últimos 12 meses.
          </p>
        </section>

        <section>
          <h2>7. Cambios en el Servicio</h2>
          <p>
            InnoAd puede modificar, suspender o descontinuar servicios en cualquier momento.
            Te notificaremos de cambios materiales con 30 días de anticipación.
          </p>
        </section>

        <section>
          <h2>8. Cancelación de Cuenta</h2>
          <p>
            Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil.
            Después de la cancelación, no podrás acceder a tu cuenta ni a los datos asociados.
          </p>
        </section>

        <section>
          <h2>9. Propiedad Intelectual</h2>
          <p>
            InnoAd y todo su contenido, características y funcionalidad son propiedad exclusiva de nuestros desarrolladores.
            No está permitido reproducir, distribuir o modificar contenido sin autorización previa.
          </p>
        </section>

        <section>
          <h2>10. Ley Aplicable</h2>
          <p>
            Estos términos se regirán por las leyes de [Tu Jurisdicción] sin considerar conflictos de ley.
            Cualquier disputa será resuelta en los tribunales competentes.
          </p>
        </section>

        <section>
          <h2>11. Contacto</h2>
          <p>
            Para preguntas sobre estos términos, contáctanos:
          </p>
          <ul>
            <li>Email: legal@innoad.com</li>
            <li>Teléfono: [Tu Teléfono]</li>
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
export class TerminosCondicionesComponent {
  volver(): void {
    window.history.back();
  }
}
