type: aesthetic

Source: two supplied screenshots, kept as `ref.png` and `ref2.png`.

`ref.png` is a weather widget's gradient treatment, and it is where the recipe
comes from: the two pools, the settle, and the drawing-then-blurring the folder
is named after. `ref2.png` is a stepped block set into three lines of type, and
it is where `--step` comes from — the interlock and nothing else. Not its
rounded concave corners, not its palette, and not its copy.

The widget's content is not what is being captured. What is captured is how the
colour sits on the surface: the reference could hold anything, and the gradient
would still read the same way.

Rebuilt around how such a field is *made*. The primary technique here is to draw
a few overlapping shapes in SVG and blur them past recognition — the shapes are
the instrument, not the subject, which is why they are not what the reference is
named after. A hand-written stop list reaches the same look more cheaply, so
both are kept: the drawing for surfaces that are large or moving, the stop list
for the static ones.

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
  does not composite back to full — a hairline at every tread, which is exactly
  what it looked like. So the bands overlap by `--…-step-overlap` and there is
  no shared edge left to antialias.

  **Which band grows is not a free choice**, and getting it wrong is worse than
  the hairline. The narrower of the pair has to grow toward the wider one. Grow
  the wider one and its overlap runs past the end of the tread with nothing
  beneath it — measured at 2px of ledge along 80px of tread, far more visible
  than what it was meant to fix. Descending, the upper band is the narrower, so
  it hangs under the next; ascending, the lower band is, so it reaches up
  instead. That is the second job the `--down` / `--up` modifier does, and the
  reason the first attempt at this only worked on one of the two directions.
  Either way the overlap is invisible, because the band it grows into paints
  the same field at the same absolute position over the top of it — which also
  means any size is safe, so it is set generously rather than tightly.

  **`--step` and `--drawn` do not combine in a scaled context, and that is the
  one measured limit here.** The slicing works — one drawing spans the block
  and each band clips its own slice — but a drawn band clips with `overflow:
  hidden` around a blurred SVG it renders itself, and under a fractional
  transform that clip, not the box, becomes the limiting edge. The bands stop
  joining and a light row shows at every tread. Measured in the card at 0.7:
  a row-to-row jump of 57 and 67 against 13 and 8 for the stop recipe on the
  same geometry, and extra overlap moved the first tread and not the second.
  Isolated by holding the direction and dropping `--drawn`, which fixed it, and
  by holding `--drawn` and flipping the direction, which did not — so it is the
  recipe, not the rag. So `preview.html` runs the stop recipe on both blocks,
  since the card and quick look are the two scaled paths, and the drawn pairing
  lives in `demo.html`, which is not scaled and measures a jump of 2 to 4.

  Growing upward has one more consequence, and it is the subtle one. The field
  is measured from the band's own top edge — `background-position-y` from the
  positioning area, the drawing from the padding box — so a band that grows
  upward takes the whole slice with it and stops matching the band above.
  That is not a hairline but a 2px step in the gradient at the tread, which
  looks like one. Both offsets add `--…-step-overlap` back. Growing downward
  needs no correction, since the top edge does not move, which is why only one
  of the two directions was ever wrong.

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

  The cut is one mask of three layers. The bottom one is the band proper, a
  plate inset by the radius from the left. Over it go the band's two left
  corners, each a single radial-gradient tile: the convex one composited
  `exclude`, so the sliver outside its arc is XORed back out of the plate, and
  the fillet composited `add`, so the corner between its arc and the notch
  point is unioned in. `exclude` rather than a subtract because CSS has no
  destination-out — mask layers composite source against what is below, and
  `subtract` keeps the source's non-overlapping part instead of removing it.
  XOR does the right thing in both directions here, since a convex sliver is
  wholly inside the plate and a fillet wholly outside it. `mask-composite`
  sits inside the floor `round()` already sets — Chrome 120, Safari 15.4,
  Firefox 53 — so it costs nothing extra to carry.

  The tile *sizes* are the whole reason there are no seams. Every edge of a
  sliver that is not already transparent in its own gradient lands on an edge
  the plate shares, and the fillet is a full radius wider than the strip and a
  full `--…-step-overlap` taller than its row — so it laps over the plate on
  one side and over the band below on the other, and no two antialiased mask
  edges ever meet on the same device pixel. Size the tiles to the corner
  exactly and the hairline the overlap exists to remove comes straight back,
  inside the band this time.

  Two earlier attempts, both instructive. The first clipped a pseudo-element
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
  of it.

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
  Each deeper band's floor rises by `--…-step-rise`, two radii, which keeps the
  steps monotonic through the clamp and every fillet over material.
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
itself — it is two objects again. So `--night` moved into quick look as a
variant of its own: on ink the same composition reads as colour gathered in
the middle with both narrow ends going dark, which is the axis shown rather
than described. The resting card is lighter than it was, and that is the
trade.

