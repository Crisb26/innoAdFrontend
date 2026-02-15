package com.innoad.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Configuración para servir archivos estáticos (imágenes, videos, etc.)
 */
@Configuration
public class ConfiguracionWeb implements WebMvcConfigurer {

    @Value("${innoad.storage.directory:uploads}")
    private String directorioAlmacenamiento;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Servir archivos desde el directorio de uploads
        String ubicacionRecursos = "file:" + Paths.get(directorioAlmacenamiento).toAbsolutePath().toString() + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(ubicacionRecursos)
                .setCachePeriod(3600); // Cache de 1 hora
    }
}
