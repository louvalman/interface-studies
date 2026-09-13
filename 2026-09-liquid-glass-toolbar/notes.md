type: navigation

A floating toolbar on one pane of glass. Four items sit together and a fifth is
set apart; exactly one of them carries its label, and it is the one you are on.
The search item opens into a field and the log item opens the pane
downward into a panel — neither is a second sheet sliding out from underneath,
the one surface changes shape, and the corner it does that around never moves.

The set is a working surface rather than an operating system: Origin, search,
Versions, Log, Display. Each item is named for what its glyph can actually do —
two sliders are display controls, not a settings screen; two drawers are
versions of a thing, not a mailbox — so the bar says what it is for before a
label opens. It is also why the labelled item is *Origin* and not Home: a
toolbar that floats over work has no front door to return to, it has a point it
measures from, and that is what its glyph draws — a dot inside a ring.

It is as dull as it can afford to be, and finding that floor is the point. Glass
has no look of its own — a blur over one flat fill is indistinguishable from a
translucent rectangle, and the whole component disappears. But what it actually
needs is *range*, not incident: two soft cross-lit ramps with no edges anywhere
give the rim something to sit against and the blur something to carry, and an
earlier version with hard-cut clay and sage planes turned out to be buying that
at the cost of a backdrop that upstaged the thing in front of it. An even ground
settles the vertical centring too. The component is centred exactly — 262.5px of
frame above and below it in the thumbnail — but a ground whose whole colour mass
sat in the lower third read as bottom-heavy, and a thing centred in a
bottom-heavy frame looks like it is floating high.

The ground under the component is page scaffolding in both files rather than
part of it, which is what lets the two differ at all. That argument is about
the stage, and the thumbnail does not get it. Every other study's preview sits
on a flat #f3f2ef, and this one arrived in the rail on its own darker, warmer
paper — at 0.7 scale beside three near-white neighbours the card read as a
different kind of object before it read as a component, which is the opposite
of what a thumbnail is for. So preview.html takes the shared paper and
demo.html's stage keeps the ramps. The glass survives the trade because the
thumbnail is not showing one sheet: it stacks two, and the lower one has its
panel open, so there is a 300px plate of tinted glass on that paper with its own
rim, sheen and drop shadow. A single sheet at rest on flat paper would be the
failure above; an open field and an open panel on it are a component doing
something.

The icons are drawn rather than borrowed: a dot inside a ring, a magnifier, two
drawers, a ruled ledger, two sliders. The magnifier is the one glyph in a
toolbar with no synonym — every other function has several ways to be drawn, so
the set is a place to have an opinion; search is not.

Origin was an arched doorway first, then a benchmark triangle. The doorway was
drawing the word *home* rather than the word it sits under, and five were
rendered at real size in the bar to replace it: a square on a baseline, three
courses of a plinth, a diamond resting on a rule, a circle overshooting one,
and a block on a ground plane in axonometric. The plinth read as an align-left
control, the circle read as a second magnifier, and the axonometric block
turned to mush at 24px. The benchmark won that round for being the only
triangle in the set. It was also the only hard corner in a component built
entirely of stadiums, and that is what eventually lost it: the glyph was stern
where nothing else is. What stands there now is the station mark a survey
measures from — a dot inside a ring — which is the idea the benchmark was
drawing, without the diagonal. The circle that failed the first round failed as
a bare circle beside a magnifier; what separates these two is the centre dot
and the absence of a stem, and at 24px in the bar they do not trade. The cost
is that the set gives up its only diagonal, so the magnifier's stem is the one
oblique left in it.

The panel item is called Log, not Notifications, and the icon is a margin rule
with three entries set beside it. Notifications is a promise about delivery —
it says these are things that were pushed at you. What the four rows actually
are is a record of what was decided: a type pair set, a tint thinned, a spacing
rhythm fixed, a radius made proportional. Naming it for the content rather than
for the transport also stops the component being read as an alert centre, which
is a different thing with different rules about badges and dismissal.

The ledger replaced four bars of uneven height, and the rename is what broke
them. Four bars measure a quantity; they were a fair drawing of Activity and
they are the wrong drawing of a Log, which records entries rather than levels.
Four drafts went up at real size against them: bulleted entries, a spine with
commit dots, a spine with branch ticks, and three rules of even length. The
commit dots blobbed into their own stem at 24px, the branch ticks read as a
fork, and three even rules read as a menu. The bulleted list read cleanly and
still lost, because a bulleted list is a list of anything — a playlist, a to-do
— where a margin rule with entries beside it is a ledger. It also keeps the
vertical stroke the bars were carrying, which matters more than it sounds: with
it gone, Versions, Log and Display are three horizontal-line glyphs sitting in
a row, and the middle of the bar turns to hatching.

