// =====================
// LOGIN + REGISTRAZIONE
// =====================

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // Toggle password
    // =====================
    document.querySelectorAll(".toggle-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    // =====================
    // Controllo password corrispondentit
    // =====================
    const pwd = document.getElementById("pwd");
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
    // REGISTRAZIONE
    // =====================
    const btnSubmit = document.querySelector(".btn-submit");

    if (btnSubmit) {
        btnSubmit.addEventListener("click", async () => {
            const username = document.getElementById("text").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = pwd ? pwd.value : "";
            const password2 = pwd2 ? pwd2.value : "";

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
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({username, email, password}),
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
            }
        });
    }

    // =====================
    // LOGIN
    // =====================
// =====================
// LOGIN
// =====================
    const btnAccedi = document.getElementById("btn-accedi");

    if (btnAccedi) {
        btnAccedi.addEventListener("click", async () => {

            const username = document.getElementById("text")?.value.trim() || "";
            const password = document.getElementById("pwd")?.value || "";

            if (!username || !password) {
                alert("Compila tutti i campi.");
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({username, password}),
                });

                // Se il server non risponde con JSON → errore
                const data = await res.json();

                // ✔️ UTENTE TROVATO
                if (data.status === "ok") {
                    alert("Accesso effettuato!");
                    window.location.href = "indexAccesso.html";   // <-- QUI APRI LA HOME
                    return;
                }

                // ❌ UTENTE NON TROVATO
                if (data.status === "errore") {
                    alert("❌ Utente non trovato");
                    return;
                }

            } catch (err) {
                alert("Errore di connessione al server: " + err.message);
                console.error(err);
            }
        });
    }



    // ===============================
//   STORICO VIAGGI DINAMICO
// ===============================

    const API_BASE = "http://localhost:8080/api";

// Quando la pagina viaggi.html si apre
    if (document.body.id === "viaggi") {
        document.addEventListener("DOMContentLoaded", () => {
            caricaStoricoViaggi();
        });
    }

    async function caricaStoricoViaggi() {
        const idUtente = localStorage.getItem("utenteId");

        if (!idUtente) {
            alert("Devi effettuare l'accesso");
            window.location.href = "login.html";
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/miei-viaggi/${idUtente}`);
            const data = await res.json();

            if (data.status !== "ok") {
                alert("Errore nel caricamento dei viaggi");
                return;
            }

            generaStorico(data.viaggi);
            aggiornaStatistiche(data.viaggi);

        } catch (err) {
            alert("Errore di connessione al server");
            console.error(err);
        }
    }

    function generaStorico(lista) {
        const container = document.getElementById("storico-lista");
        container.innerHTML = "";

        if (lista.length === 0) {
            container.innerHTML = `<p class="vuoto">Non hai ancora effettuato viaggi.</p>`;
            return;
        }

        lista.forEach(v => {
            const anno = new Date(v.dataAndata).getFullYear();

            container.innerHTML += `
            <div class="subpage-card storico-card" data-anno="${anno}">
                <div class="storico-header">
                    <span class="storico-dest"><i class="fa-solid fa-location-dot"></i> ${v.destinazione}</span>
                    <span class="storico-anno">${anno}</span>
                </div>

                <p class="storico-date">
                    <i class="fa-regular fa-calendar"></i>
                    ${formattaData(v.dataAndata)} – ${formattaData(v.dataRitorno)}
                </p>

                <p class="storico-info">
                    👥 ${v.adulti} adulti &nbsp;|&nbsp;
                    🏨 ${v.stelle} stelle &nbsp;|&nbsp;
                    🏖 ${v.tipo}
                </p>

                <div class="storico-rating">
                    <span style="color:#EFBF04">${"★".repeat(v.stelle)}${"☆".repeat(5 - v.stelle)}</span>
                </div>
            </div>
        `;
        });
    }

    function aggiornaStatistiche(lista) {
        document.getElementById("stat-totale").textContent = lista.length;

        let giorniTotali = 0;
        let paesi = new Set();

        lista.forEach(v => {
            const start = new Date(v.dataAndata);
            const end = new Date(v.dataRitorno);
            const diff = (end - start) / (1000 * 60 * 60 * 24);

            giorniTotali += diff;
            paesi.add(v.destinazione);
        });

        document.querySelectorAll(".stat-item")[1].querySelector(".stat-num").textContent = paesi.size;
        document.querySelectorAll(".stat-item")[2].querySelector(".stat-num").textContent = giorniTotali;
    }

    function formattaData(data) {
        const d = new Date(data);
        return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
    }

})

