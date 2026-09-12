type: aesthetic

A gradient recipe and the surfaces that demonstrate it. Colour gathers at two
off-centre pools near one edge and settles to the surface's own base at the
other, so a shape reads as lit from a direction rather than as a two-colour
blend — and the same recipe is re-projected onto every shape, so a tile, a
circle, an arch, a pill and a full-width band all take the same light.

There are two ways to make that field and both are kept, because they are good
at different things. The stop list is a hand-written set of radial and linear
stops: cheap, static, exact. `--drawn` replaces it with two or three
overlapping shapes in SVG blurred past recognition, which is how such a field
is actually made — the overlaps supply mid-tones a stop list has to be tuned
into producing, and a shape with points leaves soft spokes no arrangement of
stops will give you. `--mix` puts both on one surface and cross-fades between
them.

`--step` is the odd one in the set and the reason the recipe has to be
re-projectable: a block of bands, one per line of type, each starting where its
own label ends, so the ragged end of the copy is the staircase and the field
runs across all three bands as one shape.

- **The gradient is drawn, then blurred.** `--drawn` swaps the stop list for
  an SVG of two or three overlapping shapes blurred past recognition.
  The overlaps supply the mid-tones a stop list has to be hand-tuned to
  produce, and shapes with points — a star, a leaf — leave soft spokes that no
  arrangement of radial stops will give you. Two things make it work: the blur
  is a ratio of the surface rather than a fixed length, so it dissolves by the
  same amount at any size — and the ratio is per drawing, since a dense one
  (a mosaic, a scatter, stacked bands) averages to a single flat colour at the
  0.26 a few large shapes want, and needs 0.1 or less; and the artwork bleeds 22% past the frame
  before being clipped, because blur samples the transparency outside the
  drawing and a fitted drawing fades to a vignette at every edge. `--raw`
  shows the same drawing before the blur, which is the useful half when
  building a new one. It carries no construction outline: at half fill-opacity
  the shapes already read from their own edges, and a stroke around each one
  fences off the overlaps — the part of the drawing actually worth seeing.
  `--…-raw-stroke` puts an outline back for anyone who wants one.
  On `--night` a drawing also has to cover the frame. Where the artwork leaves
  a gap the base shows through, and that gap reads as a highlight on paper but
  as a hole on ink — a mosaic with empty cells and crossed bands with open
  diamonds both blur to a blotchy field there, so they stay on the light
  themes and the night set is drawn edge to edge.

- **The two recipes can be cross-faded, not only swapped.** `--drawn` drops
  the stop list — `background-image: none` — because there the drawing IS the
  surface, and that makes the swap a cut: nothing is underneath to fade into.
  `--mix` keeps both on one surface, the drawing over the stops, and
  `--…-mix` is its opacity: 1 is the drawn surface, 0 is the stopped one,
  and the middle is a genuine double exposure of the two. It is the only part
  of this recipe besides the base that interpolates, which is what lets a state
  be *eased through* rather than cut to — the index card rests at 1 and
  dissolves to 0 when it is looked at.

  The curve is symmetric on purpose, and that took measuring. A quint ease-out
  looks right on a single element and is the wrong shape for a cross-fade: it
  was down to 0.28 a fifth of the way in and spent the remaining three fifths
  between 0.09 and 0 — a fast fade with a long dead tail, which reads as a cut
  followed by nothing. `cubic-bezier(0.65, 0, 0.35, 1)` over 520ms keeps the
  change in the middle, where both images are on screen together and the double
  exposure is the whole effect. Measured through it: 0.99, 0.92, 0.71, 0.30,
  0.08, 0.01, 0.

  One thing it has to borrow from `--drawn`: on a `--step` band the drawing is
  sized to the whole block and anchored right, not to the band. Left off, each
  mixed band drew its own copy and the field broke into three with a hard step
  at every tread.

  **A card in a rail can carry a slow colour drift, if the colour never moves.**
  The index card holds the drawing three times, each copy tinted once in the
  markup and never again, and cross-fades between them on a three-second beat:
  1.5s of fade against 1.5s held, so the field is always about to change rather
  than occasionally changing.
  The obvious version — one drawing whose hues are transitioned — looks
  identical and is the expensive one: `fill` interpolates, so every frame of
  the fade re-runs the blur on every band. Measured in the card with the rail
  being dragged, that dropped 3 to 5 frames per fade; re-tinting a hidden copy
  before fading it in is no better, because the re-tint rasters it, and that
  landed one 83 to 117ms frame on every step. Fixed copies raster once at load
  — 36 to 86ms for all eighteen — and after that a step is opacity on layers
  whose contents never change.

  It still needed `will-change: opacity` on the drawing, which is why that
  lives on the modifier rather than in the preview: the first frame of a
  cross-fade otherwise has to raster the layer it is bringing up, and a blurred
  layer is not cheap to raster. Measured over nine seconds, one 66.7ms frame
  per step without it and a clean 16.8ms maximum with it. With it on, the
  drift costs nothing the rail can see: dragging the rail through the whole
  cycle came back 60fps with zero frames over 20ms.

