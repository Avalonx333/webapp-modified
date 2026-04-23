// =====================
// Costanti
// =====================
const API_BASE = "http://localhost:8080/api";

// =====================
// Funzioni di utilità
// =====================
async function apiGet(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`Errore GET ${endpoint}: ${res.status}`);
    return res.json();
}

async function apiPost(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Errore POST ${endpoint}: ${res.status}`);
    return res.json();
}

// =====================
// Mappa
// =====================
var map = L.map('map').setView([45.62928126111086, 9.021469519511175], 17);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);
var marker = L.marker([45.62928126111086, 9.021469519511175]).addTo(map);
marker.bindPopup("<b>Sede TripMood</b><br>la nostra sede ufficiale!").openPopup();

// =====================
// Registrazione alternativa (non usata ma mantenuta)
// =====================
async function registrati() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('reg-messaggio');

    if (!username || !password) {
        msg.textContent = "Compila tutti i campi.";
        msg.style.color = "red";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        msg.textContent = data.messaggio;
        msg.style.color = res.ok ? "green" : "red";
    } catch (err) {
        msg.textContent = "Errore di connessione al server.";
        msg.style.color = "red";
    }
}

// =====================
// DOM Ready
// =====================
document.addEventListener("DOMContentLoaded", () => {

    // Toggle password
    document.querySelectorAll(".toggle-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    // Controllo password
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

    // Registrazione
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

    // Login
    const btnAccedi = document.getElementById("btn-accedi");

    if (btnAccedi) {
        btnAccedi.addEventListener("click", async () => {
            const email = document.getElementById("email")?.value.trim() || "";
            const password = document.getElementById("pwd")?.value || "";

            if (!email || !password) {
                alert("Compila tutti i campi.");
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/accedi`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
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

// =====================
// Navigazione
// =====================
function navigateTo(page) {
    window.location.href = page;
}

// =====================
// Contatori adulti/bambini
// =====================
const _contatoriStato = { adulti: 1, bambini: 0 };

function changeCount(tipo, delta) {
    _contatoriStato[tipo] = Math.max(0, _contatoriStato[tipo] + delta);
    if (tipo === 'adulti') _contatoriStato[tipo] = Math.max(1, _contatoriStato[tipo]);
    const el = document.getElementById(`count-${tipo}`);
    if (el) el.textContent = _contatoriStato[tipo];
}

// =====================
// Stelle hotel
// =====================
let _stelleSelezionate = 0;

function selectStelle(val) {
    _stelleSelezionate = val;
    document.querySelectorAll('#stelle-selector .stella').forEach(s => {
        s.classList.toggle('attiva', parseInt(s.dataset.val) <= val);
    });
    const labels = ['', '1 stella', '2 stelle', '3 stelle', '4 stelle', '5 stelle'];
    const lbl = document.getElementById('stelle-label');
    if (lbl) lbl.textContent = labels[val];
}

// =====================
// Prenotazione viaggio
// =====================
function prenotaViaggio() {
    const dest = document.getElementById('destinazione');
    const partenza = document.getElementById('data-partenza');
    const ritorno = document.getElementById('data-ritorno');

    if (!dest || !dest.value.trim()) {
        alert('Inserisci una destinazione.');
        return;
    }
    if (!partenza || !partenza.value) {
        alert('Seleziona la data di partenza.');
        return;
    }
    if (!ritorno || !ritorno.value) {
        alert('Seleziona la data di ritorno.');
        return;
    }
    if (new Date(ritorno.value) <= new Date(partenza.value)) {
        alert('La data di ritorno deve essere successiva alla partenza.');
        return;
    }

    const tipo = document.querySelector('input[name="tipo"]:checked');
    alert(`✅ Prenotazione confermata!
📍 ${dest.value}
📅 ${partenza.value} → ${ritorno.value}
👥 ${_contatoriStato.adulti} adulti, ${_contatoriStato.bambini} bambini
🏨 ${_stelleSelezionate || '—'} stelle`);
}

// =====================
// Filtri storico
// =====================
function filtraAnno(anno, btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.storico-card').forEach(card => {
        card.style.display = (anno === 'tutti' || card.dataset.anno === anno) ? '' : 'none';
    });
}

