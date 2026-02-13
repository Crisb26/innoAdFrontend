package com.innoad.modules.ia.repository;

import com.innoad.modules.ia.domain.PromptIAPorRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioPromptIAPorRol extends JpaRepository<PromptIAPorRol, Long> {

    @Query("SELECT p FROM PromptIAPorRol p WHERE p.rol = :rol AND p.activo = true")
    Optional<PromptIAPorRol> obtenerPromptActivoPorRol(@Param("rol") String rol);

    @Query("SELECT p FROM PromptIAPorRol p WHERE p.activo = true ORDER BY p.fechaCreacion DESC")
    List<PromptIAPorRol> obtenerPromptsActivos();

    @Query("SELECT p FROM PromptIAPorRol p ORDER BY p.fechaActualizacion DESC")
    List<PromptIAPorRol> obtenerTodosLosPrompts();
}
