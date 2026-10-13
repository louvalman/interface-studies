type: navigation

A rotary selector for a mode you stay in. Its choices sit round a knurled
charcoal dial set into a cloth-dotted plate, and turning it brings one at a
time under a fixed index mark. Underneath it is a radio group in a form, so
arrow keys, a screen reader and a server all have it with no script; turning
it by dragging is what component.js adds. Three item sets show where it
belongs: an archive's views as icons that say their name when reached for, a
dashboard's time range engraved round the arc, and a game's kit with a
display and a centre key that commits.

- **One number turns everything.** Eight `:has(… :nth-child(k) > :checked)`
  rules write `--mode-dial-sel` on the root, and six `:nth-child(k):last-child`
  rules write `--mode-dial-n`. Three parts turn to
  `-(sel + laps·n + drag) · 360deg/n` on one transition — the knurl, the
  engraving and the options layer — and each option sits on that layer at
  `sin()`/`cos()` of `i · 360deg/n` × 28cqi and turns back by the same angle on
  the same transition, so names and icons stay upright in lockstep without
  `@property`: measured mid-turn, layer 31.49° and option −31.49°. The face
  that holds them does not turn and is not a stacking context, which is what
  lets the options layer sit above the centre key, so a tooltip is never drawn
  under it. The engraved words, the display's readouts and the selected word's
  weight are arithmetic on `i - sel`, through `color-mix()` and `max(d, -d)`,
  rather than further ladders.
- **A detent is an overshoot, and the wrap is what CSS cannot do.** 420ms on
  `linear(0, .42 12%, .8 26%, 1.045 46%, 1.06 52%, .995 72%, 1.003 86%, 1)`
  passes the stop by 6% of the move (3.6° on a six-way dial) and settles; each
  extra step adds 70ms. Without script, last-to-first spins back the long way
  (0° to −300°), which reads as an end stop. component.js keeps a winding count
  (`--mode-dial-laps`) so every turn takes the near way (0° to +60°), and turns
  a drag into `Math.atan2` steps that check the radio as each detent is crossed,
  0.6 of a step past it, one detent at a time: a sweep of 3.3 steps fires
  exactly three `change` events, so a drag is heard exactly as an arrow key is.
  A drag starts anywhere on the dial but the key. The knurl is
  `touch-action: none`, a full circular drag for a thumb; the rest of the dial
  is `pan-y`, because the knurl is 12px wide on a phone and too thin to aim
  for, so a sideways swipe across the face turns it while a vertical one still
  scrolls the page — the browser takes that swipe, sends `pointercancel`, and
  the dial snaps back to the last detent it reached.
- **One light, and it does not turn.** `--mode-dial-light: 27deg`; every
  shadow, the knurl's conic rim light, the plate's chamfer, the face's soft
  two-lobed streak, the cloth's bumps and the engraving lip are offset by its
  `sin()`/`cos()`. The light layer sits on the face, which never turns, so
  the 120 teeth slide through a highlight that stays put. 120 divides by 3, 4,
  5, 6 and 8, so every detent lands on a whole tooth. The cloth is on the
  deck only, in pixels rather than cqi: a 4px quincunx of 1px bumps, each a
  shade disc with a highlight nudged a quarter-pixel toward the light, so a
  small dial has fewer dots, not smaller ones. The deck is square without a
  display, a 24px margin on every side at the default size, and casts a warm
  three-layer shadow down and to the right.
- **Browsing and choosing are two marks.** With the centre key present, the
  checked radio is the pending choice and `:default` (the radio carrying the
  `checked` attribute) is the committed one: the index goes hollow and the key
  takes a ring while they differ, and a pip on the face stays with what was
  committed. Without script the key submits the form as GET (`?kit=compass`),
  and so does Enter on a radio in a dial with a key — accepted, since that is
  the form doing what it says; with no key, Enter does nothing. With script,
  committing rewrites `defaultChecked`, Enter on a radio commits, and Escape
  is `form.reset()`. The camera has neither a key nor a display; both come
  from asking what a page or a game needs from the control, and a view or a
  filter applies as it turns.
- **No hover to spend, and nothing muted.** Names rise as tooltips on
  `:hover`, on `:focus-visible` and, under `(hover: none)`, on `:active` and on
  the checked item, always toward the centre with their near edge 6cqi from
  the icon, so none leaves the face: the farthest corner is at 28cqi of a 240px dial and
  35cqi of the 136px one, inside the face's 37.4. The
  paint is `#b0ada6`, 6.16:1 on the face and 4.94 at the brightest point of the
  fixed streak; the chosen word is `#f1efe8`, 11.99, and 9.49 on the key. The
  signal `#f0965f` — index, focus ring, pending ring, pip, never text — is 6.06
  on the face, 4.86 at its brightest, 5.32 on the deck and 4.10 on the key's
  lit side, against a 3:1 floor. The display is one ink on one glass,
  `#1b1f17` on `#b3b9a2` at 8.27 (6.00 in the bezel's shade), because a second,
  dimmer ink was the first thing to fall under the floor.

Inspiration: https://www.fujifilm-x.com/global/products/cameras/x-t50/ — the film-simulation dial on its top plate: the knurled rim, the fixed index and the detent. The item set, the lettering and what it selects are this study's own.