- **Two radial pools over a vertical settle, never a single linear ramp.**
  Colour gathers at two off-centre origins near the top edge and dissolves
  outward; a `linear-gradient` underneath carries the last of it down to the
  base. One linear ramp corner-to-corner is what makes cheap gradients band —
  the eye finds the axis. With the pools offset from each other there is no
  axis to find, and the falloff stays smooth at any size.
- **It settles to the surface colour, not to a second hue.** The bottom ~40%
  is plain `#fff`. That is what makes the shape read as lit from one corner
  rather than as a two-colour blend, and it is why body copy can sit on the
  lower half without a scrim.
- **Saturation drops faster than lightness.** The hot stop is the only
  saturated colour; the wash stop is already half-way to the base. Fading a
  gradient by lightness alone leaves a muddy middle — dropping saturation first
  keeps the mid-tones clean.
- **One recipe, re-projected per shape.** `--drawn-gradients-art` is declared
  once and every surface uses it; the shape modifiers change only
  `border-radius` and `aspect-ratio`. The pools are positioned in percentages,
  so a circle, a pill and a full-width band each get the same light from the
  same relative direction rather than needing their own gradient.
- **Content type is a ratio of the surface, like the radius.** The figure,
  label and micro line are `calc()`s of `--…-size`, not fixed rem. Set in rem
  they stayed put while the card scaled, so a card shown small kept
  full-size type and the label ran outside its own box. The ratios resolve to
  the original values at the default size; only the legend that *names* a set
  keeps a fixed size, because it sits beside the surfaces rather than on them.

- **The corner radius is proportional, not fixed.** `12%` on the tile, so the
  squircle character holds whether the shape renders at 96px in a thumbnail or
  at 400px on a page. A fixed `border-radius` in px reads as a different shape
  at each size.

Themes (`--dawn`, `--dusk`, `--mint`, `--ice`) set only the three colour stops;
shapes (`--tile`, `--circle`, `--arch`, `--pill`, `--card`, `--band`) set only
geometry; `--drawn` / `--raw` pick the recipe; `--night` moves the base the
colour settles to, and `--rise` turns the settle around. The axes compose
freely, and the set is laid out along the
colour one: the thumbnail reads orange, mint and night down its three rows, and
the demo groups twelve drawings three to a family — so a drawing can be read
across colours and a colour across drawings. Blue is the family that carries
two themes, `--dusk` and `--ice`, and its label carries a swatch for each.

Nothing is shown blurred whose drawing is not beside it: the set runs two
pairs to a row, six drawings and twelve tiles over three rows of one colour
family each. A field with no drawing next to it is just a gradient, and the
step between the two is the point.

Four tiles across is what then fixes the width — 452px at the component's
own 6.5rem, which is why `--…-width` defaults to 30rem; at 26rem the fourth
tile wrapped. The thumbnail scales the same markup down to 5.5rem rather than
sizing it to fill: at full width the tiles ran to the edges of the 456px frame
and the card read as cropped, where 392px sits in it with a margin. A
thumbnail is a picture of the set, not a container to fill.

- **Three gaps, widening outwards.** The set nests three deep — a drawing
  against the field it becomes, pairs along a row, rows as colour families —
  so each level has its own: `--…-pair-gap`, `--…-gap`, `--…-row-gap`, each
  following the one inside it unless a caller sets it. One uniform gap gives
  all three the same reading and the eye cannot tell which two tiles belong
  together; 8px, 24px and 40px in the thumbnail make the pairing legible with
  no caption to carry it. `.drawn-gradients__pair` exists for that and
  nothing else: flex `gap` is a single value for a whole row, so two tiles
  cannot sit closer to each other than to the next two unless the pair is a
  box of its own. Everything else — pool origins and
reach, blur and bleed, where the colour has fully settled — is a custom
property, so a new theme is three values and a new shape is one.

Each shape sets a width off `--…-size`, which is a length and knows nothing
about the column it lands in — so every surface also carries `max-width: 100%`.
A phone is narrower than the card at 2.15x or the pill at 1.85x, and a surface
that insisted on its width there would scroll the page sideways rather than
fit. Because the radius and the type are ratios of the surface, a fitted one is
still the same shape, only smaller.

