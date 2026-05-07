import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

// In dev: VITE_WS_URL=http://localhost:8083/ws  → ws://localhost:8083/ws
// In prod: VITE_WS_URL=https://spit-backend.onrender.com/ws → wss://spit-backend.onrender.com/ws
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8083/ws';

/**
 * useWebSocket(topic, onMessage)
 * Connects to the Spring Boot STOMP broker via native WebSocket (no SockJS needed in modern browsers).
 */
export function useWebSocket(topic, onMessage) {
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!topic) return;

    const client = new Client({
      // Use native WebSocket — no SockJS dependency needed
      brokerURL: WS_URL.replace('http://', 'ws://').replace('https://', 'wss://'),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(topic, (frame) => {
          try {
            const data = JSON.parse(frame.body);
            onMessageRef.current(data);
          } catch { /* ignore malformed frames */ }
        });
      },
      onStompError: (frame) => {
        console.warn('STOMP error', frame.headers?.message);
      },
      onDisconnect: () => {
        console.log('STOMP disconnected from', topic);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [topic]);

  const send = useCallback((destination, body) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  return { send };
}
