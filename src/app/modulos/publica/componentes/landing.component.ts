import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-container">
      <!-- Navegación -->
      <nav class="navbar">
        <div class="nav-content">
          <div class="logo">
            <h1>InnoAd</h1>
            <span class="logo-subtitle">Publicidad Digital Inteligente</span>
          </div>
          <div class="nav-links">
            <a routerLink="/autenticacion/iniciar-sesion" class="btn-login">Iniciar Sesión</a>
            <a routerLink="/autenticacion/registrarse" class="btn-register">Crear Cuenta</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h2 class="hero-title">Gestiona tu Publicidad Digital de Forma Inteligente</h2>
          <p class="hero-subtitle">
            Potencia tu negocio con nuestra plataforma de publicidad digital.
            Control total de pantallas, contenido dinámico y análisis en tiempo real.
          </p>
          <div class="hero-actions">
            <a routerLink="/autenticacion/registrarse" class="btn-cta-primary">Comenzar Gratis</a>
            <a href="#caracteristicas" class="btn-cta-secondary">Ver Características</a>
          </div>
        </div>
        <div class="hero-image">
          <div class="floating-card card-1">
            <div class="card-icon">📊</div>
            <div class="card-text">Análisis en Tiempo Real</div>
          </div>
          <div class="floating-card card-2">
            <div class="card-icon">🎯</div>
            <div class="card-text">Campañas Efectivas</div>
          </div>
          <div class="floating-card card-3">
            <div class="card-icon">🖥️</div>
            <div class="card-text">Gestión de Pantallas</div>
          </div>
        </div>
      </section>

      <!-- Características -->
      <section id="caracteristicas" class="features-section">
        <div class="section-header">
          <h2>Características Principales</h2>
          <p>Todo lo que necesitas para gestionar tu publicidad digital</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>Asistente de IA</h3>
            <p>Asistente inteligente que te ayuda a crear campañas efectivas y optimizar tu contenido</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📺</div>
            <h3>Gestión de Pantallas</h3>
            <p>Control centralizado de todas tus pantallas digitales conectadas vía Raspberry Pi</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Publicación Flexible</h3>
            <p>Publica tu contenido fácilmente desde cualquier dispositivo en tiempo real</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Reportes Detallados</h3>
            <p>Analiza el rendimiento de tus campañas con estadísticas avanzadas</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Actualizaciones Instantáneas</h3>
            <p>Cambia tu contenido al instante y sincroniza con todas tus pantallas</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Seguro y Confiable</h3>
            <p>Protección de datos y disponibilidad garantizada para tu negocio</p>
          </div>
        </div>
      </section>

      <!-- Cómo Funciona -->
      <section class="how-it-works-section">
        <div class="section-header">
          <h2>Cómo Funciona</h2>
          <p>Tres simples pasos para comenzar</p>
        </div>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Regístrate</h3>
            <p>Crea tu cuenta gratuita en menos de un minuto</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Configura tus Pantallas</h3>
            <p>Conecta tus dispositivos Raspberry Pi a la plataforma</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Publica Contenido</h3>
            <p>Sube tu contenido y gestiona tus campañas fácilmente</p>
          </div>
        </div>
      </section>

      <!-- CTA Final -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>¿Listo para Revolucionar tu Publicidad Digital?</h2>
          <p>Únete a cientos de empresas que confían en InnoAd</p>
          <a routerLink="/autenticacion/registrarse" class="btn-cta-large">Crear Cuenta Gratis</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>InnoAd</h4>
            <p>Plataforma profesional de gestión de publicidad digital</p>
          </div>
          <div class="footer-section">
            <h4>Contacto</h4>
            <p>info&#64;innoad.com</p>
            <p>Soporte 24/7</p>
          </div>
          <div class="footer-section">
            <h4>Legal</h4>
            <a href="#">Términos y Condiciones</a>
            <a href="#">Política de Privacidad</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 InnoAd. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
      color: #fff;
    }

    /* Navegación */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(26, 31, 58, 0.95);
      backdrop-filter: blur(10px);
      z-index: 1000;
      border-bottom: 1px solid rgba(0, 217, 255, 0.2);
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo h1 {
      font-size: 2rem;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .logo-subtitle {
      font-size: 0.8rem;
      color: #b4b8d0;
      display: block;
    }

    .nav-links {
      display: flex;
      gap: 1rem;
    }

    .btn-login, .btn-register {
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-login {
      color: #00d9ff;
      border: 1px solid #00d9ff;
    }

    .btn-login:hover {
      background: rgba(0, 217, 255, 0.1);
    }

    .btn-register {
      background: linear-gradient(135deg, #00d9ff, #0088ff);
      color: white;
    }

    .btn-register:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 217, 255, 0.4);
    }

    /* Hero Section */
    .hero-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 8rem 2rem 4rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #fff 0%, #00d9ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #b4b8d0;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-cta-primary, .btn-cta-secondary {
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .btn-cta-primary {
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      color: white;
    }

    .btn-cta-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 217, 255, 0.5);
    }

    .btn-cta-secondary {
      border: 2px solid #00d9ff;
      color: #00d9ff;
    }

    .btn-cta-secondary:hover {
      background: rgba(0, 217, 255, 0.1);
    }

    /* Hero Image con cards flotantes */
    .hero-image {
      position: relative;
      height: 400px;
    }

    .floating-card {
      position: absolute;
      background: rgba(26, 31, 58, 0.9);
      border: 1px solid rgba(0, 217, 255, 0.3);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      animation: float 3s ease-in-out infinite;
    }

    .card-1 { top: 20%; left: 10%; animation-delay: 0s; }
    .card-2 { top: 50%; right: 10%; animation-delay: 1s; }
    .card-3 { bottom: 10%; left: 30%; animation-delay: 2s; }

    .card-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .card-text {
      color: #b4b8d0;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    /* Features Section */
    .features-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 6rem 2rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .section-header p {
      font-size: 1.2rem;
      color: #b4b8d0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: rgba(26, 31, 58, 0.6);
      border: 1px solid rgba(0, 217, 255, 0.2);
      border-radius: 16px;
      padding: 2rem;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 217, 255, 0.5);
      box-shadow: 0 10px 30px rgba(0, 217, 255, 0.2);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #00d9ff;
    }

    .feature-card p {
      color: #b4b8d0;
      line-height: 1.6;
    }

    /* How it Works */
    .how-it-works-section {
      background: rgba(26, 31, 58, 0.4);
      padding: 6rem 2rem;
    }

    .steps-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .step {
      flex: 1;
      text-align: center;
      padding: 2rem;
      background: rgba(26, 31, 58, 0.6);
      border: 1px solid rgba(0, 217, 255, 0.2);
      border-radius: 16px;
    }

    .step-number {
      width: 60px;
      height: 60px;
      margin: 0 auto 1rem;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .step h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .step p {
      color: #b4b8d0;
    }

    .step-arrow {
      font-size: 2rem;
      color: #00d9ff;
    }

    /* CTA Section */
    .cta-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 6rem 2rem;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.2rem;
      color: #b4b8d0;
      margin-bottom: 2rem;
    }

    .btn-cta-large {
      padding: 1.2rem 3rem;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-size: 1.3rem;
      font-weight: 700;
      display: inline-block;
      transition: all 0.3s ease;
    }

    .btn-cta-large:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(0, 217, 255, 0.5);
    }

    /* Footer */
    .footer {
      background: rgba(10, 14, 39, 0.8);
      border-top: 1px solid rgba(0, 217, 255, 0.2);
      padding: 3rem 2rem 1rem;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h4 {
      color: #00d9ff;
      margin-bottom: 1rem;
    }

    .footer-section p, .footer-section a {
      color: #b4b8d0;
      display: block;
      margin-bottom: 0.5rem;
      text-decoration: none;
    }

    .footer-section a:hover {
      color: #00d9ff;
    }

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      padding-top: 2rem;
      border-top: 1px solid rgba(0, 217, 255, 0.1);
      text-align: center;
      color: #b4b8d0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-section {
        grid-template-columns: 1fr;
        padding-top: 6rem;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-image {
        height: 300px;
      }

      .steps-container {
        flex-direction: column;
      }

      .step-arrow {
        transform: rotate(90deg);
      }

      .nav-links {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class LandingComponent {}
