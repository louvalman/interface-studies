type: card

A poster card whose artwork is a field of 289 dots, and not one of them is
placed. Each carries its coordinate and nothing else; the stylesheet decides
from that whether a dot is in the shape, which of the two tones it takes, and
where it sits in a pulse travelling across the field. A pattern is therefore
three formulas on one class — change them and the same 289 elements draw
something else — and the footer under the artwork states what the field is made
of rather than whose it is.

- **The dot carries a coordinate; the stylesheet carries the shape.** Each of
  the 289 `<i>` elements holds nothing but `--x` and `--y`, running −8..8 with
  0,0 on a true centre cell (the field is odd-numbered for exactly that
  reason). `component.css` derives the rest: `max(|x|,|y|)` for the square-ring
  index, `hypot()` for the radius, `atan2()` for the bearing. A pattern is then
  three formulas on `.raster-pulse__dot` — `--on` (is this dot in the shape),
  `--tone` (which of the two colours), `--phase` (0..1, where it sits in the
  wave) — which is why `--pinwheel`, `--halftone`, `--moire` and `--scan` are
  one class on the root and not one grid each, and why none of it needs
  JavaScript. The booleans are arithmetic: `clamp(0, v * 1000, 1)` steps a
  signed test to 0 or 1, `max()` is OR, `min()` is AND, and `max(a,b) -
  min(a,b)` is XOR — that is the whole of the halftone's "inside the disc, or
  inside it and on a live cell of the screen". `abs()` is written the
  long way as `max(v, -1 * v)` on purpose: everything else here (hypot, atan2,
  sin, mod, round) is Chrome 125 / Safari 15.4 / Firefox 118, and `abs()` alone
  would have moved that floor to Chrome 133.

- **One animation, 289 delays.** Every dot runs the same three-stop keyframe at
  the same duration — one set per state, alpha at rest and colour when active,
  the same shape in two currencies — and the travelling wave is one declaration:
  `animation-delay: calc((var(--phase) - 1) * var(--spread) * var(--dur))`. The
  `- 1` makes the delay negative, so the field is already mid-pulse on the
  first frame instead of sitting dark for a cycle. The bright window is 0–16%
  of the cycle against a 28% recovery — a symmetric curve reads as the whole
  field breathing, and only a narrow peak reads as a ring *moving through* it.
  Because the wave lives entirely in `--phase`, `--scan` is that one formula
  turned diagonal — same field, same keyframe, and the shape becomes motion.

- **At rest the pulse moves brightness over a field that drifts hue; active, the pulse moves hue itself.** Resting, a dot
  cycles between its own tone pulled 60% toward the field background and full
  strength, at 6.4s. On hover, `--open`, or `:active`, the pair swaps: the
  trough becomes the dot's own tone and the peak becomes the *other* tone, at
  1.9s — so a band of the second colour crosses the field instead of a band of
  light. The two halves are paid for differently, and that is a decision
  rather than an implementation detail: a tone pulled toward the field
  background *is* alpha, so the resting wave is one static colour and an
  opacity ramp, while the hue swap — which alpha cannot say — animates the
  colour itself. Only the second is expensive, and it only ever runs on the
  card under the pointer. The resting field is cheap because every value in its
  keyframes is a literal — and that took two passes to get right. The first
  took `background-color` out, on the reasoning that a `var()`-derived colour
  cannot be resolved ahead of time and so has to be recomputed for all 289 dots
  on every frame; true, and it left `transform` and `opacity` holding `var()`
  in the same keyframes, which costs the same way for the same reason. Measured
  on a phone afterwards: one thumbnail still held 86% of a main thread and the
  index dropped four frames in five. Literal keyframes halved it. The dot's own
  size moved to the `scale` property so the animation can be a swell on top of
  it rather than an absolute, which is why the resting depth — 1.913 and 40% —
  is written out rather than read from `--peak-scale` and `--dim`; both still
  govern the active beat and the dot's own tone.

  What alpha cannot give the resting field is any colour of its own, and a
  field that only breathes brightness reads as one colour lit and dimmed. So
  the hue moves under it rather than inside it: `.raster-pulse__field` carries
  a single `hue-rotate` that takes the whole field 20 degrees off its own tone
  and back over 16s — negative, so tone A travels toward tone B, pink to
  magenta, rather than toward a red that belongs to neither. The ring still
  travels in each dot's alpha; this is the ground it travels over, which is why
  the drift is slow against the 6.4s pulse rather than in step with it.

  It is one element because it cannot be 289. A dot's own hue at rest costs
  what the first pass cost — a `var()` colour recomputed per dot per frame —
  and stacking a second tone per dot to cross-fade is worse again: measured,
  style recalc over three seconds goes from 949ms to 5822ms and 177 frames in
  180 drop, because it doubles the animated element count past what Chromium
  will composite. One filter on the field measures +10% recalc and nothing
  dropped. It is also why the drift stays a token when the dots' keyframes
  could not: only one element resolves that `var()`.

  Alpha carries a little more chroma than the same mix in oklab, which is the
  60% against the 58% that drew this field before — near enough to sit unnoticed, far enough to be worth writing
  down. Both tones come out of one `color-mix()` keyed on `--tone`, and its
  inverse, so no state needs a second selector per colour. This is also the
  answer to `(hover: none)`: the component's whole second half lives in that
  state, so a press holds it for as long as it is held.

  What is left is the count. 289 animations is past what Chrome will hand to
  the compositor, so they run on the main thread whatever is in them, at about
  a seventh of a percent each per frame. Cheap enough now that the index holds
  a steady 60fps, and the reason the rail only ever keeps alive what is on
  screen: an unseen thumbnail costs what a watched one costs, because a
  same-origin iframe shares this page's main thread.

