# Handoff — `2026-09-struck-tones`

Scratch notes for whoever picks this study up next. **Delete this file when the
work lands** — it is not part of the repo and not part of the study.

It sits at the root rather than in the folder on purpose: `CLAUDE.md` fixes the
study folder at six files plus `component.js`, and a to-do list living inside
the folder would travel with it when someone copies it out, which is the exact
thing that contract protects. Move it if you disagree.

The study is an `aesthetic` type: a UI sound palette declared as a CSS token
block, with the sounds synthesised from those numbers by `component.js` rather
than played from files. Read `2026-09-struck-tones/notes.md` first — the five
decision bullets are the actual argument.

---

## The one big caveat

**Nobody has heard it.** Every claim in `notes.md` about the sound is a
*measurement*, not an audition — the oscillator graph was verified, the audible
result never was. Do this first, before touching anything else: open
`demo.html`, press the arm switch, strike all four pads in all three racks.

Specific things I suspect, in the order I'd check them:

1. **`triangle` at 528 Hz may be thin or plasticky.** A triangle plus one
   partial is a reasonable guess at a struck bar; it is still a guess. `sine`
   with a stronger `--partial-level` may read warmer. This is a one-token edit.
2. **The alert may be genuinely nasty rather than usefully unpleasant.** It is
   528 Hz against 559 Hz — a 31 Hz difference, which lands in the *roughness*
   band rather than slow audible beating. It is supposed to be unpleasant, but
   there is a line between "don't ignore me" and "make it stop," and I cannot
   tell you which side of it this is on. If it is too much, widen the interval
   (`--i-alert: 2`) before reducing the level; the dissonance is the message.
3. **There is no filter anywhere.** Real UI sounds usually get a gentle lowpass
   to take the edge off. `square` and `sawtooth` are valid `--timbre` values and
   will be harsh without one. Adding a `BiquadFilterNode` means adding a token
   (`--struck-tones-tone` or similar) so it stays describable in the block —
   don't add a node the token block cannot see.
4. **96 ms of latency on every two-note sound.** `commit` and `revert` both
   start at the root and only *then* move, so the meaningful note arrives a
   `--spread` late. It is what makes the four sounds read as one family; it is
   also latency, and UI sound lives or dies on latency. I raised this with the
   repo owner and it is **unresolved** — their call, not yours.

---

## Measured already — don't spend time re-deriving these

| thing | result |
|---|---|
| Oscillators | tap 528+1457 · commit 528→791 @96ms · revert 528→396 @96ms · alert 528+559 together |
| Token overrides reach the audio | `--close` → 396/471 Hz, `--hushed` → `sine`. Confirmed. |
| Disarmed | 0 oscillators created, read-out still updates |
| No-JS path | tuning list, pad steps, envelope and pitch bars all render correctly from CSS alone |
| Contrast, both themes | everything clears WCAG AA with headroom; lowest is the pitch bar at 3.79:1 (needs 3:1) |
| 320 px + a 290 px sidebar at 1440 px | no horizontal scroll; rack folds 2×2 via container query |
| `preview:pause` | reaches the pads *and* the envelope pseudo-element; the read-out label stops advancing too |
| Reduced motion | `--live` applies but no animation runs |

**Peak amplitude** (computed from the exact envelope `component.js` schedules):

```
tap 0.21   commit/revert 0.22   alert 0.41   alert+commit together 0.61
```

No clipping at the shipped `--level: 0.16`. But it scales linearly, so **a
re-themer who pushes `--level` above ~0.26 can clip** when two pads overlap
(overlap between *different* sounds is allowed by design — only a sound
retriggering itself is cancelled). There is no master gain and no limiter;
every voice connects straight to `ctx.destination`. If you want a safety net,
one shared `GainNode` is the cheap fix — but see the note above about not
adding nodes the token block cannot describe.

**Performance is a non-issue and I checked so you don't have to.** One full
token read is 0.01 ms. `--live` runs 9 animations per card (4 pads, 4 pitch
bars, 1 playhead) against the 289 that `2026-09-raster-pulse` runs, and 0 at
rest. The `MutationObserver` fires exactly once per class toggle. I had
expected to find something here and there is nothing — **do not "optimise" the
observer or hoist the `tuning()` calls out of the animation callbacks**, it
would buy microseconds and cost the clarity of reading the tokens at the moment
they are used.

---

## To-do

