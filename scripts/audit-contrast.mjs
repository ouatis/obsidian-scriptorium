#!/usr/bin/env node
/**
 * Contrast audit for the Scriptorium theme.
 *
 * The theme is one CSS file holding a token graph: a warm palette, two mode
 * blocks (light/dark), a shared mapping block, and a `body` layer of semantic
 * aliases. Reading ratios off that graph by hand is how the faint tiers drift,
 * so this does it mechanically:
 *
 *   1. parse every `--token: value` declaration and tag the block it sits in
 *      as base / light / dark / shared;
 *   2. build one table per mode (base layer, then the mode's own declarations
 *      and the shared ones, source order deciding within a layer);
 *   3. resolve values through `var()`, `rgb(var(--x))`, `rgba(var(--x), a)`,
 *      `color-mix(in srgb, ...)`, hex/rgb()/hsl() literals down to sRGB;
 *   4. composite translucent paints onto the surface beneath them, then apply
 *      the WCAG 2.x contrast formula to a fixed matrix of role pairs.
 *
 * The semantic task chips are read back out of the CSS itself: their glyph
 * ink lives in an SVG data URI stroke, so the audit checks what ships rather
 * than a copy of the intent. A chip whose rule disappears is reported as
 * unresolved instead of silently passing.
 *
 * A pair whose inputs cannot be resolved is reported as "unresolved" and
 * fails the run: every audited name is defined in this file, so a name that
 * stops resolving means a token was renamed or deleted under the audit.
 *
 * Usage: node scripts/audit-contrast.mjs [src] [--verbose]
 * Exits 1 when an unwaived pair falls below its threshold.
 */

import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const srcPath = args.find((arg) => !arg.startsWith("--")) ?? "src/theme.css";

/* ------------------------------------------------------------------ parse */

function stripComments(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("/*", i)) {
      const end = css.indexOf("*/", i + 2);
      if (end === -1) break;
      out += css.slice(i, end + 2).replace(/[^\n]/g, "");
      i = end + 2;
      continue;
    }
    out += css[i];
    i += 1;
  }
  return out;
}

/** Split a prelude into its individual selectors. */
function selectorsOf(prelude) {
  return prelude
    .replace(/\s+/g, " ")
    .trim()
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Where do a block's declarations belong?
 * A block listing both mode classes is shared; one scoped by a single mode
 * class (alone or as an ancestor) belongs to that mode; everything else is the
 * base layer both modes inherit.
 */
function layerOf(prelude) {
  const selectors = selectorsOf(prelude);
  const light = selectors.some((sel) => sel.includes(".theme-light"));
  const dark = selectors.some((sel) => sel.includes(".theme-dark"));
  if (light && dark) return "shared";
  if (light) return "light";
  if (dark) return "dark";
  return "base";
}

const SKIP_AT_RULE = /@(?:keyframes|-webkit-keyframes|property|container|supports|font-face|page)/;

/** Walk top-level blocks, keeping prelude and body for later queries. */
function parseBlocks(css) {
  const blocks = [];
  let i = 0;
  let depth = 0;
  let preludeStart = 0;
  let bodyStart = 0;
  let prelude = "";

  while (i < css.length) {
    const ch = css[i];

    if (ch === "{") {
      if (depth === 0) {
        prelude = css.slice(preludeStart, i);
        bodyStart = i + 1;
      }
      depth += 1;
      i += 1;
      continue;
    }

    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const isPrint = /@media[^{]*\bprint\b/.test(prelude);
        if (!isPrint && !SKIP_AT_RULE.test(prelude)) {
          blocks.push({
            prelude,
            selectors: selectorsOf(prelude).join(","),
            body: css.slice(bodyStart, i),
            layer: layerOf(prelude),
          });
        }
        preludeStart = i + 1;
      }
      i += 1;
      continue;
    }

    i += 1;
  }

  return blocks;
}

function declarationsOf(blocks) {
  const decls = [];
  for (const block of blocks) {
    for (const match of block.body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;{}]+)/gi)) {
      decls.push({
        name: match[1],
        value: match[2].trim(),
        layer: block.layer,
        prelude: block.selectors,
      });
    }
  }
  return decls;
}

