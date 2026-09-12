type: card
<!-- One of: card | button | layout | aesthetic | navigation.
     Must be the first line. It scopes what gets built:
       card / button / navigation -> just that component
       layout                     -> structure + placeholder content, grid only
       aesthetic                  -> a token block + 2-3 sample elements -->

<!-- Open on the component, in its own terms: one short paragraph saying what
     this is and what it does. Not where it came from — that line goes at the
     bottom of the file — and not a disclaimer about what was left behind. -->

A card that does one thing, said in a sentence or two.

<!-- 2-5 bullets. Name the specific decisions the build captures, not a general
     description. Delete these examples and write real ones. -->

- **Type scale.** e.g. 48px headline against a 15px body, with an 11px
  uppercase label letter-spaced 0.08em — three sizes, no in-between steps.
- **Spacing rhythm.** e.g. everything is a multiple of 8px except the
  label-to-headline gap, which is tightened to 4px.
- **Border treatment.** e.g. 2px solid black on all sides, no radius, and a
  flat 6px offset shadow in the same black rather than a blur.
- **Hover behaviour.** e.g. the whole card translates 2px up and left while the
  shadow grows to 8px, 120ms ease-out — the shadow does the work, not a colour
  change.

<!-- Optional: a decision that only works in its original context, or a
     construction deliberately changed — but as a bullet above, next to the
     other decisions, not as a paragraph of provenance. -->

<!-- The last line of the file. A URL for something seen elsewhere, or
     `Inspiration: none — original design`. At most a sentence or two after it
     if there is something worth saying about what was taken; no inventory of
     what was left behind. -->

Inspiration: https://example.com/the-page-this-came-from
