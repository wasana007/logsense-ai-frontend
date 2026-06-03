import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { API_BASE_URL, API_ME, JWT_KEY } from "./config";
import { usePayrollLog } from "./hooks/usePayrollLog";
import { useLogApi } from "./hooks/useLogApi";
import DashboardPage from "./pages/DashboardPage";
import LogsPage from "./pages/LogsPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";

const getToken = (): string | null => localStorage.getItem("jwt");

type LogStatus = "PENDING" | "FAILED" | "COMPLETED";

interface User {
  email: string;
  name: string;
}

interface MeResponse {
  email?: string;
  name?: string;
}

function LoadingScreen() {
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

interface RequireAuthProps {
  user: User | null;
  checking: boolean;
  children: React.ReactNode;
}

function RequireAuth({ user, checking, children }: RequireAuthProps) {
  if (checking) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

function Layout({ user, onLogout, children }: LayoutProps) {
  return (
    <div className="app">
      <div className="header">
        <div className="logo">📋</div>
        <div className="header-text">
          <h1>Dashboard for loggovervåking</h1>
          <p>Java 21 · Spring Boot 3 · Kafka · React · PostgreSQL</p>
        </div>
        <nav className="nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Dashboard
          </NavLink>
          <NavLink to="/logs" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Logs
          </NavLink>
        </nav>
        <div className="badge"><div className="dot" />Online</div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <button className="logout-btn" onClick={onLogout}>Logg ut</button>
        </div>
      </div>

      <div className="dashboard">
        {children}
      </div>

      <div className="footer">
        <span>v1.0.0</span><span>·</span>
        <span>localhost:8080</span><span>·</span>
        <span>llama3.2</span><span>·</span>
        <span>kafka:9092</span><span>·</span>
        <span>elasticsearch:9200</span>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser]                 = useState<User | null>(null);
  const [checking, setChecking]         = useState<boolean>(true);
  const [wsStatus, setWsStatus]         = useState<LogStatus | null>(null);
  const [result, setResult]             = useState<string>("");
  const [showAiResult, setShowAiResult] = useState<boolean>(false);
  const [log, setLog]                   = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleLogResult = useCallback((
    correlationId: string,
    status: LogStatus | undefined,
    aiResult: string | undefined,
  ): void => {
    setWsStatus(status ?? null);
    if (status === "COMPLETED") {
      setResult(aiResult ?? "");
      setShowAiResult(true);
    }
    if (status === "FAILED") {
      setResult("ERROR: " + (aiResult ?? "unknown"));
      setShowAiResult(true);
    }
  }, []);

  const { payrollEvents, clearEvents, stompRef }    = usePayrollLog(user, handleLogResult);
  const { loading, correlationId, status, sendLog } = useLogApi(getToken);

  const handleSendLog = (logText: string): void => {
    setResult("");
    setWsStatus(null);
    setShowAiResult(false);
    sendLog(logText);
  };

  const fetchAndSetUser = (token: string): Promise<void> =>
    fetch(`${API_BASE_URL}${API_ME}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: MeResponse) => {
        setUser(data?.email ? { email: data.email, name: data.name ?? "" } : null);
        setChecking(false);
      });

  useEffect(() => {
    const token = getToken();
    if (!token) { setChecking(false); return; }

    fetchAndSetUser(token).catch(() => {
      localStorage.removeItem("jwt");
      setUser(null);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("jwt");
      if (token && !user) {
        fetchAndSetUser(token).catch(() => {});
      }
    }, 500);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleMessage(event: MessageEvent): void {
      if (event.origin !== API_BASE_URL) return;
      if ((event.data as { type?: string })?.type !== "LOGIN_SUCCESS") return;

      const token = (event.data as { token: string }).token;
      localStorage.setItem(JWT_KEY, token);

      fetchAndSetUser(token).catch(() => {
        localStorage.removeItem(JWT_KEY);
        setUser(null);
      });
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const logout = (): void => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt_ready");
    stompRef.current?.deactivate();
    setUser(null);
    clearEvents();
    setResult("");
    setWsStatus(null);
    setShowAiResult(false);
    setLog("");
    setExpandedRow(null);
  };

  return (
    <Routes>
      <Route path="/login" element={
        checking ? <LoadingScreen /> : user ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      <Route path="/dashboard" element={
        <RequireAuth user={user} checking={checking}>
          <Layout user={user!} onLogout={logout}>
            <DashboardPage
              payrollEvents={payrollEvents}
              loading={loading}
              correlationId={correlationId}
              status={status}
              wsStatus={wsStatus}
              result={result}
              showAiResult={showAiResult}
              setShowAiResult={setShowAiResult}
              log={log}
              setLog={setLog}
              expandedRow={expandedRow}
              setExpandedRow={setExpandedRow}
              onSendLog={handleSendLog}
            />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/logs" element={
        <RequireAuth user={user} checking={checking}>
          <Layout user={user!} onLogout={logout}>
            <LogsPage />
          </Layout>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}