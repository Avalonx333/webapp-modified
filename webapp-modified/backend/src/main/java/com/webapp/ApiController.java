package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired
    private AuthService service;

    @PostMapping("/registra")
    public ResponseEntity<?> registra(@RequestBody Utente u) {

        if (service.usernameEsiste(u.getUsername())) {
            return ResponseEntity.status(409).body(Map.of(
                    "status", "errore",
                    "messaggio", "Username già esistente"
            ));
        }

        if (service.emailEsiste(u.getEmail())) {
            return ResponseEntity.status(409).body(Map.of(
                    "status", "errore",
                    "messaggio", "Email già esistente"
            ));
        }

        service.registra(u);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "messaggio", "Registrazione avvenuta con successo!"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Utente u) {

        Utente trovato = service.login(u.getUsername(), u.getPassword());

        if (trovato == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "errore",
                    "messaggio", "Credenziali errate"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "messaggio", "Login riuscito!",
                "utente", trovato
        ));
    }
}
