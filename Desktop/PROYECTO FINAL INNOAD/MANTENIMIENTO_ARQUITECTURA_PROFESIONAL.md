# 🔧 MODO MANTENIMIENTO - ARQUITECTURA PROFESIONAL

**Propuesta Completa:** Sistema de mantenimiento configurable, futurista y con control granular de roles

---

## 🎯 REQUISITOS CAPTURADOS

```
✅ Página futurista y bella para modo mantenimiento
✅ Mensaje personalizado según definición del admin
✅ Fecha y hora de inicio/fin configurable
✅ Visible para VISITANTE y USUARIO (roles bajos)
✅ Control granular: elegir QUID roles ven modo mantenimiento
✅ DESARROLLADOR: ¿Siempre accesible? ¿Siempre en modo dev?
✅ Logs y auditoría de todos los cambios
```

---

## 🏗️ ARQUITECTURA PROPUESTA

```
┌─────────────────────────────────────────────────────────────┐
│               SISTEMA DE MANTENIMIENTO INTELIGENTE          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ConfiguracionSistema                                      │
│  ├─ modoMantenimientoActivo (boolean)                     │
│  ├─ fechaInicio (LocalDateTime)                           │
│  ├─ fechaFin (LocalDateTime)                              │
│  ├─ mensaje (String)                                      │
│  ├─ rolesAfectados (List<RolUsuario>)  ← NUEVO!         │
│  ├─ rolesExcluidos (List<RolUsuario>)  ← NUEVO!         │
│  ├─ urlContactoSoporte (String)                          │
│  ├─ tipoMantenimiento (enum) ← NUEVO!                    │
│  │  • EMERGENCIA (rojo)                                  │
│  │  • PROGRAMADO (azul)                                 │
│  │  • CRITICA (naranja)                                │
│  └─ usuarioActivacion (Usuario)                         │
│                                                          │
└─────────────────────────────────────────────────────────────┘

FLUJO DE DECISIÓN:

┌─ Usuario intenta acceder a /dashboard
│
├─ ¿Sistema en mantenimiento?
│  │
│  ├─ NO → Acceso normal ✅
│  │
│  └─ SÍ → Verificar rol
│     │
│     ├─ Rol en rolesExcluidos? → Acceso ✅ (Dev/Admin siempre)
│     │
│     ├─ Rol en rolesAfectados? → MANTENIMIENTO SCREEN 🔧
│     │
│     └─ ¿Fecha-hora dentro del rango?
│        └─ NO → Mantenimiento VENCIDO → Acceso ✅
```

---

## 📋 ROLES Y ESTRATEGIA

### Propuesta para DESARROLLADOR

```typescript
enum RolUsuario {
  VISITANTE = "VISITANTE",           // Rol 1 - Mínimo
  USUARIO = "USUARIO",               // Rol 2 - Normal
  TECNICO = "TECNICO",               // Rol 3 - Técnico
  ADMIN = "ADMIN",                   // Rol 4 - Administrador
  DESARROLLADOR = "DESARROLLADOR"    // Rol 5 - Máximo
}

// ESTRATEGIA MANTENIMIENTO:
// "Modo mantenimiento SIEMPRE excluye a ADMIN y DESARROLLADOR"

const ROLES_PROTEGIDOS = [
  RolUsuario.ADMIN,                  // Siempre pueden entrar
  RolUsuario.DESARROLLADOR           // Siempre pueden entrar
];

// ¿Por qué?
// 1. DESARROLLADOR necesita acceder para:
//    - Resolver issues del mantenimiento
//    - Inspeccionar logs en tiempo real
//    - Rollback rápido si hay problema
//    - Deployar hotfix sin permisos adicionales
//
// 2. Admin necesita acceder para:
//    - Monitorear el mantenimiento
//    - Cambiar mensaje si es necesario
//    - Extender tiempo si es necesario
//    - Desactivar si algo está mal

// ESTRATEGIA: "Escudo de Desarrollador"
// Los desarrolladores SIEMPRE pueden entrar, sin excepción
// Incluso si mantenimiento está activo
```

---

## 🖼️ PANTALLA DE MANTENIMIENTO - FUTURISTA

