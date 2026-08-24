import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  incomingInternshipCreated,
  incomingInternshipExpired,
} from '../features/internships/internshipSlice.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export function useSSEStream(enabled = true) {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const streamUrl = `${API_BASE}/internships/stream`;
    let es;

    try {
      es = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.addEventListener('internship.created', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setLastEvent({ type: 'created', payload, time: Date.now() });
          dispatch(incomingInternshipCreated(payload));
        } catch {
          // ignore parse error
        }
      });

      es.addEventListener('internship.expired', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setLastEvent({ type: 'expired', payload, time: Date.now() });
          dispatch(incomingInternshipExpired(payload));
        } catch {
          // ignore parse error
        }
      });

      es.addEventListener('internship.sync_completed', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setLastEvent({ type: 'sync_completed', payload, time: Date.now() });
        } catch {
          // ignore
        }
      });

      es.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (es) {
        es.close();
      }
      setIsConnected(false);
    };
  }, [enabled, dispatch]);

  return { isConnected, lastEvent };
}

export default useSSEStream;
