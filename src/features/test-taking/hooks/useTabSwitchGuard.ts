import { useEffect, useRef } from 'react';
import { doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '../../../lib/firebase/client';
import { useTestSessionStore } from '../store/testSessionStore';

export function useTabSwitchGuard(sessionId: string, active: boolean): void {
  const setTabSwitchCount = useTestSessionStore((s) => s.setTabSwitchCount);
  const tabSwitchCount = useTestSessionStore((s) => s.tabSwitchCount);
  const tabCountRef = useRef(tabSwitchCount);

  useEffect(() => {
    tabCountRef.current = tabSwitchCount;
  }, [tabSwitchCount]);

  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        const newCount = tabCountRef.current + 1;
        tabCountRef.current = newCount;
        setTabSwitchCount(newCount);

        // Update Firestore immediately — only tabSwitchCount + updatedAt are touched,
        // both allowed by safeSessionAutosave
        try {
          await updateDoc(doc(db, 'test_sessions', sessionId), {
            tabSwitchCount: increment(1),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Non-fatal; local count is still incremented
        }
      } else {
        toast.warning(`Tab switch detected (${tabCountRef.current} total)`);
      }
    };

    const listener = () => void handleVisibilityChange();
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, [sessionId, active, setTabSwitchCount]);
}