- [ ] **Listen to it.** Everything above.
- [ ] **Native-speaker pass on the Danish.** I wrote it and I would not trust
      it. One real bug was already found and fixed — I had written *indhýlning*
      with a y-acute, which is not a Danish letter — and finding a typo that
      obvious in a string I had "checked" is the reason this item is still open.
      The word choice itself is the remaining question: `indhylning` for
      *envelope*, where Danish audio practice often just says "envelope"; and
      `stemning` for *tuning*, which also means "mood/atmosphere" and may read
      oddly in a technical list. Strings are in
      `2026-09-struck-tones/demo.html` (its own `DA` table) and `index.js`
      (`piece.struckTones.*`, `cta.quickLookStruck`).
- [ ] **Test on iOS Safari.** Everything was Chromium. iOS is the classic Web
      Audio failure: it sometimes needs the context created *and* a buffer
      played inside the same gesture, and the arm button only does the former.
      `webkitAudioContext` is handled; the unlock path is not verified.
- [ ] **Decide the latency question** (item 4 above).
- [ ] `ref.png` is the template placeholder (2704 bytes, same as
      `_template/`). Fine for an original design — `2026-09-detail-reveal-card`
      does the same — but a Figma export would be better if one exists.

---

## Invariants — breaking these breaks the repo, not just the study

- **The component markup lives in three files and they must stay identical**:
  `component.html`, `preview.html`, and the first rack in `demo.html`. There is
  no build step. Verify with the snippet below.
- **`notes.md` and the demo's `Decisions` block are kept in step by hand.** Edit
  one, edit the other.
- **The type is declared twice** — `notes.md`'s `type: aesthetic` and the card's
  `data-i18n="type.aesthetic"` badge in `index.html`. They must agree.
- **Nothing in `preview.html` or `demo.html` may write a rule against a
  component class.** Variants work by overriding tokens from outside, which is
  what the property block is for.
- **The contrast floor applies to both themes**, and any departure must be
  recorded in `notes.md` with its measured ratio. There are currently none.
- The pitch bar is a *graphic carrying meaning* (it draws the interval), not
  decoration — so it owes 3:1 and cannot be quietly faded back to taste.

---

## Running the checks

No harness is committed. Playwright against the pinned browser:

```bash
pip install playwright        # do NOT run `playwright install`
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
```

```python
from playwright.sync_api import sync_playwright
BASE = "file:///home/user/interface-studies/2026-09-struck-tones/"
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME)
    pg = b.new_page(viewport={"width": 480, "height": 600})   # the rail's own viewport
    pg.goto(BASE + "preview.html")                            # + "?theme=dark" for the dark ground
    # variants: index 0 struck, 1 hushed, 2 close
    pg.evaluate("()=>window.postMessage({source:'interface-studies',type:'preview:variant',index:1},'*')")
    # the card performing, and the rail pausing it
    pg.evaluate("()=>window.postMessage({source:'interface-studies',type:'preview',active:true},'*')")
    pg.evaluate("()=>window.postMessage({source:'interface-studies',type:'preview:pause',paused:true},'*')")
```

To see the audio graph without hearing it, spy on the oscillators before load —
this is how every frequency in the table above was verified:

```python
pg.add_init_script("""
  window.__osc = [];
  const P = (window.AudioContext || window.webkitAudioContext).prototype;
  const co = P.createOscillator;
  P.createOscillator = function () {
    const o = co.call(this);
    const sv = o.frequency.setValueAtTime.bind(o.frequency);
    o.frequency.setValueAtTime = (v, t) => { window.__osc.push([Math.round(v), o.type]); return sv(v, t); };
    return o;
  };
""")
# then: click '.struck-tones__arm', click a pad, read window.__osc
```

Markup parity across the three files:

```python
import io, re
def grab(p):
    s = io.open(p, encoding='utf-8').read()
    a = s.index('<section class="struck-tones"'); b = s.index('</section>', a) + 10
    t = re.sub(r'<!--.*?-->', '', s[a:b], flags=re.S)
    t = re.sub(r'aria-label="[^"]*"', 'aria-label=""', t)
    t = re.sub(r'class="struck-tones[^"]*"', 'class="struck-tones"', t, count=1)
    return re.sub(r'\s+', ' ', t).strip()
assert grab('component.html') == grab('preview.html') == grab('demo.html')
```

Note: the Google Fonts request fails TLS through this environment's proxy. That
console error is the sandbox, not the page.
