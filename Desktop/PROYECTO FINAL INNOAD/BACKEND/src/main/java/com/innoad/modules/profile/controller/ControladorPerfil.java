package com.innoad.modules.profile.controller;

import com.innoad.modules.profile.dto.ActualizarPerfilRequest;
import com.innoad.modules.profile.dto.PerfilResponse;
import com.innoad.modules.profile.service.ServicioPerfil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.preauthorize.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ControladorPerfil {

    private final ServicioPerfil servicioPerfil;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerfilResponse> obtenerPerfil() {
        PerfilResponse perfil = servicioPerfil.obtenerPerfilActual();
        return ResponseEntity.ok(perfil);
    }

    @PutMapping("/actualizar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerfilResponse> actualizarPerfil(
            @Valid @RequestBody ActualizarPerfilRequest request) {
        PerfilResponse perfil = servicioPerfil.actualizarPerfil(request);
        return ResponseEntity.ok(perfil);
    }

    @PostMapping("/foto")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerfilResponse> cambiarFotoPerfil(
            @RequestParam("file") MultipartFile file) {
        PerfilResponse perfil = servicioPerfil.cambiarFotoPerfil(file);
        return ResponseEntity.ok(perfil);
    }

    @DeleteMapping("/foto")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> eliminarFotoPerfil() {
        servicioPerfil.eliminarFotoPerfil();
        return ResponseEntity.ok().build();
    }
}
