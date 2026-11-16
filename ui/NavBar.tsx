/**
 * Main navigation bar (React Router NavLink).
 *
 * Top bar on wide screens, fixed bottom bar with large touch targets on
 * screens narrower than 700px (styles in reactkit.css).
 */

import type { ReactNode } from "react";
import { NavLink } from "react-router";

/** One link of the bar. */
export interface NavItem {
  /** Target path. */
  to: string;
  /** Visible text. */
  label: string;
  /** Optional icon shown before the label (always shown on mobile). */
  icon?: ReactNode;
}

/** Props of NavBar. */
export interface NavBarProps {
  /** Accessible name of the navigation landmark. */
  label: string;
  /** Links, in order. */
  items: NavItem[];
  /** Extra content at the end (e.g. a logout button). */
  end?: ReactNode;
}

/** Renders the navigation; the active link gets aria-current="page". */
export function NavBar({ label, items, end }: NavBarProps) {
  return (
    <nav aria-label={label} className="rk-navbar">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to}>
              {item.icon !== undefined && <span className="rk-navbar-icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
        {end !== undefined && <li className="rk-navbar-end">{end}</li>}
      </ul>
    </nav>
  );
}
