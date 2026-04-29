package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private Utenterepository repo;

    @Autowired
    private ViaggiRepository viaggiRepository;

    @Autowired
    private EmailServer emailService;

    public boolean usernameEsiste(String username) {
        return repo.findByUsername(username).isPresent();
    }

    public boolean emailEsiste(String email) {
        return repo.findByEmail(email).isPresent();
    }

    public Utente registra(Utente u) {
        Utente salvato = repo.save(u);
        try {
            emailService.emailBenvenuto(salvato);
        } catch (Exception e) {
            System.err.println("Errore invio email benvenuto: " + e.getMessage());
        }
        return salvato;
    }

    public Utente login(String username, String password) {
        Utente trovato = repo.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
        if (trovato != null) {
            try {
                emailService.emailAccesso(trovato);
            } catch (Exception e) {
                System.err.println("Errore invio email accesso: " + e.getMessage());
            }
        }
        return trovato;
    }

    public List<Viaggi> getViaggiUtente(Long utenteId) {
        return viaggiRepository.findByUtente(utenteId);
    }
}
