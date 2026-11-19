/**
 * Theme of the page: style and light/dark mode (reactkit/ui/themes.css).
 *
 * The theme lives in two attributes of an element (usually <html>):
 * data-theme-style and data-theme-mode. The user's choice is normally kept
 * by the server; a copy in localStorage lets the page show the right theme
 * from the first paint, before the user is loaded, with this inline script
 * in the <head> of index.html (fallback theme inside):
 *
 *   <script>try{var t=JSON.parse(localStorage.getItem("rk-theme"))}catch(e){}
 *   t=t||{style:"paper",mode:"auto"};var d=document.documentElement.dataset;
 *   d.themeStyle=t.style;d.themeMode=t.mode</script>
 */

/** A theme: style name and mode ("auto" follows the device). */
export interface Theme {
  style: string;
  mode: "auto" | "light" | "dark";
}

/** localStorage key of the cached theme. */
export const THEME_STORAGE_KEY = "rk-theme";

/**
 * Applies a theme to an element.
 *
 * @param theme style and mode.
 * @param target element that receives the attributes; default <html>.
 */
export function applyTheme(theme: Theme, target: HTMLElement = document.documentElement): void {
  target.dataset.themeStyle = theme.style;
  target.dataset.themeMode = theme.mode;
}

/**
 * Saves the theme in localStorage, for the next first paint.
 * Storage errors (private mode, blocked storage) are ignored: the cache is
 * only a convenience, the real choice is elsewhere.
 *
 * @param theme the theme to remember.
 */
export function cacheTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Not available: the page falls back to the default theme at start-up.
  }
}

/**
 * Applies a theme to <html> and caches it.
 *
 * @param theme the theme chosen by the user.
 */
export function setTheme(theme: Theme): void {
  applyTheme(theme);
  cacheTheme(theme);
}
