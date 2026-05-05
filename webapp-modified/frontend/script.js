// =====================
// CONFIG
// =====================

const API_BASE = "http://localhost:8080/api";

const PIANI_CONFIG = {
    Base:    { colore: "#27ae60", sconto: 5  },
    Plus:    { colore: "#2980b9", sconto: 15 },
    Premium: { colore: "#f39c12", sconto: 40 },
};

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // HEADER LOGIN / LOGOUT
    // ===============================

    const username = localStorage.getItem("username");
    const linkAccedi = document.getElementById("link-accedi");
    const linkRegistrati = document.getElementById("link-registrati");
    const linkMieiViaggi = document.getElementById("link-miei-viaggi");

    if (username && linkAccedi && linkRegistrati) {
        linkAccedi.textContent = "Ciao, " + username;
        linkAccedi.removeAttribute("href");


        const pianoAttivo = localStorage.getItem("piano");
        if (pianoAttivo && PIANI_CONFIG[pianoAttivo]) {
            linkAccedi.style.color = PIANI_CONFIG[pianoAttivo].colore;
            linkAccedi.style.fontWeight = "bold";
            linkAccedi.title = "Piano " + pianoAttivo;
        }

        linkRegistrati.textContent = "Logout";
        linkRegistrati.href = "#";

        linkRegistrati.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("utenteId");
            localStorage.removeItem("username");
            localStorage.removeItem("piano");
            window.location.href = "index.html";
        });

        if (linkMieiViaggi) linkMieiViaggi.style.display = "inline-block";

        const div = document.getElementById("accesso")

        if ( window.location.pathname.toLowerCase().includes("index.html")) {
            div.style.right = "100px";
        }

    } else {
        if (linkMieiViaggi) linkMieiViaggi.style.display = "none";
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
                    if (data.utente.piano) {
                        localStorage.setItem("piano", data.utente.piano);
                    } else {
                        localStorage.removeItem("piano");
                    }
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

    if (window.location.pathname.toLowerCase().includes("viaggi.html")) {
        const idUtente = localStorage.getItem("utenteId");
        const guest = document.getElementById("viaggi-guest");
        const user = document.getElementById("viaggi-user");
        const brobro = document.getElementById("brobro");
        const intro = document.getElementById("viaggi-intro");
        const gridStart = document.getElementById("viaggi-grid-1")

        if (!idUtente) {
            if (guest) guest.style.display = "block";
            if (brobro) brobro.style.display = "flex"
            if (intro) intro.style.display = "flex"
            if (gridStart) gridStart.style.display = "block"
            if (user) user.style.display = "none";
        } else {
            if (guest) guest.style.display = "none";
            if (brobro) brobro.style.display = "none"
            if (intro) intro.style.display = "none"
            if (gridStart) gridStart.style.display = "none"
            if (user) user.style.display = "block";
        }
    }

    // ===============================
    // PAGINA STORICO
    // ===============================

    if (window.location.pathname.toLowerCase().includes("storico.html")) {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            alert("Devi effettuare l'accesso per vedere lo storico.");
            window.location.href = "accedi.html";
        } else {
            caricaStoricoViaggi();
        }
    }

    // ===============================
    // PRENOTA: init stelle di default + validazione live destinazione
    // ===============================

    if (window.location.pathname.toLowerCase().includes("prenota.html")) {
        selectStelle(3);

        const inputDest = document.getElementById("destinazione");
        if (inputDest) {
            let debounceTimer = null;

            inputDest.addEventListener("input", () => {
                clearTimeout(debounceTimer);
                const val = inputDest.value.trim();
                const feedback = document.getElementById("dest-feedback");
                if (!feedback) return;

                // Resetta lo stato ogni volta che l'utente modifica il testo
                feedback.dataset.valid = "pending";

                if (val.length < 2) {
                    feedback.textContent = "";
                    feedback.style.color = "";
                    feedback.dataset.valid = "";
                    return;
                }

                feedback.textContent = "⏳ Verifica destinazione...";
                feedback.style.color = "#888";
                debounceTimer = setTimeout(() => validaDestinazione(val, feedback), 700);
            });
        }
    }

    // ===============================
    // PRENOTAZIONE SCONTI
    // ===============================

    if (window.location.pathname.toLowerCase().includes("sconti.html")) {
        const idUtente = localStorage.getItem("utenteId");
        const piano = localStorage.getItem("piano");

        document.querySelectorAll(".sconto-btn-wrap").forEach(wrap => {
            if (!idUtente) {
                wrap.innerHTML = `<a href="accedi.html" class="prenota-btn" style="text-align:center;text-decoration:none;">Accedi</a>`;
            }
        });

        if (idUtente && piano && PIANI_CONFIG[piano]) {
            const sconto = PIANI_CONFIG[piano].sconto;
            const colore = PIANI_CONFIG[piano].colore;

            document.querySelectorAll(".sconto-card").forEach(card => {
                const prezzoEl = card.querySelector(".sconto-nuovo");
                if (!prezzoEl) return;

                const prezzoTesto = prezzoEl.textContent.replace(/[€\s.]/g, "").replace(",", ".");
                const prezzoBase = parseFloat(prezzoTesto);
                if (isNaN(prezzoBase)) return;

                const prezzoFinale = Math.round(prezzoBase * (1 - sconto / 100));
                prezzoEl.textContent = "€ " + prezzoFinale.toLocaleString("it-IT");

                const badge = card.querySelector(".sconto-badge");
                if (badge) {
                    const scontoOriginale = parseInt(badge.textContent.replace(/[^0-9]/g, ""), 10);
                    const scontoTotale = Math.min(scontoOriginale + sconto, 99);
                    badge.textContent = "−" + scontoTotale + "%";
                    badge.style.backgroundColor = colore;
                }

                let label = card.querySelector(".sconto-piano-label");
                if (!label) {
                    label = document.createElement("p");
                    label.className = "sconto-piano-label";
                    label.style.cssText = `font-size:11px; font-weight:bold; color:${colore}; margin:2px 0 6px;`;
                    prezzoEl.insertAdjacentElement("afterend", label);
                }
                label.textContent = `✓ Piano ${piano}: −${sconto}% extra applicato`;
            });
        }
    }

    window.prenotaSconto = async function (destinazione) {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            window.location.href = "accedi.html";
            return;
        }

        const oggi = new Date();
        const partenza = new Date(oggi);
        partenza.setDate(oggi.getDate() + 14);
        const ritorno = new Date(partenza);
        ritorno.setDate(partenza.getDate() + 7);
        const fmt = d => d.toISOString().split("T")[0];

        try {
            const res = await fetch(`${API_BASE}/prenota`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    utenteId: idUtente,
                    destinazione: destinazione,
                    partenza: "Italia",
                    albergo: "Da definire",
                    dataAndata: fmt(partenza),
                    dataRitorno: fmt(ritorno),
                    adulti: 2,
                    bambini: 0,
                    tipo: "Viaggio scontato",
                    stelle: 4
                }),
            });

            const data = await res.json();

            if (data.status === "ok") {
                const piano = localStorage.getItem("piano");
                const extraMsg = piano ? ` (sconto piano ${piano} incluso)` : "";
                alert(`✅ Prenotazione confermata!${extraMsg}\nRiceverai una email di conferma a breve.`);
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
    // ABBONAMENTI
    // ===============================

    if (window.location.pathname.toLowerCase().includes("abbonamenti.html")) {
        const idUtente = localStorage.getItem("utenteId");
        const pianoAttivo = localStorage.getItem("piano");
        const msg = document.getElementById("abbonamenti-msg");

        if (!idUtente) {
            ["btn-base", "btn-plus", "btn-premium"].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.textContent = "Accedi per abbonarti";
                    btn.onclick = () => { window.location.href = "accedi.html"; };
                }
            });
        }

        if (pianoAttivo && PIANI_CONFIG[pianoAttivo]) {
            const cfg = PIANI_CONFIG[pianoAttivo];
            if (msg) {
                msg.textContent = `✅ Sei abbonato al piano ${pianoAttivo} — sconto ${cfg.sconto}% su tutte le prenotazioni`;
                msg.style.color = cfg.colore;
                msg.style.fontWeight = "bold";
            }
            const btnAttivo = document.getElementById("btn-" + pianoAttivo.toLowerCase());
            if (btnAttivo) {
                btnAttivo.textContent = "✓ Piano attivo";
                btnAttivo.style.backgroundColor = cfg.colore;
                btnAttivo.disabled = true;
            }
        }
    }

    window.scegli = function (piano) {
        const idUtente = localStorage.getItem("utenteId");
        if (!idUtente) {
            window.location.href = "accedi.html";
            return;
        }

        const cfg = PIANI_CONFIG[piano];

        fetch(`${API_BASE}/utente/${idUtente}/piano`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ piano: piano }),
        }).catch(err => console.error("Errore salvataggio piano:", err));

        localStorage.setItem("piano", piano);

        const msg = document.getElementById("abbonamenti-msg");
        if (msg) {
            msg.textContent = `✅ Piano ${piano} attivato! Hai il ${cfg.sconto}% di sconto su tutte le prenotazioni.`;
            msg.style.color = cfg.colore;
            msg.style.fontWeight = "bold";
        }

        ["Base", "Plus", "Premium"].forEach(p => {
            const btn = document.getElementById("btn-" + p.toLowerCase());
            if (!btn) return;
            if (p === piano) {
                btn.textContent = "✓ Piano attivo";
                btn.style.backgroundColor = cfg.colore;
                btn.disabled = true;
            } else {
                btn.disabled = false;
                btn.style.backgroundColor = "";
                btn.textContent = p === "Base" ? "Inizia ora" : "Scegli " + p;
            }
        });

        const linkAccedi = document.getElementById("link-accedi");
        if (linkAccedi) {
            linkAccedi.style.color = cfg.colore;
            linkAccedi.style.fontWeight = "bold";
            linkAccedi.title = "Piano " + piano;
        }

        alert(`🎉 Piano ${piano} attivato!\nSconto ${cfg.sconto}% applicato a tutte le prenotazioni.\nTornando alla home vedrai il tuo nome colorato.`);
    };

    window.setFatturazione = function (tipo, btn) {
        document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const prezzi = {
            mensile: { base: "€ 4,99", plus: "€ 9,99",  premium: "€ 19,99" },
            annuale: { base: "€ 3,99", plus: "€ 7,99",  premium: "€ 15,99" },
        };
        const p = prezzi[tipo];
        const el = (id) => document.getElementById(id);
        if (el("prezzo-base"))    el("prezzo-base").textContent    = p.base;
        if (el("prezzo-plus"))    el("prezzo-plus").textContent    = p.plus;
        if (el("prezzo-premium")) el("prezzo-premium").textContent = p.premium;
    };

    window.toggleFaq = function (el) {
        const answer = el.nextElementSibling;
        const icon = el.querySelector("i");
        const isOpen = answer.style.display === "block";
        answer.style.display = isOpen ? "none" : "block";
        if (icon) icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
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
// VIAGGI PIÙ AMATI – PULSANTI PRENOTA
// ===============================

    if (window.location.pathname.toLowerCase().includes("amati.html")) {

        // Aggiungo il pulsante Prenota a ogni card
        document.querySelectorAll(".amato-card").forEach(card => {

            // Evita duplicazioni
            if (card.querySelector(".btn-prenota-amato")) return;

            const btn = document.createElement("button");
            btn.className = "btn-prenota-amato";
            btn.textContent = "Prenota ora";

            btn.style.cssText = `
            margin-top: 12px;
            padding: 10px 14px;
            background: #2980b9;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            width: 100%;
        `;

            card.appendChild(btn);

            // CLICK → prenotazione
            btn.addEventListener("click", async () => {
                const idUtente = localStorage.getItem("utenteId");

                if (!idUtente) {
                    alert("Accedi prima di prenotare.");
                    window.location.href = "accedi.html";
                    return;
                }

                const destinazione = card.querySelector(".subpage-card-title")?.textContent.trim();
                if (!destinazione) {
                    alert("Errore: destinazione non trovata.");
                    return;
                }

                // Date automatiche
                const oggi = new Date();
                const partenza = new Date(oggi);
                partenza.setDate(oggi.getDate() + 20);
                const ritorno = new Date(partenza);
                ritorno.setDate(partenza.getDate() + 7);

                const fmt = d => d.toISOString().split("T")[0];

                try {
                    const res = await fetch(`${API_BASE}/prenota`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            utenteId: idUtente,
                            destinazione: destinazione,
                            partenza: "Italia",
                            albergo: "Da definire",
                            dataAndata: fmt(partenza),
                            dataRitorno: fmt(ritorno),
                            adulti: 2,
                            bambini: 0,
                            tipo: "Viaggio più amato",
                            stelle: 4
                        }),
                    });

                    const data = await res.json();

                    if (data.status === "ok") {
                        alert("✅ Prenotazione confermata! Riceverai una email di conferma.");
                        window.location.href = "Storico.html";
                    } else {
                        alert(data.messaggio || "Errore nella prenotazione");
                    }

                } catch (err) {
                    console.error(err);
                    alert("Errore di connessione");
                }
            });
        });
    }

    // ===============================
    // RECENSIONI
    // ===============================

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

    if (window.location.pathname.toLowerCase().includes("recenzioni.html")) {
        caricaUltimeRecensioni();

        const btnInviaRec = document.getElementById("btn-invia-recensione");
        if (btnInviaRec) {
            btnInviaRec.addEventListener("click", inviaRecensione);
        }
    }


        var map = L.map("map").setView([45.62928126111086, 9.021469519511175], 17);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        var marker = L.marker([45.62928126111086, 9.021469519511175]).addTo(map);
        marker.bindPopup("<b>Sede TripMood</b><br>la nostra sede ufficiale!").openPopup();


});

