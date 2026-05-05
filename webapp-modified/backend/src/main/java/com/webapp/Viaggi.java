package com.webapp;

import jakarta.persistence.*;

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

    private Double latitudine;
    private Double longitudine;

    // campi aggiuntivi per storico
    private Integer adulti;
    private Integer bambini;
    private Integer stelle;
    private String tipo;

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

    public Integer getAdulti() {
        return adulti;
    }

    public void setAdulti(Integer adulti) {
        this.adulti = adulti;
    }

    public Integer getBambini() {
        return bambini;
    }

    public void setBambini(Integer bambini) {
        this.bambini = bambini;
    }

    public Integer getStelle() {
        return stelle;
    }

    public void setStelle(Integer stelle) {
        this.stelle = stelle;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Double getLatitudine() {
        return latitudine;
    }

    public void setLatitudine(Double latitudine) {
        this.latitudine = latitudine;
    }

    public Double getLongitudine() {
        return longitudine;
    }

    public void setLongitudine(Double longitudine) {
        this.longitudine = longitudine;
    }
}
//aaa