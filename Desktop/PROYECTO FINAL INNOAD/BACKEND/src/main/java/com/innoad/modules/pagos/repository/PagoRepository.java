package com.innoad.modules.pagos.repository;

import com.innoad.modules.pagos.domain.Pago;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByUsuario(Usuario usuario);
    Page<Pago> findByUsuario(Usuario usuario, Pageable pageable);
    List<Pago> findByEstado(Pago.EstadoPago estado);
    List<Pago> findByUsuarioAndEstado(Usuario usuario, Pago.EstadoPago estado);
}