// ===============================
// FUNZIONI STORICO
// ===============================

function caricaStoricoViaggi() {
    const idUtente = localStorage.getItem("utenteId");
    if (!idUtente) return;

    fetch(`${API_BASE}/miei-viaggi/${idUtente}`)
        .then(r => r.json())
        .then(data => {
            if (data.status !== "ok") return;
            generaStorico(data.viaggi);
            aggiornaStatistiche(data.viaggi);
            popolaFiltriAnni(data.viaggi);
            inizializzaMappaStorico(data.viaggi);
        })
        .catch(err => console.error(err));
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
    lista.forEach(v => anni.add(new Date(v.dataAndata).getFullYear()));

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
        c.style.display = (anno === "tutti" || cardAnno === anno) ? "flex" : "none";
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
// VALIDAZIONE DESTINAZIONE-
// ===============================



async function validaDestinazione(testo, feedbackEl) {
    feedbackEl.dataset.valid = "pending";

    try {
        const risposta = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 60,
                messages: [{
                    role: "user",
                    content: `Il testo "${testo}" e' il nome di un paese, citta', regione o destinazione turistica reale nel mondo? Rispondi SOLO con "SI" oppure "NO".`
                }]
            })
        });

        const data = await risposta.json();
        const answer = (data.content?.[0]?.text || "").trim().toUpperCase();

        if (answer.startsWith("SI")) {
            feedbackEl.textContent = "✅ Destinazione valida!";
            feedbackEl.style.color = "#27ae60";
            feedbackEl.dataset.valid = "true";
        } else {
            feedbackEl.textContent = "❌ Inserisci una destinazione reale (paese, città, regione)";
            feedbackEl.style.color = "#e74c3c";
            feedbackEl.dataset.valid = "false";
        }

    } catch (err) {
        console.error("Errore validazione AI:", err);

        // NON marchiamo come valida!
        feedbackEl.textContent = "⚠️ Errore nella verifica. Riprova.";
        feedbackEl.style.color = "#e67e22";
        feedbackEl.dataset.valid = "false";
    }
}


