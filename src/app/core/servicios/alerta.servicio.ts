import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ServicioAlerta {

  private readonly temaFuturista = {
    background: '#0f172a',
    color: '#e2e8f0',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#64748b',
    iconColor: '#3b82f6'
  };

  exito(titulo: string, mensaje?: string) {
    return Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      ...this.temaFuturista,
      iconColor: '#10b981',
      confirmButtonColor: '#10b981',
      showConfirmButton: true,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'alerta-futurista',
        title: 'alerta-titulo',
        htmlContainer: 'alerta-texto'
      }
    });
  }

  error(titulo: string, mensaje?: string) {
    return Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      ...this.temaFuturista,
      iconColor: '#ef4444',
      confirmButtonColor: '#ef4444',
      showConfirmButton: true,
      customClass: {
        popup: 'alerta-futurista',
        title: 'alerta-titulo',
        htmlContainer: 'alerta-texto'
      }
    });
  }

  advertencia(titulo: string, mensaje?: string) {
    return Swal.fire({
      icon: 'warning',
      title: titulo,
      text: mensaje,
      ...this.temaFuturista,
      iconColor: '#f59e0b',
      confirmButtonColor: '#f59e0b',
      showConfirmButton: true,
      customClass: {
        popup: 'alerta-futurista',
        title: 'alerta-titulo',
        htmlContainer: 'alerta-texto'
      }
    });
  }

  info(titulo: string, mensaje?: string) {
    return Swal.fire({
      icon: 'info',
      title: titulo,
      text: mensaje,
      ...this.temaFuturista,
      showConfirmButton: true,
      customClass: {
        popup: 'alerta-futurista',
        title: 'alerta-titulo',
        htmlContainer: 'alerta-texto'
      }
    });
  }

  confirmar(titulo: string, mensaje?: string, textoConfirmar: string = 'Confirmar', textoCancelar: string = 'Cancelar') {
    return Swal.fire({
      icon: 'question',
      title: titulo,
      text: mensaje,
      ...this.temaFuturista,
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: textoCancelar,
      customClass: {
        popup: 'alerta-futurista',
        title: 'alerta-titulo',
        htmlContainer: 'alerta-texto'
      }
    });
  }

  cargando(titulo: string = 'Cargando...', mensaje?: string) {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      ...this.temaFuturista,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'alerta-futurista alerta-cargando',
        title: 'alerta-titulo',
        htmlContainer: 'alerta-texto'
      }
    });
  }

  cerrar() {
    Swal.close();
  }

  toast(tipo: 'success' | 'error' | 'warning' | 'info', mensaje: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'alerta-toast-futurista'
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    const colores = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    return Toast.fire({
      icon: tipo,
      title: mensaje,
      background: '#1e293b',
      color: '#e2e8f0',
      iconColor: colores[tipo]
    });
  }
}
