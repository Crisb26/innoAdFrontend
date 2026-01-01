import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantenimientoComponent } from './mantenimiento.component';
import { ServicioMantenimiento } from '../../../core/servicios/mantenimiento.servicio';
import { of, throwError } from 'rxjs';

describe('MantenimientoComponent', () => {
  let component: MantenimientoComponent;
  let fixture: ComponentFixture<MantenimientoComponent>;
  let servicioMantenimiento: jasmine.SpyObj<ServicioMantenimiento>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ServicioMantenimiento', [
      'obtenerEstado',
      'verificarContraseña',
      'activarMantenimiento',
      'desactivarMantenimiento'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ MantenimientoComponent ],
      providers: [
        { provide: ServicioMantenimiento, useValue: spy }
      ]
    })
    .compileComponents();

    servicioMantenimiento = TestBed.inject(ServicioMantenimiento) as jasmine.SpyObj<ServicioMantenimiento>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenimientoComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar estado de mantenimiento al inicializarse', () => {
    const estadoMock = {
      activo: false,
      mensaje: 'Sistema operativo',
      ultimaAutenticacion: new Date()
    };

    servicioMantenimiento.obtenerEstado.and.returnValue(of(estadoMock));

    component.ngOnInit();

    expect(servicioMantenimiento.obtenerEstado).toHaveBeenCalled();
    expect(component.estadoMantenimiento).toEqual(estadoMock);
  });

  it('debería validar contraseña correctamente', () => {
    component.contraseniaIntento = 'admin123';
    component.intentosFallidos = 0;

    servicioMantenimiento.verificarContraseña.and.returnValue(of({ valida: true }));

    component.verificarContrasenia();

    expect(servicioMantenimiento.verificarContraseña).toHaveBeenCalledWith('admin123');
    expect(component.intentosFallidos).toBe(0);
  });

  it('debería incrementar intentos fallidos en contraseña incorrecta', () => {
    component.contraseniaIntento = 'wrongPassword';
    component.intentosFallidos = 0;

    servicioMantenimiento.verificarContraseña.and.returnValue(of({ valida: false }));

    component.verificarContrasenia();

    expect(component.intentosFallidos).toBe(1);
  });

  it('debería bloquear después de 3 intentos fallidos', () => {
    component.contraseniaIntento = 'wrongPassword';
    component.intentosFallidos = 2;

    servicioMantenimiento.verificarContraseña.and.returnValue(of({ valida: false }));

    component.verificarContrasenia();

    expect(component.intentosFallidos).toBe(3);
    expect(component.bloqueado).toBe(true);
  });

  it('debería desbloquear después de 5 minutos', (done) => {
    component.bloqueado = true;
    component.tiempoBloqueo = new Date(Date.now() - 301000); // 5 min + 1s

    setTimeout(() => {
      component.verificarDesbloqu();
      expect(component.bloqueado).toBe(false);
      done();
    }, 100);
  });

  it('debería limpiar contraseña después de verificación', () => {
    component.contraseniaIntento = 'admin123';

    servicioMantenimiento.verificarContraseña.and.returnValue(of({ valida: true }));

    component.verificarContrasenia();

    expect(component.contraseniaIntento).toBe('');
  });

  it('debería mostrar error al cargar estado', () => {
    const error = new Error('Error al cargar estado');

    servicioMantenimiento.obtenerEstado.and.returnValue(
      throwError(() => error)
    );

    component.ngOnInit();

    expect(component.error).toBeTruthy();
  });

  it('debería activar modo mantenimiento', () => {
    const datosMantenimiento = {
      activo: true,
      mensaje: 'Mantenimiento programado',
      contrasenia: 'newPassword123'
    };

    servicioMantenimiento.activarMantenimiento.and.returnValue(of(datosMantenimiento));

    component.activarMantenimiento(datosMantenimiento);

    expect(servicioMantenimiento.activarMantenimiento).toHaveBeenCalledWith(datosMantenimiento);
  });

  it('debería desactivar modo mantenimiento', () => {
    const datosMantenimiento = { activo: false };

    servicioMantenimiento.desactivarMantenimiento.and.returnValue(of(datosMantenimiento));

    component.desactivarMantenimiento();

    expect(servicioMantenimiento.desactivarMantenimiento).toHaveBeenCalled();
  });

  it('debería mostrar loader durante verificación', () => {
    component.cargando = false;
    component.contraseniaIntento = 'admin123';

    servicioMantenimiento.verificarContraseña.and.returnValue(of({ valida: true }));

    component.verificarContrasenia();

    expect(component.cargando).toBe(false); // Se resetea después
  });

  it('debería validar que contraseña no esté vacía', () => {
    component.contraseniaIntento = '';

    component.verificarContrasenia();

    expect(servicioMantenimiento.verificarContraseña).not.toHaveBeenCalled();
  });

  it('debería mostrar mensaje de error específico para bloqueo', () => {
    component.bloqueado = true;
    component.intentosFallidos = 3;

    component.obtenerMensajeError();

    expect(component.mensajeError).toContain('bloqueado');
  });
});
