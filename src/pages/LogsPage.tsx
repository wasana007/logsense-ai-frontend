import { useState } from "react";
import { API_BASE_URL, API_LOGS_SEARCH, API_LOGS_SEARCH_STATUS } from "../config";
import { formatDate } from "../utils/formatDate.ts";

const getToken = (): string | null => localStorage.getItem("jwt");

type LogStatus = "COMPLETED" | "FAILED" | "PENDING";

interface LogEntry {
  source?: string;
  correlationId?: string;
  message?: string;
  status?: LogStatus;
  createdAt?: string;
}

export default function LogsPage() {
  const [searchQuery, setSearchQuery]     = useState<string>("");
  const [searchStatus, setSearchStatus]   = useState<LogStatus | "">("");
  const [searchResults, setSearchResults] = useState<LogEntry[]>([]);
  const [searching, setSearching]         = useState<boolean>(false);

  const handleSearch = async (): Promise<void> => {
    setSearching(true);
    try {
      const token = getToken();
      const url = searchStatus && !searchQuery
        ? `${API_BASE_URL}${API_LOGS_SEARCH_STATUS}/${searchStatus}`
        : `${API_BASE_URL}${API_LOGS_SEARCH}?q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, { headers: { Authorization: "Bearer " + token } });
      const data: LogEntry[] = await res.json();
      const sorted = data.sort((a, b) => {
        return new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime();
      });
      setSearchResults(sorted);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="card card-full">
      <div className="card-header">🔍 Søk i logger (Elasticsearch)</div>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
          placeholder="Søk etter keyword..."
        />
        <select
          className="search-select"
          value={searchStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSearchStatus(e.target.value as LogStatus | "")}
        >
          <option value="">Alle statuser</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
          <option value="PENDING">PENDING</option>
        </select>
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={searching || (!searchQuery && !searchStatus)}
        >
          {searching ? "Søker..." : "Søk"}
        </button>
      </div>

      {searchResults.length === 0 && !searching && (
        <div className="result-empty">Ingen resultater.</div>
      )}

      {searchResults.length > 0 && (
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
              {searchResults.map((r: LogEntry, i: number) => (
                <tr key={i}>
                  <td><span className={`source-badge ${r.source ?? ""}`}>{r.source ?? "—"}</span></td>
                  <td><span className="corr-badge">{r.correlationId ? r.correlationId.slice(0, 8) + "…" : "—"}</span></td>
                  <td className="td-message">{r.message ?? "—"}</td>
                  <td>
                    <span className={`row-status ${r.status}`}>
                      <span className="row-status-dot" />
                      {r.status ?? "—"}
                    </span>
                  </td>
                  <td className="td-time">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}