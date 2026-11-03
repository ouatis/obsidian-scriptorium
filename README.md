<div align="center">

# Scriptorium

_A quiet desk for long thoughts._

[Chinese](./README.zh-CN.md) | [Japanese](./README.ja.md)

<a href="https://community.obsidian.md/themes/scriptorium"><img src="img/open-in-obsidian-button.svg" alt="Open Scriptorium in Obsidian" width="150"></a>

<p>
  <img src="https://img.shields.io/github/v/release/ouatis/obsidian-scriptorium?style=flat-square&label=version&color=c24e18" alt="Latest release">
  <img src="https://img.shields.io/github/downloads/ouatis/obsidian-scriptorium/total?style=flat-square&logo=obsidian&logoColor=white&label=downloads&color=6d665d" alt="Downloads">
  <img src="https://img.shields.io/github/license/ouatis/obsidian-scriptorium?style=flat-square&label=license&color=406e40" alt="MIT License">
</p>

</div>

![](img/hero.png)

A warm, minimal Obsidian theme for long-form reading and writing.

![Light and dark: the same voice on both papers.](img/colors.png)

![On mobile: the reading view folds into a single quiet column.](img/mobile.png)

Scriptorium keeps the writing surface primary: soft paper tones, restrained contrast, quiet workspace chrome, flatter tags and callouts, and typography tuned for mixed CJK and Latin notes.

Paper, light and connections: Scriptorium shares quiet shapes and a visual rhythm with Desk Lamp, Skill Switchboard and Collate. Each product works independently; the theme does not require any of the plugins.

> [!NOTE]
> Scriptorium is a personal aesthetic. A small curated surface is exposed through the `Style Settings` plugin; everything else stays in the token contract (see [snippet-example.css](snippet-example.css)).

## Install

1. Search for `Scriptorium` in Obsidian Community Themes.
2. Click **Install and use**.

Manual install: copy `theme.css` and `manifest.json` into `.obsidian/themes/Scriptorium/`, then select `Scriptorium` in Appearance -> Themes.

## Design

- Scriptorium is drawn in the IBM Plex family — install [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans), [IBM Plex Serif](https://fonts.google.com/specimen/IBM+Plex+Serif) and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (or the [full IBM Plex release](https://github.com/IBM/plex/releases)) and they apply automatically.
- Set a different font in Appearance and your choice leads the stack; IBM Plex and the CJK fallbacks follow.
- Document surfaces stay light: texture, shadow, and accent color are deliberately restrained.
- Navigation, search, menus, tags, callouts, and embeds stay quiet so prose remains central.
- The theme ships as a single `theme.css` with no external dependencies.
- Interface chrome icons (quick switcher, graph, calendar, canvas, database, settings, search and more) and callout icons are drawn in the Phosphor line language; same-shape icons, plugin icons and directional glyphs stay native.

## Design Principles

Guidelines the theme is edited against, kept for future maintenance:

- Keep the warm paper palette restrained.
- Keep the surface clean enough that texture supports the page instead of competing with it.
- Prefer typographic hierarchy over heavy chrome.
- Keep auto-hide behavior limited, predictable, and easy to ignore when reading.
- Use accent colors carefully when they carry semantic meaning in body-sized text.
- Keep callouts, embeds, and floating UI aligned with the same material language, but avoid making routine operational UI feel like stacked cards.
- Keep tags quiet enough to annotate prose without competing with headings or links.
- Treat reading comfort as more important than decorative novelty.

## Customization

Two opt-in surfaces, nothing else — notes render identically without either.

With the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin installed, four reading-critical controls appear: reading line width, prose line height, paragraph spacing, and the heading typeface. Defaults equal the theme's own values.

Per-file helper classes go in the `cssClasses` frontmatter key and compose:

| Class | Effect |
| --- | --- |
| `cards` | Dataview tables become card grids (`cards-cols-1/3/4` fixes columns) |
| `row-lines` / `col-lines` / `table-lines` | Cell borders: rows, columns, full grid |
| `row-alt` | Striped table rows |
| `table-tabular` | Tabular figures for numeric columns |
| `table-nowrap` | No wrapping in cells |
| `table-fixed` | Equalized column widths |
| `table-compact` | Smaller, tighter tables |
| `[!]` `[?]` `[>]` `[-]` in tasks | Semantic task markers: amber, green, copper, and struck-muted chips — in reading and live preview |

## Plugin support

Structural styling only — panes and cards from [Dataview](https://github.com/blacksmithgu/obsidian-dataview), [Tasknotes](https://github.com/alangrainger/obsidian-task-notes), [Quiet Outline](https://github.com/guopenghui/obsidian-quiet-outline) and the [Advanced Table Editor](https://github.com/dromar56/obsidian-advanced-table-editor) inherit the theme's surfaces and borders. No plugin is re-colored or re-laid-out.

## Development

The readable source lives in `src/theme.css`. Edit it, then run `npm run build` — esbuild minifies it into the shipped `theme.css`, which keeps the file lean for the community-store size check. `npm run lint` runs stylelint against the source.

Personal adjustments go through CSS snippets — [snippet-example.css](snippet-example.css) is a commented tour of the tokens a snippet may safely touch, with the palette ramps and the override tiers explained.

Created by [@ouatis](https://github.com/ouatis/). Inspired by [Sanctum](https://github.com/jdanielmourao/obsidian-sanctum) and [Baseline](https://github.com/aaaaalexis/obsidian-baseline).
