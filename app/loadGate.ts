/**
 * Page load gate: the loads of a page register here, so the page can stay
 * hidden until every one of them has settled for the first time.
 */
import { createContext, useContext, useEffect, useId } from "react";

/** What a LoadGate gives to the loads inside it. */
export interface LoadGateContextValue {
  /** Marks the load `id` as pending (true) or settled (false). */
  report: (id: string, pending: boolean) => void;
  /** Forgets the load `id` (its component unmounted). */
  forget: (id: string) => void;
  /** False until every load of the page has answered: data areas show a skeleton meanwhile. */
  open: boolean;
}

/** Context of the nearest LoadGate (null: no gate, loads show as they come). */
export const LoadGateContext = createContext<LoadGateContextValue | null>(null);

/**
 * Tells the nearest LoadGate whether this load is still pending. Called by
 * useApi; use it for any other loading state that must hold the page.
 * Without a LoadGate it does nothing.
 *
 * @param pending true while a call is in progress (the gate ignores it
 *   once open).
 */
export function useLoadGate(pending: boolean): void {
  const gate = useContext(LoadGateContext);
  const id = useId();
  const report = gate?.open === false ? gate.report : undefined;
  const forget = gate?.open === false ? gate.forget : undefined;
  useEffect(() => {
    report?.(id, pending);
  }, [report, id, pending]);
  useEffect(() => () => forget?.(id), [forget, id]);
}

/**
 * True while the nearest LoadGate is still waiting for the page's data
 * (false without a gate). BusyArea uses it to show its skeleton.
 */
export function useGateClosed(): boolean {
  return useContext(LoadGateContext)?.open === false;
}
