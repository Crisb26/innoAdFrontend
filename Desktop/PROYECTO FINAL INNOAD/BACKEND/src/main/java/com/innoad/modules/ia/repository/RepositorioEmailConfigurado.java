package com.innoad.modules.ia.repository;

import com.innoad.modules.ia.domain.EmailConfigurado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioEmailConfigurado extends JpaRepository<EmailConfigurado, Long> {

    @Query("SELECT e FROM EmailConfigurado e WHERE e.activo = true")
    List<EmailConfigurado> obtenerEmailsActivos();

    @Query("SELECT e FROM EmailConfigurado e WHERE e.direccionEmail = :direccion AND e.activo = true")
    Optional<EmailConfigurado> obtenerEmailActivo(@Param("direccion") String direccion);
}
