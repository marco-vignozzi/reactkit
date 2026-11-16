/**
 * Browser cookie helpers.
 */

/**
 * Reads a cookie of the current document.
 *
 * @param name cookie name, e.g. "csrftoken".
 * @returns the decoded value, or null when the cookie is not set.
 */
export function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const item = part.trim();
    if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
  }
  return null;
}
