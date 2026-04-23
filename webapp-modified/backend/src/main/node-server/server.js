const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// Connessione MySQL
// =====================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Scuola2026!",   // ← metti la tua password MySQL
  database: "TripMood",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Errore connessione MySQL:", err.message);
  } else {
    console.log("✅ Connesso al database MySQL!");
  }
});

// =====================
// API - Registrazione utente
// POST /api/registra
// =====================
app.post("/api/registra", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ status: "errore", messaggio: "Dati incompleti." });
  }

  // Controlla se username o email esistono già
  const checkSql = "SELECT id FROM utenti WHERE username = ? OR email = ?";
  db.query(checkSql, [username, email], (err, results) => {
    if (err) return res.status(500).json({ status: "errore", messaggio: "Errore del server." });

    if (results.length > 0) {
      return res.status(409).json({ status: "errore", messaggio: "Username o email già esistente." });
    }

    // Inserisci il nuovo utente
    const insertSql = "INSERT INTO utenti (username, email, password) VALUES (?, ?, ?)";
    db.query(insertSql, [username, email, password], (err) => {
      if (err) return res.status(500).json({ status: "errore", messaggio: "Errore durante la registrazione." });
      res.json({ status: "ok", messaggio: "Registrazione avvenuta con successo!" });
    });
  });
});

// =====================
// API - Login utente
// POST /api/login
// =====================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: "errore", messaggio: "Dati incompleti." });
  }

  const sql = "SELECT id, username FROM utenti WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ status: "errore", messaggio: "Errore del server." });

    if (results.length === 0) {
      return res.status(401).json({ status: "errore", messaggio: "Username o password errati." });
    }

    res.json({ status: "ok", messaggio: "Login riuscito!", utente: results[0] });
  });
});

// =====================
// API - Lista utenti (per debug)
// GET /api/utenti
// =====================
app.get("/api/utenti", (req, res) => {
  db.query("SELECT id, username, email FROM utenti", (err, results) => {
    if (err) return res.status(500).json({ status: "errore", messaggio: "Errore del server." });
    res.json(results);
  });
});

// =====================
// Avvio server
// =====================
app.listen(3000, () => {
  console.log("🚀 Server avviato su http://localhost:3000");
});