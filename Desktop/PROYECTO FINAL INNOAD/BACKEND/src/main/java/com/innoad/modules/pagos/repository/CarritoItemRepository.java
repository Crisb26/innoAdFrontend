package com.innoad.modules.pagos.repository;

import com.innoad.modules.pagos.domain.CarritoItem;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.publicaciones.domain.Publicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {
    List<CarritoItem> findByUsuario(Usuario usuario);
    Optional<CarritoItem> findByUsuarioAndPublicacion(Usuario usuario, Publicacion publicacion);
    void deleteByUsuario(Usuario usuario);
    int countByUsuario(Usuario usuario);
}
