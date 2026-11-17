/**
 * Month calendar grid (0.13.0): the weeks of one month, Monday first,
 * with what the caller renders inside each day, and arrows to the
 * previous / next month. On narrow screens (below 640px) the grid becomes
 * a list of the days that have content, so it stays readable on a phone.
 * Presentational: the caller keeps the month (e.g. in the URL) and gives
 * every text (title, weekday names, arrow labels).
 */
import type { ReactNode } from "react";

/** Props of MonthGrid. */
export interface MonthGridProps {
  /** The month shown, "YYYY-MM". */
  month: string;
  /** Title above the grid, e.g. "novembre 2026". */
  title: string;
  /** The 7 weekday names, Monday first. */
  weekdays: readonly string[];
  /** Accessible labels of the arrows. */
  previousLabel: string;
  nextLabel: string;
  /** Called with the month to show, "YYYY-MM". */
  onMonth: (month: string) => void;
  /** Content of a day ("YYYY-MM-DD"); null / undefined -> empty day. */
  renderDay: (day: string) => ReactNode;
  /** Shown instead of the list on narrow screens when no day has content. */
  empty?: ReactNode;
  /** Today ("YYYY-MM-DD"), highlighted when in the month. */
  today?: string;
}

/** Two digits. */
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * The month after or before a month.
 *
 * @param month "YYYY-MM".
 * @param steps months to move (negative = back).
 * @returns the new "YYYY-MM".
 * @throws Error on a month not in "YYYY-MM" form (fail loudly).
 */
export function shiftMonth(month: string, steps: number): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (match === null) throw new Error(`shiftMonth: "${month}" is not YYYY-MM`);
  const index = Number(match[1]) * 12 + Number(match[2]) - 1 + steps;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

/**
 * First and last day of a month.
 *
 * @param month "YYYY-MM".
 * @returns {start, end} as "YYYY-MM-DD".
 */
export function monthRange(month: string): { start: string; end: string } {
  const [year, number] = shiftMonth(month, 0).split("-").map(Number);
  const last = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return { start: `${month}-01`, end: `${month}-${pad(last)}` };
}

/**
 * The cells of the grid: null before the 1st (to start on Monday) and
 * after the last day (to fill the last week), the days in between.
 */
function cells(month: string): (string | null)[] {
  const { end } = monthRange(month);
  const [year, number] = month.split("-").map(Number);
  const lead = (new Date(Date.UTC(year, number - 1, 1)).getUTCDay() + 6) % 7;
  const days = Number(end.slice(8));
  const list: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= days; day += 1) list.push(`${month}-${pad(day)}`);
  while (list.length % 7 !== 0) list.push(null);
  return list;
}

/** Renders the grid of the month. */
export function MonthGrid({ month, title, weekdays, previousLabel, nextLabel, onMonth, renderDay, empty, today }: MonthGridProps) {
  if (weekdays.length !== 7) throw new Error("MonthGrid: weekdays needs 7 names, Monday first");
  const grid = cells(month);
  const contents = new Map(grid.map((day) => [day, day === null ? null : renderDay(day)]));
  const filled = grid.filter((day): day is string => day !== null && contents.get(day) != null);
  return (
    <div className="rk-month">
      <div className="rk-month__head">
        <button type="button" className="rk-button" aria-label={previousLabel} title={previousLabel} onClick={() => onMonth(shiftMonth(month, -1))}>‹</button>
        <h2 className="rk-month__title" aria-live="polite">{title}</h2>
        <button type="button" className="rk-button" aria-label={nextLabel} title={nextLabel} onClick={() => onMonth(shiftMonth(month, 1))}>›</button>
      </div>
      <div className="rk-month__grid" role="grid" aria-label={title}>
        <div className="rk-month__row" role="row">
          {weekdays.map((name) => <div key={name} className="rk-month__weekday" role="columnheader">{name}</div>)}
        </div>
        {Array.from({ length: grid.length / 7 }, (_, week) => (
          <div key={week} className="rk-month__row" role="row">
            {grid.slice(week * 7, week * 7 + 7).map((day, index) => (
              <div
                key={day ?? `blank-${week}-${index}`}
                role="gridcell"
                className={`rk-month__day${day === null ? " rk-month__day--blank" : ""}${day !== null && day === today ? " rk-month__day--today" : ""}`}
              >
                {day !== null && <>
                  <span className="rk-month__number">{Number(day.slice(8))}</span>
                  {contents.get(day)}
                </>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <ol className="rk-month__list">
        {filled.map((day) => {
          const weekday = weekdays[(new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7];
          return (
            <li key={day} className={`rk-month__item${day === today ? " rk-month__day--today" : ""}`}>
              <span className="rk-month__number">{weekday} {Number(day.slice(8))}</span>
              {contents.get(day)}
            </li>
          );
        })}
        {filled.length === 0 && empty !== undefined && <li className="rk-month__item">{empty}</li>}
      </ol>
    </div>
  );
}
