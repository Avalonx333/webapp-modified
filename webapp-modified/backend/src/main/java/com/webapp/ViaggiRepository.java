package com.webapp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViaggiRepository extends JpaRepository<Viaggi, Long> {

    @Query(value = """
        SELECT v.* 
        FROM viaggi v
        JOIN utenti_viaggi uv ON v.id = uv.viaggi_id
        WHERE uv.utente_id = :utenteId
    """, nativeQuery = true)
    List<Viaggi> findByUtente(@Param("utenteId") Long utenteId);
}
