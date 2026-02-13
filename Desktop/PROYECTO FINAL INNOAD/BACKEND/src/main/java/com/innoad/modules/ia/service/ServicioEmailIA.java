package com.innoad.modules.ia.service;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import com.innoad.modules.ia.domain.EmailConfigurado;
import com.innoad.modules.ia.domain.RegistroEmailIA;
import com.innoad.modules.ia.repository.RepositorioEmailConfigurado;
import com.innoad.modules.ia.repository.RepositorioRegistroEmailIA;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioEmailIA {

    private final RepositorioEmailConfigurado repositorioEmailConfigurado;
    private final RepositorioRegistroEmailIA repositorioRegistroEmailIA;
    private final RepositorioUsuario repositorioUsuario;
    private final JavaMailSender mailSender;

    @Transactional
    public RegistroEmailIA enviarEmail(Long idUsuario, String destinatario, String asunto, String contenido) {
        log.info("Enviando email a {} para usuario {}", destinatario, idUsuario);
        
        Usuario usuario = repositorioUsuario.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        RegistroEmailIA registro = new RegistroEmailIA();
        registro.setUsuario(usuario);
        registro.setDireccionDestinatario(destinatario);
        registro.setAsunto(asunto);
        registro.setContenido(contenido);
        registro.setEstado("PENDIENTE");
        registro.setFechaCreacion(LocalDateTime.now());

        try {
            var emailActivo = repositorioEmailConfigurado.obtenerEmailsActivos()
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay email configurado"));

            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(emailActivo.getDireccionEmail());
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(contenido);

            mailSender.send(mensaje);

            registro.setEstado("ENVIADO");
            registro.setFechaEnvio(LocalDateTime.now());
            
            log.info("Email enviado exitosamente a {}", destinatario);
        } catch (Exception e) {
            registro.setEstado("FALLIDO");
            registro.setMensajeError(e.getMessage());
            log.error("Error al enviar email: {}", e.getMessage());
        }

        return repositorioRegistroEmailIA.save(registro);
    }

    @Transactional
    public void registrarConfiguracioEmail(String direccion, String contrasenia, 
                                          String proveedorSMTP, Integer puertoSMTP) {
        log.info("Registrando configuración de email: {}", direccion);
        
        var emailExistente = repositorioEmailConfigurado.obtenerEmailActivo(direccion);
        if (emailExistente.isPresent()) {
            log.warn("Email ya está configurado: {}", direccion);
            return;
        }

        EmailConfigurado email = new EmailConfigurado();
        email.setDireccionEmail(direccion);
        email.setContrasenia(contrasenia); // En producción, esto debería estar encriptado
        email.setProveedorSMTP(proveedorSMTP);
        email.setPuertoSMTP(puertoSMTP);
        email.setActivo(true);
        email.setFechaCreacion(LocalDateTime.now());
        email.setFechaActualizacion(LocalDateTime.now());

        repositorioEmailConfigurado.save(email);
    }

    @Transactional(readOnly = true)
    public Page<RegistroEmailIA> obtenerRegistrosEmail(Long idUsuario, Pageable pageable) {
        log.info("Obteniendo registros de email para usuario {}", idUsuario);
        return repositorioRegistroEmailIA.obtenerRegistrosPorUsuario(idUsuario, pageable);
    }

    @Transactional(readOnly = true)
    public List<RegistroEmailIA> obtenerEmailsNoEnviados() {
        log.info("Obteniendo emails no enviados");
        return repositorioRegistroEmailIA.obtenerRegistrosPorEstado("FALLIDO");
    }

    @Transactional
    public void reintentarEnvioEmail(Long idRegistro) {
        log.info("Reintentando envío de email {}", idRegistro);
        
        RegistroEmailIA registro = repositorioRegistroEmailIA.findById(idRegistro)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        try {
            var emailActivo = repositorioEmailConfigurado.obtenerEmailsActivos()
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay email configurado"));

            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(emailActivo.getDireccionEmail());
            mensaje.setTo(registro.getDireccionDestinatario());
            mensaje.setSubject(registro.getAsunto());
            mensaje.setText(registro.getContenido());

            mailSender.send(mensaje);

            registro.setEstado("ENVIADO");
            registro.setFechaEnvio(LocalDateTime.now());
            
            log.info("Email reintentado exitosamente");
        } catch (Exception e) {
            registro.setMensajeError(e.getMessage());
            log.error("Error al reintentar envío: {}", e.getMessage());
        }

        repositorioRegistroEmailIA.save(registro);
    }
}
