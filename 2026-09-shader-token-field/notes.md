type: aesthetic

A gradient field written as a token block. Eight numbers and three colours
declare what the field is — how coarse, how far it is pushed around, how hard
it is lit, and how light it is allowed to get — and the same declaration is
read twice: once by a stop list that needs no script, and once by a WebGL2
fragment shader that draws the same recipe on the GPU. A plate, a band and a
read-out are what it is shown on; the read-out prints the numbers the field is
actually running on, including the contrast ratio the block guarantees.

- **The uniforms are the token block.** `--shader-token-field-scale`, `-warp`,
  `-relief`, `-octaves`, `-grain`, `-flow` and the three colours are custom
  properties on the root class, and `component.js` reads every one of them
  with `getComputedStyle` before it touches a uniform. Override
  `--shader-token-field-pool-a` from a parent and both renderings change
  together, because both read that one declaration — which is the test
  CLAUDE.md sets for a property block, applied to a thing that normally lives
  as a literal in a JS object. The colours need a probe element to get out:
  an unregistered custom property comes back from `getComputedStyle` as the
  string it was authored as, so `oklch(60% .1 150)` arrives as text and
  `parseFloat` gets nothing — writing it to an element's `color` and reading
  the computed value back hands the parsing to the engine, which resolves hex,
  named, `hsl()` and `oklch()` alike. `--octaves` is the one value clamped
  rather than trusted: GLSL wants a compile-time loop bound, so the fbm loop
  runs to a constant 8 and breaks on the token, and the token is clamped to
  1–8 before it gets there. A block editable from outside by design is a block
  someone can put 500 in, and an unbounded loop count is a hung GPU rather
  than a muddy field. `--form` is the second of those, and it selects rather
  than scales: 0 dunes, 1 veins, 2 terraces. The distinction matters at the
  point the uniforms are eased. Every quantity in the block chases its target
  across `--settle`, which is what makes a palette change a transition instead
  of a cut — but there is no halfway between two generators to render, so
  `--form` and `--octaves` snap while the rest ease. Leaving `--form` out of
  the snap list was the one bug this cost: it kept its load-time value, the
  variant switched everywhere else, and the field went on drawing dunes. It
  took a measurement to see — the edge energy of the three forms came back
  identical to three decimal places — because two palettes of the same
  material look exactly as different as two palettes of different ones.

  Palettes and forms are separate axes and compose freely, which is what a
  token block buys that a set of finished pictures does not: four palettes and
  three forms are twelve states, and none of them was authored. A palette
  restates all eleven declarations rather than patching the ones it wants
  changed — a modifier that inherited half its values would leave the other
  half answering to whichever palette ran last, and the band in particular has
  to move with the colours or the clamp holds the field to a range the new
  pools do not live in.

- **The clamp is what makes the light affordable, and the light is what makes
  the clamp real.** Every fragment's WCAG relative luminance is clamped into
  `--lum-floor`/`--lum-ceil` before it is encoded, so the worst-case ratio
  against the ink is a property of the two tokens and not of where the noise
  landed: 0.22 against `#14120f` is 4.81:1, and the read-out computes it
  rather than asserting it. The order matters in both directions. A clamp over
  the colour mixing alone would never fire — those are convex blends, relative
  luminance is linear, so a blend of colours inside the band is provably
  inside it, which is also why the no-script stop list needs no clamp of its
  own. What leaves the band is `--relief`, the sheen on the field's ridges and
  the shadow in its troughs. Measured over the default plate: 25.7% of pixels
  sit outside the band before the clamp and 0.00% after; on the night version,
  8.7% and 0.00%. The two exercise opposite ends of it — the light version
  overshoots the ceiling, at 0.988 against 0.72, and the night one bottoms out
  under the floor, at 0.000 against 0.01, which is the sheen and the shadow
  respectively. The relief *scales* the colour rather than adding to it,
  which was a correction — added light is added white, and at this strength it
  swamped the chroma of anything dark, turning the night field into grey
  plateaus with its palette gone. A scale preserves chromaticity exactly. The
  clamp's two halves are asymmetric for the same kind of reason: lifting a
  fragment to the floor is a mix toward white by `(floor − Y) / (1 − Y)`,
  which lands exactly on the floor and cannot leave the gamut, where the
  obvious scale-up clips a channel at 1.0 and drops the fragment back under
  the floor — the guarantee failing precisely on the pixels that needed it.
  Lowering to the ceiling is a scale, which cannot clip.

  The guarantee is checked rather than asserted, and the check is worth having
  written down because it is cheap: read the rendered pixels back out of the
  canvas, convert each to relative luminance, and count the ones outside the
  band the block declares. Across all four palettes and all three forms, at
  rest, that count is 0.0000% — `field` 0.22–0.72, `verdant` 0.24–0.70,
  `night` 0.01–0.14, `ember` 0.012–0.13, and the two new forms on the bands
  their palettes bring. How hard the clamp is working varies and is the more
  interesting number: 27.5% of `field`'s pixels sit on a band edge against
  7.3% of `terraces`', because quantising the field into treads flattens the
  ridges the relief was lifting, so there is less for the clamp to catch.

  One thing the check does not cover, and it is the one place the ratio is
  briefly weaker than the read-out claims. Switching palettes eases the band
  ends along with everything else, so for the length of that transition the
  field is clamped to an intermediate band while the ink has already changed —
  measured going light to `night`, 7.3% of pixels sat above the target ceiling
  2.5 seconds in, and the field converged clean by ten. That is the settle
  working as designed rather than the clamp failing: every frame is correctly
  clamped to the band that frame is running on. It is recorded here because a
  guarantee with a transient in it should say so.

