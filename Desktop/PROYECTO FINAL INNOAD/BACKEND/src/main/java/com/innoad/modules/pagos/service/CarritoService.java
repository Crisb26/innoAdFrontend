package com.innoad.modules.pagos.service;

import com.innoad.modules.pagos.domain.CarritoItem;
import com.innoad.modules.pagos.repository.CarritoItemRepository;
import com.innoad.modules.publicaciones.domain.Publicacion;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarritoService {

    private final CarritoItemRepository carritoItemRepository;

    /**
     * Agregar item al carrito
     */
    @Transactional
    public CarritoItem agregarAlCarrito(Usuario usuario, Publicacion publicacion, Integer cantidad) {
        // Verificar si ya existe en el carrito
        Optional<CarritoItem> existente = carritoItemRepository.findByUsuarioAndPublicacion(usuario, publicacion);

        if (existente.isPresent()) {
            // Incrementar cantidad
            CarritoItem item = existente.get();
            item.setCantidad(item.getCantidad() + cantidad);
            return carritoItemRepository.save(item);
        }

        // Crear nuevo item
        CarritoItem item = CarritoItem.builder()
                .usuario(usuario)
                .publicacion(publicacion)
                .cantidad(cantidad)
                .precioUnitarioCOP(new BigDecimal(publicacion.getPrecioCOP().toString()))
                .build();

        CarritoItem saved = carritoItemRepository.save(item);
        log.info("Item agregado al carrito: usuario={}, publicacion={}, cantidad={}", usuario.getId(), publicacion.getId(), cantidad);
        return saved;
    }

    /**
     * Obtener carrito del usuario
     */
    public List<CarritoItem> obtenerCarrito(Usuario usuario) {
        return carritoItemRepository.findByUsuario(usuario);
    }

    /**
     * Actualizar cantidad
     */
    @Transactional
    public CarritoItem actualizarCantidad(Long itemId, Integer cantidad) {
        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (cantidad <= 0) {
            carritoItemRepository.delete(item);
            return item;
        }

        item.setCantidad(cantidad);
        return carritoItemRepository.save(item);
    }

    /**
     * Eliminar item del carrito
     */
    @Transactional
    public void eliminarDelCarrito(Long itemId) {
        carritoItemRepository.findById(itemId).ifPresent(carritoItemRepository::delete);
    }

    /**
     * Vaciar carrito completo
     */
    @Transactional
    public void vaciarCarrito(Usuario usuario) {
        carritoItemRepository.deleteByUsuario(usuario);
        log.info("Carrito vaciado para usuario {}", usuario.getId());
    }

    /**
     * Calcular total del carrito
     */
    public BigDecimal calcularTotal(Usuario usuario) {
        List<CarritoItem> items = carritoItemRepository.findByUsuario(usuario);
        return items.stream()
                .map(CarritoItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calcular IVA (19%)
     */
    public BigDecimal calcularIVA(Usuario usuario) {
        BigDecimal subtotal = calcularTotal(usuario);
        return subtotal.multiply(new BigDecimal("0.19"));
    }

    /**
     * Obtener total con IVA
     */
    public BigDecimal calcularTotalConIVA(Usuario usuario) {
        BigDecimal subtotal = calcularTotal(usuario);
        BigDecimal iva = calcularIVA(usuario);
        return subtotal.add(iva);
    }
}
