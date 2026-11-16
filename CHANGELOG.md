# reactkit changelog

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
