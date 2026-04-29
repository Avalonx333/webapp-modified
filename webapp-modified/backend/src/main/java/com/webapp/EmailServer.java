package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServer {

    @Autowired
    private JavaMailSender mailSender;

    private final String from = "tripMood@gmail.com";

    public void emailBenvenuto(Utente u) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(u.getEmail());
        msg.setFrom(from);
        msg.setSubject("Benvenuto su TripMood!");
        msg.setText("Ciao " + u.getUsername() + ",\n\nbenvenuto su TripMood! Siamo felici di averti con noi.\n\nIl team TripMood");
        mailSender.send(msg);
    }

    public void emailAccesso(Utente u) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(u.getEmail());
        msg.setFrom(from);
        msg.setSubject("Nuovo accesso al tuo account TripMood");
        msg.setText("Ciao " + u.getUsername() + ",\n\nè stato effettuato un nuovo accesso al tuo account.\n\nIl team TripMood");
        mailSender.send(msg);
    }

    public void emailPrenotazione(Utente u, Viaggi v) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(u.getEmail());
        msg.setFrom(from);
        msg.setSubject("Conferma prenotazione viaggio");
        msg.setText("Ciao " + u.getUsername() + ",\n\nla tua prenotazione è confermata!\n" +
                "Destinazione: " + v.getDestinazione() + "\n" +
                "Partenza: " + v.getDataAndata() + "\n" +
                "Ritorno: " + v.getDataRitorno() + "\n\n" +
                "Grazie per aver scelto TripMood!");
        mailSender.send(msg);
    }
}
