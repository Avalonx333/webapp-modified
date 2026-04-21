// =====================
// Costanti
// =====================
const API_BASE = "http://localhost:8080/api";

// =====================
// Funzioni di utilità
// =====================

/**
 * Esegue una chiamata GET al backend Java.
 * @param {string} endpoint - es. "/utenti"
 * @returns {Promise<any>}
 */
async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`Errore GET ${endpoint}: ${res.status}`);
  return res.json();
}

/**
 * Esegue una chiamata POST al backend Java.
 * @param {string} endpoint - es. "/utenti"
 * @param {object} body
 * @returns {Promise<any>}
 */
async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Errore POST ${endpoint}: ${res.status}`);
  return res.json();
}

document.addEventListener("DOMContentLoaded", () => {

  // =====================
  // Toggle visibilità password
  // =====================
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // =====================
  // Controllo password corrispondenti
  // =====================
  const pwd  = document.getElementById("pwd");
  const pwd2 = document.getElementById("pwd2");
  const matchMsg = document.getElementById("match-msg");

  if (pwd2) {
    pwd2.addEventListener("input", () => {
      if (pwd.value === pwd2.value) {
        matchMsg.textContent = "✓ Le password coincidono";
        matchMsg.style.color = "green";
      } else {
        matchMsg.textContent = "✗ Le password non coincidono";
        matchMsg.style.color = "red";
      }
    });
  }

  // =====================
  // Invio form di registrazione al backend
  // =====================
  const btnSubmit = document.querySelector(".btn-submit");

  if (btnSubmit) {
    btnSubmit.addEventListener("click", async () => {
      const username  = document.getElementById("text").value.trim();
      const email     = document.getElementById("email").value.trim();
      const password  = pwd  ? pwd.value  : "";
      const password2 = pwd2 ? pwd2.value : "";

      // Validazione base lato client
      if (!username || !email || !password) {
        alert("Compila tutti i campi.");
        return;
      }
      if (password !== password2) {
        alert("Le password non coincidono.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/registra`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (data.status === "ok") {
          alert("✅ " + data.messaggio);
          window.location.href = "index.html";
        } else {
          alert("❌ " + data.messaggio);
        }
      } catch (err) {
        alert("Errore di connessione al server: " + err.message);
        console.error(err);
      }
    });
  }
});
