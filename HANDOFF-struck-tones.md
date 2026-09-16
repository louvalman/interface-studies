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

**Nobody has heard it.** Every claim about the sound is a *measurement* — the
node graph was verified, the audible result never was. Do this first, before
touching anything else: open `demo.html`, press the arm switch, strike all four
pads in all three racks.

The voice was rebuilt once already on the owner's judgement that the first one
sounded 8-bit, and the rebuild has the same status: reasoned, measured, unheard.
What changed and why is in `notes.md` bullet two. In short, the old set was one
oscillator with a sharp envelope, and three separable things were wrong with it
— a raw geometric wave with nothing rolled off, an *inharmonic* partial at
2.76x (the ratio a struck metal bar has, an overtone belonging to no key), and a
4ms attack that is a discontinuity rather than a click. It is now four layers: a
detuned sine pair, a harmonic octave and twelfth that die before the
fundamental, and band-passed noise under the attack, all through a lowpass into
a generated room.

Where I would look first if it is still not right:

1. **`--click` at 0.11 and `--click-tone` at 2100 Hz.** The click is the part
   most likely to be wrong by ear, because the right level for it is very low
   and the band it sits in is a matter of taste — too high reads as a tick, too
   low as a thud. Both are one-token edits.
2. **`--air` at 0.26 with a 1.7s tail.** Reverb is the fastest way to make a UI
   sound feel expensive and the fastest way to make it feel far away. If the set
   sounds distant, this is why before anything else is.
3. **`--bounce` at 0.55 semitones.** Meant to be felt and not heard. If any note
   reads as out of tune on its attack, it is too big.
4. **`--decay` at 820ms.** Long for a UI sound, chosen for the calm brief. If
   the set feels sluggish in use rather than in demo, shorten this before
   touching anything else — the demo rewards a long tail and real use does not.

---

## Measured already — don't spend time re-deriving these

| thing | result |
|---|---|
| Pitches (after the bounce settles) | tap 528 · commit 528→791 · revert 528→396 · alert 528→498, all with 2× and 3× above them |
| Token overrides reach the audio | `--close` → 396 Hz root; `--hushed` → no click, no bounce, 2.8s room. Confirmed. |
| Disarmed | 0 oscillators created, read-out still updates |
| No-JS path | tuning list, pad steps, envelope and pitch bars all render correctly from CSS alone |
| Contrast, both themes | everything clears WCAG AA with headroom; lowest is the pitch bar at 3.79:1 (needs 3:1) |
| 320 px + a 290 px sidebar at 1440 px | no horizontal scroll; rack folds 2×2 via container query |
| `preview:pause` | reaches the pads *and* the envelope pseudo-element; the read-out label stops advancing too |
| Reduced motion | `--live` applies but no animation runs |
| Generated reverb | stereo IR, decays to ~1e-6, cached per `--air-size`, reassigned only when the room changes |
| Every token the JS reads | all 22 exist in the CSS block; nothing is read that is not declared |

**Peak amplitude** (computed from the exact envelope `component.js` schedules):

```
tap 0.25   commit/revert 0.34   alert 0.39   alert+commit together 0.58
```

No clipping at the shipped `--level: 0.15`, and a `DynamicsCompressor` now sits
across the master bus as a limiter — threshold -3dB, soft knee — so it does
nothing at all until something would otherwise clip. That is a safety net
rather than a design value, which is why it is not a token.

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
