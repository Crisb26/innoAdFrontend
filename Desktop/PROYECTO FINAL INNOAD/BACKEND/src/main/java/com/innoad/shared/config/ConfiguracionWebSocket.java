package com.innoad.shared.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración de WebSocket para chat en tiempo real
 * Usa STOMP sobre SockJS para máxima compatibilidad
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class ConfiguracionWebSocket implements WebSocketMessageBrokerConfigurer {

    /**
     * Configurar broker de mensajes
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        log.info("Configurando message broker para WebSocket");

        // Tópicos para broadcast (chats públicos)
        config.enableSimpleBroker("/topic", "/queue", "/user");

        // Prefijo de destino de aplicación (donde envían clientes)
        config.setApplicationDestinationPrefixes("/app");

        // Prefijo para destinos de usuario (para mensajes privados)
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Registrar endpoints de WebSocket
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registrando endpoint WebSocket en /ws");

        registry
            .addEndpoint("/ws")
            .setAllowedOriginPatterns(
                "http://localhost:*",           // Local development
                "http://127.0.0.1:*",           // Local IP
                "http://100.91.23.46:*",        // Home server
                "https://*.ts.net",             // Tailscale
                "https://*.netlify.app",        // Netlify
                "https://*.azurecontainerapps.io" // Azure
            )
            .withSockJS()
            .setInterceptors(new HttpSessionIdHandshakeInterceptor());
    }

    /**
     * Configurar autenticación en canales de entrada (cliente -> servidor)
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        log.info("Configurando autenticación en channel de entrada");

        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    log.debug("Cliente conectando a WebSocket");

                    // Obtener el JWT del header Authorization
                    String authorizationHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                        String token = authorizationHeader.substring(7);
                        log.debug("Token JWT recibido en WebSocket");

                        // Aquí se debería validar el JWT, pero por ahora permitimos
                        // En producción, usar JwtTokenProvider para validar
                        accessor.setUser(() -> token);
                    } else {
                        log.warn("Conexión WebSocket sin token de autenticación");
                        // Rechazar conexiones sin autenticación
                        // throw new IllegalArgumentException("Token JWT requerido");
                    }
                }

                return message;
            }
        });
    }

    /**
     * Configurar canales de salida (servidor -> cliente)
     */
    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        log.info("Configurando canal de salida WebSocket");
        registration.taskExecutor().corePoolSize(10);
    }
}