// ===============================
// FUNZIONI PRENOTA
// ===============================

window.selectStelle = function (n) {
    const stelle = document.querySelectorAll("#stelle-selector .stella");
    stelle.forEach(s => {
        const val = parseInt(s.dataset.val);
        s.classList.toggle("attiva", val <= n);
    });
    const selettore = document.getElementById("stelle-selector");
    if (selettore) selettore.dataset.selezionate = n;
    const label = document.getElementById("stelle-label");
    if (label) label.textContent = n + (n === 1 ? " stella selezionata" : " stelle selezionate");
};

window.changeCount = function (tipo, delta) {
    const span = document.getElementById(`count-${tipo}`);
    if (!span) return;

    let val = parseInt(span.textContent, 10);
    if (isNaN(val)) val = (tipo === "adulti") ? 1 : 0;

    val += delta;

    if (tipo === "adulti" && val < 1) val = 1;
    if (tipo === "bambini" && val < 0) val = 0;

    span.textContent = val;
};


window.prenotaViaggio = async function () {

    const idUtente = localStorage.getItem("utenteId");
    if (!idUtente) {
        alert("Devi effettuare l'accesso per prenotare.");
        window.location.href = "accedi.html";
        return;
    }

    const destinazioneInput = document.getElementById("destinazione");
    const destinazione = destinazioneInput ? destinazioneInput.value.trim() : "";
    const dataAndata = document.getElementById("data-partenza").value;
    const dataRitorno = document.getElementById("data-ritorno").value;
    const adulti = parseInt(document.getElementById("count-adulti").textContent, 10) || 1;
    const bambini = parseInt(document.getElementById("count-bambini").textContent, 10) || 0;
    const tipo = document.querySelector("input[name='tipo']:checked")?.value || "mare";

    const stelleVal = document.getElementById("stelle-selector")?.dataset?.selezionate;
    const stelle = parseInt(stelleVal || "3", 10);

    if (!destinazione || !dataAndata || !dataRitorno) {
        alert("Compila tutti i campi obbligatori.");
        return;
    }

    // -------------------------------------------------------
    // BLOCCO VALIDAZIONE DESTINAZIONE — logica robusta
    // -------------------------------------------------------
    const feedbackEl = document.getElementById("dest-feedback");

    if (feedbackEl) {
        const stato = feedbackEl.dataset.valid;

        // Caso 1: la validazione non è mai partita (campo non toccato o troppo corto)
        if (!stato) {
            feedbackEl.textContent = "⏳ Verifica destinazione in corso...";
            feedbackEl.style.color = "#888";
            feedbackEl.dataset.valid = "pending";
            await validaDestinazione(destinazione, feedbackEl);
        }

        // Caso 2: la validazione è ancora in corso (debounce non ancora risolto)
        if (feedbackEl.dataset.valid === "pending") {
            alert("Stiamo ancora verificando la destinazione. Attendi un momento e riprova.");
            destinazioneInput?.focus();
            return;
        }

        // Caso 3: destinazione marcata come non valida
        if (feedbackEl.dataset.valid === "false") {
            alert("La destinazione inserita non esiste o non è un luogo reale.\nCorreggila prima di procedere.");
            destinazioneInput?.focus();
            return;
        }

        // Caso 4: valid === "true" → si procede
    }
    // -------------------------------------------------------

    const btnPrenota = document.getElementById("btn-prenota");
    if (btnPrenota) {
        btnPrenota.disabled = true;
        btnPrenota.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Invio in corso...';
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
            alert(
                "✅ Prenotazione confermata!\n\n" +
                "presto arriverà l'email di conferma!!"
            );
            window.location.href = "Storico.html";
        } else {
            alert(data.messaggio || "Errore nella prenotazione");
            if (btnPrenota) {
                btnPrenota.disabled = false;
                btnPrenota.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Conferma prenotazione';
            }
        }

    } catch (err) {
        console.error(err);
        alert("Errore di connessione al server. Riprova più tardi.");
        if (btnPrenota) {
            btnPrenota.disabled = false;
            btnPrenota.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Conferma prenotazione';
        }
    }
};

