// =====================
// CONFIG
// =====================

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // HEADER: MOSTRA NOME UTENTE + "I MIEI VIAGGI"
    // ===============================

    const username = localStorage.getItem("username");
    const linkAccedi = document.getElementById("link-accedi");
    const linkRegistrati = document.getElementById("link-registrati");
    const linkMieiViaggi = document.getElementById("link-miei-viaggi");

    if (username && linkAccedi && linkRegistrati) {
        linkAccedi.textContent = "Ciao, " + username;
        linkAccedi.removeAttribute("href");

        linkRegistrati.textContent = "Logout";
        linkRegistrati.href = "#";

        linkRegistrati.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("utenteId");
            localStorage.removeItem("username");
            window.location.href = "index.html";
        });

        if (linkMieiViaggi) {
            linkMieiViaggi.style.display = "inline-block";
        }
    } else {
        if (linkMieiViaggi) {
            linkMieiViaggi.style.display = "none";
        }
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

    if (pwd2 && pwd && matchMsg) {
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

    if (btnSubmit && document.body.id === "registrati") {
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
                    localStorage.setItem("username", data.utente.username);
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
    // PAGINA VIAGGI: guest vs user
    // ===============================

    if (document.body.id === "viaggi" && window.location.pathname.toLowerCase().includes("viaggi.html")) {
        const idUtente = localStorage.getItem("utenteId");
        const guest = document.getElementById("viaggi-guest");
        const user = document.getElementById("viaggi-user");
        const aggiunta = document.getElementById("viaggi-intro");

        if (!idUtente) {
            if (guest) guest.style.display = "flex";
            if (aggiunta) aggiunta.style.display = "flex"
            if (user) user.style.display = "none";
        } else {
            if (guest) guest.style.display = "none";
            if (aggiunta) aggiunta.style.display = "none"
            if (user) user.style.display = "flex";
        }
    }

    // ===============================
    // PAGINA STORICO VIAGGI
    // ===============================

    if (document.body.id === "viaggi" && window.location.pathname.toLowerCase().includes("storico.html")) {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            alert("Devi effettuare l'accesso per vedere lo storico.");
            window.location.href = "accedi.html";
        } else {
            caricaStoricoViaggi();
        }
    }

    async function caricaStoricoViaggi() {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) return;

        const container = document.getElementById("storico-lista");

        try {
            const res = await fetch(`${API_BASE}/miei-viaggi/${idUtente}`);

            const data = await res.json();

            if (!res.ok || data.status !== "ok") {
                const msg = data.messaggio || `Errore HTTP ${res.status}`;
                console.error("Errore storico:", msg);
                if (container) container.innerHTML = `<p class="vuoto">⚠️ ${msg}</p>`;
                return;
            }

            generaStorico(data.viaggi);
            aggiornaStatistiche(data.viaggi);
            popolaFiltriAnni(data.viaggi);
            inizializzaMappaStorico(data.viaggi);

        } catch (err) {
            console.error("Errore connessione storico:", err);
            if (container) container.innerHTML = `<p class="vuoto">Impossibile connettersi al server. Il backend è in esecuzione?</p>`;
        }
    }

    function generaStorico(lista) {
        const container = document.getElementById("storico-lista");
        if (!container) return;
        container.innerHTML = "";

        if (!lista || lista.length === 0) {
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
                        👥 ${v.adulti || 1} adulti &nbsp;|&nbsp;
                        🏨 ${v.stelle || 3} stelle &nbsp;|&nbsp;
                        🏖 ${v.tipo || "Viaggio"}
                    </p>
                </div>
            `;
        });
    }

    function aggiornaStatistiche(lista) {
        const statTotale = document.getElementById("stat-totale");
        const statPaesi = document.getElementById("stat-paesi");
        const statGiorni = document.getElementById("stat-giorni");
        if (!lista || !statTotale || !statPaesi || !statGiorni) return;

        statTotale.textContent = lista.length;

        let giorniTotali = 0;
        let paesi = new Set();

        lista.forEach(v => {
            const start = new Date(v.dataAndata);
            const end = new Date(v.dataRitorno);
            giorniTotali += (end - start) / (1000 * 60 * 60 * 24);
            paesi.add(v.destinazione);
        });

        statPaesi.textContent = paesi.size;
        statGiorni.textContent = giorniTotali;
    }

    function popolaFiltriAnni(lista) {
        const filtro = document.getElementById("filtro-anni");
        if (!filtro || !lista) return;

        const anni = new Set();
        lista.forEach(v => {
            const anno = new Date(v.dataAndata).getFullYear();
            anni.add(anno);
        });

        filtro.innerHTML = "";
        const btnTutti = document.createElement("button");
        btnTutti.className = "filtro-btn active";
        btnTutti.textContent = "Tutti";
        btnTutti.onclick = () => filtraAnno('tutti', btnTutti);
        filtro.appendChild(btnTutti);

        Array.from(anni).sort((a, b) => b - a).forEach(anno => {
            const btn = document.createElement("button");
            btn.className = "filtro-btn";
            btn.textContent = anno;
            btn.onclick = () => filtraAnno(String(anno), btn);
            filtro.appendChild(btn);
        });
    }

    window.filtraAnno = function (anno, btn) {
        const cards = document.querySelectorAll(".storico-card");
        cards.forEach(c => {
            const cardAnno = c.getAttribute("data-anno");
            if (anno === "tutti" || cardAnno === anno) {
                c.style.display = "flex";
            } else {
                c.style.display = "none";
            }
        });

        document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
        if (btn) btn.classList.add("active");
    };

    function inizializzaMappaStorico(lista) {
        const mapDiv = document.getElementById("map-storico");
        if (!mapDiv || !window.L || !lista || lista.length === 0) return;

        const map = L.map("map-storico").setView([20, 0], 2);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: "&copy; OpenStreetMap"
        }).addTo(map);

        lista.forEach(v => {
            // qui potresti usare un geocoding vero; per ora placeholder random
            const lat = (Math.random() * 140) - 70;
            const lng = (Math.random() * 360) - 180;
            L.marker([lat, lng]).addTo(map)
                .bindPopup(`<b>${v.destinazione}</b><br>${formattaData(v.dataAndata)} – ${formattaData(v.dataRitorno)}`);
        });
    }

    function formattaData(data) {
        const d = new Date(data);
        return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
    }

    // ===============================
    // VALIDAZIONE DESTINAZIONE (Nominatim / OpenStreetMap)
    // ===============================

    async function validaCitta(nome) {
        if (!nome || nome.length < 2) return false;
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nome)}&format=json&limit=5&featuretype=city,town,village`;
            const res = await fetch(url, { headers: { "Accept-Language": "it" } });
            const risultati = await res.json();
            return risultati.some(r =>
                ["city", "town", "village", "municipality", "administrative"].includes(r.type) ||
                r.class === "place"
            );
        } catch (e) {
            // Se Nominatim non è raggiungibile (es. rete scolastica), lascia passare
            console.warn("Nominatim non raggiungibile, skip validazione:", e);
            return true;
        }
    }

    // ===============================
    // PAGINA PRENOTA: logica prenotazione
    // ===============================

    // Definite PRIMA del blocco if, così sono disponibili subito al click
    window.changeCount = function (tipo, delta) {
        const span = document.getElementById(`count-${tipo}`);
        if (!span) return;
        let val = parseInt(span.textContent, 10);
        val += delta;
        if (tipo === "adulti" && val < 1) val = 1;
        if (tipo === "bambini" && val < 0) val = 0;
        span.textContent = val;
    };

    window.selectStelle = function (n) {
        const stelle = document.querySelectorAll("#stelle-selector .stella");
        stelle.forEach(s => {
            const val = parseInt(s.getAttribute("data-val"), 10);
            if (val <= n) {
                s.classList.add("attiva");
            } else {
                s.classList.remove("attiva");
            }
        });
        const label = document.getElementById("stelle-label");
        if (label) {
            label.textContent = `${n} stelle selezionate`;
        }
        document.body.dataset.stelleSelezionate = n;
    };

    if (document.body.id === "viaggi" && window.location.pathname.toLowerCase().includes("prenota.html")) {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            alert("Devi effettuare l'accesso per prenotare un viaggio.");
            window.location.href = "accedi.html";
        } else {
            selectStelle(3); // default stelle = 3

            // Feedback in tempo reale mentre si digita la destinazione
            const inputDest = document.getElementById("destinazione");
            if (inputDest) {
                let debounceTimer;
                inputDest.addEventListener("input", () => {
                    clearTimeout(debounceTimer);
                    const val = inputDest.value.trim();
                    const feedback = document.getElementById("dest-feedback");
                    if (!feedback) return;
                    if (val.length < 2) {
                        feedback.textContent = "";
                        feedback.style.color = "";
                        return;
                    }
                    feedback.textContent = "⏳ Verifico...";
                    feedback.style.color = "gray";
                    debounceTimer = setTimeout(async () => {
                        const ok = await validaCitta(val);
                        if (ok) {
                            feedback.textContent = "✅ Città riconosciuta";
                            feedback.style.color = "green";
                        } else {
                            feedback.textContent = "⚠️ Città non trovata, controlla il nome";
                            feedback.style.color = "orange";
                        }
                    }, 600);
                });
            }
        }
    }

    window.prenotaViaggio = async function () {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            alert("Devi effettuare l'accesso per prenotare.");
            window.location.href = "accedi.html";
            return;
        }

        const destinazione = document.getElementById("destinazione")?.value.trim();
        const dataAndata = document.getElementById("data-partenza")?.value;
        const dataRitorno = document.getElementById("data-ritorno")?.value;
        const adulti = parseInt(document.getElementById("count-adulti")?.textContent || "1", 10);
        const bambini = parseInt(document.getElementById("count-bambini")?.textContent || "0", 10);
        const tipo = document.querySelector("input[name='tipo']:checked")?.value || "viaggio";
        const stelle = parseInt(document.body.dataset.stelleSelezionate || "3", 10);

        if (!destinazione || !dataAndata || !dataRitorno) {
            alert("Compila tutti i campi obbligatori.");
            return;
        }

        // Valida che la destinazione sia una città reale
        const cittaValida = await validaCitta(destinazione);
        if (!cittaValida) {
            alert(`⚠️ "${destinazione}" non sembra una città valida. Controlla il nome e riprova.`);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/prenota`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    utenteId: idUtente,
                    destinazione,
                    dataAndata,
                    dataRitorno,
                    adulti,
                    bambini,
                    tipo,
                    stelle
                }),
            });

            const data = await res.json();

            if (data.status === "ok") {
                alert("Prenotazione effettuata con successo!");
                window.location.href = "Storico.html";
            } else {
                alert(data.messaggio || "Errore nella prenotazione");
            }

        } catch (err) {
            console.error(err);
            alert("Errore di connessione");
        }
    };

    // ===============================
    // NAVIGAZIONE UTENTE LOGGATO
    // ===============================

    window.navigateTo = function (page) {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            alert("Devi effettuare l'accesso per accedere a questa sezione.");
            window.location.href = "accedi.html";
            return;
        }
        window.location.href = page;
    };

    // ===============================
    // RECENSIONI (frontend generico)
    // ===============================

    if (window.location.pathname.toLowerCase().includes("recenzioni.html")) {
        caricaUltimeRecensioni();

        const btnInviaRec = document.getElementById("btn-invia-recensione");
        if (btnInviaRec) {
            btnInviaRec.addEventListener("click", inviaRecensione);
        }
    }

    async function caricaUltimeRecensioni() {
        const container = document.getElementById("rec-list");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/recensioni/ultime`);
            const data = await res.json();
            if (data.status !== "ok") return;

            container.innerHTML = "";
            data.recensioni.forEach(r => {
                container.innerHTML += `
                    <div class="subpage-card rec-card">
                        <div class="rec-card-header">
                            <div>
                                <p class="rec-nome">${r.utente.username}</p>
                                <p class="rec-dest">${r.destinazione}</p>
                            </div>
                            <div class="rec-stelle">${"★".repeat(r.stelle)}${"☆".repeat(5 - r.stelle)}</div>
                        </div>
                        <p class="rec-testo">"${r.testo}"</p>
                        <p class="rec-data">${new Date(r.dataRecensione).toLocaleDateString("it-IT")}</p>
                    </div>
                `;
            });

        } catch (err) {
            console.error("Errore caricamento recensioni:", err);
        }
    }

    //mappa index//

    var map = L.map('map').setView([45.62928126111086, 9.021469519511175], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var marker = L.marker([45.62928126111086, 9.021469519511175]).addTo(map);
    marker.bindPopup("<b>Sede TripMood</b><br>la nostra sede ufficiale!").openPopup();

    async function inviaRecensione() {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            alert("Devi effettuare l'accesso per lasciare una recensione.");
            window.location.href = "accedi.html";
            return;
        }

        const destinazione = document.getElementById("rec-destinazione")?.value.trim();
        const testo = document.getElementById("rec-testo")?.value.trim();
        const stelle = parseInt(document.querySelector("input[name='rec-stelle']:checked")?.value || "5", 10);

        if (!destinazione || !testo) {
            alert("Compila tutti i campi della recensione.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/recensioni`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    utenteId: idUtente,
                    destinazione,
                    testo,
                    stelle
                }),
            });

            const data = await res.json();
            if (data.status === "ok") {
                alert("Recensione inviata!");
                caricaUltimeRecensioni();
            } else {
                alert(data.messaggio || "Errore nell'invio della recensione");
            }

        } catch (err) {
            console.error(err);
            alert("Errore di connessione");
        }
    }

});