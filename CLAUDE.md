# CLAUDE.md

This repo is a UI reference base: interface components built in code and kept as
self-contained references, so the decisions behind them can be lifted into
another project later. Some are recreations of interfaces found elsewhere;
others are built from scratch against original Figma designs.

Read these rules before adding to or editing anything in this repo.

## Folder structure

Every reference lives in its own folder, named `YYYY-MM-slug`:

```
2026-09-brutalist-price-card/
├── ref.png          the reference image: a source screenshot, or a Figma export
├── notes.md         the decisions the build captures, and why
├── component.html   the markup for the component, and nothing else
├── component.css    self-contained, BEM-namespaced styles
├── demo.html        the page that shows the component off
└── preview.html     one instance, no chrome — the landing page's thumbnail
```

`component.js` is allowed as a seventh file, but only under the conditions in
**JavaScript** below.

`_template/` holds a stubbed, commented copy of these files. Copy it when
starting a new reference.

## notes.md

The first line declares the type:

```
type: card
```

Valid types: `card`, `button`, `layout`, `aesthetic`, `navigation`.

Below that: the origin, then 2–5 bullets naming the *specific* decisions the
build captures. For a recreation the origin is the source URL; for a component
built from an original design, say so (`Source: original design`).

Type scale. Spacing rhythm. Border treatment. Hover behaviour. Name the actual
decision, not a general impression — "48px/16px type pair with the label at 11px
uppercase, letter-spaced 0.08em" is useful; "clean and modern typography" is
not.

## Recreation means extraction, not pixel-matching

This applies when the reference comes from someone else's interface. Take the
handful of decisions that make it work, and ignore its content and its branding
— the copy, the logo, the product name, the photography are not what is being
captured. A version that is 80% visually faithful but isolates the right four
decisions is correct. A pixel-perfect clone carrying someone else's brand is
not.

A component built from an original Figma design has no such constraint: build
what the design specifies.

## `type:` scopes the output

| type | what gets built |
|---|---|
| `card` | just that component |
| `button` | just that component |
| `layout` | structure with placeholder content, and no styling opinions beyond the grid |
| `aesthetic` | a token block plus 2–3 sample elements that demonstrate it |
| `navigation` | just that component |

Don't build more than the type calls for. A `layout` reference does not get a
beautifully styled card sitting inside it; it gets a grey box.

## component.css

- **Self-contained.** It must work when copied alone into an unrelated project
  and dropped next to code that knows nothing about this repo.
- **BEM-namespaced to the folder slug.** In
  `2026-09-brutalist-price-card/`, the root class is
  `.brutalist-price-card`, with `.brutalist-price-card__price` and
  `.brutalist-price-card--featured` beneath it.
- **No global selectors.** No `body`, no `*`, no element selectors outside the
  component's own scope, no resets, no normalize.
- **No `@import`, no CDN links, no external font loading.** The component
  declares the font family it wants; loading it is the demo page's job.
- **Every tunable value goes in a local custom property block** at the top of
  the root class:

  ```css
  .brutalist-price-card {
    --brutalist-price-card-bg: #f4f1ea;
    --brutalist-price-card-border: 2px solid #111;
    --brutalist-price-card-pad: 1.5rem;
    --brutalist-price-card-price-size: 3rem;

    background: var(--brutalist-price-card-bg);
    border: var(--brutalist-price-card-border);
    padding: var(--brutalist-price-card-pad);
  }
  ```

  The test: can someone re-theme this by overriding variables from outside,
  without opening the file and editing its internals? If a colour, size,
  radius, or duration is hardcoded further down, the answer is no.

## component.html

Only the markup for the component. No `<html>`, no `<head>`, no wrapper divs
that exist for page layout, no `<link>` tags. This file is the contract — it
is the exact markup `component.css` expects, and what gets copied out.

## demo.html

All page-level context lives here, and only here:

- background and centering
- font loading (`<link>` to a font service is fine *here*)
- a link to `component.css`
- 2–3 states of the component: default, hover, and a content variant

demo.html links `component.css`; it never redefines it. If the demo needs a
style, that style belongs in a `<style>` block scoped to the demo page's own
scaffolding — never a rule that reaches into the component's classes.

## preview.html

The thumbnail the landing page iframes. One instance of the component, centred
on the same background `demo.html` uses, with no captions, no state labels and
no second copy. It links `component.css` and never redefines it — the same
contract as `demo.html`.

It exists because the index shows the *component*, not the reference image, and
`demo.html` is the wrong shape for that: its captions and side-by-side states
are illegible at thumbnail size.

Keep its markup in step with `component.html`. If the two drift, the index is
advertising something the component no longer is.

## JavaScript

Vanilla HTML and CSS by default. Add JavaScript only when the reference
genuinely depends on interaction — a disclosure, a carousel, a drag. Hover,
focus, and transitions are CSS. When JS is needed, it goes in a plain
`component.js` with no framework and no build step.

## Folders are independent

Never edit or refactor across folders. Never extract a shared stylesheet, a
shared token file, or a shared anything. Two references that solve the same
problem the same way should contain the same code twice — the duplication is
intentional, because each folder has to survive being copied out on its own.

When asked to add a reference, touch that folder and nothing else — with the
single exception below.

## The landing page

`index.html`, `index.css` and `index.js` at the repo root are the index: a
carousel of every reference, each card linking to that folder's `demo.html`.
This is site chrome, not a reference — it has its own class names and its own
stylesheet, and it never links a `component.css` or reaches into a reference's
classes. A reference folder must keep working with the index deleted.

Each card iframes that folder's `preview.html` — so the index shows the live
component, not `ref.png`. The reference image stays in the folder as the record
of what the build was based on; it is not what gets displayed.

The preview iframe renders at a fixed logical viewport (`--preview-w` /
`--preview-h`) and is scaled down to the card by `--preview-scale`. That factor
must equal `--card-w / --preview-w` exactly, at every breakpoint, or the
thumbnail will not fill its frame.

The card list is hand-maintained in `index.html`. Adding a reference means
adding one `<a class="piece">` block to it, newest first, pointing at the new
folder's `demo.html` and `preview.html`. That is the only file outside the
reference folder that a new reference may touch.
