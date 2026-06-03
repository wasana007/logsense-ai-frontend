import { formatDate } from "../utils/formatDate.ts";

interface PayrollEvent {
  source?: string;
  correlationId?: string;
  message?: string;
  status?: string;
  result?: string;
  createdAt?: string;
  receivedAt?: string;
}

interface DashboardPageProps {
  payrollEvents?: PayrollEvent[];
  loading: boolean;
  correlationId?: string | null;
  status?: string | null;
  wsStatus?: string | null;
  result: string;
  showAiResult: boolean;
  setShowAiResult: React.Dispatch<React.SetStateAction<boolean>>;
  log: string;
  setLog: (v: string) => void;
  expandedRow: number | null;
  setExpandedRow: (v: number | null) => void;
  onSendLog: (log: string) => void;
}

export default function DashboardPage({
  payrollEvents = [],
  loading,
  correlationId,
  status,
  wsStatus,
  result,
  showAiResult,
  setShowAiResult,
  log,
  setLog,
  expandedRow,
  setExpandedRow,
  onSendLog,
}: DashboardPageProps) {
  const displayStatus = wsStatus ?? status;

  return (
    <>
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
            onClick={() => onSendLog(log)}
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
          {result && <span className="expand-hint">{showAiResult ? "▲" : "▼"}</span>}
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
          <div className="result-empty">Ingen analyse ennå. Send en logg for å starte.</div>
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
    </>
  );
}