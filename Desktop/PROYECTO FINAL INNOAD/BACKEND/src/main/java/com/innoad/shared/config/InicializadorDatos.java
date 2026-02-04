package com.innoad.shared.config;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.shared.dto.RolUsuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Inicializa datos básicos al arrancar la aplicación si no existen usuarios.
 * Crea cuentas por defecto para facilitar pruebas locales y la integración con el frontend.
 * No sobrescribe datos existentes.
 */
@Component
@RequiredArgsConstructor
public class InicializadorDatos {

    private static final Logger log = LoggerFactory.getLogger(InicializadorDatos.class);

    private final RepositorioUsuario repositorioUsuario;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void inicializar() {
        long total = repositorioUsuario.count();
        if (total > 0) {
            log.info("InicializadorDatos: usuarios existentes detectados ({}). No se crean cuentas por defecto.", total);
            return;
        }

        log.info("InicializadorDatos: no hay usuarios. Creando cuentas por defecto para desarrollo...");

        crearSiNoExiste(
                "admin", "admin@innoad.com", "Admin123!", "Admin", "InnoAd",
                RolUsuario.ADMINISTRADOR
        );

        crearSiNoExiste(
                "tecnico", "tecnico@innoad.com", "Tecnico123!", "Tec", "Nico",
                RolUsuario.TECNICO
        );

        crearSiNoExiste(
                "developer", "dev@innoad.com", "Dev123!", "Devel", "Oper",
                RolUsuario.DESARROLLADOR
        );

        crearSiNoExiste(
                "usuario", "usuario@innoad.com", "Usuario123!", "Usu", "Ario",
                RolUsuario.USUARIO
        );

        log.info("InicializadorDatos: cuentas por defecto creadas. Puedes iniciar sesión con 'admin' / 'Admin123!'.");
    }

    private void crearSiNoExiste(String username, String email, String rawPassword,
                                 String nombre, String apellido, RolUsuario rol) {
        if (repositorioUsuario.existsByNombreUsuario(username) || repositorioUsuario.existsByEmail(email)) {
            return;
        }

        Usuario u = Usuario.builder()
                .nombre(nombre)
                .apellido(apellido)
                .email(email)
                .nombreUsuario(username)
                .contrasena(passwordEncoder.encode(rawPassword))
                .rol(rol)
                .activo(true)
                .verificado(true) // marcamos verificado para simplificar pruebas de login
                .build();

        repositorioUsuario.save(u);
        log.info(" - Usuario '{}' ({}) creado con rol {}", username, email, rol);
    }
}
