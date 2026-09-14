type: layout

A board of seven tiles on a grid that is told how many columns it has and
nothing else. Each tile declares the room it wants — two columns, two rows,
both, neither — and every span clamps itself against whatever the board
currently is, so the arrangement is a rule rather than a map of where things
go. The tiles are a materials set: a pigment plate, a tone ladder, three grain
specimens, a drawn mark, two figures and a mix, all mixed from one pigment
token so the whole board re-tones from a single value.

- **One number per breakpoint, and the spans clamp themselves.** A tile carries
  `--bento-grid-tile-cols` and `-rows`; the board resolves
  `grid-column: span min(var(--tile-cols), var(--cols))`. So the three
  container queries set `--bento-grid-cols` to 2, 3 and 4 and touch nothing
  else — there is no per-breakpoint span table and no `grid-template-areas` map
  to keep in step. Without the `min()` a one-column board grows a phantom
  track to fit a two-column tile: measured, `grid-template-columns` resolves to
  `134px 8px` and the wide tiles sit 16px proud of the narrow ones.
- **Rows are not clamped, and that is what keeps the hierarchy.** Column spans
  collapse as the board narrows; row spans never do. The 2×2 plate and the 1×2
  grain tile are still double-height at one column, so the tile that led at
  four columns still leads at 320px instead of flattening into a list of equal
  rectangles.
- **Twelve cells, because twelve divides by four, three, two and one.** One
  2×2, one 2×1, one 1×2 and four 1×1. Measured at nine widths: the board
  resolves to 4×3, 3×4, 2×6 and 1×9 and fills its rectangle exactly at every
  rung, with no ragged bottom row and no horizontal overflow at 320px. Change
  the tile mix and that has to be re-checked.
- **It reflows on its own width, not the viewport's.** `container-type:
  inline-size` on the root and `@container` for the three rungs, at 22rem,
  29rem and 44rem. A viewport media query would hand the board four columns
  inside a 24rem sidebar on a 1600px page and it would overflow — which is the
  difference between a component that survives being copied out and one that
  only works on the page it was written for.
- **`--cycling` steps the ladder, because a still board cannot show a
  reflow.** `--bento-grid-cols` is registered with `@property` as an
  `<integer>`, which is what makes it animatable at all; four keyframes and
  `steps(1, end)` hold each rung for a quarter of 2.4s. It is a modifier rather
  than a hover, so the page — or a thumbnail being read — decides when. At rest
  the board is simply a board.

Dense packing is what makes it a bento rather than a stack: a tile too big for
the gap the cursor is on waits, and a later unit tile backfills the hole. The
cost is that visual order stops matching DOM order, so the DOM order is the one
that had to be right — it is what a screen reader announces and what Tab
follows, and the tiles are written in the order they should be read.

Inspiration: none — original design
