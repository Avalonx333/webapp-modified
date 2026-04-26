package com.webapp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
    @Table(name = "utenti_viaggi")
    @Data
    public class UtenteViaggi {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "utente_id")
        private Long utenteId;

        @Column(name = "viaggio_id")
        private Long viaggioId;
    }
//commento