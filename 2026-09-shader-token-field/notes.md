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
  than a muddy field.

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
  so the inscription floats inside a box that does not grow. Off the field, on
  the component's own surface, the read-out has ordinary tiers at 15.9:1 and
  6.8:1, because nothing is clamping anything there — and that surface carries
  a 1px edge in `--shader-token-field-line`, because #f0ece2 on the index's
  #f3f2ef ground is 2.00 OK ΔE and a plate that size needs to be a plate.

- **One WebGL context for the whole document, blitted.** A browser caps live
  contexts — Chromium at sixteen — and drops the oldest with no warning, which
  on the index would be a card going blank for no visible reason: the rail is
  eight previews and growing, quick look opens a ninth, and this demo page
  alone holds six surfaces. So one `OffscreenCanvas` draws every surface and
  hands each one an `ImageBitmap`, and the draw list is sorted by buffer size
  so the shared buffer is reallocated once per distinct size rather than once
  per surface — two a frame on this page instead of six. Where
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
