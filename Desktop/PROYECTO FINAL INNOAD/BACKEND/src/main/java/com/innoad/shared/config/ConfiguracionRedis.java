package com.innoad.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Configuración de Redis para caché distribuido
 * Usado para cachear:
 * - Prompts de IA (configuraciones)
 * - Horarios de pantallas
 * - Información del sistema
 * - Rate limiting counters
 */
@Configuration
public class ConfiguracionRedis {

    /**
     * Configura RedisTemplate para operaciones con Redis
     * Usa JSON serialization para objetos complejos
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Serializer para strings
        StringRedisSerializer stringSerializer = new StringRedisSerializer();

        // Serializer para objetos JSON
        Jackson2JsonRedisSerializer<Object> jsonSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper objectMapper = new ObjectMapper();
        jsonSerializer.setObjectMapper(objectMapper);

        // Configurar serialización de keys y values
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);

        // Configurar serialización de hash keys y values
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