- **Type is a ratio of the poster, not a rem value.** `container-type:
  inline-size` on the root and every footer metric in `cqw` — headline 8,
  footer padding 6.4, spec line 3.1, registration marks 2.6. That is what makes
  the thumbnail the same poster at 312px that the demo is at 352px and the
  phone is at 272px; set in rem the headline held its size while the frame
  shrank and walked out of its band. It also means `--raster-pulse-width` is a
  single-value rescale of the whole footer, which is how the thumbnail is sized.

- **One pattern could not have been a shape.** Every other pattern here tests a
  region — inside this disc, on this arm, past this ring — and `--moire` has no
  region at all. Two ring systems sit either side of the centre, and a dot is
  on where exactly one of them has a ring there: XOR, written with the same
  `max()` and `min()` doing OR and AND everywhere else. Nothing in the file
  knows what it looks like until the cells are laid out, which is the thesis
  stated once. Two numbers make it legible. The tone says which source owns a
  dot — the nearer one — because tone by ring parity has every dot changing
  colour as often as it changes state, and the field reads as confetti; split
  by ownership it is two colours meeting down the middle with the fringes drawn
  in both. And the ring pitch has to be coarse: at 0.8 rings per cell the
  fringes fall a cell apart and scatter, where at 0.35 they are three cells
  wide and the interference has room to be a shape.

- **Nothing sits on the field, and the footer carries a spec rather than a
  mark.** The artwork holds no emblem at all. A 3-cell knockout badge on the
  centre cell was the first version, and it was the one thing on that field
  the grid did not derive; taken out, the ring's hollow centre is the field's
  own rather than a square hole punched over it, the pinwheel's arms converge
  where you can see them do it, and the scan runs edge to edge. The only marks
  left are two registration brackets down one edge — a pair reads as a crop
  mark, all four read as a frame around the type, which is a different and
  worse idea.

  The footer went the same way. A mark and a name under an artwork make it an
  advertisement for a product that does not exist; what is worth printing
  there is what the artwork is made of. So the line reads 17 × 17 · 289 cells ·
  one rule, tracked and uppercase in the register the brackets are in, and
  every part of it is still true whichever pattern the root is wearing — which
  a name never would be. Its separator is a circle at the field's own pitch,
  drawn by the rule rather than typed into the copy, so the words stay three
  plain words.

Patterns: the default two-tone ring field, `--pinwheel` (five arms from bearing
plus a 44°-per-cell twist), `--halftone` (light theme, a disc whose outer band
is screened to every other cell so it runs out instead of stopping), `--moire`
(two ring systems either side of the centre, XORed), and `--scan` (every dot
on, the pulse axis turned diagonal). `--open` pins the active state. Re-theming
is the custom property block: two tones, a field background, a panel and an
ink, plus `--dim` for the tone the field falls back to between pulses — its own
depth at rest is in the keyframes, for the reason above. Ring
width, arm count, twist, arm thickness, disc radius, screened rim, source
separation and ring pitch are all tunables, so a new pattern is a formula and a
number rather than a new file.

Under `prefers-reduced-motion` the field freezes at full tone rather than
mid-wave — a frozen wave reads as a half-drawn pattern, where the still field
is a poster.

The thumbnail leads with `--halftone` rather than with the component's own
default. Every card in the index sits on the same off-white, and the ring field
and the pinwheel are ink-black panels that read as a hole in the rail at
thumbnail size; the light pattern is the one that sits on that ground. The
resting variant is applied from `preview.html`'s script rather than written into
its markup, so the `<article>` there stays identical to `component.html` — which
pattern the thumbnail happens to lead with is the thumbnail's business, not the
component's.

Inspiration: https://x.com/chalaska — a poster set whose artwork is a dot field
with every dot's state decided by where it sits. That rule is what was taken;
the patterns it runs here, the footer and the copy are this build's.
