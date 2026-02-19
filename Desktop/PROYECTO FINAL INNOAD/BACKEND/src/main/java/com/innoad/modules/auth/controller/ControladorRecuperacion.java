package com.innoad.modules.auth.controller;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import com.innoad.shared.dto.RolUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de recuperación para modo emergencia
 * Solo activo en desarrollo/servidor
 */
@RestController
@RequestMapping("/api/v1/recuperacion")
@RequiredArgsConstructor
@ConditionalOnProperty(
    name = "app.modo.recuperacion",
    havingValue = "true",
    matchIfMissing = true
)
public class ControladorRecuperacion {

    private final RepositorioUsuario repositorioUsuario;

    @PostMapping("/arreglar-admin")
    public ResponseEntity<?> arreglarAdminRole() {
        try {
            // Buscar admin
            Usuario admin = repositorioUsuario.findByNombreUsuario("admin")
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));

            // Actualizar rol
            admin.setRol(RolUsuario.ADMIN);
            repositorioUsuario.save(admin);

            return ResponseEntity.ok(new Object() {
                public boolean exitoso = true;
                public String mensaje = "Admin actualizado a rol ADMIN";
                public long usuarioId = admin.getId();
                public String nombreUsuario = admin.getNombreUsuario();
                public String rolActual = admin.getRol().toString();
            });
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Object() {
                public boolean exitoso = false;
                public String error = e.getMessage();
            });
        }
    }
}
