import { useEffect, useRef, useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import { useTestSessionStore } from '../store/testSessionStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useTestAutosave(sessionId: string): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');

  const answers = useTestSessionStore((s) => s.answers);
  const markedForReview = useTestSessionStore((s) => s.markedForReview);
  const tabSwitchCount = useTestSessionStore((s) => s.tabSwitchCount);
  const isDirty = useTestSessionStore((s) => s.isDirty);
  const markClean = useTestSessionStore((s) => s.markClean);

  // Use refs to always capture the latest state in async callbacks
  const latestAnswers = useRef(answers);
  const latestMarked = useRef(markedForReview);
  const latestTabCount = useRef(tabSwitchCount);
  const latestIsDirty = useRef(isDirty);

  useEffect(() => { latestAnswers.current = answers; }, [answers]);
  useEffect(() => { latestMarked.current = markedForReview; }, [markedForReview]);
  useEffect(() => { latestTabCount.current = tabSwitchCount; }, [tabSwitchCount]);
  useEffect(() => { latestIsDirty.current = isDirty; }, [isDirty]);

  const save = async () => {
    setStatus('saving');
    try {
      await updateDoc(doc(db, 'test_sessions', sessionId), {
        answers: latestAnswers.current,
        markedForReview: latestMarked.current,
        tabSwitchCount: latestTabCount.current,
        lastSavedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      markClean();
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  // Debounced save — 3s after any answer/mark change
  const debounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => void save(), 3000);
    return () => clearTimeout(debounceRef.current);
    // save excluded — stable via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, markedForReview, isDirty]);

  // Heartbeat — flush every 30s if dirty
  useEffect(() => {
    const id = window.setInterval(() => {
      if (latestIsDirty.current) void save();
    }, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return status;
}
