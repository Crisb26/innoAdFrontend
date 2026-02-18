package com.innoad.modules.chat.service;

import com.innoad.modules.chat.domain.PresenciaUsuario;
import com.innoad.modules.chat.repository.RepositorioPresenciaUsuario;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestionar presencia en línea de usuarios
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioPresencia {

    private final RepositorioPresenciaUsuario repositorio;

    private static final int MINUTOS_INACTIVIDAD_AUSENTE = 30;

    /**
     * Registrar que usuario está activo
     */
    @Transactional
    public void registrarActividad(Long usuarioId) {
        PresenciaUsuario presencia = repositorio.findByUsuarioId(usuarioId)
                .orElseGet(() -> PresenciaUsuario.builder()
                        .usuarioId(usuarioId)
                        .estado(PresenciaUsuario.EstadoPresencia.ONLINE)
                        .build());

        presencia.registrarActividad();
        repositorio.save(presencia);

        log.debug("Presencia actualizada: Usuario {} activo", usuarioId);
    }

    /**
     * Conectar usuario (login)
     */
    @Transactional
    public void conectar(Usuario usuario) {
        PresenciaUsuario presencia = repositorio.findByUsuarioId(usuario.getId())
                .orElseGet(() -> PresenciaUsuario.builder()
                        .usuarioId(usuario.getId())
                        .usuario(usuario)
                        .estado(PresenciaUsuario.EstadoPresencia.ONLINE)
                        .build());

        presencia.conectar();
        repositorio.save(presencia);

        log.info("Usuario {} conectado", usuario.getNombreUsuario());
    }

    /**
     * Desconectar usuario (logout)
     */
    @Transactional
    public void desconectar(Usuario usuario) {
        repositorio.findByUsuarioId(usuario.getId()).ifPresent(presencia -> {
            presencia.desconectar();
            repositorio.save(presencia);
            log.info("Usuario {} desconectado", usuario.getNombreUsuario());
        });
    }

    /**
     * Obtener presencia de un usuario
     */
    @Transactional(readOnly = true)
    public PresenciaUsuario obtenerPresencia(Long usuarioId) {
        return repositorio.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    /**
     * Verificar si usuario está online
     */
    @Transactional(readOnly = true)
    public boolean estaOnline(Long usuarioId) {
        return repositorio.findByUsuarioId(usuarioId)
                .map(PresenciaUsuario::estaOnline)
                .orElse(false);
    }

    /**
     * Obtener todos los usuarios online
     */
    @Transactional(readOnly = true)
    public List<PresenciaUsuario> obtenerOnline() {
        return repositorio.findAllOnline();
    }

    /**
     * Obtener todos los técnicos online
     */
    @Transactional(readOnly = true)
    public List<PresenciaUsuario> obtenerTecnicosOnline() {
        return repositorio.findTecnicosOnline();
    }

    /**
     * Contar usuarios online
     */
    @Transactional(readOnly = true)
    public long contarOnline() {
        return repositorio.countOnline();
    }

    /**
     * Contar técnicos online
     */
    @Transactional(readOnly = true)
    public long contarTecnicosOnline() {
        return repositorio.findTecnicosOnline().size();
    }

    /**
     * Task programado: Actualizar estados de presencia cada 1 minuto
     * Cambia ONLINE a AUSENTE si lleva >30 minutos sin actividad
     * Cambia AUSENTE/ONLINE a OFFLINE si la sesión expiró
     */
    @Scheduled(fixedRate = 60000) // Cada 1 minuto
    @Transactional
    public void actualizarEstadosPresencia() {
        log.debug("Iniciando actualización de estados de presencia");

        List<PresenciaUsuario> todosLosUsuarios = repositorio.findAll();

        for (PresenciaUsuario presencia : todosLosUsuarios) {
            PresenciaUsuario.EstadoPresencia estadoAnterior = presencia.getEstado();
            PresenciaUsuario.EstadoPresencia estadoNuevo = calcularNuevoEstado(presencia);

            if (estadoAnterior != estadoNuevo) {
                presencia.setEstado(estadoNuevo);
                repositorio.save(presencia);

                log.debug("Estado actualizado: Usuario {} {} -> {}",
                        presencia.getUsuarioId(), estadoAnterior, estadoNuevo);
            }
        }
    }

    /**
     * Calcular nuevo estado basado en inactividad
     */
    private PresenciaUsuario.EstadoPresencia calcularNuevoEstado(PresenciaUsuario presencia) {
        if (presencia.getUltimaActividad() == null) {
            return PresenciaUsuario.EstadoPresencia.OFFLINE;
        }

        long minutosInactivos = presencia.obtenerMinutosInactividad();

        if (minutosInactivos < MINUTOS_INACTIVIDAD_AUSENTE) {
            return PresenciaUsuario.EstadoPresencia.ONLINE;
        } else if (minutosInactivos < MINUTOS_INACTIVIDAD_AUSENTE * 2) {
            return PresenciaUsuario.EstadoPresencia.AUSENTE;
        } else {
            return PresenciaUsuario.EstadoPresencia.OFFLINE;
        }
    }

    /**
     * Limpiar presencia offline > 24 horas
     */
    @Scheduled(fixedRate = 3600000) // Cada 1 hora
    @Transactional
    public void limpiarPresenciaAntiguaOffline() {
        log.debug("Limpiando presencias offline antiguas");

        LocalDateTime hace24horas = LocalDateTime.now().minusHours(24);

        repositorio.findAllOffline().stream()
                .filter(p -> p.getUltimaActividad() != null && p.getUltimaActividad().isBefore(hace24horas))
                .forEach(p -> {
                    repositorio.delete(p);
                    log.debug("Presencia eliminada: Usuario {}", p.getUsuarioId());
                });
    }
}
