type: navigation

A rotary selector for a mode you stay in. Its choices sit round a knurled
charcoal dial set into a cloth-dotted plate, and turning it brings one at a
time under a fixed index mark. Underneath it is a radio group in a form, so
arrow keys, a screen reader and a server all have it with no script; turning
it by dragging, and the feel of each detent, are what component.js adds.
Three item sets show where it belongs: an archive's views as icons that say
their name when reached for, a dashboard's time range engraved round the arc,
and a game's kit with a display and a centre key that commits. A second
finish, `.mode-dial--plain`, is the same dial with the material taken off.

- **One number turns everything.** `:has()` rules write `--mode-dial-sel`
  and `--mode-dial-n` on the root, and the knurl, the engraving and the
  options layer all turn to `-(sel + laps·n + drag) · 360deg/n` on one
  transition, each option turning back by the same angle, so names and icons
  stay upright in lockstep without `@property`. A detent is an overshoot:
  420ms on a `linear()` curve that passes the stop by 6% of the move and
  settles. CSS alone spins first-to-last the long way round; component.js
  keeps a winding count, `--mode-dial-laps`, so every turn takes the near way.
- **One light, and the plain finish shows what it adds by taking it away.**
  `--mode-dial-light: 27deg` sets every shadow, the knurl's rim light, the
  plate's chamfer, the face's streak, the cloth and the engraving lip, and it
  sits on the face, which never turns, so the teeth slide through a highlight
  that stays put. `.mode-dial--plain` keeps the mechanism and every mark that
  says something — the index, the chosen weight, the hollow index and ringed
  key of a pending choice, the pip, the focus rings, the tooltips — and takes
  off the cloth, the teeth, the light and every shadow: white fills, 1px
  hairlines, a system face in sentence case, and one tick per detent on the
  rim so it still reads as something that turns. Its signal is darker,
  `#cf5a22`, because the polished orange is about 2:1 on white.
- **A detent is felt as well as seen.** A drag goes through
  `x − k·sin(2πx)/2π`, with `k = --mode-dial-notch` (.6): slow near a stop,
  quick between, and continuous when the radio flips. Every detent the face
  passes is a tick — an arrow key, each detent a drag crosses, each one a
  click or an Escape sweeps over, timed to when the eased angle reaches it —
  and a tick dips the index, fires `mode-dial:tick`, buzzes on touch and pen,
  and clicks if `--mode-dial-click` is above 0. The key travels down, away
  from the light, and springs back, clicking on the way down and more softly
  on the way up. The sound is opt-in, synthesised with Web Audio, and follows
  only a real key, pointer or click on the dial; at 0 no AudioContext is ever
  made. The polished finish rings like metal and the plain one snaps like
  plastic.
- **Browsing and choosing are two marks.** With the centre key present, the
  checked radio is the pending choice and `:default` is the committed one:
  the index goes hollow and the key takes a ring while they differ, and a pip
  stays with what was committed. A hidden status line names what is held, and
  the key is described by it. Without script the key submits the form as GET;
  with script it rewrites `defaultChecked`, Enter on a radio commits, and
  Escape is `form.reset()`. A view or a filter has no key and applies as it
  turns.
- **No hover to spend, and nothing muted.** Names rise as tooltips on
  `:hover`, on `:focus-visible` and, under `(hover: none)`, on `:active` and
  on the checked item, moving toward the centre so a wide word clears its own
  icon. A sideways swipe across the face turns the dial and a vertical one
  still scrolls the page. Every text pair clears 4.5:1 and every signal mark
  3:1, in both finishes: the display is one ink on one glass, because a
  second, dimmer ink was the first thing to fall under the floor.

## Measured

What the bullets above rest on, and what was tried on the way.

### Turning

- Eight `:has(… :nth-child(k) > :checked)` rules write `--mode-dial-sel` and
  six `:nth-child(k):last-child` rules write `--mode-dial-n`. Each option sits
  on the options layer at `sin()`/`cos()` of `i · 360deg/n` × 28cqi. Measured
  mid-turn, the layer at −31.47° and the option at 31.47°.
- The face that holds the options does not turn and is not a stacking
  context, which is what lets the options layer sit above the centre key, so
  a tooltip is never drawn under it. The engraved words, the display's
  readouts and the selected word's weight are arithmetic on `i - sel`, through
  `color-mix()` and `max(d, -d)`, rather than further ladders.
