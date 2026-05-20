import { useEffect, useState } from 'react';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import { useTestSessionStore } from '../store/testSessionStore';
import type { TestSession } from '../types';

interface UseTestSessionResult {
  session: TestSession | null;
  isLoading: boolean;
  error: string | null;
}

function toTestSession(id: string, data: Record<string, unknown>): TestSession {
  return {
    id,
    ownerUid: data['ownerUid'] as string,
    configId: data['configId'] as string,
    domainId: data['domainId'] as string,
    status: data['status'] as TestSession['status'],
    startedAt: data['startedAt'] as TestSession['startedAt'],
    expiresAt: data['expiresAt'] as TestSession['expiresAt'],
    duration: data['duration'] as number,
    questionSnapshot: data['questionSnapshot'] as TestSession['questionSnapshot'],
    answers: (data['answers'] as Record<string, string>) ?? {},
    markedForReview: (data['markedForReview'] as Record<string, boolean>) ?? {},
    tabSwitchCount: (data['tabSwitchCount'] as number) ?? 0,
    questionCount: data['questionCount'] as number,
    lastSavedAt: data['lastSavedAt'] as TestSession['lastSavedAt'],
    resultId: data['resultId'] as string | undefined,
    submittedAt: data['submittedAt'] as TestSession['submittedAt'],
  };
}

export function useTestSession(sessionId: string): UseTestSessionResult {
  const [session, setSession] = useState<TestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const hydrate = useTestSessionStore((s) => s.hydrate);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setHydrated(false);

    const unsub: Unsubscribe = onSnapshot(
      doc(db, 'test_sessions', sessionId),
      (snap) => {
        if (!snap.exists()) {
          setError('Session not found.');
          setIsLoading(false);
          return;
        }

        const data = snap.data() as Record<string, unknown>;
        const ts = toTestSession(snap.id, data);
        setSession(ts);
        setIsLoading(false);

        // Hydrate store once on initial load
        if (!hydrated) {
          hydrate({
            sessionId: snap.id,
            answers: ts.answers,
            markedForReview: ts.markedForReview,
            tabSwitchCount: ts.tabSwitchCount,
          });
          setHydrated(true);
        }
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
    );

    return () => unsub();
    // hydrated excluded — only hydrate once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, hydrate]);

  return { session, isLoading, error };
}
