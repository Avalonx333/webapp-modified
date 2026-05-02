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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUtenteId() {
        return utenteId;
    }

    public void setUtenteId(Long utenteId) {
        this.utenteId = utenteId;
    }

    public Long getViaggioId() {
        return viaggioId;
    }

    public void setViaggioId(Long viaggioId) {
        this.viaggioId = viaggioId;
    }
}
//aaa