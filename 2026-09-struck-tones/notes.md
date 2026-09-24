type: aesthetic

A sound palette for an interface, written as a token block and set as an
instrument's faceplate. Four sounds — a tap, a commit, a revert and an alert —
are declared as a tuning, a voice, a strike and a room, and `component.js`
reads those custom properties and builds the sounds out of oscillators at the
moment a key is struck. There are no audio files in the folder and no request
to make, the reverb included: its impulse response is generated from two
numbers when the set is armed. Each key draws its sound as the gesture it is,
the screen draws whichever was struck last, and a sheet along the bottom draws
the four token groups the set is made from.

It ships silent. The arm switch in the corner is both the mute and the user
gesture an `AudioContext` needs, so the component cannot be the reason a page
makes a noise nobody asked for — and everything it says, it says visually too,
because a sound nobody hears still has to deliver what it was carrying.

- **A sound set is a palette, and a faceplate is its swatch sheet.**
  Twenty-odd numbers in four groups — what it is tuned to, what one note is
  made of, how a note arrives and leaves, and what room it is heard in.
  `component.js` reads every one of them with `getComputedStyle` and hands them
  to the nodes, so nothing is written twice and the whole set moves when one
  value is overridden from outside. That is the test CLAUDE.md sets for a
  property block — re-theme it without opening the file — applied to something
  that is not a colour, and a `.wav` would fail it: a recorded sound is a
  decision you can replace but not edit.

  The sheet along the bottom draws the four groups the way an instrument's
  panel letters its modules: a keyboard with an LED under each sound's key, the
  voice wrapped around a circle, one note's envelope, and the note against the
  room's tail — each from its own tokens, with its values printed under it. It
  replaced a list of four figures that said the same things and showed none of
  them. The panel is a deep green between walnut cheeks, and deep because it
  has to be: a vivid mid green like #2e7d4f carries bone print at 4.04:1 and
  near-black at 3.74:1, so no text can go on it at all. At #1a3024 the print is
  11.28:1 and the soft print 6.46:1, and the vivid green is spent where it can
  be afforded — the phosphor, the LEDs, the lit keys.

- **A note is four layers, not a waveform.** A sine fundamental sounded twice
  seven cents apart and panned against itself, so it drifts instead of sitting
  still; an octave above it at 0.22 for body; a twelfth above that at 0.06 for
  shimmer, decaying at 0.3 of the fundamental's rate because every acoustic
  overtone dies before its note does; and 26ms of band-passed noise at 2.1kHz
  under the attack, which is the click. All of it through one 3.4kHz lowpass
  and then split between the dry signal and a small generated room, 0.1 of it
  through 1.2 seconds. The room was 0.18 through 1.7, which on sounds this
  short is a hall: drawn against the note on the Room module, the tail was
  twice the note's length.

  The first version was one oscillator with a sharp envelope and it sounded
  like a 1980s sound chip for three separable reasons, each worth knowing on
  its own: a raw geometric wave with nothing rolled off; an *inharmonic*
  partial at 2.76× the fundamental, which is the ratio a struck metal bar has
  and an overtone belonging to no key, so it reads as a bleep however carefully
  it is enveloped; and a 4ms attack, which is not a click but a discontinuity.
  A click is a layer. An attack is a shape. Sharpening the second to get the
  first is what makes a set brittle. The Voice module draws the second reason:
  one cycle of the wave wrapped six times around a circle closes on itself only
  when every partial is a whole number, and at 2.76 no two petals match.

- **Direction carries the message, and nothing in the set beats.** Up a fifth
  for a commit, down a fourth for a revert, a single note at the root for a
  plain acknowledgement, and a semitone *down* for the alert, played quickly.
  That last one used to sound its semitone against the root — two pitches 31 Hz
  apart, which is not slow beating but roughness, and genuinely unpleasant
  rather than merely urgent. Same interval, sounded after rather than with:
  nothing overlaps, so nothing beats, and what is left is the unease of
  stepping down onto a note that is nearly the tonic and is not. The urgency
  moved into the timing instead — it is the quickest gesture in the set, at
  0.55 of a `--spread` where the others take a full one — and the timing is a
  token, `--t-alert`, rather than a constant in the script, so the keys and the
  screen can draw it. What a screen reader hears is composed from the steps
  too: it used to be written beside them, and `--close` went on announcing a
  fifth while it played a minor third.