Drawing a set by hand means centring it by hand. The pill centres the icon's
*box*, so a glyph that does not centre in its own 24-unit box is off-centre in
every pill it lands in, and it is invisible in the source — the numbers look
tidy. Three of the five were out when the set was first drawn: the benchmark
and the bars sat 0.70 units low, the magnifier 0.40 low and 0.40 right. The
ring and the ledger that replaced two of them were drawn to the same rule and
checked the same way — all five now land on 12.00 of 24, and all five are
symmetric across it. Measured as the ink bounds plus half a stroke on each
side, which is what the eye reads and what `getBBox()` leaves out.

- **Every row in the panel carries a specimen, not an avatar.** The four
  entries are decisions that were taken — a type pair, a tint, a spacing
  rhythm, a radius — so the thing at the head of each is a drawing of the
  *kind* of decision: a three-step ramp whose bars lose weight as they lose
  length, a disc filled to half, a gap measured between two rules, a corner
  filleted over the square corner it replaced, left in at 0.42 behind it so
  the chip shows what the radius did. A face or a bell says only who or what
  delivered the row; a diagram says what it is about before the line beside it
  is read, which is the one job something 19px wide can do.

  The frame moved with the content. A round frame around a technical diagram
  reads as an avatar with a picture in it, so the chip is a squircle — the
  plate the specimen is printed on. The class is `__chip` and the bold lead is
  `__topic`, because `__avatar` and `__who` in the contract file would be
  describing a component that no longer exists.

- **The unread mark is a rule under the glyph, not a dot on its corner.** A
  corner dot is the platform idiom and it is the wrong object on this bar: it
  is opaque, it is round, and it sits *on* a surface whose whole argument is
  that everything is either the material or seen through it. Set under the
  glyph it reads as part of the item instead, and it is the lozenge's own shape
  at a fifth of the size — the bar already says *current* with a stadium, so it
  can say *unread* with one too. It is 0.75 of the glyph long, centred on it
  rather than pinned to a corner, so it travels with the icon instead of being
  left behind when one collapses to zero width, and it stops a hair short of
  full strength, because an accent at 1 would be the only thing on the bar not
  under the surface.

- **One reveal mechanism, two payloads.** Every morph in the bar is the same
  `grid-template-columns: 0fr -> 1fr` column with `overflow: hidden` over it.
  What sits in the track is a text label on four of the items and a text input
  on the fifth, and the track does not know which — that is why the search field
  and the nav labels read as the same piece of surface moving rather than as two
  effects. The catch is that a box cannot be narrower than its own padding, so
  the gap between an icon and its label is `text-indent`, not `padding`: an
  indent is part of the line, disappears with the text, and still counts towards
  the max-content width the open track measures. Padded, every collapsed item
  kept an 11px stripe of nothing beside it. The input is the one payload measured
  in a length instead of `fr`, because a text input has no max-content worth the
  name — its intrinsic width comes from the `size` attribute, which CSS cannot
  set.

  An expanded pill is not padded symmetrically either, and it should not be. A
  collapsed one is — but the icon does not fill its box, so there is a bearing of
  free air before the glyph that the text at the other end never gets.
  `--label-trail` hands the trailing side that bearing back. It is applied in the
  expanded state only, so the collapsed action stays exactly square, and it moves
  on the label's clock so the pill does not finish growing after the word inside
  it has stopped.

  The bearing is not one number, which is the part that took measuring. Every
  icon in the set is symmetric inside its own box, but they do not agree with
  each other — at a 24px icon: the drawers 2.6, the sliders 2.8, the ring 4.0,
  the ledger 4.0. `--icon/7` is 3.43 against a mean of 3.35 across the four that
  carry a label, so a single constant lands within a pixel of right for all of
  them and exactly right for none. It tracks the glyphs, so it moves when they
  do: this was `--icon/9` against the benchmark-and-bars set, whose mean was
  2.75, and redrawing two of the five moved it. Redraw an icon, re-measure this.

  It was `--icon/6` — the mean plus a deliberate 1.35px, on the theory that text
  reads tighter against a stadium's curve than a roundish glyph does. That was
  tuned against a 16px label, and it did not survive the label coming down to
  13px: the word is smaller and no longer reaches the part of the curve that
  closes in, so the correction had outgrown the thing it corrected. On the
  narrowest bearing in the set the pill was carrying nearly 2px more air after
  the word than before the glyph, which is enough to see, and that is the item
  the thumbnail shows at rest. The worst residual is 0.83px now, on Versions, and
  the only way past that is to normalise the icons to one bearing rather than
  average over four.

  Vertically it was the label that was out of step, not the icons: all five are
  centred in their own boxes to the hundredth (12.00 of 24, measured). The label
  was centred by `line-height: var(--hit)`, and a line box is centred on the em
  box — which is not symmetric about the letters. Plus Jakarta Sans runs 1.0em up
  and 0.23em down, so the em midpoint sits above the middle of a cap block, and
  a word with no descenders — which all four of these are — lands half a pixel
  below the centre it was aimed at.

  `text-box: trim-both cap alphabetic` is the fix, and it is the one primitive
  that addresses this directly: it cuts the line box down to the cap block, so
  the flex centring the action already does lands the letters rather than the em
  box. It costs a `padding-block`, because trimmed to the baseline a descender
  hangs outside the box and the reveal's `overflow: hidden` would take the 'y'
  off "Log". That padding goes on the label, not the reveal — the reveal
  also holds the search input at full `--hit` — and it is padding-block, which
  the label can carry where padding-inline would floor its collapsed width above
  zero.

  What is left is 0.33px, and it is rounding rather than error. The face declares
  a cap height of 0.744em; at 13px the rasteriser puts 'H' on a whole pixel, 9
  instead of 9.67. The trim aligns to the metric the font states, and the
  remainder moves with size and device ratio. It is behind `@supports`, so a
  browser without `text-box` keeps the line-height and the old half pixel, which
  was never visible at 1x anyway.

  The same rule caught the panel, in the other axis and much less visibly. Its
  row collapses to `0fr` when closed, but the feed inside carried a
  `padding-bottom`, so the closed panel was not 0 tall — it was one padding
  tall. That strip of dead height sat inside the surface under the bar, which
  put every pill above the bar's centre and made the outer radius stop nesting
  round the inner ones. Neither symptom looks like a padding problem. The feed's
  inset is margin now; margins do not floor a box.

