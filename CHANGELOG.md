# reactkit changelog

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
