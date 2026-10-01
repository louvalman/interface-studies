---
name: Interface Studies — index, September 2026
description: The landing page as it stood on main at db496b6 (tag index-2026-09), kept as a record of that design.
colors:
  paper: "#f5f4f1"
  page-base: "#fcfbf8"
  surface: "#fbfaf8"
  well: "#f3f2ef"
  ink: "#17181a"
  ink-soft: "#55565a"
  muted: "#6c6b67"
  note: "#61625f"
  hairline: "rgba(23, 24, 26, 0.1)"
  hairline-strong: "rgba(23, 24, 26, 0.22)"
  accent: "#ac512d"
  chip-bg: "rgba(251, 250, 248, 0.72)"
  chip-over-preview: "rgba(251, 250, 248, 0.88)"
  chip-over-preview-strong: "rgba(251, 250, 248, 0.92)"
  chip-over-preview-ink: "#3a3b3e"
  scrim: "rgba(23, 24, 26, 0.42)"
  paper-dark: "#121316"
  surface-dark: "#191b1e"
  well-dark: "#191b1e"
  ink-dark: "#e9e8e4"
  ink-soft-dark: "#a4a39f"
  muted-dark: "#7e7d79"
  note-dark: "#9a9995"
  hairline-dark: "rgba(233, 232, 228, 0.11)"
  hairline-strong-dark: "rgba(233, 232, 228, 0.26)"
  accent-dark: "#e08453"
  chip-bg-dark: "rgba(30, 32, 36, 0.72)"
  chip-over-preview-dark: "rgba(16, 17, 20, 0.82)"
  chip-over-preview-ink-dark: "#dcdbd6"
  on-ink-bg-dark: "#dedcd6"
  on-ink-fg-dark: "#131417"
  scrim-dark: "rgba(6, 7, 9, 0.72)"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  lede:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.4vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
  card-title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  panel-title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    letterSpacing: "-0.015em"
  blurb:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  note:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    letterSpacing: "0.14em"
  label-strong:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.16em"
  value:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
rounded:
  hairline: "2px"
  sm: "0.25rem"
  thumb: "0.5rem"
  card: "1rem"
  panel: "1.25rem"
  pill: "999px"
spacing:
  gutter: "clamp(1.5rem, 6vw, 6rem)"
  rail-gap: "clamp(1rem, 2vw, 1.75rem)"
  card-w: "21rem"
  card-w-phone: "16.5rem"
  preview-w: "480px"
  preview-h: "600px"
components:
  card-frame:
    backgroundColor: "{colors.well}"
    rounded: "{rounded.card}"
    width: "{spacing.card-w}"
  chip-over-preview:
    backgroundColor: "{colors.chip-over-preview}"
    textColor: "{colors.chip-over-preview-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.35em 0.75em"
  filter-chip:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 0.75rem"
  filter-chip-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 0.75rem"
  rail-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "2.75rem"
  view-switch-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    size: "2.25rem"
  quick-look-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    width: "{spacing.preview-w}"
  link-out:
    textColor: "{colors.accent}"
    typography: "{typography.label-strong}"
---

# Interface Studies — index, September 2026

This is the landing page as it stood on `main` at commit `db496b6`, tagged
`index-2026-09`. The page beside this file is a runnable copy of it: main's
`index.html`, `index.css` and `index.js`, with only their paths moved two
folders down and the head marked `noindex`. It frames the studies as they are
now, not as they were then, so the cards show today's components inside the
old chrome.

It is kept so the design can be pointed at: from a study, from the Figma file,
or from a later version of the index that wants to say what it changed. The
record is the design, not the rules — the rules live in the repo's `CLAUDE.md`,
which has moved on since.

## Overview

A notebook's index of live components. The page opened on a stacked masthead —
the site mark on a line of its own, a large two-line headline, a lede, and a
row of mono facts — and under it a full-width rail of cards, each running its
study's `preview.html` in an iframe at a fixed logical size. The rail drifted
on its own, looped, and performed its cards in a wave.

The character is matte paper and ink: a warm off-white ground with a faint
wash and grain, near-black type, one terracotta accent kept for links that
leave the site, and hairline edges rather than filled surfaces. Two families
carried two voices: a geometric sans for prose and titles, a monospace for
every fact and label.

## Colors

Two themes, one token set: the dark theme redeclares the same names under
`:root[data-theme="dark"]` and nothing else. The frontmatter gives the dark
values with a `-dark` suffix.

- **Paper and ink.** `paper` #f5f4f1 under `ink` #17181a; dark inverts to
  #121316 under #e9e8e4. No pure black, no pure white in either.
- **Three greys for text.** `ink-soft` for prose, `note` for card notes,
  `muted` for labels and facts.
- **One accent.** `accent` #ac512d (dark #e08453), for the things that leave
  the page: the Figma link, "Open demo", quick look's links.