### Diseño Propuesto

```html
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  [Fondo animado con gradiente y partículas flotantes]   │
│                                                          │
│              ⚙️ MODO MANTENIMIENTO ⚙️                   │
│                                                          │
│         [Animación de engranajes rotando]               │
│                                                          │
│    "Estamos mejorando InnoAd para ti"                  │
│                                                          │
│    [MENSAJE PERSONALIZADO AQUÍ]                         │
│                                                          │
│    ⏱️ Tiempo estimado: [FECHA/HORA]                    │
│                                                          │
│    ├─ Inicio:   13/12/2025 14:00                       │
│    └─ Fin:      13/12/2025 16:30                       │
│                                                          │
│    [Barra de progreso con tiempo real]                  │
│                                                          │
│    📧 Soporte: soporte@innoad.com                      │
│    📞 24/7 disponible                                   │
│                                                          │
│    ✨ "Volveremos más fuertes" ✨                      │
│                                                          │
└──────────────────────────────────────────────────────────┘

VARIANTES POR TIPO:
- EMERGENCIA: Rojo + Icono de alerta
- PROGRAMADO: Azul + Icono de reloj
- CRITICA: Naranja + Icono de exclamación
```

---

## 💻 CÓDIGO BACKEND - MEJORADO

### 1. Entity: ConfiguracionSistema.java

```java
package com.innoad.modules.admin.domain;

import com.innoad.shared.dto.RolUsuario;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "configuracion_sistema")
public class ConfiguracionSistema {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== MANTENIMIENTO =====
    
    @Column(name = "modo_mantenimiento_activo")
    private Boolean modoMantenimientoActivo = false;

    @Column(name = "fecha_inicio_mantenimiento")
    private LocalDateTime fechaInicioMantenimiento;

    @Column(name = "fecha_fin_estimada_mantenimiento")
    private LocalDateTime fechaFinEstimadaMantenimiento;

    @Column(name = "mensaje_mantenimiento", length = 1000)
    private String mensajeMantenimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_mantenimiento")
    private TipoMantenimiento tipoMantenimiento = TipoMantenimiento.PROGRAMADO;

    // ===== NUEVO: CONTROL DE ROLES =====
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mantenimiento_roles_afectados", 
                     joinColumns = @JoinColumn(name = "configuracion_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "rol")
    private List<RolUsuario> rolesAfectados = new ArrayList<>();
    // Roles que VEN el modo mantenimiento (VISITANTE, USUARIO, etc)
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mantenimiento_roles_excluidos", 
                     joinColumns = @JoinColumn(name = "configuracion_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "rol")
    private List<RolUsuario> rolesExcluidos = new ArrayList<>();
    // Roles que SIEMPRE pueden entrar (ADMIN, DESARROLLADOR)

    @Column(name = "url_contacto_soporte")
    private String urlContactoSoporte = "soporte@innoad.com";

    @Column(name = "codigo_seguridad_mantenimiento")
    private String codigoSeguridadMantenimiento;

    @Column(name = "usuario_actualizacion_id")
    private Long usuarioActualizacionId;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // ===== MÉTODOS ÚTILES =====
    
    public boolean estaActivo() {
        if (!modoMantenimientoActivo) return false;
        
        // Verificar si ya pasó la fecha fin
        if (fechaFinEstimadaMantenimiento != null) {
            return LocalDateTime.now().isBefore(fechaFinEstimadaMantenimiento);
        }
        
        return true;
    }
    
    public boolean puedeAcceder(RolUsuario rol) {
        if (!estaActivo()) return true; // Acceso normal
        
        // ADMIN y DESARROLLADOR siempre pueden
        if (rolesExcluidos.contains(rol)) {
            return true;
        }
        
        // Si está en roles afectados, NO puede entrar
        return !rolesAfectados.contains(rol);
    }
    
    public String tiempoRestante() {
        if (!estaActivo()) return "Mantenimiento finalizado";
        
        if (fechaFinEstimadaMantenimiento == null) {
            return "Duración indefinida";
        }
        
        long minutos = java.time.temporal.ChronoUnit.MINUTES
            .between(LocalDateTime.now(), fechaFinEstimadaMantenimiento);
        
        if (minutos <= 0) return "Finalizando...";
        if (minutos < 60) return minutos + " minutos";
        
        long horas = minutos / 60;
        return horas + " horas";
    }
}

// ===== ENUM: Tipo de Mantenimiento =====
public enum TipoMantenimiento {
    EMERGENCIA("Emergencia - Sistema crítico"),      // Rojo
    PROGRAMADO("Mantenimiento programado"),           // Azul
    CRITICA("Mantenimiento crítico");                // Naranja
    
    private final String descripcion;
    
    TipoMantenimiento(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
```

