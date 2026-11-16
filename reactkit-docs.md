# reactkit — documentation

Reusable React + TypeScript kit (React 19, React Router 8). Two parts,
versioned together (`version.ts`, `CHANGELOG.md`):

- `app/` — non-visual functionality (API client, texts, session, route
  guard). Never imports `ui/`.
- `ui/` — presentational components. May import `app/`.

Import with the alias: `import { createApiClient } from "@reactkit/app"`,
`import { Layout } from "@reactkit/ui"`, styles once with
`import "@reactkit/ui/reactkit.css"`.
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

### Planned

| Name | Description | Status |
|---|---|---|
| `useApi(fn)` | `{ data, error, loading, reload }` | 📝 |

## `ui/`

Import `themes.css` then `reactkit.css`. Breakpoint: 700px.

**Themes (`themes.css`).** Three styles, each light and dark, selected by
two attributes on any element (usually `<html>`, see `app/theme`):
`data-theme-style` = `paper` (warm neutrals, deep green, serif headings),
`slate` (cool neutrals, blue-slate accent, soft corners), `graphite`
(monochrome, sharp corners, uppercase labels); `data-theme-mode` = `auto`
(follows `prefers-color-scheme`), `light`, `dark`. Tokens:
`--color-bg`, `--color-surface`, `--color-surface-2`, `--color-text`,
`--color-muted`, `--color-border`, `--color-primary`,
`--color-primary-hover`, `--color-on-primary`, `--color-danger(-bg)`,
`--color-success(-bg)`, `--color-warning(-bg)`, `--color-info-bg`,
`--radius`, `--shadow`, `--font-heading`, `--heading-weight`,
`--label-transform`, `--label-spacing`, `--space`.

**Components (`reactkit.css`, classes `rk-*`)** read those tokens, with
fallbacks.

| Component | Props | Description | Status |
|---|---|---|---|
| `Layout` | `brand`, `aside?`, `nav`, `children?` | header (brand left, aside right), the nav, `<main>` with `children` or `<Outlet/>`; on mobile leaves room for the bottom bar | ✅ |
| `NavBar` | `label` (accessible name), `items: NavItem[]` (`{ to, label, icon? }`), `end?` | `NavLink`s (active one: `aria-current="page"`); top bar from 700px, fixed bottom bar with 56px targets below; `end` = extra item (e.g. a logout `<button>`) | ✅ |
| `FormField` | `label`, `errors?: string[]`, every `<input>` prop | label + input + error list; `aria-invalid` and `aria-describedby` when there are errors | ✅ |
| `Alert` | `kind: "error" \| "info"`, `children` | message box (`role="alert"` / `"status"`); renders nothing for empty children | ✅ |
| `Spinner` | `label: string` (accessible text) | CSS spinner, `role="status"` | ✅ |
| `ChoiceGroup<V>` | `legend`, `options: { value, label }[]`, `value`, `onChange(value)`, `disabled?` | one choice among a few, as a segmented control made of radio buttons (keyboard and screen readers as a radio group) | ✅ |
| `DataTable`, `ConfirmDialog`, `Toast` | — | — | 📝 |
