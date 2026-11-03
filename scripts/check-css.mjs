#!/usr/bin/env node
/**
 * Guard against CSS that esbuild accepts but a browser/community-review parser rejects.
 *
 * 0.17.0 shipped a theme.css containing two stray close-comment tokens: the
 * generator wrote "end" markers without an opening comment, esbuild stripped
 * comments but kept the bare closers, and Obsidian's review scanner reported
 * "CSS parse error: undefined".
 *
 * The check is read-only. It scans comment markers itself and asks stylelint
 * (already a devDependency) to parse the built file.
 *
 * Usage: node scripts/check-css.mjs [src] [built]
 */

import { readFile } from "node:fs/promises";
import stylelint from "stylelint";

const [srcPath = "src/theme.css", outPath = "theme.css"] = process.argv.slice(2);

const OPEN = "/*";
const CLOSE = "*/";

function scanCommentMarkers(css) {
  let open = 0;
  let close = 0;
  let stray = 0;
  let inComment = false;
  let quote = null;
  let i = 0;

  while (i < css.length) {
    const ch = css[i];

    if (inComment) {
      if (css.startsWith(CLOSE, i)) {
        close += 1;
        inComment = false;
        i += CLOSE.length;
      } else {
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (ch === "\\") {
        i += 2;
      } else if (ch === quote) {
        quote = null;
        i += 1;
      } else {
        i += 1;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      i += 1;
      continue;
    }

    if (css.startsWith(OPEN, i)) {
      open += 1;
      inComment = true;
      i += OPEN.length;
      continue;
    }

    if (css.startsWith(CLOSE, i)) {
      stray += 1;
      close += 1;
      i += CLOSE.length;
      continue;
    }

    i += 1;
  }

  return { open, close, stray, unclosed: inComment ? 1 : 0 };
}

const problems = [];
const successes = [];

async function readText(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    problems.push(`${path}: cannot read (${error.message})`);
    return null;
  }
}

const src = await readText(srcPath);
if (src !== null) {
  const markers = scanCommentMarkers(src);

  if (markers.stray > 0) {
    problems.push(`${srcPath}: ${markers.stray} stray close-comment marker(s) outside a comment`);
  }
  if (markers.unclosed > 0) {
    problems.push(`${srcPath}: unclosed comment at end of file`);
  }
  if (markers.open !== markers.close) {
    problems.push(
      `${srcPath}: comment markers unbalanced (open ${markers.open}, close ${markers.close})`,
    );
  }
  successes.push(`${srcPath}: ${markers.open} comments, markers balanced`);
}

const out = await readText(outPath);
if (out !== null) {
  const markers = scanCommentMarkers(out);
  if (markers.open > 0 || markers.close > 0 || markers.stray > 0 || markers.unclosed > 0) {
    problems.push(
      `${outPath}: expected no comment markers in minified output ` +
        `(open ${markers.open}, close ${markers.close}, stray ${markers.stray})`,
    );
  }

  try {
    const result = await stylelint.lint({ code: out, config: { rules: {} } });
    const syntaxErrors = result.results.flatMap((file) =>
      file.warnings.filter((warning) => warning.rule === "CssSyntaxError"),
    );

    for (const error of syntaxErrors) {
      problems.push(`${outPath}:${error.line}:${error.column} ${error.text}`);
    }
    if (result.errored && syntaxErrors.length === 0) {
      const details = result.results
        .flatMap((file) =>
          file.warnings.map((warning) => `${warning.line}:${warning.column} ${warning.text}`),
        )
        .join("; ");
      problems.push(`${outPath}: stylelint reported an error${details ? ` — ${details}` : ""}`);
    }
  } catch (error) {
    problems.push(`${outPath}: stylelint could not parse the file (${error.message})`);
  }

  successes.push(`${outPath}: no comment markers, parses as CSS (${Buffer.byteLength(out)} bytes)`);
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`✗ ${problem}`);
  }
  process.exit(1);
}

for (const success of successes) {
  console.log(`✓ ${success}`);
}
