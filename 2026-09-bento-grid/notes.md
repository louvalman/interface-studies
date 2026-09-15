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
  not clamped, so the 2×2 plate and the 1×2 weave tile are still double-height
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
  and find-in-page included. A grid cannot tween a re-pack — track counts are
  not interpolable and neither is a tile's placement — so what softens it is a
  dip: the promoted tile settles in over 300ms, the revealed detail arrives
  rather than appears, and under `--cycling` every tile dips and returns on the
  ladder's own clock, which turns a jump cut into a settle. Genuinely tweening
  the re-pack needs the View Transitions API and therefore script, which this
  study does not carry.

- **Flat, unlit colour, and the adjacencies are meant to disagree.** Nine
  fields, no gradient and no tint on any of them; the lift is a 5px offset
  block of the same ink rather than a blur, because a soft shadow would put
  light into a register that has none. The cream sits fifth in the colourway
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
motif tile's 117px. 11rem is the first round figure that clears it. Every
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

Inspiration: Tal R — the colour register only. Flat unlit fields, forms drawn
rather than traced, and colours set next to each other that are not trying to
get along. None of his compositions are here and the arrangement is this
study's own; what was taken is the refusal to shade anything.
