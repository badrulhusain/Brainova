import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getSocket } from '../../../lib/socket/client';
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const newCount = tabCountRef.current + 1;
        tabCountRef.current = newCount;
        setTabSwitchCount(newCount);

        // Emit tab_switch to the server; server increments DB count and
        // broadcasts tab_warned to all sockets in the session room.
        getSocket().emit('tab_switch', { sessionId });
      } else {
        toast.warning(`Tab switch detected (${tabCountRef.current} total)`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId, active, setTabSwitchCount]);
}
