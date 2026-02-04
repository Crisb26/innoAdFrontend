package com.innoad.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

/**
 * Configuración de WebSocket para chat en tiempo real
 * Habilita STOMP (Simple Text Oriented Messaging Protocol)
 * sobre WebSocket para mensajería bidireccional
 */
@Configuration
@EnableWebSocketMessageBroker
public class ConfiguracionWebSocket implements WebSocketMessageBrokerConfigurer {
    
    /**
     * Configura el message broker en memoria
     * Las aplicaciones de producción usarían RabbitMQ o ActiveMQ
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefijo para mensajes enviados desde servidor a cliente
        config.enableSimpleBroker(
            "/tema/chat",           // Para mensajes de chat
            "/tema/notificaciones",  // Para notificaciones
            "/tema/presencia"        // Para indicador de escritura
        );
        
        // Prefijo para mensajes desde cliente a servidor
        // Los handles en controlador deben empezar con /aplicacion/
        config.setApplicationDestinationPrefixes("/aplicacion");
        
        // Usuario conectado (para envío directo usuario a usuario)
        config.setUserDestinationPrefix("/usuario");
    }
    
    /**
     * Registra el endpoint WebSocket
     * El cliente se conecta a: ws://localhost:8080/ws/chat
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat")
            // Habilitar SockJS como fallback si WebSocket no está disponible
            .setAllowedOrigins("*")
            .addInterceptors(new HttpSessionHandshakeInterceptor());
        
        registry.addEndpoint("/ws/chat")
            .setAllowedOrigins("*")
            .withSockJS();
    }
}