- **One ink goes on the field, and that is the clamp's bill rather than a
  style.** A second, muted tier needs a lighter ink, and against a floor of
  0.22 anything lighter than about `#2a2622` is already under 4.5:1. So the
  hierarchy on the field is size and tracking — an 11px kicker at 0.18em over
  an 18px line at 500 — and not colour. Muting into a clamped field is the one
  thing the clamp cannot give you, and it is worth knowing before the palette
  is chosen rather than after the type goes on. The line is 18px rather than
  the 15px it was first set at because size is carrying the whole of that
  hierarchy: at 15px over three lines the statement was a paragraph competing
  with the field behind it, and on the index, where the card is drawn at 0.7,
  it was 10.5px of body copy and read as texture. One sentence at 18px leads
  the plate at both sizes, and it costs nothing — the plate is aspect-locked,
  so the inscription floats inside a box that does not grow. It also stopped
  saying `ceiling` and `floor`. Those are the names of two tokens — `--lum-ceil`
  and `--lum-floor` — and the sentence was borrowing them to describe the
  thing they configure, which reads as precision to whoever wrote them and as
  nothing at all to a reader meeting the component cold. Sample copy is read
  by someone who does not have the token block open; it says what the
  component does in the words anyone would use for it, and the read-out beside
  it is where the numbers live. Off the field, on
  the component's own surface, the read-out has ordinary tiers at 15.9:1 and
  6.8:1, because nothing is clamping anything there — and that surface carries
  a 1px edge in `--shader-token-field-line`, because #f0ece2 on the index's
  #f3f2ef ground is 2.00 OK ΔE and a plate that size needs to be a plate.

- **One WebGL context for the whole document, blitted.** A browser caps live
  contexts — Chromium at sixteen — and drops the oldest with no warning, which
  on the index would be a card going blank for no visible reason: the rail is
  eight previews and growing, quick look opens a ninth, and this demo page
  alone holds fifteen surfaces across eleven roots — three states, seven
  specimens and the one in the lightbox. So one `OffscreenCanvas` draws every
  surface and hands each one an `ImageBitmap`, and the draw list is sorted by
  buffer size so the shared buffer is reallocated once per distinct size
  rather than once per surface. That is what makes the specimen rows
  affordable at all: per-context they would be past Chromium's cap on this
  page by themselves.

  The lightbox is the case that shows the sizing is doing real work rather
  than being a formality. Its component is in the markup at load, because
  `boot()` runs once and a root added afterwards is never set up — and it
  costs nothing while the dialog is shut, since a closed `<dialog>` is
  `display: none`, `measure()` gets a zero rect and returns false, and the
  draw is skipped. Opening it gives the surface a size and it starts. Where
  `OffscreenCanvas`, `bitmaprenderer` or WebGL2 is missing, nothing happens at
  all and the stop list stands, which is not a fallback so much as the other
  half of the study: the two are one recipe rendered twice, and the read-out's
  last row says which of them you are looking at.

- **The pause is a token, because no CSS rule can stop a render loop.** Every
  other study on the index answers `preview:pause` with one global rule —
  `animation-play-state: paused !important` — and that rule does exactly
  nothing to `requestAnimationFrame`. So the loop answers
  `--shader-token-field-run` instead, and `preview:scale` arrives the same
  way as `--shader-token-field-buffer-scale`, which sizes the drawing buffer
  for the pixels that will actually be shown rather than the ones this
  document is laid out in — a card lays its preview out at 480 and shows it at
  336, and the grain, one hash per fragment, is the part that notices. Both
  are written as inline custom properties from outside, `--live` arrives as a
  class, and one `MutationObserver` on `style` and `class` catches all three:
  nothing is read per frame. What is advected is a phase the loop accumulates,
  not the clock, so raising `--flow` speeds the field up from where it is
  instead of jumping it. Reduced motion draws one frame and never schedules
  another, which is the same rule as the pause and for the same reason.

Inspiration: none — original design. The construction is ordinary — value
noise, fbm, a domain warp — and the study is not about it; what is being
worked out is whether a GPU field can be a palette rather than an asset, and
what it costs to promise a contrast ratio through one.