- **The picture is drawn from the audio's own numbers, and so is the
  motion.** `flex-grow` takes a bare number and `--attack`/`--decay` are bare
  numbers, so the rise and the fall of the drawn envelope divide the width in
  exactly the ratio the sound is made at — nothing measures anything. Each key
  draws its sound as a contour: a head per note, across by its `--t`, up or
  down by its step at a `--contour-span` per semitone from a dotted line at the
  root. It replaced a bar sized by the last note's pitch, which could say how
  high but not which way or how soon: the alert's semitone came out 1.4px
  shorter than the tap's bar, and under `--close` all four bars matched. The
  screen draws the struck gesture on one axis for every sound — the slowest
  gesture in the set — with the second note the same shape as the first,
  drawn distinct over it, so the alert's lands visibly sooner than the
  commit's.

  A strike is one registered number, `--glow`, animated up over `--attack` and
  down over `--decay` — the gain node's two ramps, the fall eased along the
  envelope drawing's own four points — and the key, the heads and the line all
  read it. Multiplying the bare numbers by `1ms` is the whole of the
  conversion, so `component.css` names no motion duration at all. The flash
  used to be a fixed 420ms and the playhead a fixed 800ms, which drew
  `--hushed`'s 1.7s note in under half its length. Reduced motion keeps the
  light and drops what travels: a strike still fades over its own timing, but
  the heads do not swell and the playhead does not cross.

  The screen's shader keeps the same time rather than a time of its own: each
  frame reads the `currentTime` of a CSS animation that starts with the strike,
  so its sweep is in step with the CSS playhead and a paused preview holds it
  with everything else. It draws the first note as its waveform slowed twenty
  times — `--timebase` — so how tightly the strokes pack is the pitch; the
  second as a dashed outline with a tick per cycle; and the room as grain that
  runs past the edge, because the room rings past the note. The CSS envelope
  underneath is the same drawing and is what shows with no WebGL; the canvas
  fades in only once it has drawn.

- **Silence is the default, and the thumbnail is built for it.** The one place
  this study can never play is the landing page: a card's iframe has pointer
  events off, so there is no gesture to arm audio with, and a rail that made a
  noise on approach would be indefensible even where there is one. So the
  card's `active` state is `--live` — the set striking its own four keys in
  silence, one gesture rung out at a time, on the screen's own window, so
  `--hushed` plays itself through at its own slower tempo. The tempo is a
  keyframe on the rack and each beat is an ordinary strike, the one a click
  makes, so the thumbnail cannot show something the component does not do. A
  keyframe rather than a timer, because a paused animation fires no
  iterations: the index's one `animation-play-state` rule stops the clock while
  the rail is being dragged and holds a strike in flight where it stands. The
  shader's frame loop takes the pause as `--run`, handed in on the component's
  own element, and its buffer takes the rail's scale as `--buffer-scale`.

  Without `component.js` the component is still the component: the sheet, the
  key steps, the contours and the envelope are all CSS or markup reading the
  same tokens, so the card states its set correctly with no script at all.
  What the script adds is the sound, which CSS cannot reach, the strike, which
  is an event rather than a state, and the shader — so the arm switch ships
  `disabled` in `component.html` and the script enables it, rather than
  offering a control that does nothing.

Inspiration: none — original design. The tuning is the one borrowed thing and
it is borrowed from music rather than from an interface: a fifth and a fourth
against a 528Hz tonic, with the overtones at whole-number ratios above it. The
faceplate borrows a material rather than a panel — the walnut end cheeks
analogue synthesisers have had since the seventies — and no instrument's
layout, lettering or name.
