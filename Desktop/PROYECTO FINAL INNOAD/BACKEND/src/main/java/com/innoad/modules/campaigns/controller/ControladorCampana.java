package com.innoad.modules.campaigns.controller;

import com.innoad.modules.campaigns.domain.Campana;
import com.innoad.modules.campaigns.service.ServicioCampana;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestionar campañas
 */
@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@Slf4j
public class ControladorCampana {

    private final ServicioCampana servicioCampana;

    /**
     * Obtener todas las campañas
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerCampanas(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int limite,
            @RequestParam(defaultValue = "fechaCreacion") String ordenPor,
            @RequestParam(defaultValue = "DESC") Sort.Direction orden,
            @AuthenticationPrincipal Usuario usuario) {

        Pageable pageable = PageRequest.of(pagina, limite, Sort.by(orden, ordenPor));
        Page<Campana> pageCampanas = servicioCampana.obtenerCampanasPaginadas(usuario, pageable);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("campanas", pageCampanas.getContent());
        respuesta.put("total", pageCampanas.getTotalElements());
        respuesta.put("pagina", pageCampanas.getNumber());
        respuesta.put("limite", pageCampanas.getSize());
        respuesta.put("totalPaginas", pageCampanas.getTotalPages());

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Obtener una campaña por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Campana> obtenerCampana(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campana = servicioCampana.obtenerCampanaPorId(id, usuario);
        return ResponseEntity.ok(campana);
    }

    /**
     * Crear una nueva campaña
     */
    @PostMapping
    public ResponseEntity<Campana> crearCampana(
            @RequestBody Campana campana,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campanCreada = servicioCampana.crearCampana(campana, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(campanCreada);
    }

    /**
     * Actualizar una campaña existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Campana> actualizarCampana(
            @PathVariable Long id,
            @RequestBody Campana datos,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campanActualizada = servicioCampana.actualizarCampana(id, datos, usuario);
        return ResponseEntity.ok(campanActualizada);
    }

    /**
     * Duplicar una campaña
     */
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Campana> duplicarCampana(
            @PathVariable Long id,
            @RequestParam(required = false) String nuevoNombre,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campanDuplicada = servicioCampana.duplicarCampana(id, nuevoNombre, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(campanDuplicada);
    }

    /**
     * Eliminar una campaña
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCampana(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {

        servicioCampana.eliminarCampana(id, usuario);
        return ResponseEntity.noContent().build();
    }

    /**
     * Cambiar estado de una campaña
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<Campana> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            Campana.EstadoCampana nuevoEstado = Campana.EstadoCampana.valueOf(estado.toUpperCase());
            Campana campanActualizada = servicioCampana.cambiarEstado(id, nuevoEstado, usuario);
            return ResponseEntity.ok(campanActualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtener campañas por estado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Campana>> obtenerCampanasPorEstado(
            @PathVariable String estado,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            Campana.EstadoCampana estadoCampana = Campana.EstadoCampana.valueOf(estado.toUpperCase());
            List<Campana> campanas = servicioCampana.obtenerCampanasPorEstado(estadoCampana, usuario);
            return ResponseEntity.ok(campanas);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Iniciar una campaña (cambiar estado a ACTIVA)
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<Campana> iniciarCampana(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campanActualizada = servicioCampana.cambiarEstado(id, Campana.EstadoCampana.ACTIVA, usuario);
        return ResponseEntity.ok(campanActualizada);
    }

    /**
     * Pausar una campaña
     */
    @PostMapping("/{id}/pause")
    public ResponseEntity<Campana> pausarCampana(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campanActualizada = servicioCampana.cambiarEstado(id, Campana.EstadoCampana.PAUSADA, usuario);
        return ResponseEntity.ok(campanActualizada);
    }

    /**
     * Detener una campaña
     */
    @PostMapping("/{id}/stop")
    public ResponseEntity<Campana> detenerCampana(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campanActualizada = servicioCampana.cambiarEstado(id, Campana.EstadoCampana.FINALIZADA, usuario);
        return ResponseEntity.ok(campanActualizada);
    }

    /**
     * Programar una campaña
     */
    @PostMapping("/{id}/schedule")
    public ResponseEntity<Campana> programarCampana(
            @PathVariable Long id,
            @RequestParam String fechaInicio,
            @AuthenticationPrincipal Usuario usuario) {

        Campana campana = servicioCampana.obtenerCampanaPorId(id, usuario);
        // Simplemente cambiar a estado PROGRAMADA
        Campana campanActualizada = servicioCampana.cambiarEstado(id, Campana.EstadoCampana.PROGRAMADA, usuario);
        return ResponseEntity.ok(campanActualizada);
    }
}