- **A cluster of four and a trailing one.** The bar is not five evenly spaced
  icons. Four sit together and the last is set apart by `--split`, which is what
  makes a closed pill read as a toolbar rather than as a row of buttons — the
  gap says the last item is a different kind of thing, before any label appears
  to explain it. It is also the component's only slack: it is the first thing to
  give when the bar is squeezed, so a label opening or a narrow column eats into
  empty space before it starts clipping text. First is a claim that has to be
  enforced, though, not just declared with a big shrink factor: flex shrink is
  proportional, not ordered, and a split with six times the factor still handed
  a third of an overflow to the item beside it. See the search field below.

  It gives in the other direction too, and that took a second round to notice.
  The bar stretches to the surface, and the surface is not always the width the
  row asked for — the panel has a floor of its own, so opening it can make the
  surface wider than the bar needs. Without a grow factor that extra piled up
  past the last action and left the trailing icon stranded 60px short of the
  edge it is supposed to be pinned to. Growing the gap instead is
  `margin-inline-start: auto` with a minimum, and the minimum is the point:
  `auto` alone collapses the split entirely whenever the bar is exactly its
  content width, which is most of the time.

  It is a pseudo-element rather than a spacer in the markup, ordered between the
  two groups. One catch, and it cost a round: a `flex-basis` on a pseudo-element
  is not counted in the flex container's max-content contribution, so the
  surface sized itself as if the gap were not there and then the gap took its
  space back out of the labels. Setting `width` instead of `flex-basis` is
  counted.

- **The corner is derived, and it is the one thing the morph does not change.**
  `--radius-open` is `--pad + --hit / 2`: the pad plus half a pill, which is
  exactly the radius that runs concentric with the corner actions inside it.
  Closed, `999px` clamps to half the bar's height and lands on the same number.
  So the surface keeps its corner through the morph and the height does all the
  work — which is what the reference does too, and it is why the inner pills
  never look like they are sitting in a box cut to a different curve.

- **One surface, not two sheets.** The bar and the panel live inside a single
  `__shell`, and it is the only thing carrying a backdrop filter, a rim and a
  shadow. Opening the panel does not slide a second sheet out from under a
  pill; the one surface changes shape — `border-radius` from 999px to 1.375rem,
  and a panel row from `0fr` to `1fr`. Width is the part that is not animated
  and looks like it is: the shell is `width: fit-content`, and an auto-width box
  re-measures its children every frame, so a label opening from zero drags the
  whole pill wider with it. The panel's own `width` goes 0 -> 24rem for the same
  reason — it is what the closed shell measures, and at 0 the pill hugs the bar
  instead of standing at panel width with nothing in it.

- **The label is the selection indicator, and ARIA is where the state lives.**
  Exactly one item carries its label, and it is the one under the lozenge —
  a label here is not a tooltip. The CSS reads that straight off the attributes
  the component needs anyway: `aria-current="page"` on the three destinations,
  `aria-expanded="true"` on the panel button, `:focus-within` on the search
  field. So `component.js` writes two attributes and nothing else — it never
  measures, positions or animates — and the search field needs no script at all.
  There is no sliding element either: the outgoing pill shrinks back to a square
  while the incoming one grows, and because they are adjacent in a flex row the
  highlight reads as one mass travelling.

