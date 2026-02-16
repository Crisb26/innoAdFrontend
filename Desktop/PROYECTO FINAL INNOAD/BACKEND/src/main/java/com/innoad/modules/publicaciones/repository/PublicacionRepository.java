package com.innoad.modules.publicaciones.repository;

import com.innoad.modules.publicaciones.domain.Publicacion;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {

    Page<Publicacion> findByUsuario(Usuario usuario, Pageable pageable);

    List<Publicacion> findByEstado(Publicacion.EstadoPublicacion estado);

    List<Publicacion> findByUsuarioAndEstado(Usuario usuario, Publicacion.EstadoPublicacion estado);

    List<Publicacion> findByEstadoAndFechaInicioBeforeAndFechaFinAfter(
        Publicacion.EstadoPublicacion estado,
        LocalDateTime fecha1,
        LocalDateTime fecha2
    );

    List<Publicacion> findByUbicacion(String ubicacion);

    List<Publicacion> findByEstadoOrderByFechaCreacionDesc(Publicacion.EstadoPublicacion estado);
}
