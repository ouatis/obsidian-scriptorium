<div align="center">

# Scriptorium

_A quiet desk for long thoughts._

[Chinese](./README.zh-CN.md) | [Japanese](./README.ja.md)

<a href="https://community.obsidian.md/themes/scriptorium"><img src="img/open-in-obsidian-button.svg" alt="Open Scriptorium in Obsidian" width="150"></a>

<p>
  <img src="https://img.shields.io/github/v/release/ouatis/obsidian-scriptorium?style=flat-square&label=version&color=c24e24" alt="Latest release">
  <img src="https://img.shields.io/github/downloads/ouatis/obsidian-scriptorium/total?style=flat-square&logo=obsidian&logoColor=white&label=downloads&color=e3a33b" alt="Downloads">
  <img src="https://img.shields.io/github/license/ouatis/obsidian-scriptorium?style=flat-square&label=license&color=406e40" alt="MIT License">
</p>

<img src="./screenshot.png" alt="Scriptorium screenshot" width="720">

</div>

A warm, minimal Obsidian theme for long-form reading and writing.

Scriptorium keeps the writing surface primary: soft paper tones, restrained contrast, quiet workspace chrome, flatter tags and callouts, and typography tuned for mixed CJK and Latin notes.

> [!NOTE]
> Scriptorium is a personal aesthetic. It does not aim to support the `Style Settings` plugin.

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

## Development

The readable source lives in `src/theme.css`. Edit it, then run `npm run build` — esbuild minifies it into the shipped `theme.css`, which keeps the file lean for the community-store size check. `npm run lint` runs stylelint against the source.

Created by [@ouatis](https://github.com/ouatis/). Inspired by [Sanctum](https://github.com/jdanielmourao/obsidian-sanctum) and [Baseline](https://github.com/aaaaalexis/obsidian-baseline).
