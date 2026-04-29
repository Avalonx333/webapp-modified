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

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Date getDataAndata() {
        return dataAndata;
    }

    public void setDataAndata(Date dataAndata) {
        this.dataAndata = dataAndata;
    }

    public Date getDataRitorno() {
        return dataRitorno;
    }

    public void setDataRitorno(Date dataRitorno) {
        this.dataRitorno = dataRitorno;
    }

    public String getDestinazione() {
        return destinazione;
    }

    public void setDestinazione(String destinazione) {
        this.destinazione = destinazione;
    }

    public String getPartenza() {
        return partenza;
    }

    public void setPartenza(String partenza) {
        this.partenza = partenza;
    }

    public String getAlbergo() {
        return albergo;
    }

    public void setAlbergo(String albergo) {
        this.albergo = albergo;
    }
}
//commento