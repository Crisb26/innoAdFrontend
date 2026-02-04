package com.innoad.modules.ia.repository;

import com.innoad.modules.ia.domain.InfoSistemaInnoAd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositorioInfoSistemaInnoAd extends JpaRepository<InfoSistemaInnoAd, Long> {

    @Query("SELECT i FROM InfoSistemaInnoAd i WHERE i.clave = :clave")
    Optional<InfoSistemaInnoAd> obtenerPorClave(@Param("clave") String clave);
}
