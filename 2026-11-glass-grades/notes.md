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
  each pane. A release is projected 0.4s ahead, so a flick coasts up to three
  panes, and springs to a stop with a damping ratio of .67, about 6%
  overshoot in a third of a second. A still press of 320ms lifts the glass
  for as long as it is held, and a sideways move sets it down and drags; a
  tap on the open pane, or Enter, lifts it until the next. Every stop passed
  is a tick and a landing adds a low seat, synthesised from a struck plate's
  first three modes and silent while `--glass-grades-click` is 0; a finger or
  a pen gets the same moments as vibration.
- **The grades are kinds of light, in the order of a day.** Havgus (sea fog),
  Dagslys (daylight), Højsol (high sun), Sankthans (the low midsummer sun),
  Blå time (blue hour), Nat (night) and Natrium (a sodium lamp). Each name
  says what its numbers do: fog lifts the blacks, low sun warms the whites,
  and night and a sodium lamp take the colour away, the eye for want of light
  and the lamp because it gives one wavelength. Højsol carries muted colour
  over hard shadows and Sankthans amber highlights over soft ones, by their
  decisions only. The names stay Danish in both languages.

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
  run side by side: 0.64 to 0.67s of main thread against 0.61 to 0.64, style
  recalculation 0.26 to 0.27s against 0.25 to 0.27, layout 18 to 19ms
  against 20 to 22. The recipe at first took recalculation from 0.24 to
  0.32s, every pane re-parsing its chain of `clamp()`, `max()` and `calc()`
  on every frame; registering the factors as numbers brought it to 0.27s,
  and working each grade's two sheets out once on the root, as registered
  colours, back to level.
- The drag is direct: at 1440, 293.9px of drag moved the edge 293.9px, the
  detent varying its pace between 0.45 and 1.55 of the hand's. Flicks from
  pane 2: 4000px/s coasted three panes with two passes and one landing,
  2500px/s two, 940px/s one.
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
  reach with it.
- The recipe's steps are chosen by eye. In-camera conversions, Provia at 0
  against the same frame with one setting moved, would calibrate them.

Inspiration: https://www.fujifilm-x.com/global/products/cameras/x-t50/ — the
film simulation dial, and the habit its owners have of writing a look down as
a recipe: a handful of numbers anyone can dial in.
