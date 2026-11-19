/**
 * Query parameters of the URL as page state (filters, chosen period...),
 * with updates that never undo each other.
 *
 * React Router's setSearchParams, also in its functional form, starts from
 * the parameters of the last render: two changes made before the page
 * renders again (two fields filled quickly) keep only the second one.
 * Here every update starts from the URL as it is now
 * (window.location.search), which the router updates synchronously.
 */
import { useCallback } from "react";
import { useSearchParams } from "react-router";

/** Changes to apply: a value sets the parameter, "" or null removes it. */
export type QueryChanges = Record<string, string | null>;

/**
 * The query parameters and a function that changes some of them.
 *
 * @returns [params of this render, update(changes, { push }?)]; update
 *   replaces the history entry unless push is true.
 */
export function useQueryParams(): [URLSearchParams, (changes: QueryChanges, options?: { push?: boolean }) => void] {
  const [params, setParams] = useSearchParams();
  const update = useCallback(
    (changes: QueryChanges, options: { push?: boolean } = {}) => {
      const next = new URLSearchParams(window.location.search);
      for (const [name, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(name);
        else next.set(name, value);
      }
      setParams(next, { replace: !options.push });
    },
    [setParams],
  );
  return [params, update];
}
