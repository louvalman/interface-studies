type: card

A card that is a label at rest and a panel when looked at. The label sits on
the bottom edge; on hover the whole bottom region grows upward, so the label
rises and the details arrive underneath it in the space it vacated. One
translation, not four things fading in — the layout itself moves.

The base card is content-agnostic: an article, a plan, a changelog. The
location treatment is a `--map` modifier layered on top — an abstract duotone
mesh with contour rings and a pulsing pin, so the map is drawn rather than
photographed.

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

The card on the index rests on whichever tone the rail is not: the dark card on
a light rail, the light card on a dark one. `--dark` is not a theme here, it is
one of the things this component is, so there is no default being overridden —
only a choice of which of two cards introduces the study, made against the
ground it will be seen on.

It is an edge problem before it is a taste one. The light card is `#f2f1ef` and
the light rail's ground is `#f3f2ef`: 0.30 OK ΔE, which is to say the same
colour. The card had no edge at all there — what separated it from the rail was
its own drop shadow and nothing else. Every other answer was worse. Moving the
shared ground only moves the problem, since the five components in the set span
OKL 92 to 100 and any single ground lands on top of one of them — measured, the
best achievable worst case across the set is ~1.2, against the 0.30 here. A
border added in `preview.html` would be the thumbnail reaching into the
component, which the preview contract forbids outright. The inversion spends
nothing that was not already built.

The dark card brought a `#101216` surround with it until this change, on the
argument that the tone was the variant's rather than the page's. That rule only
ever fired inside quick look while the light card was the resting one, which is
how it survived the sweep that took the inked plate's plotter grid off its
thumbnail. Resting on the dark card would have fired it on the rail, and this
would have been the one card in a light row carrying its own dark ground. It is
gone, and the ground is the rail's in every variant — which is also what gives
the plate its widest separation yet, against paper rather than against a
backdrop three ΔE from itself.

The cost, stated: the thumbnail is no longer a promise about the first thing on
the page behind it. `demo.html` leads with the light card in both themes, so a
reader on a light index clicks a dark card and lands on a light one. It is
milder here than it would be elsewhere — the demo shows the tones side by side
a screen down, so the other card is never more than a scroll away — and the
alternative was a thumbnail with no edge, which is worse than a thumbnail that
under-promises.

Inspiration: https://x.com/BThreeAgency/status/2084664063272055264 — a location
card whose details rise out from under its label. The reveal is what was taken;
the card under it is this build's.
