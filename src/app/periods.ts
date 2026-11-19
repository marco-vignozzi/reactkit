/**
 * Ready-made calendar periods for reports: a month, a quarter, a half
 * year, a year or two years containing a reference day, moved back and
 * forth by their own length, or no limit at all ("since ever"). Dates are
 * ISO strings ("2026-03-15"); the math is done on year/month/day numbers,
 * so time zones never shift a day.
 */

/** The ready-made periods; "all" has no limits. */
export type PeriodKind = "month" | "quarter" | "half" | "year" | "two_years" | "all";

/** Every PeriodKind, in the order a chooser shows them. */
export const PERIOD_KINDS: readonly PeriodKind[] = ["month", "quarter", "half", "year", "two_years", "all"];

/** A period: first and last day, both included; null = no limit. */
export interface DateRange {
  from: string | null;
  to: string | null;
}

/** Length in months of every kind except "all". */
const MONTHS: Record<Exclude<PeriodKind, "all">, number> = { month: 1, quarter: 3, half: 6, year: 12, two_years: 24 };

/**
 * Whether a value is a PeriodKind (e.g. read from the URL).
 *
 * @param value any string, or null.
 * @returns true for one of PERIOD_KINDS.
 */
export function isPeriodKind(value: string | null): value is PeriodKind {
  return value !== null && (PERIOD_KINDS as readonly string[]).includes(value);
}

/**
 * Splits an ISO date into numbers.
 *
 * @param iso "2026-03-15".
 * @returns [year, month 1-12, day].
 * @throws Error for a value that is not an ISO date (fail loudly).
 */
function parts(iso: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) throw new Error(`periods: not an ISO date: ${iso}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * ISO date of a year and a month counted from January of that year (it
 * may go past December or before January), on a given day.
 *
 * @param year the year.
 * @param month month 1-12, or beyond (13 = January of the next year, 0 = December of the previous one).
 * @param day the day; 0 = the last day of the previous month.
 * @returns "YYYY-MM-DD".
 */
function isoOf(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month - 1, day));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * The period of a kind that contains a reference day. Months, quarters
 * and half years follow the calendar (quarters from January, April, July,
 * October; halves from January and July); "two_years" is the year of the
 * day and the one before it.
 *
 * @param kind the period kind.
 * @param day the reference day (ISO).
 * @returns its first and last day; both null for "all".
 */
export function periodRange(kind: PeriodKind, day: string): DateRange {
  if (kind === "all") return { from: null, to: null };
  const [year, month] = parts(day);
  const length = MONTHS[kind];
  // Two years end with the year of the day; the other kinds start at the
  // block of `length` months, counted from January, that holds the month.
  const firstMonth = kind === "two_years" ? -11 : Math.floor((month - 1) / length) * length + 1;
  return { from: isoOf(year, firstMonth, 1), to: isoOf(year, firstMonth + length, 0) };
}

/**
 * Moves a reference day by whole periods of a kind (the arrows of a
 * chooser): the result lies in the period before or after.
 *
 * @param kind the period kind ("all" does not move).
 * @param day the reference day (ISO).
 * @param steps how many periods: -1 back, 1 forward.
 * @returns the new reference day: the first day of the period reached.
 */
export function shiftPeriod(kind: PeriodKind, day: string, steps: number): string {
  if (kind === "all") return day;
  const range = periodRange(kind, day);
  const [year, month] = parts(range.from as string);
  return isoOf(year, month + steps * MONTHS[kind], 1);
}

/**
 * Last day of a term of whole years starting on a day (e.g. the first
 * term of a lease): the day before the same date `years` later.
 *
 * @param start the first day (ISO).
 * @param years length of the term, in years.
 * @returns the last day (ISO); 15/3/2026 + 4 -> 14/3/2030, 29/2/2028 + 1 -> 28/2/2029.
 * @throws Error for a start that is not ISO (fail loudly).
 */
export function termEnd(start: string, years: number): string {
  const [year, month, day] = parts(start);
  // 29/2 of a year that is not leap rolls to 1/3: the day before is 28/2.
  return isoOf(year + years, month, day - 1);
}
