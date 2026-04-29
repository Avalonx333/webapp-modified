// =====================
// CONFIG
// =====================

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // HEADER: MOSTRA NOME UTENTE
    // ===============================

    const username = localStorage.getItem("username");
    const linkAccedi = document.getElementById("link-accedi");
    const linkRegistrati = document.getElementById("link-registrati");

    if (username && linkAccedi && linkRegistrati) {
        // Trasforma "Accedi" → "Ciao, Marta"
        linkAccedi.textContent = "Ciao, " + username;
        linkAccedi.removeAttribute("href");

        // Trasforma "Registrati" → "Logout"
        linkRegistrati.textContent = "Logout";
        linkRegistrati.href = "#";

        linkRegistrati.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("utenteId");
            localStorage.removeItem("username");
            window.location.reload();
        });
    }

    // =====================
    // TOGGLE PASSWORD
    // =====================

    document.querySelectorAll(".toggle-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    // =====================
    // MATCH PASSWORD
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
                    alert("Registrazione avvenuta!");
                    window.location.href = "index.html";
                } else {
                    alert(data.messaggio);
                }
            } catch (err) {
                alert("Errore di connessione");
            }
        });
    }

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

                const data = await res.json();

                if (data.status === "ok") {
                    localStorage.setItem("utenteId", data.utente.id);
                    localStorage.setItem("username", data.utente.username); // <--- FONDAMENTALE
                    window.location.href = "index.html";
                } else {
                    alert("Credenziali errate");
                }

            } catch (err) {
                alert("Errore di connessione");
            }
        });
    }

    // ===============================
    // PAGINA VIAGGI
    // ===============================

    if (document.body.id === "viaggi") {
        const idUtente = localStorage.getItem("utenteId");

        if (!idUtente) {
            attivaModalitaStatica();
            disabilitaInterazioni();
        } else {
            caricaStoricoViaggi();
        }
    }

    function attivaModalitaStatica() {
        const stats = document.getElementById("statistiche");
        if (stats) stats.style.display = "none";

        const container = document.getElementById("storico-lista");
        if (container) {
            container.innerHTML = `<p class="vuoto">Accedi per vedere il tuo storico viaggi.</p>`;
        }

        const filtri = document.getElementById("filtri-viaggi");
        if (filtri) filtri.style.display = "none";
    }

    function disabilitaInterazioni() {
        document.querySelectorAll("a").forEach(a => {
            a.addEventListener("click", e => e.preventDefault());
            a.style.pointerEvents = "none";
            a.style.opacity = "0.5";
        });

        document.querySelectorAll("button").forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        });

        document.querySelectorAll(".subpage-card, .card, .cliccabile").forEach(el => {
            el.style.pointerEvents = "none";
            el.style.opacity = "0.6";
        });
    }

    async function caricaStoricoViaggi() {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) return;

        try {
            const res = await fetch(`${API_BASE}/miei-viaggi/${idUtente}`);
            const data = await res.json();

            if (data.status !== "ok") return;

            generaStorico(data.viaggi);
            aggiornaStatistiche(data.viaggi);

        } catch (err) {
            console.error("Errore:", err);
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
            giorniTotali += (end - start) / (1000 * 60 * 60 * 24);
            paesi.add(v.destinazione);
        });

        document.querySelectorAll(".stat-item")[1].querySelector(".stat-num").textContent = paesi.size;
        document.querySelectorAll(".stat-item")[2].querySelector(".stat-num").textContent = giorniTotali;
    }

    function formattaData(data) {
        const d = new Date(data);
        return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
    }

});