- The overshoot is
  `linear(0, .42 12%, .8 26%, 1.045 46%, 1.06 52%, .995 72%, 1.003 86%, 1)`:
  3.6° past the stop on a six-way dial. Each extra step adds 70ms. Without
  script first-to-last turns 0° to −300°, which reads as an end stop; with it,
  0° to +60°.

### The drag

- Pointer angle by `Math.atan2`, checking each radio 0.6 of a step past its
  detent, one detent at a time: a sweep of 3.3 steps fires exactly three
  `change` events. A drag starts anywhere on the dial but the key.
- The knurl is `touch-action: none`; the rest of the dial is `pan-y`, because
  the knurl is 12px wide on a phone and too thin to aim for. The
  `pointercancel` that comes with a vertical swipe leaves the dial at the last
  detent it reached.
- The detent curve, `f(x) = x − k·sin(2πx)/2π`, is monotonic for k ≤ 1 and
  f(x) − f(x−1) = 1. `--mode-dial-notch` is read once, when a drag starts. A
  slow 3.3-step drag sampled 220 times gave 3 ticks, 3 flips and no jumps: at
  each flip the shown position stepped 0.6336 → 0.6561, 1.6412 → 1.6635 and
  2.6487 → 2.6709, where a jump would be about 1. The largest change per
  sample was 0.0240 of a step against 0.0150 linear, the expected (1 + k)×;
  the smallest about 0.48×. The knurl and the options layer always showed the
  same angle.

### Ticks

- Timed to the eased angle rather than spread evenly over the turn: the curve
  is read back from the options layer's computed transition (`linear()`
  points, a cubic-bezier or a keyword), and each tick is due when the eased
  angle first reaches k/span. One arrow step ticks 182–184ms after the key; a
  three-step click at 56, 121 and 240ms. A tick leads the face past its
  stop by 1–17ms, the frame the transition takes to start once asked for;
  on a page's first turn, whose transition can start a few frames late, by
  13–25ms.
- A turn that interrupts another counts from where the face really is. The
  running transition says where it starts, how long it takes (a reversal is
  shorter than the token) and when it began; the ticks still queued for the
  interrupted turn are dropped, and only whole stops past the face are
  counted. Clicked two across and back after 60ms, the face gets 0.71 to
  0.93 of a step and ticks twice, one of them settling home, where it ticked
  four times. Over 36 keyboard interrupts, 30 tick exactly the stops the face
  passes and 6 are one out; turn times are unchanged at 420, 490 and 560ms.
- A turn that carries on the way the last tick went counts on from that
  tick rather than from the face. A tick can go out a frame before the face
  reaches its stop and the start angle can be a frame old, so counting from
  the face ticked a held key's stops twice — 13 or 14 ticks for 12 stops,
  the extra click 11–14ms after the one before it. Each queued tick carries
  the direction of the turn that queued it, and a stop the face is already
  past is due at once. Eight arrows 0 to 120ms apart give eight ticks —
  180 of 180 runs from 0 to 60ms — within −4 to +17ms of the face; an arrow
  held at a 25, 33 or 50ms repeat gives 12 ticks for 12 stops in 30 of 30,
  and 12 clicks with the sound on in 16 of 16. Keys can outrun frames, so the
  start angle can trail the last tick by more than half a stop, and the
  window is two stops wide.
- The last tick is forgotten when a turn runs to its end, at its
  `transitionend`; an interrupted turn ends in `transitioncancel` and keeps
  counting on. Kept for good, it miscounted the next turn whenever the face
  had moved since: after a host set the selection back with no event, the
  next arrow moved the face a stop with no tick, and a turn out and straight
  back ticked its settling home after a finished turn one way and not after
  one the other way. Now both tick as the face does: one arrow after a
  silent change one tick, two arrows two, and the settling home once,
  whichever way the turn before it went.
- No two ticks of one dial closer than 12ms; under reduced motion the turn
  takes 0s and its ticks are 30ms apart, and the index does not kick.
- An Escape back over two steps gives two ticks. Ticks count detents passed,
  including disabled stops crossed in one jump; a drag over a run of disabled
  stops with no `change` gives none. The kick alternates two identical
  keyframes, `data-mode-dial-kick="a|b"`, so each tick restarts it.
