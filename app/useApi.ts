/**
 * Generic data-loading hook (in place of a data-fetching library).
 */
import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

import { useLoadGate } from "./loadGate";

/** State returned by useApi. */
export interface ApiState<T> {
  /** Last loaded data; kept while reloading, null before the first load. */
  data: T | null;
  /** What the last call threw, or null. */
  error: unknown;
  /** True while a call is in progress (first load or reload). */
  loading: boolean;
  /** Runs the call again (e.g. after a create / update / delete). */
  reload: () => void;
}

/**
 * Loads data with `fn` on mount and whenever `deps` change.
 *
 * Inside a LoadGate that is still closed, a call in progress holds the
 * page (an error counts as settled); after the gate opens, reloads never do.
 *
 * Answers of outdated calls (deps changed or component unmounted
 * meanwhile) are ignored, so a slow old answer never overwrites a newer one.
 *
 * @param fn the call, e.g. `() => api.get<Order[]>("/orders")`.
 * @param deps values the call depends on (like useEffect's).
 * @returns { data, error, loading, reload }.
 *
 * @example
 *   const orders = useApi(() => api.get<Order[]>(`/orders?status=${status}`), [status]);
 *   if (orders.loading && orders.data === null) return <Spinner label="…" />;
 */
export function useApi<T>(fn: () => Promise<T>, deps: DependencyList = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);
    fnRef.current().then(
      (value) => {
        if (!current) return;
        setData(value);
        setLoading(false);
      },
      (failure: unknown) => {
        if (!current) return;
        setError(failure);
        setLoading(false);
      },
    );
    return () => {
      current = false;
    };
  }, [...deps, attempt]); // deps are the caller's: spread on purpose

  // While the page's LoadGate is closed every call in progress holds it
  // (also one that starts after a first placeholder answer); once open,
  // reloads show a BusyArea veil instead.
  useLoadGate(loading);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, error, loading, reload };
}
