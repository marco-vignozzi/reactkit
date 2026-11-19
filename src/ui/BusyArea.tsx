/**
 * Area that keeps its place while its content loads.
 */
import type { ReactNode } from "react";

import { useGateClosed } from "../app/loadGate.ts";
import { useUiLabels } from "./labels.tsx";
import { Spinner } from "./Spinner.tsx";

/** Props of BusyArea. */
export interface BusyAreaProps {
  /** True while the content is (re)loading: a veil with a spinner covers it. */
  busy: boolean;
  /**
   * The content; omitted (or null) before the first load, when the area is
   * a skeleton of `minHeight`, never an empty gap.
   */
  children?: ReactNode;
  /** Height of the skeleton (CSS length, default "8rem"). */
  minHeight?: string;
}

/** Placeholder of loading content: a few softly pulsing bars. */
function Skeleton({ minHeight, busy }: { minHeight: string; busy: boolean }) {
  const labels = useUiLabels();
  return (
    <div className="rk-skeleton" style={{ minHeight }} role="status" aria-label={labels.loading} aria-busy={busy}>
      <span className="rk-skeleton-bar" />
      <span className="rk-skeleton-bar" />
      <span className="rk-skeleton-bar rk-skeleton-bar--short" />
    </div>
  );
}

/**
 * Keeps a loading part of the page from jumping. Before the first load it
 * is a skeleton (pulsing bars) of `minHeight`; inside a LoadGate that is
 * still waiting, the content stays mounted but hidden behind the skeleton,
 * so the whole page's data appears at once. While reloading, the previous
 * content stays in place under a semi-opaque veil with a spinner (shown
 * after a short delay, so fast answers do not flash). `aria-busy` tells
 * screen readers.
 *
 * @example
 *   {orders.data === null
 *     ? orders.loading && <BusyArea busy />
 *     : <BusyArea busy={orders.loading}><OrderList orders={orders.data} /></BusyArea>}
 */
export function BusyArea({ busy, children, minHeight = "8rem" }: BusyAreaProps) {
  const labels = useUiLabels();
  const gateClosed = useGateClosed();
  const empty = children === undefined || children === null || children === false;
  if (empty) return <Skeleton minHeight={minHeight} busy={busy} />;
  if (gateClosed) {
    return (
      <>
        <Skeleton minHeight={minHeight} busy />
        <div hidden>{children}</div>
      </>
    );
  }
  return (
    <div className={busy ? "rk-busy rk-busy--on" : "rk-busy"} aria-busy={busy}>
      {children}
      {busy && (
        <div className="rk-busy-veil">
          <Spinner label={labels.loading} />
        </div>
      )}
    </div>
  );
}
