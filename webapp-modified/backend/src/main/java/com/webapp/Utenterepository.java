package com.webapp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Utenterepository extends JpaRepository<Utente, Long> {
    Optional<Utente> findByUsername(String username);
    Optional<Utente> findByEmail(String email);
}
//aaa