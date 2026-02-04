package com.innoad.modules.mantenimiento.dominio;

public enum TipoAlerta {
    CRITICA("Crítica", "#ff6b6b"),
    ADVERTENCIA("Advertencia", "#ffa500"),
    INFO("Información", "#667eea"),
    EXITO("Éxito", "#28a745");

    private final String etiqueta;
    private final String color;

    TipoAlerta(String etiqueta, String color) {
        this.etiqueta = etiqueta;
        this.color = color;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public String getColor() {
        return color;
    }
}
