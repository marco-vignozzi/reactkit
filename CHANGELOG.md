# reactkit changelog

## 0.12.1 — 2026-11-17
- ui: `LinkTabs` — tabs wrap onto a new line instead of scrolling, so
  every tab stays visible on narrow screens.

## 0.12.0 — 2026-11-17
- ui: `NavBar` — `NavItem.secondary` and the `more` prop (`{label, icon?}`):
  secondary items stay in the bar on wide screens and move into a "more"
  pop-up list below 700px; secondary items without `more` throw.
- ui: `DataTable` — columns told apart (light tint on every other column,
  thin line between columns; on mobile cards a dashed line between values);
  headers wrap instead of being cut.
- ui: `LinkTabs` — the pages of a section as tab links (`NavLink`).
- ui: `Pagination` (+ `PAGE_SIZES`, `pageCount`) — page controls with the
  rows-per-page choice, for lists paged in the browser or by the server.
- ui: `DataTable` pages its rows: `pageSize = 25` (`null` = all), `pageSizes`;
  controls only when the rows do not fit in the smallest size.
- ui: `UiLabels` gains `pages`, `previousPage`, `nextPage`, `pageSize`,
  `rangeOf(first, last, total)` (breaking: every provider must pass them).

## 0.11.0 — 2026-11-17
- app: `ImpactValue` also `null` and a flat object (`ImpactScalar` values), e.g. the
  row a deletion keeps `{id, date, amount}`; `pendingFrom` accepts them (it threw).
- ui: `ConfirmationDialog` hides `null` rows; an object value needs `impactValue`
  (the default formatter throws).
- app: `queryString(params)` — query string of the parameters that are set
  (undefined, null and "" left out), `""` when none is.

## 0.10.0 — 2026-11-17
- app: `periods` — `periodRange(kind, day)` (month, quarter, half year,
  year, two years containing a day, or no limit), `shiftPeriod(kind, day,
  steps)` (the arrows back/forward), `isPeriodKind`, `PERIOD_KINDS`.
- app: `formatPercent(value)` ("50.00" → "50", "33.33" → "33,33").
- app: `useQueryParams()` — query parameters as page state; every update starts
  from the current URL, so two quick changes never undo each other.
- ui: `SelectField.emptyLabel` may be `null`: no empty option (a choice is required).
- ui: `ExplainedSection` (title, what it shows, period or date always
  visible, collapsible "how it is computed", empty state).

## 0.9.0 — 2026-11-17
- ui: `Badge` kind `caution` (milder than `warning`, e.g. yellow next to
  orange), with the theme tokens `--color-caution` / `--color-caution-bg`.
- app: `decimalInput(typed)` (decimal comma → point),
  `todayIso()` (today in the browser's time zone) and
  `useCooldowns(durationMs)` (buttons disabled for a while, one timer per key).
- ui: `SelectField.emptyLabel` (text of the empty first option, default "—").

## 0.8.0 — 2026-11-17
- ui: `ConfirmationDialog` accepts `children`: a note of the caller shown
  under the server's message (e.g. what the operation keeps).

## 0.7.0 — 2026-11-17
- app: a 428 impact value can be a string too (`ImpactValue = number |
  string`: dates, amounts); `pendingFrom` throws on any other type.
- ui: `ConfirmationDialog` gains `impactValue(key, value)` (how a value is
  shown); rows with 0 or "" are hidden (before, string values were always
  hidden).
- app: `formatDate` accepts an ISO date-time too and shows its local day.

## 0.6.0 — 2026-11-17
- ui: `SelectField` (drop-down list with label and errors, like FormField);
  `.rk-field select` styled like the inputs.

## 0.5.0 — 2026-11-17
- app: `useConfirmedAction` / `pendingFrom` (operations the server asks to
  confirm with 428: impact, required, given).
- ui: `ConfirmationDialog` (the dialog of useConfirmedAction), `Badge`.
- ui: `UiLabels` gains `confirm`, `confirmAgain`, `confirmationsLeft(count)`.

## 0.4.0 — 2026-11-17
- app: `useApi` (load with deps, stale answers ignored, `reload`),
  `formatAmount` / `formatDate` (same output as djkit.it).
- ui: `DataTable` (sorting, filter, selection, actions, cards under 700px),
  `ConfirmDialog` (native <dialog>), `ToastProvider` / `useToast`,
  `UiLabelsProvider` / `useUiLabels` (texts of the components).
- ui: buttons are kit classes now: `rk-button` with `--primary`, `--ghost`,
  `--danger`, `--danger-solid`, `--small` (they were application classes).

## 0.3.0 — 2026-11-17
- ui: `themes.css` (styles `paper`, `slate`, `graphite` x modes `auto`,
  `light`, `dark` on `data-theme-style` / `data-theme-mode`), `ChoiceGroup`
  (segmented radio group); field labels follow `--label-transform`.
- app: `applyTheme`, `cacheTheme`, `setTheme`, `THEME_STORAGE_KEY`.

## 0.2.0 — 2026-11-16
- app: `createApiClient` / `ApiClient` / `ApiError` (JSON, CSRF header,
  401 listeners, network errors as status 0); `TextsProvider`, `useTexts`,
  `createTranslator`, `formatText` (backend text catalog, plural leaves);
  `SessionProvider`, `useSession`; `RequireAuth`, `returnPath`.
- ui: `Layout`, `NavBar`, `FormField`, `Alert`; `Spinner` is now a CSS
  spinner; `reactkit.css` with the styles of every component.

## 0.1.0 — 2026-11-16
- First version: `app.readCookie`, `ui.Spinner`, `VERSION`.
