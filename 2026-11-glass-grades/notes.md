type: aesthetic

Seven colour grades as seven panes of glass laid over one picture. As a strip
they show the whole set at once; open one and it takes most of the window
while the others close to slivers you can still see and tap. Drag and the
glass slides under your hand, sticking a little at each pane; hold it, or tap
the open pane, and it lifts off to show the picture bare. A picture of your
own slides in under the glass and saves out through it, and a recipe in the
camera's own units lies over whichever grade is open. Under it all are two
radio groups, and without script every pane still opens and slides.

- **One number opens every pane.** `:has()` rules write `--glass-grades-p`
  from the checked light and `--glass-grades-a` from the Strip | Pane switch,
  both registered with `@property` so they transition, and every pane's left
  edge is a share of the window:
  `(1 − a)·j/n + a·(j·s + (open − s)·clamp(0, j − p, 1))`, with `s` one
  sliver and `open` .62. The index, the scale and the readout read the same
  numbers, so nothing on the component can disagree with the glass, and
  `component.js` only ever drives `p` faster than a transition can. Below
  26rem the root, an inline-size container, restates `open` as 1: a pane
  fills the window, the rail is the way to the others, and the index and the
  scale keep the strip's arithmetic to say where in the seven it is.
- **A grade is a filter and two sheets of colour, and a recipe moves all
  three.** Each pane is the picture through `brightness() contrast()
  saturate()`, then a toe sheet in `screen`, which moves black to the toe
  colour and leaves white alone, then a shoulder sheet in `multiply`, which
  moves white to the shoulder colour and leaves black alone, then grain in
  `overlay`. Nothing reads a pixel, so a grade is instant and works on a
  photo, an illustration or a live element, and each selector runs the same
  layers over a reference row: black to white, then skin, sky, leaf and red.
  Over any grade lies a recipe in the camera's units. Highlight and shadow
  tone harden through contrast and soften through the sheets, colour scales
  saturation, a white balance shift is a gain per channel on the shoulder,
  and grain adds weak or strong to the grade's own. Save draws the same
  layers on a canvas, and does the filter by hand where a canvas takes none.
- **Glass only where it does a job.** The one material on the picture is the
  edge of each pane: a lit face and a shaded face from one light on the left,
  a few pixels of the green float glass has at its edge, and a 14px strip
  magnified 1.45× so the picture bends where the glass ends. The edges catch
  more light the faster they move. The body is the camera's matte charcoal,
  and the open pane carries the mode dial's orange index.
- **The glass moves under the hand.** One pane of drag is the distance the
  moving edge travels, the open pane less a sliver, so at
  `--glass-grades-drag: 1` the edge stays under the hand, and the mode
  dial's detent curve, `x − k·sin(2πx)/2π` with `k` .55, makes it stick near
  each pane. A release faster than 400px/s is projected 0.4s ahead, so a flick
  coasts up to three panes, and a slower one lands on the nearest pane. Either
  way it glides there on `cubic-bezier(.25, 1, .5, 1)`, 560ms a pane, the
  curve the stylesheet's own transition uses: it slows from its first frame,
  never passes its pane, and leaves at the speed the hand let go at, its
  first control point set to match. A still press of 320ms lifts the glass
  for as long as it is held, and a sideways move sets it down and drags; a
  tap on the open pane, or Enter, lifts it until the next. Every stop passed
  is a tick and a landing adds a low seat, synthesised from a struck plate's
  first three modes and silent while `--glass-grades-click` is 0; a finger or
  a pen gets the same moments as vibration.
- **The grades are kinds of light, in the order of a day.** Sea fog,
  Daylight, High sun, Midsummer, Blue hour, Night and Sodium, for a sodium
  street lamp; in Danish Havgus, Dagslys, Højsol, Sankthans, Blå time, Nat
  and Natrium. Each name says what its numbers do: fog lifts the blacks, low
  sun warms the whites, and night and a sodium lamp take the colour away, the
  eye for want of light and the lamp because it gives one wavelength. High
  sun carries muted colour over hard shadows and Midsummer amber highlights
  over soft ones, by their decisions only. A selector's hint says what its
  grade does, never what its name means.

## Measured

- Over `file://` in Chromium, a canvas or WebGL grade cannot read the
  folder's own picture: both `getImageData` and `texImage2D` throw
  `SecurityError`. A dropped or picked file reads fine. Two sheets of colour
  read nothing, so this construction works in both cases.