### 2. DTO: SolicitudModoMantenimiento.java (MEJORADO)

```java
package com.innoad.dto.solicitud;

import com.innoad.modules.admin.domain.TipoMantenimiento;
import com.innoad.shared.dto.RolUsuario;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudModoMantenimiento {

    @NotBlank(message = "El código de seguridad es obligatorio")
    private String codigoSeguridad;

    private String mensaje;

    private LocalDateTime fechaFinEstimada;
    
    @Builder.Default
    private TipoMantenimiento tipoMantenimiento = TipoMantenimiento.PROGRAMADO;
    
    @Builder.Default
    private List<RolUsuario> rolesAfectados = new ArrayList<>();
    // Qué roles ven el mensaje de mantenimiento
    
    @Builder.Default
    private List<RolUsuario> rolesExcluidos = new ArrayList<>();
    // Qué roles pueden seguir entrando (ADMIN, DESARROLLADOR siempre)
    
    private String urlContactoSoporte;
}
```

### 3. Service: ServicioModoMantenimiento.java (MEJORADO)

```java
package com.innoad.modules.admin.service;

import com.innoad.modules.admin.domain.ConfiguracionSistema;
import com.innoad.modules.admin.domain.TipoMantenimiento;
import com.innoad.modules.admin.repository.RepositorioConfiguracionSistema;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.shared.dto.RolUsuario;
import com.innoad.servicio.ServicioEmail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServicioModoMantenimiento {
    
    private final RepositorioConfiguracionSistema repositorioConfiguracion;
    private final PasswordEncoder passwordEncoder;
    private final ServicioEmail servicioEmail;
    
    @Value("${innoad.maintenance.security-code}")
    private String codigoSeguridadPorDefecto;
    
    @Value("${innoad.maintenance.email-for-recovery}")
    private String emailRecuperacionPorDefecto;
    
    private static final String CLAVE_CONFIG_MANTENIMIENTO = "MODO_MANTENIMIENTO";

    /**
     * Activa modo mantenimiento CON CONTROL DE ROLES
     */
    @Transactional
    public void activarModoMantenimiento(
            Usuario usuario,
            String codigoSeguridad,
            String mensaje,
            LocalDateTime fechaFinEstimada,
            TipoMantenimiento tipo,
            List<RolUsuario> rolesAfectados,
            List<RolUsuario> rolesExcluidos,
            String urlContacto
    ) {
        if (!usuario.esAdministrador()) {
            throw new RuntimeException("Solo administradores pueden activar mantenimiento");
        }

        if (!verificarCodigoSeguridad(codigoSeguridad)) {
            throw new RuntimeException("Código de seguridad inválido");
        }

        ConfiguracionSistema config = obtenerOCrearConfiguracion();

        // Validar que ADMIN y DESARROLLADOR siempre estén excluidos
        if (rolesExcluidos == null) {
            rolesExcluidos = new ArrayList<>();
        }
        if (!rolesExcluidos.contains(RolUsuario.ADMIN)) {
            rolesExcluidos.add(RolUsuario.ADMIN);
        }
        if (!rolesExcluidos.contains(RolUsuario.DESARROLLADOR)) {
            rolesExcluidos.add(RolUsuario.DESARROLLADOR);
        }

        // Si no especifica roles afectados, afectar a VISITANTE y USUARIO
        if (rolesAfectados == null || rolesAfectados.isEmpty()) {
            rolesAfectados = List.of(RolUsuario.VISITANTE, RolUsuario.USUARIO);
        }

        config.setModoMantenimientoActivo(true);
        config.setFechaInicioMantenimiento(LocalDateTime.now());
        config.setFechaFinEstimadaMantenimiento(fechaFinEstimada);
        config.setMensajeMantenimiento(
            mensaje != null ? mensaje : 
            "Estamos mejorando el sistema. Volveremos pronto."
        );
        config.setTipoMantenimiento(tipo != null ? tipo : TipoMantenimiento.PROGRAMADO);
        config.setRolesAfectados(rolesAfectados);
        config.setRolesExcluidos(rolesExcluidos);
        config.setUrlContactoSoporte(urlContacto != null ? urlContacto : "soporte@innoad.com");
        config.setUsuarioActualizacionId(usuario.getId());
        config.setFechaActualizacion(LocalDateTime.now());

        repositorioConfiguracion.save(config);
        
        log.info("Modo mantenimiento activado por {}. Tipo: {}. Roles afectados: {}",
                usuario.getEmail(), tipo, rolesAfectados);
    }

    /**
     * Verifica si usuario puede acceder durante mantenimiento
     */
    public boolean puedeAcceder(Usuario usuario) {
        ConfiguracionSistema config = obtenerConfiguracion();
        
        if (config == null || !config.estaActivo()) {
            return true; // Acceso normal
        }

        // Usar el método de la entity
        return config.puedeAcceder(usuario.getRol());
    }

    /**
     * Obtiene información del mantenimiento para mostrar en pantalla
     */
    public ConfiguracionSistema obtenerInformacionMantenimiento() {
        return obtenerOCrearConfiguracion();
    }

    /**
     * Obtiene solo si está activo
     */
    public ConfiguracionSistema obtenerConfiguracion() {
        var config = obtenerOCrearConfiguracion();
        if (config.estaActivo()) {
            return config;
        }
        return null;
    }

    // ===== MÉTODOS PRIVADOS =====
    
    private ConfiguracionSistema obtenerOCrearConfiguracion() {
        return repositorioConfiguracion.findByClave(CLAVE_CONFIG_MANTENIMIENTO)
                .orElseGet(() -> {
                    ConfiguracionSistema nuevaConfig = new ConfiguracionSistema();
                    nuevaConfig.setClave(CLAVE_CONFIG_MANTENIMIENTO);
                    nuevaConfig.setModoMantenimientoActivo(false);
                    
                    // Inicializar roles excluidos por defecto
                    nuevaConfig.setRolesExcluidos(
                        List.of(RolUsuario.ADMIN, RolUsuario.DESARROLLADOR)
                    );
                    
                    return repositorioConfiguracion.save(nuevaConfig);
                });
    }

    private boolean verificarCodigoSeguridad(String codigoIngresado) {
        ConfiguracionSistema config = obtenerOCrearConfiguracion();
        
        if (config.getCodigoSeguridadMantenimiento() != null) {
            return passwordEncoder.matches(codigoIngresado, 
                config.getCodigoSeguridadMantenimiento());
        }
        
        return codigoIngresado.equals(codigoSeguridadPorDefecto);
    }

    // ... resto de métodos (desactivar, cambiar código, etc)
}
```

