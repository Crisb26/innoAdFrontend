package com.innoad.modules.mantenimiento.servicio;

import com.innoad.modules.mantenimiento.dominio.Mantenimiento;
import com.innoad.modules.mantenimiento.dto.MantenimientoDTO;
import com.innoad.modules.mantenimiento.repositorio.RepositorioMantenimiento;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServicioMantenimiento {
    
    private final RepositorioMantenimiento repositorioMantenimiento;
    private final RepositorioUsuario repositorioUsuario;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Activar mantenimiento
     */
    public MantenimientoDTO activarMantenimiento(MantenimientoDTO dto, String usuarioEmail) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // Validar que sea admin
        if (usuario.getRol() == null || !usuario.getRol().name().equals("ADMIN")) {
            throw new IllegalArgumentException("Solo los administradores pueden activar mantenimiento");
        }
        
        // Desactivar mantenimiento anterior si existe
        repositorioMantenimiento.getMantenimientoActivo()
            .ifPresent(m -> {
                m.setEstado(Mantenimiento.EstadoMantenimiento.INACTIVO);
                repositorioMantenimiento.save(m);
            });
        
        Mantenimiento mantenimiento = Mantenimiento.builder()
            .estado(Mantenimiento.EstadoMantenimiento.ACTIVO)
            .motivo(dto.getMotivo())
            .mensaje(dto.getMensaje())
            .passwordHash(passwordEncoder.encode(dto.getPassword()))
            .fechaInicio(dto.getFechaInicio() != null ? dto.getFechaInicio() : LocalDateTime.now())
            .fechaFin(dto.getFechaFin())
            .permiteLectura(dto.getPermiteLectura())
            .bloqueaGraficos(dto.getBloqueaGraficos())
            .bloqueaPublicacion(dto.getBloqueaPublicacion())
            .bloqueaDescarga(dto.getBloqueaDescarga())
            .creadoPor(usuarioEmail)
            .build();
        
        mantenimiento = repositorioMantenimiento.save(mantenimiento);
        log.info("Mantenimiento activado por: {}", usuarioEmail);
        
        return MantenimientoDTO.fromEntity(mantenimiento);
    }
    
    /**
     * Desactivar mantenimiento
     */
    public void desactivarMantenimiento(String usuarioEmail) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // Validar que sea admin
        if (usuario.getRol() == null || !usuario.getRol().name().equals("ADMIN")) {
            throw new IllegalArgumentException("Solo los administradores pueden desactivar mantenimiento");
        }
        
        repositorioMantenimiento.getMantenimientoActivo()
            .ifPresent(m -> {
                m.setEstado(Mantenimiento.EstadoMantenimiento.INACTIVO);
                repositorioMantenimiento.save(m);
                log.info("Mantenimiento desactivado por: {}", usuarioEmail);
            });
    }
    
    /**
     * Obtener estado actual de mantenimiento
     */
    @Transactional(readOnly = true)
    public MantenimientoDTO getMantenimientoActual() {
        return repositorioMantenimiento.getMantenimientoActivo()
            .map(m -> {
                // Si pasó la fecha de fin, desactivar
                if (m.getFechaFin() != null && LocalDateTime.now().isAfter(m.getFechaFin())) {
                    m.setEstado(Mantenimiento.EstadoMantenimiento.INACTIVO);
                    repositorioMantenimiento.save(m);
                    return null;
                }
                return MantenimientoDTO.fromEntity(m);
            })
            .orElse(null);
    }
    
    /**
     * Verificar contraseña de acceso durante mantenimiento
     */
    @Transactional(readOnly = true)
    public boolean verificarContraseña(String password) {
        return repositorioMantenimiento.getMantenimientoActivo()
            .map(m -> passwordEncoder.matches(password, m.getPasswordHash()))
            .orElse(false);
    }
    
    /**
     * Actualizar configuración de mantenimiento
     */
    public MantenimientoDTO actualizar(Long id, MantenimientoDTO dto, String usuarioEmail) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        if (!usuario.getRol().equals("ADMIN") && !usuario.getRol().name().equals("ADMINISTRADOR")) {
            throw new IllegalArgumentException("Solo los administradores pueden actualizar mantenimiento");
        }
        
        var mantenimiento = repositorioMantenimiento.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Mantenimiento no encontrado"));
        
        mantenimiento.setMotivo(dto.getMotivo());
        mantenimiento.setMensaje(dto.getMensaje());
        mantenimiento.setFechaFin(dto.getFechaFin());
        mantenimiento.setPermiteLectura(dto.getPermiteLectura());
        mantenimiento.setBloqueaGraficos(dto.getBloqueaGraficos());
        mantenimiento.setBloqueaPublicacion(dto.getBloqueaPublicacion());
        mantenimiento.setBloqueaDescarga(dto.getBloqueaDescarga());
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            mantenimiento.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        
        mantenimiento = repositorioMantenimiento.save(mantenimiento);
        log.info("Mantenimiento actualizado por: {}", usuarioEmail);
        
        return MantenimientoDTO.fromEntity(mantenimiento);
    }
    
    /**
     * Obtener último mantenimiento registrado
     */
    @Transactional(readOnly = true)
    public MantenimientoDTO getUltimo() {
        return repositorioMantenimiento.getUltimoMantenimiento()
            .map(MantenimientoDTO::fromEntity)
            .orElse(null);
    }
}
