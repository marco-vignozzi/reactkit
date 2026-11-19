/**
 * Shows several loads of one page as a single, consistent update.
 */
import { useRef } from "react";

import type { ApiState } from "./useApi.ts";

/** Data of each ApiState of a tuple, in the same order. */
export type SettledData<S extends readonly ApiState<unknown>[]> = { [K in keyof S]: S[K] extends ApiState<infer T> ? T : never };

/** State returned by useSettled. */
export interface SettledState<S extends readonly ApiState<unknown>[]> {
  /** Data of every load, all from the last moment none was loading; null before the first such moment. */
  data: SettledData<S> | null;
  /** True while any load is in progress (the data shown is the previous snapshot). */
  busy: boolean;
}

/**
 * Combines loads that belong together (e.g. a list and the details of its
 * rows): the page gets new data only when every load has settled, so it
 * changes once instead of once per answer, and never mixes old and new
 * answers. Until then it keeps the previous snapshot and `busy` is true.
 * A load that failed counts as settled with its last data (its error is
 * still in its own ApiState); while one has never loaded, `data` is null.
 *
 * @param states the ApiStates, e.g. `[orders, totals]` from useApi.
 * @returns { data: [ordersData, totalsData] | null, busy }.
 *
 * @example
 *   const view = useSettled([orders, totals] as const);
 *   if (view.data === null) return <Spinner label="…" />;
 *   const [rows, sums] = view.data;
 *   <DataTable rows={rows} busy={view.busy} … />
 */
export function useSettled<S extends readonly ApiState<unknown>[]>(states: S): SettledState<S> {
  const snapshot = useRef<SettledData<S> | null>(null);
  const busy = states.some((state) => state.loading);
  if (!busy && states.every((state) => state.data !== null)) {
    snapshot.current = states.map((state) => state.data) as unknown as SettledData<S>;
  }
  return { data: snapshot.current, busy };
}
