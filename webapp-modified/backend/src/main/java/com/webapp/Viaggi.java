package com.webapp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "viaggi")
public class Viaggi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "data_andata")
    private Date dataAndata;

    @Column(name = "data_ritorno")
    private Date dataRitorno;

    private String destinazione;
    private String partenza;
    private String albergo;

    // GETTER e SETTER
}
//commento