// =====================
// Codici sconto
// =====================
const CODICI_VALIDI = { 'TRIP2025': '10%', 'ESTATE25': '15%', 'WELCOME': '5%' };

function applicaCodice() {
    const input = document.getElementById('codice-sconto');
    const msg = document.getElementById('codice-msg');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    if (CODICI_VALIDI[code]) {
        msg.textContent = `✓ Codice valido! Sconto ${CODICI_VALIDI[code]} applicato.`;
        msg.style.color = 'green';
    } else {
        msg.textContent = '✗ Codice non valido o scaduto.';
        msg.style.color = 'red';
    }
}

// =====================
// Countdown
// =====================
(function avviaCountdown() {
    const el = document.getElementById('timer');
    if (!el) return;

    const fine = new Date();
    fine.setHours(23, 59, 59, 0);

    function aggiorna() {
        const diff = fine - new Date();
        if (diff <= 0) { el.textContent = 'Scaduto'; return; }
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
        setTimeout(aggiorna, 1000);
    }
    aggiorna();
})();

// =====================
// Filtri recensioni
// =====================
let filtroDestCorrente = 'tutti';
let filtroStelleCorrente = 0;

function filtraRec(btn, dest) {
    document.querySelectorAll('.filtro-anni .filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroDestCorrente = dest;
    applicaFiltri();
}

function filtraStelle(btn, stelle) {
    document.querySelectorAll('.filtro-anni .filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroStelleCorrente = stelle;
    applicaFiltri();
}

function applicaFiltri() {
    document.querySelectorAll('.rec-card').forEach(card => {
        const dest = card.getAttribute('data-dest');
        const stelle = parseInt(card.getAttribute('data-stelle'));
        const destOk = filtroDestCorrente === 'tutti' || dest === filtroDestCorrente;
        const stelleOk = filtroStelleCorrente === 0 || stelle === filtroStelleCorrente;
        card.style.display = (destOk && stelleOk) ? '' : 'none';
    });
}

// =====================
// Recensioni
// =====================
let stellaSelezionata = 0;

function setStella(n) {
    stellaSelezionata = n;
    document.querySelectorAll('#rec-stelle-input .stella').forEach((s, i) => {
        s.classList.toggle('attiva', i < n);
    });
}

function inviaRecensione() {
    const msg = document.getElementById('rec-msg');
    msg.style.color = '#378add';
    msg.textContent = 'Grazie! La tua recensione è stata inviata e sarà pubblicata dopo la verifica.';
    setTimeout(() => { msg.textContent = ''; }, 4000);
}

// =====================
// Abbonamenti
// =====================
const prezziMensili = { base: 4.99, plus: 9.99, premium: 19.99 };

function setFatturazione(tipo, btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const mult = tipo === 'annuale' ? 0.8 : 1;
    const periodo = tipo === 'annuale' ? '/ mese (fatturato annualmente)' : '/ mese';

    document.getElementById('prezzo-base').textContent = '€ ' + (prezziMensili.base * mult).toFixed(2).replace('.', ',');
    document.getElementById('prezzo-plus').textContent = '€ ' + (prezziMensili.plus * mult).toFixed(2).replace('.', ',');
    document.getElementById('prezzo-premium').textContent = '€ ' + (prezziMensili.premium * mult).toFixed(2).replace('.', ',');

    document.querySelectorAll('.piano-periodo').forEach(p => p.textContent = periodo);
}

function scegli(piano) {
    const msg = document.getElementById('abbonamenti-msg');
    msg.style.color = '#378add';
    msg.textContent = '✅ Hai selezionato il piano ' + piano + '! Verrai reindirizzato alla pagina di pagamento...';
    setTimeout(() => { msg.textContent = ''; }, 4000);
}

// =====================
// FAQ
// =====================
function toggleFaq(el) {
    const item = el.parentElement;
    item.classList.toggle('open');
}

