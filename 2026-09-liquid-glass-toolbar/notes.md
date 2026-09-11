type: navigation

Source: https://x.com/renzobianchi_/status/2097400239162351924 — three frames of a
liquid-glass toolbar: a labelled Home pill at rest, the search item opened into
a field, and the whole bar opened downward into an activity panel.

`ref.png` is the resting frame — the labelled Home pill over a rendered scene of
grey and slate planes. The other two frames, the opened search field and the
opened panel, are described above rather than kept, since the decisions they
carry are named below.

What is not being captured: the Memoji avatars, the product copy, the cool grey
render the glass sits on, and the icon set. The ground in `demo.html` and
`preview.html` owes the reference nothing: it is the index's own recipe, warm
paper with the same two washes at the same strength, so a reference sitting in
the rail does not arrive louder than the page around it. It is page scaffolding,
not part of the component.

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

The icons are drawn rather than borrowed, and all but one are deliberately not
the reference's: a doorway instead of a house, two drawers instead of a lidded
box, four bars instead of a bell, two sliders instead of a cog. The
magnifier is the exception, and it is the exception for a reason — it is the one
glyph in a toolbar with no synonym. Every other function has several ways to be
drawn, so the set is a place to have an opinion; search is not.

The panel item is called Activity, not Notifications, and the icon is four bars
of uneven height. Notifications is a promise about delivery — it says
these are things that were pushed at you. What the four rows actually are is a
log: somebody commented, a build finished, a review was asked for, an invoice
cleared. Naming it for the content rather than for the transport also stops the
component being read as an alert centre, which is a different thing with
different rules about badges and dismissal.

The bars were picked against four other drafts rendered at real size in the bar
— broadcast rings, a clock, a bulleted timeline, a one-sided ripple. Two of them
failed on the same thing: an arch, a magnifier, two drawers and two sliders are
all rectilinear or horizontal, so a timeline read as more drawers and a clock
read as a second magnifier. The bars are the only glyph in the set standing on
vertical strokes, which is most of why they are legible at 24px. The heights go
up, up, up, then down — a monotonic rise would read as signal strength rather
than as something recorded.

Drawing a set by hand means centring it by hand. The pill centres the icon's
*box*, so a glyph that does not centre in its own 24-unit box is off-centre in
every pill it lands in, and it is invisible in the source — the numbers look
tidy. Three of the five were out: the arch and the bars sat 0.70 units low, the
magnifier 0.40 low and 0.40 right. Measured as the ink bounds plus half a stroke
on each side, which is what the eye reads and what `getBBox()` leaves out.

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
  collapsed one is — but the icon does not fill its box, so there is about an
  `--icon/9` bearing of free air before the glyph that the text at the other end
  never gets. Measured on the resting bar: 14.6px before, 12.0px after.
  `--label-trail` gives the trailing side that back and a little more, since
  text reads tighter against a stadium's curve than a roundish glyph does. It is
  applied in the expanded state only, so the collapsed action stays exactly
  square, and it moves on the label's clock so the pill does not finish growing
  after the word inside it has stopped.

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
  same construction comes back in five materials. Moss is the default and has no
  modifier; `--alabaster`, `--slate`, `--basalt` and `--crystal` are the others.
  Named for materials rather than for brightness, which is not decoration: two
  of the five flip to dark ink, so `--light` would have been describing part of
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
  reads on moss is not the warm that reads on a near-black.

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
  glaze is a transparent body with a lit edge, and it is now that in all five
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
"Activity" come to about 390px, so every phone held upright sat in the band
between the two numbers — wide enough to stay at full scale, too narrow to show
the word. The surface clipped "Home" to its first letter rather than the
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
view, the motion, the five materials, the narrow scale. The prose is page
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

The card shows all five materials stacked, which is a deliberate departure from
this repo's rule that a thumbnail holds one instance and no second copy. The rule
is there to stop a thumbnail turning into a small demo page, and it is the right
rule — but what this reference offers is a construction that comes in five
materials, and one bar cannot advertise that. So the card is the set, with no
captions and no state labels, and the variant dots step into a single bar where
a panel has somewhere to open. The stagger down the stack costs nothing to add
from outside, because the motion is a custom property whose value is a whole
shorthand: a delay goes on the end of it without the component knowing. The
sheets are added and removed rather than hidden — `component.css` gives the root
a `display`, and an author rule beats the user-agent `[hidden]` one, which would
have left all five on screen.

Which makes rebuilding the stack a thing that has to be done sparingly, and
getting the order right is what got that wrong. Appending all five in order is
the tidy way to both restore the missing sheets and sort them, and it is also a
*move* for the four already in place — a move is a removal and an insertion, and
a re-inserted element has no before-change style, so every transition on it is
cancelled and the next one never starts. Hover runs through the same function,
and on hover the stack is already built, so the card went dead: the search field
arrived open instead of opening. The state was landing correctly the whole time,
which is why it looked like a CSS problem. `getAnimations()` is what settled it
— nought running where the same class change made by hand produced fifty — and
the repair is to touch only the sheets that are actually out of place.

They run lightest to darkest — alabaster, crystal, slate, moss, basalt — and
that order had to be measured rather than reasoned. Brightness and tint pull
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

Which of the two morphs the card plays on hover is a thumbnail decision, not a
component one, and it went the other way at first. The panel is the headline
move, so `active` opened the panel — but a card 336px wide unfolding into four
rows of small type is a lot of small type, and the state's width depends on how
long the selected item's label happens to be, which is not a thing a fixed frame
can promise. The search field is the better thumbnail: one line of shape change,
legible at any scale, and its width is a number the preview sets rather than
something the copy decides. The panel is still a click away in quick look and a
dot away in the variant row, where there is room for it.
