/**
 * Inline message box (form errors, notices).
 */

import type { ReactNode } from "react";

/** Props of Alert. */
export interface AlertProps {
  /** "error" (role="alert", read at once) or "info" (role="status"). */
  kind: "error" | "info";
  children: ReactNode;
}

/** Renders the message, or nothing when children is empty. */
export function Alert({ kind, children }: AlertProps) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rk-alert rk-alert-${kind}`}>
      {children}
    </div>
  );
}
