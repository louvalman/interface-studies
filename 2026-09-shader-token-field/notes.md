type: aesthetic

A shader is a very small program that runs once for every pixel on the screen,
all of them at the same time, on the graphics card. Nobody tells it to draw a
circle here and a line there; it is asked, pixel by pixel, what colour are you,
and it answers.

This study writes that program's settings — how coarse the pattern is, how much
it swirls, how hard it is lit, which of three patterns it draws, what colours
gather in it, and how light it is allowed to get — as ordinary CSS custom
properties, the same place a font size or a brand colour would go. Those
declarations are read twice over: once by a plain CSS gradient that needs no
script at all, and once by the shader on the graphics card. A plate, a band and
a read-out are what it is shown on, and the read-out prints the numbers the
field is actually running on, including the contrast ratio they guarantee.

- **The shader's settings are CSS custom properties, not numbers buried in
  JavaScript.** A shader is normally handed its settings — its *uniforms* —
  from JavaScript, where they sit as literals nothing outside that file can
  reach. Here they are written on the component's root class as
  `--shader-token-field-scale`, `-warp`, `-relief`, `-octaves`, `-grain`,
  `-flow`, `-form` and three colours, and `component.js` reads each one with
  `getComputedStyle` before it touches the shader. Change
  `--shader-token-field-pool-a` from a parent stylesheet and both renderings
  move together, because both read that single declaration — which is the test
  CLAUDE.md sets for a property block, applied to a thing that normally lives
  as a literal in a JS object.

  Colours need one extra step to get out. CSS hands a custom property back as
  the text it was written as, so `oklch(60% .1 150)` arrives as those
  characters rather than as a colour, and `parseFloat` gets nothing. Writing it
  onto a throwaway element's `color` and reading the computed value back makes
  the browser do the translating, which works for hex, named colours, `hsl()`
  and `oklch()` alike.

  Two of the settings are checked rather than trusted, and they are the two
  that are not really quantities. `--octaves` is a count of layers: the field
  is built by stacking the same noise pattern at half the size each time, each
  layer adding finer detail, four by default. That stack has to be a fixed
  length when the shader is compiled, so the loop runs to a constant 8 and
  stops early at whatever the token says — and the token is clamped to 1–8 on
  the way in, because a value anyone can set from outside is a value someone
  can set to 500, and an unbounded loop on a graphics card is a frozen tab
  rather than a muddier picture.

  `--form` is the other, and it picks rather than dials: 0 dunes, 1 veins, 2
  terraces. The distinction matters at the moment the settings change. Every
  quantity in the block glides toward its new value across `--settle`, which is
  what makes a palette change a transition rather than a cut — but there is no
  halfway between two patterns to draw, so `--form` and `--octaves` jump while
  the rest glide. Leaving `--form` out of that jump list was the one bug this
  cost: it kept whatever value it loaded with, everything else switched, and
  the field went on drawing dunes under a new palette. It took a measurement to
  catch, because the picture looked different either way — the amount of fine
  detail in all three patterns came back identical to three decimal places, and
  two palettes of the same pattern look exactly as different as two palettes of
  different ones.

  Patterns and palettes are separate choices and combine freely, which is what
  a token block buys that a folder of finished pictures does not: four palettes
  and three patterns are twelve states, and nobody drew any of them. A palette
  restates all twelve declarations rather than patching only the ones it wants
  changed — a version that inherited half its values would leave the other half
  answering to whichever palette ran last, and the brightness range in
  particular has to move with the colours, or the clamp holds the field to a
  range the new colours do not live in.

- **The contrast floor is enforced while the picture is drawn, not checked
  afterwards.** Text has to be enough lighter or darker than whatever sits
  behind it, and the usual way to know is to finish the design and measure it.
  A generated, moving background makes that nearly impossible: the pixel under
  a letter is a different colour every frame.

  So the shader refuses to paint outside a range. Every pixel's brightness —
  one number, 0 for black and 1 for white — is pushed back inside
  `--lum-floor`/`--lum-ceil` before the colour is written out. The worst case
  is then arithmetic on two declared numbers instead of a measurement: a floor
  of 0.22 under `#14120f` ink is 4.81:1, and the read-out works that out from
  the tokens rather than being told it.

  Two corrections got it there, and neither was visible by looking. The clamp
  did nothing at first. Mixing colour A into colour B can only produce
  something between the two, and brightness follows that mixing exactly, so a
  field made only of mixes is already inside the range and the clamp could
  never fire — which is also why the no-script CSS version needs no clamp of
  its own. What leaves the range is `--relief`, the light: a narrow sheen along
  the pattern's ridges and a shadow in its troughs. Measured on the default
  plate, 25.7% of pixels sit outside the band before the clamp and 0.00%
  after; on the night palette, 8.7% and 0.00%. The two go out of the range at
  opposite ends — the light one overshoots the top, 0.988 against a ceiling of
  0.72, and the night one bottoms out below the floor, 0.000 against 0.01,
  which is the sheen and the shadow respectively.

  Second, that light was added to the colour at first, and adding light is
  adding white. At the strength this needs it drowned the colour out of
  anything dark: the night field came out as flat grey with its palette gone.
  Multiplying instead — the same colour, lit harder — keeps the hue exactly.

  The clamp's own two halves are lopsided for a related reason. Brightening a
  too-dark pixel is done by mixing it toward white by `(floor − Y) / (1 − Y)`,
  which lands exactly on the floor and cannot produce a colour the screen
  cannot show. The obvious alternative — scaling all three colour channels up —
  runs one of them into its maximum, and the pixel ends up darker than asked
  for, failing on exactly the pixels that needed the help. Darkening a too-light
  one is a scale, which cannot overflow.

  The guarantee is checked rather than asserted, and the check is worth writing
  down because it is cheap: read the drawn pixels back out of the canvas, work
  out each one's brightness, and count the ones outside the range the block
  declares. Across all four palettes and all three patterns, at rest, that
  count is 0.0000% — `field` 0.22–0.72, `verdant` 0.24–0.70, `night`
  0.01–0.14, `ember` 0.012–0.13, and the two new patterns on whatever range
  their palette brings. How hard the clamp is working varies, and is the more
  interesting number: 27.5% of `field`'s pixels sit against an edge of the
  range, against 7.3% of `terraces`', because stepping the field into flat
  treads flattens the ridges the light was lifting and leaves less for the
  clamp to catch.

  One thing the check does not cover, and it is the one place the ratio is
  briefly weaker than the read-out claims. Switching palettes glides the two
  ends of the range along with everything else, so for the length of that
  transition the field is held to an in-between range while the text colour has
  already changed — measured going from light to `night`, 7.3% of pixels sat
  above the target ceiling 2.5 seconds in, and the field was clean by ten. That
  is the glide working as designed rather than the clamp failing: every frame is
  correctly held to the range that frame is running on. It is recorded here
  because a guarantee with a transient in it should say so.

