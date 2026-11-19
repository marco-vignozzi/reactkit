// The version in package.json, src/version.ts and the changelog must be the same.
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8")).version;
const code = readFileSync("src/version.ts", "utf8").match(/VERSION = "([^"]+)"/)?.[1];
const changelog = readFileSync("CHANGELOG.md", "utf8");
const errors = [];
if (code !== pkg) errors.push(`src/version.ts (${code}) != package.json (${pkg})`);
if (!changelog.includes(`## ${pkg} `)) errors.push(`CHANGELOG.md has no section for ${pkg}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`version ${pkg} consistent`);
