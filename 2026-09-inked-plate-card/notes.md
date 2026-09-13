type: card

One card as two plates: a drawing plate and a caption plate under it, the same
width, 6px apart. The four corners that face each other across that gap are
rounded harder than the rest — 30px against 14px — so the two plates turn
towards each other at the seam and away from it everywhere else, which is what
keeps the pair reading as two plates rather than as one box with a line through
it. The drawing field sits on a dot grid inside a bracketed frame, and the line
drawing inks itself on load — every path draws at the same rate, in an order
the markup declares, with no script anywhere. The plates carry a title and a
note, and the only other thing printed on them is the number of paths the
drawing took.

Six drawings, all of them constructions rather than pictures: concentric
squares rotating into a vortex, a waterfall of drifting ridgelines, a nephroid
drawn as 48 straight chords across a circle, 14 circles shrinking off-centre
into an orbit, nine nested Lissajous figures at 3:2, and a 7×7 grid bulged
around a point into a lens. Six surfaces, each a pair of colours rather than a
brightness: porcelain, `--acid`, `--graphite`, `--ochre`, `--indigo` and
`--chalk`.

- **The card is two plates, and the seam is the point.** Not one box with a
  rule across it: a drawing plate and a caption plate, 6px apart, and the
  four corners facing that gap are rounded to 30px while the rest stay at 14px,
  so each plate turns towards the other at the seam and away from it everywhere
  else. Hover widens the seam to 13px and reaches the bracket frame two dots
  further along the grid, so the two plates separate a little rather than the
  card lifting.

  Those corners were a 45° chamfer first, cut out of each plate with a
  `mask-image` per corner and `mask-composite: intersect` — intersect being
  load-bearing there, since mask layers union by default and the union of two
  corner cuts removes nothing at all. It is a sharper idea than this card
  wants: a chamfer is a cut edge, which says *sheet stock*, and everything
  else here — the plotter drawing, the soft plate, the annotation — is calmer
  than that. Rounding the same corners says the same thing about the seam and
  says it in one property. The whole mask apparatus came out with it, which is
  the rare change that is both a design decision and less code.

- **Both plates are the same width, and the seam is what separates them.**
  Two plates of equal width stacked with a gap can read as one box with a line
  through it, and the first answer to that was to narrow the caption to 72% —
  a label under a plate, with the step all on the right. Built, looked at,
  dropped: once the facing corners round towards each other the pair reads as
  two plates at any width, and the narrowing was solving a problem the corners
  had already solved. It cost more than it looked, too — a third off the note's
  measure, so the copy had to shorten and the caption's floor had to go up to
  three lines to keep the cards level.

  `--…-caption-w` keeps it one value away, and the corner rule follows the
  width on its own: *a corner takes the seam radius when there is a plate
  directly across the gap from it*. At 100% that is all four. Narrow the
  caption and the drawing plate's bottom right faces the page instead, so it
  wants the card's own radius back — a seam corner answering something that is
  not there is the one thing this rule is for.

- **The frame around the drawing is made of the field's own dots.** Four
  corner ticks around a field is a printer's registration device, and it was
  the most borrowed thing left on this card — furniture that arrives with a
  construction and stays because nobody asks what it is for. It was a hairline
  first, then a hairline with a rounded elbow, and the elbow was the tell: a
  drawn line needs a corner treatment because it is a foreign object on the
  plate. Painted with the tile the drawing field already uses — same pitch,
  same dot, printed in the plate's ink rather than the field's grey — the card
  is down to two kinds of mark, the plotted line and the grid, and the frame is
  made of the second one. It reads as the grid saying where the field ends
  rather than as a rule drawn around it.

  Everything about it is a count of dots. An arm is five of them, the band that
  catches them is one tile, and the eight mask bars — two per corner — union,
  which is what mask layers do by default, so the corner dot is shared by both
  arms of its bracket and no compositing is involved. There is no radius left
  anywhere in it: a dotted run has no corner to round, which is the part of
  this that deleted a problem rather than solving it. The concentric bottom
  corners and the mask square derived off the biggest radius both went with the
  hairline that needed them.

  The ink is the field's too. A version that printed the brackets in the
  plate's full-strength ink was built first, on the grounds that a mark should
  be legible, and it is the wrong instinct here: it makes the frame a different
  mark that happens to share a lattice. Same dot, same weight, and what
  separates the frame from the field is position alone — the grid continuing
  past the edge of the field. It is quiet, and it survives the thumbnail's 0.7
  and a phone, which is all it has to do. `--…-crop` stays its own property
  rather than being `--…-dot` spelled twice, so a caller can re-ink the frame
  without touching the field; none of the six surfaces carries a crop colour of
  its own any more.

  The tile repeats with `round` rather than `repeat`, and that is what stops a
  frame made of dots from having a defect built into it. A tiled background is
  cut off wherever its box ends, so unless the field is a whole number of cells
  wide the last column and the bottom row come out as half a dot — flat-sided
  against round ones, which is invisible in a mock-up and obvious on a screen.
  The card is 300px of field at its own width and lands clean; at the 348 the
  thumbnail asks for it is 3px over and every edge dot is shaved. `round`
  scales the tile a hair so a whole number fits — 4.971px instead of 5 at that
  width. A pitch nobody can see moving, against a clipped dot anybody can. It
  is on the field and the frame alike, and the two stay in step because both
  tiles start at their own left edge and the frame's box is a whole number of
  pitches wider, so the rounding lands them within a tenth of a pixel.

  The one number that is load-bearing is the inset: it has to be a whole number
  of pitches, because the tile paints its dot in the middle of every cell. On
  the pitch the outermost column lands 2.5px inside the frame's edge and is
  drawn whole; off it the column lands on the edge and every bracket loses half
  its outer row, which is what -8px did.

  Hover reaches the brackets two dots further along the grid instead of pushing
  the whole frame outward, which is the move the hairline made. The frame has
  to stay on a whole pitch to keep its dots whole, and the next pitch out is
  3px from the plate's edge; growing the arms says the same thing and never
  leaves the lattice.

