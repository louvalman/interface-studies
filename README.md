# Interface studies

Studies in interface detail. Each one takes a few decisions — a type pair, a
spacing rhythm, a border treatment, a hover behaviour — and builds only those,
in plain HTML and CSS. Some start from an interface found elsewhere and keep
its construction rather than its content; others are built from scratch against
an original Figma design.

The purpose is the isolation. A study is small enough that the decisions behind
it stay legible, and self-contained enough to survive being copied out — every
study stands alone, and no code is shared between them by design.

## Structure

Each study is a folder named `YYYY-MM-slug` holding the component
(`component.html`, `component.css`), a demo page showing its states and the
decisions behind them, a thumbnail for the index, notes on the decisions it
captures, and the reference image it was built from.

## Adding a study

1. Copy `_template/` to a new folder named `YYYY-MM-slug`.
2. Add `ref.png` — the reference image: a screenshot of the source, or an
   export of the Figma frame the component was built from.
3. Fill in `notes.md`: `type:` on the first line, the origin (a URL, or a note
   that the design is original), and the specific decisions the build captures.
4. Build `component.html` and `component.css`, using `demo.html` to develop and
   review the states.
5. Render `notes.md` into `demo.html`'s `Decisions` block, and give the page
   an `<h1>`.
6. Add an `<article class="piece">` block to `index.html` so it appears on the
   index.

Open `index.html` to browse. Each card opens that folder's `demo.html`.

The rules for what belongs in each file live in `CLAUDE.md`.
