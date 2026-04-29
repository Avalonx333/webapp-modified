package com.webapp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecenzioniRepository extends JpaRepository<Recenzioni, Long> {

    List<Recenzioni> findTop8ByOrderByDataRecensioneDesc();
}
