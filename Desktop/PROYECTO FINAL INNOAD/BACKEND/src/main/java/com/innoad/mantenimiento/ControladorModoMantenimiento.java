package com.innoad.mantenimiento;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/mantenimiento")
@RequiredArgsConstructor
@Tag(name = "Modo Mantenimiento", description = "Endpoints para gestionar el modo mantenimiento del sistema")
@CrossOrigin(origins = "*")
public class ControladorModoMantenimiento {
    private final ServicioModoMantenimiento servicio;

    @GetMapping("/estado")
    @Operation(summary = "Obtener estado del mantenimiento", description = "Verifica si el sistema está en modo mantenimiento")
    @ApiResponse(responseCode = "200", description = "Estado obtenido")
    public ResponseEntity<Map<String, Object>> obtenerEstado() {
        ModoMantenimiento estado = servicio.obtenerEstado();
        return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "enMantenimiento", estado.getActivo(),
                "mensaje", estado.getMensaje(),
                "inicio", estado.getInicio(),
                "fin", estado.getFin(),
                "usuarioActivador", estado.getUsuarioActivador()
        ));
    }

    @PostMapping("/activar")
    @Operation(summary = "Activar modo mantenimiento", description = "Activa el modo mantenimiento con un mensaje")
    @ApiResponse(responseCode = "200", description = "Mantenimiento activado")
    public ResponseEntity<Map<String, Object>> activarMantenimiento(
            @RequestBody Map<String, String> request) {
        String mensaje = request.getOrDefault("mensaje", "El sistema está en mantenimiento");
        String usuario = request.get("usuario");
        
        ModoMantenimiento resultado = servicio.activarMantenimiento(mensaje, usuario);
        return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "mensaje", "Modo mantenimiento activado",
                "dato", resultado
        ));
    }

    @PostMapping("/desactivar")
    @Operation(summary = "Desactivar modo mantenimiento", description = "Desactiva el modo mantenimiento")
    @ApiResponse(responseCode = "200", description = "Mantenimiento desactivado")
    public ResponseEntity<Map<String, Object>> desactivarMantenimiento() {
        ModoMantenimiento resultado = servicio.desactivarMantenimiento();
        return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "mensaje", "Modo mantenimiento desactivado",
                "dato", resultado
        ));
    }

    @GetMapping("/activo")
    @Operation(summary = "Verificar si está en mantenimiento", description = "Retorna un booleano indicando si el sistema está en mantenimiento")
    @ApiResponse(responseCode = "200", description = "Verificación completada")
    public ResponseEntity<Map<String, Object>> estaEnMantenimiento() {
        boolean activo = servicio.estaEnMantenimiento();
        return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "enMantenimiento", activo,
                "mensaje", activo ? servicio.obtenerMensajeMantenimiento() : "Sistema operativo"
        ));
    }

    @PutMapping("/mensaje")
    @Operation(summary = "Actualizar mensaje de mantenimiento", description = "Actualiza el mensaje mostrado durante el mantenimiento")
    @ApiResponse(responseCode = "200", description = "Mensaje actualizado")
    public ResponseEntity<Map<String, Object>> actualizarMensaje(
            @RequestBody Map<String, String> request) {
        String mensaje = request.get("mensaje");
        ModoMantenimiento resultado = servicio.actualizarMensaje(mensaje);
        return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "mensaje", "Mensaje actualizado",
                "dato", resultado
        ));
    }
}
