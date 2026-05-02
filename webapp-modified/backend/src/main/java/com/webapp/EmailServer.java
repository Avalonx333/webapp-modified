package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;

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
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

        String dataAndata  = v.getDataAndata()  != null ? sdf.format(v.getDataAndata())  : "N/D";
        String dataRitorno = v.getDataRitorno() != null ? sdf.format(v.getDataRitorno()) : "N/D";

        String passeggeri = v.getAdulti() + " adult" + (v.getAdulti() == 1 ? "o" : "i");
        if (v.getBambini() != null && v.getBambini() > 0) {
            passeggeri += ", " + v.getBambini() + " bambin" + (v.getBambini() == 1 ? "o" : "i");
        }

        String stelle = v.getStelle() != null ? "★".repeat(v.getStelle()) : "N/D";

        String testo = "Ciao " + u.getUsername() + ",\n\n" +
                "✅ La tua prenotazione è CONFERMATA!\n" +
                "────────────────────────────────\n" +
                "🌍  Destinazione : " + v.getDestinazione() + "\n" +
                "✈️  Partenza da  : " + (v.getPartenza() != null ? v.getPartenza() : "Italia") + "\n" +
                "📅  Data andata  : " + dataAndata + "\n" +
                "📅  Data ritorno : " + dataRitorno + "\n" +
                "👥  Passeggeri  : " + passeggeri + "\n" +
                "🏨  Hotel        : " + stelle + "\n" +
                "🗺️  Tipo viaggio : " + (v.getTipo() != null ? v.getTipo() : "N/D") + "\n" +
                "🔑  ID prenotaz. : #" + v.getId() + "\n" +
                "────────────────────────────────\n\n" +
                "Grazie per aver scelto TripMood!\n" +
                "Buon viaggio 🧳\n\n" +
                "Il team TripMood";

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(u.getEmail());
        msg.setFrom(from);
        msg.setSubject("✅ Conferma prenotazione – " + v.getDestinazione());
        msg.setText(testo);
        mailSender.send(msg);
    }
}