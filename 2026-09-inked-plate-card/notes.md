type: card

One card as two plates: a drawing plate and a caption plate, 6px apart, with
the two corners facing that gap cut at 45° so each reads as a piece of cut
sheet rather than as half of a rounded box. The drawing field sits on a dot
grid inside crop marks, and the line drawing inks itself on load — every path
draws at the same rate, in an order the markup declares, with no script
anywhere. The plates carry a title and a note, and the only other thing printed
on them is the number of paths the drawing took.

The drawings are three of my own: concentric squares rotating into a vortex, a
waterfall of drifting ridgelines, and a nephroid drawn as 47 straight chords
across a circle. Surfaces are porcelain, `--acid` (lime plate, ink lines) and
`--graphite` (dark plate, lime lines).

- **The card is two plates, and the seam is the point.** Not one box with a rule
  across it: an artwork plate and a caption plate, 6px apart, and the two
  corners facing that gap are cut at 45° while the outer four stay at a 14px
  radius — each plate reads as a piece of cut sheet rather than half of a
  rounded box. The cut is `mask-image` with two `linear-gradient`s and
  `mask-composite: intersect`; **intersect** is load-bearing, because mask
  layers union by default and the union of two corner cuts removes nothing at
  all. Hover widens the seam to 13px and pushes the crop marks 3px outward, so
  the two plates separate a little rather than the card lifting.

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
  between. The crop marks and the dot grid stay in px for the same reason a
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

Surfaces are `--acid` (lime plate, ink lines) and `--graphite` (dark plate,
lime lines); the default is porcelain. Each is three colour values and a dot
opacity, nothing structural. `--live` is the index's hover.

The two pages disagree about the ground and about which surface leads, and
both disagreements are the thumbnail's doing. `demo.html` keeps the dark ground
the aesthetic is built for — ink plates over a chalk plotter grid, which is
where the component lives, and where `--graphite` sits beside the default so
the pair isolates the surface: one drawing, one wipe, two colours to read it
against. It also leads with the porcelain default, which is the card to open
on: it is what the component is with no modifier applied.

`preview.html` takes the light `#f3f2ef` every study in this repo shares,
because the rail has to read as one set of cards and a dark frame among light
ones reads as a hole rather than a card. What makes a porcelain plate work on
that ground is that the plotter grid belongs to the page and not to the plate:
the grid runs up to the plate and stops, and that stop is the plate's edge,
which is why a fill four percent lighter than what it sits on still reads as an
object. Take the grid away and the same pairing needs a hairline.

It holds at thumbnail size too — the card lays the preview out at
`--preview-w` and shows it at `--preview-scale`, and at 0.7 the edge and the
vortex both survive. What does not survive is being noticed: porcelain plate on
porcelain ground inside the index's own light rail is three near-whites
stacked, and a thumbnail's one job is to be picked out of a row of them. So the
preview rests on `--acid` with the waterfall instead — the one surface with
presence in that rail that does not go dark and read as a hole, and 9 curves
that carry further than 13 nested squares at any scale. The cost is that the
card advertises a modifier rather than the unmodified default, and that this is
the loudest card on the page; porcelain is one quick-look dot behind it, and it
is still what `demo.html` opens on.

`--…-caption-min` gives the caption plate a floor, so a two-line and a
three-line note leave the card the same height. Let the caption size to its own
text and a row of these cards has a ragged bottom edge — they look like a set
until you look at where they end.

Inspiration: https://aesthetic-cards.vercel.app/ — a feature-card row, for the
two-plate construction and the cut facing corners. `ref.png` is a redrawing of
a screenshot of it rather than the screenshot, because the host is unreachable
from the build environment; checked against the original and kept.
