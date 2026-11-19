/**
 * Page controls of a list (0.12.0): "1–25 of 120", previous / next page
 * and, optionally, the choice of rows per page. Presentational: the caller
 * keeps page and size, so the same controls serve a list paged in the
 * browser (DataTable) and one paged by the server (limit / offset).
 * Texts from UiLabelsProvider (pages, previousPage, nextPage, pageSize,
 * rangeOf).
 */
import { useId } from "react";

import { useUiLabels } from "./labels.tsx";

/** The page sizes offered by default. */
export const PAGE_SIZES: readonly number[] = [10, 25, 50, 100];

/** Props of Pagination. */
export interface PaginationProps {
  /** Current page, from 1. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Rows in the whole list. */
  total: number;
  /** Called with the page to show. */
  onPage: (page: number) => void;
  /** Called with a new page size; omitted -> no choice shown. */
  onPageSize?: (size: number) => void;
  /** Sizes offered (default PAGE_SIZES). */
  pageSizes?: readonly number[];
}

/**
 * Number of pages of a list (at least 1).
 *
 * @param total rows in the list.
 * @param pageSize rows per page.
 */
export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Renders the controls. */
export function Pagination({ page, pageSize, total, onPage, onPageSize, pageSizes = PAGE_SIZES }: PaginationProps) {
  const labels = useUiLabels();
  const sizeId = useId();
  const pages = pageCount(total, pageSize);
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  return (
    <div className="rk-pagination" role="group" aria-label={labels.pages}>
      <span className="rk-pagination-range" aria-live="polite">{labels.rangeOf(first, last, total)}</span>
      <div className="rk-pagination-buttons">
        <button type="button" className="rk-button rk-button--small" disabled={page <= 1} onClick={() => onPage(page - 1)}>{labels.previousPage}</button>
        <button type="button" className="rk-button rk-button--small" disabled={page >= pages} onClick={() => onPage(page + 1)}>{labels.nextPage}</button>
      </div>
      {onPageSize !== undefined && (
        <span className="rk-pagination-size">
          <label htmlFor={sizeId}>{labels.pageSize}</label>
          <select id={sizeId} value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))}>
            {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </span>
      )}
    </div>
  );
}
