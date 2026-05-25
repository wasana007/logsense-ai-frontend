```markdown
# logsense-ai-frontend

LogSenseAI React-frontend for et AI-drevet logganalysedashboard med OAuth2-autentisering, sanntids oppdatering via WebSocket og Elasticsearch-basert loggsøk. Kommuniserer med en Java Spring Boot/Kafka-backend for å sende loggdata, spore behandling via correlationId og motta AI-genererte analyser i sanntid.

## Oversikt

React-applikasjon som lar brukere sende loggmeldinger til 🔗 [Backend (Java Spring Boot + Kafka)](https://github.com/wasana007/logsense-ai-backend) og motta AI-genererte analyser asynkront. Autentisering håndteres via OAuth2 Google-popup, og resultater mottas automatisk via WebSocket når analysen er fullført. Historiske logger kan søkes opp via Elasticsearch.

## 🎥 Demo

### 🎬 Dashboard for loggovervåking - Klikk på bildet nedenfor for å se hele demoen på YouTube ▶️
[![Watch Demo](https://raw.githubusercontent.com/wasana007/logsense-ai-backend/master/docs/images/logsenseai.jpg)](https://www.youtube.com/watch?v=MTGsfn9Y7eY&list=PLOwWtF7kBLb8EYRrO9Z94Oalhewrdnwmj)

## Funksjoner

- OAuth2-innlogging via Google-popup
- Send loggmeldinger til backend via POST
- Sanntids statusvisning: `PENDING` → `COMPLETED` / `FAILED`
- Resultater mottas via WebSocket — ingen polling
- Animert progress bar under behandling
- Viser `correlationId` for sporing
- Live Log Events-tabell med sanntidsoppdatering via WebSocket
- Støtter kilder: `PAYROLL_SERVICE` og `LOGSENSE_AI`
- Elasticsearch-basert loggsøk med keyword og statusfilter

## Teknologi

| Teknologi | Versjon |
|---|---|
| React | 18+ |
| Create React App | 5+ |
| @stomp/stompjs | siste |
| sockjs-client | siste |
| react-router-dom | siste |

## Kom i gang

**Forutsetninger:** Node.js 18+ og 🔗 [Backend (Java Spring Boot + Kafka)](https://github.com/wasana007/logsense-ai-backend) kjørende på `http://localhost:8080`

```bash
npm install
npm start
```

Åpnes på `http://localhost:3000`

## Konfigurasjon

Konfigureres i `src/config.js`:

| Konstant | Standard | Beskrivelse |
|---|---|---|
| `API_BASE_URL` | `http://localhost:8080` | logsense-ai-backend |
| `WS_RECONNECT_DELAY` | `5000` | WebSocket reconnect-intervall i ms |
| `MAX_LOG_ENTRIES` | `50` | Maks antall rader i logtabellen |
| `WINDOW_WIDTH` | `500` | Bredde på Google login-popup |
| `WINDOW_HEIGHT` | `620` | Høyde på Google login-popup |
| `REDIRECT_DELAY_MS` | `500` | Forsinkelse før redirect etter login |
| `API_LOGS_SEARCH` | `/api/v1/logs/search` | Elasticsearch keyword-søk |
| `API_LOGS_SEARCH_STATUS` | `/api/v1/logs/search/status` | Elasticsearch statusfilter |

## Relasjon til backend

```
logsense-ai-frontend (port 3000)
      │
      │  POST /api/v1/logs                    → send logg
      │  GET  /api/v1/me                      → hent brukerinfo
      │  GET  /api/v1/logs/search?q=          → Elasticsearch keyword-søk
      │  GET  /api/v1/logs/search/status/{s}  → Elasticsearch statusfilter
      │
      │  WS   /ws                             → WebSocket-tilkobling
      │  SUB  /topic/payroll-logs             → live payroll-events
      │  SUB  /topic/logs                     → AI-analyseresultater
      ▼
logsense-ai-backend (port 8080)
```

## Scripts

```bash
npm start       # Start utviklingsserver
npm test        # Kjør tester
npm run build   # Bygg for produksjon
```