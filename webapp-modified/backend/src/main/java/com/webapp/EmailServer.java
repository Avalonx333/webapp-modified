package com.webapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class EmailServer {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mittente;

    private void invia(String destinatario, String oggetto, String testo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mittente);
        message.setTo(destinatario);
        message.setSubject(oggetto);
        message.setText(testo);
        mailSender.send(message);
    }

    // Email di benvenuto alla registrazione
    public void emailBenvenuto(Utente u) {
        String dataCreazione = new SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date());
        String testo =
                "Benvenuto nella famiglia TripMood, " + u.getUsername() + "!\n\n" +
                        "Siamo felici di averti con noi. Il tuo account è stato creato con successo.\n\n" +
                        "══════════════════════════════\n" +
                        "  RIEPILOGO CREDENZIALI\n" +
                        "══════════════════════════════\n" +
                        "  Username : " + u.getUsername() + "\n" +
                        "  Email    : " + u.getEmail() + "\n" +
                        "  Account creato il: " + dataCreazione + "\n" +
                        "══════════════════════════════\n\n" +
                        "Con TripMood puoi prenotare viaggi, scoprire nuove destinazioni e\n" +
                        "vivere esperienze uniche in tutto il mondo.\n\n" +
                        "Conserva queste informazioni in un posto sicuro.\n" +
                        "Per qualsiasi problema scrivi a: supporto@tripmood.it\n\n" +
                        "Buon viaggio! ✈️\n" +
                        "Il team di TripMood";

        invia(u.getEmail(), "Benvenuto in TripMood! 🌍", testo);
    }

    // Email di notifica accesso
    public void emailAccesso(Utente u) {
        String dataAccesso = new SimpleDateFormat("dd/MM/yyyy 'alle' HH:mm:ss").format(new Date());
        String testo =
                "Ciao " + u.getUsername() + ",\n\n" +
                        "Ti informiamo che è stato effettuato un accesso al tuo account TripMood.\n\n" +
                        "══════════════════════════════\n" +
                        "  DETTAGLI ACCESSO\n" +
                        "══════════════════════════════\n" +
                        "  Account  : " + u.getUsername() + "\n" +
                        "  Email    : " + u.getEmail() + "\n" +
                        "  Data     : " + dataAccesso + "\n" +
                        "══════════════════════════════\n\n" +
                        "Se sei stato tu, non devi fare nulla. Buona navigazione!\n\n" +
                        "Se NON sei stato tu, ti consigliamo di cambiare subito la password\n" +
                        "e di contattarci a: sicurezza@tripmood.it\n\n" +
                        "Il team di TripMood";

        invia(u.getEmail(), "Accesso effettuato al tuo account TripMood 🔐", testo);
    }

    // Email di conferma prenotazione viaggio
    public void emailPrenotazione(Utente u, Viaggi v) {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        String dataPrenotazione = new SimpleDateFormat("dd/MM/yyyy 'alle' HH:mm").format(new Date());

        // Calcola durata del viaggio
        long diffMillis = v.getDataRitorno().getTime() - v.getDataAndata().getTime();
        long giorni = diffMillis / (1000 * 60 * 60 * 24);

        String testo =
                "Ciao " + u.getUsername() + "! 🎉\n\n" +
                        "La tua prenotazione è stata confermata con successo.\n" +
                        "Preparati a vivere un'esperienza indimenticabile!\n\n" +
                        "══════════════════════════════════════\n" +
                        "  RIEPILOGO PRENOTAZIONE\n" +
                        "══════════════════════════════════════\n" +
                        "  Destinazione : " + v.getDestinazione() + "\n" +
                        "  Partenza da  : " + v.getPartenza() + "\n" +
                        "  Data andata  : " + sdf.format(v.getDataAndata()) + "\n" +
                        "  Data ritorno : " + sdf.format(v.getDataRitorno()) + "\n" +
                        "  Durata       : " + giorni + " giorni\n" +
                        "  Albergo      : " + v.getAlbergo() + "\n" +
                        "══════════════════════════════════════\n\n" +
                        "  Prenotazione effettuata il: " + dataPrenotazione + "\n\n" +
                        "Ricorda di portare con te un documento d'identità valido.\n" +
                        "Per modifiche o cancellazioni contattaci entro 48 ore:\n" +
                        "  prenotazioni@tripmood.it\n\n" +
                        "Buon viaggio! 🌍✈️\n" +
                        "Il team di TripMood";

        invia(u.getEmail(), "Prenotazione confermata: " + v.getDestinazione() + " ✈️", testo);
    }
}