- Removing the dial mid-turn leaves no further ticks and no timers pending.

### Sound and touch

- Only trusted `keydown`, `keyup`, `pointerdown`, `pointerup` and `click`
  events on the dial itself can make a sound, and only for the task they
  occur in; the cause is carried through a drag and through Escape's reset.
  A host's `input.click()`, `form.reset()` or `key.click()`, and the
  preview's checked-plus-change, all tick in silence. So does a host button
  elsewhere that turns the dial during a real click: the sound is the dial's
  feedback on its own handling.
- At `--mode-dial-click: 0` no AudioContext is created. The first gesture
  with a volume makes exactly one, inside the gesture, and it was running; a
  drag's is made on its `pointerdown`, before its first tick, which comes from
  a frame. A second dial on the page shares it. A tick that comes due while
  the context is not running is dropped rather than scheduled on a stopped
  clock, which would play every one of them at once on resume; the key's
  clicks, played inside their own gesture, are not. The volume is read again
  at each tick, so switching it off mid-turn silences the rest. Without Web
  Audio, nothing happens and nothing throws.
- Detent: white noise through a band-pass, ±4% pitch per tick. Polished, 2600Hz
  at Q 7 over 26ms, which rings like metal; plain, 4200Hz at Q 1.4 over 9ms, a
  dry plastic snap. Key press: a falling sine (120Hz polished, 210Hz plain)
  and a click at 0.7× the pitch. Release: a quieter click at 1.5×. The gain
  makes up for a narrow band without a cap, so the volume counts all the way:
  the polished detent peaks at −18.7 dB at .5 and −12.7 at 1, where a cap at
  1 had held it at −17.2 from .6 up. The noise is 210ms long, the longest
  decay the token allows plus the 10ms each sound runs on, so a slow tick dies
  away rather than stopping.
- Buzzes are 6ms a detent, no closer than 40ms, and 8ms for the key, for touch
  and pen only. A tap two steps across gave two; a touch drag of 2.2 steps gave
  two; keyboard and mouse gave none.
- The key travels .5cqi and sinks to .97 while pressed, and springs back on
  the release curve. Enter on a radio of a keyed dial presses the key, with the
  same look and sound. A pointer presses it on `pointerdown` through
  `data-mode-dial-press`, since a touch gets `:active` late or never: a finger
  held on the key starts it down 10–15ms after `touchstart` and holds it
  there for as long as it stays, where it used to go down only after the
  lift. Under reduced
  motion it comes back on ease-out, without the spring past rest.
- The release click is heard as the key rises, not when the finger or key
  lifts. A commit holds the key down for 180ms, so the click waits for the
  hold to let go: across mouse, Space, Enter on the key and Enter on a radio,
  it lands 17–48ms before the first sampled frame of the rise, where it used
  to come about 200ms before it. A second press inside the hold restarts it
  and cancels the click the first one owed. A key held by Space or Enter
  ignores a pointer pressed on it, so mixing the two cannot leave it down.

### Tooltips, and the key's trade-off

- The near edge of a raised name is 6cqi from the option's centre, and 3cqi
  further across. Under 11rem a dial with no key shows the name in the middle
  of the face instead, where it covers no other icon. The farthest corner is
  at 27.9cqi of a 240px dial and 31.1cqi of the 136px one, inside the face's
  37.4.
- A raised name holds while the pointer moves onto it, except across a centre
  key: the key keeps its clicks wherever a name lies over it, so the name gives
  way as the pointer reaches the key. On the kit dial that is up to half of a
  side name, measured 0.39 to 0.53 of its area at 240 and 288px, because six
  names have nowhere else to go inside the face. Escape lowers a name when
  there is nothing to cancel.

### The material

- 120 teeth divide by 3, 4, 5, 6 and 8, so every detent lands on a whole
  tooth. The cloth is on the deck only, in pixels rather than cqi: a 4px
  quincunx of 1px bumps, each a shade disc with a highlight nudged a
  quarter-pixel toward the light, so a small dial has fewer dots, not smaller
  ones.
- The deck is square without a display, a 24px margin on every side at the
  default size, and casts a warm three-layer shadow down and to the right.

### Contrast, polished (computed colour on computed background)

- The paint `#b0ada6`: 6.16:1 on the face, 5.02 at the brightest point of the
  fixed streak. The chosen word `#f1efe8`: 11.99, and 8.2 to 9.1 under the
  label on the key's gradient.
