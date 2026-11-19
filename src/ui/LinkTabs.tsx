/**
 * A row of tabs that are links (React Router NavLink): each tab is a page
 * of a section, so the chosen tab lives in the URL and can be linked
 * (0.12.0). The active tab gets aria-current="page".
 */

import { NavLink } from "react-router";

/** One tab. */
export interface LinkTab {
  /** Target path (the query string of the current page is not kept). */
  to: string;
  /** Visible text. */
  label: string;
}

/** Props of LinkTabs. */
export interface LinkTabsProps {
  /** Accessible name of the tab row (a navigation landmark). */
  label: string;
  /** The tabs, in order. */
  tabs: LinkTab[];
}

/** Renders the tabs; on narrow screens the row scrolls instead of overflowing the page. */
export function LinkTabs({ label, tabs }: LinkTabsProps) {
  return (
    <nav aria-label={label} className="rk-link-tabs">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
