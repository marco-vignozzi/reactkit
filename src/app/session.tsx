/**
 * Session state: who is logged in.
 *
 * The real session lives on the server (HttpOnly cookie); this context only
 * remembers the current user object returned by the backend, so nothing
 * sensitive is stored in the browser.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** Value given by useSession. */
export interface Session<U> {
  /** The logged-in user, or null. */
  user: U | null;
  /** True while the first check (`load`) is in progress. */
  loading: boolean;
  /** Sets the user after login / registration, or null after logout. */
  setUser(user: U | null): void;
  /** Loads the user again from the server. */
  refresh(): Promise<void>;
}

const SessionContext = createContext<Session<unknown> | null>(null);

/** Props of SessionProvider. */
export interface SessionProviderProps<U> {
  /**
   * Reads the current user from the server: resolves to the user, or null
   * when there is no session. Any other failure is rethrown (fail loudly).
   */
  load: () => Promise<U | null>;
  /**
   * Subscribes to "the session is gone" (e.g. ApiClient.onUnauthorized);
   * returns the unsubscribe function. The user is then cleared.
   */
  subscribeUnauthorized?: (listener: () => void) => () => void;
  children: ReactNode;
}

/**
 * Provides the session to the children: checks it once on mount and clears
 * it whenever the server answers 401.
 */
export function SessionProvider<U>({ load, subscribeUnauthorized, children }: SessionProviderProps<U>) {
  const [user, setUser] = useState<U | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setUser(await load());
  }, [load]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => subscribeUnauthorized?.(() => setUser(null)), [subscribeUnauthorized]);

  const value = useMemo(() => ({ user, loading, setUser, refresh }), [user, loading, refresh]);
  return <SessionContext.Provider value={value as Session<unknown>}>{children}</SessionContext.Provider>;
}

/**
 * The session of the nearest SessionProvider.
 *
 * @throws Error when used outside a SessionProvider.
 */
export function useSession<U>(): Session<U> {
  const session = useContext(SessionContext);
  if (session === null) throw new Error("useSession must be used inside a SessionProvider");
  return session as Session<U>;
}
