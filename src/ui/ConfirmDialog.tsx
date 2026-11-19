/**
 * Confirmation dialog on the native <dialog> element: modal, Esc closes
 * it, focus stays inside and goes back where it was when it closes.
 */
import { useEffect, useRef, type ReactNode } from "react";

import { useUiLabels } from "./labels.tsx";

/** Props of ConfirmDialog. */
export interface ConfirmDialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Title (also the accessible name). */
  title: string;
  /** Body: what will happen, e.g. the rows a deletion removes too. */
  children: ReactNode;
  /** Text of the confirm button. */
  confirmLabel: string;
  /** Destructive action: the confirm button is red. */
  danger?: boolean;
  /** An operation is running: buttons disabled. */
  busy?: boolean;
  /** Confirm clicked. */
  onConfirm: () => void;
  /** Cancel clicked, Esc pressed or backdrop clicked. */
  onCancel: () => void;
}

/** Renders the dialog; the cancel button text comes from UiLabels. */
export function ConfirmDialog({ open, title, children, confirmLabel, danger, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  const labels = useUiLabels();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="rk-dialog"
      aria-labelledby="rk-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onCancel();
      }}
    >
      <div className="rk-dialog-body">
        <h2 id="rk-dialog-title">{title}</h2>
        <div>{children}</div>
        <div className="rk-dialog-buttons">
          <button type="button" className="rk-button" onClick={onCancel} disabled={busy}>{labels.cancel}</button>
          <button type="button" className={`rk-button ${danger ? "rk-button--danger-solid" : "rk-button--primary"}`} onClick={onConfirm} disabled={busy} autoFocus={!danger}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
