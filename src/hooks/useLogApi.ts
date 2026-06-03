import { useState } from "react";
import { API_BASE_URL, API_LOGS } from "../config";

type LogStatus = "PENDING" | "FAILED" | "COMPLETED";

interface LogApiResponse {
  correlationId: string;
}

interface UseLogApiReturn {
  loading: boolean;
  correlationId: string | null;
  status: LogStatus | null;
  setStatus: React.Dispatch<React.SetStateAction<LogStatus | null>>;
  sendLog: (log: string) => Promise<void>;
}

export function useLogApi(getToken: () => string | null): UseLogApiReturn {
  const [loading, setLoading]             = useState<boolean>(false);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const [status, setStatus]               = useState<LogStatus | null>(null);

  const sendLog = async (log: string): Promise<void> => {
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

      const data: LogApiResponse = await res.json();
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