type: aesthetic

Source: supplied screenshot — a weather widget's gradient treatment.

The widget's content is not what is being captured. What is captured is how the
colour sits on the shape: the reference could hold anything, and the gradient
would still read the same way. Rebuilt as a set of shapes that carry one recipe,
so the same surface can be a tile, a card ground, or a page band.

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
- **One recipe, re-projected per shape.** `--gradient-shapes-art` is declared
  once and every surface uses it; the shape modifiers change only
  `border-radius` and `aspect-ratio`. The pools are positioned in percentages,
  so a circle, a pill and a full-width band each get the same light from the
  same relative direction rather than needing their own gradient.
- **The corner radius is proportional, not fixed.** `12%` on the tile, so the
  squircle character holds whether the shape renders at 96px in a thumbnail or
  at 400px on a page. A fixed `border-radius` in px reads as a different shape
  at each size.

- **The same surface, drawn instead of specified.** `--drawn` swaps the stop
  list for an SVG of two or three overlapping shapes blurred past recognition.
  The overlaps supply the mid-tones a stop list has to be hand-tuned to
  produce, and shapes with points — a star, a leaf — leave soft spokes that no
  arrangement of radial stops will give you. Two things make it work: the blur
  is a ratio of the surface (0.26) rather than a fixed length, so it dissolves
  by the same amount at any size; and the artwork bleeds 22% past the frame
  before being clipped, because blur samples the transparency outside the
  drawing and a fitted drawing fades to a vignette at every edge. `--raw`
  shows the same drawing before the blur, which is the useful half when
  building a new one.

Themes (`--dawn`, `--dusk`, `--mint`, `--ice`) set only the two colour stops;
shapes (`--tile`, `--circle`, `--arch`, `--pill`, `--card`, `--band`) set only
geometry; `--drawn` / `--raw` pick the recipe. The axes compose freely. Everything else — pool origins, reach,
where the colour has fully settled, the base — is a custom property, so a new
theme is two values and a new shape is one.
