# WebApp

## Struttura
```
webapp/
├── frontend/
│   ├── index.html   ← pagina principale
│   ├── style.css    ← stili (collegato in <head>)
│   └── script.js    ← logica + chiamate REST al backend
└── backend/
    ├── pom.xml      ← dipendenze Maven / Spring Boot
    └── src/main/java/com/webapp/
        ├── MainApplication.java  ← entry point
        └── ApiController.java    ← endpoint /api/...
```

## Come avviare

### Backend
```bash
cd backend
mvn spring-boot:run
# ascolta su http://localhost:8080
```

### Frontend
Apri `frontend/index.html` nel browser (o usa Live Server in VS Code).

## Come sono collegati
| Frontend | Backend |
|----------|---------|
| `script.js` usa `fetch()` verso `API_BASE = "http://localhost:8080/api"` | `ApiController.java` espone gli endpoint sotto `/api/...` |
| `index.html` carica `style.css` e `script.js` | `@CrossOrigin("*")` permette le chiamate dal browser in dev |
