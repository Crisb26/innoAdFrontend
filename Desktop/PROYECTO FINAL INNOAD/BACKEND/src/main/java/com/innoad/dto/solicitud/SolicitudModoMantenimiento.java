package com.innoad.dto.solicitud;

import com.innoad.modules.admin.domain.TipoMantenimiento;
import com.innoad.shared.dto.RolUsuario;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO para activar modo mantenimiento con control granular de roles
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudModoMantenimiento {

    @NotBlank(message = "El código de seguridad es obligatorio")
    private String codigoSeguridad;

    private String mensaje;

    private LocalDateTime fechaFinEstimada;

    @Builder.Default
    private TipoMantenimiento tipoMantenimiento = TipoMantenimiento.PROGRAMADO;

    @Builder.Default
    private List<RolUsuario> rolesAfectados = new ArrayList<>();

    @Builder.Default
    private List<RolUsuario> rolesExcluidos = new ArrayList<>();

    private String urlContactoSoporte;
}
