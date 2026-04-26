package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private Utenterepository repo;
    private ViaggiRepository viaggiRepository;

    public boolean usernameEsiste(String username) {
        return repo.findByUsername(username).isPresent();
    }

    public boolean emailEsiste(String email) {
        return repo.findByEmail(email).isPresent();
    }

    public Utente registra(Utente u) {
        return repo.save(u);
    }

    public Utente login(String username, String password) {
        return repo.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }

    public List<Viaggi> getViaggiUtente(long utenteId) {
        return viaggiRepository.findByUtente(utenteId);

    }
}
