# logsense-ai-frontend

LogSenseAI React-frontend for et AI-drevet logganalysedashboard med OAuth2-autentisering og sanntids statusoppdatering via polling. Kommuniserer med en Java Spring Boot/Kafka-backend for å sende loggdata, spore behandling via correlationId og hente AI-genererte analyser asynkront.

## Oversikt

React-applikasjon som lar brukere sende loggmeldinger til 🔗 [Backend (๋Java Spring Boot + Kafka)](https://github.com/wasana007/logsense-ai-backend) og motta AI-genererte analyser asynkront. Autentisering håndteres via OAuth2, og resultater hentes automatisk via polling inntil analysen er fullført.

## Funksjoner

- OAuth2-innlogging
- Send loggmeldinger til backend via POST
- Sanntids statusvisning: `PENDING` → `COMPLETED` / `FAILED`
- Polling mot `GET /api/v1/logs/{correlationId}`
- Animert progress bar under behandling
- Viser `correlationId` for sporing

## Teknologi

| Teknologi | Versjon |
|---|---|
| React | 18+ |
| Create React App | 5+ |
| @react-oauth/google | siste |

## Kom i gang

**Forutsetninger:** Node.js 18+ og 🔗 [Backend (๋Java Spring Boot + Kafka)](https://github.com/wasana007/logsense-ai-backend) kjørende på `http://localhost:8080`

```bash
npm install
npm start
```

Åpnes på `http://localhost:3000`

## Konfigurasjon

Konfigureres direkte i `src/App.js`:

| Variabel | Standard | Beskrivelse |
|---|---|---|
| API URL | `http://localhost:8080` | logsense-ai-backend |
| `POLL_INTERVAL_MS` | `1500` | Polling-intervall i ms |
| `POLL_MAX_ATTEMPTS` | `20` | Maks forsøk (~30 sek) |
| `redirect_uri` | `http://localhost:3000` | OAuth2 redirect |

## Relasjon til backend

```
logsense-ai-frontend (port 3000)
      │
      │  POST /api/v1/logs        → send logg
      │  GET  /api/v1/logs/{id}   → poll resultat
      ▼
logsense-ai-backend (port 8080)
```

## Scripts

```bash
npm start       # Start utviklingsserver
npm test        # Kjør tester
npm run build   # Bygg for produksjon
```