- **Hairlines, not fills.** Edges are `hairline` and `hairline-strong`
  alphas of the ink.
- **The well.** `well` equals every preview's ground, so a card's skeleton
  dissolves into its thumbnail instead of stepping to it.

What a later audit measured in this palette, for the record: dark `muted` was
4.51:1 on the page and 4.19:1 on the quick-look panel, under the 4.5:1 floor
there; the filter chips' counts were their label at 0.55 opacity, about 2.2:1
in both themes; the forthcoming slots' year was set in the hairline colour,
about 2:1.

## Typography

- **Plus Jakarta Sans**, 400/500/600, for the headline, the lede, card
  titles and notes, the footer's prose.
- **JetBrains Mono**, 400, for every label and fact: the site mark, the
  count, the filter chips, card types and numbers, slugs, calls to action, the
  meta row, quick look's labels.
- **Two micro sizes**, 10px (`label`) and 11px (`label-strong`), both
  uppercase and letter-spaced. The 10px size carried the controls as well as
  the facts — EN/DA, the filter chips, the quick-look chip.
- The headline ran to 64px at the top of its clamp, balanced over two lines,
  tracked at -0.03em.

## Layout

- **Stacked masthead**, max 64rem wide, top padding up to 7rem: mark, headline,
  lede, then a meta row of two items, "Latest" (the newest study's month) and
  "Figma" (the Community file link). At 1470x802 it put the first card's top
  at y=627, 27% of the card on screen.
- **Language and theme controls** absolutely positioned in the top-right
  corner, on the page gutter.
- **The rail's head**, a grid of two rows: the count on the first, the filter
  chips on the second, the carousel controls and the rail/list switch spanning
  both on the right and bottom-aligned to the chips. Below 52rem it restacked
  with the controls beside the count and the chips full width.
- **The rail**, full bleed, cards 336px wide (264px below 40rem) at a 4:5
  frame, `rail-gap` apart, snapping to the gutter, closed by a 2px progress
  rule.
- **The list view**, the same cards re-laid as rows with a small live
  thumbnail, with column heads above 64rem.
- **The footer**, a statement and a meta list side by side, stacking below
  52rem.

## Elevation & Depth

Three shadows, all soft and offset downward, none of them a halo:
`shadow-card` 0 1px 2px at 4% ink for a card at rest, `shadow-lift`
0 22px 46px -20px at 32% for a hovered card, `shadow-panel` 0 40px 80px -32px
at 50% for quick look. Dark deepens each. Chips over a thumbnail used a 6px
backdrop blur; the quick-look scrim a 3px one.

## Shapes

Round and soft without being bubbly: cards at 1rem, the quick-look panel at
1.25rem, every chip and button a full pill or circle, list thumbnails at
0.5rem. The progress rule and hairlines at 2px radius.

## Components

- **Card.** A 4:5 frame in `well` holding the scaled preview, with a type
  badge top-left, the card's number top-right and a quick-look chip
  bottom-right, over a body of slug, title, note and "Open demo". The whole
  card is one stretched link on the title. Hover lifts it 6px and deepens its
  shadow.
- **Quick-look chip.** Opacity 0 until the card was hovered or focused on a
  fine pointer, so the variants it opened onto were invisible at rest.
- **Filter chips.** One pill per type plus All, each with its count a step
  quieter by opacity; the pressed chip filled with ink. One row that scrolled
  sideways with a fade at whichever end had more.
- **Rail controls.** Pause, previous, next as 44px hairline circles; a pill
  switch between rail and list.
- **Quick look.** A panel as wide as the preview's fitted scale, stacking a
  title bar, the live preview, a row of variant dots and a footer of note and
  links. On a 1440x810 laptop the preview ran at about 0.75, the panel about
  360px wide. Its variants played every four seconds, restarted after every
  manual pick, and announced each step through a live region.
- **Meta row.** Mono keys over mono values, hairline-ruled on the left.

## Do's and Don'ts

As the page practised them at the time:

- Do show the live component, never a picture of it.
- Do keep the accent for what leaves the site.
- Do let the rail move by itself, and give it a pause.
- Don't put a colour past the token block; both themes are one list.
- Don't name a component class from the index; the preview message contract
  is the only channel into a thumbnail.

## Superseded by

The index on the `index-first-screen` branch, in order:

1. `cde3508` — the rail leads the first screen; the mark joins the controls'
   line. (Its side-column layout was later replaced by `ece848c`.)
2. `15ad017` — a variant picked in quick look stays picked; a pause control;
   only picks are announced.
3. `051cfa5` — one 11px label size; every tone clears 5:1.
4. `ada79b4`, `4986e66` — Mona Sans and Fragment Mono, on the index and on
   every demo page's chrome.
5. `ece848c` — the masthead as a band with a Figma button; the rail's head one
   line; the filter an icon over a native select.
6. `1057bde` — quick look always on the card, and side by side at full size in
   landscape.