- **`--step`: geometry that comes out of the copy.** The other shapes are
  things to look at; this one exists to be used, and it is not a shape at all.
  It is one band per line of type, each starting where its own label ends — so
  the ragged end of the copy *is* the staircase, at whatever constant gap
  `--…-step-gap` sets, and renaming a label moves its step.

  The first version drew a fixed `clip-path: polygon()` staircase with the
  treads at a third and two thirds. That aligned to the line *heights* and
  nothing else, which is the wrong half of the source: there, the left column
  is left-aligned so its ends are ragged, and the shape follows that rag at a
  constant gap — the longest line gets the shallowest step. With a fixed
  polygon the longest word landed on the deepest step and nearly touched the
  fill, while a short one sat in a gap twice the size. A staircase that is not
  a measurement of the text is decoration standing next to it.

  Which puts a constraint on the sample copy, and it is the one thing about
  this shape that has to be authored rather than derived. The band measures
  the LABEL — it starts where the label ends — while the reader's eye sees a
  bar with a number beside it and reads the bar as measuring the number. The
  two are only ever consistent by hand. So the rows are ordered longest label
  to smallest value, and every value carries the same unit: 34% / 61% / 82%
  against "Overlapping art" / "Flat colour" / "Wash". Before that it was
  03 / 0.85 / 82% — an index, a ratio and a percentage in one column, none of
  them comparable, the widest band carrying the one that could not be ranked
  at all. Mixed units also left the value column ragged where it is set flush
  right. Rename a label and the step moves; change a value and nothing moves,
  which is exactly why the copy has to be kept in that order.

  Three bands read as one field because **they share a right edge**. Anchor the
  image there with `background-position-x: right`, give every band the same
  `--…-step-field` width — a length, never a percentage, which would resolve
  against each band's own differing width — and the horizontal phase matches
  across the rows. Vertically each band shows its own slice: the image is drawn
  `--…-step-rows × --…-step-row-h` tall and `--…-step-row` on the band offsets
  it by that many row heights. Both in lengths, and that is deliberate — an
  earlier pass sliced by percentage, which resolves against (band height −
  image height) and so ties the slice to however the box happened to round.
  Row gap has to be 0 as well, or the break shows as a seam across the field;
  the type takes its air from `--…-step-row-h` being taller than the line.

  **Two separate things keep the bands reading as one shape**, and the first
  one alone was not enough. The band height is snapped to whole pixels with
  `round(down, …, 1px)`: at the ratio alone the rows came out 56.4375px, so a
  band's own top edge sat a fraction away from where its slice of the gradient
  began. That is the one modern-CSS floor this folder carries (`round()`:
  Chrome 125, Safari 15.4, Firefox 118), and worth knowing before copying the
  file out.

  It fixed the slice and left the edges. Whole pixels in here are not whole
  pixels out there: the index scales the whole preview by 0.7 for a card and
  quick look picks its own factor, so integral edges land on fractional device
  pixels once transformed. Two boxes meeting on a fractional boundary each
  paint partial coverage of the same device pixel row, and partial over partial
  does not composite back to full. So the bands overlap by `--…-step-overlap`
  and there is no shared edge left to antialias.

  **Mask tiles are worse than boxes here, and it is worth knowing before
  copying the file out.** Chromium snaps a mask layer's tile rect to whole CSS
  pixels, and rounds each layer independently. Two tiles computed to meet at
  y 635.56 — a corner disc ending there and the strip beneath starting there —
  landed at 635 and 636: a full pixel of nothing between them, drawn as a white
  hairline straight across the shape, the width of the corner. That is what
  `--…-step-cut-bleed` is for, on both axes, and why it is a pixel and a bit
  rather than a hair: it has to cover the worst rounding either way. Nothing in
  this mask may share a boundary with anything else.

  **Which band laps over which is not a free choice**, and getting it wrong is
  worse than the hairline. The narrower of the pair has to reach toward the
  wider one. Reach the other way and the overlap runs past the end of the tread
  with nothing beneath it — measured at 2px of ledge along 80px of tread, far
  more visible than what it was meant to fix. Descending, the upper band is the
  narrower, so it hangs under the next; ascending, the lower band is, so it
  reaches up instead. That is the second job the `--down` / `--up` modifier
  does, and the reason the first attempt at this only worked on one of the two
  directions.

  **And that still left a seam, which took a different kind of measurement to
  find.** Three passes at this reported the treads clean, because the probe
  sampled a single column. Sampling the *whole* tread, averaged across the
  band and compared against the gradient's own row-to-row step, shows a single
  device row at every tread jumping 5 to 32 times that step — in both
  directions, at 1x, 2x and 3x, and present in all three of those earlier
  builds. It was never fixed; it was never looked at properly.

  Isolating the bands one at a time is what explained it. At the seam row the
  band underneath is fully opaque and exactly right; the band on top
  contributes its own antialiased first row, and that row's colour does not
  match. Two boxes at different offsets rasterise the same gradient into two
  different textures, and under a fractional transform a partial-coverage row
  samples one of them at a slightly different place. Compositing that sliver
  over the band beneath lands the row off the gradient's own progression.
  Swapping the gradient for a flat colour drops the same seam below 1%, so it
  was never a coverage gap — which is why widening the overlap only moved it,
  fading the edge only smeared it, and equalising the band heights did nothing.
  The box *tops* are what differ, and they have to.

  **So every band's box is the whole block.** A band is pulled back up by its
  own offset down the block — `margin-top: calc(-1 * --…-step-top)` against a
  height of the full three rows — and the row it actually shows is a mask
  window rather than the box. Identical boxes rasterise identically, so at a
  tread the two bands are sampling one texture and a partial row over a full
  one composites back to the colour it already was. The row windows of two
  neighbours still overlap by `--…-step-overlap`, so no two mask edges land on
  the same device pixel either. Every tread now measures 1.1 to 2.4 times the
  gradient's own row step, which is to say indistinguishable from the gradient.

  It is also what lets both recipes share one mechanism, which an intermediate
  version did not: the stop list paints the field as the box's own background,
  `--drawn` hangs its SVG in the same box, and neither has an edge at a tread
  to disagree about. Only the vertical offsets had to move — counted down the
  block now instead of from a box edge, which is what `--…-step-top` and
  `--…-step-bottom` carry. Everything horizontal is still measured from the
  band's own box and needed no change.

  Two costs, both paid in the same place. The band overlaps its neighbours'
  rows completely, so it carries `pointer-events: none` or it would swallow
  their labels. And a corner cut used to sit at the very edge of the masked
  box, where anything past the row was outside the box and clipped for free;
  on a box that spans the block there is no such edge, so the cut and the row
  window became two mask layers whose boundaries land on the same y and
  rasterise independently. One device row where the window says "in" and the
  cut says "not yet" leaves the plate showing through — a light line the width
  of the rounded corner, sticking out past the step, measured at 0.44 alpha.
  `--…-step-cut-bleed` runs on both axes for that, and each tile grows on the
  side *away* from the arc it carries, because the arcs are anchored to a tile
  corner and growing the wrong edge drags the arc with it.

  **`--step` and `--drawn` used to be the one measured limit here, and are not
  any more.** A drawn band clipped with `overflow: hidden` around a blurred SVG
  it rendered itself, and under a fractional transform that clip, not the box,
  became the limiting edge: the bands stopped joining and a light row showed at
  every tread. Measured in the card at 0.7, a row-to-row jump of 57 and 67
  against 13 and 8 for the stop recipe on the same geometry. Giving every band
  the same box removed it along with everything else — the drawing hangs in a
  rectangle that is already the whole block, so there is no per-band offset
  left to disagree about, and the mask clips it instead of `overflow`. Both
  recipes now measure clean at every scale from 0.5 to 1.0 and at 1x, 2x and
  3x. `preview.html` still runs the stop recipe on both blocks, but that is now
  a composition choice rather than a constraint.

  **So `--down` or `--up` is a requirement, not a decoration.** It is what
  tells a band which of its left corners is exposed and which of a pair may
  grow to cover the join, and both answers change with the direction. A block
  without one gets square step corners and a hairline at every tread, and there
  is no fixing that from inside CSS: in a rag that goes out and back the
  narrower band is the upper one at one tread and the lower one at the next, so
  no single rule holds. Which makes a non-monotonic rag a misuse of this shape
  rather than a variant of it, and the demo deliberately carries no state for
  one — rendering the defect would be advertising it. Pick monotonic labels and
  declare which way they run.

  **`--drawn` works in a `--step` block, and it needed the same slicing.** The
  drawing is an absolutely-positioned child rather than a background layer, so
  left alone each band rendered its own complete drawing and the field broke
  into three. Sized to the whole block and offset by the band's share of the
  rows — anchored right, like the background, because the right edge is what
  the bands share — one drawing spans all three and each band's overflow does
  the clipping. The bleed is a ratio there rather than the percentage `--bleed`
  uses: a percentage inset resolves against each band's own box and would scale
  the drawing differently on every row. The drawings' existing
  `preserveAspectRatio="slice"` covers the wide block rather than letterboxing
  it, so nothing had to be stretched.

  Two things that fall out of using it, and they are why the thumbnail pairs
  the two recipes rather than drawing both blocks. `--night` cannot settle to
  ink under a drawing — the base only shows where the artwork does not cover,
  and on `--night` the artwork has to cover, so the dark foot of the block
  simply goes. And the two recipes do not use the same stops: the stop list
  reads `--hot` and `--warm` twice and never touches `--cool`, where a drawing
  fills from all three. So a theme is a different colour depending on which
  recipe renders it — `--arc` is magenta as a stop list and cyan-violet as a
  drawing. The pair shows exactly that: the stop recipe above, the drawing
  below, one silhouette, and the same three labels.

  `--…-step-radius` is applied corner by corner, and it is a length off
  `--size` rather than the proportional radius the other shapes use, because a
  percentage radius would resolve per band and the bands are different widths.
  It is `0.15 × --size`, which is 0.30 of a row height, and that number came
  off `ref2.png` rather than off taste: its shape measures a 28px convex step
  radius on a 92px row, and its concave corners are of a piece with it. An
  earlier pass at 0.07 was half as round and read as a stepped box with the
  corners taken off rather than as one flowing silhouette. There is a ceiling
  at 0.25, where a band's two left corners would meet and the left edge would
  lose its straight run — three stacked pills again.
  A radius on every corner of every band reads as three stacked pills with gaps
  at the treads — the opposite of the one shape the slicing exists to make — so
  only the corners on the block's outer boundary take one.

  Four hold whichever way the rag runs: the first band's top pair and the last
  band's bottom pair. Only the two on the *right* edge are still radii once a
  direction is declared, though, because the whole left edge of a directional
  band is cut by a mask instead — and it has to be.

  **Both corners on the left edge are one mask, and the concave one is
  filleted.** Neither of them can be a border-radius. The step corner is convex
  but sits at the band's *visible* left edge rather than at its box corner, and
  the concave corner has to have material **added** into the notch — an arc
  centred out in the empty region rather than inside the shape — where a radius
  only ever removes material from a box.

  What makes both possible is to let the band's box run one radius past its own
  left edge: a negative margin of that much, so flexbox hands the band the
  extra width and the visible edge stays exactly `--…-step-gap` from the label.
  Everything that paints the field is anchored to the band's *right* edge
  already — `background-position-x: right` for the stop recipe, `right` and
  `width` for `--drawn`'s SVG — so extending the box leftward moves nothing.
  The field is already painted across the strip; all that is left is to cut it.
  No measurement is involved anywhere, which is the part that took three
  attempts to see: the notch's position comes from the band's own layout, never
  from the label's width.

  The silhouette is one mask of five layers and **every one of them unions
  in** — nothing subtracts, and that is the whole reason the corners come out
  clean. Bottom to top: a deep strip inset a radius past the visible edge and
  spanning the band's row window, a shallow strip out to the visible edge
  stopping short of whichever corners are rounded, the band's two left corners
  as discs opaque *inside* their arcs, and the fillet.

  The version before this subtracted the corners out of a full-width plate,
  and it left a rough spot at every convex step corner. A subtract removes
  material down to the arc, so if the arc and the straight edge do not render
  at exactly the same x the difference shows as a **step** in the boundary —
  and they do not: a gradient stop and a radial arc disagree by about half a
  pixel, varying with pixel ratio, which is not something CSS gives you a way
  to reconcile. Measured, the boundary jumped 3.2 device px a couple of rows
  before the tangent point. A union cannot fail that way: where two layers
  disagree the leftmost simply wins, so the same half pixel becomes a
  sub-pixel bulge in a curve rather than a jump in a line. The same corners
  now measure continuous to 0.01 device px.

  Two details make the union airtight. A union of two layers that merely touch
  gives 0.75 at the seam, not 1 — the first attempt at this drew white hairlines
  along every join — so each corner disc bleeds past its tile on both axes,
  into the strips it meets. The bleed lands inside the disc, which is inside
  the silhouette, so it costs nothing.

  **Every straight run is feathered too, the same width the arcs are.** The
  first version of the union left them as hard tile edges, which was
  measurably correct and visibly wrong: razor-sharp lines against softly
  antialiased curves read as two different shapes stuck together, and the
  radius looks blurred rather than the line looking crisp. Both strips carry
  the ramp now — the shallow one across, for the vertical edges, the deep one
  down, for the treads. Nothing subtracts any more, so a ramp cannot punch a
  notch the way it could when a plate was being subtracted from; two feathered
  layers meeting union to slightly more coverage, which is a hair of extra
  roundness at the tangent rather than a gap.

  A window edge on the block's own outer boundary used to be the exception and
  stay hard, because half a centred ramp there falls outside the box. It is not
  an exception any more; see the outline note further down for what it cost and
  how the tile is clamped instead.

  Feathering a tread does cost something, and it is worth knowing before
  copying this out. In the part of a tread that is interior — right of the
  narrower band's edge, where the two bands overlap — a partial row now blends
  the two bands' rasters of the same field, and they differ by a hair. It
  measures about 4 against a gradient step of 0.8, invisible at 8x, where the
  hairlines this folder spent its life chasing measured 37 to 50. The check
  script's floor is set at 6 for exactly that reason.

  And **every layer is anchored to the band's own left edge**: tiles at
  `left 0`, every distance a length measured from there, both strips' edges
  gradient stops rather than tile boundaries. That sounds like housekeeping and
  is not. A tile placed at `left <length>` and a tile placed `right 0` with a
  computed width round to device pixels independently, so an arc anchored to
  one and a straight edge anchored to the other land up to a device pixel
  apart — which is exactly a nick where the radius turns into the line.
  Measured at 2.3 device px, at every convex step corner, and at 3.0 where the
  fillet met the edge. Anchored alike they agree to 0.2.

  The plate is the layer doing the subtracting, not the cuts, and that reads
  upside down from how one would say it out loud. Mask layers composite source
  against what is below, and `subtract` is source-out: it keeps the source
  where it falls *outside* the destination. CSS has no destination-out, so the
  only way to get "the plate minus its corners" is to put the corners
  underneath and let the plate subtract them.

  The first version used `exclude` instead, which is XOR, and is algebraically
  the same thing whenever a cut is wholly inside the plate. It was wrong, and
  it took pixel measurement to see why: it left a **0.22-alpha hairline running
  up the outside of every rounded step corner**. The plate was then a solid
  tile inset from the left, so the band's visible left edge was a mask *tile*
  edge — and Chromium snaps those to whole device pixels. Measured across that
  edge: 0.00 straight to 1.00, no intermediate value anywhere along it. The
  cut's own edge is a gradient and is not snapped. XOR of 1 against 0.78 is
  0.22, so rather than cancelling, the two layers disagreed by exactly the
  amount they were misaligned. Under `subtract` the same disagreement is
  harmless — outside the plate the result is zero whatever a cut says — so a
  cut may now overshoot the edge by `--…-step-cut-bleed` and cover it whole.

  Which is also why the plate is a gradient rather than a tile: a ramp a pixel
  wide across a full-box layer puts the band's left edge exactly where it
  belongs. Measured, an edge whose true position is 23.2 now reads 0.80 at
  column 23 — the correct coverage — instead of snapping to 23.

  **A mask is an image, so its arcs get whatever antialiasing the gradient
  itself carries** — not the coverage antialiasing a `border-radius` gets for
  free. At a hard stop (`#0000 0 99%, #000 100%`, a ramp of one hundredth of
  the radius) an arc rasterises to about one bit of coverage per pixel and
  stair-steps beside the radius corners it is supposed to match: 0 of 7
  boundary rows antialiased against 6 of 7 for a `border-radius` on the same
  block, and a circle-fit RMS of 0.20 device px against 0.056. Ramping instead
  — `--…-step-feather`, centred on the radius so the arc stays put — turns that
  around completely.

  **One DEVICE pixel of ramp, not one CSS pixel.** A whole CSS pixel is right
  at 1x and far too much above it, and the difference is exactly what a soft
  edge next to a crisp one looks like: at 3x it spreads the arc over four
  partial device pixels where the browser's own `border-radius` spends one, so
  the curves carry a halo and the straight runs do not. Measured against a
  control at the same radius, ours came out 2/3/4 partial device pixels at
  1x/2x/3x against the control's 1/2/1. A gradient stop is authored in CSS
  pixels, so the only way to say "one device pixel" is to say it once per
  ratio — four `min-resolution` blocks, each also spelled
  `-webkit-min-device-pixel-ratio` because `resolution` only reached Safari in
  16 and the floor here is 15.4. Rounded up rather than down at each step,
  because a ramp *thinner* than a device pixel is the failure that started
  this: it gets point-sampled and the arc stair-steps again.

  Scaled to the ratio, every arc measures 1 to 2 partial device pixels — the
  same edge the browser draws — fully antialiased at 2x and 3x with a
  circle-fit RMS of 0.024 device px against 0.139 for the control, tangent to
  the band's edge and the tread within 0.11 device px, and fitting a radius of
  38.42 against the 38.40 it asked for. A whole CSS pixel of ramp had been
  eating half a pixel of that radius. The mask corners are now the *rounder*
  ones on the block, and the boundary walks down the left edge with a worst
  excess jump of 0.02/0.16/0.29 device px at 1x/2x/3x.

  **The whole outline has to be the mask's, or half of it is aliased.** Getting
  the ramp right only fixed the edges the mask actually drew. The rest of the
  silhouette was the box's: the right edge, the block's outer top and bottom,
  and the four outer corners came from the element's own background and
  `border-radius`. A background edge is snapped to whole device pixels, so the
  longest straight run in the shape rendered with NO antialiasing at all —
  measured 0 partial device pixels there, and at every ascending tread, against
  1 on the left edge and 1 on the arcs. Crisp is not the same as correct: a
  snapped edge also sits up to half a pixel from where it belongs, and beside a
  ramped edge it reads as a different kind of line. Three moves take it back:

  - a **rim** layer on top of the union, the only one that does not `add`. It
    is opaque across the band and ramps over the last feather, `intersect`ed
    with everything beneath, so the same ramp lands on whatever reaches the
    edge — the shallow strip and the deep one alike — without a second copy of
    either. The silhouette ends half a feather inside the box.
  - **every** tread ramps, the two on the block's own boundary included. Those
    were left hard on the grounds that half a centred ramp would fall outside
    the box and be clipped to half coverage — true, and the wrong fix. The tile
    is clamped to the box instead and the ramp runs inward from it.
  - the bottom ramp is authored **two feathers wide, three quarters of a
    feather past the window edge**, and the top one is not. No principle in it,
    only measurement: a ramp at the far end of a gradient renders about a
    device pixel shorter and earlier than the same ramp at the near end, and at
    one feather every bottom-facing edge came back aliased while every
    top-facing one did not. Swept, that pair is what lands the tread's
    half-coverage point on the arc's tangent — 0.25 device px off, against 0.50
    at half a feather and 0.83 at one feather wide.

  Every edge of the shape now measures one partial device pixel at 1x, 2x, 3x
  and 4x — left run, right edge, outer top, outer bottom, both kinds of tread,
  both arcs — which is what "one line" has to mean before it can be seen.

  **`clip-path: shape()` was built and measured first, and it is the wrong
  tool here** — worth writing down, because it is the obvious answer. One path
  per band, analytically antialiased by the browser, no ramps, no bleeds, no
  per-ratio feather: the whole apparatus above collapses. It draws correctly
  on the first try. But a band is an element, the bands overlap, and a clipped
  element's antialiased edge composited over its neighbour leaves a
  one-device-row colour fringe along every join — measured 21% of the way to
  the page on a drawn block and 6% on a stop one, with the two bands' fields
  proven identical either side of it. The overlap is not optional (see the
  hairline note above), and one element per block is not available either,
  because a band's width is flex layout's answer, not a number this file
  knows. It would also move the floor to Chrome 130 / Safari 18.4 / Firefox
  139. A mask multiplies coverage inside one element and has no such join.

  The fillet's own tile is sized past its corner for the same reason the bands
  overlap: a full radius wider than the strip and a full `--…-step-overlap`
  taller than its row, so it laps over the plate on one side and over the band
  below on the other. Size it to the corner exactly and the hairline the
  overlap exists to remove comes straight back, inside the band this time.

  So three earlier attempts, all instructive — the XOR one above, and two
  before it. The first clipped a pseudo-element
  with `inset(… round …)`, and `inset` can only cut *convex* corners — so it
  kept a quarter-disc centred on the step point, the exact complement of a
  fillet: it bulged out of the notch instead of easing into it. The second
  fixed the arc with a radial-gradient mask but left the pseudo tangent to the
  band's *box* bottom, which the overlap has already carried
  `--…-step-overlap` past the tread — so most of the fillet sat under the next
  band and what showed was a sliver. Both also stopped at the stop recipe: a
  pseudo-element has nothing to inherit from a drawn band but its flat base
  colour, and would have painted a solid wedge in the notch. Cutting the band
  itself is what lets `--drawn` fillet like anything else, because the band's
  own drawing is what paints the notch. Nothing in the markup changed for any
  of the three.

  The leading is 1.3, not 1. The label clips its overflow so it can ellipsise,
  so at a leading of 1 — where the line box is exactly the font size — the
  descender of a g did not merely touch the band below, it was cut off.

  The layout has two grid columns, not three, and that is the load-bearing
  part. The labels must **not** be a shared column — a grid column would level
  their ends and take the geometry away — so each line is its own flex row
  inside column one, and only the values get a shared column, which is what
  gives every band the same right edge to anchor to.

  Two things it gives up. The bands meet edge to edge, so no border and no
  shadow: a ring would draw a grid across the field and a shadow would fall on
  the band below. And a long label at phone width consumed its whole line and
  left that band at zero, so the band carries a `--…-step-min-w` floor and the
  label yields instead — truncated, it still measures correctly, because the
  step follows the label's *rendered* end. A shortened label is still a label;
  a missing band is a hole in the field.

  The floor is per band, not one number for all three. With a single value
  every clamped band resolves to the same width, so at phone width the
  staircase flattened — and a fillet at a tread of zero width has no band under
  it to ease into, so it painted as a small tab hanging off the edge instead.
  Each deeper band's floor rises by `--…-step-rise`, and the two radii in it
  are not slack. A tread has a convex corner of radius R at one end and a
  fillet of radius R at the other, so **a step narrower than 2R cannot hold
  both**: the fillet's overlap runs past the lower band's own rounded corner
  and hangs off the edge as a tab, which is what a generous radius looked like
  at 320px before the rise was raised to match. The overlap on top of the two
  radii keeps the fillet's left edge clear of that band's left edge, so the
  two never share an antialiased boundary. The rise having to fit in a clamped
  line is also the real ceiling on how round this can go — though at 320px
  with the demo's 8rem type the labels ellipsise to four characters at any
  radius, so it turned out not to be the radius paying for it.
  `--…-step-min-w` came down from 0.45 to 0.4 of `--size` in the same pass, so
  the deepest band still lands where the single floor used to put it.

  Choosing the copy is now choosing the geometry, which takes three things.
  The edge only reads as a *staircase* when the labels are monotonic: long to
  short walks the step left down the block, which is the source's case, short
  to long walks it right, and a rag that goes out and back gives an edge that
  goes out and back. All three are the construction telling the truth about
  the text, so the demo shows all three rather than only the flattering two —
  and it shows them with **one word set in three orders**, so the only thing
  changing between the states is the ordering.

  Monotonic means *rendered width*, not character count. "Full settle" is
  eleven characters and measures 148px against the 160px of the nine in "Wash
  pool", which quietly broke the first ascending set — the step went out and
  came back. The set is picked off measured widths instead.

  And the steps want to be evenly spread, or two of them crowd and the third
  is left out on its own. The line here runs 323px from the label's start to
  the bands' shared right edge, so a step at each quarter wants labels of
  81 / 162 / 242: "Wash" is 85, "Flat colour" 163, "Overlapping art" 243, which
  lands them at 26 / 50 / 75%. That last one also set `--…-step-min-w`: at the
  floor's first value the band kept 11px that the label needed, and the label
  ellipsised rather than the step landing where it was aimed.

  No container query and no `clip-path` in the end. An earlier pass reached for
  `container-type: inline-size` to scale the type, and paid for it: size
  containment stops a box reporting its content width upward, so the block
  collapsed to nothing in the shrink-to-fit parent the thumbnail uses. The
  field length is a ratio of `--size` instead, which every band inherits from
  the same root.

