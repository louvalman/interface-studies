type: navigation

A rotary selector for a mode you stay in. Its choices sit round a knurled
charcoal dial set into a cloth-dotted plate, and turning it brings one at a
time under a fixed index mark. Underneath it is a radio group in a form, so
arrow keys, a screen reader and a server all have it with no script; turning
it by dragging, and the feel of each detent, are what component.js adds.
Three item sets show where it belongs: an archive's views as icons that say
their name when reached for, a dashboard's time range engraved round the arc,
and a game's kit with a display and a centre key that commits. A second
finish, `.mode-dial--plain`, is the same dial with the material taken off,
and `.mode-dial--ratchet` gives either finish a voice of its own.

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
  plastic. `.mode-dial--ratchet` is a voice of its own on either: a grain
  of bright noise for every tooth the face carries past the index, so the
  scratch's rate is the turn's speed, and a snap as the face lands in a
  detent — a transient, a thock falling from 170Hz, the ball settling 15ms
  later — lighter for a detent passed on the way.
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

### Ratchet

- `.mode-dial--ratchet` sets two levels, `--mode-dial-scrape: .5` and
  `--mode-dial-snap: 1`, under the volume, `--mode-dial-click`. Both are 0
  in the property block, so the two finishes keep their ticks, and the nine
  tunables beside them default to the ratchet's own values, so any dial has
  this voice by turning the two levels up. It changes nothing that is seen,
  and it is the same voice on both finishes: it is the mechanism's sound,
  not the surface's. The key keeps its finish's press and release.
- The scratch is one grain per tooth of `--mode-dial-teeth` that the face
  carries past the index, 20 a step on six stops. A grain is not a node:
  each scratching dial has one looping noise source through one band-pass
  (5200Hz ±12% a grain, Q 2.4) into one gain, and a grain is an envelope on
  that gain, up in 0.2ms and away on a third of `--mode-dial-scrape-grain`
  (1ms), at 60–100% of its level. A tooth boundary is half a tooth either
  side of a stop, as a pawl sits in a notch, and a tooth is heard again
  going back over it only once the face is a quarter tooth past it, so the
  settle's last wobble, ±0.1 tooth about the stop, is silent.
- Grains counted against the face's own angle sampled every frame: one arrow
  step 22 for 22 crossed — 20 and the overshoot out and back over one tooth
  — in 10 of 10; a three-stop click 68 against 66 sampled, the samples
  missing the top of its 3.6-tooth overshoot; four quick arrows 84–90 for
  88–90; a held key, 33 or 50ms apart, 0.994 and 0.999 of the teeth over
  five runs each. A reversal hears a few more than the face crosses — 1.05
  at 100ms, 1.06–1.07 for a 90ms zig-zag, 1.16 and 1.18–1.37 at 60 and 30ms
  — because what the audio clock has already rendered when the reversal
  arrives, about 10ms ahead of the face, stands, and the face never gets
  there.
- A drag follows the displayed angle, after the detent curve, frame by
  frame, and each frame's teeth are spread over the frame they took, at most
  50ms, so the rate is the hand's: 7, 15 and 36 grains a second for a face
  going 7, 14 and 36 teeth a second, 30–31 grains for 30 teeth each time.
  Its sound trails the face by up to that frame: snaps 10–18ms after the
  face crosses the stop.
- The snap is the face arriving at a detent other than the one it sits in.
  It leaves its seat by going 0.15 of a step away, three teeth on six stops,
  and a turn's own overshoot past its target, up to 0.24 of a step on a
  4-step turn, is the same landing. A turn's snap is due as the eased angle
  first reaches the stop, off the same points the ticks read: median −0.3ms
  from the face's crossing interpolated between frames, −0.4 to −0.1 over
  five arrow steps and −1.1 to −0.1 over five three-stop clicks, which is
  5–15ms before the first frame that shows it there; a turn whose start the
  browser reports a frame late is up to 10ms early. The target gets the full
  snap and a detent passed on the way the transient alone, at the same
  level, `--mode-dial-snap-pass: 1`: a three-stop click is two light and one
  full. It was 0.4, and at that a passed detent had the level and colour of
  one grain — 1.3dB(A) over one in isolation, and inside a scratch
  2.2–2.6dB(A) under its loudest 12ms, so a three-stop click was heard as
  one scratch and one snap. At 1 it adds 4.8 and 7.6dB(A) to its own 12ms in
  a scratch with grains 2.7 and 7.5ms apart, clears the scratch's loudest
  12ms by 0.8 and 3.0dB(A) across the band and by 3.1 and 6.0dB between 1.2
  and 3kHz, where the grains are thin, and stays 6.4dB(A) under a full snap.
  Centring it an octave lower as well was measured and bought 0.2–0.5dB.
- A turn that carries on the way the last one went, from a face short of the
  last stop it was heard landing in, counts on from that stop, as the ticks
  count on from the last tick: a held key outruns the frames, and the plan
  that heard the snap can think the face has already left. A held key at
  33ms gave 66 snaps for 60 stops over five runs without it, 60 with it; at
  50ms, 60 either way.
