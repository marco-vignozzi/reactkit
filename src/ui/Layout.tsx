/**
 * Frame of the private pages: header, navigation and the current page.
 */

import type { ReactNode } from "react";
import { Outlet } from "react-router";

/** Props of Layout. */
export interface LayoutProps {
  /** Left part of the header (e.g. the application name). */
  brand: ReactNode;
  /** Right part of the header (e.g. the user's name). */
  aside?: ReactNode;
  /** The navigation (usually a NavBar). */
  nav: ReactNode;
  /** Page content; omitted -> the nested routes (<Outlet />). */
  children?: ReactNode;
}

/** Renders header + nav + main; on mobile the nav becomes a bottom bar. */
export function Layout({ brand, aside, nav, children }: LayoutProps) {
  return (
    <div className="rk-layout">
      <header className="rk-layout-header">
        <div className="rk-layout-brand">{brand}</div>
        {aside !== undefined && <div className="rk-layout-aside">{aside}</div>}
      </header>
      {nav}
      <main className="rk-layout-main">{children ?? <Outlet />}</main>
    </div>
  );
}
