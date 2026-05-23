import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../../lib/api/client';
import { useTestSessionStore } from '../store/testSessionStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useTestAutosave(sessionId: string): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');

  const answers = useTestSessionStore((s) => s.answers ?? {});
  const markedForReview = useTestSessionStore((s) => s.markedForReview ?? {});
  const isDirty = useTestSessionStore((s) => s.isDirty);
  const markClean = useTestSessionStore((s) => s.markClean);

  // Refs capture latest values in async callbacks without re-creating the save fn
  const latestAnswers = useRef(answers);
  const latestMarkedForReview = useRef(markedForReview);
  const latestIsDirty = useRef(isDirty);
  useEffect(() => { latestAnswers.current = answers; }, [answers]);
  useEffect(() => { latestMarkedForReview.current = markedForReview; }, [markedForReview]);
  useEffect(() => { latestIsDirty.current = isDirty; }, [isDirty]);

  const save = useCallback(async () => {
    if (!latestIsDirty.current) return;

    setStatus('saving');

    try {
      await apiClient.put(`/sessions/${sessionId}/answers`, {
        answers: latestAnswers.current,
        markedForReview: latestMarkedForReview.current,
      });
      markClean();
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [sessionId, markClean]);

  // Debounce: 3 s after any answer change
  const debounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => void save(), 3000);
    return () => clearTimeout(debounceRef.current);
  }, [answers, markedForReview, isDirty, save]);

  // Heartbeat: flush every 30 s if dirty
  useEffect(() => {
    const id = window.setInterval(() => {
      if (latestIsDirty.current) void save();
    }, 30_000);
    return () => clearInterval(id);
  }, [sessionId, save]);

  return status;
}
