// Copies the stylesheets next to the compiled JavaScript (tsc does not emit CSS).
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";

mkdirSync("dist/ui", { recursive: true });
for (const name of readdirSync("src/ui")) {
  if (name.endsWith(".css")) copyFileSync(`src/ui/${name}`, `dist/ui/${name}`);
}
