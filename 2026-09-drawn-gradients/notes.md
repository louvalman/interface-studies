type: aesthetic

Source: supplied screenshot — a weather widget's gradient treatment.

The widget's content is not what is being captured. What is captured is how the
colour sits on the surface: the reference could hold anything, and the gradient
would still read the same way.

Rebuilt around how such a field is *made*. The primary technique here is to draw
a few overlapping shapes in SVG and blur them past recognition — the shapes are
the instrument, not the subject, which is why they are not what the reference is
named after. A hand-written stop list reaches the same look more cheaply, so
both are kept: the drawing for surfaces that are large or moving, the stop list
for the static ones.

- **The gradient is drawn, then blurred.** `--drawn` swaps the stop list for
  an SVG of two or three overlapping shapes blurred past recognition.
  The overlaps supply the mid-tones a stop list has to be hand-tuned to
  produce, and shapes with points — a star, a leaf — leave soft spokes that no
  arrangement of radial stops will give you. Two things make it work: the blur
  is a ratio of the surface rather than a fixed length, so it dissolves by the
  same amount at any size — and the ratio is per drawing, since a dense one
  (a mosaic, a scatter, stacked bands) averages to a single flat colour at the
  0.26 a few large shapes want, and needs 0.1 or less; and the artwork bleeds 22% past the frame
  before being clipped, because blur samples the transparency outside the
  drawing and a fitted drawing fades to a vignette at every edge. `--raw`
  shows the same drawing before the blur, which is the useful half when
  building a new one.

- **Two radial pools over a vertical settle, never a single linear ramp.**
  Colour gathers at two off-centre origins near the top edge and dissolves
  outward; a `linear-gradient` underneath carries the last of it down to the
  base. One linear ramp corner-to-corner is what makes cheap gradients band —
  the eye finds the axis. With the pools offset from each other there is no
  axis to find, and the falloff stays smooth at any size.
- **It settles to the surface colour, not to a second hue.** The bottom ~40%
  is plain `#fff`. That is what makes the shape read as lit from one corner
  rather than as a two-colour blend, and it is why body copy can sit on the
  lower half without a scrim.
- **Saturation drops faster than lightness.** The hot stop is the only
  saturated colour; the wash stop is already half-way to the base. Fading a
  gradient by lightness alone leaves a muddy middle — dropping saturation first
  keeps the mid-tones clean.
- **One recipe, re-projected per shape.** `--drawn-gradients-art` is declared
  once and every surface uses it; the shape modifiers change only
  `border-radius` and `aspect-ratio`. The pools are positioned in percentages,
  so a circle, a pill and a full-width band each get the same light from the
  same relative direction rather than needing their own gradient.
- **Content type is a ratio of the surface, like the radius.** The figure,
  label and micro line are `calc()`s of `--…-size`, not fixed rem. Set in rem
  they stayed put while the card scaled, so a card shown small kept
  full-size type and the label ran outside its own box. The ratios resolve to
  the original values at the default size; only the legend that *names* a set
  keeps a fixed size, because it sits beside the surfaces rather than on them.

- **The corner radius is proportional, not fixed.** `12%` on the tile, so the
  squircle character holds whether the shape renders at 96px in a thumbnail or
  at 400px on a page. A fixed `border-radius` in px reads as a different shape
  at each size.

Themes (`--dawn`, `--dusk`, `--mint`, `--ice`) set only the three colour stops;
shapes (`--tile`, `--circle`, `--arch`, `--pill`, `--card`, `--band`) set only
geometry; `--drawn` / `--raw` pick the recipe; `--night` moves the base the
colour settles to. The axes compose freely. Everything else — pool origins and
reach, blur and bleed, where the colour has fully settled — is a custom
property, so a new theme is three values and a new shape is one.

Each shape sets a width off `--…-size`, which is a length and knows nothing
about the column it lands in — so every surface also carries `max-width: 100%`.
A phone is narrower than the card at 2.15x or the pill at 1.85x, and a surface
that insisted on its width there would scroll the page sideways rather than
fit. Because the radius and the type are ratios of the surface, a fitted one is
still the same shape, only smaller.
