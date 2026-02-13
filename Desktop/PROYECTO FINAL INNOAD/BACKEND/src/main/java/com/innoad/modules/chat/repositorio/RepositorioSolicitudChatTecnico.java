package com.innoad.modules.chat.repositorio;

import com.innoad.modules.chat.dominio.SolicitudChatTecnico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositorioSolicitudChatTecnico extends JpaRepository<SolicitudChatTecnico, Long> {

    @Query("SELECT s FROM SolicitudChatTecnico s WHERE s.usuario.id = :usuarioId ORDER BY s.fechaCreacion DESC")
    List<SolicitudChatTecnico> encontrarPorUsuario(@Param("usuarioId") Long usuarioId);

    @Query("SELECT s FROM SolicitudChatTecnico s WHERE s.estado = 'PENDIENTE' ORDER BY s.fechaCreacion ASC")
    Page<SolicitudChatTecnico> encontrarSolicitudesPendientes(Pageable pageable);

    @Query("SELECT s FROM SolicitudChatTecnico s WHERE s.tecnicoAsignado.id = :tecnicoId AND s.estado != 'RESUELTA' ORDER BY s.fechaAsignacion DESC")
    List<SolicitudChatTecnico> encontrarSolicitudesActivasPorTecnico(@Param("tecnicoId") Long tecnicoId);
}
