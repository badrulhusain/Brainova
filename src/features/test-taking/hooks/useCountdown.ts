import { useEffect, useRef, useState } from 'react';

/**
 * Countdown in seconds until `expiresAt`.
 * Accepts an ISO date string or a Date object (replaces the former Firestore Timestamp).
 */
export function useCountdown(
  expiresAt: string | Date | null | undefined,
  onExpire: () => void,
): number {
  const [remaining, setRemaining] = useState(0);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!expiresAt) return;

    const expiresMs = new Date(expiresAt).getTime();
    const compute = () => Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));

    setRemaining(compute());

    const id = window.setInterval(() => {
      const secs = compute();
      setRemaining(secs);
      if (secs === 0) {
        clearInterval(id);
        onExpireRef.current();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}