- **The label is set as chrome, not as body copy.** 13px/500, tracked +0.01em,
  beside a 24px icon in a 48px pill. The first pass ran it at 16px/600 with the
  small negative tracking a 16px word wants, and that is a body size and a body
  weight: the word became the heaviest mass on a bar whose whole subject is a
  row of 1.6px strokes, and the pill had to grow to hold it. A caption on a
  glyph is set a step under the text around it, not level with it — the icon
  leads and the label follows, which is also the reading order the component is
  arguing for. Tracking flips sign with the size rather than carrying over: the
  small negative that keeps a 16px word from looking loose closes the counters
  at 13px and turns the word into a smudge on a translucent surface.

  Size, weight and tracking are three tunables now, not one hardcoded pair, and
  the feed came off the same token while they moved. One `--label-size` served
  the pill label, the search input and the notification line, which is fine
  while they agree and a trap the moment they do not: dragging a sentence down
  to 13px to keep it equal to a pill label is the chrome setting the type scale
  for the prose. The line has `--row-size` at 15px, the pill has `--label-size`
  at 13px, and the search input stays on `--label-size` because it sits in the
  bar's own optical row and has to match the label it replaces. The narrow
  container scales `--row-size` now rather than `--label-size` — at that width
  the label track is shut and the feed is the only text left to scale.

  The thumbnail restates both, the way it restates the hairline. It lays the
  component out about 4% larger than base, and the type used to be bumped 6–7%
  on top of that — type running hotter than the geometry it sits in, in exactly
  the frame where the component is judged first.

- **The open state is five variables, declared once.** `--open` and the `:has()`
  that detects a real `aria-expanded` both set the same five custom properties,
  and every rule downstream reads those. The alternative is repeating a
  two-selector prefix at each rule that cares about being open. Only the three
  places where a variable cannot carry the change — suppressing the other items'
  tint, their reveals, and the search track's unit — are written as selectors.

- **Glass as a recipe, so a theme is a tint swap.** Four shadows doing four
  jobs: a 1px inset rim that separates glass from what is behind it, an inset
  highlight along the top edge that gives the sheet thickness, a hairline
  along the inside of the bottom that is the same light coming back off the
  far face, and a soft drop that lifts it off the page. Two of those are new
  and so are two filter scalars — see the thinning note below; the bottom edge
  is `0 0 0 0 transparent` and the scalars are 1 unless a material asks. The lit lozenge used to carry a second, weaker
  `backdrop-filter` of its own, and it looked marginally better and cost far
  too much — see the motion note below. It is a translucent tint and a rim now.
  The hue is carried by the tint alone: the glass is
  moss, and the rim, the sheen and the ink are warm off-whites pulled a few
  points the same way, so moving the tint does not send you round re-tuning six
  other colours. The one saturated value is the accent, clay from across the
  wheel, and it is spent only on the two marks that mean unread. `--light`
  changes nothing below the variable block — tint, rim, sheen and ink — and the
  same construction comes back in six materials. Moss is the default and has no
  modifier; `--alabaster`, `--slate`, `--basalt`, `--carnelian` and `--crystal`
  are the others. Named for materials rather than for brightness, which is not
  decoration: two of the six flip to dark ink, so `--light` would have been describing part of
  the set by a property the rest do not share.

  Alabaster took a round to get right, and the mistake is the useful part. The
  first version tinted it with the dark theme's own hue, and a green-grey glass
  sitting on warm paper reads as a cast rather than as a material. Four palettes
  on the real ground settled it: pale sage read sickly, cool porcelain read
  clinical against the paper, limestone had the most material presence but
  muddied the lit pill's edge, and bone kept both the warmth and the crispness.
  So a light theme is not the dark one turned up — it is a second material of
  the same construction, and what decides its hue is the ground it will sit on.

  Its ink is a warm greige rather than a near-black, for the same reason the
  glass is not white: alabaster is the lightest thing in the component, and ink
  at full strength on it reads as printed on top of the sheet rather than seen
  through it. The part worth remembering is what has to move with it. Softening
  the strong text spends contrast the strong text had going spare — 12.5:1 down
  to 7.0:1 against this surface — but the muted line is derived from the same
  colour and had none to spare at 4.1:1, so dropping the ink without taking its
  alpha *up* quietly takes the quiet text below where it started. It ends at
  4.5:1, better than it was.

  The other two are each a whole palette for the same reason, not a hue
  rotation. Slate wants its saturation kept *down*, because a blue glass with
  the saturate pushed up starts tinting what is behind it and reads as a filter
  rather than a surface. Basalt leans on its rim more than any of them: against
  a light ground a near-black sheet has plenty of contrast at its face and none
  at all at its edge, so without the hairline it stops reading as glass and
  starts reading as a hole. And the accent moves with each — the warm mark that
  reads on moss is not the warm that reads on a near-black, and carnelian is the
  one that cannot move by hue at all: its ground *is* that hue, so the set's
  amber measured to within 0.004 of the sheet's own luminance and disappeared
  into it. A mark the same brightness as what it sits on is not a mark, whatever
  its hue. A jade fixed it and read alien — the only cool value in the component,
  announcing itself as an exception — so it separates on lightness instead, the
  same amber walked up until it clears the sheet and no further. Past about
  `#ffd992` it stops being a colour and starts being a highlight.

