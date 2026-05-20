import { useEffect, useRef, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';

export function useCountdown(
  expiresAt: Timestamp | null | undefined,
  onExpire: () => void,
): number {
  const [remaining, setRemaining] = useState(0);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!expiresAt) return;

    const compute = () =>
      Math.max(0, Math.floor((expiresAt.toDate().getTime() - Date.now()) / 1000));

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
