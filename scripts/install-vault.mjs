import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.join(here, "..");
const defaultVault =
  process.platform === "win32"
    ? "D:/JARDIN"
    : path.join(os.homedir(), "Documents", "JARDIN");
const vault = process.argv[2] ?? process.env.SCRIP_VAULT ?? defaultVault;

const from = path.join(project, "theme.css");
if (!fs.existsSync(from)) {
  console.error('  MISSING theme.css — run "npm run build" first');
  process.exit(1);
}

const destDir = path.join(vault, ".obsidian", "snippets");
const dest = path.join(destDir, "scriptorium-test-patch.css");
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(from, dest);

const a = fs.readFileSync(from);
const b = fs.readFileSync(dest);
const same = a.equals(b);
console.log(
  `  ${same ? "ok  " : "FAIL"} theme.css  ${(a.length / 1024).toFixed(1)}KB -> ${dest}`,
);
process.exit(same ? 0 : 1);
