package com.innoad.modules.mantenimiento.dominio;

public enum EstadoAlerta {
    ACTIVA("Activa"),
    RESUELTA("Resuelta"),
    IGNORADA("Ignorada"),
    ESCALADA("Escalada"),
    EN_INVESTIGACION("En Investigación");

    private final String etiqueta;

    EstadoAlerta(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
