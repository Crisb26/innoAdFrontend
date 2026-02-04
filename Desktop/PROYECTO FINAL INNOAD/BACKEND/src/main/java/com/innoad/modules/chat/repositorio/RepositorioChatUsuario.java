package com.innoad.modules.chat.repositorio;

import com.innoad.modules.chat.dominio.ChatUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioChatUsuario extends JpaRepository<ChatUsuario, Long> {

    @Query("SELECT c FROM ChatUsuario c WHERE " +
            "((c.usuarioTecnico.id = :usuarioId AND c.usuarioSolicitante.id = :otroUsuarioId) OR " +
            "(c.usuarioSolicitante.id = :usuarioId AND c.usuarioTecnico.id = :otroUsuarioId)) AND " +
            "c.activo = true")
    Optional<ChatUsuario> encontrarChatActivo(@Param("usuarioId") Long usuarioId, 
                                             @Param("otroUsuarioId") Long otroUsuarioId);

    @Query("SELECT c FROM ChatUsuario c WHERE " +
            "(c.usuarioTecnico.id = :usuarioId OR c.usuarioSolicitante.id = :usuarioId) AND " +
            "c.activo = true ORDER BY c.fechaActualizacion DESC")
    List<ChatUsuario> encontrarChatsActivosPorUsuario(@Param("usuarioId") Long usuarioId);

    @Query("SELECT c FROM ChatUsuario c WHERE " +
            "c.usuarioTecnico.id = :tecnicoId AND c.activo = true ORDER BY c.fechaActualizacion DESC")
    List<ChatUsuario> encontrarChatsPorTecnico(@Param("tecnicoId") Long tecnicoId);
}
