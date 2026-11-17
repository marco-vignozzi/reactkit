/**
 * Formatting of amounts and dates shown in the interface, matching the
 * backend's (djkit.it format_amount / format_date) so a value reads the
 * same in a page and in a message or email.
 */

const amountFormats = new Map<string, Intl.NumberFormat>();

/**
 * Formats an amount with two decimals and thousands separators.
 *
 * Grouping is forced (useGrouping: true): with the default, Italian leaves
 * 4-digit numbers ungrouped ("1100,00"), unlike the backend ("1.100,00").
 *
 * @param value number, or decimal string as sent by the API ("1100.50").
 * @param locale BCP 47 locale; default "it-IT".
 * @returns e.g. "1.100,50" (no currency symbol).
 * @throws Error for a value that is not a number (fail loudly).
 */
export function formatAmount(value: number | string, locale = "it-IT"): string {
  // Number("") is 0: an empty string would silently become "0,00".
  const number = typeof value === "number" ? value : value.trim() === "" ? Number.NaN : Number(value);
  if (!Number.isFinite(number)) throw new Error(`formatAmount: not a number: ${String(value)}`);
  let format = amountFormats.get(locale);
  if (format === undefined) {
    format = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
    amountFormats.set(locale, format);
  }
  return format.format(number);
}

/**
 * Formats an ISO date ("2026-03-15") as day/month/year. An ISO date-time
 * with offset ("2026-03-15T23:30:00+00:00") is shown as the day it is in
 * the browser's time zone.
 *
 * @param iso date or date-time in ISO format, or null.
 * @param empty text for a missing date; default "—".
 * @returns e.g. "15/03/2026", or `empty`.
 * @throws Error for a value that is not an ISO date (fail loudly).
 */
export function formatDate(iso: string | null | undefined, empty = "—"): string {
  if (iso === null || iso === undefined || iso === "") return empty;
  const match = /^(\d{4})-(\d{2})-(\d{2})(T.*)?$/.exec(iso);
  if (match === null) throw new Error(`formatDate: not an ISO date: ${iso}`);
  if (match[4] === undefined) return `${match[3]}/${match[2]}/${match[1]}`;
  const moment = new Date(iso);
  if (Number.isNaN(moment.getTime())) throw new Error(`formatDate: not an ISO date-time: ${iso}`);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(moment.getDate())}/${pad(moment.getMonth() + 1)}/${moment.getFullYear()}`;
}

/**
 * A decimal typed by the user, in the form an API expects: trimmed, the
 * decimal comma turned into a point ("700,5" -> "700.5"). It does not
 * check that the result is a number: the server does.
 *
 * @param typed the text of the field.
 * @returns the text for the API.
 */
export function decimalInput(typed: string): string {
  return typed.trim().replace(",", ".");
}

/**
 * Today as an ISO date ("2026-03-15") in the browser's time zone (not UTC:
 * near midnight toISOString() alone would give the wrong day).
 *
 * @returns the date.
 */
export function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
