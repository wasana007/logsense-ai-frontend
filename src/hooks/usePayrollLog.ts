import { useState, useEffect, useRef, useCallback } from "react";
import { Client, IFrame, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  API_BASE_URL,
  SOURCE_PAYROLL,
  SOURCE_AI,
  WS_ENDPOINT,
  WS_TOPIC_PAYROLL,
  WS_TOPIC_LOGS,
  WS_RECONNECT_DELAY,
} from "../config";

type LogStatus = "PENDING" | "FAILED" | "COMPLETED";

interface PayrollEvent {
  correlationId: string;
  status?: LogStatus;
  result?: string;
  source?: string;
  receivedAt?: string;
  [key: string]: unknown;
}

interface UsePayrollLogReturn {
  payrollEvents: PayrollEvent[];
  clearEvents: () => void;
  stompRef: React.MutableRefObject<Client | null>;
}

type OnLogResult = (
  correlationId: string,
  status: LogStatus | undefined,
  result: string | undefined
) => void;

function upsertEvent(prev: PayrollEvent[], incoming: PayrollEvent): PayrollEvent[] {
  const idx = prev.findIndex((e) => e.correlationId === incoming.correlationId);
  if (idx !== -1) {
    const updated = [...prev];
    updated[idx] = { ...updated[idx], ...incoming };
    return updated;
  }
  return [incoming, ...prev];
}

export function usePayrollLog(
  user: unknown,
  onLogResult: OnLogResult
): UsePayrollLogReturn {
  const [payrollEvents, setPayrollEvents] = useState<PayrollEvent[]>([]);
  const stompRef                          = useRef<Client | null>(null);

  const onLogResultRef = useRef<OnLogResult>(onLogResult);
  useEffect(() => {
    onLogResultRef.current = onLogResult;
  }, [onLogResult]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("jwt");
    if (!token) return;

    if (stompRef.current) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}${WS_ENDPOINT}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: WS_RECONNECT_DELAY,

      onConnect: () => {
        client.subscribe(WS_TOPIC_PAYROLL, (msg: IMessage) => {
          try {
            const event = JSON.parse(msg.body) as PayrollEvent;
            setPayrollEvents((prev) => upsertEvent(prev, {
              ...event,
              source: SOURCE_PAYROLL,
              receivedAt: new Date().toISOString(),
            }));
          } catch {}
        });

        client.subscribe(WS_TOPIC_LOGS, (msg: IMessage) => {
          try {
            const event = JSON.parse(msg.body) as PayrollEvent;
            setPayrollEvents((prev) => upsertEvent(prev, {
              ...event,
              source: SOURCE_AI,
              receivedAt: new Date().toISOString(),
            }));
            onLogResultRef.current?.(event.correlationId, event.status, event.result);
          } catch {}
        });
      },

      onStompError: (frame: IFrame) => {
        console.error("STOMP error", frame);
      },

      onWebSocketError: (err: Event) => {
        console.error("WebSocket error:", err);
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  }, [user]);

  const clearEvents = useCallback(() => setPayrollEvents([]), []);

  return { payrollEvents, clearEvents, stompRef };
}