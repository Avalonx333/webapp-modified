package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
//controller REST di Spring Boot.
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
    private UtenteViaggiRepository utenteViaggiRepository;

    @Autowired
    private RecenzioniRepository recensioneRepository;

    @Autowired
    private EmailServer emailService;

    @PostMapping("/registra")
    public ResponseEntity<?> registra(@RequestBody Utente u) {
//controllo esistenza utente
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
//salava utente
        Utente salvato = service.registra(u);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "messaggio", "Registrazione avvenuta con successo!",
                "utente", salvato
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

        // Il campo piano è già incluso nell'oggetto trovato grazie al campo in Utente.java
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "messaggio", "Login riuscito!",
                "utente", trovato
        ));
    }

    // Storico dei viaggi
    @GetMapping("/miei-viaggi/{idUtente}")
    public ResponseEntity<?> mieiViaggi(@PathVariable Long idUtente) {

        List<Viaggi> lista = service.getViaggiUtente(idUtente);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "viaggi", lista
        ));
    }

    // Prenotazione viaggio con salvataggio su utenti_viaggi e invio email
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

            if (body.containsKey("latitudine") && body.get("latitudine") != null) {
                try { v.setLatitudine(Double.parseDouble(body.get("latitudine").toString())); } catch (NumberFormatException ignored) {}
            }
            if (body.containsKey("longitudine") && body.get("longitudine") != null) {
                try { v.setLongitudine(Double.parseDouble(body.get("longitudine").toString())); } catch (NumberFormatException ignored) {}
            }

            if (body.containsKey("adulti")) {
                v.setAdulti(Integer.parseInt(body.get("adulti").toString()));
            }
            if (body.containsKey("bambini")) {
                v.setBambini(Integer.parseInt(body.get("bambini").toString()));
            }
            if (body.containsKey("tipo")) {
                v.setTipo(body.get("tipo").toString());
            }
            if (body.containsKey("stelle")) {
                v.setStelle(Integer.parseInt(body.get("stelle").toString()));
            }

            try {
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                v.setDataAndata(sdf.parse(body.get("dataAndata").toString()));
                v.setDataRitorno(sdf.parse(body.get("dataRitorno").toString()));
            } catch (java.text.ParseException e) {
                return ResponseEntity.status(400).body(Map.of(
                        "status", "errore",
                        "messaggio", "Formato data non valido. Usa yyyy-MM-dd"
                ));
            }

            Viaggi salvato = viaggiRepository.save(v);

            UtenteViaggi uv = new UtenteViaggi();
            uv.setUtenteId(utenteId);
            uv.setViaggioId(salvato.getId().longValue());
            utenteViaggiRepository.save(uv);

            try {
                emailService.emailPrenotazione(utente, salvato);
            } catch (Exception e) {
                System.err.println("Errore invio email prenotazione: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "messaggio", "Prenotazione effettuata",
                    "viaggioId", salvato.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "errore",
                    "messaggio", "Errore interno: " + e.getMessage()
            ));
        }
    }

    // Ottenere dati utente tramite ID
    @GetMapping("/utente/{id}")
    public ResponseEntity<?> getUtente(@PathVariable Long id) {

        Utente u = utenteRepository.findById(id).orElse(null);

        if (u == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", "errore",
                    "messaggio", "Utente non trovato"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "utente", u
        ));
    }

    // Aggiorna piano abbonamento utente
    @PostMapping("/utente/{id}/piano")
    public ResponseEntity<?> aggiornaPiano(@PathVariable Long id, @RequestBody Map<String, Object> body) {

        Utente utente = utenteRepository.findById(id).orElse(null);
        if (utente == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", "errore",
                    "messaggio", "Utente non trovato"
            ));
        }

        String piano = body.get("piano").toString();
        utente.setPiano(piano);
        utenteRepository.save(utente);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "messaggio", "Piano aggiornato",
                "piano", piano
        ));
    }

    // Salva una recensione
    @PostMapping("/recensioni")
    public ResponseEntity<?> salvaRecensione(@RequestBody Map<String, Object> body) {
        try {
            Long utenteId = Long.parseLong(body.get("utenteId").toString());
            String destinazione = body.get("destinazione").toString();
            int stelle = Integer.parseInt(body.get("stelle").toString());
            String testo = body.get("testo").toString();

            Utente utente = utenteRepository.findById(utenteId).orElse(null);
            if (utente == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "status", "errore",
                        "messaggio", "Utente non trovato"
                ));
            }

            Recenzioni r = new Recenzioni();
            r.setUtente(utente);
            r.setDestinazione(destinazione);
            r.setStelle(stelle);
            r.setTesto(testo);
            r.setDataRecensione(new Date());

            Recenzioni salvata = recensioneRepository.save(r);

            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "recensione", salvata
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "errore",
                    "messaggio", "Errore interno: " + e.getMessage()
            ));
        }
    }

    // Ultime 8 recensioni (le più recenti)
    @GetMapping("/recensioni/ultime")
    public ResponseEntity<?> ultimeRecensioni() {
        List<Recenzioni> lista = recensioneRepository.findTop8ByOrderByDataRecensioneDesc();
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "recensioni", lista
        ));
    }
}