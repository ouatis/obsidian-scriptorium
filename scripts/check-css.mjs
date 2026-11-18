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
 * Exactly one comment may and must survive: the /*! @settings declaration at
 * the top of both files. esbuild keeps /*! legal comments; Style Settings reads
 * that declaration from the shipped stylesheet. A build that drops it leaves
 * an empty panel, so losing it is a hard failure, not a silent regression.
 * Every other comment is still forbidden in both files.
 *
 * Usage: node scripts/check-css.mjs [src] [built]
 */

import { readFile } from "node:fs/promises";
import stylelint from "stylelint";

const [srcPath = "src/theme.css", outPath = "theme.css"] = process.argv.slice(2);

const SIZE_BUDGET = 160 * 1024;

const OPEN = "/*";
const CLOSE = "*/";

// esbuild preserves /*! legal comments, and Style Settings parses them from the
// loaded stylesheet. Require the declaration to lead the file, and require the
// four reading controls to still be present (a truncated block is a regression).
const LEGAL_SETTINGS = /^\/\*![ \t]*@settings[\r\n]+[\s\S]*?\*\//;
const REQUIRED_IDS = [
  "file-line-width",
  "scrip-line-height-prose",
  "density-modifier",
  "scrip-font-heading-stack",
];

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

function splitSettings(css, label) {
  const match = css.match(LEGAL_SETTINGS);
  if (!match) {
    problems.push(
      `${label}: missing the leading /*! @settings declaration — Style Settings would show an empty panel`,
    );
    return null;
  }
  const block = match[0];
  for (const id of REQUIRED_IDS) {
    if (!block.includes(`id: ${id}`)) {
      problems.push(`${label}: @settings declaration lost the "${id}" control`);
    }
  }
  return { block, body: css.slice(block.length) };
}

function forbidOtherComments(css, label, kind) {
  const markers = scanCommentMarkers(css);
  if (markers.open > 0 || markers.close > 0 || markers.stray > 0 || markers.unclosed > 0) {
    problems.push(
      `${label}: unexpected ${kind} comment(s) after the @settings declaration ` +
        `(open ${markers.open}, close ${markers.close}, stray ${markers.stray})`,
    );
    return false;
  }
  return true;
}

const src = await readText(srcPath);
if (src !== null) {
  const split = splitSettings(src, srcPath);
  if (split !== null) {
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
    if (forbidOtherComments(split.body, srcPath, "source")) {
      successes.push(`${srcPath}: 1 @settings legal comment, no other comments, markers balanced`);
    }
  }
}

const out = await readText(outPath);
if (out !== null) {
  const split = splitSettings(out, outPath);
  let bodyOk = false;
  if (split !== null) {
    bodyOk = forbidOtherComments(split.body, outPath, "minified");
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

  const bytes = Buffer.byteLength(out);
  if (bytes > SIZE_BUDGET) {
    problems.push(
      `${outPath}: ${bytes} bytes — over the ${SIZE_BUDGET}-byte (160 KiB) budget ` +
        `by ${bytes - SIZE_BUDGET}. Trim or split styles: stylesheet size is typing latency.`,
    );
  }

  if (split !== null && bodyOk) {
    successes.push(
      `${outPath}: @settings declaration intact, no other comment markers, ` +
        `parses as CSS (${bytes} bytes, within the 160 KiB budget)`,
    );
  }
}

const snippetPath = "snippet-example.css";
const snippet = await readText(snippetPath);
if (snippet !== null) {
  const markers = scanCommentMarkers(snippet);
  let snippetOk = true;
  if (markers.stray > 0) {
    problems.push(`${snippetPath}: ${markers.stray} stray close-comment marker(s) outside a comment`);
    snippetOk = false;
  }
  if (markers.unclosed > 0) {
    problems.push(`${snippetPath}: unclosed comment at end of file`);
    snippetOk = false;
  }
  if (markers.open !== markers.close) {
    problems.push(`${snippetPath}: comment markers unbalanced (open ${markers.open}, close ${markers.close})`);
    snippetOk = false;
  }
  try {
    const result = await stylelint.lint({ code: snippet, config: { rules: {} } });
    const syntaxErrors = result.results.flatMap((file) =>
      file.warnings.filter((warning) => warning.rule === "CssSyntaxError"),
    );
    for (const error of syntaxErrors) {
      problems.push(`${snippetPath}:${error.line}:${error.column} ${error.text}`);
      snippetOk = false;
    }
  } catch (error) {
    problems.push(`${snippetPath}: stylelint could not parse the file (${error.message})`);
    snippetOk = false;
  }
  if (snippetOk) {
    successes.push(`${snippetPath}: comment markers balanced, parses as CSS`);
  }
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
