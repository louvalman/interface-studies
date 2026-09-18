type: layout

A board of seven tiles on a grid that is told how many columns it has and
nothing else. Each tile declares the room it wants — two columns, two rows,
both, neither — and every span clamps itself against whatever the board
currently is, so the arrangement is a rule rather than a map of where things
go. Each tile is also its own container, so what it shows is decided by the
slot it landed in rather than by the modifier it was given; and opening one
promotes it to the lead size, which re-packs the board and re-composes the tile
in the same gesture.

- **One number per breakpoint, and the spans clamp themselves.** A tile carries
  `--bento-grid-tile-cols` and `-rows`; the board resolves
  `grid-column: span min(var(--tile-cols), var(--cols))`. The three container
  queries set `--bento-grid-cols` to 2, 3 and 4 and touch nothing else — no
  per-breakpoint span table, no `grid-template-areas` map to keep in step.
  Without the `min()` a one-column board grows a phantom track to fit a
  two-column tile: measured, `grid-template-columns` resolves to `134px 8px`
  and the wide tiles sit 16px proud of the narrow ones. Rows are deliberately
  not clamped, so the 2×2 plate and the 1×2 ladder tile are still double-height
  at one column and the tile that led at four columns still leads at 320px.

- **Twelve cells, because twelve divides by four, three, two and one.** One
  2×2, one 2×1, one 1×2 and four 1×1. Measured at every rung: the board
  resolves to 4×3, 3×4, 2×6 and 1×9 and fills its rectangle exactly, with no
  ragged bottom row and no sideways scroll at 320px. Opening a tile breaks that
  on purpose — it is the reader asking for room, not the layout going wrong.

- **A tile answers for its slot, not for its span.** `container: bento-grid-tile
  / size` on every tile, and two queries decide the composition. Measured as
  tile content width: 15.31rem at four columns, 13.29 at three, 13.50 at two —
  and 20.38rem at one, because there is only one of it. So a unit tile is
  *wider* at one column than at four and takes the fuller composition there,
  which is the answer a span-based modifier cannot give: 1×1 is a share of a
  board, not a size. The threshold is 16rem, sitting between the widest compact
  case and the narrowest wide one. Padding lives on the panel inside the tile
  rather than on the tile, so the box a container query measures stays equal to
  the slot the grid handed over.

- **Opening a tile is the whole interaction, and it is a `<details>`.** The tile
  is an `<li>`; the `<details>` inside owns the open state and the `<li>` reads
  it back with `:has()`, promoting the tile to 2×2. The board re-packs because
  the flow is dense, and the tile re-composes because it has just become large
  enough to answer both slot queries. One gesture, both mechanisms, and no
  script: disclosure is what that element already is, keyboard, screen reader
  and find-in-page included.

- **The re-pack is moved, not disguised, and that is what `component.js` is
  for.** A grid cannot tween one: track counts are not interpolable and neither
  is a tile's placement, so every tile is simply somewhere else on the next
  frame. The View Transitions API is the only thing that moves them — it
  snapshots the old layout, lets the change happen, snapshots the new one and
  animates each named element between the two, 460ms on a decelerating curve.
  A name has to be unique per document and `demo.html` carries four boards, so
  the name is the board's index and the tile's, set for the length of a
  transition and taken off after: left on, opening one tile would animate all
  twenty-eight elements on that page to say something about seven. The
  stylesheet reaches the transition through `view-transition-class` rather than
  `::view-transition-group(*)` — the universal form would take every transition
  on the page, including ones this component has never heard of. Snapshots are
  held at `object-fit: none`, because the default stretches them across the
  travelling box and `cover` magnifies the outgoing one.

  Everything the script does is enhancement. Deleted, the tiles are still
  `<details>` and still open, the ladder falls back to its keyframes, and the
  softening it replaces — a promoted tile settling in, every tile dipping on
  the ladder's clock — comes back with it. `--scripted` is the switch, and it
  is only set where the browser can actually morph.

- **One plate, one accent, and the accent is always the same thing.** Flat and
  unlit — no gradient, no tint — and the lift is a 5px offset block of the
  same ink rather than a blur, because a soft shadow would put light into a
  register that has none. The accent marks the cells a tile is occupying and
  nothing else, in the lead's mini-board, in the span rows and on the ladder,
  so the colour means one thing everywhere it appears.

  This was nine flat fields for two rounds, meant to disagree with each other,
  and the count was what was wrong rather than any of the values. Laid out
  beside the other studies at thumbnail size it was the only polychrome card
  in the set: every one of the others spends exactly one colour — struck
  tones one amber curve, the toolbar one moss sheet, the plate one acid green
  — and a board of twelve cells arriving with nine read as a swatch chart
  before it read as an arrangement. The colour was doing the thing the grid
  was supposed to do.

