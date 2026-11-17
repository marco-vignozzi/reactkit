/**
 * Texts of the reactkit components that the application does not pass one
 * by one (close buttons, filter box, row selection...).
 *
 * reactkit contains no user-facing sentence: the application gives these
 * labels once, in its own language, with <UiLabelsProvider>.
 */
import { createContext, useContext, type ReactNode } from "react";

/** Labels used inside the reactkit/ui components. */
export interface UiLabels {
  /** Cancel button (ConfirmDialog). */
  cancel: string;
  /** Close button (Toast). */
  close: string;
  /** Text filter box (DataTable): label and placeholder. */
  filter: string;
  /** No row matches the filter (DataTable). */
  noResults: string;
  /** Checkbox selecting every visible row (DataTable). */
  selectAll: string;
  /** Checkbox selecting one row (DataTable). */
  selectRow: string;
  /** Header of the actions column (DataTable). */
  actions: string;
  /** First confirm button (ConfirmationDialog). */
  confirm: string;
  /** Confirm button after the first confirmation (ConfirmationDialog). */
  confirmAgain: string;
  /** "N more confirmations needed" (ConfirmationDialog). */
  confirmationsLeft: (count: number) => string;
}

const UiLabelsContext = createContext<UiLabels | null>(null);

/** Gives the labels to every reactkit component inside it. */
export function UiLabelsProvider({ labels, children }: { labels: UiLabels; children: ReactNode }) {
  return <UiLabelsContext.Provider value={labels}>{children}</UiLabelsContext.Provider>;
}

/**
 * The labels of the nearest UiLabelsProvider.
 *
 * @throws Error when there is none (a component would otherwise show no
 *   text, or a text in the wrong language).
 */
export function useUiLabels(): UiLabels {
  const labels = useContext(UiLabelsContext);
  if (labels === null) throw new Error("reactkit/ui components need a UiLabelsProvider");
  return labels;
}
