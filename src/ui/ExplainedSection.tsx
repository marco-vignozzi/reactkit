/**
 * A section of a report that explains itself: title with a HelpTip (what
 * it shows and how it is computed, on request), the period or date it
 * refers to (always visible) and an empty state. Meant for pages of
 * figures that a reader must understand without help.
 */
import { useId, type ReactNode } from "react";

import { HelpTip } from "./HelpTip";

/** Props of ExplainedSection. */
export interface ExplainedSectionProps {
  /** Heading of the section (an h2); also the HelpTip's topic. */
  title: string;
  /** One sentence: what the section shows (first line of the HelpTip). */
  description: ReactNode;
  /** The period or reference date, written out (e.g. "From 1/1/2026 to 31/12/2026"). */
  reference: ReactNode;
  /** Heading of the explanation inside the HelpTip (e.g. "How it is computed"). */
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
        <h2 id={headingId} className="rk-title-help">
          {title}
          <HelpTip topic={title}>
            <p>{description}</p>
            <strong>{explanationLabel}</strong>
            {explanation}
          </HelpTip>
        </h2>
        <p className="rk-explained-reference">{reference}</p>
      </header>
      {controls}
      {empty ? <p className="rk-explained-empty">{emptyText}</p> : children}
    </section>
  );
}
