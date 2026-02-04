package com.innoad.servicio;

import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.TimeUnit;

/**
 * Servicio de caché con Redis
 * Cachea:
 * - Configuraciones de IA (prompts, modelos)
 * - Horarios de pantallas
 * - Información del sistema
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioCacheRedis {

    private final RedisTemplate<String, Object> redisTemplate;

    // Prefijos para las claves en Redis
    private static final String PREFIJO_CONFIG_IA = "config:ia:";
    private static final String PREFIJO_HORARIO_PANTALLA = "horario:pantalla:";
    private static final String PREFIJO_INFO_SISTEMA = "info:sistema:";
    private static final String PREFIJO_RATE_LIMIT = "rate-limit:";

    /**
     * Cachea una configuración de IA por 24 horas
     */
    public void cachearConfiguracionIA(String idConfig, Object config) {
        try {
            String clave = PREFIJO_CONFIG_IA + idConfig;
            redisTemplate.opsForValue().set(clave, config, 24, TimeUnit.HOURS);
            log.info("Configuración IA cacheada: {}", idConfig);
        } catch (Exception e) {
            log.error("Error cacheando configuración IA: {}", e.getMessage());
        }
    }

    /**
     * Obtiene configuración de IA del caché
     */
    public Object obtenerConfiguracionIA(String idConfig) {
        try {
            String clave = PREFIJO_CONFIG_IA + idConfig;
            return redisTemplate.opsForValue().get(clave);
        } catch (Exception e) {
            log.error("Error obteniendo configuración IA del caché: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Cachea horario de pantalla por 12 horas
     */
    public void cachearHorarioPantalla(String idPantalla, Object horario) {
        try {
            String clave = PREFIJO_HORARIO_PANTALLA + idPantalla;
            redisTemplate.opsForValue().set(clave, horario, 12, TimeUnit.HOURS);
            log.info("Horario pantalla cacheado: {}", idPantalla);
        } catch (Exception e) {
            log.error("Error cacheando horario pantalla: {}", e.getMessage());
        }
    }

    /**
     * Obtiene horario de pantalla del caché
     */
    public Object obtenerHorarioPantalla(String idPantalla) {
        try {
            String clave = PREFIJO_HORARIO_PANTALLA + idPantalla;
            return redisTemplate.opsForValue().get(clave);
        } catch (Exception e) {
            log.error("Error obteniendo horario pantalla del caché: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Cachea información del sistema por 1 hora
     */
    public void cachearInfoSistema(String clave, Object info) {
        try {
            String claveCompleta = PREFIJO_INFO_SISTEMA + clave;
            redisTemplate.opsForValue().set(claveCompleta, info, 1, TimeUnit.HOURS);
            log.info("Info sistema cacheada: {}", clave);
        } catch (Exception e) {
            log.error("Error cacheando info sistema: {}", e.getMessage());
        }
    }

    /**
     * Obtiene información del sistema del caché
     */
    public Object obtenerInfoSistema(String clave) {
        try {
            String claveCompleta = PREFIJO_INFO_SISTEMA + clave;
            return redisTemplate.opsForValue().get(claveCompleta);
        } catch (Exception e) {
            log.error("Error obteniendo info sistema del caché: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Incrementa contador para rate limiting
     * Retorna el nuevo valor
     */
    public long incrementarContadorRateLimit(String idUsuario, String tipoOperacion, long segundosExpiracion) {
        try {
            String clave = PREFIJO_RATE_LIMIT + tipoOperacion + ":" + idUsuario;
            Long nuevoValor = redisTemplate.opsForValue().increment(clave);
            
            // Solo establecer expiración la primera vez
            if (nuevoValor != null && nuevoValor == 1) {
                redisTemplate.expire(clave, segundosExpiracion, TimeUnit.SECONDS);
            }
            
            return nuevoValor != null ? nuevoValor : 0;
        } catch (Exception e) {
            log.error("Error incrementando contador rate limit: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Obtiene contador actual para rate limiting
     */
    public long obtenerContadorRateLimit(String idUsuario, String tipoOperacion) {
        try {
            String clave = PREFIJO_RATE_LIMIT + tipoOperacion + ":" + idUsuario;
            Object valor = redisTemplate.opsForValue().get(clave);
            return valor != null ? Long.parseLong(valor.toString()) : 0;
        } catch (Exception e) {
            log.error("Error obteniendo contador rate limit: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Limpia caché de una configuración de IA
     */
    public void limpiarConfiguracionIA(String idConfig) {
        try {
            String clave = PREFIJO_CONFIG_IA + idConfig;
            redisTemplate.delete(clave);
            log.info("Configuración IA limpiada del caché: {}", idConfig);
        } catch (Exception e) {
            log.error("Error limpiando configuración IA del caché: {}", e.getMessage());
        }
    }

    /**
     * Limpia caché de horario de pantalla
     */
    public void limpiarHorarioPantalla(String idPantalla) {
        try {
            String clave = PREFIJO_HORARIO_PANTALLA + idPantalla;
            redisTemplate.delete(clave);
            log.info("Horario pantalla limpiado del caché: {}", idPantalla);
        } catch (Exception e) {
            log.error("Error limpiando horario pantalla del caché: {}", e.getMessage());
        }
    }

    /**
     * Limpia toda información de sistema del caché
     */
    public void limpiarTodoInfoSistema() {
        try {
            var claves = redisTemplate.keys(PREFIJO_INFO_SISTEMA + "*");
            if (claves != null && !claves.isEmpty()) {
                redisTemplate.delete(claves);
                log.info("Info sistema limpiada del caché");
            }
        } catch (Exception e) {
            log.error("Error limpiando info sistema del caché: {}", e.getMessage());
        }
    }
}