- **The plate is annotated with what the drawing is made of.** The caption
  plate's right-hand slot says `13 paths`, `9 paths`, `48 paths` — a fact about
  the artwork above it that changes when the drawing does. It stands where two
  pieces of borrowed furniture used to be: a catalogue number at the top right
  of the drawing plate, which said nothing a single card does not already say,
  and a ⋮ in the caption, which promised a menu this component has not got.
  Both are the kind of thing that arrives with a construction and stays because
  nobody asked what it was for. Moving the one annotation down also separates
  the two plates by job: the drawing plate carries the title and the drawing,
  the caption plate carries the prose and the measurement. It sits on the
  note's first baseline rather than at its box top, because 10px mono against
  13px text aligned flush at the top reads as two lines that missed each other.

- **`pathLength="1"` is the whole reason the draw needs no JavaScript.** Every
  path declares its length as 1, so `stroke-dasharray: 1` and a single keyframe
  pair from `stroke-dashoffset: 1` to `0` draw a 16-unit crosshair and a
  500-unit ridgeline at exactly the same rate. Nothing has to measure a path,
  which is the only thing that would have forced a `component.js`. The drawing
  order is `--i` inline on each path — the one thing the markup carries that is
  not geometry — multiplied by the stagger to get the delay.

- **Six constructions, and none of them is a picture.** A drawing here is a
  rule applied n times — that is what makes it a plotter's subject rather than
  an illustration, and what lets the ink animation mean something: you watch
  the rule being carried out. Three were already here; the three added extend
  the range rather than the count. *Orbit* is 14 circles whose radius shrinks
  as their centre drifts, so a set of concentric rings becomes a funnel.
  *Rosette* is nine nested Lissajous figures at 3:2, scaled 0.34 to 1 with a
  0.06 phase drift — the drift is what keeps it from being one figure drawn
  nine times. *Lens* is a 7×7 grid displaced radially from a point.

  Lens took a second attempt, and the reason is worth keeping. The first
  version pushed every point *away* from the centre by a Gaussian falloff,
  which is singular at the origin: the two grid lines that pass within 4 units
  of it get pushed in opposite directions along their length, and each came out
  with a visible kink. Resampling did not fix it, because the kink is in the
  field and not in the sampling. The profile is `u · e^(1−u²)` now, which is
  zero at the centre and peaks at `σ/√2`, so the displacement is continuous
  everywhere and the grid reads as a lens rather than as a hole with a fault in
  it. The name followed the fix: it bulges, so it is a lens.

- **A surface is a pair of colours, not a brightness.** Each of the six sets a
  plate, an ink, a line and two alphas, and they are not a light-to-dark ramp:
  `--graphite` draws lime on near-black, `--indigo` draws a tint of its own
  plate three steps lighter, `--ochre` puts brown on the most saturated plate
  in the set because a true black there reads as a warning sign rather than as
  a drawing, and `--chalk` differs from the porcelain default by hue alone at
  the same weight. That last pair is the one worth having: a set with no near
  neighbours is a palette, and the interesting question about a surface is
  whether it survives sitting next to the one it nearly is.

- **The stagger is per drawing, not per component.** 34ms across the vortex's
  13 squares, 44ms across the waterfall's 9 ridgelines, 12ms across the
  envelope's 48 paths — so all three finish within about the same second. One
  shared interval cannot do that: at 34ms the envelope runs past a second and
  a half, and at 12ms the waterfall is finished before the eye catches it
  starting.

- **Re-inking on hover, and the name swap that makes it possible.**
  `inked-plate-card-redraw` is a byte-for-byte copy of
  `inked-plate-card-draw`, and it exists only because changing
  `animation-name` is the one thing that restarts a running CSS animation.
  Crossing back out swaps the name back and the card re-inks on the way out
  too — kept deliberately, because the alternative is snapping to the finished
  state, and a drawing that re-inks on both crossings reads as a plotter that
  answers the pointer.

