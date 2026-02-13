package com.innoad.modules.admin.domain;

/**
 * Tipos de mantenimiento del sistema InnoAd
 */
public enum TipoMantenimiento {
    PROGRAMADO("Mantenimiento programado", "#0066ff"),      // Azul
    EMERGENCIA("Emergencia - Sistema crítico", "#ff0000"),  // Rojo
    CRITICA("Mantenimiento crítico", "#ff8800");            // Naranja
    
    private final String descripcion;
    private final String color;
    
    TipoMantenimiento(String descripcion, String color) {
        this.descripcion = descripcion;
        this.color = color;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public String getColor() {
        return color;
    }
}
