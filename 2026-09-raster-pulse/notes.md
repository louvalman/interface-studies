type: card

Source: https://x.com/chalaska — a three-up poster set for a protocol identity.

An extraction, not a copy. The reference supplies a *construction rule* rather
than a layout: a square field of discrete dots where every dot's state is
decided from where it sits, over a quiet typographic footer that does none of
the shouting. The product name, the wordmark, the logo and the copy are exactly
the parts that had to go — the mark here is a 2x2 of circles that follows the
field's own rule and nothing else: dots on a pitch, never wider than the pitch
they sit on. It started at 1.065 of its pitch, which is to say the dots
overlapped, and read as a blob at every size under 20px; at 0.78 they are four
dots with a 1.4px gap at the 14px the footer renders them at, and still one
mark rather than four. The field itself runs 0.46 at rest and 0.88 at peak, so
the mark is inside its own vocabulary either way. The headline is placeholder
text that describes the mechanism instead of selling anything. The
set's three-up presentation went too: the three posters are three values of one
component, so they are patterns on a modifier, not three components.

- **The dot carries a coordinate; the stylesheet carries the shape.** Each of
  the 289 `<i>` elements holds nothing but `--x` and `--y`, running −8..8 with
  0,0 on a true centre cell (the field is odd-numbered for exactly that
  reason). `component.css` derives the rest: `max(|x|,|y|)` for the square-ring
  index, `hypot()` for the radius, `atan2()` for the bearing. A pattern is then
  three formulas on `.raster-pulse__dot` — `--on` (is this dot in the shape),
  `--tone` (which of the two colours), `--phase` (0..1, where it sits in the
  wave) — which is why `--pinwheel`, `--halftone` and `--scan` are one class on
  the root and not one grid each, and why none of it needs JavaScript. The
  booleans are arithmetic: `clamp(0, v * 1000, 1)` steps a signed test to 0 or
  1, `max()` is OR, `min()` is AND — that is the whole of the halftone's
  "inside the disc, or past 6.5 on both axes at once". `abs()` is written the
  long way as `max(v, -1 * v)` on purpose: everything else here (hypot, atan2,
  sin, mod, round) is Chrome 125 / Safari 15.4 / Firefox 118, and `abs()` alone
  would have moved that floor to Chrome 133.

- **One animation, 289 delays.** Every dot runs the same three-stop keyframe at
  the same duration, and the travelling wave is one declaration:
  `animation-delay: calc((var(--phase) - 1) * var(--spread) * var(--dur))`. The
  `- 1` makes the delay negative, so the field is already mid-pulse on the
  first frame instead of sitting dark for a cycle. The bright window is 0–16%
  of the cycle against a 28% recovery — a symmetric curve reads as the whole
  field breathing, and only a narrow peak reads as a ring *moving through* it.
  Because the wave lives entirely in `--phase`, `--scan` is that one formula
  turned diagonal — same field, same keyframe, and the shape becomes motion.

- **At rest the pulse moves brightness; active, it moves hue.** Resting, a dot
  cycles between its own tone pulled 58% toward the field background and full
  strength, at 6.4s. On hover, `--open`, or `:active`, the pair swaps: the
  trough becomes the dot's own tone and the peak becomes the *other* tone, at
  1.9s — so a band of the second colour crosses the field instead of a band of
  light. Both tones come out of one `color-mix()` keyed on `--tone`, and its
  inverse, so no state needs a second selector per colour. This is also the
  answer to `(hover: none)`: the component's whole second half lives in that
  state, so a press holds it for as long as it is held.

- **Type is a ratio of the poster, not a rem value.** `container-type:
  inline-size` on the root and every footer metric in `cqw` — headline 8,
  footer padding 6.4, brand gap 1.9, registration marks 2.6. That is what makes
  the thumbnail the same poster at 312px that the demo is at 352px and the
  phone is at 272px; set in rem the headline held its size while the frame
  shrank and walked out of its band. It also means `--raster-pulse-width` is a
  single-value rescale of the whole footer, which is how the thumbnail is sized.

- **Nothing sits on the field.** The mark lives in the footer beside the
  wordmark and nowhere else. It was a 3-cell knockout badge on the centre cell
  first, which is the emblem-on-poster gesture the source makes — and it was
  the one thing on that field the grid did not derive. Taken out, the ring's
  hollow centre is the field's own rather than a square hole punched over it,
  the pinwheel's arms converge where you can see them do it, and the scan runs
  edge to edge. The only marks left on the artwork are two registration
  brackets, a pair down one edge: that reads as a crop mark, where all four
  read as a frame around the type, which is a different and worse idea.

Patterns: the default two-tone ring field, `--pinwheel` (five arms from bearing
plus a 44°-per-cell twist), `--halftone` (light theme, disc plus 2×2 corner
clusters), and `--scan`, which is not in the reference — it exists to show that
the pattern is the phase formula and nothing else. `--open` pins the active
state. Re-theming is the custom property block: two tones, a field background,
a panel and an ink, plus `--dim` for how much of the field survives between
pulses. Ring width, arm count, twist, arm thickness, disc radius and cluster
threshold are all tunables, so a new pattern is a formula and a number rather
than a new file.

Under `prefers-reduced-motion` the field freezes at full tone rather than
mid-wave — a frozen wave reads as a half-drawn pattern, where the still field
is the poster the reference actually shows.

The thumbnail leads with `--halftone` rather than with the component's own
default. Every card in the index sits on the same off-white, and the ring field
and the pinwheel are ink-black panels that read as a hole in the rail at
thumbnail size; the light pattern is the one that sits on that ground. The
resting variant is applied from `preview.html`'s script rather than written into
its markup, so the `<article>` there stays identical to `component.html` — which
pattern the thumbnail happens to lead with is the thumbnail's business, not the
component's.
