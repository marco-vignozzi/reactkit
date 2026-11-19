/**
 * Small status label (e.g. "Rented", "Overdue").
 */
import type { ReactNode } from "react";

/** Props of Badge. */
export interface BadgeProps {
  /** Color: neutral (default), success, caution (milder than warning), warning, danger. */
  kind?: "neutral" | "success" | "caution" | "warning" | "danger";
  children: ReactNode;
}

/** Renders the badge. */
export function Badge({ kind = "neutral", children }: BadgeProps) {
  return <span className={`rk-badge rk-badge--${kind}`}>{children}</span>;
}
