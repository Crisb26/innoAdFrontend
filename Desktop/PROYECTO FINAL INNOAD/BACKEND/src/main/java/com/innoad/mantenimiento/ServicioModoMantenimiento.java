package com.innoad.mantenimiento;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServicioModoMantenimiento {
    private final RepositorioModoMantenimiento repositorio;

    public ModoMantenimiento obtenerEstado() {
        return repositorio.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    ModoMantenimiento nuevo = new ModoMantenimiento();
                    nuevo.setActivo(false);
                    return repositorio.save(nuevo);
                });
    }

    public ModoMantenimiento activarMantenimiento(String mensaje, String usuarioActivador) {
        ModoMantenimiento config = obtenerEstado();
        config.setActivo(true);
        config.setMensaje(mensaje);
        config.setInicio(LocalDateTime.now());
        config.setUsuarioActivador(usuarioActivador);
        return repositorio.save(config);
    }

    public ModoMantenimiento desactivarMantenimiento() {
        ModoMantenimiento config = obtenerEstado();
        config.setActivo(false);
        config.setFin(LocalDateTime.now());
        return repositorio.save(config);
    }

    public boolean estaEnMantenimiento() {
        return obtenerEstado().getActivo();
    }

    public String obtenerMensajeMantenimiento() {
        return obtenerEstado().getMensaje();
    }

    public ModoMantenimiento actualizarMensaje(String mensaje) {
        ModoMantenimiento config = obtenerEstado();
        config.setMensaje(mensaje);
        return repositorio.save(config);
    }
}
