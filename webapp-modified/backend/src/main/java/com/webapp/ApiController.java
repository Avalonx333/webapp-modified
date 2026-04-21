package com.webapp;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ApiController  {

    @GetMapping("/hello")
    public String hello() {
        return "Ciao dal backend Java!";
    }

    @PostMapping("/data")
    public String receiveData(@RequestBody String data) {
        return "Ricevuto: " + data;
    }

    @PostMapping("/registra")
    public Map<String, String> registra(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "");
        String email    = body.getOrDefault("email", "");
        String password = body.getOrDefault("password", "");

        if (username.isBlank() || email.isBlank() || password.isBlank()) {
            return Map.of("status", "errore", "messaggio", "Campi mancanti");
        }

        // TODO: salva nel database
        System.out.println("Nuovo utente: " + username + " - " + email);
        return Map.of("status", "ok", "messaggio", "Registrazione avvenuta con successo!");
    }
}
