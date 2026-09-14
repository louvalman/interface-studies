# CLAUDE.md

This repo is Interface Studies: interface components built in code and kept as
self-contained studies, so the decisions behind each one stay legible and it
survives being copied out on its own. Some start from an interface found
elsewhere; others are built from scratch against original Figma designs.

Read these rules before adding to or editing anything in this repo.

## Folder structure

Every study lives in its own folder, named `YYYY-MM-slug`:

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
starting a new study.

## notes.md

The first line declares the type:

```
type: card
```

Valid types: `card`, `button`, `layout`, `aesthetic`, `navigation`.

Below that, the component in its own terms: a short opening paragraph saying
what it is and what it does, then 2–5 bullets naming the *specific* decisions
the build captures.

Type scale. Spacing rhythm. Border treatment. Hover behaviour. Name the actual
decision, not a general impression — "48px/16px type pair with the label at 11px
uppercase, letter-spaced 0.08em" is useful; "clean and modern typography" is
not.

### Inspiration goes at the bottom

Where a study started is a footnote, not its subject. So the last line of the
file is an `Inspiration:` line — a URL for something seen elsewhere,
`Inspiration: none — original design` for a build of your own — with at most a
sentence or two after it if there is something worth saying about what was
taken.

It sits at the bottom because the file opens on the component, not on a
lineage. A reader who wants to know where the idea came from can go looking;
a reader who wants to know what the thing *is* should not have to read past a
paragraph of provenance to find out.

Do not write the disclaimer. Earlier versions of these files opened with a
paragraph of "this is an extraction, not a copy" and then an inventory of what
was left behind — the brand, the copy, the photography, the product name. That
is the repo's standing rule (below), stated once there; restating it per study
argues with a charge nobody made, and it spends the top of the file on the
reference instead of on the build. Name a specific departure only where it is
itself a decision — a construction that was changed on purpose, a mechanism the
reference has that this one does not — and name it in a bullet, where the other
decisions are.

## Extraction, not pixel-matching

The standing rule, and it does not need restating per study. When a reference
comes from someone else's interface, take the handful of decisions that make it
work and leave its content and its branding — the copy, the logo, the product
name, the photography are not what is being captured. A version that is 80%
visually faithful but isolates the right four decisions is correct. A
pixel-perfect clone carrying someone else's brand is not.

The bar is higher than swapping the palette. If the item set, the lockup, the
silhouette and the sample copy all still map one-to-one onto the reference,
what has been built is the reference in different colours — the decisions were
copied along with everything else, which is the failure this rule exists to
prevent. Take the construction and then have an opinion of your own with it:
change what the component is *for*, what it is made of, or how it behaves, and
let the borrowed part be the technique rather than the object.

A component built from an original design has no such constraint: build what
the design specifies.

## `type:` scopes the output

| type | what gets built |
|---|---|
| `card` | just that component |
| `button` | just that component |
| `layout` | structure with placeholder content, and no styling opinions beyond the grid |
| `aesthetic` | a token block plus 2–3 sample elements that demonstrate it |
| `navigation` | just that component |

Don't build more than the type calls for. A `layout` study does not get a
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

Two rules, and they hold for every study regardless of `type:`.

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
- the page's own colour tokens, in a `:root` block and a second one for the
  other theme — see **Two themes** below
- font loading (`<link>` to a font service is fine *here*)
- a link to `component.css`
- an `<h1>` naming the study, with the type and a one-sentence lede
- 2–3 states of the component: default, hover, and a content variant
- `notes.md`, rendered — see below

demo.html links `component.css`; it never redefines it. If the demo needs a
style, that style belongs in a `<style>` block scoped to the demo page's own
scaffolding — never a rule that reaches into the component's classes.

Its `<title>` is the study's name, not the folder slug — the tab, the bookmark
and the history entry are read by a person. The language script writes it from
the page's own `<h1>` so the name is one string rather than two, and the tag in
the markup is the no-script fallback.

It also carries `og:` tags, because a demo page is the link that gets pasted
somewhere. Title and description come from the page's own `<h1>` and lede;
`og:image` is `../og.png`, the index's card, from the same place up a level
that the favicon and the back link already come from. A folder copied out
loses the picture and keeps the words.

### The demo page renders notes.md

The decisions are the study. A page that shows five states and names none
of them is a gallery, and the one artefact worth lifting stays in a file the
site never opens. So every demo carries a `Decisions` block: the `type:`, the
opening paragraph, one entry per decision bullet, and the `Inspiration:` line
last — the same shape and the same order `notes.md` has, so the two read side
by side.

It is a `<details>`, closed. The states are what the page is for; the decisions
are what you open when you want to know why one of them is the way it is. A
`<details>` rather than a scripted panel, because disclosure is what the
element already is — keyboard, screen reader and find-in-page included — and no
demo page should need script for it.

Kept in step with `notes.md` by hand, like the language table and
`preview.html`'s markup. There is no build step to read the file, and fetching
it fails over `file://`, where each document gets an opaque origin. Edit the
one, edit the other.

The decision prose stays in the language `notes.md` was written in. It is a
record, not page copy — the same reason component sample copy is left alone by
the language switch. Only the labels around it (`Decisions`, `Type`,
`Inspiration`) carry `data-i18n`.

A `notes.md` that has grown past the contract's 2–5 bullets renders the bullets
in its first group — the decisions the build captures — and links the file for
the rest.

