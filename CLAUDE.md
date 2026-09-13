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

Every preview takes it, and takes it the same way: `--preview-ground` is
`#f3f2ef` on a light rail and `#191b1e` on a dark one, two literals repeated in
every folder. That ground is the rail's rather than the component's — it is
repeated across the folders precisely so the rail reads as one set of cards,
which is an argument about the index and not about any study — so it follows
the index into dark rather than staying lit under it. A card that kept the
paper while the others went dark would read as a different kind of thing rather
than as that study's card.

What sits on the ground is still the folder's own: `2026-09-inked-plate-card`
brings its plotter grid along, in ink on the paper and in chalk on the dark.
The component is never touched by any of it, and `demo.html`'s ground is a
separate decision — that page may be ink in both themes while its thumbnail is
neither.

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

Paused is the default, and running is the exception: a preview runs only while
its card is the one at the read mark, or while a pointer is on it. It is sent
`true` on load, whenever the rail starts moving, and whenever the mark leaves
its card; `false` when the mark arrives, when a pointer does, and when the rail
lands.

At the mark means arrived, not nearest. Nearest flips at the halfway point
between two cards, which is the right answer for the counter and the progress
bar and the wrong one for whether a component should start performing — a card
half in is not being read. `ON_MARK` is how close counts, as a fraction of a
card; snap lands exactly, so it only has to absorb the last pixels of a settle.
The drift is the one exception, and has to be: it never rests, so a rule that
waits for rest would leave the index permanently still, and while the rail is
moving on its own the nearest card is the one being shown.

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

A touch release is landed by the browser, not by the rail. The gesture itself
is scrolled natively — on the compositor, off the main thread — and the rail
used to take the landing back on `touchend` and animate `scrollLeft` itself for
240ms. On a phone that swaps the platform's own momentum for an imitation of
it, running on the one thread everything else is on, and that swap is what
"not smooth between cards" was. Desktop never showed it, because the drag there
is already driven from script and a scripted settle matches what came before
it; on touch it replaced something better.

Three things have to be true at once, and each attempt at this had two of them.
The animation must not run on this thread. The rail must land on the mark, left
aligned, every time. And one swipe must be one study.

Leaving the whole landing to momentum and snap gave the first two and lost the
third. `scroll-snap-stop: always` only governs a fling if snap is on when the
browser *plans* it, and snap is off for the length of the gesture so a finger
landing on a drifting rail is not yanked — so the fling is planned
unconstrained and stops on a snap point, but not on the next one. It went too
far, and nothing made a small drag advance at all.

Aiming a `scrollTo` at a computed target gave the first and third and lost the
second, because momentum is still running when the finger lifts: an animation
started against it lands where the two happen to meet, which is a card in the
middle of the scrollport.

So `land()` chooses the card and the platform does the travelling. The fling is
cancelled first — an instant write aborts what the browser had in flight, and
that is the step the aiming attempt was missing — and only then does the smooth
scroll start, with nothing left to argue with it. `snapPos()` puts the target on
the lattice the cards actually sit on, because a gesture that began on a
drifting rail began between two of them. Snap stays off until it arrives, by
which point the rail is already on a snap position and giving the class back
moves nothing. `endLanding` carries a backstop: if the rail is not on the mark
after all, it is put there without an animation to argue with.

How far it goes is the finger's, never momentum's. `covered` is read at
`touchend`, before momentum has added anything, so it measures what was asked
for: past `SNAP_FRACTION` it is at least one card, and more only if the finger
itself crossed more than one. That is what stops a flick running through three
studies.

Waiting matters as much as the choosing: `gesturing()` counts the landing as
the rail still moving, so the recycle holds off — a write would cut the
animation short — and the read mark does not start a card until it has arrived.
`scrollend` ends it, with a timeout backstop for engines that do not send one.

The pointer path still steps itself, through `stepTo`, and keeps the old
arithmetic — `SNAP_FRACTION`, the flick floor, all of it. There is nothing
native to defer to there: the drag is scripted from `pointermove`, so a
scripted settle is consistent with it, there is no momentum to fight, and a
recycle mid-step has to be able to move both ends of the animation underneath
it.

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

**Whether it animates is the read mark.** The card the rail is sitting on runs;
every other card is paused, however much of it is on screen. A pointer on a card
runs it too, which is what hover has always meant here. Nothing else does.

Proximity used to decide this, and it was the wrong rule. A preview woke a
scrollport before it arrived, so a card a third of the way onto the screen was
already running its open state, and a component that introduces itself on load —
the plate that inks its own line drawing — did the introducing off to the side.
By the time the card was yours to look at, the thing worth seeing had already
happened next to it. Pausing holds an animation at its first frame, so entries
now play on arrival.

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

### A still card

`data-still` on a `.piece` means the rail shows a render of the component rather
than running it. `2026-09-raster-pulse` is the only one, and it is there because
it had to be: its field is 289 elements on their own animations, and isolating
one study at a time on a throttled phone, it costs what all five previews
together cost. Every other card holds a drag at 16.7ms a frame; that one alone
takes it to 50ms, in every phase — the drag, the settle and the rest after it.
Pausing does not save it, because a same-origin iframe takes part in this page's
style and layout passes whether or not it animates: paused, it still measured
2.6 times a card with no document at all. `content-visibility: hidden` and
`visibility: hidden` on the frame were both tried and neither helped, for the
same reason — the child's lifecycle is not the parent's to skip.

What it costs is the index's premise, on one card out of five, and the premise
is only bent rather than broken: quick look still opens the live component, at
full size, with nothing else on the page moving. The rail is where the premise
was unaffordable, not the study.

`still.png` lives in the study folder and is a photograph of `preview.html` the
way `og.png` is one of the masthead — a render kept as a file because nothing
runs the page to make it. Render it at `--preview-w` by `--preview-h` at 2x,
with the page background forced transparent, so the rail's own ground shows
through in both themes and one file is right in each. It is not `ref.png`, which
is someone else's interface and never goes on this page.

The frame stays in the markup and is never loaded. The path lives on it, and
quick look, the theme rewrite and the date fallback all read it; `loadPreview`
returns early on a still card, and CSS takes the frame out of the layout and
drops the skeleton, which has nothing to wait for.

Reach for this only with the measurement in hand. A study is allowed to be
expensive — that is a decision it is entitled to make — and the rail is the
wrong place to litigate it. This is what to do when one study's cost is the
whole page's.

The three cards at the end of the rail are forthcoming slots — a month, a year
and a title, in a dashed frame. They are in the ring and recycle with the rest;
`real()` skips them, so the counts and the progress bar go on counting studies,
and the filter hides all three at once because a slot has no type to be narrowed
to. Three rather than one because the row reads as a set and a single trailing
placeholder reads as an accident. When a study lands, replace the slot whose
month it is.

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
