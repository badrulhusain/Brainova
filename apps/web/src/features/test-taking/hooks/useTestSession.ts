import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../../lib/api/client';
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
            answers: ts.answers ?? {},
            markedForReview: ts.markedForReview ?? {},
            tabSwitchCount: ts.tabSwitchCount ?? 0,
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

    return () => {
      cancelled = true;
    };
  }, [sessionId, hydrate]);

  return { session, isLoading, error };
}
