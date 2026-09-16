type: aesthetic

A sound palette for an interface, written as a token block. Four sounds — a
tap, a commit, a revert and an alert — are declared as a tuning, a voice, a
strike and a room, and `component.js` reads those custom properties and builds
the sounds out of oscillators at the moment a pad is struck. There are no audio
files in the folder and no request to make, the reverb included: its impulse
response is generated from two numbers when the set is armed. Beside the pads
is a read-out of the last strike: its name, its pitch, and its envelope drawn
from the same two numbers the gain node is using.

It ships silent. The arm switch in the corner is both the mute and the user
gesture an `AudioContext` needs, so the component cannot be the reason a page
makes a noise nobody asked for — and everything it says, it says visually too,
because a sound nobody hears still has to deliver what it was carrying.

- **A sound set is a palette, not a library.** Twenty-odd numbers in four
  groups — what it is tuned to, what one note is made of, how a note arrives
  and leaves, and what room it is heard in. `component.js` reads every one of
  them with `getComputedStyle` and hands them to the nodes, so nothing is
  written twice and the whole set moves when one value is overridden from
  outside. That is the test CLAUDE.md sets for a property block — re-theme it
  without opening the file — applied to something that is not a colour, and a
  `.wav` would fail it: a recorded sound is a decision you can replace but not
  edit.

- **A note is four layers, not a waveform.** A sine fundamental sounded twice
  seven cents apart and panned against itself, so it drifts instead of sitting
  still; an octave above it at 0.22 for body; a twelfth above that at 0.06 for
  shimmer, decaying at 0.3 of the fundamental's rate because every acoustic
  overtone dies before its note does; and 26ms of band-passed noise at 2.1kHz
  under the attack, which is the click. All of it through one 3.4kHz lowpass
  and then split between the dry signal and a small generated room. The first
  version was one oscillator with a sharp envelope and it sounded like a 1980s
  sound chip for three separable reasons, each worth knowing on its own: a raw
  geometric wave with nothing rolled off; an *inharmonic* partial at 2.76× the
  fundamental, which is the ratio a struck metal bar has and an overtone
  belonging to no key, so it reads as a bleep however carefully it is
  enveloped; and a 4ms attack, which is not a click but a discontinuity. A
  click is a layer. An attack is a shape. Sharpening the second to get the
  first is what makes a set brittle.

- **Direction carries the message, and nothing in the set beats.** Up a fifth
  for a commit, down a fourth for a revert, a single note at the root for a
  plain acknowledgement, and a semitone *down* for the alert, played quickly.
  That last one used to sound its semitone against the root — two pitches 31 Hz
  apart, which is not slow beating but roughness, and genuinely unpleasant
  rather than merely urgent. Same interval, sounded after rather than with:
  nothing overlaps, so nothing beats, and what is left is the unease of
  stepping down onto a note that is nearly the tonic and is not. The urgency
  moved into the timing instead — it is the quickest gesture in the set, at
  0.55 of a `--spread` where the others take a full one.

- **The picture is drawn from the audio's own numbers.** `flex-grow` takes a
  bare number and `--attack`/`--decay` are bare numbers, so the rise and the
  fall of the drawn envelope divide the width in exactly the ratio the sound is
  made at — nothing measures anything. The pitch bar on each pad takes its
  height from `calc()` on that pad's semitone token. So the drawing cannot fall
  out of step with the sound, and retuning the set redraws it for free.

- **Silence is the default, and the thumbnail is built for it.** The one place
  this study can never play is the landing page: a card's iframe has pointer
  events off, so there is no gesture to arm audio with, and a rail that made a
  noise on approach would be indefensible even where there is one. So the
  card's `active` state is `--live` — the set striking its own four pads in
  silence, on a CSS stagger, with a playhead crossing the envelope. Keyframes
  rather than a timer, so the index's one `animation-play-state` rule stops all
  of it while the rail is being dragged.

  Without `component.js` the component is still the component: the palette
  list, the pad steps and the envelope are all CSS reading the same tokens, so
  the card states its set correctly with no script at all. What the script adds
  is the sound, which CSS cannot reach — so the arm switch ships `disabled` in
  `component.html` and the script enables it, rather than offering a control
  that does nothing.

Inspiration: none — original design. The tuning is the one borrowed thing and
it is borrowed from music rather than from an interface: a fifth and a fourth
against a 528Hz tonic, with the overtones at whole-number ratios above it.
