package com.innoad.modules.ubicaciones.servicio;

import com.innoad.modules.ubicaciones.model.Ciudad;
import com.innoad.modules.ubicaciones.model.Lugar;
import com.innoad.modules.ubicaciones.model.Piso;
import com.innoad.modules.ubicaciones.repository.CiudadRepository;
import com.innoad.modules.ubicaciones.repository.LugarRepository;
import com.innoad.modules.ubicaciones.repository.PisoRepository;
import com.innoad.modules.ubicaciones.dto.CiudadDTO;
import com.innoad.modules.ubicaciones.dto.LugarDTO;
import com.innoad.modules.ubicaciones.dto.PisoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UbicacionServicio {
    
    @Autowired
    private CiudadRepository ciudadRepository;
    
    @Autowired
    private LugarRepository lugarRepository;
    
    @Autowired
    private PisoRepository pisoRepository;
    
    // CIUDADES
    public List<CiudadDTO> obtenerTodasLasCiudades() {
        log.info("Obteniendo todas las ciudades");
        return ciudadRepository.findByActivaTrue()
            .stream()
            .map(this::convertirACiudadDTO)
            .collect(Collectors.toList());
    }
    
    public CiudadDTO obtenerCiudadPorId(Long ciudadId) {
        log.info("Obteniendo ciudad con ID: {}", ciudadId);
        return ciudadRepository.findById(ciudadId)
            .map(this::convertirACiudadDTO)
            .orElseThrow(() -> new RuntimeException("Ciudad no encontrada"));
    }
    
    // LUGARES
    public List<LugarDTO> obtenerLugaresPorCiudad(Long ciudadId) {
        log.info("Obteniendo lugares para ciudad: {}", ciudadId);
        return lugarRepository.findByCiudadId(ciudadId)
            .stream()
            .map(this::convertirALugarDTO)
            .collect(Collectors.toList());
    }
    
    public LugarDTO obtenerLugarPorId(Long lugarId) {
        log.info("Obteniendo lugar con ID: {}", lugarId);
        return lugarRepository.findById(lugarId)
            .map(this::convertirALugarDTO)
            .orElseThrow(() -> new RuntimeException("Lugar no encontrado"));
    }
    
    // PISOS
    public List<PisoDTO> obtenerPisosPorLugar(Long lugarId) {
        log.info("Obteniendo pisos para lugar: {}", lugarId);
        return pisoRepository.findByLugarId(lugarId)
            .stream()
            .map(this::convertirAPisoDTO)
            .collect(Collectors.toList());
    }
    
    // CONVERSIONES
    private CiudadDTO convertirACiudadDTO(Ciudad ciudad) {
        CiudadDTO dto = new CiudadDTO();
        dto.setId(ciudad.getId());
        dto.setNombre(ciudad.getNombre());
        dto.setCodigo(ciudad.getCodigo());
        dto.setCantidadLugares(ciudad.getCantidadLugares());
        dto.setActiva(ciudad.getActiva());
        return dto;
    }
    
    private LugarDTO convertirALugarDTO(Lugar lugar) {
        LugarDTO dto = new LugarDTO();
        dto.setId(lugar.getId());
        dto.setCiudadId(lugar.getCiudad().getId());
        dto.setNombre(lugar.getNombre());
        dto.setPisos(lugar.getPisos());
        dto.setCostoBase(lugar.getCostoBase());
        dto.setDisponible(lugar.getDisponible());
        dto.setDescripcion(lugar.getDescripcion());
        return dto;
    }
    
    private PisoDTO convertirAPisoDTO(Piso piso) {
        PisoDTO dto = new PisoDTO();
        dto.setId(piso.getId());
        dto.setLugarId(piso.getLugar().getId());
        dto.setNumero(piso.getNumero());
        dto.setDisponible(piso.getDisponible());
        dto.setCostoPorDia(piso.getCostoPorDia());
        return dto;
    }
}
