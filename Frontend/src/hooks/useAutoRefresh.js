import { useEffect, useRef } from 'react';
import { socket } from '../lib/socket';

export function useAutoRefresh(onRefresh, { enabled = true, intervalMs = 30_000 } = {}) {
  const callbackRef = useRef(onRefresh);
  useEffect(() => { callbackRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const trigger = () => {
      if (document.visibilityState === 'visible') callbackRef.current();
    };

    socket.on('data:changed', trigger);
    const timer = setInterval(trigger, intervalMs);

    return () => {
      socket.off('data:changed', trigger);
      clearInterval(timer);
    };
  }, [enabled, intervalMs]);
}
