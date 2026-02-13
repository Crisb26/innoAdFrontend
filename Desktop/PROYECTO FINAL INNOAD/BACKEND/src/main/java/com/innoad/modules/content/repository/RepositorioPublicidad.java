package com.innoad.modules.content.repository;

import com.innoad.modules.content.domain.Publicidad;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la gestión de publicidades.
 */
@Repository
public interface RepositorioPublicidad extends JpaRepository<Publicidad, Long> {
    
    /**
     * Busca todas las publicidades de un usuario
     */
    List<Publicidad> findByUsuarioCreadorOrderByFechaCreacionDesc(Usuario usuario);
    
    /**
     * Busca publicidades por estado
     */
    List<Publicidad> findByEstado(String estado);
    
    /**
     * Busca publicidades activas
     */
    @Query("SELECT p FROM Publicidad p WHERE p.estado = 'ACTIVA' AND " +
           "(p.fechaInicio IS NULL OR p.fechaInicio <= :ahora) AND " +
           "(p.fechaFin IS NULL OR p.fechaFin >= :ahora)")
    List<Publicidad> encontrarPublicidadesActivas(@Param("ahora") LocalDateTime ahora);
    
    /**
     * Busca publicidades por categoría
     */
    List<Publicidad> findByCategoria(String categoria);
    
    /**
     * Busca publicidades generadas por IA
     */
    List<Publicidad> findByGeneradaPorIATrue();
    
    /**
     * Busca publicidades que contienen palabras clave
     */
    @Query("SELECT p FROM Publicidad p WHERE " +
           "LOWER(p.palabrasClave) LIKE LOWER(CONCAT('%', :palabraClave, '%'))")
    List<Publicidad> buscarPorPalabraClave(@Param("palabraClave") String palabraClave);
    
    /**
     * Obtiene las publicidades más efectivas (mayor CTR)
     */
    @Query("SELECT p FROM Publicidad p WHERE p.impresiones > 100 " +
           "ORDER BY (CAST(p.clics AS double) / CAST(p.impresiones AS double)) DESC")
    List<Publicidad> encontrarMasEfectivas();
    
    /**
     * Busca publicidades por rango de fechas
     */
    List<Publicidad> findByFechaCreacionBetween(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Cuenta publicidades por estado
     */
    @Query("SELECT p.estado, COUNT(p) FROM Publicidad p GROUP BY p.estado")
    List<Object[]> contarPorEstado();
    
    /**
     * Calcula el total de impresiones de un usuario
     */
    @Query("SELECT SUM(p.impresiones) FROM Publicidad p WHERE p.usuarioCreador = :usuario")
    Long calcularTotalImpresiones(@Param("usuario") Usuario usuario);
    
    /**
     * Calcula el total de clics de un usuario
     */
    @Query("SELECT SUM(p.clics) FROM Publicidad p WHERE p.usuarioCreador = :usuario")
    Long calcularTotalClics(@Param("usuario") Usuario usuario);
    
    /**
     * Busca publicidades próximas a finalizar (en los próximos 7 días)
     */
    @Query("SELECT p FROM Publicidad p WHERE p.fechaFin BETWEEN :ahora AND :enUnaSemana " +
           "AND p.estado = 'ACTIVA'")
    List<Publicidad> encontrarProximasAFinalizar(
            @Param("ahora") LocalDateTime ahora,
            @Param("enUnaSemana") LocalDateTime enUnaSemana
    );
}