/* --------------------------------------------------------------- resolve */

const clamp = (value, min = 0, max = 255) => Math.min(max, Math.max(min, value));

function splitTopLevel(input) {
  const parts = [];
  let depth = 0;
  let current = "";

  for (const ch of input) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

const NAMED = {
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  transparent: [0, 0, 0, 0],
};

function hexToRgba(hex) {
  const value = hex.slice(1);
  const expand = (part) => parseInt(part.length === 1 ? part + part : part, 16);
  if (value.length === 3 || value.length === 4) {
    return [
      expand(value[0]),
      expand(value[1]),
      expand(value[2]),
      value.length === 4 ? expand(value[3]) / 255 : 1,
    ];
  }
  if (value.length === 6 || value.length === 8) {
    return [
      expand(value.slice(0, 2)),
      expand(value.slice(2, 4)),
      expand(value.slice(4, 6)),
      value.length === 8 ? expand(value.slice(6, 8)) / 255 : 1,
    ];
  }
  return null;
}

function hslToRgba(h, s, l, a) {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = table[Math.floor(hue / 60) % 6];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255, a];
}

function parseAlpha(input, table) {
  if (!input) return 1;
  let raw = input.trim();
  if (raw.startsWith("var(")) {
    const name = raw.slice(4, raw.lastIndexOf(")")).split(",")[0].trim();
    raw = (table?.get(name) ?? "").trim();
    if (!raw) return 1;
  }
  if (raw.endsWith("%")) return clamp(parseFloat(raw) / 100, 0, 1);
  const value = parseFloat(raw);
  return Number.isNaN(value) ? 1 : clamp(value, 0, 1);
}

/** Parse "252, 248, 239" (or "252 248 239 / 0.5") into channels. */
function parseTriplet(input, table) {
  const cleaned = input.replace(/\s*\/\s*/, ", ").replace(/\s+/g, " ");
  const parts = splitTopLevel(cleaned);
  if (parts.length < 3) return null;
  const channels = parts.slice(0, 3).map((part) => parseFloat(part));
  if (channels.some((channel) => Number.isNaN(channel))) return null;
  const alpha = parts.length > 3 ? parseAlpha(parts[3], table) : 1;
  return [...channels.map((channel) => clamp(channel)), alpha];
}

