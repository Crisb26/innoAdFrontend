package com.innoad.modules.ia.repository;

import com.innoad.modules.ia.domain.ConversacionIA;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la gestión de conversaciones con el agente de IA.
 */
@Repository
public interface RepositorioConversacionIA extends JpaRepository<ConversacionIA, Long> {
    
    /**
     * Busca todas las conversaciones de un usuario
     */
    List<ConversacionIA> findByUsuarioOrderByFechaConversacionDesc(Usuario usuario);
    
    /**
     * Busca conversaciones por contexto
     */
    List<ConversacionIA> findByContexto(String contexto);
    
    /**
     * Busca conversaciones exitosas
     */
    List<ConversacionIA> findByExitosoTrue();
    
    /**
     * Busca conversaciones con error
     */
    List<ConversacionIA> findByExitosoFalse();
    
    /**
     * Busca las últimas N conversaciones de un usuario
     */
    List<ConversacionIA> findTop10ByUsuarioOrderByFechaConversacionDesc(Usuario usuario);
    
    /**
     * Busca conversaciones en un rango de fechas
     */
    List<ConversacionIA> findByFechaConversacionBetween(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Calcula el total de tokens usados por un usuario
     */
    @Query("SELECT SUM(c.tokensUsados) FROM ConversacionIA c WHERE c.usuario = :usuario")
    Long calcularTotalTokensUsados(@Param("usuario") Usuario usuario);
    
    /**
     * Calcula el costo total de conversaciones de un usuario
     */
    @Query("SELECT SUM(c.costoAproximado) FROM ConversacionIA c WHERE c.usuario = :usuario")
    Double calcularCostoTotal(@Param("usuario") Usuario usuario);
    
    /**
     * Obtiene el promedio de calificación del servicio de IA
     */
    @Query("SELECT AVG(c.calificacion) FROM ConversacionIA c WHERE c.calificacion IS NOT NULL")
    Double obtenerPromedioCalificacion();
    
    /**
     * Cuenta conversaciones por modelo utilizado
     */
    @Query("SELECT c.modeloUtilizado, COUNT(c) FROM ConversacionIA c GROUP BY c.modeloUtilizado")
    List<Object[]> contarPorModelo();
}