Dense packing is what makes it a bento rather than a stack: a tile too big for
the gap the cursor is on waits, and a later unit tile backfills the hole. The
cost is that visual order stops matching DOM order, so the DOM order is the one
that had to be right — it is what a screen reader announces and what Tab
follows, and the tiles are written in the order they should be read.

The row height is measured rather than chosen. A tile's face gets the row less
48px — two for the border, 36 for the panel's padding, ten for the panel's gap
to its own closed details — and the tallest thing any face has to hold is the
flow tile's 101px — a drawing, a label and a line of type. 11rem is the first
round figure that clears it, and it was measured against 117px when that
drawing was larger; the constraint has since relaxed and the row has not,
because what sets it now is the lead's proportion rather than the tightest
face. Every
earlier value clipped something, and quietly: at 7rem six tiles, at 9rem four,
by 2 to 37 pixels each. Two smaller findings came out of the same sweep. A
figure set at `line-height: 1` overflows its own line box by about 0.15em,
which with an auto margin pinning it to the bottom of the face lands exactly on
the clip. And an aside gets two lines — at the narrowest width one appears at,
that is about sixty characters; one ran to seventy, took a third line and
clipped by 6px at exactly one board width.

Three things cost a measurement each and are worth writing down. An unnamed
`@container` asks the *nearest* ancestor container, so once the tiles became
containers a board-level rule was silently being answered by a 201px tile and
every tile in a four-column board took the wide composition; two containers in
one component is two names. And `--bento-grid-cols` is registered with
`@property` as an `<integer>` — without that it cannot be animated at all, and
the `--cycling` ladder jumps straight to its last rung. And `container-type:
size` applies size containment, so a tile is laid out as though it had no
contents: `grid-auto-rows: minmax(var(--row), auto)` can never grow a row to
fit an opened tile. Height-based slot queries and rows that grow to their
content are mutually exclusive, and the height half of the queries is what that
buys.

The tiles are about the board they are sitting in, and that took three
subjects to arrive at. A `layout` study styles its tiles properly, which means
the tiles have to be *about* something — and the first two drafts reached
outside for it. A hand-knotted rug, then a risograph edition: both fit the
seven slots exactly, because a made object with a spec sheet always will, and
both made the board a page about a fictional product with a grid behind it.
The tell was on the rail rather than on the demo page. Every other card in the
set says what its own study does — the dot field's card reads *no shape is
drawn here, every dot is asked where it sits*; the gradient card shows its own
three ramps with their own percentages — and this one was advertising
something that does not exist.

So the lead draws the board's own twelve cells at four columns, the span tile
draws one tile being clamped from two columns to one, and the ladder draws the
four rungs. All three are the same primitive: a row of cells with some of them
filled. One primitive rather than three pictures is the point — the
diagrams and the thing they describe are made of the same part, and re-theming
the component re-themes every drawing on it. The four unit tiles carry the
figures, which is the other thing the set does: 12 cells, 7 tiles, 460ms.

What that cost is worth naming. The nine-colour register is gone, and with it
the one decision in this study that was not about arrangement. The study is
narrower for it and that is the right trade for a `layout` study — the
contract says the type scopes the subject, and a palette that interesting was
the subject for as long as it was there.

No contrast departure, and it is worth saying what removed it rather than
leaving the section out. The lead plate's muted tone — its kicker, the two
facts in its foot, and the paragraph it opens into — measured **3.48:1** on
`#2f6a63`, recorded here as a departure under the rule in CLAUDE.md. The
argument for keeping it was that the plate was one of the nine and that cream
`#f3ecda` on that petrol tops out at 5.30:1 at full opacity, so there was
nothing to mute into. That argument died with the nine: the plate is now just
the plate, free to be whatever depth it wants. It is `#1f4a47`, the value that
note already named as the way out, and every text node in the component clears
AA in both themes — worst 4.74:1, measured by computed colour.

Worth keeping as a lesson rather than as a departure: the ceiling was set when
the plate was chosen, several steps before any type went on it, and it was
only payable because the thing that fixed the plate in place was a decision
elsewhere. Remove the constraint and the departure is not a trade any more, it
is just a darker green.

Inspiration: none — original design. It carried a Tal R line for two rounds,
for the nine-colour register and the refusal to shade anything, and half of
that is gone: what is left is flat unlit colour, which is common property and
not a debt. The arrangement was always this study's own.
