package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired
    private AuthService service;

    @Autowired
    private Utenterepository utenteRepository;

    @Autowired
    private ViaggiRepository viaggiRepository;

    @Autowired
    private EmailService emailService;

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

    // Storico dei viaggi
    @GetMapping("/miei-viaggi/{idUtente}")
    public ResponseEntity<?> mieiViaggi(@PathVariable Integer idUtente) {

        List<Viaggi> lista = service.getViaggiUtente(idUtente);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "viaggi", lista
        ));
    }

    // Prenotazione viaggio con invio email di conferma
    @PostMapping("/prenota")
    public ResponseEntity<?> prenota(@RequestBody Map<String, Object> body) {
        try {
            Long utenteId = Long.parseLong(body.get("utenteId").toString());

            Utente utente = utenteRepository.findById(utenteId).orElse(null);
            if (utente == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "status", "errore",
                        "messaggio", "Utente non trovato"
                ));
            }

            Viaggi v = new Viaggi();
            v.setDestinazione(body.get("destinazione").toString());
            v.setPartenza(body.getOrDefault("partenza", "Italia").toString());
            v.setAlbergo(body.getOrDefault("albergo", "Da definire").toString());

            // Parse date
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            v.setDataAndata(sdf.parse(body.get("dataAndata").toString()));
            v.setDataRitorno(sdf.parse(body.get("dataRitorno").toString()));

            Viaggi salvato = viaggiRepository.save(v);

            // Salva relazione utente-viaggio
            UtenteViaggi uv = new UtenteViaggi();
            uv.setUtenteId(utenteId);
            uv.setViaggioId(salvato.getId().longValue());

