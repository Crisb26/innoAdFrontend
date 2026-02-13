package com.innoad.hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispositivoDTO {
    private Long id;
    private String nombre;
    private String tipo;
    private String estado;
    private String ubicacion;
    private Double temperatura;
    private Double humedad;
    private LocalDateTime ultimaSincronizacion;
    private String ip;
    private String macAddress;
    private Boolean conectado;
    private String ipAddress;
    private LocalDateTime ultimaConexion;
    private String versionSoftware;
    private String especificaciones;
    private List<String> sensores;
}
