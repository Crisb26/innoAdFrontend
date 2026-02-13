package com.innoad.shared.dto;

/**
 * Enumeración que define los roles disponibles en el sistema InnoAd.
 * Cada rol tiene permisos y accesos diferentes en la aplicación.
 */
public enum RolUsuario {
    /**
     * Rol de administrador - Acceso completo al sistema
     */
    ADMINISTRADOR,

    /**
     * Rol de técnico - Acceso a funciones técnicas y de mantenimiento
     */
    TECNICO,

    /**
     * Rol de desarrollador - Acceso a funciones de desarrollo y configuración avanzada
     */
    DESARROLLADOR,

    /**
     * Rol de usuario registrado - Acceso estándar a funcionalidades
     */
    USUARIO,

    /**
     * Alias de USUARIO para compatibilidad con frontend
     */
    USER,

    /**
     * Rol de visitante - Acceso limitado solo a funciones públicas
     */
    VISITANTE
}
