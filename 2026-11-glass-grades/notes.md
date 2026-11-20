type: aesthetic

Seven colour grades as seven panes of glass laid over one picture. Seen as a
strip they show the whole set at once, the same picture through each; tap one
and it opens to most of the window while the others close to slivers you can
still see and still tap. Drag and the glass slides, sticking a little at each
pane; hold and it lifts off to show the picture bare; drop, paste or pick a
picture of your own and it slides in under the glass. Under it all is a radio
group and a checkbox, and without script every pane still opens and slides.

- **One number opens every pane.** `:has()` rules write `--glass-grades-p`
  from the checked radio and `--glass-grades-a` from the Strip checkbox, both
  registered with `@property` so they transition, and every pane's left edge
  is a share of the window:
  `(1 − a)·j/n + a·(j·s + (open − s)·clamp(0, j − p, 1))`, with `s` one
  sliver and `open` .62. The index, the scale and the readout read the same
  two numbers, so nothing on the component can disagree with the glass, and
  `component.js` only ever drives `p` faster than a transition can.
- **A grade is a filter and two sheets of colour.** Each pane is the picture
  through `brightness() contrast() saturate()`, then a toe sheet in `screen`,
  which moves black to the toe colour and leaves white alone, then a shoulder
  sheet in `multiply`, which moves white to the shoulder colour and leaves
  black alone, then grain in `overlay`. Nothing reads a pixel, so a grade is
  instant and works on a photo, an illustration or a live element. Each
  selector runs the same layers over a fixed reference row, black to white
  and then skin, sky, leaf and red, and shows it under the same row bare: the
  change a grade makes, read at a glance.
- **Glass only where it does a job.** The one material on the picture is the
  edge of each pane: a lit face and a shaded face from one light on the left,
  a few pixels of the green float glass has at its edge, and a 14px strip
  magnified 1.45× so the picture bends where the glass ends. The edges catch
  more light the faster they move. The body is the camera's matte charcoal,
  and the open pane carries the mode dial's orange index.
- **Moving the glass is felt as well as seen.** A drag runs through the mode
  dial's detent curve, `x − k·sin(2πx)/2π` with `k` .55, so the glass sticks
  near each pane. A release springs to a stop with a damping ratio of .67,
  about 6% overshoot in a third of a second, and a flick coasts up to three
  panes. Every stop passed is a tick, landing adds a low seat, and a still
  press of 260ms lifts the glass. The sounds are synthesised, a struck plate's
  first three modes at 1, 2.756 and 5.404 times about 2.4 kHz, and start no
  audio while `--glass-grades-click` is 0; a finger or a pen gets the same
  moments as vibration.
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
  4.7 to 5.7s; this build, 1.4 to 1.6s. Layout fell from 1.4 to 2.2s to 30ms
  when the window became a size container. The light on the edges was the
  largest single cost: as an animation loop of its own beside the drag it
  tripled the style work, 1.2s against 0.4s, and it is now written in the
  same call that moves the glass. Headless Chromium composites on the CPU,
  so these are comparisons, not frame rates; a phone is the instrument.
- Sound peaks, rendered offline: pass −28 dBFS over 33ms, land −18.5 over
  76ms, lift −29.5 over 105ms, set −20.5 over 69ms, swap −18.7 over 160ms.
  Nothing clips.
- Contrast on the charcoal: the names 12.7:1, the descriptions 6.2:1 and 5.1
  on a chosen selector, the orange marks 6.8:1, a tag over a white picture
  10.7:1. The scale's unlit segments are 1.6:1 and decoration; the lit one
  carries the choice.

## Not yet

- The index card and the forthcoming slot it replaces, the Figma page, and a
  `data-tech` tag for blend modes.
- Haptics on an iPhone: the switch the script toggles is a Safari workaround,
  untested on a device.
- A slow release still lands where a fast one would have: the flick is
  projected 0.2s ahead, and nothing yet checks how that feels on a phone.

Inspiration: https://www.fujifilm-x.com/global/products/cameras/x-t50/ — the
film simulation dial, and the habit its owners have of writing a look down as
a recipe: a handful of numbers anyone can dial in.
