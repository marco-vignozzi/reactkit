/**
 * Client-side cooldowns: buttons that stay disabled for a while after an
 * action (e.g. sending an email), one timer per key. They only repeat a
 * server-side limit for the user's comfort: the server's check is the one
 * that counts.
 */
import { useEffect, useState } from "react";

/** What useCooldowns returns. */
export interface Cooldowns<K extends string | number> {
  /** Whether the key is still cooling down. */
  cooling: (key: K) => boolean;
  /** Starts (or restarts) the cooldown of the key from now. */
  start: (key: K) => void;
}

/**
 * Cooldowns of `durationMs` per key; the component re-renders by itself
 * when one ends, so the disabled buttons come back without user action.
 *
 * @param durationMs how long a key stays cooling after start().
 * @returns { cooling, start }.
 */
export function useCooldowns<K extends string | number>(durationMs: number): Cooldowns<K> {
  // key -> time (ms since epoch) until which it is cooling.
  const [until, setUntil] = useState<Map<K, number>>(() => new Map());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const pending = [...until.values()].filter((end) => end > now);
    if (pending.length === 0) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(...pending) - now);
    return () => window.clearTimeout(timer);
  }, [until, now]);

  return {
    cooling: (key) => (until.get(key) ?? 0) > now,
    start: (key) => {
      const begin = Date.now();
      setNow(begin);
      setUntil((current) => new Map(current).set(key, begin + durationMs));
    },
  };
}
