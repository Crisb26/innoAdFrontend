package com.innoad.modules.admin.service;

import com.innoad.modules.admin.domain.ConfiguracionSistema;
import com.innoad.modules.admin.domain.TipoMantenimiento;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.shared.dto.RolUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioModoMantenimiento {
    
    private Map<String, Boolean> estadoMantenimiento = new HashMap<>();
    private Map<String, LocalDateTime> fechaFin = new HashMap<>();
    private Map<String, String> mensajeMantenimiento = new HashMap<>();
    
    private static final String CLAVE_MANTENIMIENTO = "MODO_MANTENIMIENTO";
    
    @Transactional
    public void activarModoMantenimiento(Usuario administrador, String codigoSeguridad, String mensaje, 
                                         LocalDateTime fechaFinEstimada, TipoMantenimiento tipoMantenimiento,
                                         List<RolUsuario> rolesAfectados, List<RolUsuario> rolesExcluidos,
                                         String urlContactoSoporte) {
        estadoMantenimiento.put(CLAVE_MANTENIMIENTO, true);
        this.fechaFin.put(CLAVE_MANTENIMIENTO, fechaFinEstimada);
        mensajeMantenimiento.put(CLAVE_MANTENIMIENTO, mensaje);
        log.info("Modo mantenimiento activado por {}. Fecha estimada de fin: {}", administrador.getEmail(), fechaFinEstimada);
    }
    
    @Transactional
    public void desactivarModoMantenimiento(Usuario administrador, String codigoSeguridad) {
        estadoMantenimiento.put(CLAVE_MANTENIMIENTO, false);
        this.fechaFin.remove(CLAVE_MANTENIMIENTO);
        mensajeMantenimiento.remove(CLAVE_MANTENIMIENTO);
        log.info("Modo mantenimiento desactivado por {}", administrador.getEmail());
    }
    
    public boolean estaModoMantenimiento() {
        return estadoMantenimiento.getOrDefault(CLAVE_MANTENIMIENTO, false);
    }
    
    public Boolean esModoMantenimientoActivo() {
        return estaModoMantenimiento();
    }
    
    public String obtenerMensajeMantenimiento() {
        return mensajeMantenimiento.getOrDefault(CLAVE_MANTENIMIENTO, 
            "El sistema se encuentra en mantenimiento. Por favor intenta más tarde.");
    }
    
    public Optional<LocalDateTime> obtenerFechaFin() {
        return Optional.ofNullable(fechaFin.get(CLAVE_MANTENIMIENTO));
    }
    
    public Map<String, Object> obtenerEstado() {
        Map<String, Object> estado = new HashMap<>();
        estado.put("activo", estaModoMantenimiento());
        estado.put("mensaje", obtenerMensajeMantenimiento());
        estado.put("fechaFin", obtenerFechaFin().orElse(null));
        return estado;
    }
}
