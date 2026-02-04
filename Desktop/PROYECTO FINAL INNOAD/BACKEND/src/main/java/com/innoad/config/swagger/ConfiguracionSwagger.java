package com.innoad.config.swagger;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityScheme.In;
import io.swagger.v3.oas.models.security.SecurityScheme.Type;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class ConfiguracionSwagger {
    
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("🚀 InnoAd Backend API")
                .description("""
                    Sistema profesional de gestión de campañas publicitarias con IA integrada.
                    
                    **Características principales:**
                    - ✅ Gestión de campañas publicitarias
                    - ✅ Gestión de contenidos multimedia
                    - ✅ Gestión de pantallas digitales
                    - ✅ Chat IA integrado (OpenAI)
                    - ✅ Reportes y estadísticas
                    - ✅ Sistema de mantenimiento
                    - ✅ Monitoreo en tiempo real
                    - ✅ Seguridad de nivel empresarial
                    
                    **Autor:** Crisb26
                    **Base de datos:** PostgreSQL 17.6
                    **Framework:** Spring Boot 3.5.8
                    """)
                .version("2.0.0")
                .contact(new Contact()
                    .name("InnoAd Support")
                    .email("crisb26@gmail.com")
                    .url("https://innoadfrontend.netlify.app")
                )
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")
                )
            )
            .servers(Arrays.asList(
                new Server()
                    .url("https://innoad-backend.azurecontainerapps.io")
                    .description("Servidor de Producción (Azure)"),
                new Server()
                    .url("http://localhost:8080")
                    .description("Servidor Local (Desarrollo)")
            ))
            .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
            .components(new io.swagger.v3.oas.models.Components()
                .addSecuritySchemes("BearerAuth", new SecurityScheme()
                    .type(Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT Bearer Token. Obtén uno en /api/autenticacion/login")
                )
            );
    }
}
