package com.innoad.roles;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Gestión de Roles", description = "Endpoints para crear, actualizar y eliminar roles del sistema")
@CrossOrigin(origins = "*")
public class ControladorRol {
    private final ServicioRol servicio;

    @PostMapping
    @Operation(summary = "Crear nuevo rol", description = "Crea un nuevo rol en el sistema con permisos asignados")
    @ApiResponse(responseCode = "201", description = "Rol creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<Map<String, Object>> crearRol(@RequestBody Rol rol) {
        try {
            Rol rolCreado = servicio.crearRol(rol);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "exitoso", true,
                    "mensaje", "Rol creado exitosamente",
                    "dato", rolCreado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "exitoso", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener rol por ID", description = "Obtiene los detalles de un rol específico")
    @ApiResponse(responseCode = "200", description = "Rol encontrado")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<Map<String, Object>> obtenerRol(@PathVariable Long id) {
        try {
            Rol rol = servicio.obtenerRolPorId(id);
            return ResponseEntity.ok(Map.of(
                    "exitoso", true,
                    "dato", rol
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "exitoso", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @GetMapping
    @Operation(summary = "Obtener todos los roles", description = "Lista todos los roles disponibles en el sistema")
    @ApiResponse(responseCode = "200", description = "Lista de roles")
    public ResponseEntity<Map<String, Object>> obtenerTodosRoles() {
        List<Rol> roles = servicio.obtenerTodosRoles();
        return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "cantidad", roles.size(),
                "datos", roles
        ));
    }

    @GetMapping("/activos")
    @Operation(summary = "Obtener roles activos", description = "Lista solo los roles que están activos")
    @ApiResponse(responseCode = "200", description = "Lista de roles activos")
    public ResponseEntity<Map<String, Object>> obtenerRolesActivos() {
        List<Rol> roles = servicio.obtenerRolesActivos();
        return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "cantidad", roles.size(),
                "datos", roles
        ));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar rol", description = "Actualiza los datos de un rol existente")
    @ApiResponse(responseCode = "200", description = "Rol actualizado")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<Map<String, Object>> actualizarRol(
            @PathVariable Long id,
            @RequestBody Rol rol) {
        try {
            Rol rolActualizado = servicio.actualizarRol(id, rol);
            return ResponseEntity.ok(Map.of(
                    "exitoso", true,
                    "mensaje", "Rol actualizado exitosamente",
                    "dato", rolActualizado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "exitoso", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar rol", description = "Elimina un rol del sistema")
    @ApiResponse(responseCode = "200", description = "Rol eliminado")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<Map<String, Object>> eliminarRol(@PathVariable Long id) {
        try {
            servicio.eliminarRol(id);
            return ResponseEntity.ok(Map.of(
                    "exitoso", true,
                    "mensaje", "Rol eliminado exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "exitoso", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @PostMapping("/{id}/permisos/{permiso}")
    @Operation(summary = "Agregar permiso a rol", description = "Asigna un nuevo permiso a un rol")
    @ApiResponse(responseCode = "200", description = "Permiso agregado")
    public ResponseEntity<Map<String, Object>> agregarPermiso(
            @PathVariable Long id,
            @PathVariable String permiso) {
        try {
            servicio.agregarPermisoRol(id, permiso);
            return ResponseEntity.ok(Map.of(
                    "exitoso", true,
                    "mensaje", "Permiso agregado exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "exitoso", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}/permisos/{permiso}")
    @Operation(summary = "Eliminar permiso de rol", description = "Remueve un permiso de un rol")
    @ApiResponse(responseCode = "200", description = "Permiso eliminado")
    public ResponseEntity<Map<String, Object>> eliminarPermiso(
            @PathVariable Long id,
            @PathVariable String permiso) {
        try {
            servicio.eliminarPermisoRol(id, permiso);
            return ResponseEntity.ok(Map.of(
                    "exitoso", true,
                    "mensaje", "Permiso eliminado exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "exitoso", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}/permisos/{permiso}")
    @Operation(summary = "Verificar permiso", description = "Verifica si un rol tiene un permiso específico")
    @ApiResponse(responseCode = "200", description = "Verificación completada")
    public ResponseEntity<Map<String, Object>> verificarPermiso(
            @PathVariable Long id,
            @PathVariable String permiso) {
        try {
            boolean tiene = servicio.verificarPermiso(id, permiso);
            return ResponseEntity.ok(Map.of(
                    "exitoso", true,
                    "tienePermiso", tiene
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "exitoso", false,
                    "mensaje", e.getMessage()
            ));
        }
    }
}
