package com.innoad.roles;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServicioRol {
    private final RepositorioRol repositorio;

    public Rol crearRol(Rol rol) {
        // Validar que el nombre sea único
        if (repositorio.findByNombre(rol.getNombre()).isPresent()) {
            throw new IllegalArgumentException("El rol '" + rol.getNombre() + "' ya existe");
        }
        return repositorio.save(rol);
    }

    public Rol obtenerRolPorId(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
    }

    public Optional<Rol> obtenerRolPorNombre(String nombre) {
        return repositorio.findByNombre(nombre);
    }

    public List<Rol> obtenerTodosRoles() {
        return repositorio.findAll();
    }

    public List<Rol> obtenerRolesActivos() {
        return repositorio.findByEstado("activo");
    }

    public Rol actualizarRol(Long id, Rol rolActualizado) {
        Rol rol = obtenerRolPorId(id);
        
        if (!rol.getNombre().equals(rolActualizado.getNombre())) {
            if (repositorio.findByNombre(rolActualizado.getNombre()).isPresent()) {
                throw new IllegalArgumentException("El rol '" + rolActualizado.getNombre() + "' ya existe");
            }
        }
        
        rol.setNombre(rolActualizado.getNombre());
        rol.setDescripcion(rolActualizado.getDescripcion());
        rol.setColor(rolActualizado.getColor());
        rol.setIcono(rolActualizado.getIcono());
        rol.setPermisos(rolActualizado.getPermisos());
        rol.setEstado(rolActualizado.getEstado());
        
        return repositorio.save(rol);
    }

    public void eliminarRol(Long id) {
        Rol rol = obtenerRolPorId(id);
        repositorio.delete(rol);
    }

    public boolean verificarPermiso(Long rolId, String permiso) {
        return obtenerRolPorId(rolId).getPermisos().contains(permiso);
    }

    public void agregarPermisoRol(Long rolId, String permiso) {
        Rol rol = obtenerRolPorId(rolId);
        rol.getPermisos().add(permiso);
        repositorio.save(rol);
    }

    public void eliminarPermisoRol(Long rolId, String permiso) {
        Rol rol = obtenerRolPorId(rolId);
        rol.getPermisos().remove(permiso);
        repositorio.save(rol);
    }
}
