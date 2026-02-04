import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServicioMantenimientoAvanzado } from '@core/servicios/mantenimiento-avanzado.servicio';
import { ServicioWebSocketAlertas } from '@core/servicios/websocket-alertas.servicio';

@Component({
  selector: 'app-navegacion-mantenimiento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navegacion-mantenimiento.component.html',
  styleUrls: ['./navegacion-mantenimiento.component.scss']
})
export class NavegacionMantenimientoComponent implements OnInit {
  private servicioMantenimiento = inject(ServicioMantenimientoAvanzado);
  private servicioWebSocket = inject(ServicioWebSocketAlertas);

  public dispositivosConectados = signal(0);
  public numeroAlertasPendientes = signal(0);
  public webSocketConectado = signal(false);

  ngOnInit(): void {
    // Suscribirse a dispositivos
    const dispositivos = this.servicioMantenimiento.dispositivos;
    this.dispositivosConectados.set(
      dispositivos().filter(d => d.estadoConexion === 'Conectado').length
    );

    // Suscribirse a alertas
    const alertas = this.servicioMantenimiento.alertas;
    this.numeroAlertasPendientes.set(
      alertas().filter(a => a.estado === 'ACTIVA').length
    );

    // Monitorear WebSocket
    this.webSocketConectado.set(this.servicioWebSocket.conectadoWebSocket());
  }

  public reconectar(): void {
    this.servicioWebSocket.reconectar();
    setTimeout(() => {
      this.webSocketConectado.set(this.servicioWebSocket.conectadoWebSocket());
    }, 2000);
  }
}