- **Thin the tint, and the filter has to take the work.** The first version of
  the set carried its colour in the tint, at 42–64% opacity. That is a coloured
  surface with a texture underneath it rather than glass: nothing of the page
  survives the trip through it, and the backdrop filter is only there to keep
  the texture from being legible. Every material is thinner now — 28–44%, and
  crystal at 7% — and thinning is not a slider you can turn on its own. Three
  things had to move with it.

  The filter grew `brightness` and `contrast`. Brightness does the darkening the
  tint used to do, which is the whole trick for the dark materials: moss at 28%
  over a light page is a pale green wash, and moss at 28% over a page turned
  down to 0.56 is a dark sheet you can see the page's cross-light through. It is
  also better ink: the label went from 2.3:1 against the lit pill to about 4:1,
  because the surface under it got *darker* while getting more transparent.
  Contrast keeps the ground's range from flattening as it is pushed around.

  The blur came down, 14px to 8px, and this is the counter-intuitive half. Blur
  is frost, not glass — past about 10px whatever is behind the sheet stops being
  a place and becomes a wash, and at that point the tint is doing all the work
  again. Clear glass displaces what is behind it; it does not hide it.

  And the edges took over what the body gave up. Every rim and sheen went up,
  the lit lozenge became a rim with a thin body rather than a pale fill — a
  glaze is a transparent body with a lit edge, and it is now that in all six
  rather than only in alabaster — and each drop gained a second, tight contact
  shadow, because one soft shadow lifts an opaque card fine and a thin one still
  reads as painted on.

- **Crystal, the one that is actually glass.** At 7% the tint decides nothing
  and the material is carried entirely by what it does to the light and by its
  edges. Its brightness goes slightly *below* 1, which is the single most useful
  thing on this page: real glass absorbs a little, and a sheet a shade darker
  than the page with bright edges reads as glass, where a brighter one reads as
  paint. Every attempt to sell it by *adding* — more saturation, more contrast,
  more lift — came back looking like amber or like a white sticker, because on a
  warm ground those all push toward cream. `--edge` is the other half: a
  hairline along the inside of the bottom, the cheapest available stand-in for
  refraction, which CSS cannot do, and most of what gives a pane this thin any
  thickness at all.

  It cost alabaster a round, and the mistake is instructive. Thinning alabaster
  along with the others put it and crystal in the same place — two pale sheets
  on warm paper, distinguishable only by their rims — and a set of five with two
  members doing the same thing is a set of four with a spare. Alabaster went
  back up to 44% and kept its brightness near 1: it is milk glass, a body you
  cannot see through, and crystal is a pane you can. What separates them is not
  how light they are.

  That is also why crystal is the only one whose ink follows the page rather
  than the sheet. The other five carry enough tint to stay themselves over
  anything — alabaster is a light plate on a dark page, basalt a dark one on
  light paper — so each one's ink is settled once, against its own body. A pane
  has no body to settle against: it becomes whatever is behind it. On light
  paper that is a pale sheet wearing dark ink, which is the whole idea; on the
  dark theme the index grew it is a dark sheet wearing dark ink, measured at
  1.3:1, which is no idea at all. `light-dark()` reads the page's own
  `color-scheme`, so it follows an explicit toggle and the OS default alike
  without the component naming a selector outside itself — and both pages now
  declare that scheme, which they had not needed to before.

- **Everything here animates layout, so the savings are elsewhere.** A label
  opening is a track going `0fr -> 1fr`, the panel is a row and a width, and the
  surface is `fit-content` around all of it — none of that can be moved onto a
  transform without giving up the thing that makes it read as one surface
  breathing. So the way to make it smooth is not to animate less, it is to make
  each frame cheaper and to stop the curve fighting the layout.

  Three changes, in the order they mattered. The easing lost its overshoot: a
  curve that passes 1 and settles back is lovely on a transform, and on a
  *width* it means the bar grows past its final size and comes back — with the
  surface centred, the whole thing slides out and in. That is a wobble, and it
  was most of what read as jumpy. The lozenge lost its nested `backdrop-filter`:
  a backdrop filter inside a backdrop-filtered element takes a second snapshot
  of the backdrop, and it was on the one element that resizes on every frame of
  every morph. And the blur came down from 20px to 14px, because backdrop blur
  costs by radius and it re-runs whenever the surface changes size — which here
  is constantly. It came down again later, to 8px, for a reason that has nothing
  to do with cost and everything to do with looking like glass; the saving was
  free.

  What is left is one clock split in two: `--reveal` at 220ms for a label, about
  60px of travel, and `--morph` at 300ms for the panel, about ten times that. A
  single duration cannot serve both — the label feels sluggish at the panel's
  speed and the panel feels rushed at the label's. Splitting them also stages
  the compound move for free: open the panel, and the label arrives first with
  the card following it down.

Three levels of `minmax(0, 1fr)`, and they are the whole phone story. The shell,
the demo's stage and the demo's state cell each needed one, because an `auto`
track takes the widest thing in it and then every percentage inside resolves
against *that* rather than against the page — so the panel asked for 24rem, got
a 24rem track, and its own `max-width: 100%` measured 24rem and capped nothing.
A track that may shrink breaks the loop at each level: at 320px the bar's items
squeeze back to squares, the open label clips, the feed lines ellipsise, and the
page does not scroll sideways.

