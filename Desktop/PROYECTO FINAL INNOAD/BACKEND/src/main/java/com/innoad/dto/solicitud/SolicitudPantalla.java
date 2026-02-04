package com.innoad.dto.solicitud;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear o actualizar una pantalla
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudPantalla {

    @NotBlank(message = "El nombre de la pantalla es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;

    @Size(max = 200, message = "La ubicación no puede exceder 200 caracteres")
    private String ubicacion;

    @Pattern(regexp = "^\\d{3,4}x\\d{3,4}$",
             message = "La resolución debe tener el formato: 1920x1080")
    private String resolucion;

    @Pattern(regexp = "^(HORIZONTAL|VERTICAL)$",
             message = "La orientación debe ser HORIZONTAL o VERTICAL")
    private String orientacion;

    @Size(max = 500, message = "Las notas no pueden exceder 500 caracteres")
    private String notas;
}