// ===============================
// PRENOTAZIONE GRUPPO
// ===============================

window.prenotaGruppo = async function (nomePacchetto) {
    const idUtente = localStorage.getItem("utenteId");
    if (!idUtente) {
        alert("Devi effettuare l'accesso per prenotare.");
        window.location.href = "accedi.html";
        return;
    }

    const tipoGruppo = document.querySelector("input[name='gruppo']:checked")?.value || "coppia";

    const oggi = new Date();
    const partenza = new Date(oggi);
    partenza.setDate(oggi.getDate() + 30);
    const ritorno = new Date(partenza);
    ritorno.setDate(partenza.getDate() + 7);
    const fmt = d => d.toISOString().split("T")[0];

    const adultiMap = { coppia: 2, famiglia: 4, amici: 8, corporate: 15 };
    const adulti = adultiMap[tipoGruppo] || 2;

    try {
        const res = await fetch(`${API_BASE}/prenota`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                utenteId: idUtente,
                destinazione: "Destinazione a sorpresa – " + nomePacchetto,
                partenza: "Italia",
                albergo: "Da definire",
                dataAndata: fmt(partenza),
                dataRitorno: fmt(ritorno),
                adulti: adulti,
                bambini: 0,
                tipo: "Gruppo – " + tipoGruppo,
                stelle: 4
            }),
        });

        const data = await res.json();

        if (data.status === "ok") {
            alert("✅ Prenotazione gruppo confermata!\nRiceverai una email di conferma a breve.");
            window.location.href = "Storico.html";
        } else {
            alert(data.messaggio || "Errore nella prenotazione");
        }

    } catch (err) {
        console.error(err);
        alert("Errore di connessione");
    }
};