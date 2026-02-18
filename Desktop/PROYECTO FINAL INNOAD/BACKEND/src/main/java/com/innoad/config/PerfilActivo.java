package com.innoad.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

/**
 * Verifica y registra el perfil activo al iniciar la aplicación
 * Asegura que solo un perfil de despliegue esté activo (server o azure)
 */
@Slf4j
@Configuration
public class PerfilActivo implements CommandLineRunner {

    @Autowired
    private Environment environment;

    @Override
    public void run(String... args) throws Exception {
        String[] perfilesActivos = environment.getActiveProfiles();

        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║                    INNOAD STARTUP INFO                      ║");
        log.info("╚════════════════════════════════════════════════════════════╝");

        if (perfilesActivos.length == 0) {
            log.warn("WARNING: NO ACTIVE PROFILES - Using default configuration");
            log.warn("Set SPRING_PROFILES_ACTIVE to 'server' or 'azure'");
        } else {
            log.info("Active Profiles: " + java.util.Arrays.toString(perfilesActivos));

            boolean isServer = java.util.Arrays.asList(perfilesActivos).contains("server");
            boolean isAzure = java.util.Arrays.asList(perfilesActivos).contains("azure");

            if (isServer && isAzure) {
                log.error("ERROR: Both 'server' and 'azure' profiles are active!");
                log.error("Choose ONE deployment mode:");
                log.error("   server: Home server with local PostgreSQL");
                log.error("   azure: Emergency deployment on Azure");
                throw new RuntimeException("Invalid configuration: multiple deployment profiles active");
            }

            if (isServer) {
                log.info("DEPLOYMENT: Home Server (PRIMARY)");
                log.info("Database: localhost:5432/innoad_db");
                log.info("Access: https://azure-pro.tail2a2f73.ts.net");
            } else if (isAzure) {
                log.info("DEPLOYMENT: Azure (EMERGENCY BACKUP)");
                log.info("Database: Azure PostgreSQL Flexible Server");
                log.info("Access: https://innoad-backend-app.region.azurecontainerapps.io");
            }
        }

        // Database connection info
        String dbUrl = environment.getProperty("spring.datasource.url");
        String dbUser = environment.getProperty("spring.datasource.username");
        log.info("Database URL: " + (dbUrl != null ? dbUrl.replaceAll("://.*@", "://***@") : "N/A"));
        log.info("Database User: " + (dbUser != null ? dbUser : "N/A"));

        log.info("Application started successfully");
    }
}
