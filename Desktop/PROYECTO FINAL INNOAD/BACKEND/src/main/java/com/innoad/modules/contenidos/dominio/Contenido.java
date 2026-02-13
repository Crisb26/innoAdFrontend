package com.innoad.modules.contenidos.dominio;

import com.innoad.modules.campanas.dominio.Campana;
import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "contenidos",
    indexes = {
        @Index(name = "idx_contenido_campana_id", columnList = "campana_id"),
        @Index(name = "idx_contenido_usuario_id", columnList = "usuario_id"),
        @Index(name = "idx_contenido_tipo", columnList = "tipo"),
        @Index(name = "idx_contenido_fecha_creacion", columnList = "fecha_creacion DESC")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contenido implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(length = 500)
    private String descripcion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoContenido tipo; // IMAGEN, VIDEO, PDF, HTML, CARRUSEL
    
    @Column(nullable = false)
    private String nombreArchivo;
    
    @Column(nullable = false)
    private String rutaArchivo;
    
    @Column(nullable = false)
    private Long tamaño; // en bytes
    
    @Column(nullable = false)
    private String mimeType;
    
    @Column(name = "url_publica")
    private String urlPublica;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EstadoContenido estado = EstadoContenido.BORRADOR; // BORRADOR, ACTIVO, ARCHIVADO
    
    @Column(name = "duracion_segundos")
    @Builder.Default
    private Integer duracionSegundos = 10;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campana_id", nullable = false)
    private Campana campana;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "veces_reproducido")
    @Builder.Default
    private Long vecesReproducido = 0L;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoContenido.BORRADOR;
        }
        if (duracionSegundos == null) {
            duracionSegundos = 10;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    public enum TipoContenido {
        IMAGEN("Imagen", "image/"),
        VIDEO("Vídeo", "video/"),
        PDF("PDF", "application/pdf"),
        HTML("HTML", "text/html"),
        CARRUSEL("Carrusel", "application/json"),
        AUDIO("Audio", "audio/");
        
        public final String etiqueta;
        public final String mimeTypePrefix;
        
        TipoContenido(String etiqueta, String mimeTypePrefix) {
            this.etiqueta = etiqueta;
            this.mimeTypePrefix = mimeTypePrefix;
        }
    }
    
    public enum EstadoContenido {
        BORRADOR("En borrador"),
        ACTIVO("Publicado"),
        ARCHIVADO("Archivado");
        
        public final String descripcion;
        
        EstadoContenido(String descripcion) {
            this.descripcion = descripcion;
        }
    }
}
