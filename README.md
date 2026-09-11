# UI reference base

A working library of interface components, each built in plain HTML and CSS and
kept as a self-contained reference. Some are recreations of interfaces
encountered elsewhere, reduced to the few decisions that make them work; others
are built from scratch against original Figma designs.

The purpose is reuse. The type scale, the spacing, the border treatment and the
motion exist as working code, ready to lift into a project. It is a parts bin
rather than a design system — every reference stands alone, and no code is
shared between them by design.

## Structure

Each reference is a folder named `YYYY-MM-slug` holding the component
(`component.html`, `component.css`), a demo page showing its states, a
thumbnail for the index, notes on the decisions it captures, and a reference
image.

## Adding a reference

1. Copy `_template/` to a new folder named `YYYY-MM-slug`.
2. Add `ref.png` — a screenshot of the source, or an export of the Figma frame
   the component was built from.
3. Fill in `notes.md`: `type:` on the first line, the origin (a URL, or a note
   that the design is original), and the specific decisions the build captures.
4. Build `component.html` and `component.css`, using `demo.html` to develop and
   review the states.
5. Add an `<a class="piece">` block to `index.html` so it appears on the index.

Open `index.html` to browse. Each card opens that folder's `demo.html`.

The rules for what belongs in each file live in `CLAUDE.md`.
