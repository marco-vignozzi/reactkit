/**
 * Route guard for private pages (React Router).
 */

import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import { useSession } from "./session.tsx";

/** Navigation state given to the login page: where to go back after login. */
export interface FromState {
  from?: string;
}

/** Props of RequireAuth. */
export interface RequireAuthProps {
  /** Path of the login page, e.g. "/login". */
  loginPath: string;
  /** Shown while the session is being checked. */
  loading: ReactNode;
  /** Private content; omitted -> the nested routes (<Outlet />). */
  children?: ReactNode;
}

/**
 * Renders the private content only with a logged-in user; otherwise
 * redirects to `loginPath`, with the requested path in `state.from`.
 */
export function RequireAuth({ loginPath, loading, children }: RequireAuthProps) {
  const { user, loading: checking } = useSession<unknown>();
  const location = useLocation();
  if (checking) return <>{loading}</>;
  if (user === null) {
    const state: FromState = { from: location.pathname + location.search };
    return <Navigate to={loginPath} replace state={state} />;
  }
  return <>{children ?? <Outlet />}</>;
}

/**
 * The page to return to after login.
 *
 * @param state the location state received by the login page.
 * @param fallback path used when there is none.
 * @returns state.from, or fallback.
 */
export function returnPath(state: unknown, fallback: string): string {
  const from = (state as FromState | null)?.from;
  return typeof from === "string" && from.startsWith("/") ? from : fallback;
}
