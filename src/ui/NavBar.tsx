/**
 * Main navigation bar (React Router NavLink).
 *
 * Top bar on wide screens, fixed bottom bar with large touch targets on
 * screens narrower than 700px (styles in reactkit.css). Items marked
 * `secondary` stay in the bar on wide screens; on narrow ones they move
 * into a "more" pop-up list (`more` prop), so the bottom bar keeps a few
 * large targets (0.12.0).
 */

import { useRef, type ReactNode } from "react";
import { NavLink, matchPath, useLocation } from "react-router";

/** One link of the bar. */
export interface NavItem {
  /** Target path. */
  to: string;
  /** Visible text. */
  label: string;
  /** Optional icon shown before the label (always shown on mobile). */
  icon?: ReactNode;
  /** On narrow screens, inside the "more" list instead of the bar (requires `more`). */
  secondary?: boolean;
}

/** The "more" button of narrow screens. */
export interface NavMore {
  /** Visible text (e.g. "Altro"). */
  label: string;
  /** Optional icon. */
  icon?: ReactNode;
}

/** Props of NavBar. */
export interface NavBarProps {
  /** Accessible name of the navigation landmark. */
  label: string;
  /** Links, in order. */
  items: NavItem[];
  /** The "more" button; required when an item is `secondary`. */
  more?: NavMore;
  /** Extra content at the end (e.g. a logout button). */
  end?: ReactNode;
}

/** Whether the current path is the item's path or below it (what NavLink marks active). */
function isActive(pathname: string, to: string): boolean {
  return matchPath({ path: to, end: false }, pathname) !== null;
}

/** Renders the navigation; the active link gets aria-current="page". */
export function NavBar({ label, items, more, end }: NavBarProps) {
  const { pathname } = useLocation();
  const details = useRef<HTMLDetailsElement>(null);
  const secondary = items.filter((item) => item.secondary === true);
  if (secondary.length > 0 && more === undefined) throw new Error("NavBar: secondary items need the `more` prop.");

  /** Closes the pop-up list after a choice. */
  function close() {
    if (details.current !== null) details.current.open = false;
  }

  return (
    <nav aria-label={label} className="rk-navbar">
      <ul>
        {items.map((item) => (
          <li key={item.to} className={item.secondary === true ? "rk-navbar-secondary" : undefined}>
            <NavLink to={item.to}>
              {item.icon !== undefined && <span className="rk-navbar-icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
        {more !== undefined && secondary.length > 0 && (
          <li className="rk-navbar-more">
            <details ref={details} data-active={secondary.some((item) => isActive(pathname, item.to))}>
              <summary>
                {more.icon !== undefined && <span className="rk-navbar-icon" aria-hidden="true">{more.icon}</span>}
                <span>{more.label}</span>
              </summary>
              <ul className="rk-navbar-more-list">
                {secondary.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} onClick={close}>
                      {item.icon !== undefined && <span className="rk-navbar-icon" aria-hidden="true">{item.icon}</span>}
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        )}
        {end !== undefined && <li className="rk-navbar-end">{end}</li>}
      </ul>
    </nav>
  );
}