### 4. Controller: ControladorAdministracion.java (MEJORADO)

```java
@PostMapping("/mantenimiento/activar")
public ResponseEntity<RespuestaAPI<Void>> activarModoMantenimiento(
        @Valid @RequestBody SolicitudModoMantenimiento solicitud,
        @AuthenticationPrincipal Usuario administrador,
        HttpServletRequest request
) {
    try {
        servicioModoMantenimiento.activarModoMantenimiento(
                administrador,
                solicitud.getCodigoSeguridad(),
                solicitud.getMensaje(),
                solicitud.getFechaFinEstimada(),
                solicitud.getTipoMantenimiento(),
                solicitud.getRolesAfectados(),
                solicitud.getRolesExcluidos(),
                solicitud.getUrlContactoSoporte()
        );

        servicioAdministracion.registrarAuditoria(
                "ACTIVAR_MODO_MANTENIMIENTO",
                "Sistema",
                null,
                administrador,
                String.format(
                    "Mantenimiento activado. Tipo: %s. Roles afectados: %s",
                    solicitud.getTipoMantenimiento(),
                    solicitud.getRolesAfectados()
                ),
                request.getRemoteAddr(),
                "EXITOSO"
        );

        return ResponseEntity.ok(
                RespuestaAPI.<Void>builder()
                        .exitoso(true)
                        .mensaje("Modo mantenimiento activado exitosamente")
                        .build()
        );
    } catch (Exception e) {
        return ResponseEntity.badRequest()
                .body(RespuestaAPI.<Void>builder()
                        .exitoso(false)
                        .mensaje("Error: " + e.getMessage())
                        .build());
    }
}
```