- What was last heard says where the face is only while every move of it is
  heard. A host's turn or `form.reset()`, a `.checked` set with no event, a
  turn or a drag with the sound off, and a jump under reduced motion all
  move it unheard, and each one drops the tooth counter and the seat, so the
  next heard turn counts its teeth and its landing from the face. Without
  that, an arrow step after a host had stepped the dial back gave 2 grains
  and no snap rather than 22 and one; after two steps with the sound off, 20
  grains in 45ms, a buzz at the overshoot; a drag after a silent one, 6
  grains for 28; a drag under reduced motion after two key steps, none for
  24.
- A full snap is a transient band-passed at 3400Hz (Q .7), up in 0.3ms; a
  sine falling from 170Hz to 90 over 40ms; and the ball settling 15ms later,
  a tick 1.4× higher at 0.3 of the level. Five nodes; a light one is three.
  In the ratchet's voice it replaces the detent tick's sound, and the tick
  event, the index's kick and the buzz keep their own timing.
- Let go, the settle back to the stop is read off its transition like any
  turn: from 0.34 and 0.27 of a step out the face snaps back 180–184ms after
  the release, as the eased angle reaches the stop at 42% of 420ms. Let go
  0.11 past the detent it had already snapped into, it does not snap again.
- Planned sound waits in a queue and only the next 120ms of it is ever on
  the audio clock, topped up every 30ms. A turn that takes over, a reversal,
  a drag starting, the volume or a level going to 0 on the root, and the
  root leaving the document all take back what has not played: the snaps'
  nodes are stopped and the scratch's gain and pitch cancelled. What the
  face had reached by the start of the transition that takes over stands,
  and so does what the audio clock has already rendered, about 10ms ahead of
  the page in Chromium; that is the one thing a reversal can still hear —
  two across and back gave 32 snaps for 22 arrivals sampled frame by frame
  over sixteen runs, a 90ms zig-zag 27 for 20 — 34 for 24 and 27 for 19
  before the forgetting above and the held start below, so neither moved it
  — and every other reversal, 30 to 200ms, one for one over eight runs each.
  Switched off 120ms into a three-stop click, 0 heard after the cancel —
  which on this page lands 25–33ms after the switch, while the browser works
  out the new style of the thirteen dials the switch has just written to, so
  the 6–8 grains due in between play, and now and then a light snap;
  switched off mid-drag, 0 and the chain stopped; a drag started mid-turn
  with 7 of the turn's grains on the clock past it, 0 of them heard; removed
  mid-turn, taken back at the next top-up 23–28ms later and 0 heard after
  it.
- The audio clock at the face's moment, as the ticks are. The speaker is the
  output's latency behind that — `getOutputTimestamp` says 33–42ms in
  headless Chromium — and the ticks carry it too. Putting the sound where it
  would be heard with the face was tried: everything due sooner than the
  latency is committed at once, and a held key's twelve stops gave 21–23
  snaps where they give 12.
- A transition's start is known only a frame after it is asked for, and in
  Chromium it is the next frame or the one after. The plan is made from now
  and kept off the audio clock until the transition's `ready` says what the
  start was, 2–16ms later and 27ms on the first turn, which makes the
  AudioContext, or for at most 50ms; then it is moved onto the start and
  what is already due is caught up. Put on the clock at once, as it was, the
  first 3–12 grains of a turn from rest were heard up to 24ms before the
  face moved, followed by a hole 9–24ms longer than a grain's spacing where
  the rest had moved onto the real start. Held, over sixteen turns from
  rest, 15 have no grain early and the hole is at most 4.7ms; the cost is
  the first grain or two up to 9ms late, closer together. A transition that
  takes over from a running one starts at the last frame's time, up to a
  frame back, and what of it is already due is caught up — the first 2d ms
  heard in the next d — rather than dropped or played as a burst.
- Nodes: a 4-step turn from four quick arrows, 20–26 — 6–8 sources, 6–8
  filters, 7–9 gains, 1 oscillator — depending on how many snaps the next
  key finds already on the clock and plans again; 26–35 before a turn from
  rest was held off the clock until its start was known; a 3s drag back and
  forth, 78: 15 full snaps and one scratch chain, which is kept for 0.3s
  after its last grain so a slow drag is one chain.
- Main thread: planning a turn 0.5ms, a top-up 0.26ms, a drag frame 0.2ms,
  1.0ms at a 4× CPU throttle. A drag never makes the dial's style be worked
  out mid-frame: the voice is read again by the top-up, between frames, or
  when one of the three levels changes in the root's own style. Read in the
  frame, a drag frame cost 2ms, and 12.5 throttled.
- Volume 0: no AudioContext over keys, a click and a drag. A host's
  `input.click()`, `form.reset()` and a scripted `change`: no grain and no
  snap, after a real turn had made the context.
- Reduced motion: the turn has no duration, so there is nothing to scratch —
  a snap per detent at the ticks' 30ms spacing, two light and one full for
  three stops, and no grains. A drag still scratches: the face still follows
  the hand and the teeth still pass the index. Its release is a jump, which
  snaps and does not scratch.
- Levels at the demo's 0.5, rendered offline from the real dial: a full snap
  peaks at −8.4 to −11.0 dBFS against the polished tick's −14.4 to −19.7
  over two renders each — the noise makes every click a little different —
  and the grains sit 9–16dB under the snap.

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