- The signal `#f0965f` — index, focus ring, pending ring, pip, never text —
  6.06 on the face, 4.94 at its brightest, 5.32 on the deck and 4.10 on the
  key's lit side, against a 3:1 floor.
- The display: `#1b1f17` on `#b3b9a2` at 8.27, 6.00 in the bezel's shade.

### Contrast, plain

| pair | colours | ratio |
|---|---|---|
| name, curled word, icons at rest | `#5c5a55` on `#fff` | 6.89 |
| word under the pointer | `#2b2a27` on `#fff` | 14.35 |
| chosen word | `#1b1a18` on `#fff` | 17.39 |
| key label at rest / hovered / pressed | `#1b1a18` on `#fff` / `#f5f4f1` / `#ecebe6` | 17.39 / 15.81 / 14.57 |
| tooltip, display text, display ticks | `#1d1c1a` on `#f7f6f3` | 15.76 |
| Current tag, inverse | `#f7f6f3` on `#1d1c1a` | 15.76 |
| index, pip, focus rings, pending ring | `#cf5a22` on `#fff` | 4.09 |
| pending ring beside the pressed key | `#cf5a22` on `#ecebe6` | 3.42 |
| focus ring against a tooltip | `#cf5a22` on `#f7f6f3` | 3.78 |
| rim ticks | `#77746d` on `#f4f3f0` | 4.20 |

- The edge is decoration and owes no ratio, but it has to be there. The
  hairline `#cfccc5` is 11.6 OK ΔE against the rail's `#f3f2ef` ground, where
  the white deck alone would be 3.9. On the dark grounds the plate is lit:
  18.58:1 on `#121316`, 17.26 on `#191b1e`.
- Quick look is the only place the plain finish appears below 1:1, never the
  rail card, at 0.59 on a 320px phone. On a 1x screen at 0.6 the 1px hairline
  is 0.6 of a device pixel: measured off the rendered preview, it is 3.7 OK ΔE
  from `#f3f2ef` along the deck's side and 2.4 along its top, under the white
  fill's 3.9. The preview restates `--mode-dial-hairline` against its scale,
  as it does the cloth's pitch, to never less than one device pixel (1.667px
  there), and it is 6.3 and 5.1. At 2x the authored 1px is already more than
  a device pixel and is left alone: 5.4 and 3.8.

### Plain, the smaller decisions

- The display's small labels are in the same sans, not the mono. An ordinary
  site sets its small labels in its text face; the mono belonged to the LCD's
  dress, so it goes with the glass.
- No dark plain. The plain dial sits on a dark ground as a lit plate, the way
  the polished one does; a dark one would be a modifier of its own.
- Names and tooltips stay inside the face at 288 and 240px in both
  languages.
- The key's word is the names' size at the chosen name's weight, 12.67px/600
  on a 288px dial and 11px/600 at 240. It had inherited the plain label
  weight, 400 at 11px, and read weaker than the tooltip above it.
- The key travels straight down: `--mode-dial-light: 0deg`, since there is no
  light left to move away from. Pressed, it moves 1.44px down at 288px rather
  than 0.65px across and 1.28px down; nothing else in the finish reads the
  light, and the four plain forms at rest are pixel-identical either way.
- A rim tick is never under one CSS pixel wide:
  `max(.5deg, atan2(1px, 42cqi))`. The 288 and 416px dials are as they were;
  on a 136px dial the tick goes from 0.5px, which drew the diagonals as dots,
  to 1px.

### Tried and dropped

- The plain rim's fill and its outer hairline on the turning disc. Chrome
  snaps a box to the pixel grid before it rotates it, which moved the circle
  about 0.7px at 60° and hid the hairline on one side. They sit on the disc
  that does not turn now, and only the ticks turn.
- A second, dimmer ink on the display, which was the first thing to fall under
  the floor.
- The key's old travel, .3cqi with no sink. It is .5cqi and .97 now, so the
  press is seen as well as heard, and the polished dial at rest is unchanged
  by it: a full-harness diff found 0 pixels changed.

Inspiration: https://www.fujifilm-x.com/global/products/cameras/x-t50/ — the
dial on its top plate (the knurled rim, the fixed index, the detent) and the
textured covering round it.
