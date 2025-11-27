import { useEffect, useRef } from 'react';
import { wsClient } from '../websocket/client';

export function useWebSocket(token: string | null) {
  const isConnected = useRef(false);

  useEffect(() => {
    if (token && !isConnected.current) {
      wsClient.connect(token);
      isConnected.current = true;

      return () => {
        wsClient.disconnect();
        isConnected.current = false;
      };
    }
  }, [token]);

  return wsClient;
}