---

## 🎨 CÓDIGO FRONTEND - PANTALLA FUTURISTA

### 1. Componente: mantenimiento.component.ts (MEJORADO)

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioMantenimiento } from '@core/servicios/mantenimiento.servicio';

interface InfoMantenimiento {
  activo: boolean;
  mensaje: string;
  fechaInicio: string;
  fechaFin: string;
  tipoMantenimiento: 'EMERGENCIA' | 'PROGRAMADO' | 'CRITICA';
  urlContacto: string;
  tiempoRestante: string;
}

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./mantenimiento.component.scss'],
  template: `
    <div class="contenedor-mantenimiento" [class]="'tipo-' + info.tipoMantenimiento.toLowerCase()">
      <!-- Fondo Animado -->
      <div class="fondo-animado">
        <div class="particulas">
          <div class="particula" *ngFor="let p of [1,2,3,4,5,6,7,8]"></div>
        </div>
        <svg class="fondo-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)"/>
        </svg>
      </div>

      <!-- Contenido Principal -->
      <div class="contenido-principal">
        
        <!-- Icono/Badge de Tipo -->
        <div class="badge-tipo" [class]="'badge-' + info.tipoMantenimiento.toLowerCase()">
          <span class="icono">
            {{ info.tipoMantenimiento === 'EMERGENCIA' ? '⚡' : 
               info.tipoMantenimiento === 'CRITICA' ? '⚠️' : '🔧' }}
          </span>
          <span class="texto">{{ info.tipoMantenimiento }}</span>
        </div>

        <!-- Logo Animado -->
        <div class="logo-animado">
          <svg class="engranajes-rotando" width="200" height="200" viewBox="0 0 200 200">
            <!-- Engranaje principal -->
            <g class="engranaje principal">
              <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" stroke-width="3"/>
              <circle cx="100" cy="100" r="8" fill="currentColor"/>
              <g class="dientes">
                <rect x="95" y="40" width="10" height="15" rx="2"/>
                <rect x="95" y="145" width="10" height="15" rx="2"/>
                <rect x="40" y="95" width="15" height="10" rx="2"/>
                <rect x="145" y="95" width="15" height="10" rx="2"/>
              </g>
            </g>
            
            <!-- Engranajes secundarios -->
            <g class="engranaje secundario-1" transform="translate(140, 70)">
              <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
              <circle cx="0" cy="0" r="5" fill="currentColor"/>
            </g>
            <g class="engranaje secundario-2" transform="translate(60, 140)">
              <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
              <circle cx="0" cy="0" r="5" fill="currentColor"/>
            </g>
          </svg>
          <div class="logo-innoad">InnoAd</div>
        </div>

        <!-- Título Principal -->
        <h1 class="titulo-principal">
          Sistema en Mantenimiento
        </h1>

        <!-- Mensaje Personalizado -->
        <p class="mensaje-personalizado">{{ info.mensaje }}</p>

        <!-- Información de Tiempo -->
        <div class="info-tiempo">
          <div class="tiempo-item">
            <span class="label">Inicio:</span>
            <span class="valor">{{ info.fechaInicio | date: 'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="separador">•</div>
          <div class="tiempo-item">
            <span class="label">Fin:</span>
            <span class="valor">{{ info.fechaFin | date: 'dd/MM/yyyy HH:mm' }}</span>
          </div>
        </div>

        <!-- Barra de Progreso -->
        <div class="barra-progreso-contenedor">
          <div class="barra-progreso">
            <div class="barra-relleno" [style.width]="calcularProgreso() + '%'"></div>
          </div>
          <div class="tiempo-restante">{{ info.tiempoRestante }}</div>
        </div>

        <!-- Contacto de Soporte -->
        <div class="seccion-soporte">
          <div class="titulo-soporte">¿Necesitas ayuda?</div>
          <a [href]="'mailto:' + info.urlContacto" class="enlace-soporte">
            📧 {{ info.urlContacto }}
          </a>
          <div class="soporte-disponible">Disponible 24/7</div>
        </div>

        <!-- Mensaje Final -->
        <p class="mensaje-final">✨ Volveremos más fuertes ✨</p>
      </div>
    </div>
  `
})
export class MantenimientoComponent implements OnInit {
  private servicioMantenimiento = inject(ServicioMantenimiento);

