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
  not clamped, so the 2×2 plate and the 1×2 screen tile are still double-height
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

- **Flat, unlit colour, and the adjacencies are meant to disagree.** Nine
  fields, no gradient and no tint on any of them; the lift is a 5px offset
  block of the same ink rather than a blur, because a soft shadow would put
  light into a register that has none. The cream sits fifth in the ink strip
  rather than ninth — last, it was too close to the chalk the tile is made of
  and the strip read as though it had been cut short.

Dense packing is what makes it a bento rather than a stack: a tile too big for
the gap the cursor is on waits, and a later unit tile backfills the hole. The
cost is that visual order stops matching DOM order, so the DOM order is the one
that had to be right — it is what a screen reader announces and what Tab
follows, and the tiles are written in the order they should be read.

The row height is measured rather than chosen. A tile's face gets the row less
48px — two for the border, 36 for the panel's padding, ten for the panel's gap
to its own closed details — and the tallest thing any face has to hold is the
mark tile's 117px. 11rem is the first round figure that clears it. Every
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

The tiles hold a risograph edition, and the subject earns a line because the
first one did not survive contact with the rule above it. A `layout` study
styles its tiles properly, which means the tiles have to be *about* something,
and the first draft made them a hand-knotted rug — a made object with a spec
sheet, which fits the seven slots exactly and gives the palette tile nine
dyed fields to hold. What it does not do is give the palette a reason to be
nine. A riso does: six drums laid one over another, and the overlaps are the
other three colours, so the strip is a fact about the press rather than a row
of swatches next to a picture. The lead's drawing gets the same upgrade — an
overprint where two shapes meet, and one drum a few millimetres off register,
which is what the thing is recognised by before any of its colours are.

The three screen bands are the part that changed most. They were three warp
pitches, which is one drawing at three sizes; they are three rulings at three
angles now, and the angle is not decoration — two drums screened alike beat
against each other where they overlap, and offsetting them is what stops it.
15°, 45° and 75° is the classic set minus yellow's 0°, which is left out
because a band of horizontal rules in a tile full of horizontal type reads as
ruled lines rather than as a screen.

And a screen is a ratio, not a line width, which is what caught the thumbnail.
`preview.html` restates the hairline against the scale the index reports —
the usual correction, because at 0.35 of a device pixel a 1px rule stops being
antialiased at all — and restating it alone puts 2.86px of ink into a 3px
pitch. Measured on the card at 0.7, the three rows went from 11 / 20 / 33% ink
to 32 / 43 / 95: the fine row is not a fine screen there, it is a flat navy
block, and the tile's whole claim that these are three rulings had stopped
being true at the size most people see it. The pitches are restated with the
weight now, from the values the component itself declares, and the ratio holds
— 11 / 20 / 33 at full size and at 0.7 alike. Worth knowing generally: a
correction that scales one half of a ratio breaks it, and the breakage only
shows at the scale the correction exists for.

Contrast departure, recorded under the rule in CLAUDE.md. The lead plate's
muted tone — its kicker, the two facts in its foot, and the paragraph it opens
into — measures **3.48:1**
against the petrol, under the 4.5:1 floor and above the 3:1 hard floor. It is
deliberate and it is structural rather than careless: the plate is one of the
nine, and cream `#f3ecda` on `#2f6a63` tops out at 5.30:1 at full opacity, so
there is 0.8 of room above the floor and nothing to mute into. Clearing 4.5:1
needs 0.89 alpha, which is not a muted tone, it is the ink.

The honest cost: "500 × 700 mm" and "300gsm rag" are said nowhere else, so
this is a real departure rather than an ornamental repeat, and a darker plate
would remove it — `#1f4a47` carries the same muting at 5.00:1. It was kept
because the plate being one of the nine is the decision the whole ink strip
rests on. Everything else in the component clears AA in both themes; the
figures reach 14.11:1.

Inspiration: Tal R — the colour register only. Flat unlit fields, forms drawn
rather than traced, and colours set next to each other that are not trying to
get along. None of his compositions are here and the arrangement is this
study's own; what was taken is the refusal to shade anything.
