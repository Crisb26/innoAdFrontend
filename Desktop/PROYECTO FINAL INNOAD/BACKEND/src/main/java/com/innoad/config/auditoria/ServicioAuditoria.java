package com.innoad.config.auditoria;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioAuditoria {
    
    private final RepositorioAuditoria repositorioAuditoria;
    
    /**
     * Registra un acceso en auditoría
     */
    @Transactional
    public void registrarAcceso(String usuarioId, String nombreUsuario, String ipAddress,
                               String tipoAccion, String recursoAccedido, String metodo,
                               String navegador, String sistemaOperativo) {
        try {
            RegistroAuditoria registro = RegistroAuditoria.builder()
                    .usuarioId(usuarioId)
                    .nombreUsuario(nombreUsuario)
                    .ipAddress(ipAddress)
                    .tipoAccion(tipoAccion)
                    .recursoAccedido(recursoAccedido)
                    .metodo(metodo)
                    .timestamp(LocalDateTime.now())
                    .resultado("EXITOSO")
                    .navegador(navegador)
                    .sistemaOperativo(sistemaOperativo)
                    .esSospechoso(false)
                    .build();
            
            repositorioAuditoria.save(registro);
            
        } catch (Exception e) {
            log.error("Error registrando auditoría: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Registra un acceso fallido como sospechoso
     */
    @Transactional
    public void registrarAccesoFallido(String usuarioId, String ipAddress, 
                                      String tipoAccion, String razon) {
        try {
            RegistroAuditoria registro = RegistroAuditoria.builder()
                    .usuarioId(usuarioId)
                    .nombreUsuario(usuarioId)
                    .ipAddress(ipAddress)
                    .tipoAccion(tipoAccion)
                    .recursoAccedido("BLOQUEADO")
                    .metodo("UNKNOWN")
                    .timestamp(LocalDateTime.now())
                    .resultado("FALLIDO")
                    .esSospechoso(true)
                    .razonSospechaActividad(razon)
                    .build();
            
            repositorioAuditoria.save(registro);
            
            log.warn("ACCESO SOSPECHOSO REGISTRADO - Usuario: {}, IP: {}, Razón: {}", 
                usuarioId, ipAddress, razon);
            
        } catch (Exception e) {
            log.error("Error registrando acceso fallido: {}", e.getMessage(), e);
        }
    }
}
