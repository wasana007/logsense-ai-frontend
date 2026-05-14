import { useState, useEffect, useRef, useCallback } from "react";
import { useLogApi } from "./hooks/useLogApi";
import { usePayrollLog } from "./hooks/usePayrollLog";
import {
  API_BASE_URL,
  GOOGLE_AUTH_PATH,
  API_ME,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
} from "./config";
import "./App.css";

const getToken = () => localStorage.getItem("jwt");

function App() {
  const [log, setLog]                     = useState("");
  const [user, setUser]                   = useState(null);
  const [checking, setChecking]           = useState(true);
  const [expandedRow, setExpandedRow]     = useState(null);
  const [result, setResult]               = useState("");
  const [wsStatus, setWsStatus]           = useState(null);
  const [showAiResult, setShowAiResult]   = useState(false);
  const popupRef                          = useRef(null);

  const handleLogResult = useCallback((correlationId, status, aiResult) => {
    setWsStatus(status);
    if (status === "COMPLETED") {
      setResult(aiResult ?? "");
      setShowAiResult(true);
    }
    if (status === "FAILED") {
      setResult("ERROR: " + (aiResult ?? "unknown"));
      setShowAiResult(true);
    }
  }, []);

  const { loading, correlationId, status, sendLog } = useLogApi(getToken);
  const { payrollEvents, clearEvents, stompRef }    = usePayrollLog(user, handleLogResult);

  const displayStatus = wsStatus ?? status;

  const handleSendLog = (logText) => {
    setResult("");
    setWsStatus(null);
    setShowAiResult(false);
    sendLog(logText);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { setChecking(false); return; }

    fetch(`${API_BASE_URL}${API_ME}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        setUser(data?.email ? { email: data.email, name: data.name } : null);
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem("jwt");
        setUser(null);
        setChecking(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("jwt");
      if (token && !user) {
        fetch(`${API_BASE_URL}${API_ME}`, {
          headers: { Authorization: "Bearer " + token },
        })
          .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
          .then((data) => {
            setUser({ email: data.email, name: data.name });
            setChecking(false);
          })
          .catch(() => {});
      }
    }, 500);
    return () => clearInterval(interval);
  }, [user]);

  const login = () => {
    const left    = window.screenX + (window.outerWidth  - WINDOW_WIDTH)  / 2;
    const top     = window.screenY + (window.outerHeight - WINDOW_HEIGHT) / 2;
    const authUrl = new URL(`${API_BASE_URL}${GOOGLE_AUTH_PATH}`);
    authUrl.searchParams.set("prompt", "select_account");
    popupRef.current = window.open(
      authUrl.toString(),
      "google-login",
      `width=${WINDOW_WIDTH},height=${WINDOW_HEIGHT},left=${left},top=${top},resizable=no,scrollbars=yes`
    );
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt_ready");
    stompRef.current?.deactivate();
    setUser(null);
    clearEvents();
    setResult("");
    setWsStatus(null);
    setShowAiResult(false);
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d   = new Date(iso);
    const day = d.getDate();
    const mon = d.getMonth() + 1;
    const yr  = String(d.getFullYear()).slice(-2);
    const hh  = String(d.getHours()).padStart(2, "0");
    const mm  = String(d.getMinutes()).padStart(2, "0");
    const ss  = String(d.getSeconds()).padStart(2, "0");
    return `${day}.${mon}.${yr} ${hh}:${mm}:${ss}`;
  };

  /* =========================
     LOADING SCREEN
  ========================= */
  if (checking) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-logo">📋</div>
          <div className="loading-spinner" />
          <p className="loading-text">Sjekker innlogging...</p>
        </div>
      </div>
    );
  }

  /* =========================
     LOGIN PAGE
  ========================= */
  if (!user) {
    return (
      <div className="app">
        <div className="header">
          <div className="logo">📋</div>
          <div className="header-text">
            <h1>Dashboard for loggovervåking</h1>
            <p>Java 21 · Spring Boot 3 · Kafka · React · PostgreSQL</p>
          </div>
          <div className="badge"><div className="dot" />Online</div>
        </div>

        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h2>Logg inn</h2>
          <p>Bruk Google-kontoen din for å få tilgang til systemet</p>

          <button className="google-btn" onClick={login}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Logg inn med Google
          </button>

          <p className="login-note">
            Et Google-vindu åpnes. Logg inn og kom tilbake automatisk.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     DASHBOARD
  ========================= */
  return (
    <div className="app">
      <div className="header">
        <div className="logo">📋</div>
        <div className="header-text">
          <h1>Dashboard for loggovervåking</h1>
          <p>Java 21 · Spring Boot 3 · Kafka · React · PostgreSQL</p>
        </div>
        <div className="badge"><div className="dot" />Online</div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <button className="logout-btn" onClick={logout}>Logg ut</button>
        </div>
      </div>

      <div className="dashboard">

        <div className="card">
          <div className="card-header">📝 Loggmelding</div>
          <div className="card-body">
            <textarea
              value={log}
              onChange={(e) => setLog(e.target.value)}
              placeholder={`Lim inn logg her...\nEksempler: ERROR: database connection timeout`}
            />
            <button
              className="analyze-btn"
              onClick={() => handleSendLog(log)}
              disabled={loading || displayStatus === "PENDING"}
            >
              {loading || displayStatus === "PENDING" ? "Analyserer..." : "Analyser logg"}
            </button>
          </div>
        </div>

        <div className="card">
          <div
            className={`card-header ${result ? "card-header-clickable" : ""}`}
            onClick={() => result && setShowAiResult((v) => !v)}
          >
            <span>🤖 AI-analyse — llama3.2</span>
            {result && (
              <span className="expand-hint">{showAiResult ? "▲" : "▼"}</span>
            )}
          </div>

          {(loading || displayStatus === "PENDING") && (
            <div className="progress-bar"><div className="progress-fill" /></div>
          )}

          {displayStatus && (
            <div className="status-row">
              <span className={`status-pill ${displayStatus}`}>{displayStatus}</span>
              {correlationId && <span className="corr-id">{correlationId}</span>}
            </div>
          )}

          {!result && !loading && !displayStatus && (
            <div className="result-empty">
              Ingen analyse ennå. Send en logg for å starte.
            </div>
          )}

          {result && showAiResult && (
            <div className={`ai-result-box ${result.startsWith("ERROR") ? "error" : ""}`}>
              <p className="ai-result-text">{result}</p>
            </div>
          )}
        </div>

        <div className="card card-full">
          <div className="card-header">
            📊 Log Events
            <span className="card-header-count">{payrollEvents.length}</span>
          </div>

          {payrollEvents.length === 0 ? (
            <div className="result-empty">Ingen events ennå...</div>
          ) : (
            <div className="table-wrap">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Kilde</th>
                    <th>Korrelasjons-ID</th>
                    <th>Melding</th>
                    <th>Status</th>
                    <th>Opprettet</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollEvents.map((event, i) => (
                    <>
                      <tr
                        key={`row-${i}`}
                        className={expandedRow === i ? "row-active" : ""}
                        onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                        style={{ cursor: event.result ? "pointer" : "default" }}
                      >
                        <td>
                          <span className={`source-badge ${event.source}`}>
                            {event.source ?? "—"}
                          </span>
                        </td>
                        <td>
                          <span className="corr-badge" title={event.correlationId ?? ""}>
                            {event.correlationId ? event.correlationId.slice(0, 8) + "…" : "—"}
                          </span>
                        </td>
                        <td className="td-message">
                          {event.message ?? "—"}
                          {event.result && (
                            <span className="expand-hint">
                              {expandedRow === i ? " ▲" : " ▼"}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`row-status ${event.status}`}>
                            <span className="row-status-dot" />
                            {event.status ?? "—"}
                          </span>
                        </td>
                        <td className="td-time">
                          {formatDate(event.createdAt ?? event.receivedAt)}
                        </td>
                      </tr>

                      {expandedRow === i && event.result && (
                        <tr key={`result-${i}`} className="row-result">
                          <td colSpan={5}>
                            <div className="ai-result-box">
                              <span className="ai-result-label">🤖 AI-analyse</span>
                              <p className="ai-result-text">{event.result}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <div className="footer">
        <span>v1.0.0</span><span>·</span>
        <span>localhost:8080</span><span>·</span>
        <span>llama3.2</span><span>·</span>
        <span>kafka:9092</span>
      </div>
    </div>
  );
}

export default App;