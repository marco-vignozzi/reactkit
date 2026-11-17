/**
 * Generic table: columns described by data, sorting, text filter, row
 * selection and per-row actions. On screens narrower than 700px every row
 * becomes a card of "label: value" lines (pure CSS on the same markup, so
 * nothing is rendered twice and nothing scrolls sideways).
 */
import { useMemo, useState, type ReactNode } from "react";

import { useUiLabels } from "./labels";

/** Key of a row (rowKey). */
export type RowKey = string | number;

/** One column. */
export interface Column<T> {
  /** Unique id of the column. */
  key: string;
  /** Header text (also the label of the value in the mobile cards). */
  label: string;
  /** Cell content; default: String(row[key]). */
  render?: (row: T) => ReactNode;
  /**
   * Value used to sort; omitted -> the column is not sortable.
   * Numbers sort numerically, strings with a natural, case-insensitive
   * order; null / undefined go last.
   */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Text matched by the filter; default: sortValue, else row[key]. */
  filterValue?: (row: T) => string;
  /** "end" for numbers and amounts (right-aligned, tabular digits). */
  align?: "start" | "end";
  /** The column is the title of the mobile card (shown bigger, no label). */
  primary?: boolean;
}

/** Sort state: column key and direction. */
export interface SortState {
  key: string;
  direction: "asc" | "desc";
}

/** Props of DataTable. */
export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  /** Stable key of a row. */
  rowKey: (row: T) => RowKey;
  /** Buttons of a row (edit, delete...), in the last column. */
  actions?: (row: T) => ReactNode;
  /** Shows the text filter above the table. Default true. */
  filterable?: boolean;
  /** Sort applied at first. */
  initialSort?: SortState;
  /** Selected keys (controlled); passing it shows the checkboxes. */
  selected?: ReadonlySet<RowKey>;
  /** Called with the new selection. */
  onSelectionChange?: (selected: Set<RowKey>) => void;
  /** Shown when `rows` is empty. */
  empty: ReactNode;
  /** Accessible name of the table. */
  caption: string;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/**
 * Compares two sort values: numbers numerically, strings naturally,
 * empty values last.
 *
 * @returns negative, zero or positive, as for Array.sort.
 */
function compareValues(a: string | number | null | undefined, b: string | number | null | undefined): number {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

/**
 * Plain value of a cell: row[key] when it is a string or a number.
 *
 * @returns the value, or "" for anything else.
 */
function plainValue<T>(row: T, key: string): string | number {
  const value = (row as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number" ? value : "";
}

/** Renders the table (and its cards on mobile). */
export function DataTable<T>({
  rows, columns, rowKey, actions, filterable = true, initialSort, selected, onSelectionChange, empty, caption,
}: DataTableProps<T>) {
  const labels = useUiLabels();
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null);
  const [filter, setFilter] = useState("");
  const selectable = selected !== undefined;

  const visible = useMemo(() => {
    const needle = filter.trim().toLocaleLowerCase();
    let result = rows;
    if (needle !== "") {
      result = rows.filter((row) =>
        columns.some((column) => {
          const text = column.filterValue?.(row) ?? column.sortValue?.(row) ?? plainValue(row, column.key);
          return String(text ?? "").toLocaleLowerCase().includes(needle);
        }),
      );
    }
    const column = sort === null ? undefined : columns.find((c) => c.key === sort.key);
    if (column?.sortValue !== undefined) {
      const value = column.sortValue;
      const sign = sort!.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => sign * compareValues(value(a), value(b)));
    }
    return result;
  }, [rows, columns, filter, sort]);

  /** Sorts by a column: first ascending, then toggles the direction. */
  function toggleSort(key: string) {
    setSort((current) =>
      current?.key === key ? { key, direction: current.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" },
    );
  }

  const visibleKeys = visible.map(rowKey);
  const allSelected = selectable && visibleKeys.length > 0 && visibleKeys.every((key) => selected.has(key));

  /** Selects or deselects every visible row (others stay as they are). */
  function toggleAll() {
    const next = new Set(selected);
    for (const key of visibleKeys) {
      if (allSelected) next.delete(key);
      else next.add(key);
    }
    onSelectionChange?.(next);
  }

  /** Selects or deselects one row. */
  function toggleRow(key: RowKey) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange?.(next);
  }

  if (rows.length === 0) return <div className="rk-table-empty">{empty}</div>;

  return (
    <div className="rk-table">
      {filterable && (
        <input
          type="search"
          className="rk-table-filter"
          aria-label={labels.filter}
          placeholder={labels.filter}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      )}
      <div className="rk-table-scroll">
        <table>
          <caption className="rk-visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th className="rk-table-check">
                  <input type="checkbox" aria-label={labels.selectAll} checked={allSelected} onChange={toggleAll} />
                </th>
              )}
              {columns.map((column) => {
                const direction = sort?.key === column.key ? sort.direction : null;
                return (
                  <th
                    key={column.key}
                    className={column.align === "end" ? "rk-end" : undefined}
                    aria-sort={direction === null ? undefined : direction === "asc" ? "ascending" : "descending"}
                  >
                    {column.sortValue === undefined ? (
                      column.label
                    ) : (
                      <button type="button" className="rk-sort" data-direction={direction ?? undefined} onClick={() => toggleSort(column.key)}>
                        {column.label}
                        <span className="rk-sort-icon" aria-hidden="true" />
                      </button>
                    )}
                  </th>
                );
              })}
              {actions !== undefined && <th className="rk-end">{labels.actions}</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const key = rowKey(row);
              const isSelected = selectable && selected.has(key);
              return (
                <tr key={key} aria-selected={selectable ? isSelected : undefined}>
                  {selectable && (
                    <td className="rk-table-check">
                      <input type="checkbox" aria-label={labels.selectRow} checked={isSelected} onChange={() => toggleRow(key)} />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-label={column.primary ? undefined : column.label}
                      className={[column.align === "end" ? "rk-end" : "", column.primary ? "rk-primary" : ""].join(" ").trim() || undefined}
                    >
                      {column.render?.(row) ?? plainValue(row, column.key)}
                    </td>
                  ))}
                  {actions !== undefined && <td className="rk-end rk-table-actions">{actions(row)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && <p className="rk-table-empty">{labels.noResults}</p>}
      </div>
    </div>
  );
}
