import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

interface CarritoItem {
  id: number;
  titulo: string;
  precioCOP: number;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carrito-container">
      <header class="header-carrito">
        <h1>🛒 Mi Carrito de Publicaciones</h1>
      </header>

      <div class="contenedor-carrito">
        @if (items().length === 0) {
          <div class="carrito-vacio">
            <p>Tu carrito está vacío</p>
            <a href="/publicaciones" class="btn-continuar">
              Ir a publicaciones
            </a>
          </div>
        } @else {
          <div class="items-carrito">
            <table class="tabla-carrito">
              <thead>
                <tr>
                  <th>Publicación</th>
                  <th>Precio Unit. (COP)</th>
                  <th>Cantidad</th>
                  <th>Subtotal (COP)</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.id) {
                  <tr class="item-fila">
                    <td>
                      <strong>{{ item.titulo }}</strong>
                    </td>
                    <td>${{ item.precioCOP | number:'1.0-0' }}</td>
                    <td>
                      <div class="cantidad-control">
                        <button class="btn-cantidad" (click)="decrementarCantidad(item.id)">
                          −
                        </button>
                        <input type="number" [value]="item.cantidad" readonly class="cantidad-input">
                        <button class="btn-cantidad" (click)="incrementarCantidad(item.id)">
                          +
                        </button>
                      </div>
                    </td>
                    <td><strong>${{ item.subtotal | number:'1.0-0' }}</strong></td>
                    <td>
                      <button class="btn-eliminar" (click)="eliminarItem(item.id)">
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="resumen-compra">
            <div class="linea-resumen">
              <span>Subtotal:</span>
              <span>${{ subtotal() | number:'1.0-0' }} COP</span>
            </div>
            <div class="linea-resumen">
              <span>IVA (19%):</span>
              <span>${{ iva() | number:'1.0-0' }} COP</span>
            </div>
            <div class="linea-total">
              <span>Total a Pagar:</span>
              <span>${{ total() | number:'1.0-0' }} COP</span>
            </div>

            <div class="opciones-pago">
              <h3>Opciones de Pago</h3>
              <div class="metodos-pago">
                <label class="metodo-pago">
                  <input type="radio" name="pago" value="tarjeta" [(ngModel)]="metodoPago">
                  💳 Tarjeta de Crédito
                </label>
                <label class="metodo-pago">
                  <input type="radio" name="pago" value="transferencia" [(ngModel)]="metodoPago">
                  🏦 Transferencia Bancaria
                </label>
                <label class="metodo-pago">
                  <input type="radio" name="pago" value="nequi" [(ngModel)]="metodoPago">
                  📱 Nequi/Daviplata
                </label>
                <label class="metodo-pago">
                  <input type="radio" name="pago" value="codigo" [(ngModel)]="metodoPago">
                  🔑 Código de Pago
                </label>
              </div>
            </div>

            <div class="botones-acciones">
              <button class="btn-vaciar" (click)="vaciarCarrito()">
                🗑️ Vaciar Carrito
              </button>
              <button class="btn-procesar" (click)="procesarPago()">
                ✅ Procesar Pago
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .carrito-container {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .header-carrito {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-carrito h1 {
      margin: 0;
      color: #333;
    }

    .contenedor-carrito {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .carrito-vacio {
      text-align: center;
      padding: 60px 20px;
    }

    .carrito-vacio p {
      font-size: 1.2em;
      color: #666;
      margin-bottom: 20px;
    }

    .btn-continuar {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
    }

    .tabla-carrito {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .tabla-carrito th {
      background: #f5f5f5;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }

    .tabla-carrito td {
      padding: 15px;
      border-bottom: 1px solid #ddd;
    }

    .item-fila:hover {
      background: #f9f9f9;
    }

    .cantidad-control {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .btn-cantidad {
      width: 30px;
      height: 30px;
      padding: 0;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .cantidad-input {
      width: 50px;
      text-align: center;
      border: 1px solid #ddd;
      padding: 5px;
    }

    .btn-eliminar {
      padding: 6px 12px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .resumen-compra {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      margin-left: auto;
    }

    .linea-resumen {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }

    .linea-total {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      font-size: 1.2em;
      font-weight: bold;
      color: #667eea;
    }

    .opciones-pago {
      margin-top: 20px;
    }

    .opciones-pago h3 {
      margin: 10px 0;
      color: #333;
    }

    .metodos-pago {
      display: grid;
      gap: 10px;
    }

    .metodo-pago {
      display: flex;
      align-items: center;
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .metodo-pago:hover {
      background: #f9f9f9;
      border-color: #667eea;
    }

    .metodo-pago input {
      margin-right: 10px;
      cursor: pointer;
    }

    .botones-acciones {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn-vaciar {
      flex: 1;
      padding: 12px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-procesar {
      flex: 1;
      padding: 12px;
      background: #22c55e;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-procesar:hover {
      background: #16a34a;
    }
  `]
})
export class CarritoComponent implements OnInit {
  private http = inject(HttpClient);

  items = signal<CarritoItem[]>([]);
  metodoPago = 'tarjeta';

  subtotal = signal(0);
  iva = signal(0);
  total = signal(0);

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    const url = `${environment.apiUrl}/api/v1/carrito`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.items) {
          this.items.set(response.items);
          this.calcularTotales();
        }
      },
      error: () => {
        // Carrito vacío o error
        this.items.set([]);
      }
    });
  }

  incrementarCantidad(id: number) {
    const item = this.items().find(i => i.id === id);
    if (item) {
      item.cantidad++;
      item.subtotal = item.precioCOP * item.cantidad;
      this.calcularTotales();
    }
  }

  decrementarCantidad(id: number) {
    const item = this.items().find(i => i.id === id);
    if (item && item.cantidad > 1) {
      item.cantidad--;
      item.subtotal = item.precioCOP * item.cantidad;
      this.calcularTotales();
    }
  }

  eliminarItem(id: number) {
    const newItems = this.items().filter(i => i.id !== id);
    this.items.set(newItems);
    this.calcularTotales();
  }

  vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.items.set([]);
      this.calcularTotales();
    }
  }

  calcularTotales() {
    const sub = this.items().reduce((acc, item) => acc + item.subtotal, 0);
    const ivaAmount = sub * 0.19;
    const totalAmount = sub + ivaAmount;

    this.subtotal.set(sub);
    this.iva.set(ivaAmount);
    this.total.set(totalAmount);
  }

  procesarPago() {
    if (this.items().length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const payload = {
      items: this.items(),
      total: this.total(),
      metodoPago: this.metodoPago
    };

    const url = `${environment.apiUrl}/api/v1/pagos/procesar`;
    this.http.post(url, payload).subscribe({
      next: (response: any) => {
        alert('✅ Pago procesado exitosamente!\\nReferencia: ' + response.referencia);
        this.items.set([]);
        this.calcularTotales();
      },
      error: (err) => {
        alert('❌ Error al procesar pago: ' + err.message);
      }
    });
  }
}