- **`--arc`: the theme drawn for ink as readily as for paper.** Three stops
  like every other theme. Its wash stop is the least saturated in the set on
  purpose — against a dark base a mid-tone has to carry luminance rather than
  chroma, or the settle turns to mud halfway down. It is the only theme here
  that is electric rather than atmospheric, and it is what the thumbnail leads
  with.

- **`--rise`: the settle run the other way, so a pair can fade away from
  itself.** The recipe has one axis — the colour gathers at the top edge and
  dissolves toward the bottom — and this modifier moves it to the bottom
  edge instead. It is what the thumbnail's composition is built on, and it
  came out of that composition rather than being invented for the set.

  Two `--step` blocks stacked with their rags walking out from the middle put
  the two widest bands next to each other and the two narrowest at the outer
  ends. Left alone both blocks settle the same way, so the pair reads hot,
  faded, hot, faded — two objects that happen to be stacked, and each one's
  faded end butting against the other's hot end at the middle. Flip the upper
  one and the colour gathers where the blocks meet and dissolves outward into
  the page at both narrow ends: one field with the type cut out of it, fading
  away from itself in both directions.

  It costs three custom properties and no new geometry, because the two pool
  `y` values are authored as **distances from the gathering edge** rather than
  as absolute positions — `--…-settle-edge` says which edge that is,
  `--…-settle-sign` which way to count from it, and `--…-settle-angle` turns
  the linear settle underneath. The radial extents are symmetric about their
  own origin, so moving the origin is the whole change; the existing state
  that retunes the pools by hand reads the same, since at the default edge and
  sign a distance and a position are the same number.

  `--drawn` paints no stop list at all, so the flip has to reach the drawing
  or it would be a silent no-op on that recipe. The artwork is mirrored
  instead, which is the same statement — whatever gathered at the top of it
  now gathers at the bottom. In a `--step` block each band renders its own
  copy of the drawing, sized to the whole block and offset so the copies
  coincide, so mirroring each about its own centre lands them all in the same
  place and the field still spans the bands.

  What it does not carry is content. `.drawn-gradients__value` and the rest
  sit in the *lower* half of a surface because that is where the default
  recipe has settled and nothing needs a scrim; under `--rise` the settled
  half is the top, and content would sit on the hot end. So it is for the
  surfaces that carry none — every `--step` band, and any bare shape.

