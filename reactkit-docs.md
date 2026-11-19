# reactkit — documentation

Reusable React + TypeScript kit (React 19, React Router 8). Two parts,
versioned together (`version.ts`, `CHANGELOG.md`):

- `app/` — non-visual functionality (API client, texts, session, route
  guard). Never imports `ui/`.
- `ui/` — presentational components. May import `app/`.

Import with the alias: `import { createApiClient } from "reactkit/app"`,
`import { Layout } from "reactkit/ui"`, styles once with
`import "reactkit/ui/reactkit.css"`.
The kit contains no user-facing sentence: every visible text arrives
through props or arguments. Status: ✅ implemented, 📝 planned.

## `version.ts`

| Name | Description | Status |
|---|---|---|
| `VERSION: string` | current kit version | ✅ |

## `app/`

### `cookies`

| Function | Description | Status |
|---|---|---|
| `readCookie(name: string): string \| null` | decoded value of a document cookie, `null` if missing | ✅ |

### `http` — API client

| Name | Description | Status |
|---|---|---|
| `createApiClient({ baseUrl, csrfPath, csrfCookie?, csrfHeader? }): ApiClient` | client of a JSON API on the same origin; `csrfCookie` default `"csrftoken"`, `csrfHeader` default `"X-CSRFToken"` | ✅ |
| `ApiClient.initCsrf(): Promise<void>` | `GET baseUrl + csrfPath`, which sets the CSRF cookie; call once at start-up | ✅ |
| `ApiClient.request<T>(method, path, body?): Promise<T>` | sends JSON (`credentials: "same-origin"`), adds the CSRF header from the cookie on POST/PUT/PATCH/DELETE; resolves to the decoded body (`undefined` when empty / 204); rejects with `ApiError` for every non-2xx answer and for network errors | ✅ |
| `get`, `post`, `put`, `patch`, `del` | shortcuts of `request` | ✅ |
| `ApiClient.onUnauthorized(listener): () => void` | listener called on every 401; returns the unsubscribe function | ✅ |
| `ApiError` | `status` (0 = server not reachable, see `isNetworkError`), `detail` (the body's `detail`, `""` if none), `errors` (`{field: string[]}`, `{}` if none), `body` (whole decoded body or `null`) | ✅ |
| `queryString(params: object): string` | `"?a=1&b=2"` from the parameters that are set (`undefined`, `null` and `""` left out, others with `String()`), `""` when none is | ✅ |

```ts
const api = createApiClient({ baseUrl: "/api", csrfPath: "/auth/csrf" });
await api.initCsrf();
try {
  await api.post("/orders", { item: 3 });
} catch (error) {
  if (error instanceof ApiError && error.status === 422) showFieldErrors(error.errors);
}
```

### `texts` — text catalog

The catalog is `{section: {group: {name: leaf}}}` at any depth; a leaf is a
string or a plural leaf `{one, other}` chosen by `count` (1 → `one`).
Placeholders `{name}` are replaced by the parameters.

| Name | Description | Status |
|---|---|---|
| `TextsProvider({ load, loading, failed, children })` | calls `load()` once; renders `loading` meanwhile, `failed(retry)` if it rejects, then the children with the translator | ✅ |
| `useTexts<K extends string>(): Translate<K>` | translator of the nearest provider; `K` = the application's key union (compile-time check of the keys). Throws outside a provider | ✅ |
| `Translate<K>`: `(key, params?) => string` | text of a key; a missing key gives `⟦key⟧` on the page and a `console.error` | ✅ |
| `createTranslator<K>(catalog): Translate<K>` | the translator without React | ✅ |
| `formatText(text, params?): string` | replaces `{name}` placeholders; unknown ones stay | ✅ |

```tsx
const t = createTranslator({ ui: { cart: { items: { one: "{count} item", other: "{count} items" } } } });
t("ui.cart.items", { count: 2 }); // "2 items"
```

### `session`

| Name | Description | Status |
|---|---|---|
| `SessionProvider<U>({ load, subscribeUnauthorized?, children })` | calls `load()` on mount (resolve to the user or `null`; any rejection is not swallowed); clears the user whenever `subscribeUnauthorized` notifies (e.g. `api.onUnauthorized`) | ✅ |
| `useSession<U>(): Session<U>` | `{ user, loading, setUser, refresh }`. Throws outside a provider | ✅ |

### `RequireAuth` — route guard (React Router)

| Name | Description | Status |
|---|---|---|
| `RequireAuth({ loginPath, loading, children? })` | while the session is checked renders `loading`; without a user redirects to `loginPath` with `state.from` = requested path; otherwise renders `children` or the nested routes (`<Outlet/>`) | ✅ |
| `returnPath(state, fallback): string` | the `state.from` received by the login page (only paths starting with `/`), or `fallback` | ✅ |

```tsx
<Route element={<RequireAuth loginPath="/login" loading={<Spinner label="Loading" />} />}>
  <Route path="/orders" element={<Orders />} />
</Route>
```

### `theme`

| Name | Description | Status |
|---|---|---|
| `Theme` | `{ style: string, mode: "auto" \| "light" \| "dark" }` | ✅ |
| `applyTheme(theme, target = <html>)` | sets `data-theme-style` / `data-theme-mode` on `target` | ✅ |
| `cacheTheme(theme)` | saves it in localStorage (`THEME_STORAGE_KEY` = `"rk-theme"`); storage errors ignored | ✅ |
| `setTheme(theme)` | `applyTheme` on `<html>` + `cacheTheme` | ✅ |

To avoid a flash of the wrong theme, put this in the `<head>` of
`index.html` (fallback theme inside):

```html
<script>
  try { var t = JSON.parse(localStorage.getItem("rk-theme")); } catch (e) {}
  t = t || { style: "paper", mode: "auto" };
  var d = document.documentElement.dataset;
  d.themeStyle = t.style; d.themeMode = t.mode;
</script>
```

### `useApi` — data loading

| Name | Description | Status |
|---|---|---|
| `useApi<T>(fn, deps = []): ApiState<T>` | runs `fn` on mount and when `deps` change; answers of outdated calls are ignored; returns `{ data, error, loading, reload }`. `data` is kept while reloading and after an error (the page can still show it next to the message) | ✅ |

```tsx
const orders = useApi(() => api.get<Order[]>(`/orders?status=${status}`), [status]);
```

In development React's StrictMode runs the first effect twice: the first
answer is discarded, which is the intended behaviour.

### `useLoadGate` — holding the page until it is loaded

| Name | Description | Status |
|---|---|---|
| `useLoadGate(pending: boolean): void` | tells the nearest `LoadGate` (ui) that a load is in progress; does nothing without one or once it is open. `useApi` calls it by itself; use it for other loading states that must hold the page | ✅ |
| `useGateClosed(): boolean` | true while the nearest `LoadGate` waits for the page's data (false without a gate); `BusyArea` uses it | ✅ |
| `LoadGateContext` | the context `LoadGate` provides (`{ report(id, pending), forget(id), open }`), null outside a gate | ✅ |

### `useSettled` — several loads as one update

| Name | Description | Status |
|---|---|---|
| `useSettled(states): SettledState` | takes a tuple of `ApiState`s that belong together and returns `{ data, busy }`: `data` is the tuple of their data taken the last moment none was loading (null before the first), `busy` is true while any loads. The page changes once per update, never once per answer, and never mixes old and new answers. A failed load counts as settled with its last data | ✅ |

```tsx
const view = useSettled([orders, totals] as const);
if (view.data === null) return <Spinner label="…" />;
const [rows, sums] = view.data;
return <DataTable rows={rows} busy={view.busy} … />;
```

### `queryParams` — URL parameters as page state

| Name | Description | Status |
|---|---|---|
| `useQueryParams(): [URLSearchParams, update(changes, { push? })]` | the parameters of this render and an update that starts from the current URL (`window.location.search`), not from the render: React Router's `setSearchParams` (also functional) would let a second quick change undo the first. `changes`: value = set, `""`/`null` = remove; replaces the history entry unless `push` | ✅ |

```tsx
const [params, update] = useQueryParams();
<input type="date" value={params.get("from") ?? ""} onChange={(e) => update({ from: e.target.value })} />
```

### `confirmation` — operations the server asks to confirm

The backend answers 428 `{detail, impact: {key: value}, required, given}`
(a value is a count, a string such as a date or an amount, a row described by a flat object such as `{id, date, amount}`, or `null` for nothing of that kind: `ImpactValue`)
until a destructive request carries enough confirmations
(djkit `require_confirmation`).

| Name | Description | Status |
|---|---|---|
| `useConfirmedAction(): [start, flow]` | `start(action)` runs `action(0)`; on 428 it waits for the user (`flow.pending`), then runs `action(given + 1)`, until it succeeds. Resolves to `{status: "done", value}` or `{status: "cancelled"}`; rejects with any other error. `flow` = `{ pending, busy, confirm, cancel }`, for `ConfirmationDialog` | ✅ |
| `pendingFrom(error): PendingConfirmation \| null` | the 428 body as `{detail, impact, required, given}`, or null; throws when an impact value is not a number, a string, `null` or a flat object of scalars | ✅ |
| `ImpactValue` | `number \| string \| null \| Record<string, ImpactScalar>`: one value of the impact (`ImpactScalar` = `number \| string \| boolean \| null`) | ✅ |

```tsx
const [confirmDelete, flow] = useConfirmedAction();
const result = await confirmDelete((n) => api.del(`/orders/${id}`, { confirmations: n }));
if (result.status === "done") toast.success("Deleted.");
<ConfirmationDialog flow={flow} title="Delete the order?" impactLabel={(key) => labels[key]} />
```

### `format` — amounts and dates

| Name | Description | Status |
|---|---|---|
| `formatAmount(value: number \| string, locale = "it-IT"): string` | two decimals, thousands separators always (`"1.100,00"`; Intl's Italian default would give `"1100,00"`); accepts the API's decimal strings; throws for a value that is not a number (also `""`) | ✅ |
| `decimalInput(typed): string` | a decimal typed by the user for the API: trimmed, comma → point (`"700,5"` → `"700.5"`); no check that it is a number | ✅ |
| `formatPercent(value: number \| string): string` | a percentage without symbol and useless zeros (`"50.00"` → `"50"`, `"33.33"` → `"33,33"`); throws for a value that is not a number | ✅ |
| `todayIso(): string` | today as `"2026-03-15"` in the browser's time zone | ✅ |
| `formatDate(iso, empty = "—"): string` | `"2026-03-15"` → `"15/03/2026"`; a date-time with offset → its day in the browser's time zone; `null` / `""` → `empty`; throws for a value that is not ISO | ✅ |

### `periods` — ready-made calendar periods

| Name | Description | Status |
|---|---|---|
| `type PeriodKind` | `"month" \| "quarter" \| "half" \| "year" \| "two_years" \| "all"` | ✅ |
| `PERIOD_KINDS` | every kind, in the order a chooser shows them | ✅ |
| `isPeriodKind(value): value is PeriodKind` | checks a value read e.g. from the URL | ✅ |
| `periodRange(kind, day): DateRange` | `{from, to}` (ISO, both included) of the period that holds `day`: calendar month; quarter from Jan/Apr/Jul/Oct; half from Jan/Jul; year; `two_years` = the year of the day and the one before; `all` → both `null`. Throws for a day that is not ISO | ✅ |
| `shiftPeriod(kind, day, steps): string` | the first day of the period `steps` periods away (`-1` back, `1` forward); `all` returns `day` | ✅ |
| `termEnd(start, years): string` | last day of a term of whole years: the day before the same date `years` later (`"2026-03-15", 4` → `"2030-03-14"`; `"2028-02-29", 1` → `"2029-02-28"`). Throws for a start that is not ISO | ✅ |

```ts
periodRange("quarter", "2026-05-20"); // {from: "2026-04-01", to: "2026-06-30"}
shiftPeriod("quarter", "2026-05-20", -1); // "2026-01-01"
```

### `forms` — form helpers

A multi-step form keeps "Next" disabled while a required field of the
current step is blank; the server still validates everything.

| Name | Description | Status |
|---|---|---|
| `missingFields(values, names): K[]` | the names among `names` whose value in `values` is empty or only spaces, in the order of `names` | ✅ |

```ts
missingFields({ name: "Ann", city: " " }, ["name", "city"]); // ["city"]
```

### `cooldown` — buttons disabled for a while

| Name | Description | Status |
|---|---|---|
| `useCooldowns<K>(durationMs): Cooldowns<K>` | one timer per key: `start(key)` begins it, `cooling(key)` tells whether it is running; the component re-renders when one ends. Repeats a server-side limit for comfort only | ✅ |

```tsx
const cooldowns = useCooldowns<number>(60_000);
<button disabled={cooldowns.cooling(order.id)} onClick={() => { send(order); cooldowns.start(order.id); }}>Send</button>
```

## `ui/`

Import `themes.css` then `reactkit.css`. Breakpoint: 700px. On touch screens (`pointer: coarse`, 0.16.0) every tap target is at least 44 px high (small buttons, sort buttons, table filter, page-size select, `<summary>`), table checkboxes 24 px; form inputs and selects never exceed their container.

**Themes (`themes.css`).** Three styles, each light and dark, selected by
two attributes on any element (usually `<html>`, see `app/theme`):
`data-theme-style` = `paper` (warm neutrals, deep green, serif headings),
`slate` (cool neutrals, blue-slate accent, soft corners), `graphite`
(monochrome, sharp corners, uppercase labels); `data-theme-mode` = `auto`
(follows `prefers-color-scheme`), `light`, `dark`. Tokens:
`--color-bg`, `--color-surface`, `--color-surface-2`, `--color-text`,
`--color-muted`, `--color-border`, `--color-primary`,
`--color-primary-hover`, `--color-on-primary`, `--color-danger(-bg)`,
`--color-success(-bg)`, `--color-warning(-bg)`, `--color-caution(-bg)` (milder than warning), `--color-info-bg`,
`--radius`, `--shadow`, `--font-heading`, `--heading-weight`,
`--label-transform`, `--label-spacing`, `--space`.

**Components (`reactkit.css`, classes `rk-*`)** read those tokens, with
fallbacks.

| Component | Props | Description | Status |
|---|---|---|---|
| `Layout` | `brand`, `aside?`, `nav`, `children?` | header (brand left, aside right), the nav, `<main>` with `children` or `<Outlet/>`; on mobile leaves room for the bottom bar | ✅ |
| `NavBar` | `label` (accessible name), `items: NavItem[]` (`{ to, label, icon?, secondary? }`), `more?: { label, icon? }` (required with secondary items, else it throws), `end?` | `NavLink`s (active one: `aria-current="page"`); top bar from 700px, fixed bottom bar with 56px targets below, where `secondary` items move into a pop-up list opened by the `more` button (highlighted when one of them is active, closed after a choice); `end` = extra item (e.g. a logout `<button>`) | ✅ |
| `FormField` | `label`, `errors?: string[]`, `help?` (HelpTip next to the label), every `<input>` prop | label + input + error list; `aria-invalid` and `aria-describedby` when there are errors | ✅ |
| `Alert` | `kind: "error" \| "info"`, `children` | message box (`role="alert"` / `"status"`); renders nothing for empty children | ✅ |
| `Spinner` | `label: string` (accessible text) | CSS spinner, `role="status"` | ✅ |
| `DataTable<T>` | `rows`, `columns: Column<T>[]`, `rowKey`, `actions?(row)`, `filterable = true`, `initialSort?`, `selected?: ReadonlySet<RowKey>` + `onSelectionChange?`, `empty` (shown with no rows), `caption` (accessible name), `pageSize = 25` (`null` = every row, e.g. a list already paged by the server), `pageSizes = PAGE_SIZES`, `busy = false` (reloading: previous rows kept in place inside a `BusyArea`; pair it with `useSettled`) | sort by clicking a header (`aria-sort`; arrow in an `aria-hidden` span), text filter over every column, checkboxes when `selected` is given (header box = every visible row), actions column. Pages: filter and sort apply to every row, then one page is shown; the `Pagination` controls (with the rows-per-page choice) appear only when the rows do not fit in the smallest size; filter, sort or a new size go back to page 1; "select all" acts on the page shown. Every other column has a light tint and a thin line separates the columns; headers wrap, never cut. Below 700px each row is a card of "label: value" lines with the same markup (CSS only) | ✅ |
| `Column<T>` | `key`, `label`, `render?(row)`, `sortValue?(row)` (omitted = not sortable; numbers numerically, strings naturally, empty values last), `filterValue?(row)` (default `sortValue`, else `row[key]`), `align?: "end"` (numbers), `primary?` (title of the card) | — | ✅ |
| `ConfirmDialog` | `open`, `title`, `children` (what will happen), `confirmLabel`, `danger?`, `busy?`, `onConfirm`, `onCancel` | native `<dialog>` (modal, focus kept inside): closes with the cancel button, Esc or a click on the backdrop (not while `busy`) | ✅ |
| `ToastProvider` + `useToast()` | `duration = 4000` | `success`, `info` disappear after `duration`; `error` stays until closed (`role="alert"`); live region at the bottom, above the mobile nav bar | ✅ |
| `SelectField` | `label`, `value`, `onChange(value)`, `children` (the `<option>`s), `errors = []`, `disabled`, `emptyLabel = "—"`, `help?` (HelpTip next to the label) | label + select with an empty first option (`emptyLabel`, e.g. "All" in a filter; `null` = no empty option, a choice is required) + errors, like `FormField` (`aria-invalid`, `aria-describedby`) | ✅ |
| `ConfirmationDialog` | `flow` (from `useConfirmedAction`), `title`, `impactLabel(key)`, `impactValue?(key, value)` (default: a count or a string as it is; required for object values, the dialog throws without it), `danger = true`, `children?` (note under the server's message) | the server's message, the caller's note, the impact (rows with a count > 0, a non-empty string or an object; `null` rows hidden), "N more confirmations" when more than one is needed; button "confirm" the first time, "confirm again" after | ✅ |
| `Badge` | `kind?: "neutral" \| "success" \| "caution" \| "warning" \| "danger"`, `children` | small status label | ✅ |
| `UiLabelsProvider` + `useUiLabels()` | `labels: UiLabels` = `cancel`, `close`, `filter`, `noResults`, `selectAll`, `selectRow`, `actions`, `confirm`, `confirmAgain`, `confirmationsLeft(count)`, `pages`, `previousPage`, `nextPage`, `pageSize`, `rangeOf(first, last, total)` (Pagination) | texts the components use without a prop; required by `DataTable`, `ConfirmDialog`, `ToastProvider` (missing provider → error) | ✅ |
| `ExplainedSection` | `title: string`, `description`, `reference`, `explanationLabel`, `explanation`, `controls?`, `empty?`, `emptyText?`, `children?` | a report section that explains itself: h2 title with a `HelpTip` holding `description`, then `explanationLabel` and `explanation` (what is included, what is left out and why); the period or date always visible under the title; optional controls; `emptyText` instead of the children when `empty` | ✅ |
| `BusyArea` | `busy`, `children?` (omitted/null before the first load), `minHeight = "8rem"` | before the first load, and while an enclosing `LoadGate` waits (content mounted but hidden): a skeleton of softly pulsing bars of `minHeight` (no animation with reduced motion), never an empty gap; while reloading: the content stays in place under a semi-opaque veil with a spinner, shown after 150 ms (fast answers do not flash); `aria-busy`. Spinner/skeleton text: `UiLabels.loading` | ✅ |
| `LoadGate` | `children` | the page is drawn at once (titles, filters, buttons); every `BusyArea` inside shows a skeleton until no load registered with `useLoadGate` has been in progress for 50 ms — also loads that start after the first answers — then all the data appears together; never closes again. Give it a `key` (e.g. the path): `<LoadGate key={location.pathname}><Outlet /></LoadGate>` | ✅ |
| `HelpTip` | `topic` (accessible name `labels.help(topic)`), `children` (the explanation) | "?" icon button; click/tap opens the explanation beside it, a second click, Escape or a click elsewhere closes it (no hover-only content, keyboard works); below 640px a panel across the bottom of the screen with a close button. 44px target on touch screens without taking more room in the line. In a heading add the class `rk-title-help` so the icon follows the last word. Use it instead of descriptive paragraphs; keep visible what must be read before acting | ✅ |
| `Pagination` | `page` (from 1), `pageSize`, `total`, `onPage(page)`, `onPageSize?(size)` (omitted = no choice), `pageSizes = PAGE_SIZES` | "1–25 of 120" (`rangeOf`), previous / next page, rows-per-page select; presentational (the caller keeps page and size), for lists paged in the browser (inside `DataTable`) or by the server (limit / offset). Also `PAGE_SIZES` (10, 25, 50, 100) and `pageCount(total, size)` (at least 1) | ✅ |
| `LinkTabs` | `label` (accessible name), `tabs: LinkTab[]` (`{ to, label }`) | the pages of a section as a row of tab links (`NavLink`, exact match; active one `aria-current="page"`); the chosen tab lives in the URL; the tabs wrap onto a new line when they do not fit (every tab always visible) | ✅ |
| `MonthGrid` | `month` ("YYYY-MM"), `title`, `weekdays` (7 names, Monday first; otherwise error), `previousLabel`, `nextLabel`, `onMonth(month)`, `renderDay(day)` (content of a "YYYY-MM-DD", null = empty), `empty?` (narrow screens, no day with content), `today?` (highlighted) | the weeks of a month as a 7-column grid with previous / next arrows; below 640px a list of only the days with content (readable on a phone); presentational, the caller keeps the month (e.g. in the URL). Also `shiftMonth(month, steps)` (error on a bad month) and `monthRange(month)` → `{start, end}` | ✅ |
| `ChoiceGroup<V>` | `legend`, `options: { value, label }[]`, `value`, `onChange(value)`, `disabled?` | one choice among a few, as a segmented control made of radio buttons (keyboard and screen readers as a radio group) | ✅ |

**Buttons** (classes, for `<button>` and `<a>`): `rk-button`, plus
`rk-button--primary`, `rk-button--ghost`, `rk-button--danger` (red text),
`rk-button--danger-solid` (red background), `rk-button--small`.
`rk-visually-hidden` hides an element but keeps it for screen readers.
