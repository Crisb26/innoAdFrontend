package com.innoad.modules.admin.service;

import com.innoad.dto.respuesta.RespuestaAuditoria;
import com.innoad.dto.respuesta.RespuestaEstadisticas;
import com.innoad.dto.respuesta.RespuestaUsuarioAdmin;
import com.innoad.modules.admin.domain.Auditoria;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import com.innoad.modules.content.repository.RepositorioContenido;
import com.innoad.modules.content.repository.RepositorioPublicidad;
import com.innoad.modules.screens.repository.RepositorioPantalla;
import com.innoad.shared.dto.RolUsuario;
import com.innoad.modules.admin.repository.RepositorioAuditoria;
import com.innoad.modules.ia.repository.RepositorioConversacionIA;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para funcionalidades administrativas del sistema.
 * Gestiona usuarios, estadísticas, auditoría y configuración del sistema.
 */
@Service
@RequiredArgsConstructor
public class ServicioAdministracion {

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioAuditoria repositorioAuditoria;
    private final RepositorioContenido repositorioContenido;
    private final RepositorioPantalla repositorioPantalla;
    private final RepositorioPublicidad repositorioPublicidad;
    private final RepositorioConversacionIA repositorioConversacionIA;

    /**
     * Obtiene todos los usuarios del sistema
     */
    @Transactional(readOnly = true)
    public List<RespuestaUsuarioAdmin> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = repositorioUsuario.findAllByOrderByFechaRegistroDesc();
        return usuarios.stream()
                .map(this::convertirAUsuarioAdmin)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un usuario por ID
     */
    @Transactional(readOnly = true)
    public RespuestaUsuarioAdmin obtenerUsuarioPorId(Long id) {
        Usuario usuario = repositorioUsuario.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertirAUsuarioAdmin(usuario);
    }

    /**
     * Busca usuarios por término de búsqueda
     */
    @Transactional(readOnly = true)
    public List<RespuestaUsuarioAdmin> buscarUsuarios(String termino) {
        List<Usuario> usuarios = repositorioUsuario.buscarUsuarios(termino);
        return usuarios.stream()
                .map(this::convertirAUsuarioAdmin)
                .collect(Collectors.toList());
    }

    /**
     * Activa o desactiva un usuario
     */
    @Transactional
    public RespuestaUsuarioAdmin cambiarEstadoUsuario(Long usuarioId, Boolean activo, Usuario administrador) {
        if (!administrador.esAdministrador()) {
            throw new RuntimeException("Solo los administradores pueden cambiar el estado de usuarios");
        }

        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.esAdministrador() && !activo) {
            throw new RuntimeException("No se puede desactivar una cuenta de administrador");
        }

        Boolean estadoAnterior = usuario.getActivo();
        usuario.setActivo(activo);
        repositorioUsuario.save(usuario);

        registrarAuditoria(
                activo ? "ACTIVAR_USUARIO" : "DESACTIVAR_USUARIO",
                "Usuario",
                usuarioId,
                administrador,
                String.format("Usuario %s cambiado de estado %s a %s",
                        usuario.getNombreUsuario(), estadoAnterior, activo),
                null,
                "EXITOSO"
        );

