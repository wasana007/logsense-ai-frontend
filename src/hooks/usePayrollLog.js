import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
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

function upsertEvent(prev, incoming) {
  const idx = prev.findIndex((e) => e.correlationId === incoming.correlationId);
  if (idx !== -1) {
    const updated = [...prev];
    updated[idx] = { ...updated[idx], ...incoming };
    return updated;
  }
  return [incoming, ...prev];
}

export function usePayrollLog(user, onLogResult) {
  const [payrollEvents, setPayrollEvents] = useState([]);
  const stompRef                          = useRef(null);

  const onLogResultRef = useRef(onLogResult);
  useEffect(() => {
    onLogResultRef.current = onLogResult;
  }, [onLogResult]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("jwt");
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}${WS_ENDPOINT}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: WS_RECONNECT_DELAY,

      onConnect: () => {

        client.subscribe(WS_TOPIC_PAYROLL, (msg) => {
          try {
            const event = JSON.parse(msg.body);
            setPayrollEvents((prev) => upsertEvent(prev, {
              ...event,
              source: SOURCE_PAYROLL,
              receivedAt: new Date().toISOString(),
            }));
          } catch {}
        });

        client.subscribe(WS_TOPIC_LOGS, (msg) => {
          try {
            const event = JSON.parse(msg.body);
            setPayrollEvents((prev) => upsertEvent(prev, {
              ...event,
              source: SOURCE_AI,
              receivedAt: new Date().toISOString(),
            }));
            onLogResultRef.current?.(event.correlationId, event.status, event.result);
          } catch {}
        });
      },

      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user]);

  const clearEvents = useCallback(() => setPayrollEvents([]), []);

  return { payrollEvents, clearEvents, stompRef };
}