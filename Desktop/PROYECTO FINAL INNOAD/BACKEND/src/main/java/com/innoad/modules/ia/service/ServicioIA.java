package com.innoad.modules.ia.service;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import com.innoad.modules.ia.domain.*;
import com.innoad.modules.ia.dto.DTOPromptIAPorRol;
import com.innoad.modules.ia.dto.DTORegistroInteraccionIA;
import com.innoad.modules.ia.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioIA {

    private final RepositorioPromptIAPorRol repositorioPromptIAPorRol;
    private final RepositorioHorarioAtencion repositorioHorarioAtencion;
    private final RepositorioInfoSistemaInnoAd repositorioInfoSistemaInnoAd;
    private final RepositorioRegistroInteraccionIA repositorioRegistroInteraccionIA;
    private final RepositorioUsuario repositorioUsuario;

    private static final String ZONA_HORARIA_COLOMBIA = "America/Bogota";

    @Transactional(readOnly = true)
    public PromptIAPorRol obtenerPromptParaRol(String rol) {
        log.info("Obteniendo prompt para rol: {}", rol);
        return repositorioPromptIAPorRol.obtenerPromptActivoPorRol(rol)
                .orElseThrow(() -> new RuntimeException("No se encontró prompt para el rol: " + rol));
    }

    @Transactional(readOnly = true)
    public boolean estaEnHorarioAtencion() {
        log.info("Verificando si es horario de atención");
        
        ZonedDateTime ahora = ZonedDateTime.now(ZoneId.of(ZONA_HORARIA_COLOMBIA));
        String diaSemana = ahora.getDayOfWeek().name();
        LocalTime horaActual = ahora.toLocalTime();

        return repositorioHorarioAtencion.obtenerHorarioPorDia(diaSemana)
                .map(horario -> !horaActual.isBefore(horario.getHoraInicio()) && 
                               !horaActual.isAfter(horario.getHoraFin()))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public String construirContextoIA() {
        log.info("Construyendo contexto IA con información del sistema");
        
        StringBuilder contexto = new StringBuilder();
        
        var nombreEmpresa = repositorioInfoSistemaInnoAd.obtenerPorClave("nombreEmpresa");
        if (nombreEmpresa.isPresent()) {
            contexto.append("Empresa: ").append(nombreEmpresa.get().getValor()).append("\n");
        }
        
        var misionEmpresa = repositorioInfoSistemaInnoAd.obtenerPorClave("misionEmpresa");
        if (misionEmpresa.isPresent()) {
            contexto.append("Misión: ").append(misionEmpresa.get().getValor()).append("\n");
        }
        
        var visionEmpresa = repositorioInfoSistemaInnoAd.obtenerPorClave("visionEmpresa");
        if (visionEmpresa.isPresent()) {
            contexto.append("Visión: ").append(visionEmpresa.get().getValor()).append("\n");
        }

        return contexto.toString();
    }

    @Transactional
    public RegistroInteraccionIA registrarInteraccion(Long idUsuario, String pregunta) {
        log.info("Registrando interacción para usuario {}", idUsuario);
        
        Usuario usuario = repositorioUsuario.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        RegistroInteraccionIA registro = new RegistroInteraccionIA();
        registro.setUsuario(usuario);
        registro.setPregunta(pregunta);
        registro.setEstado("PROCESANDO");
        registro.setFechaCreacion(LocalDateTime.now());

        return repositorioRegistroInteraccionIA.save(registro);
    }

    @Transactional
    public RegistroInteraccionIA actualizarRegistroInteraccion(Long idRegistro, String respuesta, 
                                                              Integer tokensUtilizados, Float tiempoRespuesta) {
        log.info("Actualizando registro de interacción {}", idRegistro);
        
        RegistroInteraccionIA registro = repositorioRegistroInteraccionIA.findById(idRegistro)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        registro.setRespuesta(respuesta);
        registro.setTokensUtilizados(tokensUtilizados);
        registro.setTiempoRespuesta(tiempoRespuesta);
        registro.setEstado("COMPLETADA");
        registro.setFechaCompletacion(LocalDateTime.now());

        return repositorioRegistroInteraccionIA.save(registro);
    }

    @Transactional
    public RegistroInteraccionIA registrarErrorInteraccion(Long idRegistro, String mensajeError) {
        log.info("Registrando error en interacción {}", idRegistro);
        
        RegistroInteraccionIA registro = repositorioRegistroInteraccionIA.findById(idRegistro)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        registro.setEstado("FALLIDA");
        registro.setMensajeError(mensajeError);
        registro.setFechaCompletacion(LocalDateTime.now());

        return repositorioRegistroInteraccionIA.save(registro);
    }

    @Transactional(readOnly = true)
    public Page<DTORegistroInteraccionIA> obtenerHistorialInteracciones(Long idUsuario, Pageable pageable) {
        log.info("Obteniendo historial de interacciones para usuario {}", idUsuario);
        
        return repositorioRegistroInteraccionIA.obtenerRegistrosPorUsuario(idUsuario, pageable)
                .map(this::convertirRegistroADTO);
    }

    @Transactional(readOnly = true)
    public long contarInteraccionesCompletadas(Long idUsuario) {
        return repositorioRegistroInteraccionIA.contarInteraccionesCompletadas(idUsuario);
    }

    @Transactional
    public PromptIAPorRol crearPrompt(DTOPromptIAPorRol.Crear dto) {
        log.info("Creando nuevo prompt para rol: {}", dto.getRol());

        PromptIAPorRol prompt = new PromptIAPorRol();
        prompt.setRol(dto.getRol());
        prompt.setInstruccion(dto.getInstruccion());
        prompt.setContexto(dto.getContexto());
        prompt.setTokenMaximo(dto.getTokenMaximo() != null ? dto.getTokenMaximo() : 2000);
        prompt.setTemperatura(dto.getTemperatura() != null ? dto.getTemperatura() : 0.7f);
        prompt.setActivo(true);
        prompt.setFechaCreacion(LocalDateTime.now());
        prompt.setFechaActualizacion(LocalDateTime.now());

        if (dto.getIdUsuarioCreador() != null) {
            Usuario usuario = repositorioUsuario.findById(dto.getIdUsuarioCreador())
                    .orElseThrow(() -> new RuntimeException("Usuario creador no encontrado"));
            prompt.setUsuarioCreador(usuario);
        }

        return repositorioPromptIAPorRol.save(prompt);
    }

    @Transactional
    public PromptIAPorRol actualizarPrompt(Long idPrompt, DTOPromptIAPorRol.Actualizar dto) {
        log.info("Actualizando prompt {}", idPrompt);

        PromptIAPorRol prompt = repositorioPromptIAPorRol.findById(idPrompt)
                .orElseThrow(() -> new RuntimeException("Prompt no encontrado"));

        prompt.setInstruccion(dto.getInstruccion());
        prompt.setContexto(dto.getContexto());
        prompt.setTokenMaximo(dto.getTokenMaximo());
        prompt.setTemperatura(dto.getTemperatura());
        prompt.setFechaActualizacion(LocalDateTime.now());

        return repositorioPromptIAPorRol.save(prompt);
    }

    @Transactional(readOnly = true)
    public List<DTOPromptIAPorRol> obtenerPromptsActivos() {
        log.info("Obteniendo prompts activos");
        
        return repositorioPromptIAPorRol.obtenerPromptsActivos()
                .stream()
                .map(this::convertirPromptADTO)
                .collect(Collectors.toList());
    }

    private DTORegistroInteraccionIA convertirRegistroADTO(RegistroInteraccionIA registro) {
        return DTORegistroInteraccionIA.builder()
                .id(registro.getId())
                .idUsuario(registro.getUsuario().getId())
                .nombreUsuario(registro.getUsuario().getNombre())
                .pregunta(registro.getPregunta())
                .respuesta(registro.getRespuesta())
                .estado(registro.getEstado())
                .tokensUtilizados(registro.getTokensUtilizados())
                .tiempoRespuesta(registro.getTiempoRespuesta())
                .mensajeError(registro.getMensajeError())
                .fechaCreacion(registro.getFechaCreacion())
                .fechaCompletacion(registro.getFechaCompletacion())
                .build();
    }

    private DTOPromptIAPorRol convertirPromptADTO(PromptIAPorRol prompt) {
        return DTOPromptIAPorRol.builder()
                .id(prompt.getId())
                .rol(prompt.getRol())
                .instruccion(prompt.getInstruccion())
                .contexto(prompt.getContexto())
                .tokenMaximo(prompt.getTokenMaximo())
                .temperatura(prompt.getTemperatura())
                .activo(prompt.getActivo())
                .fechaCreacion(prompt.getFechaCreacion())
                .fechaActualizacion(prompt.getFechaActualizacion())
                .idUsuarioCreador(prompt.getUsuarioCreador() != null ? prompt.getUsuarioCreador().getId() : null)
                .build();
    }
}