function createResolver(table) {
  const stack = new Set();

  function lookup(name) {
    if (stack.has(name)) return null;
    const raw = table.get(name);
    if (raw === undefined) return null;
    stack.add(name);
    const color = toColor(raw);
    stack.delete(name);
    return color;
  }

  function toColor(input) {
    if (!input) return null;
    const str = input.trim();

    if (str in NAMED) {
      const [r, g, b, a] = NAMED[str];
      return [r, g, b, a];
    }

    if (str.startsWith("#")) return hexToRgba(str);

    if (str.startsWith("var(")) {
      const inner = str.slice(4, str.lastIndexOf(")"));
      const [name, fallback] = splitTopLevel(inner);
      const resolved = lookup(name.trim());
      if (resolved) return resolved;
      if (fallback) return toColor(fallback);
      return null;
    }

    if (str.startsWith("color-mix(")) {
      const inner = str.slice("color-mix(".length, str.lastIndexOf(")"));
      const parts = splitTopLevel(inner);
      const space = parts.shift() ?? "";
      if (!/in\s+srgb/.test(space)) return null;
      const [first, second] = parts;
      const percent = (part) => {
        const match = part.match(/([\d.]+)%\s*$/);
        return match ? parseFloat(match[1]) : null;
      };
      const colorOf = (part) => toColor(part.replace(/[\d.]+%\s*$/, "").trim());
      const a = colorOf(first);
      const b = colorOf(second);
      if (!a || !b) return null;
      let p = percent(first);
      let q = percent(second);
      if (p === null && q === null) {
        p = 50;
        q = 50;
      } else if (p === null) p = 100 - q;
      else if (q === null) q = 100 - p;
      const total = p + q || 1;
      const wa = (p / total) * a[3];
      const wb = (q / total) * b[3];
      const alpha = wa + wb;
      if (alpha === 0) return [0, 0, 0, 0];
      return [
        (a[0] * wa + b[0] * wb) / alpha,
        (a[1] * wa + b[1] * wb) / alpha,
        (a[2] * wa + b[2] * wb) / alpha,
        clamp(alpha, 0, 1),
      ];
    }

    // The theme stores channels as bare triplets (`--gray-100: 32, 28, 19`)
    // and wraps them later with rgb()/rgba(). Accept that shape directly so
    // the chain `rgb(var(--text-primary-rgb))` terminates instead of looping.
    if (/^[\d.\s,/-]+$/.test(str) && (str.match(/,/g) ?? []).length >= 2) {
      return parseTriplet(str, table);
    }

    const fn = str.match(/^(rgba?|hsla?)\(([\s\S]*)\)$/);
    if (fn) {
      const [, kind, inner] = fn;
      const parts = splitTopLevel(inner);
      if (parts[0]?.trim().startsWith("var(")) {
        const head = parts[0].trim();
        const varName = head.slice(4, head.lastIndexOf(")")).split(",")[0].trim();
        const raw = table.get(varName);
        if (raw === undefined) return null;
        const channels = toColor(raw);
        if (!channels) return null;
        const alpha = parts.length > 1 ? parseAlpha(parts[1], table) : 1;
        return [channels[0], channels[1], channels[2], alpha];
      }
      if (kind.startsWith("hsl")) {
        if (parts.length < 3) return null;
        const h = parseFloat(parts[0]);
        const s = parseFloat(parts[1]);
        const l = parseFloat(parts[2]);
        const a = parts.length > 3 ? parseAlpha(parts[3], table) : 1;
        if ([h, s, l].some((value) => Number.isNaN(value))) return null;
        return hslToRgba(h, s, l, a);
      }
      return parseTriplet(inner, table);
    }

    return null;
  }

  return { toColor, token: lookup };
}

/* ------------------------------------------------------------- compositing */

function flatten(color, base) {
  if (!color) return null;
  const [r, g, b, a] = color;
  if (a >= 1) return [r, g, b, 1];
  const under = base ?? [255, 255, 255, 1];
  return [
    r * a + under[0] * (1 - a),
    g * a + under[1] * (1 - a),
    b * a + under[2] * (1 - a),
    1,
  ];
}

function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const scaled = value / 255;
    return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function describe(color) {
  if (!color) return "unresolved";
  const [r, g, b, a] = color.map((value) => Math.round(value * 100) / 100);
  const hex = `#${[r, g, b]
    .map((value) => Math.round(value).toString(16).padStart(2, "0"))
    .join("")}`;
  const flat = a >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
  return `${hex} ${flat}`;
}

/* ---------------------------------------------------------------- matrix */

/**
 * fg / bg are token names (`--x`) or literal colours; `surface` names the
 * backdrop a translucent bg is composited over; `min` is the WCAG threshold:
 * 4.5 body text, 3.0 large text (>=24px or >=18.66px bold) and non-text UI;
 * `waive` documents a deliberate exception.
 */
