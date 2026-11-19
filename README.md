# reactkit

Kit React + TypeScript riusabile (React 19, React Router 8), in due parti:

- `app` — funzioni non visive: client API, testi, sessione, guardia delle rotte.
  Non importa mai `ui`.
- `ui` — componenti di presentazione. Può importare `app`.

Documentazione completa: [`reactkit-docs.md`](reactkit-docs.md).
Modifiche per versione: [`CHANGELOG.md`](CHANGELOG.md).

## Installazione

Il repository è privato. Serve un accesso GitHub con permesso di lettura.

```bash
npm install github:marco-vignozzi/reactkit#v0.17.0
npm install react@^19.3.1 react-router@^8.5.1   # peer dependencies
```

Uso:

```ts
import { createApiClient } from "reactkit/app";
import { Layout } from "reactkit/ui";
import "reactkit/ui/themes.css";
import "reactkit/ui/reactkit.css";
```

## Sviluppo

```bash
npm ci
npm run check    # verifica versione, type-check, build in dist/
```

## Versioni

Versionamento semantico. Ogni release è un tag `vX.Y.Z`. La versione deve
coincidere in `package.json`, `src/version.ts` e `CHANGELOG.md`: lo controlla
`npm run check`.
