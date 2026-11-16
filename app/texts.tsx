/**
 * Text catalog served by the backend.
 *
 * The application shows no sentence of its own: every visible text comes
 * from a catalog {version, ui: {...}, value: {...}} loaded once at start-up
 * (e.g. djkit's GET /api/texts) and is referred to by key ("ui.login.title").
 * A leaf is a string, or a plural leaf {one, other} chosen by `count`.
 * Placeholders "{name}" are replaced by the given parameters.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** A catalog leaf: a text or a plural text. */
export type TextLeaf = string | { one: string; other: string };

/** Nested catalog sections, any depth. */
export interface TextTree {
  [name: string]: TextLeaf | TextTree;
}

/** Parameters of a text: values of its placeholders (and `count`). */
export type TextParams = Record<string, string | number>;

/**
 * Translator: the text of a key.
 *
 * Returns "⟦key⟧" (and logs an error) for a missing key, so a mistake is
 * visible on the page instead of an empty space.
 */
export type Translate<K extends string = string> = (key: K, params?: TextParams) => string;

/**
 * Whether a catalog value is a plural leaf.
 *
 * @param value catalog value.
 * @returns true for {one, other} with string values.
 */
function isPlural(value: unknown): value is { one: string; other: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { one?: unknown }).one === "string" &&
    typeof (value as { other?: unknown }).other === "string"
  );
}

/**
 * Replaces "{name}" placeholders.
 *
 * @param text text with placeholders.
 * @param params their values.
 * @returns the text with every known placeholder replaced; unknown ones stay.
 */
export function formatText(text: string, params: TextParams = {}): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
}

/**
 * Builds a translator over a catalog.
 *
 * @param catalog the decoded catalog (sections at the top level).
 * @returns translate(key, params).
 *
 * @example
 *   const t = createTranslator({ ui: { cart: { items: { one: "{count} item", other: "{count} items" } } } });
 *   t("ui.cart.items", { count: 2 }); // "2 items"
 */
export function createTranslator<K extends string = string>(catalog: TextTree): Translate<K> {
  return (key, params) => {
    let node: TextLeaf | TextTree | undefined = catalog;
    for (const part of key.split(".")) {
      node = typeof node === "object" && node !== null && !isPlural(node) ? node[part] : undefined;
    }
    if (typeof node === "string") return formatText(node, params);
    if (isPlural(node)) return formatText(params?.count === 1 ? node.one : node.other, params);
    console.error(`Missing text key: ${key}`);
    return `⟦${key}⟧`;
  };
}

const TextsContext = createContext<Translate | null>(null);

/** Props of TextsProvider. */
export interface TextsProviderProps {
  /** Loads the catalog (e.g. `() => api.get("/texts")`). */
  load: () => Promise<TextTree>;
  /** Shown while the catalog is loading. */
  loading: ReactNode;
  /**
   * Shown when the catalog cannot be loaded; `retry` loads it again.
   * This is the only place where the application uses texts of its own.
   */
  failed: (retry: () => void) => ReactNode;
  children: ReactNode;
}

/**
 * Loads the catalog once and gives its translator to the children
 * (useTexts). Renders `loading` / `failed` until the catalog is available.
 */
export function TextsProvider({ load, loading, failed, children }: TextsProviderProps) {
  const [catalog, setCatalog] = useState<TextTree | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setError(false);
    load().then(
      (data) => active && setCatalog(data),
      () => active && setError(true),
    );
    return () => {
      active = false;
    };
  }, [load, attempt]);

  const translate = useMemo(() => (catalog === null ? null : createTranslator(catalog)), [catalog]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (translate !== null) return <TextsContext.Provider value={translate}>{children}</TextsContext.Provider>;
  return <>{error ? failed(retry) : loading}</>;
}

/**
 * The translator of the nearest TextsProvider.
 *
 * Type parameter K: the application's key union (generated from the
 * backend), so a missing key fails at compile time.
 *
 * @throws Error when used outside a TextsProvider.
 */
export function useTexts<K extends string = string>(): Translate<K> {
  const translate = useContext(TextsContext);
  if (translate === null) throw new Error("useTexts must be used inside a TextsProvider");
  return translate as Translate<K>;
}
