/**
 * A section of a report that explains itself: title, a sentence saying
 * what it shows, the period or date it refers to (always visible), a
 * collapsible "how it is computed" box and an empty state. Meant for
 * pages of figures that a reader must understand without help.
 */
import { useId, type ReactNode } from "react";

/** Props of ExplainedSection. */
export interface ExplainedSectionProps {
  /** Heading of the section (an h2). */
  title: ReactNode;
  /** One sentence under the title: what the section shows. */
  description: ReactNode;
  /** The period or reference date, written out (e.g. "From 1/1/2026 to 31/12/2026"). */
  reference: ReactNode;
  /** Label of the collapsible explanation (e.g. "How it is computed"). */
  explanationLabel: ReactNode;
  /** Content of the explanation: what is included, what is left out and why. */
  explanation: ReactNode;
  /** Controls placed under the reference (period chooser, filters...). */
  controls?: ReactNode;
  /** When true, `emptyText` replaces the children. */
  empty?: boolean;
  /** Text of the empty state (e.g. "No movements in this period"). */
  emptyText?: ReactNode;
  /** The figures. */
  children?: ReactNode;
}

/** Renders the section. */
export function ExplainedSection({
  title, description, reference, explanationLabel, explanation, controls, empty = false, emptyText, children,
}: ExplainedSectionProps) {
  const headingId = useId();
  return (
    <section className="rk-explained" aria-labelledby={headingId}>
      <header className="rk-explained-header">
        <h2 id={headingId}>{title}</h2>
        <p className="rk-explained-description">{description}</p>
        <p className="rk-explained-reference">{reference}</p>
      </header>
      {controls}
      <details className="rk-explained-how">
        <summary>{explanationLabel}</summary>
        <div className="rk-explained-how-body">{explanation}</div>
      </details>
      {empty ? <p className="rk-explained-empty">{emptyText}</p> : children}
    </section>
  );
}
