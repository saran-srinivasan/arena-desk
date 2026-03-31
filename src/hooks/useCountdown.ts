import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Reactive countdown hook.
 * Returns { remainingSeconds, isOverstay, formatted }.
 *
 * @param endTimeISO - ISO 8601 timestamp for when the session ends
 * @param tickMs     - Update interval in ms (default: 1000)
 */
export function useCountdown(endTimeISO: string, tickMs = 1000) {
  const computeRemaining = useCallback(
    () => Math.floor((new Date(endTimeISO).getTime() - Date.now()) / 1000),
    [endTimeISO]
  );

  const [remaining, setRemaining] = useState(computeRemaining);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(computeRemaining());
    intervalRef.current = setInterval(() => {
      setRemaining(computeRemaining());
    }, tickMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [computeRemaining, tickMs]);

  const isOverstay = remaining < 0;

  const formatTime = (seconds: number) => {
    const abs = Math.abs(seconds);
    const mins = Math.floor(abs / 60);
    const secs = abs % 60;
    return `${seconds < 0 ? '+' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    remainingSeconds: remaining,
    isOverstay,
    formatted: formatTime(remaining),
  };
}
