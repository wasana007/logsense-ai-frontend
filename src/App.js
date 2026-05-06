import { useState, useEffect, useRef } from "react";
import { useLogApi } from "./hooks/useLogApi";
import { API_BASE_URL, APP_URL } from "./config";
import "./App.css";

const getToken = () => localStorage.getItem("jwt");

if (window.location.pathname === "/login-success") {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get("token");

  if (token && window.opener) {
    window.opener.postMessage(
      { type: "LOGIN_SUCCESS", token },
      APP_URL
    );
    window.close();
  }
}

function App() {
  const [log, setLog]           = useState("");
  const [user, setUser]         = useState(null);
  const [checking, setChecking] = useState(true);
  const popupRef                = useRef(null);

  const { result, loading, status, correlationId, sendLog } = useLogApi(getToken);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setChecking(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/me`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        if (data?.authenticated === true || data?.email) {
          setUser({ email: data.email, name: data.name });
        } else {
          setUser(null);
        }
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem("jwt");
        setUser(null);
        setChecking(false);
      });
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== APP_URL) return;
      if (event.data?.type !== "LOGIN_SUCCESS") return;

      const token = event.data.token;
      localStorage.setItem("jwt", token);

      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }

      fetch(`${API_BASE_URL}/api/v1/me`, {
        headers: { Authorization: "Bearer " + token }
      })
        .then(res => res.json())
        .then(data => setUser({ email: data.email, name: data.name }))
        .catch(() => setUser(null));
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (window.location.pathname === "/login-success") {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-logo">📋</div>
          <div className="loading-spinner" />
          <p className="loading-text">Logger inn...</p>
        </div>
      </div>
    );
  }

  const login = () => {
    const width  = 500;
    const height = 620;
    const left   = window.screenX + (window.outerWidth  - width)  / 2;
    const top    = window.screenY + (window.outerHeight - height) / 2;

    const authUrl = new URL(`${API_BASE_URL}/oauth2/authorization/google`);
    authUrl.searchParams.set("prompt", "select_account");

    popupRef.current = window.open(
      authUrl.toString(),
      "google-login",
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=yes`
    );
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setUser(null);
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
              onClick={() => sendLog(log)}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyser logg"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">🤖 AI-analyse — llama3.2</div>

          {loading && <div className="progress-bar"><div className="progress-fill" /></div>}

          {status && !loading && (
            <div className="status-row">
              <span className={`status-pill ${status}`}>{status}</span>
              {correlationId && <span className="corr-id">{correlationId}</span>}
            </div>
          )}

          {!result && !loading && !status && (
            <div className="result-empty">
              Ingen analyse ennå. Send en logg for å starte.
            </div>
          )}

          {result && !loading && (
            <div className={`result-content ${result.startsWith("ERROR") ? "error" : ""}`}>
              {result}
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