- Main-thread time over a 120-step drag, 1440 wide, three runs each in
  headless Chromium: the mock-up, clipping a full-size picture per pane with
  `clip-path`, 8.5 to 9.6s; letting each pane clip itself with `overflow`,
  4.7 to 5.7s; the first build, 1.4 to 1.6s. Layout fell from 1.4 to 2.2s to
  30ms when the window became a size container. The light on the edges was
  the largest single cost: as an animation loop of its own beside the drag it
  tripled the style work, 1.2s against 0.4s, and it is now written in the
  same call that moves the glass. Headless Chromium composites on the CPU, so
  these are comparisons, not frame rates; a phone is the instrument.
- The same drag on a faster machine, this build against the one before the
  direct drag, the tap, the switch, the narrow window, the recipe and Save,
  nine runs each, interleaved: median 0.680s of main thread against 0.655,
  about 4% more, style recalculation 0.269s against 0.263, layout 21ms
  against 22. Taking out the demo's fourth instance, the registered sheet
  colours or the demo's lead layout one at a time moved nothing past the
  spread between runs, which is as wide as the difference. The recipe at
  first took recalculation from 0.24 to 0.32s, every pane re-parsing its
  chain of `clamp()`, `max()` and `calc()` on every frame; registering the
  factors as numbers brought it to 0.27s, and working each grade's two
  sheets out once on the root, as registered colours, to within the spread.
- The drag is direct: at 1440, 293.9px of drag moved the edge 293.9px, the
  detent varying its pace between 0.45 and 1.55 of the hand's. Releases from
  pane 2, by the hand's own speed over its last 90ms: 500px/s coasted one
  pane, 909 and 1238 two, and 2045 three past where it was let go, with three
  passes and one landing. Let go at p 2.32, short of halfway, 128 and 360px/s
  land back on 2, where 360 used to coast on to 3, and 546px/s goes on to 3.
- The glide, against the spring it replaced: no glide passes its pane, where
  the spring went 6% past and came back. Let go at 5.6, 2.9 and 1.2 panes a
  second, measured on the glide's own frame clock with the drag dispatched on
  a busy-wait clock, the glass left at 5.4, 2.8 and 1.3 and was never faster
  after. The sheet curve, `cubic-bezier(.32, .72, 0, 1)`, eases in, and
  matched to the hand it has to catch up: worked out on the curve, a glass let
  go at 3.6 panes a second was at 11.8 a tenth of a second on. The glide is
  timed from a frame before its first: a frame's time is when it began, and a
  release comes after that, so timed from the release the first frame after
  letting go stood still. Which pane a release lands on is decided before the
  glide starts, so the flick figures above hold as they did for the spring.
- Below 26rem, measured with touch at 390 and 320 in both languages: the open
  pane is the window's 322 and 252px, the index sits at (p + ½)/7, the bar is
  one row of tools at 94px, and nothing scrolls sideways.
- Saving, against the screen at 1440 over http, CIEDE2000 over the open pane:
  through the canvas filter, mean 0.53 to 0.82 across the seven grades and the
  demo's recipe, 99th percentile 1.71 to 2.17, worst 4.6 to 9.3; by hand,
  mean 0.41 to 0.69, worst 4.5 to 8.0. The worst sit on edges, a luma step of
  55 against the picture's 3.3, and blurring both by 1.5px takes the recipe's
  worst from 8.43 to 2.93: the picture resampled at two sizes, not the
  pipeline. 52 to 69ms from click to download at 1800×1200 with the filter,
  102 to 132ms by hand.
- Sound peaks, rendered offline: pass −28 dBFS over 33ms, land −18.5 over
  76ms, lift −29.5 over 105ms, set −20.5 over 69ms, swap −18.7 over 160ms.
  Nothing clips.
- Contrast on the charcoal: the names 12.7:1, the descriptions 6.2:1 and 5.1
  on a chosen selector, the orange marks 6.8:1, a tag over a white picture
  10.7:1. The scale's unlit segments are 1.6:1 and decoration; the lit one
  carries the choice.

## Not yet

- Haptics on an iPhone: the switch the script toggles is a Safari workaround,
  untested on a device.
- The hold is 320ms, from 260, chosen without a phone: long enough that a
  finger resting before a drag no longer lifts the glass and drops it again,
  well short of a system long press. A phone decides it, and the flick's
  reach and the glide's 560ms with it.
- The recipe's steps are chosen by eye. In-camera conversions, Provia at 0
  against the same frame with one setting moved, would calibrate them.

Inspiration: https://www.fujifilm-x.com/global/products/cameras/x-t50/ — my
own X-T50: turning its film simulation dial to see one scene in another
light, and the recipes its owners trade, a handful of numbers anyone can dial
in.
