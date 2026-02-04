package com.innoad.shared.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Comprueba variables de entorno críticas al arrancar la aplicación.
 * Si falta una variable obligatoria en el entorno de ejecución, lanza RuntimeException
 * para evitar arrancar en un estado mal configurado.
 */
@Component
@RequiredArgsConstructor
public class StartupChecks implements ApplicationRunner {

    private final Environment env;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<String> missing = new ArrayList<>();
        String[] profiles = env.getActiveProfiles();
        boolean isProd = false;

        for (String p : profiles) {
            if ("prod".equalsIgnoreCase(p)) {
                isProd = true;
                break;
            }
        }

        if (isProd) {
            String jwt = env.getProperty("jwt.secret");
            if (jwt == null || jwt.isBlank() || jwt.contains("MiClaveSecreta")) {
                missing.add("jwt.secret (debe configurarse para producción)");
            }

            String db = env.getProperty("spring.datasource.url");
            if (db == null || db.contains("h2:mem")) {
                missing.add("spring.datasource.url (debe usar PostgreSQL en producción)");
            }

            String mailUser = env.getProperty("spring.mail.username");
            String mailPass = env.getProperty("spring.mail.password");
            if (mailUser == null || mailUser.isBlank() || mailUser.contains("tu-email")) {
                missing.add("spring.mail.username");
            }
            if (mailPass == null || mailPass.isBlank() || mailPass.contains("tu-password")) {
                missing.add("spring.mail.password");
            }

            if (!missing.isEmpty()) {
                String msg = "Variables de configuración requeridas para producción: " + String.join(", ", missing);
                throw new RuntimeException(msg);
            }
        }
    }
}
