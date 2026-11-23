/**
 * IconHint — an icon standing for a label, with its meaning on hover and
 * for screen readers (reactkit 0.18.0). The meaning is always a text the
 * project passes in (no sentence lives in the kit).
 *
 * The icon is focusable, so keyboard users get the meaning too; the native
 * tooltip (`title`) shows it on hover. On phones, where hover does not
 * exist, the legend (`Legend`) explains every icon of the page.
 */
import type { ReactNode } from "react";

/** Props of IconHint. */
export interface IconHintProps {
  /** The icon, e.g. a lucide-react component with aria-hidden. */
  icon: ReactNode;
  /** The meaning of the icon (shown on hover, read aloud). */
  label: string;
  /** Extra CSS class for the wrapper. */
  className?: string;
}

/** Renders the icon with its meaning on hover and for assistive technology. */
export function IconHint({ icon, label, className }: IconHintProps) {
  return (
    <span className={`rk-icon-hint${className ? ` ${className}` : ""}`} role="img" aria-label={label} title={label} tabIndex={0}>
      {icon}
    </span>
  );
}

/** One entry of a Legend. */
export interface LegendItem {
  /** The icon, as used on the page. */
  icon: ReactNode;
  /** What it means. */
  label: string;
}

/** Props of Legend. */
export interface LegendProps {
  /** Heading of the legend (a project text). */
  title: string;
  /** The icons used on the page and their meaning. */
  items: LegendItem[];
}

/** The legend of the icons of a page: one line per icon, with its meaning written out. */
export function Legend({ title, items }: LegendProps) {
  return (
    <aside className="rk-legend" aria-label={title}>
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <span aria-hidden="true">{item.icon}</span> {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
