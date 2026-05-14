import { useState } from "react";
import { API_BASE_URL, API_LOGS } from "../config";

export function useLogApi(getToken) {
  const [loading, setLoading]             = useState(false);
  const [correlationId, setCorrelationId] = useState(null);
  const [status, setStatus]               = useState(null);

  const sendLog = async (log) => {
    if (!log.trim()) return;

    setLoading(true);
    setCorrelationId(null);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}${API_LOGS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: log,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setCorrelationId(data.correlationId);
      setStatus("PENDING");

    } catch (err) {
      setStatus("FAILED");
    } finally {
      setLoading(false);
    }
  };

  return { loading, correlationId, status, setStatus, sendLog };
}