Below about 264px of container, though, no amount of shrinking helps: five
targets at `--hit`, the gaps between them and the surface's own padding do not
fit, and because the surface clips, what went missing was the trailing action.
The component quietly lost its last item rather than getting tight. Nothing here
squeezes its way out of that — the actions hold a min-width so they stay
tappable, and their padding is not a flex length, so an action forced narrower
just spills its icon into its neighbour. So there is one container query, and it
scales rather than squeezes: it moves only the values the rest of the file is
already derived from, so it is the same component at 40px targets instead of
48px. A container query and not a media query, because what decides whether five
targets fit is the width of the box this was dropped into — a component that
reads the viewport is wrong the moment it lands in a sidebar. The cost is that
`container-type: inline-size` applies inline containment, and a container whose
width comes from its own contents then resolves to zero, so the root takes
`width: 100%` and centres the surface inside it rather than shrinking to fit
around it.

The query fires at 25rem, and the gap between that and the 264px above is the
correction this reference needed most. 264px is what the *collapsed* row costs,
and this bar is never collapsed: one action always carries its label, and the
label is the widest thing in the component. Five squares, the split and an open
"Versions" — the longest label in the set — come to about 400px, so every
phone held upright sat in the band
between the two numbers — wide enough to stay at full scale, too narrow to show
the word. The surface clipped the label to its first letter rather than the
component standing down to the scale that fits, which is the same failure as the
missing trailing action, one step further in. A breakpoint has to be measured
against the state the component is actually in, not against the state its parts
add up to. 25rem clears the widest label with the split still off zero at the
boundary, and it is a literal because a container query condition cannot read a
custom property: a caller that moves `--hit` far from 3rem moves the width this
should switch at, and has to move this with it.

Worth knowing what the narrow scale gives up: at 320px there is no room for a
label at all, so the reveal stays shut and the lit pill is the only thing saying
which item you are on. That is the right thing to lose — the label was never the
selection indicator's only channel.

It stays shut because the query says so, which it did not always. Scaling the
values alone left about 50px in the track, and 50px is not a word — it is the
first letter and a half of one, cut off by the surface, which is worse than no
label in exactly the way a truncated word is worse than an icon. So the narrow
block repeats the three open-state selectors at `0fr` and takes the trailing pad
back with them, or the pill keeps the air it was given to sit beside a word that
is no longer there. Same weight, later in the file: source order decides it.

The search field is the one payload that cannot stand down the same way — an
input that is not there is not a search — so it does the opposite: at the narrow
scale the row clears out for it. The other four actions take their icons to zero
width and their padding with them, and the field opens across the surface. It is
the same trade the label makes, the other way round: there is room for one of the
two, and while the caret is in the field the field is the one that matters. The
alternative was arithmetic: five squares, their gaps and the padding leave about
12px of a 320px column, which is a field in name only. Nothing animates `width`
on the actions themselves, because that would be interpolating from `auto` and
would not move — an action is auto-width around two lengths that do animate, its
own padding and the icon's width, so it follows them down.

"Across the surface" took two values, not one, and for a while it only had the
first. The track is `clamp(0px, --search-max, --search-w)`: the sum of what the
row still owes is the *ceiling*, and the width the field wants is the upper
bound. The narrow scale restated the ceiling for a cleared row — one square
instead of five — and left the want at the wide layout's 14rem, which is the
smaller of the two and therefore the one clamp returns. So the row cleared a
whole bar and the field took 224px of it: 15px short on a 390px phone, 51px
short on a 430px one, with the shell hugging the field rather than the surface
it had been told to fill. At this scale the field wants everything and the
ceiling is the only thing that should trim it, so `--search-w` comes up to
`100cqi` alongside it. Restating one half of a clamp is the bug that hides,
because nothing overflows and nothing errors — it just quietly stops at the
other half.

The field has one size of its own, and it is the only place in the component
where a number is set by the browser rather than by the design. A focused input
under 16px makes a mobile engine zoom the page to reach it, and it does not
zoom back out — the viewport stays magnified and scrolled, so the study around
it is left sideways and clipped mid-word. The label's 13px is what does it: the
field inherits the bar's type, which is set for chrome rather than for a text
box. So the input, and only the input, comes back to 16px where the pointer is
coarse. The label keeps 13px, because a label is not focusable and never
triggers it, and the two are never on screen together anyway — the field is
what replaces the label in that slot. This is the cost of the type coming down,
and it was not paid at the time: at 1rem the field was over the threshold by
accident.

And once it is alone in the bar the pill keeps its rim — that rim is the
field's own edge, and a field that does not show where it starts and stops is
not a field — but it has to sit square inside the shell, and it did not. It
stood 7px from the left of the surface and 13px from the right, which reads as
a box shoved into a corner rather than as a field filling its container. Two
things made up the difference and neither is visible in the source.
`--label-trail` is the first: it balances an icon's bearing against a word, and
there is no word in a search field. The rest is the row's own `gap` — the four
collapsed actions take their width and their padding to zero, but the gaps
*between* them survive, so three pile up past the field's trailing edge while
one sits before its leading one. Both are zeroed for this state, and the
ceiling had to be told: `--search-max` was still reserving five gaps and a
trailing allowance that no longer exist, which left the field 13px short of the
surface it had been told to open across. The sum now describes the row that is
actually left — one square and the surface's padding — and both ends resolve to
the same 5px.

