# reactkit — documentation

Reusable React + TypeScript kit. Two parts, versioned together
(`version.ts`, `CHANGELOG.md`):

- `app/` — non-visual functionality (API client, session, hooks, texts,
  formatting). Never imports `ui/`.
- `ui/` — presentational components. May import `app/`.

Import with the alias: `import { readCookie } from "@reactkit/app"`.
The kit contains no user-facing sentence: every visible text arrives
through props or arguments. Status: ✅ implemented, 📝 planned.

## `version.ts`

| Name | Description | Status |
|---|---|---|
| `VERSION: string` | current kit version | ✅ |

## `app/`

| Function | Description | Status |
|---|---|---|
| `readCookie(name: string): string \| null` | decoded value of a document cookie, `null` if missing. Example: `readCookie("csrftoken")` | ✅ |

## `ui/`

| Component | Props | Description | Status |
|---|---|---|---|
| `Spinner` | `label: string` (accessible text) | loading indicator, `role="status"` | ✅ |
