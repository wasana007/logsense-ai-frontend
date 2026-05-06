import { useState, useEffect, useRef } from "react";
import { API_BASE_URL, POLL_INTERVAL_MS, POLL_MAX_ATTEMPTS } from "../config";

export function useLogApi(getToken) {
  const [result, setResult]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [status, setStatus]               = useState(null);
  const [correlationId, setCorrelationId] = useState(null);
  const pollRef                           = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const stopPolling = () => clearInterval(pollRef.current);

  const startPolling = (corrId) => {
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/logs/${corrId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },   
        });

        const data = await res.json();
        setStatus(data.status);

        if (data.status === "COMPLETED") {
          setResult(data.result);
          setLoading(false);
          stopPolling();
        }

        if (data.status === "FAILED") {
          setResult("ERROR: " + data.result);
          setLoading(false);
          stopPolling();
        }
      } catch (e) {}

      if (attempts >= POLL_MAX_ATTEMPTS) {
        setResult("ERROR: timeout");
        setLoading(false);
        setStatus("FAILED");
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  };

  const sendLog = async (log) => {
    if (!log.trim()) return;

    setLoading(true);
    setResult("");
    setStatus(null);
    setCorrelationId(null);
    stopPolling();

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/logs`, {
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
      startPolling(data.correlationId);

    } catch (err) {
      setResult("ERROR: " + err.message);
      setLoading(false);
      setStatus("FAILED");
    }
  };

  return { result, loading, status, correlationId, sendLog };
}