At every scale the track itself is now a ceiling rather than a length. `14rem`
was fixed inside a surface that clips, so under about 31rem of container the
field was cut off mid-placeholder; it is capped at what the row has left once
five squares, the gaps, the padding and the pill's trailing allowance are taken
off `100cqi`. Two details make that hold. The floor of the clamp is `0px`,
because a negative track would drop the declaration and leave the field in an
`auto` column — wider than the one it was clipped out of. And the open field
does not take part in the squeeze: flex shrink is proportional, not ordered, so
a split with six times the shrink factor still absorbed only two thirds of an
overflow and handed the rest back to the field. Frozen at `flex-shrink: 0`, the
deficit lands on the split until it is at zero, and the other actions cannot
take it either because their min-width floors them at one square. The label stays
shrinkable on purpose: it is the thing that should give at the boundary.

Almost nothing here is spent on hover, which is what makes it survive a touch
device: the morph runs on taps and on focus. The two things that are hover —
the icon that brightens before you commit to it, and the row under the pointer —
repeat on `:active` under `(hover: none)`, for as long as the finger is down.

Two modifiers exist only as outside handles: `--open` pins the panel and
`--searching` pins the search field, for a caller that cannot synthesise the
event. The index thumbnail needs both — an iframe with pointer events off can
neither click a button nor put a caret in an input, and a preview that reached
in to call `focus()` would take focus off the page around it. `component.js`
drops both the moment somebody actually touches the toolbar, so the class and
the attribute can never disagree about what is lit.

The demo page is six sections rather than three, and each one is a single claim
with the state that proves it: the anatomy of the bar, the reveal, the extended
view, the motion, the six materials, the narrow scale. The prose is page
scaffolding like the background is — it says what the thing in front of it is
doing, so the page can be read as well as poked at, and it is where the numbers
that are not visible in a screenshot live: 220 against 300, 25rem against 264px,
4:1.

Two things came out of writing it down. The motion section needed the two clocks
drawn rather than described — three bars on a 400ms track, because "220 and 300"
is two numbers and a picture of them is a relationship. And the narrow section
is the reason the container query now shuts the label: putting the state on the
page at 15rem is what made the clipped word impossible to keep claiming was
fine. A demo that only shows the states that already work is not doing its job.

The i18n block is the template's, with one change: the prose carries inline
`<code>`, so the swap is `innerHTML` rather than `textContent`. Both sides of the
table are static strings in the file. Material names are not translated — they
are shown as the class that selects them, which makes them class-name hints
rather than page prose.

The card stacks one bar twice, in one material, at the two points in its
behaviour that cannot be guessed from a picture of the other: with the search
field open, and with the log panel open. That is a deliberate departure from this
repo's rule that a thumbnail holds one instance and no second copy. The rule is
there to stop a thumbnail turning into a small demo page, and it is the right
rule — but what this study offers is one surface that changes shape, and a
component whose whole argument is a transition cannot make it standing still in a
single frame. So the card is the pair, with no captions and no state labels, and
the variant dots step into a single bar at full size where each state has room to
be read rather than recognised. The stagger costs nothing to add from outside,
because the motion is a custom property whose value is a whole shorthand: a delay
goes on the end of it without the component knowing. The sheets are added and
removed rather than hidden — `component.css` gives the root a `display`, and an
author rule beats the user-agent `[hidden]` one, which would have left both on
screen.

States rather than materials, and it took three passes to get there. The card
showed the material set first — one bar at rest, in all six — which filled 492px
of the 600px frame with six near-identical rows. That is a swatch chart: the eye
counts rows before it reads a toolbar, which is the same failure as a thumbnail
turning into a demo page, arrived at from the other side. Cutting to three
materials fixed the density and left the card still answering the wrong
question. What a rail of thumbnails is being asked is *what is this thing*, and
six tints of one bar answer what it is made of. The states answer what it does,
and they are the reason to open the study.

So one material — moss, the one the component ships as — and the legs of its
behaviour. The full six are still in `component.css` and still shown in
`demo.html`, which is the page making that argument; the card is not the place
to enumerate a palette.

Two legs rather than three, and the one dropped is the resting bar. It is the
state a reader can already infer: both of the others are visibly a bar that has
*opened*, so the closed one is implied by either of them, while a field where an
icon was and a panel unfolding out of the same corner are implied by nothing.
Three sheets ran 488px of the 600px frame with 56px of air and a silhouette that
grew downward — defensible as an escalation, but it spent the card's best row on
the one picture the other two already contain. Two run 394px with 103px of air,
and the pair reads as one surface shown twice rather than as a row of specimens.

