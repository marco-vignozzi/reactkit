/**
 * Lets the data of a page appear all at once, when every load has answered.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { LoadGateContext, type LoadGateContextValue } from "../app/loadGate.ts";

/** Props of LoadGate. */
export interface LoadGateProps {
  /** The page: drawn at once, its data areas (BusyArea) show a skeleton until the gate opens. */
  children: ReactNode;
}

/** Pending loads stay at zero this long before the data is shown (ms). */
const SETTLE_DELAY = 50;

/**
 * The page is drawn at once (titles, filters, buttons: whatever does not
 * wait for data); every BusyArea inside shows a skeleton until no load
 * registered with useLoadGate (every useApi inside) has been in progress
 * for 50 ms, so loads that start only after the first answers are waited
 * for too. Then all the data appears together. It never closes again:
 * later reloads use the BusyArea veil. Give it a `key` (e.g. the path) to
 * gate each page.
 *
 * @example
 *   <LoadGate key={location.pathname}><Outlet /></LoadGate>
 */
export function LoadGate({ children }: LoadGateProps) {
  const pending = useRef(new Set<string>());
  const mounted = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);

  /** Opens the gate when no load has been pending for SETTLE_DELAY. */
  const check = useCallback(() => {
    window.clearTimeout(timer.current);
    if (!mounted.current || pending.current.size > 0) return;
    timer.current = window.setTimeout(() => {
      if (pending.current.size === 0) setOpen(true);
    }, SETTLE_DELAY);
  }, []);

  const report = useCallback((id: string, isPending: boolean) => {
    if (isPending) pending.current.add(id);
    else pending.current.delete(id);
    check();
  }, [check]);
  const forget = useCallback((id: string) => {
    pending.current.delete(id);
    check();
  }, [check]);
  const value = useMemo<LoadGateContextValue>(() => ({ report, forget, open }), [report, forget, open]);

  // Runs after the effects of the children: their first loads are registered by now.
  useEffect(() => {
    mounted.current = true;
    check();
    return () => window.clearTimeout(timer.current);
  }, [check]);

  return <LoadGateContext.Provider value={value}>{children}</LoadGateContext.Provider>;
}