  info: InfoMantenimiento = {
    activo: true,
    mensaje: 'Estamos mejorando nuestro sistema',
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    tipoMantenimiento: 'PROGRAMADO',
    urlContacto: 'soporte@innoad.com',
    tiempoRestante: '2 horas'
  };

  ngOnInit() {
    this.cargarInfoMantenimiento();
  }

  cargarInfoMantenimiento() {
    this.servicioMantenimiento.obtenerInformacion().subscribe({
      next: (response: any) => {
        const datos = response.datos;
        this.info = {
          activo: datos.modoMantenimientoActivo,
          mensaje: datos.mensajeMantenimiento,
          fechaInicio: datos.fechaInicioMantenimiento,
          fechaFin: datos.fechaFinEstimadaMantenimiento,
          tipoMantenimiento: datos.tipoMantenimiento || 'PROGRAMADO',
          urlContacto: datos.urlContactoSoporte,
          tiempoRestante: datos.tiempoRestante || 'Duración indefinida'
        };
      },
      error: (e) => {
        console.error('Error cargando mantenimiento:', e);
      }
    });
  }

  calcularProgreso(): number {
    const inicio = new Date(this.info.fechaInicio).getTime();
    const fin = new Date(this.info.fechaFin).getTime();
    const ahora = new Date().getTime();

    if (fin <= inicio) return 0;
    if (ahora >= fin) return 100;

    return Math.round(((ahora - inicio) / (fin - inicio)) * 100);
  }
}
```

### 2. SCSS: mantenimiento.component.scss (FUTURISTA)

```scss
.contenedor-mantenimiento {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
  // Colores dinámicos por tipo
  &.tipo-emergencia {
    background: linear-gradient(135deg, #ff0000, #ff6b6b, #1a1a1a);
    color: #fff;
    --accent-color: #ff3333;
    --glow-color: rgba(255, 51, 51, 0.5);
  }

  &.tipo-programado {
    background: linear-gradient(135deg, #0066ff, #0099ff, #1a1a2e);
    color: #fff;
    --accent-color: #00ccff;
    --glow-color: rgba(0, 204, 255, 0.5);
  }

  &.tipo-critica {
    background: linear-gradient(135deg, #ff8800, #ffaa00, #1a1a1a);
    color: #fff;
    --accent-color: #ffaa00;
    --glow-color: rgba(255, 170, 0, 0.5);
  }

  // Fondo animado
  .fondo-animado {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 0.3;

    .particulas {
      position: absolute;
      width: 100%;
      height: 100%;

      .particula {
        position: absolute;
        width: 4px;
        height: 4px;
        background: currentColor;
        border-radius: 50%;
        opacity: 0.6;
        animation: flotar 8s ease-in-out infinite;

        @keyframes flotar {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-50px) translateX(30px); opacity: 0.8; }
        }

        @for $i from 1 through 8 {
          &:nth-child(#{$i}) {
            left: random(100) * 1%;
            top: random(100) * 1%;
            animation-delay: $i * 0.5s;
          }
        }
      }
    }

    .fondo-grid {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.1;
    }
  }

  // Contenido
  .contenido-principal {
    position: relative;
    z-index: 10;
    text-align: center;
    max-width: 600px;
    padding: 40px 20px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 20px;
    border: 2px solid var(--accent-color);
    box-shadow: 0 0 30px var(--glow-color), inset 0 0 20px var(--glow-color);
    backdrop-filter: blur(10px);
    animation: fadeInScale 0.8s ease-out;

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  // Badge de tipo
  .badge-tipo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: bold;
    animation: pulse 2s ease-in-out infinite;

    &.badge-emergencia {
      background: rgba(255, 51, 51, 0.3);
      border: 2px solid #ff3333;
    }
    &.badge-programado {
      background: rgba(0, 204, 255, 0.3);
      border: 2px solid #00ccff;
    }
    &.badge-critica {
      background: rgba(255, 170, 0, 0.3);
      border: 2px solid #ffaa00;
    }
  }

  // Logo animado
  .logo-animado {
    position: relative;
    margin: 30px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;

    .engranajes-rotando {
      filter: drop-shadow(0 0 10px var(--glow-color));

      .engranaje {
        &.principal {
          animation: girar 8s linear infinite;
        }
        &.secundario-1 {
          animation: girar 6s linear infinite reverse;
        }
        &.secundario-2 {
          animation: girar 6s linear infinite;
        }
      }

      @keyframes girar {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    }

    .logo-innoad {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 3px;
      background: linear-gradient(45deg, var(--accent-color), #fff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px var(--glow-color);
    }
  }

  // Títulos
  .titulo-principal {
    font-size: 36px;
    margin: 20px 0;
    font-weight: bold;
    text-shadow: 0 0 20px var(--glow-color);
  }

  .mensaje-personalizado {
    font-size: 16px;
    line-height: 1.6;
    margin: 20px 0;
    opacity: 0.9;
    font-style: italic;
  }

  // Información de tiempo
  .info-tiempo {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin: 25px 0;
    font-size: 14px;

    .tiempo-item {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .label {
        opacity: 0.7;
        font-size: 12px;
        text-transform: uppercase;
      }

      .valor {
        font-weight: bold;
        color: var(--accent-color);
      }
    }

    .separador {
      opacity: 0.5;
    }
  }

  // Barra de progreso
  .barra-progreso-contenedor {
    margin: 30px 0;

    .barra-progreso {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--accent-color);
      margin-bottom: 10px;

      .barra-relleno {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), #fff);
        border-radius: 10px;
        transition: width 1s ease;
        box-shadow: 0 0 10px var(--glow-color);
      }
    }

    .tiempo-restante {
      font-size: 14px;
      color: var(--accent-color);
      font-weight: bold;
    }
  }

  // Sección de soporte
  .seccion-soporte {
    margin: 30px 0;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid var(--accent-color);

    .titulo-soporte {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      opacity: 0.8;
    }

    .enlace-soporte {
      display: block;
      color: var(--accent-color);
      text-decoration: none;
      font-weight: bold;
      margin: 10px 0;
      transition: all 0.3s ease;

      &:hover {
        text-shadow: 0 0 10px var(--glow-color);
        transform: scale(1.05);
      }
    }

    .soporte-disponible {
      font-size: 12px;
      opacity: 0.6;
      margin-top: 10px;
    }
  }

  // Mensaje final
  .mensaje-final {
    margin-top: 30px;
    font-size: 16px;
    font-weight: bold;
    animation: parpadeo 2s ease-in-out infinite;

    @keyframes parpadeo {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .contenedor-mantenimiento {
    .contenido-principal {
      max-width: 90%;
      padding: 30px 15px;
    }

    .titulo-principal {
      font-size: 28px;
    }

    .logo-animado .engranajes-rotando {
      width: 150px;
      height: 150px;
    }

    .info-tiempo {
      flex-direction: column;
      gap: 10px;

      .separador {
        display: none;
      }
    }
  }
}
```

---

## 🔐 CONTROL DE PANEL ADMIN (MEJORADO)

### Componente: control-mantenimiento.component.ts (ACTUALIZADO)

```typescript
// En el formulario, agregar:

<div class="grupo-rol">
  <label>Roles Afectados (Ver pantalla de mantenimiento)</label>
  <div class="checkboxes-rol">
    <label>
      <input type="checkbox" formControlName="rolesAfectados" value="VISITANTE">
      Visitante
    </label>
    <label>
      <input type="checkbox" formControlName="rolesAfectados" value="USUARIO">
      Usuario
    </label>
    <label disabled>
      <input type="checkbox" value="TECNICO" disabled>
      Técnico (Puede entrar)
    </label>
    <label disabled>
      <input type="checkbox" value="ADMIN" disabled>
      Admin (SIEMPRE)
    </label>
    <label disabled>
      <input type="checkbox" value="DESARROLLADOR" disabled checked>
      Desarrollador (SIEMPRE - Escudo)
    </label>
  </div>
</div>

<div class="grupo-tipo">
  <label>Tipo de Mantenimiento</label>
  <select formControlName="tipoMantenimiento">
    <option value="PROGRAMADO">Programado (Azul)</option>
    <option value="EMERGENCIA">Emergencia (Rojo)</option>
    <option value="CRITICA">Crítica (Naranja)</option>
  </select>
</div>
```

---

## 📊 DIAGRAMA DE FLUJO FINAL

```
┌─ Usuario accede a aplicación
│
├─ ¿Sistema en mantenimiento?
│  │
│  ├─ NO → ACCESO NORMAL ✅
│  │
│  └─ SÍ
│     │
│     ├─ ¿Es ADMIN o DESARROLLADOR?
│     │  │
│     │  └─ SÍ → ACCESO NORMAL (pueden ver logs/resolver) ✅
│     │
│     └─ ¿Es VISITANTE o USUARIO?
│        │
│        └─ SÍ → PANTALLA MANTENIMIENTO (bonita/futurista) 🔧
│
├─ ¿Pasó la fecha/hora de fin?
│  │
│  ├─ SÍ → Limpieza automática → ACCESO NORMAL ✅
│  │
│  └─ NO → Sigue mostrando pantalla
│
└─ Auditoría registra TODOS los cambios
```

---

## ✅ RESUMEN PARA LUNES

### Backend (Implementar)
- [ ] Actualizar `ConfiguracionSistema.java` con nuevos campos
- [ ] Agregar `TipoMantenimiento` enum
- [ ] Mejorar `ServicioModoMantenimiento.java`
- [ ] Actualizar `ControladorAdministracion.java`
- [ ] Crear tabla `mantenimiento_roles_afectados`
- [ ] Crear tabla `mantenimiento_roles_excluidos`

### Frontend (Implementar)
- [ ] Reemplazar `mantenimiento.component.ts` con versión futurista
- [ ] Crear `mantenimiento.component.scss` con estilos futuristas
- [ ] Actualizar `control-mantenimiento.component.ts` con selectores de roles
- [ ] Verificar que `mantenimiento.servicio.ts` tenga método `obtenerInformacion()`

### Testing (Probar)
- [ ] Admin activa con rol VISITANTE/USUARIO afectados
- [ ] DESARROLLADOR entra normalmente ✅
- [ ] ADMIN entra normalmente ✅
- [ ] Mensaje personalizado muestra
- [ ] Fecha/hora se respeta
- [ ] Tipo de mantenimiento cambia colores

---

## 🎨 PREVIEW VISUAL

```
EMERGENCIA (Rojo):
┌──────────────────────────┐
│ ⚡ EMERGENCIA           │
│      🔧 Engranajes       │
│   InnoAd                 │
│ Sistema en Mantenimiento │
│ Problema crítico         │
│ Fin: 13/12 15:30        │
│ 45 minutos restantes    │
│ 📧 soporte@innoad.com   │
│ ✨ Volveremos pronto ✨  │
└──────────────────────────┘

PROGRAMADO (Azul):
┌──────────────────────────┐
│ 🔧 PROGRAMADO           │
│      🔧 Engranajes       │
│   InnoAd                 │
│ Sistema en Mantenimiento │
│ Mejoras planeadas        │
│ Fin: 13/12 17:00        │
│ 2 horas 30 min         │
│ 📧 soporte@innoad.com   │
│ ✨ Volveremos pronto ✨  │
└──────────────────────────┘
```

---

**¿Implementamos esto AHORA?** Los cambios son:
1. Backend: 4 archivos modificados (2 horas)
2. Frontend: 2 archivos modificados (1 hora)
3. Testing: 30 minutos
4. **TOTAL: 3.5 horas** ← LISTO PARA LUNES ✅