Origin is still a dot in the variant row, which is the one asymmetry between the
card and quick look and is deliberate. Quick look is the full-size viewer and the
bar the component ships as is worth being able to see in it; the card is 336px
wide and has to spend its rows on what cannot be inferred. The contract asks only
that the first entry be what the thumbnail shows.

The gap is 2rem rather than the 1.5rem the six had. Each sheet's drop is
`0 1.5rem 3rem -1rem`, so at 24px the shadow landed on the sheet below and the
stack read as one ridged slab; three sheets leave frame to spend on giving each
of them its own ground.

Which makes rebuilding the stack a thing that has to be done sparingly, and
getting the order right is what got that wrong. Appending the whole list in order
is the tidy way to both restore the missing sheets and sort them, and it is also
a *move* for the ones already in place — a move is a removal and an insertion, and
a re-inserted element has no before-change style, so every transition on it is
cancelled and the next one never starts. Hover runs through the same function,
and on hover the stack is already built, so the card went dead: the search field
arrived open instead of opening. The state was landing correctly the whole time,
which is why it looked like a CSS problem. `getAnimations()` is what settled it
— nought running where the same class change made by hand produced fifty — and
the repair is to touch only the sheets that are actually out of place.

They run darkest to lightest — basalt, moss, carnelian, slate, crystal,
alabaster — and the sequence had to be measured rather than reasoned even though
the direction was chosen. Brightness and tint pull
opposite ways: alabaster's `brightness: 1.02` makes it lighter than the page it
sits on, while crystal's 7% tint leaves it near enough the page itself. Sampled
off a render, moss and slate come out identical to four decimal places, so which
of the two goes first is a coin flip settled on hue, not a measurement.

Reordering broke two index assumptions that had been silently correct only
because the default happened to sit first: the single-bar variants took
`sheets[0]`, and the collapse kept `i === 0`. Together they left the behaviour
variants running on alabaster while moss was dressed and then removed from the
document. Both now ask which sheet carries no material modifier — the variants
are about behaviour, so they belong on the material the component ships with.

A thumbnail is the component at 0.7 of its pixels, and one value cannot take
that. Every rim, sheen and inner edge here is one CSS pixel, and on the thin
materials the rim is most of what there is to see — crystal at 7% tint is
carried by its edges, not by its body. The card lays the preview out at 480px
and shows it at 336, so that line is rasterised at 0.7 of the pixel it asked
for; on a 1x screen it drops under the one device pixel it takes to draw a line
at all, stops being antialiased and washes out to a grey suggestion. The sheet
does not get subtler, it gets unfinished.

So the hairline is a variable rather than the seventeen literals it used to be,
and `preview.html` restates it against the `preview:scale` the index reports —
the frame cannot measure the factor for itself, since over `file://` the parent
is behind an opaque origin. Only upward: a rim should shrink with everything
else for as long as it still has a device pixel to live in, and `max(1, ...)`
is the point at which it does not. Which means this changes nothing at 2x,
where a 1px line already has 1.4 device pixels, and nothing in quick look,
where the preview runs at full size. It is a custom property set from outside,
which is what the property block is for, and no rule in the preview names a
component class.

What the card plays on hover is a thumbnail decision, not a component one, and it
has been three things. It opened the panel first, because the panel is the
headline move — but a card 336px wide unfolding into four rows of small type is a
lot of small type, and the state's width depended on how long the selected item's
label happened to be, which is not a thing a fixed frame can promise. Then it
opened the search field on whichever sheet was not already morphing: one line of
shape change, legible at any scale, and a width the preview sets rather than one
the copy decides. That was right while the stack was one state in six materials
and became wrong the moment the stack was the states themselves — it would have
put a second search field beside the one already on the card and left the panel
alone.

Then it rotated the assignment by one, which with two sheets was a swap: the one
holding the field opened its panel, the one holding the panel closed into the
field, and they traded without either state leaving the frame. That said the
right thing — these are one surface, not two components in a row — and said it by
moving both surfaces at once, which on a rail of thumbnails reads as a shuffle. A
card that rearranges itself when a pointer crosses it is asking to be watched
rather than read.

So hover moves one item inside one bar instead. The top sheet closes its search
field and steps along to the next destination, Versions; nothing changes
position, and the panel below is left alone — it is the slower, larger state, and
it has nothing to gain from reshuffling under a passing pointer. The rest state
is where the card says these are two shapes of one surface. Hover is where it
says the surface goes places, which is a smaller claim and the one a thumbnail
can actually make.

It costs the frame nothing, which is the part that had to be measured rather than
hoped for, and this version costs it less than the swap did: a bar at rest and a
bar with its search field open are both 62px, only the pill's width differing, so
neither sheet changes height at all. 394px at rest, 394px at every frame, 394px
settled, with the individual sheets holding 62 and 300 throughout. Nothing below
it reflows and the card does not resize under a pointer that is only passing over
it.

Inspiration: https://x.com/renzobianchi_/status/2097400239162351924 — three
frames of a glass toolbar, of which `ref.png` is the resting one. What it
supplies is the material and the morph; the item set, the naming, the marks and
the ground are this build's.
