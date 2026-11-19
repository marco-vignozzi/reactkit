/**
 * Loading indicator.
 */

/** Props of Spinner. */
export interface SpinnerProps {
  /** Accessible text read by screen readers (given by the project). */
  label: string;
}

/**
 * Shows that something is loading.
 *
 * @returns a span with role="status" and the given accessible label.
 */
export function Spinner({ label }: SpinnerProps) {
  return <span role="status" aria-label={label} className="rk-spinner" />;
}
