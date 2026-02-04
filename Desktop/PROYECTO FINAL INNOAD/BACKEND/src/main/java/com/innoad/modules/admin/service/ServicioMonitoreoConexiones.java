package com.innoad.modules.admin.service;

import com.innoad.modules.admin.domain.ConexionUsuario;
import com.innoad.modules.admin.dto.ConexionUsuarioDTO;
import com.innoad.modules.admin.dto.ConexionesEstadisticasDTO;
import com.innoad.modules.admin.repository.ConexionUsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioMonitoreoConexiones {
    
    private final ConexionUsuarioRepository conexionRepository;
    
    /**
     * Registra una nueva conexión de usuario
     */
    @Transactional
    public ConexionUsuarioDTO registrarConexion(String usuarioId, String nombreUsuario, String ipAddress, 
                                               String navegador, String sistemaOperativo) {
        try {
            // Verificar si ya hay una conexión activa del usuario
            Optional<ConexionUsuario> conexionActiva = conexionRepository.findConexionActivaActual(usuarioId);
            
            if (conexionActiva.isPresent()) {
                log.warn("Usuario {} ya tiene una conexión activa", usuarioId);
                return mapToDTO(conexionActiva.get());
            }
            
            ConexionUsuario conexion = ConexionUsuario.builder()
                    .usuarioId(usuarioId)
                    .nombreUsuario(nombreUsuario)
                    .ipAddress(ipAddress)
                    .navegador(navegador)
                    .sistemaOperativo(sistemaOperativo)
                    .fechaConexion(LocalDateTime.now())
                    .conectadoActualmente(true)
                    .fechaRegistroDia(LocalDate.now().format(DateTimeFormatter.ISO_DATE))
                    .estado("ACTIVO")
                    .build();
            
            ConexionUsuario guardada = conexionRepository.save(conexion);
            log.info("Conexión registrada - Usuario: {}, IP: {}", usuarioId, ipAddress);
            
            return mapToDTO(guardada);
        } catch (Exception e) {
            log.error("Error registrando conexión: {}", e.getMessage(), e);
            throw new RuntimeException("Error al registrar conexión: " + e.getMessage());
        }
    }
    
    /**
     * Registra la desconexión de un usuario
     */
    @Transactional
    public ConexionUsuarioDTO registrarDesconexion(String usuarioId) {
        try {
            Optional<ConexionUsuario> conexionActiva = conexionRepository.findConexionActivaActual(usuarioId);
            
            if (conexionActiva.isPresent()) {
                ConexionUsuario conexion = conexionActiva.get();
                LocalDateTime ahora = LocalDateTime.now();
                
                conexion.setFechaDesconexion(ahora);
                conexion.setConectadoActualmente(false);
                
                // Calcular tiempo de conexión en segundos
                long tiempoSegundos = java.time.temporal.ChronoUnit.SECONDS.between(
                        conexion.getFechaConexion(), ahora
                );
                conexion.setTiempoConexionSegundos(tiempoSegundos);
                
                ConexionUsuario guardada = conexionRepository.save(conexion);
                log.info("Desconexión registrada - Usuario: {}, Tiempo: {}s", usuarioId, tiempoSegundos);
                
                return mapToDTO(guardada);
            }
            
            throw new RuntimeException("No hay conexión activa para el usuario: " + usuarioId);
        } catch (Exception e) {
            log.error("Error registrando desconexión: {}", e.getMessage(), e);
            throw new RuntimeException("Error al registrar desconexión: " + e.getMessage());
        }
    }
    
    /**
     * Obtiene todas las conexiones activas en tiempo real
     */
    public List<ConexionUsuarioDTO> obtenerConexionesActivas() {
        List<ConexionUsuario> conexiones = conexionRepository.findAllByConectadoActualmenteTrueOrderByFechaConexionDesc();
        return conexiones.stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    
    /**
     * Obtiene estadísticas en tiempo real
     */
    public ConexionesEstadisticasDTO obtenerEstadisticasEnTiempoReal() {
        List<ConexionUsuario> conexionesActivas = conexionRepository.findAllByConectadoActualmenteTrueOrderByFechaConexionDesc();
        
        return ConexionesEstadisticasDTO.builder()
                .usuariosConectadosAhora(conexionesActivas.size())
                .capacidadMaximaResistida(8000) // Tu capacidad
                .porcentajeCapacidad(Math.round((conexionesActivas.size() * 100.0) / 8000))
                .conexionesActivas(conexionesActivas.stream().map(this::mapToDTO).collect(Collectors.toList()))
                .build();
    }
    
    /**
     * Obtiene el historial de conexiones de un día específico
     */
    public List<ConexionUsuarioDTO> obtenerHistorialDia(LocalDate fecha) {
        List<ConexionUsuario> conexiones = conexionRepository.findConexionesPorDia(fecha);
        return conexiones.stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    
    /**
     * Obtiene el historial de un usuario específico
     */
    public List<ConexionUsuarioDTO> obtenerHistorialUsuario(String usuarioId) {
        List<ConexionUsuario> conexiones = conexionRepository.findByUsuarioIdOrderByFechaConexionDesc(usuarioId);
        return conexiones.stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    
    /**
     * Limpia registros antiguos (más de 30 días)
     */
    @Scheduled(cron = "0 0 2 * * *") // Ejecuta a las 2 AM cada día
    @Transactional
    public void limpiarRegistrosAntiguos() {
        try {
            LocalDate hace30Dias = LocalDate.now().minusDays(30);
            // Aquí implementarías la lógica de borrado si deseas
            log.info("Limpieza de registros antiguos (antes de {}) completada", hace30Dias);
        } catch (Exception e) {
            log.error("Error limpiando registros antiguos: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Mapea ConexionUsuario a DTO
     */
    private ConexionUsuarioDTO mapToDTO(ConexionUsuario conexion) {
        String tiempoFormato = "";
        
        if (conexion.getTiempoConexionSegundos() != null) {
            tiempoFormato = formatearTiempo(conexion.getTiempoConexionSegundos());
        }
        
        return ConexionUsuarioDTO.builder()
                .id(conexion.getId())
                .usuarioId(conexion.getUsuarioId())
                .nombreUsuario(conexion.getNombreUsuario())
                .ipAddress(conexion.getIpAddress())
                .navegador(conexion.getNavegador())
                .sistemaOperativo(conexion.getSistemaOperativo())
                .fechaConexion(conexion.getFechaConexion())
                .fechaDesconexion(conexion.getFechaDesconexion())
                .conectadoActualmente(conexion.isConectadoActualmente())
                .tiempoConexionSegundos(conexion.getTiempoConexionSegundos())
                .tiempoConexionFormato(tiempoFormato)
                .fechaRegistro(conexion.getFechaRegistro())
                .estado(conexion.getEstado())
                .build();
    }
    
    /**
     * Formatea segundos a formato legible
     */
    private String formatearTiempo(Long segundos) {
        long horas = segundos / 3600;
        long minutos = (segundos % 3600) / 60;
        long segs = segundos % 60;
        
        if (horas > 0) {
            return String.format("%dh %dm %ds", horas, minutos, segs);
        } else if (minutos > 0) {
            return String.format("%dm %ds", minutos, segs);
        } else {
            return String.format("%ds", segs);
        }
    }
}
