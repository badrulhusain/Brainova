import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../../lib/api/client';
import { connectSocket } from '../../../lib/socket/client';
import { useTestSessionStore } from '../store/testSessionStore';
import type { TestSession } from '../types';

interface UseTestSessionResult {
  session: TestSession | null;
  isLoading: boolean;
  error: string | null;
}

export function useTestSession(sessionId: string): UseTestSessionResult {
  const [session, setSession] = useState<TestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const hydrate = useTestSessionStore((s) => s.hydrate);

  useEffect(() => {
    let cancelled = false;
    hydratedRef.current = false;

    // 1. Fetch initial session state via REST
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiClient.get<TestSession>(`/sessions/${sessionId}`);
        if (cancelled) return;

        const ts = res.data;
        setSession(ts);

        // Hydrate Zustand store once from the server state
        if (!hydratedRef.current) {
          hydrate({
            sessionId,
            answers: ts.answers,
            markedForReview: ts.markedForReview,
            tabSwitchCount: ts.tabSwitchCount,
          });
          hydratedRef.current = true;
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Session not found');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchSession();

    // 2. Connect to WebSocket, join session room for real-time events
    const socket = connectSocket();
    socket.emit('join_session', { sessionId });

    // Server broadcasts tab_warned to all room members
    const onTabWarned = ({ tabSwitchCount }: { tabSwitchCount: number }) => {
      setSession((prev) => (prev ? { ...prev, tabSwitchCount } : prev));
    };

    socket.on('tab_warned', onTabWarned);

    return () => {
      cancelled = true;
      socket.off('tab_warned', onTabWarned);
    };
  }, [sessionId, hydrate]);

  return { session, isLoading, error };
}