const PAIRS = [
  { id: "prose/paper", fg: "--text-primary", bg: "--scrip-surface-paper", min: 4.5 },
  { id: "prose/app", fg: "--text-primary", bg: "--background", min: 4.5 },
  { id: "ink-soft/paper", fg: "--scrip-ink-soft", bg: "--scrip-surface-paper", min: 4.5 },
  { id: "ink-faint/paper", fg: "--scrip-ink-faint", bg: "--scrip-surface-paper", min: 4.5 },
  { id: "muted/paper", fg: "--text-muted", bg: "--scrip-surface-paper", min: 4.5 },
  {
    id: "faint/paper",
    fg: "--text-faint",
    bg: "--scrip-surface-paper",
    min: 4.5,
    waive: "decorative tier: timestamps and gutters, not prose",
  },
  { id: "h3/paper", fg: "--h3-color", bg: "--scrip-surface-paper", min: 3 },
  { id: "h4/paper", fg: "--h4-color", bg: "--scrip-surface-paper", min: 3 },
  { id: "h5/paper", fg: "--h5-color", bg: "--scrip-surface-paper", min: 3 },
  { id: "link/paper", fg: "--link-color-base", bg: "--scrip-surface-paper", min: 4.5 },
  { id: "link-hover/paper", fg: "--link-color-hover", bg: "--scrip-surface-paper", min: 4.5 },
  {
    id: "mark-text/mark",
    fg: "--text-normal",
    bg: "--text-mark-subtle",
    surface: "--scrip-surface-paper",
    min: 4.5,
  },
  {
    id: "tag-text/tag",
    fg: "--tag-color",
    bg: "--tag-background",
    surface: "--scrip-surface-paper",
    min: 4.5,
  },
  { id: "on-accent/accent", fg: "--text-on-accent", bg: "--interactive-accent", min: 4.5 },
  { id: "code-keyword/code", fg: "--scrip-syntax-keyword", bg: "--scrip-syntax-surface", min: 4.5 },
  { id: "code-string/code", fg: "--scrip-syntax-string", bg: "--scrip-syntax-surface", min: 4.5 },
  { id: "code-number/code", fg: "--scrip-syntax-number", bg: "--scrip-syntax-surface", min: 4.5 },
  { id: "code-comment/code", fg: "--scrip-syntax-comment", bg: "--scrip-syntax-surface", min: 4.5 },
  { id: "code-function/code", fg: "--scrip-syntax-function", bg: "--scrip-syntax-surface", min: 4.5 },
];

/* ------------------------------------------- semantic chips, read back out */

const CHIPS = [
  { char: "!", fill: "--color-warning-rgb" },
  { char: "?", fill: "--color-secondary" },
  { char: ">", fill: "--interactive" },
];

/**
 * Last `:checked` rule for a chip character. A dark-mode override wins when it
 * exists; otherwise the shared rule applies to both modes and is used for both.
 */
function chipRule(blocks, char, dark) {
  let shared = null;
  let darkRule = null;
  for (const block of blocks) {
    if (!block.selectors.includes(`[data-task="${char}"]`)) continue;
    if (!block.selectors.includes(":checked")) continue;
    if (!block.selectors.includes(".task-list-item-checkbox")) continue;
    if (block.selectors.includes(".theme-dark")) darkRule = block;
    else shared = block;
  }
  return dark ? darkRule ?? shared : shared;
}

/** The cancelled chip must carry no glyph at all — empty box plus strike. */
function cancelledCleared(blocks) {
  let found = null;
  for (const block of blocks) {
    if (!block.selectors.includes('[data-task="-"]')) continue;
    if (!block.selectors.includes(".task-list-item-checkbox")) continue;
    if (block.selectors.includes(".theme-dark")) continue;
    found = block;
  }
  if (!found) return { ok: false, reason: "no rule for [data-task=\"-\"]" };
  if (!/background-image\s*:\s*none/.test(found.body)) {
    return { ok: false, reason: "cancelled chip still paints a glyph" };
  }
  return { ok: true };
}

function chipInk(block) {
  const match = block?.body.match(/stroke='%23([0-9a-fA-F]{6})'/);
  return match ? `#${match[1]}` : null;
}

/* -------------------------------------------------------------------- run */

const css = stripComments(await readFile(srcPath, "utf8"));
const blocks = parseBlocks(css);
const decls = declarationsOf(blocks);

const tableFor = (mode) => {
  const table = new Map();
  for (const layer of ["base", mode, "shared"]) {
    for (const decl of decls) {
      if (decl.layer === layer) table.set(decl.name, decl.value);
    }
  }
  return table;
};

const MODES = ["light", "dark"];
const rows = [];