- **Only one text colour can sit on the field, and the clamp is why.** If the
  background is never allowed below a certain brightness, the text on it is
  never allowed above a matching one. With the floor at 0.22, anything lighter
  than about `#2a2622` is already under 4.5:1 — so there is no room for a
  second, quieter grey the way there would be on a flat surface. The hierarchy
  on the field is size and letter-spacing instead: an 11px kicker tracked at
  0.18em over an 18px line at weight 500. Muting into a clamped field is the
  one thing the clamp cannot give you, and it is worth knowing before the
  palette is picked rather than after the type goes on.

  The line is 18px rather than the 15px it was first set at because size is
  carrying the whole of that hierarchy. At 15px over three lines the statement
  was a paragraph competing with the field behind it, and on the index, where
  the card is drawn at 0.7, it was 10.5px of body copy and read as texture. One
  sentence at 18px leads the plate at both sizes, and it costs nothing — the
  plate has a fixed shape, so the text floats inside a box that does not grow.

  It also stopped saying `ceiling` and `floor`. Those are the names of two
  tokens — `--lum-ceil` and `--lum-floor` — and the sentence was borrowing them
  to describe the thing they configure, which reads as precision to whoever
  wrote them and as nothing at all to a reader meeting the component cold.
  Sample copy is read by someone who does not have the token block open: it
  says what the component does in the words anyone would use for it, and the
  read-out beside it is where the numbers live.

  Off the field, on the component's own plain surface, the read-out has
  ordinary tiers at 15.9:1 and 6.8:1, because nothing is being held in a range
  there — and that surface carries a 1px edge in `--shader-token-field-line`,
  because #f0ece2 on the index's #f3f2ef ground is 2.00 OK ΔE and a plate that
  size needs to look like a plate.

- **One connection to the graphics card, shared by every panel on the page.**
  Talking to the graphics card needs what is called a context, and a browser
  keeps only about sixteen alive at once — Chromium's limit — closing the
  oldest without telling anyone. On the index that would be a card going blank
  for no visible reason: the rail is eight previews and growing, quick look
  opens a ninth, and this page alone shows fifteen panels across eleven copies
  of the component — three states, seven specimens and the one in the lightbox.

  So one off-screen canvas draws every panel in turn and copies the finished
  image into place. The list is sorted by size first, so that shared canvas is
  resized once per distinct size rather than once per panel. That is what makes
  the specimen rows affordable at all: a context each and they would be past
  Chromium's cap on this page by themselves.

  The lightbox is the case that shows the sizing is doing real work rather than
  being a formality. Its copy of the component is in the markup from the start,
  because the setup routine runs once and anything added afterwards is never
  picked up — and it costs nothing while the dialog is shut, since a closed
  `<dialog>` is not displayed at all, so measuring it returns nothing and the
  draw is skipped. Opening it gives the panel a size and it starts.

  Where `OffscreenCanvas`, `bitmaprenderer` or WebGL2 is missing, nothing
  happens at all and the CSS version stays on screen. That is less a fallback
  than the other half of the study: the two are one recipe drawn two ways, and
  the read-out's last row says which one you are looking at.

- **The index's pause arrives as a CSS value, because CSS cannot stop a render
  loop.** The index tells a card to stop animating while the row is being
  dragged, so nothing competes with the drag for the browser. Every other study
  answers that with one global rule — `animation-play-state: paused
  !important` — and that rule does exactly nothing here, because what is moving
  is not a CSS animation. It is JavaScript redrawing the picture sixty times a
  second, and no CSS rule reaches into that.

  So the stop arrives the way everything else does: as a token.
  `--shader-token-field-run` set to 0 and the loop is not scheduled again. The
  same channel carries `--shader-token-field-buffer-scale`, which says how much
  the card is being shrunk on screen so the picture is drawn at the size it will
  actually be shown at — a card lays its preview out at 480 and shows it at 336,
  and the grain, which is one random number per pixel, is the part that
  notices. Both are written as inline custom properties from outside, `--live`
  arrives as a class, and one `MutationObserver` watching `style` and `class`
  catches all three: nothing is re-read per frame.

  Two smaller things follow the same rule. The loop counts up its own position
  in the animation rather than reading the clock, so raising `--flow` speeds
  the field up from where it is instead of jumping it. And reduced motion draws
  one frame and never schedules another — the same answer as the pause, for the
  same reason.

Inspiration: none — original design. The construction is ordinary — value
noise, fbm, a domain warp — and the study is not about it; what is being
worked out is whether a field drawn on the graphics card can be a palette
rather than an asset, and what it costs to promise a contrast ratio through
one.
