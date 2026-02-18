package com.innoad.modules.auth.service;

import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Servicio de detalles de usuario para Spring Security.
 * Carga los usuarios desde la base de datos para autenticación.
 */
@Service
@RequiredArgsConstructor
public class ServicioDetallesUsuario implements UserDetailsService {
    
    private final RepositorioUsuario repositorioUsuario;
    
    @Override
    public UserDetails loadUserByUsername(String nombreUsuarioOEmail) throws UsernameNotFoundException {
        // Buscar por nombre de usuario o email
        return repositorioUsuario.findByNombreUsuario(nombreUsuarioOEmail)
                .or(() -> repositorioUsuario.findByEmail(nombreUsuarioOEmail))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con nombre de usuario o email: " + nombreUsuarioOEmail
                ));
    }
}