for (const mode of MODES) {
  const table = tableFor(mode);
  const resolver = createResolver(table);
  const paper = flatten(resolver.token("--scrip-surface-paper"), null);

  for (const pair of PAIRS) {
    const bgSurface = pair.surface ? flatten(resolver.token(pair.surface), null) : paper;
    const fgRaw = pair.fg.startsWith("--") ? resolver.token(pair.fg) : resolver.toColor(pair.fg);
    const bgRaw = pair.bg.startsWith("--") ? resolver.token(pair.bg) : resolver.toColor(pair.bg);
    const fg = flatten(fgRaw, bgSurface);
    const bg = flatten(bgRaw, bgSurface);

    if (!fg || !bg) {
      rows.push({ mode, id: pair.id, status: "unresolved" });
      continue;
    }

    const ratio = contrast(fg, bg);
    const status = pair.waive ? "waived" : ratio >= pair.min ? "ok" : "FAIL";
    rows.push({ mode, id: pair.id, ratio, min: pair.min, fg, bg, status, waive: pair.waive });
  }

  for (const chip of CHIPS) {
    const rule = chipRule(blocks, chip.char, mode === "dark");
    const ink = chipInk(rule);
    const fill = flatten(resolver.token(chip.fill), paper);
    if (!ink || !fill) {
      rows.push({ mode, id: `glyph ${chip.char}`, status: "unresolved" });
      continue;
    }

    const fg = hexToRgba(ink);
    const ratio = contrast(fg, fill);
    rows.push({
      mode,
      id: `glyph ${chip.char}`,
      ratio,
      min: 3,
      fg,
      bg: fill,
      status: ratio >= 3 ? "ok" : "FAIL",
      note: `drawn on ${chip.fill}`,
    });
  }
}

const cancelled = cancelledCleared(blocks);
for (const mode of MODES) {
  rows.push({
    mode,
    id: "glyph -",
    status: cancelled.ok ? "ok" : "FAIL",
    min: 0,
    note: cancelled.ok ? "cleared: empty box plus strike" : cancelled.reason,
  });
}

const width = Math.max(...rows.map((row) => row.id.length));
for (const mode of MODES) {
  console.log(`\n${mode}`);
  for (const row of rows.filter((entry) => entry.mode === mode)) {
    const label = row.id.padEnd(width);
    if (row.status === "unresolved") {
      console.log(`  ${label}  unresolved`);
      continue;
    }
    if (row.ratio === undefined) {
      const mark = row.status === "FAIL" ? "FAIL" : "ok";
      console.log(`  ${label}  ${"".padStart(9)}  ${mark}  — ${row.note}`);
      continue;
    }
    const ratio = `${row.ratio.toFixed(2)}:1`.padStart(8);
    const mark = row.status === "FAIL" ? "FAIL" : row.status === "waived" ? "waive" : "ok";
    const note = row.waive ? `  — ${row.waive}` : row.note ? `  — ${row.note}` : "";
    console.log(`  ${label} ${ratio}  >= ${row.min}  ${mark}${note}`);
    if (verbose) {
      console.log(`  ${" ".repeat(width)}  fg ${describe(row.fg)}  bg ${describe(row.bg)}`);
    }
  }
}

const failures = rows.filter((row) => row.status === "FAIL");
const unresolved = rows.filter((row) => row.status === "unresolved");
const waived = rows.filter((row) => row.status === "waived");
const passing = rows.filter((row) => row.status === "ok");

console.log(
  `\n${rows.length} checks: ${passing.length} ok, ${waived.length} waived, ` +
    `${unresolved.length} unresolved, ${failures.length} failing`,
);

for (const row of unresolved) {
  console.error(`! ${row.mode} ${row.id}: an input resolves outside this file`);
}

if (failures.length > 0 || unresolved.length > 0) {
  if (unresolved.length > 0) {
    console.error(
      "✗ an audited token no longer resolves in src/theme.css — a renamed or " +
        "deleted token is a contrast regression we cannot measure",
    );
  }
  for (const row of failures) {
    console.error(
      row.ratio === undefined
        ? `✗ ${row.mode} ${row.id}: ${row.note}`
        : `✗ ${row.mode} ${row.id}: ${row.ratio.toFixed(2)}:1 < ${row.min}:1`,
    );
  }
  process.exit(1);
}