The thumbnail no longer shows the twelve-tile set. Two reasons, and they are
about the index rather than about the component. At thumbnail size twelve
surfaces read as a colour picker instead of as a piece, where every other card
in the rail shows one object. And the set is laid out along the colour axis, so
the card led with the warmest, lightest themes in the folder. It now shows the
one composition — `--step` used twice, mirrored, with `--rise` on the upper
block so the colour gathers where the two blocks meet and dissolves out to the
page at both ends — and quick look steps the colour axis through it.
The page ground stayed a constant `#f3f2ef` in the same pass: the rail only
reads as one set of cards if the ground behind them never moves, so a dark
surface is the surface's business and not the page's.

What that cost is the one dark surface in the rail. The upper block used to
settle to ink, which anchored the card and advertised `--night` from the index;
the mirrored pair settles into the page at both ends instead, and a base that
is ink at one end and paper at the other is not a pair fading away from
itself — it is two objects again.

**So ink became what being looked at means.** The card's hover — and, on a
touch device, the card in the read position, which is the same message —
moves what the field settles *to*, from the page's ground to ink. The hues,
the shape and the direction all stay put; one axis moves. It is the better
home for `--night` than a quick-look dot was, for the same reason the ground
is a constant: the rail reads as one set of cards only if nothing behind them
moves, so the resting card settles into the page, and the dark version is
something the card does when you look at it rather than a state to pick out
of a list. The resting card is lighter than it was, and that is the trade.

