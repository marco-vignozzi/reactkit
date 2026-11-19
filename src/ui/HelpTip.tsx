/**
 * "?" button that opens a short explanation (a toggletip).
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { useUiLabels } from "./labels.tsx";

/** Props of HelpTip. */
export interface HelpTipProps {
  /** What the help is about (e.g. the page or field name): the button's accessible name is labels.help(topic). */
  topic: string;
  /** The explanation: a sentence, or a few short paragraphs / a list. */
  children: ReactNode;
}

/**
 * A small "?" icon button; a click (or tap) opens the explanation next to
 * it, a second click, Escape, or a click elsewhere closes it. Works the
 * same with mouse, touch and keyboard (no hover-only content); on narrow
 * screens the explanation opens as a panel across the bottom of the screen.
 * Use it instead of descriptive paragraphs, so pages stay short; keep
 * visible what the user must read before acting (consequences, warnings).
 *
 * @example
 *   <h1 className="rk-title-help">Orders <HelpTip topic="Orders">Every order of the year…</HelpTip></h1>
 */
export function HelpTip({ topic, children }: HelpTipProps) {
  const labels = useUiLabels();
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Escape or a click outside closes it.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <span className="rk-help" ref={root}>
      <button
        ref={button}
        type="button"
        className="rk-help-button"
        aria-label={labels.help(topic)}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1.2" fill="currentColor" />
        </svg>
      </button>
      <span id={id} className="rk-help-panel" role="note" hidden={!open}>
        <span className="rk-help-body">{children}</span>
        <button type="button" className="rk-help-close" onClick={() => { setOpen(false); button.current?.focus(); }}>
          {labels.close}
        </button>
      </span>
    </span>
  );
}
