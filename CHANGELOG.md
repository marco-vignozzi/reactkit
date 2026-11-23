# reactkit changelog

## 0.18.5 — 2026-11-23
- ui: DataTable on touch screens: the 44px touch target of the sort buttons no longer adds space between the headers.

## 0.18.4 — 2026-11-23
- ui: Legend: two columns on phones (the minimum column width was too wide).

## 0.18.3 — 2026-11-23
- ui: DataTable on phones: tighter spacing between the sort headers.
- ui: Legend: compact, several entries per line where the width allows.

## 0.18.2 — 2026-11-23
- ui: NavBar, phone: the "more" items are stacked one per line (they inherited the row layout of the bar).

## 0.18.1 — 2026-11-23
- ui: NavBar, phone layout: the "more" list is a sheet over the full width
  (it used to run off the screen and cut its labels).

## 0.18.0 — 2026-11-23
- ui: `IconHint` — an icon with its meaning (`icon`, `label`): the meaning
  shows on hover (native tooltip), is read by assistive technology and is
  reachable by keyboard. CSS class `rk-icon-hint`.
- ui: `Legend` — the legend of the icons of a page (`title`, `items` of
  `{icon, label}`), one line per icon. CSS class `rk-legend`.

## 0.17.0 — 2026-11-18
- app: `useSettled(states)` — combines several `useApi` loads of a page:
  new data only when all have settled (one update instead of one per
  answer), the previous snapshot meanwhile, `busy` while any loads.
- ui: `BusyArea` — before the first load a skeleton (softly pulsing bars)
  of fixed height (never an empty gap); while reloading the content stays in
  place under a semi-opaque veil with a spinner (after 150 ms),
  `aria-busy`. New `UiLabels.loading` (its spinner text).
- ui: `DataTable` prop `busy` — while reloading the table keeps its rows
  and size inside a `BusyArea`.
- ui: `LoadGate` + app: `useLoadGate`, `useGateClosed`, `LoadGateContext` —
  the page is drawn at once; its `BusyArea`s show a skeleton until no load
  inside has been in progress for 50 ms, then all the data appears
  together; `useApi` registers by itself. Never closes again (reloads use
  the `BusyArea` veil).
- ui: `HelpTip` — "?" button opening an explanation on click/tap (Escape
  or a click elsewhere closes; a bottom panel on phones). New
  `UiLabels.help(topic)`, CSS class `rk-title-help` for headings.
- ui: `FormField` and `SelectField` prop `help` (HelpTip next to the label).
- ui (breaking): `ExplainedSection` shows `description` and `explanation`
  in a HelpTip next to the title (no more visible sentence and
  collapsible box); `title` is now a string.
- fix: `version.ts` was empty since 0.16.0 (deleted by mistake): restored.

## 0.16.0 — 2026-11-18
- ui: on touch screens (`pointer: coarse`) small buttons, sort buttons, the table filter,
  the page-size select and `<summary>` are at least 44 px high; table
  checkboxes are 24 px. `FormField` inputs and selects never get wider
  than their container (a select with long options caused horizontal
  scroll on phones).

## 0.15.0 — 2026-11-18
- app: `missingFields(values, names)` — the required fields still blank;
  a multi-step form keeps "Next" disabled while the current step has one.

## 0.14.0 — 2026-11-17
- app: `termEnd(start, years)` — last day of a term of whole years (the
  day before the same date `years` later; 29/2 -> 28/2).

## 0.13.0 — 2026-11-17
- ui: `MonthGrid` — calendar grid of one month (Monday first) with the
  caller's content in each day and previous / next arrows; below 640px it
  becomes a list of the days with content. Helpers `shiftMonth(month,
  steps)` and `monthRange(month)` ("YYYY-MM" -> first and last day).

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
