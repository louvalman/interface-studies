type: card

Source: https://x.com/BThreeAgency/status/2084664063272055264

This is a reinterpretation, not a copy. The source was a location card backed by
a blurred landmark photo. Here the reveal mechanic is the component and the
subject is not — the base card is content-agnostic (an article, a plan, a
changelog), and the location treatment is a `--map` modifier layered on top:
an abstract duotone mesh with contour rings and a pulsing pin, so the map is
drawn rather than photographed.

- **The reveal is one translation, not a height animation of many parts.** The
  label is the only thing visible at rest, sitting at the bottom edge. On hover
  the whole bottom panel grows upward (`grid-template-rows: 0fr -> 1fr` on a
  clipped region), so the label *rises* and the details arrive underneath it in
  the space it vacated. Nothing fades in on top of anything — the layout itself
  moves, which is why it reads as one motion instead of four.
- **Easing and stagger.** `cubic-bezier(0.16, 1, 0.3, 1)` over ~420ms: a fast
  launch and a quick settle, so the panel appears to decelerate into place.
  Disclosed rows follow at 55ms intervals. The delays are declared *only* in the
  hover/open state, so leaving snaps back immediately — an exit that staggers
  feels broken.
- **The corner arrow hints, then gets out of the way.** The accent ↗ fades and
  drifts up-right as the details arrive, while a `→` grows in from zero width to
  the left of the label, pushing it right. One saturated colour, moved around
  the card rather than repeated.
- **Two typefaces doing two jobs.** Geometric sans at 28px/600 for the title;
  monospace, uppercase, 0.18em tracking for every label, badge, kicker and meta
  line. The tracking is what sells it — at 12px with normal spacing the same
  text reads as small body copy, not as a label.
- **Hairline rules that fade out to the right.** Separators are a 1px
  `linear-gradient(to right, rule, transparent)` used as a background, not a
  border. A full-width border would draw a hard box edge; the fade keeps the
  detail rows feeling like they float on the artwork.

Where there is no hover, the press stands in for it. The whole component is a
hover behaviour, so on a touch device it would otherwise be a title and nothing
else, the panel unreachable. Under `(hover: none)` the open state is repeated on
`:active` — it opens under the finger and closes when it lifts, the nearest
honest equivalent of moving a pointer on and off. The stagger is dropped there,
because a press is short and rows still arriving 200ms in are arriving after the
finger has gone. The card also stops insisting on its 21rem: the width is what
it wants, `max-width: 100%` is what it will accept, and the ratio keeps it the
same card either way.

Modifiers, all composable: `--map` (mesh, rings, pin — add the `__pin` element
and a `__kicker` line for coordinates), `--dark`, and `--open` to pin the reveal
open. `--map.--dark` is a two-class selector so it wins over either one alone,
whatever the source order. Re-theming otherwise happens from outside by
overriding custom properties; the pin origin moves with `--…-pin-x/y` and the
rings follow it. The `__kicker` line is optional — the stagger covers three or
four disclosed rows either way.
