import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../../lib/socket/client';
import { useTestSessionStore } from '../store/testSessionStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useTestAutosave(sessionId: string): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');

  const answers = useTestSessionStore((s) => s.answers);
  const isDirty = useTestSessionStore((s) => s.isDirty);
  const markClean = useTestSessionStore((s) => s.markClean);

  // Refs capture latest values in async callbacks without re-creating the save fn
  const latestAnswers = useRef(answers);
  const latestIsDirty = useRef(isDirty);
  useEffect(() => { latestAnswers.current = answers; }, [answers]);
  useEffect(() => { latestIsDirty.current = isDirty; }, [isDirty]);

  const save = useCallback(() => {
    if (!latestIsDirty.current) return;

    setStatus('saving');
    const socket = getSocket();

    try {
      // Emit one save_answer event per answered question.
      // The server merges answers atomically and confirms with answer_saved.
      for (const [questionId, answer] of Object.entries(latestAnswers.current)) {
        socket.emit('save_answer', { sessionId, questionId, answer });
      }
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
    debounceRef.current = window.setTimeout(save, 3000);
    return () => clearTimeout(debounceRef.current);
  }, [answers, isDirty, save]);

  // Heartbeat: flush every 30 s if dirty
  useEffect(() => {
    const id = window.setInterval(() => {
      if (latestIsDirty.current) save();
    }, 30_000);
    return () => clearInterval(id);
  }, [sessionId, save]);

  return status;
}
