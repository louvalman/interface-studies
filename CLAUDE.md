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

## A component has to survive a phone

Two rules, and they hold for every reference regardless of `type:`.

**Narrow containers.** A component may say what width it wants, but never
insist on it. Any element that sets a width carries `max-width: 100%` beside
it, so a 320px column squeezes the component instead of pushing a horizontal
scrollbar across the whole page. Aspect ratios and proportional radii do the
rest — a fitted component is the same component, only smaller.

The demo page has to pass the squeeze down. A grid cell sized to its content is
as wide as its content whatever the track did, and an implicit `auto` column
takes its max-content width and overflows quite happily, so a cell holding a
component needs both `max-width: 100%` and a column that may shrink
(`grid-template-columns: minmax(0, 1fr)`, or `min-width: 0` on a flex item).
`_template/demo.html` carries the pair.

**No hover to spend.** Hover, focus and transitions are still CSS, and hover is
still where a pointer behaviour belongs — but a behaviour that exists *only*
on `:hover` does not exist on a touch device. Give `(hover: none)` a way to
reach the same state: `:active` for the length of a press, or `:focus-within`
where the state should hold. This is a media query in `component.css`, not a
reason to reach for `component.js`.

The index carries the touch half of this itself. Card thumbnails were already
driven by the message contract; quick look runs the preview with pointer events
on so the component's own `:hover` does the work, and on a coarse pointer —
where that hover will never fire — it sends the same `preview` message the
cards use instead. The preview needs no extra code for it: whatever it already
does with `active` is what quick look gets.

The check: narrow the window to 320px. Nothing scrolls sideways, and everything
the component does is still reachable without a pointer.

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

### The preview message contract

A thumbnail iframe has pointer events off — the card behind it is the link — so
the component's own `:hover` can never fire there. Instead the index sends the
preview a message when its card is hovered, focused, or scrolled into the read
position:

```js
// index -> preview
{ source: 'ui-reference-base', type: 'preview', active: true | false }
{ source: 'ui-reference-base', type: 'preview:variant', index: n }
{ source: 'ui-reference-base', type: 'preview:scale', scale: n }

// preview -> index, once its listener is live
{ source: 'ui-reference-base', type: 'preview:ready',
  variants: [{ id, label }] }        // variants optional
```

`preview.html` owns the mapping, in a small script at the end of the file: it
decides what `active` means for its component, usually by toggling the modifier
the component already has for its open state. The index stays generic and never
names a component class — which is what keeps the rule below intact.

`variants` is the second half of it. A preview may report a list of the states
worth seeing — themes, modifiers, compositions — and quick look draws a dot per
entry and asks for one by index. Only the preview knows what a variant is; the
index receives labels and nothing else. The first entry is the resting state,
and it is what the card thumbnail shows.

Two variants is the minimum worth drawing dots for; below that the row hides
itself. Beware toggling a variant's element with the `hidden` attribute — if
`component.css` gives that element a `display`, the author rule beats the UA
`[hidden]` rule and it will not hide. Add and remove the node instead.

`preview:scale` is the third message and the only one about pixels rather than
state: how much the preview's own pixels are being shrunk on screen. A card
lays the preview out at `--preview-w` and shows it at `--preview-scale`, and
quick look measures its own factor against the viewport, so a preview laying
out at 480px inside a 336px card is rasterised at 0.7 of the device ratio it
can read for itself. Anything a component sizes in device pixels — a hairline,
a mask's antialiasing ramp — is that much narrower than it asked for, and below
one device pixel it stops being antialiased at all. The factor cannot be
measured from inside the frame: over `file://` the parent is behind an opaque
origin. It arrives with `preview:ready` and again whenever it changes, and what
a preview does with it is the folder's business — usually restating one tunable
against it, inline, so it beats the stylesheet's own media queries. That is a
custom property being set from outside, which is what the property block is
for; it is still not a rule written against a component class.

The block is optional. A preview that ignores the messages still renders; it
just sits still, and quick look shows it without dots. A preview opened on its own does nothing, because the script only
posts back when it is framed. This is the one place a reference folder may carry
script without meeting the JavaScript bar below — it is thumbnail scaffolding,
not component behaviour, and it never goes in `component.js`.

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

Cards run their preview in place, via the message contract above. The quick-look
overlay iframes the same `preview.html` again at full logical size with pointer
events *on*, so there the component's real `:hover` does the work and no message
is involved. Both routes load the same file — there is no second thumbnail to
keep in step.

The preview iframe renders at a fixed logical viewport (`--preview-w` /
`--preview-h`) and is scaled down to the card by `--preview-scale`. That factor
must equal `--card-w / --preview-w` exactly, at every breakpoint, or the
thumbnail will not fill its frame.

The index is bilingual (EN/DA). Every translatable string in `index.html`
carries a `data-i18n` key — or `data-i18n-aria` / `data-i18n-title` for the
attribute — and `index.js` holds the Danish table; English is the markup itself,
so it needs no entry. A new reference's card copy needs its keys adding there
too, or it stays English when the page is switched. Quick look shows variant labels
in whatever language the preview reports them, since those strings belong to the
folder.

A `demo.html` carries its own copy of the strings and its own selector — no
shared module, because the folder has to survive being copied out. The index
appends `?lang=` to the link that opens a demo, and the demo's back link hands
the choice back; `localStorage` is the secondary channel, because over `file://`
each document gets its own opaque origin and does not share it. `_template/`
holds the block to copy. Translate the page's own prose only — component sample
copy and class-name hints stay as they are.

The card list is hand-maintained in `index.html`. Adding a reference means
adding one `<article class="piece">` block to it, pointing at the new folder's
`demo.html` and `preview.html`, and carrying a `data-date` — `index.js` sorts
the rail by that, newest first, so where the block is pasted does not matter.
Leave the `piece__no` em dash alone too: the number is written from the card's
position once the rail is sorted. Both used to be typed in, and both were a
second source of truth for something already stated once — a card added at the
front invalidated every number below it, and two sessions adding one at the
same time left the order to whichever way the merge fell. Without a `data-date`
a card falls back to the month in its folder name, which sorts it behind
anything dated in that month.

The card is an `<article>` with a stretched link on the title rather than an
`<a>` wrapping everything, because the quick-look button lives inside the card
and an anchor may not contain a button. Everything the overlay shows is read
back out of that block, so no title, note or path is written twice. That is the
only file outside the reference folder that a new reference may touch.
