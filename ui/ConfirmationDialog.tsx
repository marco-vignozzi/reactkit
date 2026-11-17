/**
 * Dialog of a server-side confirmation (useConfirmedAction in
 * reactkit/app): the server's message, an optional note of the caller
 * (children), what would be lost (counts, dates, amounts, rows described
 * by an object: `impactValue` formats them), how many
 * confirmations are still needed, and the confirm button ("Confirm" the
 * first time, "Confirm again" after).
 */
import type { ReactNode } from "react";

import type { ConfirmationFlow, ImpactValue } from "../app/confirmation";
import { ConfirmDialog } from "./ConfirmDialog";
import { useUiLabels } from "./labels";

/** Props of ConfirmationDialog. */
export interface ConfirmationDialogProps {
  /** The flow returned by useConfirmedAction. */
  flow: ConfirmationFlow;
  /** Title, e.g. "Delete the property?". */
  title: string;
  /** Label of an impact key (e.g. "leases" -> "Leases"). */
  impactLabel: (key: string) => string;
  /**
   * How a value is shown (e.g. a date); default: a count or a string as it
   * is. Rows with 0, "" or null are not shown. An object value (a row such
   * as {id, date, amount}) has no default: without impactValue the dialog
   * throws, so a missing formatter shows up at once.
   */
  impactValue?: (key: string, value: ImpactValue) => ReactNode;
  /** Destructive action: red confirm button. Default true. */
  danger?: boolean;
  /** Optional note shown under the server's message (e.g. what is kept). */
  children?: ReactNode;
}

/** Whether an impact row is shown: not 0, "" nor null. */
function shown(value: ImpactValue): boolean {
  if (value === null) return false;
  if (typeof value === "number") return value > 0;
  return value !== "";
}

/**
 * The default formatter: a count or a string as it is.
 *
 * @throws Error for an object value: the caller must pass impactValue (fail loudly).
 */
function defaultImpactValue(key: string, value: ImpactValue): ReactNode {
  if (typeof value === "object" && value !== null) throw new Error(`ConfirmationDialog: impact "${key}" is an object; pass impactValue to show it`);
  return value;
}

/** Renders the dialog while the flow waits for the user. */
export function ConfirmationDialog({ flow, title, impactLabel, impactValue = defaultImpactValue, danger = true, children }: ConfirmationDialogProps) {
  const labels = useUiLabels();
  const pending = flow.pending;
  const rows = pending === null ? [] : Object.entries(pending.impact).filter(([, value]) => shown(value));
  const left = pending === null ? 0 : pending.required - pending.given;
  return (
    <ConfirmDialog
      open={pending !== null}
      title={title}
      confirmLabel={pending !== null && pending.given > 0 ? labels.confirmAgain : labels.confirm}
      danger={danger}
      busy={flow.busy}
      onConfirm={flow.confirm}
      onCancel={flow.cancel}
    >
      {pending !== null && (
        <div className="rk-confirmation">
          <p>{pending.detail}</p>
          {children}
          {rows.length > 0 && (
            <dl className="rk-impact">
              {rows.map(([key, value]) => (
                <div key={key}>
                  <dt>{impactLabel(key)}</dt>
                  <dd>{impactValue(key, value)}</dd>
                </div>
              ))}
            </dl>
          )}
          {pending.required > 1 && <p className="rk-confirmation-left">{labels.confirmationsLeft(left)}</p>}
        </div>
      )}
    </ConfirmDialog>
  );
}
