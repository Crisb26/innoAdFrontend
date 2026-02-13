package com.innoad.hardware.repository;

import com.innoad.hardware.model.DispositivoIoT;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DispositivoRepositorio extends JpaRepository<DispositivoIoT, String> {
}