The inspiration row sits below the decisions, beside that link, and not in the
meta list at the top. The block opens on what the component is; where it came
from is the last thing in it, for the same reason it is the last line of
`notes.md`.

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
{ source: 'interface-studies', type: 'preview', active: true | false }
{ source: 'interface-studies', type: 'preview:variant', index: n }
{ source: 'interface-studies', type: 'preview:scale', scale: n }
{ source: 'interface-studies', type: 'preview:theme', theme: 'light' | 'dark' }
{ source: 'interface-studies', type: 'preview:pause', paused: true | false }

// preview -> index, once its listener is live
{ source: 'interface-studies', type: 'preview:ready',
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

`preview:theme` says which theme the index is in. It arrives twice over, and
deliberately: as `?theme=` on the src the frame is loaded with, so a thumbnail
is never painted on the wrong ground and then corrected, and as this message if
the index is switched while the frame is already on screen — reloading a live
thumbnail to change one colour would drop its animation and flash the skeleton
back. The index rewrites `data-src` rather than `src`, so the two places that
load a preview (the rail on approach, quick look on open) never learn about any
of this.

Three times over, in fact, and the third is the one that was missing. Between
the two above sits the case neither covers: a document that is loading at the
moment the switch happens. Its src was written before the switch, so it carries
the old theme, and the message that would correct it lands in a document that
has not parsed its listener yet — dropped, and the card stays on the old ground
for as long as it stays loaded, which at the current unload margin is the rest
of the session. Toggling during the page's own first pass strands the whole
rail that way; toggling later strands whichever card the drift happened to be
loading, which is why it read as *some* cards rather than all of them. So the
theme joins the scale and the pause as state the index re-states on
`preview:ready` — the one moment a preview is known to be listening — from
`<html>`'s own attribute, where the theme module has already resolved the
stored choice, the query string and the system preference into one answer. Both
`preview:ready` handlers do it: the rail's and quick look's.

Every preview takes it, and takes it the same way: `--preview-ground` is
`#f3f2ef` on a light rail and `#191b1e` on a dark one, two literals repeated in
every folder. That ground is the rail's rather than the component's — it is
repeated across the folders precisely so the rail reads as one set of cards,
which is an argument about the index and not about any study — so it follows
the index into dark rather than staying lit under it. A card that kept the
paper while the others went dark would read as a different kind of thing rather
than as that study's card.

Nothing is painted on top of it. The ground is the two literals and the
component standing on them — no grid, no stage, no wash, whatever the folder's
own `demo.html` does. A card with a surface under it in a row of cards with
none reads as a different kind of card before it reads as that study, which
defeats the thing the shared ground is for. `2026-09-inked-plate-card` keeps
its plotter grid on the demo page and `2026-09-liquid-glass-toolbar` keeps its
cross-lit stage there; neither comes to the rail.

`demo.html`'s ground is a separate decision and always was — that page may be
ink in both themes while its thumbnail is neither, and it may stage the
component however the study wants. The component itself is never touched by any
of it in either file.

**A card has to work in both themes, and that is the preview's job to see to.**
The ground moves under every study whether or not the study asked, so every
thumbnail is going to be drawn on `#191b1e` at some point and has to be worth
looking at there. Not merely legible — a card that survives dark by being a
white plate on it is fine, because that is what the component is; a card whose
type has gone to a grey smear is not a card. The check is both themes, every
variant the preview reports, at the rail's scale as well as at full size, and
it is the last thing to do before a study is finished.

What it takes depends on where the component's colours live, and there are two
shapes of answer. A component that stands on its own surface needs nothing: it
sits as a lit plate on the dark ground, the same way it does on a dark
`demo.html`, and that is the intended result rather than an oversight to
correct. A component whose type sits on the *ground* — which an `aesthetic`
study's sample block does by construction — inherits an ink colour that can
only be right in one of the two, and something has to move it.

The move is the component's own re-theming channel, from outside, never a rule
written against a component class. `2026-09-drawn-gradients` is the worked
example: left at the paper ink on a dark rail its three labels were invisible
and its read-out was a grey smear, so its preview hands
`--drawn-gradients-base`, `--drawn-gradients-ink` and `-ink-soft` in per theme
— and hands in the values the component's own `--night` surface already
declares, so the preview invents no colour of its own.

Where the study has a whole dark version of the component rather than a
corrected palette, it declares it as a modifier in `component.css`, as a
decision of the study, and the preview applies the modifier. That is worth
separating from the correction above: `2026-09-detail-reveal-card` carries a
dark card because a dark card is one of the things it is, not because the rail
went dark. Answering the ground is the preview's job; having two versions is
the study's.

A preview holding two of them may rest on whichever the rail is *not* — the
dark card on a light rail, the light card on a dark one — and that folder does.
It is an edge decision rather than a theme one: its light card is #f2f1ef
against the light ground's #f3f2ef, 0.30 OK ΔE, so the card had no edge there at
all. Rest it on the opposite tone and the separation is the widest in the set,
using only what the study already had.

Rotate the resting variant to the front of the reported list rather than merely
applying it. Quick look takes index 0 as what is showing — it opens on that dot
and prints that label — so applying one variant while reporting another first
leaves the overlay naming the wrong card. Re-rest on `preview:theme` too, and
only when the preview is at rest: a card quick look has stepped somewhere has
been asked for that variant, and re-resting underneath it takes it away.

The inversion is also what caught the last surface still painting its own
ground. That preview darkened the page under its dark card, which never showed
on the rail while the light card was the resting one — so it outlived the sweep
that took the plotter grid off the inked plate's thumbnail. Resting on the dark
card would have put it on the rail. A variant's own tone is not an exception to
the ground: the ground is the rail's in every variant, and a study whose plate
needs a backdrop needs a different plate.

None of this reaches `component.css` from the preview, and none of it is a
`prefers-color-scheme` query. The theme the card sits *in* is the index's,
which can be dark under a light desktop and light under a dark one, so
`[data-theme]` is the only thing to answer — the same attribute the ground
reads.

The bill for this lands on a component whose edge is carried by the ground
rather than by its own fill, and it is paid rather than worked around: the
inked plate's porcelain surface is #e8ebe4 with the grid no longer stopping at
it, so the edge is a four percent step and nothing else. Adding a border in the
preview to make up the difference would be the thumbnail reaching into the
component, which is the rule this whole contract keeps. A study in that
position picks a resting variant that does not need the help — see that
folder's `notes.md`.

`preview:key` is the fifth, and it goes the other way — preview to index. An
iframe is its own document: keys pressed inside it fire against that document
and never reach the index. Quick look runs the preview with pointer events
live, which is the whole point of it, so a click on the component moves focus
into the frame — and from there `Escape` stopped closing the overlay, because
the handler that closes it is on the index's document. The preview hands that
one key back:

```js
// preview -> index
{ source: 'interface-studies', type: 'preview:key', key: 'Escape' }
```

Escape and nothing else. Arrow keys are the component's — it may hold a field
with a caret in it — and a preview that relays them would have the overlay
change variant while someone is typing.

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

`preview:pause` is the sixth, and it is the only one a preview may not ignore.
A same-origin iframe shares the index's main thread, so a thumbnail that keeps
animating while the rail is being dragged is animating against the drag, on the
thread the drag needs — and a live component is the whole of what this index
shows, so every card on screen would be doing it at once.

What it holds is the rail moving, not the card being off the mark. A preview
runs while its card is on screen and the rail is still, and stops while the rail
travels — under a hand, in a step, or on the drift. Off screen it is stopped
too, since nothing is being shown. It is sent `true` when the rail starts
moving and when its card leaves the scrollport; `false` when the rail lands,
when the card comes back into view, and on load once its settling-in grace is
up.

Holding a card off the mark was the earlier rule and it was too broad: a
component's resting state is a state, and a preview frozen at its first frame
shows the component stopped rather than at rest. What keeps a card from
performing early is `active`, which is the read mark's, and it is untouched by
any of this.

At the mark means arrived, not nearest. Nearest flips at the halfway point
between two cards, which is the right answer for the counter and the progress
bar and the wrong one for whether a component should start performing — a card
half in is not being read. `ON_MARK` is how close counts, as a fraction of a
card; snap lands exactly, so it only has to absorb the last pixels of a settle.

The drift needs the sign as well as the distance. It never rests, so it cannot
wait for rest — but nearest flips half a card *before* the card reaches the
mark, so a drifting rail had every card start performing on its way in: the
pulse ran while the card was still coming onto the screen. `activeIndex` reports
the signed distance for this, and while the drift is running a card counts as
arrived once it is at the mark or past it. It then keeps performing as it
travels off, until the next card arrives in its turn — which is the cost of the
drift never resting, and the right way round: a card that has been read leaving
is better than one being read before it is there. Measured over 26 seconds of
drift: 89 samples of a card performing before the mark, worst half a card early,
against none.

The pause is not the only thing holding a card, and cannot be. A component
whose performance is a transition rather than an animation —
`2026-09-liquid-glass-toolbar`, which has nine transitions and no keyframes at
all — is not touched by `animation-play-state`, so nothing stops it once it has
been told to perform. What holds it is never being told: the mark starts a
card, `hush()` stops the one being left at the moment the rail starts moving
rather than when it arrives, and `settleWork` re-reads the position before
handing off, because `sync` is coalesced onto a frame and the read position it
would otherwise use is the one the gesture started from. Measured by stepping
the rail eight times and sampling through each step: 47 samples of a visible
card performing off the mark, worst a full card and a fifth away, against none
— and every card told to perform sitting exactly on it. The preview stamps `data-preview-paused` on its own root, and the one
rule that goes with it stops every animation in the document:

```css
:root[data-preview-paused] *,
:root[data-preview-paused] *::before,
:root[data-preview-paused] *::after {
  animation-play-state: paused !important;
}
```

Global, and in `preview.html`'s own style block rather than in `component.css`
— it has to reach the component without naming one of its classes, which is
the same rule the rest of the file keeps. Transitions are deliberately left
out: stopping those mid-gesture makes states snap instead of settle, and they
are not what costs.

Measured across the rail on a throttled phone profile, the same two-card drag
runs 446 style recalcs with the pause defeated and 175 with it working. One
study accounted for nearly all of it — `2026-09-raster-pulse`,
whose 289 dots are past Chromium's composited-animation budget and so fall back
to the main thread — but the message is the contract's rather than that
folder's, because the next study to animate three hundred things would do the
same.

Pausing is not `active: false`. That puts a preview in its resting state, and a
resting state still animates; sending it to all five changed nothing measurable.
Nor is it unloading: the document stays, so the animations pick up where they
were instead of starting over, which is what a card that has been dropped and
re-loaded does.

The block is optional. A preview that ignores the messages still renders; it
just sits still, and quick look shows it without dots. A preview opened on its own does nothing, because the script only
posts back when it is framed. This is the one place a study folder may carry
script without meeting the JavaScript bar below — it is thumbnail scaffolding,
not component behaviour, and it never goes in `component.js`.

## Two themes, and every page carries its own copy

`index.css` declares every colour it uses as a token in `:root`, and the dark
theme is that same list re-declared under `:root[data-theme="dark"]`. There is
no rule that exists in one theme and not the other, no second stylesheet, and
no `prefers-color-scheme` query — a colour hardcoded past the token block is a
colour that will be wrong in one of the two.

The attribute is the only thing the stylesheet reads, which is what keeps the
dark palette to one block: the two inputs are resolved in script instead, where
they become one answer. The stored choice, or the system's when there is none.
Six inline lines in `<head>` do it before the first paint — a theme that
arrives with the stylesheet instead flashes a frame of the other one — and the
page's own script does it again on load, then keeps listening while nothing is
stored, so an OS switch made with the page open still moves it. Choosing
stores; a stored choice then outranks the OS in both directions.

Without JavaScript a page keeps whatever its bare `:root` holds. On the index
that is the light theme, and the index already needs script for its previews,
its rail order and its counts; on a demo page it is the ground the folder
authored, which is the right thing to fall back to.

A demo page does the same in its own `<style>`: its own tokens, its own two
blocks, its own copy of the toggle and of the head script. No shared module and
no shared stylesheet — the folder has to survive being copied out, which is the
same reason its language table is its own. `_template/demo.html` holds the
block to copy.

Which theme a folder's bare `:root` holds is the folder's business.
`2026-09-inked-plate-card` is ink by authorship — the plotter ground is that
study's own staging, not a default it inherited — so its `:root` carries the
dark theme and it declares `:root[data-theme="light"]` instead. The attribute
selects either way.

So is the ground itself, but there is a default and `_template/` carries it:
`#f3f2ef` light, `#121316` dark, which is what three of the five studies use. A
study may depart from it — the inked plate's ink, the liquid-glass toolbar's
warm stone for the cross-lit stage it needs — and a departure is a decision that
says so in that folder's `notes.md`. What is not allowed is a third thing: the
template sat on `#ddd9d0` / `#161512` for a while, neither the default nor a
departure and with nothing written down, so every study was born on a ground no
study used.

`component.css` is not in it, in any folder. A component owns its colours in
both themes and no demo rule may reach into them, so on a dark page it sits as
a lit plate — which is exactly what it does on the index cards. A study that
wants a dark variant of the component declares one as a modifier, in its own
file, as a decision of the study.

`preview.html` is told, rather than left out. The index cannot reach into a
framed document — over `file://` it is behind an opaque origin — so the theme
rides on the src and over `preview:theme`. Every preview moves its shared
ground with it and nothing else; see **The preview message contract**.

The chips that sit *on* a thumbnail are the part of the index that has to know:
the type badge, the number and quick look are painted against the preview
rather than against the page, so they invert with the chrome rather than with
the plate they cover.

The choice travels in the link, the way the language does: the index appends
`?theme=` to the link that opens a demo, the demo's back link hands it back,
and `localStorage` is the secondary channel. Only an explicit choice travels —
a theme resolved from the system is not a choice, and the other end would
resolve it the same way anyway.

The matte part is the grain: the dark ground is a wash across two thousand
pixels, which 8-bit colour cannot draw without ringing. A fractal-noise tile at
a low alpha dithers the banding out, and reads as paper rather than as texture.

## JavaScript

Vanilla HTML and CSS by default. Add JavaScript only when the study
genuinely depends on interaction — a disclosure, a carousel, a drag. Hover,
focus, and transitions are CSS. When JS is needed, it goes in a plain
`component.js` with no framework and no build step.

## Folders are independent

Never edit or refactor across folders. Never extract a shared stylesheet, a
shared token file, or a shared anything. Two studies that solve the same
problem the same way should contain the same code twice — the duplication is
intentional, because each folder has to survive being copied out on its own.

When asked to add a study, touch that folder and nothing else — with the
single exception below.

Two things legitimately sweep every folder, and both are the same shape. One is
an identity change — the site was renamed, and each `demo.html` carries its own
copy of the back link's strings. The other is a page contract every demo has to
meet, which is how the language switch arrived and how the theme switch did:
each folder gets its own copy, written into its own file, in its own palette.

Neither is a refactor. The test is what the folder owns afterwards: a sweep
that leaves every folder holding its own copy is a sweep; one that leaves them
sharing a file is the thing this rule forbids. Adding a contract like that is a
decision about the whole repo — make it deliberately, write it down here, and
put it in `_template/` so the next study is born with it.

## The landing page

`index.html`, `index.css` and `index.js` at the repo root are the index: a
carousel of every study, each card linking to that folder's `demo.html`.
This is site chrome, not a study — it has its own class names and its own
stylesheet, and it never links a `component.css` or reaches into a study's
classes. A study folder must keep working with the index deleted.

Each card iframes that folder's `preview.html` — so the index shows the live
component, not `ref.png`. The reference image stays in the folder as the record
of what the build was based on; it is not what gets displayed.

A touch release is the platform's, end to end — its momentum, its snap, its
deceleration curve. Nothing in `index.js` animates the landing.

Four attempts got here, and each failed for a reason that only made sense once
the next one failed too. Driving `scrollLeft` from rAF is a main-thread scroll
update per frame: two or three visible hitches in every landing on a phone.
Handing it to `scrollTo({behavior:'smooth'})` is smooth but its duration is the
browser's, nothing exposes it, and over one card it is finished before it reads
as motion. Translating the row instead is smooth and the duration is ours — but
the fling is still running underneath, so the two distances add up, the rail
travels much too far, and committing the real scroll snaps it back. And a fling
cannot reliably be cancelled from script: the write meant to stop it is a no-op
when it asks for the position the scroll is already at.

What was wrong sat upstream of all of it. `scroll-snap-stop: always` makes a
fling stop at the next card rather than running through several — but only if
snap is on when the browser *plans* the fling, and snap was off for the whole
gesture so that a finger landing on a drifting rail is not yanked to the nearest
card. It was off at exactly the moment it needed to be on.

It only has to be off while the rail is **still**. Mandatory snap applies at the
end of a scroll, not during one, so giving the class back on the first
`touchmove` yanks nothing — the scroll is live by then — and the fling that
follows is planned with snap and snap-stop in hand. One swipe, one study,
landing on the mark, and not a line of it on this thread.

`endTouch` then only picks which of two things is true. A flick: hands off
entirely, `landFlung` waits for `scrollend` and the platform does the rest. A
slow drag: there is no fling to fight, and snap on its own would return a short
drag to the card it started on — right for a stray touch, wrong for the
deliberate short drag this rail is mostly used with — so `landWalked` scrolls it
one card on, smoothly, as the only thing moving. `FLICK_SPEED` over the last two
`touchmove` samples is the whole of the distinction; the full velocity sampling
this replaced ran on every scroll event of a gesture to feed arithmetic that
decided the target, and that arithmetic is what used to land cards off the mark.

A press that never moved takes the same walked path, because snap is still held
off and giving it back to a rail standing between two cards is the yank.

`gesturing()` counts the landing as the rail still moving, so the recycle holds
off and the read mark does not start a card until it has arrived.

What ends the landing is `scrollend`, and a backstop timer behind it in case
none comes. The backstop alone was a second of dead air: the card was on the
mark, visibly stopped, and nothing had started — the animation is told to run by
`settleWork`, which the landing has to finish first. So a quiet poll sits beside
`scrollend` and ends it as soon as the rail has stopped moving, about 90ms.

Quiet is not enough on its own to go on. `scrollLeft` quantises to whole pixels,
so the tail of an ease-out sits on one of them for longer than those two ticks
while the scroll is still live, and ending the landing there would recycle the
rail mid-motion — which is the seam jump. The poll therefore wants the rail
quiet *and* on a snap position: landed, not merely slow. Anything else waits out
the backstop, which is what it is for.

**On testing this.** A throttled Chromium reported the rAF version as flawless —
every frame 16.7ms, nothing dropped — on code that stuttered plainly on an
iPhone. It has no touch scrolling and no momentum, so the fling path cannot be
exercised in it at all, and with snap live a synthetic `scrollLeft` write is
undone before it counts. What a harness here can check is the rail's own
decision — which branch, how many cards — and not how a platform lands it. Where
the question is how something feels on a phone, the phone is the instrument, and
a green harness is not evidence. Note also that Chrome on iOS is WebKit: "tested
in Chrome" means two different engines depending on the device.

### What stops the drift, and what only holds it

The rail drifts on its own until a reader takes it, and the two are different
things. `driftStop(byUser)` is final — only the play control brings it back —
while `driftHold`/`driftRelease` is the rail deferring to someone who is there
and picking up again when they are not. Reading a gesture as the first when it
was the second is how the carousel ends up dead on a page nobody has touched.

Both of those went wrong the same way, by taking a proxy for the thing.

**A wheel is only the rail's if it is sideways.** Any wheel over the track used
to stop the drift for good, and a vertical wheel over the track scrolls the page
past it and leaves `scrollLeft` exactly where it was — measured. So scrolling
down the page to reach the rail killed the carousel on the way. On a 1440x810
laptop the track's box is 86% of the fold, which makes that the ordinary way to
arrive rather than an edge case: the drift was off before the rail had been
looked at. Predominantly horizontal, or shift held, is the rail being taken;
anything else is the page moving past it, and the pointer being there already
holds the drift and lets go again on the way out.

**A pointer holds the rail by moving, not by being there.** Presence was the
proxy, and at 86% of the fold "on the rail" is indistinguishable from "on the
page": a cursor parked mid-screen held the drift for as long as the tab stayed
open. So movement holds it and stillness lets it go, after `POINTER_IDLE`. Any
move re-holds at once, which is what keeps the rail from travelling out from
under a reader — they need only have moved within that window, not be moving
now. Measured on a 1440x810 viewport: parked, the rail is held for the first
2.5s and drifting again by 6.5s; nudged every 700ms, it stays put throughout.

**A pointer moving is not the same as a pointermove.** A browser dispatches one
of its own when the content under a stationary cursor changes, so `:hover` can
land on whatever is under it now — and a drifting rail changes that every frame.
Taken at face value, the rail's own motion reads as a reader being there and
holds the drift, which leaves the carousel still except for a frame or two after
each idle release. The synthetic move carries the coordinates the pointer
already had, so comparing them is the whole of the distinction. A headless
harness will not show this: its cursor is virtual and it does not do the
hover recalculation, so the guard has to be reasoned about rather than measured.

**Reduced motion decides whether the rail sets off, not whether it can.** These
were one test, `driftable()`, and folding them together meant a reader with the
preference set got no drift *and* no control — the play button was hidden along
with the thing it starts, so there was no way in at all. Content that moves by
itself is what the preference is about, so the rail does not; a reader who
presses play has asked for this one, and leaving that open is what the
preference is for rather than something it forbids. `driftable()` is now
`loopable()` alone and `driftsUnasked()` carries the preference: it gates the
boot timer and the resize restart, and nothing else. The control is offered
from the first paint in that case, because it is never going to appear on its
own.

The play label lost its "again" with it. Under reduced motion the rail has never
set off, so "Start the carousel again" was wrong in exactly the state where the
control matters most, and the word carried nothing a reader needed in the other.

The rail loops, and so drifts, while the row can cover the viewport with a card
to spare: `client <= (ring - 2) * step`, which at eight cards and a 336px card
is 2184px. Past that it is finite and the drift control hides itself — the one
case documented under `loopable()`, and the ceiling rises by a card with every
study added. A wider screen than that needs a wider card, and the pair to keep
in step is `--card-w` and `--preview-scale`.

**When the control is missing, those are the two reasons**, and they are worth
telling apart before looking anywhere else: the row is too short to loop, or
reduced motion is set. Everything else about the drift is about when it stops,
not whether it exists.

The pointer path still steps itself, through `stepTo`, and keeps the old
arithmetic. There is nothing native to defer to there: the drag is scripted from
`pointermove`, there is no momentum, and a recycle mid-step has to move both
ends of the animation underneath it.

Cards run their preview in place, via the message contract above. The quick-look
overlay iframes the same `preview.html` again at full logical size with pointer
events *on*, so there the component's real `:hover` does the work and no message
is involved. Both routes load the same file — there is no second thumbnail to
keep in step.

`og.png` at the root is the social card: a 1200x630 render of the masthead,
kept as a file because no scraper runs the page, and as a PNG because none of
them will rasterise an SVG. The paths in the tags are relative — Slack, Discord
and iMessage resolve those against the page they fetched. Facebook and LinkedIn
want absolute ones, so when this gets a host, prefix them with it and add a
matching `og:url` and `<link rel="canonical">`.

`og.html` is what that PNG is a photograph of. It is not a page anyone visits
and nothing links to it; it exists so that changing the card is an edit rather
than a rebuild-by-eye, which is what the first two versions were. Its head
carries the render command. The masthead's copy is in it by hand — the h1 and the
lede — so a headline change means editing `index.html`, then `og.html`, then
re-rendering, and skipping the last two leaves a link that pastes as one page
and opens as another.

Its meta row is the exception, and deliberately not a copy: the masthead's row
is the newest study's date, read off the cards at runtime, and baked into a PNG
that is wrong from the next study onward. The card states three things about
the set that do not move instead.

The rail ends on its own rule: `.rail__progress` is both the scroll position
and the line under the cards, so its track is always drawn and only the fill is
conditional. The footer has no `border-top` of its own — it used to, 98px below
the progress track, which was the page drawing the same line twice with nothing
in between.

The preview iframe renders at a fixed logical viewport (`--preview-w` /
`--preview-h`) and is scaled down to the card by `--preview-scale`. That factor
must equal `--card-w / --preview-w` exactly, at every breakpoint, or the
thumbnail will not fill its frame.

`--well` is the second cross-file invariant, and it is the same shape: it must
equal the `--preview-ground` every folder declares — `#f3f2ef` light, `#191b1e`
dark — because this stylesheet cannot reach into a framed document to ask. The
card frame and its loading skeleton are painted in it, so the skeleton dissolves
into the thumbnail rather than stepping to it. It was `--surface` until it was
measured: in dark the two are the same value and nothing showed, but in light
`--surface` is `#fbfaf8` against that `#f3f2ef` ground, so every card sat 2.4
OKL light for the length of its skeleton and dropped the moment its preview
landed. `--surface` keeps the work where being the page's raised surface is the
point — the quick-look panel, the rail buttons.

The index is bilingual (EN/DA). Every translatable string in `index.html`
carries a `data-i18n` key — or `data-i18n-aria` / `data-i18n-title` for the
attribute — and `index.js` holds the Danish table; English is the markup itself,
so it needs no entry. A new study's card copy needs its keys adding there
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

The card list is hand-maintained in `index.html`. Adding a study means
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
only file outside the study folder that a new study may touch.

The preview iframe carries its path in `data-src`, not `src`. Every card on the
page is a live component — which is the point, and also what it costs: one
thumbnail alone runs 289 dots on their own animations, and the rail drifts, so
every card eventually arrives. So two things are decided separately: whether a
preview's document exists, and whether it animates.

**Whether it animates is whether the rail is still.** A card on screen runs
while the rail is stopped; everything pauses the moment it moves, and a card
with none of it on screen is paused whatever the rail is doing.

While the rail drifts, the card at the mark runs and so does the one arriving
behind it. Everything else is held. The drift writes `scrollLeft` from a frame
callback, so a field animating under it is animating on the thread it needs, and
every visible card at once costs it plainly: measured on a throttled phone
profile, the drift's median frame goes 16.7ms to 33.3ms with all of them live.
Two keeps the median.

The arriving card is there because one alone was not enough to look at. A field
held at its first frame while it crosses the screen, starting only once it
lands, reads as broken rather than as resting — and the study this is noticed on
is the one whose whole subject is a wave, which has already missed its entrance
by the time it arrives. `markActive` stamps `data-next` on the card after the
mark; ring order is arrival order, so that is simply the next one, and it wraps
because a looping rail has no last card.

What that spends is headroom and nothing else, which is worth separating from
the thing it looks like it would spend. Dropped frame callbacks go from 9-34 in
699 to 305-336, and the rail's own motion is untouched: the drift integrates
`dt`, so the rendered advance stays even at 0 stalled frames in 599 with
sub-pixel variance (sd 0.086 to 0.254). A finger landing mid-drift still hushes
everything in 14ms against 13. So the frames it drops are frames nothing was
waiting for — the same lesson as the heavy preview further down: measure the
thread only after establishing that something on it is in the way.

None of this is `active`. The arriving card rests visibly; it does not perform.
`driftrun` and `invariant` both stay at zero samples of a card performing before
the mark, which is the rule that keeps a component from introducing itself off
to the side.

Holding *all* of them during the drift was the first answer and it was too much,
for a reason that is easy to miss: `handoff` is a coarse-pointer path — it is
what stands in for hover where there is none — so on a desktop no card is ever
`active` from the mark. Every preview therefore fell through to the drift test
and was paused, and since the rail drifts for all but the seconds a pointer
rests on it, the resting fields were paused essentially always. Measured on a
desktop with the pointer off the rail: 0 running samples in 250, the card at the
mark included. What a reader saw was the field animating for the 1400ms before
the drift sets off and then stopping dead.

**What the read mark governs is performing**, which is a different question and
`active` is what carries it. The card at the mark is told to perform; a pointer
on a card tells it too, which is what hover has always meant here. Nothing else
is. A component's open state, its entry, its loud version — all of it hangs off
`active`, so a card that is merely on screen shows its resting state and not its
performance.

### The rail demonstrates itself

Every `DEMO_EVERY` the card at the mark performs on its own for `DEMO_HOLD` and
settles back. It is there because of an asymmetry that is invisible in the code:
`handoff` is what tells a card at the mark to perform, and it returns early
unless `coarse.matches`. On a phone the card being read introduces itself; on a
desktop no card is ever told to perform except by a pointer already on it. So
the rail a desktop reader watches drift past is five resting states, and the
thing each study is actually about — the panel that rises, the toolbar that
morphs, the plate that re-inks — stays invisible until they happen to point at
one. The drift moves the cards; it never showed what they do.

It introduces no new rule. The mark picks the card, so it is the same card
`handoff` picks on touch, told the same thing, and the invariant that nothing
performs before the mark is untouched — measured over 50s of drift, 54 samples
of a card performing and none of them off the mark, none with two at once.

**A reader always outranks it.** `hoveredPiece` is what the demo asks, and it is
tracked from `pointerenter`/`pointerleave` rather than read off `:hover` — a
card that performs can move its own box out from under a stationary cursor, so
the pseudo-class goes stale exactly when the answer matters. Entering a card
drops the demo's claim without releasing it, so its timer never turns off a
state a pointer is holding, and release re-checks both pointer and focus rather
than trusting what was true when the hold began.

Leaving a card costs a full beat before the rail starts up again. Without that
the retry below is simply the next thing to run: measured, the same card opened
again 500ms after the pointer left and sat there for its whole hold, which reads
as the card following the cursor off rather than as the rail carrying on.

`DEMO_EVERY` is the **period**, one performance to the next, not the quiet
between them — the timers are set to `DEMO_REST`, which is that minus the hold.
Worth stating because the two are easy to confuse and the confusion is visible:
taken as the rest, the cadence ran at 8.2s and read as slower than it was asked
to be.

It reschedules from the last performance rather than running off an interval.
On an interval it is not a cadence at all — every beat landing while the rail is
between marks is dropped, and a dropped beat costs a whole period: measured over
20s of drift, three beats due and one performance. A beat that cannot run asks
again on `DEMO_RETRY` instead, because everything it waits on — a card back on
the mark, a pointer gone, the overlay closed — arrives without announcing
itself. Under the drift that still leaves the occasional 7-8.5s gap against the
6s norm, which is the rail being honestly between cards.

Four things silence it, and each is the same rule stated elsewhere. A coarse
pointer, because `handoff` already holds that card performing and a second
source of `active` would fight it. Reduced motion, which is what
`driftsUnasked` asks of the drift for the same reason — content that performs
unasked is the whole of the preference, and a pointer still works, which is the
half it does not forbid. A hidden document. And quick look being open, since its
own frame runs the component with real hover on the thread the overlay needs.

`hush` releases it too, and before its `told` guard rather than after: on a fine
pointer `told` is never set, so returning there would leave a demonstrating card
performing through an entire gesture, which is the one thing `hush` exists to
prevent. `markActive` releases it when the mark moves, rather than leaving it to
its own timer — under the drift the mark moves every few seconds, and a card
that kept performing as it travelled off would still be going when the next one
arrived.

Proximity used to decide performing, and it was the wrong rule. A preview woke a
scrollport before it arrived, so a card a third of the way onto the screen was
already running its open state, and a component that introduces itself on load —
the plate that inks its own line drawing — did the introducing off to the side.
By the time the card was yours to look at, the thing worth seeing had already
happened next to it.

The two were one rule for a while, and that was the error: paused was the
default and the mark was the only exception, so a card off the mark was frozen
rather than resting. A resting state is still a state — `2026-09-raster-pulse`
is a field that breathes and `2026-09-detail-reveal-card` has a ping that is the
only thing moving in it — and holding those at their first frame does not show
the component at rest, it shows it stopped. A rail of stopped cards reads as a
page that has crashed.

The cost is real and it is worth knowing where it lands. Letting the fields run
while the rail moves is what the numbers above rule out. Letting them run while
it is still costs the head of the next gesture, because the pause is a message
into five documents that then restyle everything they are animating:
`2026-09-raster-pulse` alone has 289 dots to re-state. Measured from
`pointerdown`, the worst frame in the first ten of a drag is 17ms unthrottled
either way, 67ms against 17ms at 2x, and 150ms against 33ms at 4x. So there is
nothing in it on a desktop and something in it on a slow phone, for the tenth
of a second before the hush lands. If that ever reads as a hitch, the rule to
narrow is this one — not the read mark, which is about something else.

A preview still loads paused, because a card off screen is paused and loading
happens a scrollport out. The exception is the moment it loads, and it is there
because holding a component at its first frame assumes there is something on
that frame. For one
that draws itself — the plate, again — the first frame is an empty card, and
under the drift it sits in view empty for ten seconds before it reaches the mark.
So a freshly loaded preview gets `SETTLE_IN` to reach its resting state before
the pause takes it: long enough for the slowest entry in the set, measured.

Granted off screen, which loading a full scrollport out makes the ordinary case,
and on the page's own first pass, because nothing has been read yet: the whole
rail arrives at once and the second card is a third on screen whatever the rail
does, so holding it at its first frame is not a card introducing itself early,
it is a card that never introduces itself at all. A component drawing itself
while the page loads is the page loading.

The grace runs a component once, off screen, and what arrives at the mark is the
finished drawing. The card then performs on arrival the way every other one does
— the plate re-inks under `--live`, so the drawing is still made in front of you
when it is yours to look at.

`syncVisibility` is what carries the on-screen half, from `sync` so it is read
at the same moment as everything else about the rail's position. It posts only
where the answer moved, and its rects are the same order `activeIndex` already
pays for: measured, the sweep on its own costs nothing at all — 33ms worst frame
in the first ten of a drag, the same as without it.

**Whether the document exists is two bands**, and they only load and unload.
Loading starts a full scrollport out, where it used to start a quarter of one —
a quarter put the load a third of a card before the card did, where you could
watch it happen. A load has to finish before it is looked at, so it has to start
well before, and it can afford to: an off-mark preview is paused, so a document
that exists early costs nothing but its memory.

Unloading is a ceiling rather than a routine, at a margin the current set never
reaches. It used to be routine and it was visible: navigating the frame to
`about:blank` and back brought the skeleton with it, so a card you had already
seen flashed its ground as it came into view and then played its entry animation
from the top, introducing itself again — and it put an iframe navigation into
roughly every third drag. Measured over eight drags through the set: thirteen
navigations and six of those flashes, against one and none after.

A card whose preview has not loaded yet shows its skeleton, not an empty frame.
This does mean no previews at all without JavaScript; the index already needs it
for the rail's order, its numbers and its counts.

`2026-09-raster-pulse` is far and away the most expensive of them, and worth
knowing about before measuring anything on this page. Isolating one study at a
time on a throttled phone, it costs what all five previews together cost: every
other card held a drag at 16.7ms a frame and that one alone took it to 50ms.
Pausing does not save it — a same-origin iframe takes part in this page's style
and layout passes whether or not it animates, and paused it still measured 2.6
times a card holding no document at all. `content-visibility: hidden` and
`visibility: hidden` on the frame were both tried and neither helped, for the
same reason: the child's lifecycle is not the parent's to skip.

It ran as a still render in the rail for a while because of that, and it does
not need to any more. What made the rail feel bad was never the previews: it was
the landing being animated from script, and with that gone — the gesture and its
fling both on the compositor — a heavy preview costs a busy main thread that
nothing is waiting on. The lesson is the order to look in. Measure the thread
only after establishing that something on it is in the way.

The three cards at the end of the rail are forthcoming slots — a month, a year
and a title, in a dashed frame. They are in the ring and recycle with the rest;
`real()` skips them, so the counts and the progress bar go on counting studies,
and the filter hides all three at once because a slot has no type to be narrowed
to. Three rather than one because the row reads as a set and a single trailing
placeholder reads as an accident. When a study lands, replace the slot whose
month it is.

The rail's head is one grid — `.rail__head` — holding the count, the type
filter and the carousel controls, rather than a bar with a row beneath it. The
controls span both rows and sit in the right column, so they land on the filter
chips' own bottom edge instead of floating on a line that is otherwise empty for
a thousand pixels. It takes 31px off the header, which is 31px more of the first
card above the fold.

Bottom-aligned rather than centred, because the chips and the circles are
different heights and the chips' bottom edge is the line the eye already has;
the nav's bottom padding matches the filter's so the circles finish on the chips
rather than on the scroller's box. Right-aligned to the page gutter, the same
one the masthead and the cards use.

Side by side only above 52rem, which is where all four chips still fit beside
the controls. Below it the areas restack to what they were — controls up beside
the count, chips full width underneath — because the chips lose more than they
gain: measured at 320px with the drift control showing, the scroller is left
132px and one chip of four. The grid restacks with `grid-template-areas`, so
nothing moves in the DOM and the nav is one element in both layouts.

The type filter above the rail is built by `index.js` from the `type.*` key on
each card's badge, so a study of a new type needs nothing added to it. Filtering
hides cards with a class rather than the `hidden` attribute — `.piece` sets its
own `display`, and the warning about `[hidden]` in the preview contract applies
here for the same reason. The chips are one row that scrolls sideways, never
two rows that wrap: a second line pushed the first card off the fold on a
phone, and the rail below already answers a narrow screen the same way. That
costs the focus ring two things — `overflow-x: auto` computes overflow-y to
`auto`, so the row carries top padding or the outline is clipped, and Chromium
does not scroll a chip that Tab reaches back into view, so `index.js` does it
on `focusin`. A mask fades whichever end has chips past it, so the row says it
scrolls rather than looking cut off; the mask paints against the scroller's own
border box and stays put while the chips move under it, and `index.js` sets
each end from the scroll position, because whether there is anything past an
edge is not something CSS can ask. The rail counts what it is showing and the footer
counts what exists — the masthead states neither, because the rail's own
"Study 01 / 05" is where a reader takes the total from.

### The type is stated twice, and that is the best available

`notes.md` declares `type:` and the card's badge declares `type.card`. They have
to agree, and nothing enforces it. The obvious fix — have the index read the
folder's `notes.md` — cannot work: `fetch` fails over `file://`, where each
document gets an opaque origin, which is the same wall the demo page's rendered
notes run into. The alternatives are worse. A build step contradicts the whole
repo. Having the preview report its type over the message contract only moves
the second declaration into the folder and adds a third file to keep in step.

So: two places, checked by hand, and the filter reads the one that is already
there rather than introducing a third. If this ever gets a build step, this is
the first thing to derive.
