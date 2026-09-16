type: aesthetic

A sound palette for an interface, written as a token block. Four sounds — a
tap, a commit, a revert and an alert — are declared as a tonic, an envelope, a
timbre and four intervals in semitones, and `component.js` reads those custom
properties and builds the sounds out of oscillators at the moment a pad is
struck. There are no audio files in the folder and no request to make. Beside
the pads is a read-out of the last strike: its name, its pitch, and its
envelope drawn from the same two numbers the gain node is using.

It ships silent. The arm switch in the corner is both the mute and the user
gesture a `AudioContext` needs, so the component cannot be the reason a page
makes a noise nobody asked for — and everything it says, it says visually too,
because a sound nobody hears still has to deliver what it was carrying.

- **A sound set is a tuning, not a library.** Seven numbers and four intervals:
  `--root: 528`, `--timbre: triangle`, `--attack: 4`, `--decay: 260`,
  `--level: 0.16`, `--partial: 2.76`, `--spread: 96`, and `0 / +7 / −5 / +1`
  semitones for the four sounds. `component.js` reads every one of them with
  `getComputedStyle` and hands them to the oscillators, so nothing is written
  twice and the whole set transposes when one value is overridden from outside.
  That is the test CLAUDE.md sets for a property block — re-theme it without
  opening the file — applied to something that is not a colour, and a `.wav`
  would fail it: a recorded sound is a decision you can replace but not edit.

- **The envelope is the character, not the pitch.** 4ms to peak and a 260ms
  *exponential* fall, plus one inharmonic partial at 2.76× the fundamental
  decaying at 0.6 of its rate — bright at the hit and gone well before the note
  is, which is what "struck" is. A linear fall reads as a tone being switched
  off. The `--hushed` variant proves the split by moving only these: attack to
  190ms, timbre to sine, and the same four intervals stop being percussive
  and become a swell, with no note changing pitch.

- **Direction carries the message.** Up a fifth for a commit, down a fourth for
  a revert, a single note at the root for a plain acknowledgement, and a
  semitone sounded *against* the root for the alert — the one sound in the set
  meant to be unpleasant, and it is unpleasant because two close pitches beat
  against each other rather than because it is loud. Every sound starts at the
  tonic, which is what makes four of them read as one family.

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

Inspiration: none — original design. The tuning is the one borrowed thing and
it is borrowed from music rather than from an interface: the intervals are a
just-ish fifth and fourth against a 528Hz tonic, and 2.76 is roughly where the
first partial of a struck bar sits above its fundamental.
