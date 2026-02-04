import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-developer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developer-dashboard.component.html',
  styleUrls: ['./developer-dashboard.component.scss']
})
export class DeveloperDashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private permisosServicio: PermisosServicio
  ) {}

  ngOnInit(): void {
    // Verificar que es developer
    if (!this.permisosServicio.esDeveloper()) {
      this.router.navigate(['/sin-permisos']);
    }
  }

  navegarA(seccion: string): void {
    switch (seccion) {
      case 'codigo':
        window.open('http://localhost:8080/swagger-ui.html', '_blank');
        break;
      case 'logs':
        // TODO: Crear componente de logs
        console.log('Navegar a logs');
        break;
      case 'infraestructura':
        // TODO: Crear componente de infraestructura
        console.log('Navegar a infraestructura');
        break;
      case 'herramientas':
        // TODO: Crear componente de herramientas
        console.log('Navegar a herramientas');
        break;
      case 'performance':
        // TODO: Crear componente de performance
        console.log('Navegar a performance');
        break;
      case 'documentacion':
        // TODO: Crear documentación
        console.log('Abrir documentación');
        break;
    }
  }

  mostrarCredenciales(): void {
    alert('Credenciales disponibles en el archivo de configuración local. Contactar al administrador si no las tienes.');
  }
}
