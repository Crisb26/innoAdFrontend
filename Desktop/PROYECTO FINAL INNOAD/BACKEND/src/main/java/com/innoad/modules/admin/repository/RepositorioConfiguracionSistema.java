package com.innoad.modules.admin.repository;

import com.innoad.modules.admin.domain.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para la gestión de configuración del sistema.
 */
@Repository
public interface RepositorioConfiguracionSistema extends JpaRepository<ConfiguracionSistema, Long> {
    
    /**
     * Busca una configuración por su clave
     */
    Optional<ConfiguracionSistema> findByClave(String clave);
    
    /**
     * Verifica si existe una configuración con la clave dada
     */
    boolean existsByClave(String clave);
    
    /**
     * Busca la configuración del modo mantenimiento
     */
    Optional<ConfiguracionSistema> findByModoMantenimientoActivoTrue();
}
