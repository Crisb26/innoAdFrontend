package com.innoad.modules.autenticacion.controller;

import com.innoad.modules.autenticacion.dto.LoginRequest;
import com.innoad.modules.autenticacion.dto.LoginResponse;
import com.innoad.modules.autenticacion.dto.RegistroRequest;
import com.innoad.modules.autenticacion.service.ServicioAutenticacion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autenticacion")
@RequiredArgsConstructor
@Tag(name = "🔐 Autenticación", description = "Endpoints para login, registro y gestión de tokens")
public class ControladorAutenticacion {
    
    private final ServicioAutenticacion servicioAutenticacion;
    
    @PostMapping("/login")
    @Operation(
        summary = "Login de usuario",
        description = "Autentica un usuario con email y contraseña. Retorna JWT token válido por 1 hora."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso, retorna token JWT"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "429", description = "Demasiados intentos de login")
    })
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(servicioAutenticacion.autenticar(request));
    }
    
    @PostMapping("/registrar")
    @Operation(
        summary = "Registrar nuevo usuario",
        description = "Crea una nueva cuenta de usuario. Email debe ser único."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Email ya existe o datos inválidos"),
        @ApiResponse(responseCode = "422", description = "Validación fallida")
    })
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(201).body(servicioAutenticacion.registrar(request));
    }
    
    @PostMapping("/refresh-token")
    @Operation(
        summary = "Renovar JWT token",
        description = "Obtiene un nuevo JWT token a partir del refresh token. Útil cuando el token principal está por expirar."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token renovado exitosamente"),
        @ApiResponse(responseCode = "401", description = "Refresh token inválido")
    })
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        return ResponseEntity.ok(servicioAutenticacion.refreshToken(refreshToken));
    }
    
    @GetMapping("/salud")
    @Operation(
        summary = "Health check",
        description = "Verifica que el servidor de autenticación está funcionando"
    )
    @ApiResponse(responseCode = "200", description = "Servidor funcionando correctamente")
    public ResponseEntity<?> salud() {
        return ResponseEntity.ok(new Object() {
            public final String estado = "FUNCIONANDO";
            public final long timestamp = System.currentTimeMillis();
        });
    }
}