The surface eases into it rather than cutting, because the base is the only
part of the recipe that *can* ease: a `background-image` of gradient stops
does not interpolate, so a theme swap is a cut whatever you ask for — but
`--night` moves the base, the border and the shadow and nothing else, which
are all animatable. `--…-ease` is the one duration in the file, and the
transition lists those three properties only; naming the gradient would cost
a repaint and change nothing.

The other thing hover could have moved is the settle *direction* — swapping
`--rise` onto the lower block, so the pair fades inward instead of outward.
Built, looked at, dropped. The widest bands carry most of the field's area and
they are precisely the ones that wash out, so the staircase stops reading at
the exact moment the card is being looked at: two saturated tips with a pale
gap where the shape used to be. Ink does the opposite — it keeps the
silhouette and sharpens it against the page — which is the test for a hover
state on a thumbnail. It has to make the component *more* legible, not less.

Neither route is the component's own `:hover`, and that is deliberate. A card
thumbnail has pointer events off, so the index sends the message; quick look
runs the same file with pointer events on, where a `pointerenter` listener in
`preview.html` fires instead and no message arrives. Both call one function.
A `:hover` rule in `component.css` would have been wrong anyway: settling to
ink is a thumbnail's editorial decision about its own resting state, not
something a gradient field does when a pointer crosses it.

Inspiration: two supplied screenshots, kept as `ref.png` and `ref2.png`. The
first is a weather widget, for the two pools and the settle; the second a
stepped block set into three lines of type, for the interlock — the geometry of
`--step` and nothing else about it.
