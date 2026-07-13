# SCRIPTORIUM Maintenance Notes

This file exists because parts of the legacy inline CSS comments were saved with a broken encoding and are no longer reliable as maintenance documentation.

## Theme Intent

SCRIPTORIUM is a full Obsidian theme focused on:

- readability
- paper-like tactility
- calm visual rhythm
- warm editorial atmosphere

It is designed as a coherent theme system rather than a small visual tweak.

## Module Map

- `[01]` Design Tokens
- `[02]` Shadows & Theme Colors
- `[03]` Theme Mapping
- `[04]` App Canvas & Global Semantics
- `[05]` Workspace Tokens & Typography
- `[06]` Markdown Layout
- `[07]` Markdown Elements
- `[08]` Navigation
- `[09]` Workspace Auto-hide & Window States
- `[10]` Buttons
- `[11]` Modals
- `[12]` Reserved
- `[13]` Callouts
- `[14]` Embedded Notes

## Recent Maintenance Changes

The 0.10.0 **GPT-5.6 Sol "极高" update** focused on making the theme more coherent across dark mode, split panes, keyboard navigation, and mobile reading:

1. Dark-mode text accents were separated from CTA fill colors, raising body-link, heading, and secondary-color contrast without weakening white text on buttons.
2. Workspace auto-hide behavior now follows one hover/focus recovery contract; status items remain in the focus order, and an empty compact status bar keeps a visible affordance.
3. The strong editorial rule is reserved for the inline title, while H1 uses a quieter rule and H2 relies on typography and spacing.
4. Viewport-scaled headings and paragraph spacing were replaced by a fixed scale plus a Markdown-pane container query for narrow splits.
5. Unused SCRIPTORIUM variables and retired custom underline tokens were removed.
6. Tags were flattened, mobile texture was disabled, and phone reading surfaces now use edge-to-edge geometry.

Properties remain intentionally conservative: color and focus affordance may be tuned, but native layout and input controls should not be overridden.

The 0.9.9 maintenance pass focused on keeping links readable without fighting Obsidian's native underline behavior:

1. Link color contrast was tightened so inline links stand out more clearly in long-form notes.
2. The theme now relies on Obsidian's native underline style instead of layering a custom one.
3. Unresolved links were kept readable without making them compete with regular links.

The 0.9.8 maintenance pass focused on the live Scriptorium patch used in the JARDIN vault:

1. The status bar now uses a compact capsule that expands on hover or focus.
2. Left sidebar vault/profile controls and panel header buttons now stay quiet until needed, while focus-within states keep them recoverable.
3. Mobile table rules were relaxed so narrow screens can wrap dense cells instead of forcing wide horizontal overflow.
4. Reduced-motion handling now covers the main interaction transitions, not only modal entrance animation.

The 0.9.5 maintenance pass focused on writing-first readability, calmer chrome, and clearer component roles:

1. Light-mode accent contrast was tightened so body-sized interactive text remains readable on the paper-toned background.
2. Link states were made easier to distinguish for long-form note reading.
3. Paragraph justification was kept for prose but relaxed in structured contexts such as lists, callouts, embeds, tables, and tag-heavy paragraphs.
4. Interface typography was split more deliberately so operational UI surfaces scan faster without flattening the document voice.
5. The inline title width was relaxed so ordinary note titles no longer wrap too early on wide panes.
6. Suggestion rows were separated from button styling so command and search lists stay flatter and more stable.
7. The status bar compact state now keeps a readable affordance instead of hiding all state entirely.
8. Blockquotes, callouts, and embeds were separated into lighter quote, quiet note, and reference-block roles.
9. Tags were quieted into small writing markers rather than tactile button-like chips.
10. New stable comments and companion maintenance docs were added near actively maintained sections.
11. Later cleanup passes reduced decorative texture, softened callout emphasis, and flattened tags for a cleaner reading surface.

## Design Guidance

When editing the theme, preserve these principles:

- Keep the warm paper palette restrained.
- Keep the surface clean enough that texture supports the page instead of competing with it.
- Prefer typographic hierarchy over heavy chrome.
- Keep auto-hide behavior limited, predictable, and easy to ignore when reading.
- Use accent colors carefully when they carry semantic meaning in body-sized text.
- Keep callouts, embeds, and floating UI aligned with the same material language, but avoid making routine operational UI feel like stacked cards.
- Keep tags quiet enough to annotate prose without competing with headings or links.
- Treat reading comfort as more important than decorative novelty.

## Known Maintenance Debt

- Some historical inline comments may still reflect older wording or pre-cleanup structure.
- Those comments do not affect runtime behavior.
- When adding or replacing comments, prefer plain ASCII English notes unless the file encoding policy is intentionally normalized first.
- Keep the English README as the default GitHub entry point and mirror Chinese copy in `README.zh-CN.md`.