- **Line weight in viewBox units, type in rem.** `stroke-width: 1.15` is in the
  drawing's own coordinates, so the weight shrinks with the card instead of
  getting heavier as the card gets smaller — a card at 320px is the same
  drawing, only smaller. The type does not scale: 18px/500 title, 13px note,
  and a 10px mono count at 0.14em tracking, three sizes with nothing in
  between. The bracket frame and the dot grid stay in px for the same reason a
  hairline does.

Where there is no pointer, nothing is lost, because the draw is a load event
rather than a hover one — the component's whole behaviour happens before anyone
touches it. `(hover: none)` still gets the re-ink on `:active`, held for the
length of a press, and the card is an `<a>` so `:focus-visible` reaches the
same state from a keyboard.

The one thing CSS cannot do here is wait until the card is on screen: the draw
runs on load whether or not anyone is looking. On the index that is covered for
free — the preview message contract already says when a card has scrolled into
the read position, and `--live` is the class the component has for it, so the
index's observer stands in for the one the CSS has not got. Off the index,
`prefers-reduced-motion` drops the drawing *of* the drawing and leaves the
finished lines, which is the honest reduction: the artwork is the component,
the wipe is not.

Surfaces are `--acid`, `--graphite`, `--ochre`, `--indigo` and `--chalk`; the
default is porcelain. Each is a handful of colour values and two alphas,
nothing structural. `--live` is the index's hover.

`demo.html` is laid out one drawing to a row, three surfaces across. The axis
matters: a page grouped by surface compares colours and says nothing about the
constructions, where a row holding one drawing on three plates isolates exactly
the thing the surface is supposed to be doing — one drawing, one wipe, three
colours to read it against. The trio rotates down the page, so no two rows show
the same three and the page covers eighteen of the thirty-six pairings without
repeating one. A full matrix of all thirty-six would be a colour picker.

It keeps the dark ground the aesthetic is built for — ink plates over a chalk
plotter grid, which is where the component lives — and it opens on the exact
card the index shows: `--acid`, the waterfall, the same title and note. The
porcelain default would be the tidier choice on paper, being the component with
no modifier applied, and it is the wrong one. A thumbnail is a promise about
what is behind it, and a page that opens on a different card than the one just
clicked spends its first moment making the reader check they landed in the
right place. The default is one row down, first in its own row, which is early
enough. The last row is the only one that is not about looking: it holds the
two states that are about behaviour, the re-ink and a note longer than the
caption plate's floor.

`preview.html` takes the bare `#f3f2ef` every study in this repo shares, and
the `#191b1e` they all take on a dark rail — the ground and nothing on top of
it. The plotter grid stays on `demo.html`, where it is this study's own
staging, and it does not come to the rail. It used to, on the argument that
the grid is the component's context rather than the page's, and that argument
loses to the one the ground is there to make: the rail is five studies side by
side, and a card with a surface under it while the other four have none reads
as a different kind of card before it reads as this one. Every folder repeats
those two literals precisely so the row holds together, which is an argument
about the index and not about any study in it — `2026-09-liquid-glass-toolbar`
leaves its cross-lit stage on the demo page for the same reason.

What that costs is the porcelain plate's edge. The grid used to draw it: the
grid ran up to the plate and stopped, and the stop was the edge, which is why a
fill four percent lighter than what it sits on read as an object at all. On the
bare ground the pairing is #e8ebe4 on #f3f2ef and nothing else, so the edge is
carried by the fill alone — legible at full size, faint at 0.7, and the one
place the shared ground is paid for rather than free. Left as a fill rather
than answered with a hairline, because a border the component does not
otherwise have would be the preview reaching into the plate, and quick look
opens porcelain at full size where the two near-whites have room to separate.

It is not the resting variant in any case, and for a separate reason: porcelain
plate on porcelain ground inside the index's own light rail is two near-whites
stacked, and a thumbnail's one job is to be picked out of a row of them. So the
preview rests on `--acid` with the waterfall — the one surface with presence in
that rail that does not go dark and read as a hole, and 9 curves that carry
further than 13 nested squares at any scale. The cost is that the card
advertises a modifier rather than the unmodified default, and that this is the
loudest card on the page; porcelain is one quick-look dot behind it, and it is
still what `demo.html` opens on.

`--…-caption-min` gives the caption plate a floor of two lines plus its
padding, so a one or two line note leaves the card exactly the same height.
Let the caption size to its own text and a row of these cards has a ragged
bottom edge — they look like a set until you look at where they end. The floor
tracks the measure rather than being a constant: it went to three lines while
the plate was narrowed and came back down with the width, and set above the
longest ordinary note it levels nothing and leaves the note floating in air.

Inspiration: https://aesthetic-cards.vercel.app/ — a feature-card row, for the
two-plate construction and the cut facing corners. `ref.png` is a redrawing of
a screenshot of it rather than the screenshot, because the host is unreachable
from the build environment; checked against the original and kept.
