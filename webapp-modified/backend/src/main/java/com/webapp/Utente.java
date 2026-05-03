package com.webapp;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "utenti")
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String piano;
    private String username;
    private String email;
    private String password;

    public void setPiano(String piano) {
        this.piano = piano;
    }

    public String getPiano() {
        return piano;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
//aaa