        return convertirAUsuarioAdmin(usuario);
    }

    /**
     * Cambia el rol de un usuario
     */
    @Transactional
    public RespuestaUsuarioAdmin cambiarRolUsuario(Long usuarioId, RolUsuario nuevoRol,
                                                    String motivo, Usuario administrador) {
        if (!administrador.esAdministrador()) {
            throw new RuntimeException("Solo los administradores pueden cambiar roles de usuarios");
        }

        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        RolUsuario rolAnterior = usuario.getRol();

        if (usuario.getId().equals(administrador.getId()) && nuevoRol != RolUsuario.ADMINISTRADOR) {
            throw new RuntimeException("No puedes cambiar tu propio rol de administrador");
        }

        usuario.setRol(nuevoRol);
        repositorioUsuario.save(usuario);

        String detalles = String.format("Usuario %s cambió de rol %s a %s. Motivo: %s",
                usuario.getNombreUsuario(), rolAnterior, nuevoRol,
                motivo != null ? motivo : "No especificado");

        registrarAuditoria(
                "CAMBIAR_ROL",
                "Usuario",
                usuarioId,
                administrador,
                detalles,
                null,
                "EXITOSO"
        );

        return convertirAUsuarioAdmin(usuario);
    }

    /**
     * Desbloquea un usuario bloqueado
     */
    @Transactional
    public RespuestaUsuarioAdmin desbloquearUsuario(Long usuarioId, Usuario administrador) {
        if (!administrador.esAdministrador()) {
            throw new RuntimeException("Solo los administradores pueden desbloquear usuarios");
        }

        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setFechaBloqueo(null);
        usuario.setIntentosFallidos(0);
        repositorioUsuario.save(usuario);

        registrarAuditoria(
                "DESBLOQUEAR_USUARIO",
                "Usuario",
                usuarioId,
                administrador,
                String.format("Usuario %s desbloqueado", usuario.getNombreUsuario()),
                null,
                "EXITOSO"
        );

        return convertirAUsuarioAdmin(usuario);
    }

    /**
     * Obtiene estadísticas globales del sistema
     */
    @Transactional(readOnly = true)
    public RespuestaEstadisticas obtenerEstadisticas() {
        Long totalUsuarios = repositorioUsuario.count();
        Long usuariosActivos = repositorioUsuario.contarUsuariosActivos();
        Long usuariosInactivos = repositorioUsuario.contarUsuariosInactivos();
        Long usuariosVerificados = repositorioUsuario.countByVerificado(true);
        Long usuariosNoVerificados = repositorioUsuario.countByVerificado(false);

        LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
        Long usuariosBloqueados = (long) repositorioUsuario.encontrarUsuariosBloqueados(hace24Horas).size();

        Map<String, Long> usuariosPorRol = new HashMap<>();
        for (RolUsuario rol : RolUsuario.values()) {
            usuariosPorRol.put(rol.name(), repositorioUsuario.countByRol(rol));
        }

        Long totalPantallas = repositorioPantalla.count();
        Long pantallasActivas = repositorioPantalla.countByActivoTrue();

        Long totalContenidos = repositorioContenido.count();
        Long contenidosActivos = repositorioContenido.countByActivoTrue();

        Long totalPublicidades = repositorioPublicidad.count();
        Long conversacionesIA = repositorioConversacionIA.count();

        Map<String, Object> estadisticasAdicionales = new HashMap<>();
        estadisticasAdicionales.put("registrosAuditoria", repositorioAuditoria.count());
        estadisticasAdicionales.put("ultimaActualizacion", LocalDateTime.now());

        return RespuestaEstadisticas.builder()
                .totalUsuarios(totalUsuarios)
                .usuariosActivos(usuariosActivos)
                .usuariosInactivos(usuariosInactivos)
                .usuariosVerificados(usuariosVerificados)
                .usuariosNoVerificados(usuariosNoVerificados)
                .usuariosBloqueados(usuariosBloqueados)
                .usuariosPorRol(usuariosPorRol)
                .totalPantallas(totalPantallas)
                .pantallasActivas(pantallasActivas)
                .totalContenidos(totalContenidos)
                .contenidosActivos(contenidosActivos)
                .totalPublicidades(totalPublicidades)
                .conversacionesIA(conversacionesIA)
                .estadisticasAdicionales(estadisticasAdicionales)
                .build();
    }

    /**
     * Obtiene registros de auditoría paginados
     */
    @Transactional(readOnly = true)
    public List<RespuestaAuditoria> obtenerAuditoria(int pagina, int tamano) {
        PageRequest pageRequest = PageRequest.of(pagina, tamano);
        List<Auditoria> registros = repositorioAuditoria.findAllByOrderByFechaHoraDesc(pageRequest).getContent();

        return registros.stream()
                .map(this::convertirAAuditoriaRespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene auditoría por usuario
     */
    @Transactional(readOnly = true)
    public List<RespuestaAuditoria> obtenerAuditoriaPorUsuario(Long usuarioId) {
        List<Auditoria> registros = repositorioAuditoria.findByUsuarioId(usuarioId);

        return registros.stream()
                .map(this::convertirAAuditoriaRespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene auditoría entre fechas
     */
    @Transactional(readOnly = true)
    public List<RespuestaAuditoria> obtenerAuditoriaEntreFechas(LocalDateTime inicio, LocalDateTime fin) {
        List<Auditoria> registros = repositorioAuditoria.encontrarEntreFechas(inicio, fin);

        return registros.stream()
                .map(this::convertirAAuditoriaRespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Registra una acción en auditoría
     */
    @Transactional
    public void registrarAuditoria(String accion, String entidad, Long entidadId,
                                   Usuario usuario, String detalles,
                                   String direccionIP, String resultado) {
        Auditoria registro = Auditoria.builder()
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .usuarioNombre(usuario != null ? usuario.getNombreCompleto() : "Sistema")
                .usuarioId(usuario != null ? usuario.getId() : null)
                .detalles(detalles)
                .direccionIP(direccionIP)
                .fechaHora(LocalDateTime.now())
                .resultado(resultado)
                .build();

        repositorioAuditoria.save(registro);
    }

    /**
     * Elimina usuario (solo si no tiene contenido asociado)
     */
    @Transactional
    public void eliminarUsuario(Long usuarioId, Usuario administrador) {
        if (!administrador.esAdministrador()) {
            throw new RuntimeException("Solo los administradores pueden eliminar usuarios");
        }

        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.esAdministrador()) {
            throw new RuntimeException("No se puede eliminar una cuenta de administrador");
        }

        if (usuario.getId().equals(administrador.getId())) {
            throw new RuntimeException("No puedes eliminar tu propia cuenta");
        }

        registrarAuditoria(
                "ELIMINAR_USUARIO",
                "Usuario",
                usuarioId,
                administrador,
                String.format("Usuario %s eliminado permanentemente", usuario.getNombreUsuario()),
                null,
                "EXITOSO"
        );

        repositorioUsuario.delete(usuario);
    }

    /**
     * Convierte entidad Usuario a DTO RespuestaUsuarioAdmin
     */
    private RespuestaUsuarioAdmin convertirAUsuarioAdmin(Usuario usuario) {
        return RespuestaUsuarioAdmin.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombreUsuario())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(usuario.getRol())
                .telefono(usuario.getTelefono())
                .empresa(usuario.getEmpresa())
                .cargo(usuario.getCargo())
                .activo(usuario.getActivo())
                .verificado(usuario.getVerificado())
                .fechaRegistro(usuario.getFechaRegistro())
                .ultimoAcceso(usuario.getUltimoAcceso())
                .intentosFallidos(usuario.getIntentosFallidos())
                .fechaBloqueo(usuario.getFechaBloqueo())
                .build();
    }

    /**
     * Convierte entidad Auditoria a DTO RespuestaAuditoria
     */
    private RespuestaAuditoria convertirAAuditoriaRespuesta(Auditoria auditoria) {
        return RespuestaAuditoria.builder()
                .id(auditoria.getId())
                .accion(auditoria.getAccion())
                .entidad(auditoria.getEntidad())
                .entidadId(auditoria.getEntidadId())
                .usuarioNombre(auditoria.getUsuarioNombre())
                .usuarioId(auditoria.getUsuarioId())
                .detalles(auditoria.getDetalles())
                .direccionIP(auditoria.getDireccionIP())
                .fechaHora(auditoria.getFechaHora())
                .resultado(auditoria.getResultado())
                .build();
    }
}
