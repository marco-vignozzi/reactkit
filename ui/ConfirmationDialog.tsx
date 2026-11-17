/**
 * Dialog of a server-side confirmation (useConfirmedAction in
 * reactkit/app): the server's message, what would be lost, how many
 * confirmations are still needed, and the confirm button ("Confirm" the
 * first time, "Confirm again" after).
 */
import type { ConfirmationFlow } from "../app/confirmation";
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
  /** Destructive action: red confirm button. Default true. */
  danger?: boolean;
}

/** Renders the dialog while the flow waits for the user. */
export function ConfirmationDialog({ flow, title, impactLabel, danger = true }: ConfirmationDialogProps) {
  const labels = useUiLabels();
  const pending = flow.pending;
  const rows = pending === null ? [] : Object.entries(pending.impact).filter(([, count]) => count > 0);
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
          {rows.length > 0 && (
            <dl className="rk-impact">
              {rows.map(([key, count]) => (
                <div key={key}>
                  <dt>{impactLabel(key)}</dt>
                  <dd>{count}</dd>
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
