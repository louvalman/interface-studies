/*
  2026-10-mode-dial — no framework, no build step, no dependency.

  The radios are the API. A host turns the dial with `input.click()` and
  listens for `change`; nothing is put on window. What this file adds, and
  why CSS cannot do it:

    1. The near way round. CSS knows which radio is checked but not which
       way it was reached, so last-to-first spins back through every stop.
       A winding count, --mode-dial-laps, written inline on the root, makes
       every turn take the short way, and --mode-dial-span lengthens the
       turn by one beat per extra detent.

    2. The drag. Pointer angle about the dial's centre, by Math.atan2, is
       turned into detents: each one crossed checks its radio and fires
       `input` and `change`, so a drag is heard exactly as an arrow key is.
       Between detents --mode-dial-drag carries the fraction.

    3. Commit. With a centre key, the checked radio is the one being looked
       at and :default (the `checked` attribute) is the one committed. The
       key moves `defaultChecked`; Escape is form.reset(). The status line
       always names what is held, and the key is described by it, so the
       difference between the two is heard as well as seen.

    4. The feel. A drag goes through a detent curve rather than following
       the pointer: shown = x - k·sin(2πx)/2π, k = --mode-dial-notch, which
       is slow near a stop and quick between, and continuous when the
       selection flips because f(x) - f(x-1) = 1. Every detent the face
       passes is a tick, timed to when the eased angle passes it — read off
       the running transition, so a turn that interrupts another counts from
       where the face really is — and a tick is a kick of the index (CSS), a
       `mode-dial:tick` event, a buzz for touch and pen, and — only if
       --mode-dial-click is above 0 — a synthesised click. The key clicks on
       the way down and again as it rises.

       Sound only ever follows a trusted input event on this dial: a key,
       a pointer, a click. A host's input.click(), its form.reset() or the
       preview turning the dial is silent, and with the volume at 0 no
       AudioContext is made. One context per document, made in the first
       gesture that has a volume, and resumed if the browser suspended it.

    5. The ratchet, a voice of its own (.mode-dial--ratchet sets its levels,
       --mode-dial-scrape and --mode-dial-snap, both 0 by default). The
       scratch is the knurl: one grain of noise per tooth the face carries
       past the index, so its rate is the turn's speed. The snap is the face
       landing in a detent. Both follow the face's own path — the running
       transition for a turn, the displayed angle frame by frame for a drag,
       and the settle back to the stop when a drag lets go — and both are
       scheduled ahead on the audio clock, then cancelled the moment that
       path changes.

  Without it the component is still the component: arrow keys, clicks and a
  screen reader all work, the key submits the form, and the only things
  missing are the drag, the short way round, and the feel.
*/

(function () {
  'use strict';

  var START = 4 * Math.PI / 180;   /* a drag begins after 4 degrees */
  var CROSS = 0.6;                 /* a detent is crossed 0.6 of a step past it */
  var CENTRE = 0.15;               /* ignore a press this close to the middle */
  var SET_MS = 180;                /* the key's pressed look after a commit */
  var BUZZ_MS = 40;                /* no two buzzes closer than this */
  var TICK_GAP = 12;               /* no two ticks of one dial closer than this, in ms */
  var STILL_GAP = 30;              /* ticks of a turn that does not animate, in ms apart */

  /* The ratchet's bookkeeping. Lengths in steps (one detent) or teeth. */
  var AHEAD = 120;                 /* ms of sound put on the audio clock ahead of now */
  var PUMP = 30;                   /* ms between top-ups while anything is planned */
  var LATE = 30;                   /* ms: a sound this far overdue is dropped, not played late */
  var PLAY = 0.25;                 /* of a tooth: how far back over one it goes to be heard again */
  var SEAT = 0.15;                 /* of a step: how far from a detent the face goes before landing in it again is a snap */
  var RISE = 0.0002;               /* s: a grain's attack, and the least room between two */
  var FRAME_MAX = 50;              /* ms: the longest a drag frame's grains are spread over */
  var IDLE = 0.3;                  /* s the scratch keeps its nodes after its last grain, so a slow drag is one chain */
  var HOLD_MAX = 50;               /* ms a turn's sound waits for its transition's start before going without it */

  function list(nodes) { return Array.prototype.slice.call(nodes); }

  function noop() {}

  /* --- sound ----------------------------------------------------------------
     Synthesis only. One context per document, made on demand and never
     before a tick that has a volume; false once it is known not to exist. */

  var audio = null;

  function audioFor() {
    if (audio !== null) return audio;
    var AC = window.AudioContext || window.webkitAudioContext;
    audio = false;
    if (!AC) return audio;
    try {
      var ctx = new AC();
      /* 210ms of white noise, shared by every click: the band-pass shapes
         it. The longest decay the token allows, 200ms, and the 10ms margin
         each sound stops after, so a long tail dies away rather than ends. */
      var len = Math.max(1, Math.round(ctx.sampleRate * 0.21));
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      audio = { ctx: ctx, noise: buf };
    } catch (err) {
      audio = false;
    }
    return audio;
  }

  function wake() {
    if (audio && audio.ctx.state === 'suspended' && audio.ctx.resume) {
      try { audio.ctx.resume().catch(noop); } catch (err) { /* refused */ }
    }
  }

  /* A few percent either way, so a run of ticks is a mechanism and not a
     sample played over and over. */
  function jitter() { return 1 + (Math.random() - 0.5) * 0.08; }

  /* Noise through a band-pass, up in 1.5ms and down exponentially. A high
     Q rings; it also passes less, so the gain gives some of that back —
     unclamped, or the volume would stop counting above about .6. */
  function burst(when, freq, q, gain, decay) {
    var ctx = audio.ctx;
    var src = ctx.createBufferSource();
    var f = ctx.createBiquadFilter();
    var g = ctx.createGain();
    src.buffer = audio.noise;
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain * Math.sqrt(Math.max(1, q) / 2), when + 0.0015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    src.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    src.start(when);
    src.stop(when + decay + 0.01);
  }

  /* A short sine falling in pitch: the body of something pressed. */
  function thump(when, freq, gain) {
    var ctx = audio.ctx;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, when);
    o.frequency.exponentialRampToValueAtTime(freq * 0.55, when + 0.05);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(when);
    o.stop(when + 0.07);
  }

  var SOUNDS = {
    detent: function (v, when) {
      burst(when, v.pitch * jitter(), v.ring, v.vol * 0.9, v.decay);
    },
    press: function (v, when) {
      thump(when, v.thump * jitter(), v.vol * 0.8);
      burst(when + 0.003, v.pitch * 0.7 * jitter(), Math.max(0.5, v.ring / 2), v.vol * 0.7, Math.max(0.006, v.decay * 0.5));
    },
    release: function (v, when) {
      burst(when, v.pitch * 1.5 * jitter(), v.ring, v.vol * 0.4, Math.max(0.004, v.decay * 0.35));
    }
  };

  /* The ratchet's two sounds. A grain is not a node of its own: each dial
     that is scratching has one looping noise source through one band-pass
     into one gain, and a grain is an envelope on that gain and a pitch on
     that filter — so a turn of sixty teeth is three nodes, and cancelling it
     is cancelling two automation lists. */
  function scratchChain(v) {
    var ctx = audio.ctx;
    var src = ctx.createBufferSource();
    var f = ctx.createBiquadFilter();
    var g = ctx.createGain();
    src.buffer = audio.noise;
    src.loop = true;
    f.type = 'bandpass';
    f.frequency.value = v.scrapePitch;
    f.Q.value = v.scrapeRing;
    g.gain.value = 0;
    src.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    src.start(ctx.currentTime, Math.random() * 0.2);
    return { src: src, filter: f, gain: g, last: 0, nodes: [src, f, g] };
  }

  /* Up in 0.2ms, then away on a time constant of a third of the grain, so
     it is all but gone by the grain's length and the next grain's own
     events cut whatever is left. A little loudness and pitch of its own. */
  function grain(ch, when, v) {
    var a = v.vol * v.scrape * (0.6 + Math.random() * 0.4) * Math.sqrt(Math.max(1, v.scrapeRing) / 2) * 1.6;
    when = Math.max(when, ch.last + RISE * 1.5);
    ch.last = when;
    ch.filter.frequency.setValueAtTime(v.scrapePitch * (1 + (Math.random() - 0.5) * 0.24), when);
    ch.gain.gain.setValueAtTime(0, when);
    ch.gain.gain.linearRampToValueAtTime(a, when + RISE);
    ch.gain.gain.setTargetAtTime(0, when + RISE, v.grain / 3);
    return when;
  }

  /* The snap: a broadband transient and, for a full one, the thock of the
     body — a sine falling from the token's pitch to a little over half of
     it — and the ball settling into the notch a beat later. A detent passed
     on the way is the transient alone, with no body under it. Five nodes or
     three. */
  function snapSound(when, v, full) {
    var ctx = audio.ctx;
    var level = v.vol * v.snap * (full ? 1 : v.snapPass);
    var src = ctx.createBufferSource();
    var f = ctx.createBiquadFilter();
    var g = ctx.createGain();
    var nodes = [src, f, g];
    src.buffer = audio.noise;
    f.type = 'bandpass';
    f.Q.value = 0.7;
    f.frequency.setValueAtTime(v.snapPitch * jitter(), when);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(level * 0.75, when + 0.0003);
    g.gain.setTargetAtTime(0, when + 0.0003, full ? 0.0016 : 0.0011);
    var end = when + 0.012;
    if (full) {
      var settle = when + v.settle;
      f.frequency.setValueAtTime(v.snapPitch * 1.4 * jitter(), settle);
      g.gain.setValueAtTime(0, settle);
      g.gain.linearRampToValueAtTime(level * 0.75 * v.ball, settle + 0.0003);
      g.gain.setTargetAtTime(0, settle + 0.0003, 0.0008);
      end = settle + 0.008;
      var o = ctx.createOscillator();
      var og = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(v.thock * jitter(), when);
      o.frequency.exponentialRampToValueAtTime(v.thock * 0.53, when + v.body);
      og.gain.setValueAtTime(0, when);
      og.gain.linearRampToValueAtTime(level * 0.65, when + 0.0015);
      og.gain.exponentialRampToValueAtTime(0.0001, when + v.body * 1.5);
      o.connect(og);
      og.connect(ctx.destination);
      o.start(when);
      o.stop(when + v.body * 1.5 + 0.005);
      nodes.push(o, og);
    }
    src.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    src.start(when, Math.random() * 0.15);
    src.stop(end);
    return nodes;
  }

  /* Read off the root when a sound is wanted, so a host switches it on by
     setting the token. Null when the volume is 0, and nothing is made. */
  function voiceOf(root) {
    var cs = getComputedStyle(root);
    function num(name, dflt, lo, hi) {
      var v = parseFloat(cs.getPropertyValue(name));
      if (!isFinite(v)) v = dflt;
      return Math.min(hi, Math.max(lo, v));
    }
    var vol = num('--mode-dial-click', 0, 0, 1);
    if (!(vol > 0)) return null;
    return {
      vol: vol,
      pitch: num('--mode-dial-click-pitch', 2600, 200, 12000),
      ring: num('--mode-dial-click-ring', 7, 0.3, 30),
      decay: num('--mode-dial-click-decay', 26, 2, 200) / 1000,
      thump: num('--mode-dial-key-thump', 120, 30, 1000),
      teeth: num('--mode-dial-teeth', 120, 3, 720),
      scrape: num('--mode-dial-scrape', 0, 0, 1),
      scrapePitch: num('--mode-dial-scrape-pitch', 5200, 500, 16000),
      scrapeRing: num('--mode-dial-scrape-ring', 2.4, 0.3, 30),
      grain: num('--mode-dial-scrape-grain', 1, 0.2, 20) / 1000,
      snap: num('--mode-dial-snap', 0, 0, 1),
      snapPitch: num('--mode-dial-snap-pitch', 3400, 200, 16000),
      thock: num('--mode-dial-snap-thock', 170, 30, 1000),
      body: num('--mode-dial-snap-body', 40, 5, 200) / 1000,
      settle: num('--mode-dial-snap-settle', 15, 2, 60) / 1000,
      ball: num('--mode-dial-snap-ball', 0.3, 0, 1),
      snapPass: num('--mode-dial-snap-pass', 1, 0, 1)
    };
  }

  /* The ratchet's voice, or null: a volume, and a scratch or a snap. */
  function ratchetOf(v) {
    return v && (v.scrape > 0 || v.snap > 0) ? v : null;
  }

  /* A suspended clock plays everything scheduled on it at once when it
     resumes, so a sound is dropped while it is not running — unless it is
     played inside its own gesture, the one that is waking it. */
  function play(kind, v, delay, gesture) {
    if (!v || !audioFor()) return;
    wake();
    if (!gesture && audio.ctx.state !== 'running') return;
    try { SOUNDS[kind](v, audio.ctx.currentTime + (delay || 0)); } catch (err) { /* a closed context */ }
  }

  /* --- the turn's timing ----------------------------------------------------
     When does the eased angle pass each detent? The curve is read back off
     the options layer's computed transition, so it is whatever the token
     says: linear() points, a cubic-bezier, or a keyword. */

  function firstOf(listText) {
    var depth = 0;
    for (var i = 0; i < listText.length; i++) {
      var c = listText.charAt(i);
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ',' && depth === 0) return listText.slice(0, i).trim();
    }
    return listText.trim();
  }

  function msOf(t) {
    var v = parseFloat(t);
    if (!isFinite(v)) return 0;
    return /ms\s*$/.test(t) ? v : v * 1000;
  }

  var NAMED = { 'ease': [.25, .1, .25, 1], 'ease-in': [.42, 0, 1, 1], 'ease-out': [0, 0, .58, 1], 'ease-in-out': [.42, 0, .58, 1] };

  /* The curve as [time, progress] points, time increasing. */
  function curveOf(fn) {
    var m, pts = [], i;
    var bz = NAMED[fn] || ((m = /^cubic-bezier\(([^)]*)\)$/.exec(fn)) && m[1].split(',').map(parseFloat));
    if (bz && bz.length === 4) {
      for (i = 0; i <= 200; i++) {
        var s = i / 200, u = 1 - s;
        pts.push([3 * u * u * s * bz[0] + 3 * u * s * s * bz[2] + s * s * s,
                  3 * u * u * s * bz[1] + 3 * u * s * s * bz[3] + s * s * s]);
      }
      return pts;
    }
    if ((m = /^linear\((.*)\)$/.exec(fn))) {
      m[1].split(',').forEach(function (entry) {
        var parts = entry.trim().split(/\s+/);
        var y = parseFloat(parts[0]);
        if (!isFinite(y)) return;
        if (parts.length < 2) pts.push([NaN, y]);
        for (var j = 1; j < parts.length; j++) pts.push([parseFloat(parts[j]) / 100, y]);
      });
      if (!pts.length) return null;
      if (!isFinite(pts[0][0])) pts[0][0] = 0;
      if (!isFinite(pts[pts.length - 1][0])) pts[pts.length - 1][0] = 1;
      for (i = 1; i < pts.length; i++) {
        if (isFinite(pts[i][0])) { pts[i][0] = Math.max(pts[i][0], pts[i - 1][0]); continue; }
        var k = i;
        while (!isFinite(pts[k][0])) k++;
        for (var j = i; j < k; j++) pts[j][0] = pts[i - 1][0] + (pts[k][0] - pts[i - 1][0]) * (j - i + 1) / (k - i + 1);
      }
      return pts;
    }
    return null;
  }

  /* The fraction of the turn at which progress first reaches `p`. */
  function crossing(pts, p) {
    if (!pts) return p;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (b[1] >= p - 1e-6) {
        if (b[1] === a[1]) return b[0];
        return a[0] + (b[0] - a[0]) * Math.max(0, Math.min(1, (p - a[1]) / (b[1] - a[1])));
      }
    }
    return 1;
  }

  /* A tooth counter with play in it. Boundaries are whole numbers; once one
     is crossed, the next one on is a whole tooth away, and the same one
     going back is heard only once the position is PLAY past it, so a face
     that wobbles on a boundary is not a burst of grains. */
  function counter(u) {
    var lo = Math.ceil(u - 1e-9) - 1, hi = Math.floor(u + 1e-9) + 1;
    return { upB: hi, upT: hi, dnB: lo, dnT: lo, last: NaN, dir: 0 };
  }

  /* Carries on from the counter as it was last heard, so a turn that takes
     over from another does not grain again the teeth the last one was heard
     to pass: what the audio clock has already rendered is a few ms ahead of
     the face. Starts afresh from the face when the face is a whole tooth
     past what was heard, or turns back short of the last tooth heard, which
     it never reached — and always after the face has moved unheard, when
     hearLost has dropped the counter. */
  function resume(q, u, dir) {
    if (!q || !(q.dir) || (dir === q.dir ? (u - q.last) * dir >= 1 : (u - q.last) * q.dir < 0)) return counter(u);
    return { upB: q.upB, upT: q.upT, dnB: q.dnB, dnT: q.dnT, last: q.last, dir: q.dir };
  }

  /* Each boundary crossed going straight from u0 to u1, as the fraction of
     the way at which it is crossed. */
  function count(q, u0, u1, out) {
    var b;
    if (u1 > u0) {
      while (q.upT <= u1 + 1e-9) {
        b = q.upB;
        var f = Math.min(1, Math.max(0, (q.upT - u0) / (u1 - u0)));
        q.dnB = b; q.dnT = b - PLAY; q.upB = b + 1; q.upT = b + 1; q.last = b; q.dir = 1;
        out(f, { upB: q.upB, upT: q.upT, dnB: q.dnB, dnT: q.dnT, last: b, dir: 1 });
      }
    } else if (u1 < u0) {
      while (q.dnT >= u1 - 1e-9) {
        b = q.dnB;
        var g = Math.min(1, Math.max(0, (u0 - q.dnT) / (u0 - u1)));
        q.upB = b; q.upT = b + PLAY; q.dnB = b - 1; q.dnT = b - 1; q.last = b; q.dir = -1;
        out(g, { upB: q.upB, upT: q.upT, dnB: q.dnB, dnT: q.dnT, last: b, dir: -1 });
      }
    }
  }

  function always() { return true; }

  function fire(el, type) {
    el.dispatchEvent(new Event(type, { bubbles: true }));
  }

  function escapeId(id) {
    return window.CSS && CSS.escape ? CSS.escape(id) : id.replace(/["\\]/g, '\\$&');
  }

  /* Re-key an id only when it collides with another on the page — two
     copies of the same markup — and rewrite what points at it inside this
     root: the textPath's href and the inputs' aria-describedby. */
  function rekey(root) {
    list(root.querySelectorAll('[id]')).forEach(function (el) {
      var id = el.id;
      if (document.querySelectorAll('[id="' + escapeId(id) + '"]').length < 2) return;
      var k = 2;
      while (document.getElementById(id + '-' + k)) k++;
      var next = id + '-' + k;
      el.id = next;
      list(root.querySelectorAll('[href="#' + escapeId(id) + '"]')).forEach(function (a) {
        a.setAttribute('href', '#' + next);
      });
      list(root.querySelectorAll('[aria-describedby]')).forEach(function (a) {
        var ids = a.getAttribute('aria-describedby').split(/\s+/).map(function (x) {
          return x === id ? next : x;
        });
        a.setAttribute('aria-describedby', ids.join(' '));
      });
    });
  }

  function setup(root) {
    if (root.hasAttribute('data-mode-dial-ready')) return;
    var dial = root.querySelector('.mode-dial__dial');
    var inputs = list(root.querySelectorAll('.mode-dial__input'));
    var n = inputs.length;
    if (!dial || n < 2) return;
    root.setAttribute('data-mode-dial-ready', '');
    rekey(root);

    /* Read from the DOM, never from CSS, so nothing here forces a style
       flush. Nothing is written at boot, so nothing animates. */
    var sel = checkedIndex();
    if (sel < 0) sel = 0;
    var laps = 0;
    var lastX = NaN, lastY = NaN, settleX = NaN, settleY = NaN;
    var settleOn = null;               /* the option a drag let go of */
    var hushX = NaN, hushY = NaN;

    /* What caused what is being handled: a trusted input event on this
       dial, for as long as its task lasts, so the radio group's own arrow
       handling and a label's forwarded click are covered. Anything a host
       or the preview does by script finds it null. `pointer` is what the
       vibration asks: key, mouse, touch or pen. */
    var cause = null;
    var lastPointer = 'mouse';
    function note(e) {
      if (!e.isTrusted) return;
      if (e.pointerType) lastPointer = e.pointerType;
      var p = /^key/.test(e.type) ? 'key'
        : e.pointerType || (e.type === 'click' && e.detail === 0 ? 'key' : lastPointer);
      var c = { pointer: p };
      cause = c;
      setTimeout(function () { if (cause === c) cause = null; }, 0);
      /* A suspended context can only be resumed from a gesture, and is
         best made in one: a drag's first tick comes from a frame, not from
         the press, so the press makes it. */
      if (audio) wake();
      else if (audio === null && e.type === 'pointerdown' && voiceOf(root)) { audioFor(); wake(); }
    }
    ['keydown', 'keyup', 'pointerdown', 'pointerup', 'click'].forEach(function (t) {
      root.addEventListener(t, note, true);
    });

    function checkedIndex() {
      for (var i = 0; i < inputs.length; i++) if (inputs[i].checked) return i;
      return -1;
    }

    function defaultInput() {
      for (var i = 0; i < inputs.length; i++) if (inputs[i].defaultChecked) return inputs[i];
      return null;
    }

    /* Looked up at every event, never cached, so a host may add the key
       after boot. */
    function key() { return root.querySelector('.mode-dial__commit'); }

    function pending() {
      var cur = inputs[checkedIndex()];
      return !!(key() && cur && cur !== defaultInput());
    }

    /* `sel` is what this file last saw, and the DOM can move without telling
       it: a Back navigation restores the checked radio after boot, and a host
       may set `.checked` with no event. So it is read again in the capture
       phase, before the radio group's own arrow handling and before the
       dial's pointerdown. Not on click: a radio is already checked by then. */
    function resync() {
      var c = checkedIndex();
      if (c >= 0 && c !== sel) hearLost();
      if (c >= 0) sel = c;
    }
    root.addEventListener('keydown', resync, true);
    root.addEventListener('pointerdown', resync, true);

    /* --- 1. the near way round ------------------------------------------ */

    function turnTo(next) {
      if (next < 0 || next === sel) return null;
      var from = sel + laps * n;
      laps = Math.round((from - next) / n);
      var to = next + laps * n;
      var span = Math.abs(to - from);
      root.style.setProperty('--mode-dial-laps', String(laps));
      root.style.setProperty('--mode-dial-span', String(Math.max(1, span)));
      sel = next;
      /* Settling: the face is about to move under a pointer that has not.
         Hover rules wait until the pointer itself moves. */
      root.setAttribute('data-mode-dial-settling', '');
      settleX = lastX;
      settleY = lastY;
      settleOn = null;
      return { from: from, dir: to > from ? 1 : -1, span: span };
    }

    /* Set while the drag, or a reset, fires its change: the drag ticks at
       once, and a reset carries the cause of the Escape that asked for it. */
    var dragging = null;
    var forced;

    root.addEventListener('change', function (e) {
      if (inputs.indexOf(e.target) < 0) return;
      var turn = turnTo(checkedIndex());
      if (!turn) return;
      if (dragging) {
        ticks(turn, null, dragging.cause, dragging.voice);
        return;
      }
      var why = forced !== undefined ? forced : cause;
      ticks(turn, timing(), why, why ? voiceOf(root) : null);
    });

    /* --- 4. the feel ------------------------------------------------------ */

    var queue = [];
    var queueTimer = 0;
    var lastDue = -Infinity;
    var kick = false;
    var buzzed = 0;
    var lastEmit = -Infinity;          /* when the last tick went out, and at which stop */
    var lastPos = NaN;
    var lastDir = 0;                   /* which way the turn that queued it was going */

    /* A turn that runs to its end has settled, and the last tick is history:
       a turn interrupted mid-way (a held key) fires transitioncancel instead,
       so it keeps counting on. */
    var face = root.querySelector('.mode-dial__options');
    if (face) face.addEventListener('transitionend', function (e) {
      if (e.target === face && e.propertyName === 'rotate') { lastPos = NaN; lastDir = 0; }
    });

    /* How long this turn takes and how it eases, off the layer that turns.
       Read after turnTo has written the span, which is what flushes it — and
       what starts the transition, so the browser can then be asked what it
       is really doing: where the face starts, which is part way for a turn
       that interrupts another; how long it takes, which is shorter for one
       that reverses; and when it began. `run` is false when there is no
       transition at all, a turn undone inside one frame. */
    function timing() {
      var layer = root.querySelector('.mode-dial__options');
      if (!layer) return { ms: 420, curve: null };
      var cs = getComputedStyle(layer);
      var t = { ms: msOf(firstOf(cs.transitionDuration)), curve: curveOf(firstOf(cs.transitionTimingFunction)) };
      if (!layer.getAnimations) return t;
      var run = layer.getAnimations().filter(function (a) { return a.transitionProperty === 'rotate'; }).pop();
      if (!run) { t.run = false; return t; }
      var a0 = parseFloat((run.effect.getKeyframes()[0] || {}).rotate);
      if (!isFinite(a0)) return t;
      t.run = true;
      t.anim = run;
      t.at = -a0 / (360 / n);
      var d = run.effect.getComputedTiming().duration;
      if (isFinite(d)) t.ms = d;
      t.start = run.startTime !== null && isFinite(run.startTime) ? run.startTime : NaN;
      return t;
    }

    /* One tick per detent passed. With a timing, each is due when the eased
       angle reaches it; without one — a drag — at once. */
    function ticks(turn, t, why, voice) {
      if (voice) { audioFor(); wake(); }
      var now = performance.now();
      if (t && t.ms >= 1 && t.run !== undefined) {
        /* The turn the browser is running replaces whatever was queued: the
           ticks of a turn it interrupted are dropped, and the stops counted
           are the whole ones strictly past where the face is now, the way
           it is now going. The gap is kept from the last tick heard. */
        queue.length = 0;
        lastDue = lastEmit;
        if (t.run) {
          var to = turn.from + turn.dir * turn.span;
          var c = t.at;
          var dir = to > c ? 1 : -1;
          var base = isFinite(t.start) ? t.start : now;
          /* A turn that carries on the way the last tick went counts on
             from that tick, not from the face: a tick can go out a frame
             before the face reaches its stop, and the start angle can be a
             frame old, so counting from the face would tick a stop twice
             under a held key, where keys can outrun frames and the start
             angle trails the last tick by more than half a stop. Only until
             the face settles, though: a tick from a finished turn says
             nothing about a face a host has since moved. A stop the face is
             already past is due now. */
          var past = dir === lastDir && Math.abs(lastPos - c) < 2 ? lastPos : c;
          var m = dir > 0 ? Math.floor(past + 1e-6) + 1 : Math.ceil(past - 1e-6) - 1;
          for (; dir > 0 ? m <= to : m >= to; m += dir) {
            /* For the same reason, the stop just ticked is not ticked again
               by a turn that starts back across it. */
            if (m === lastPos && Math.abs(c - m) < 0.25) continue;
            push(m, base + crossing(t.curve, Math.max(0, (m - c) / (to - c))) * t.ms, why, voice, dir);
          }
        }
        hearTurn(turn, t, why ? ratchetOf(voice) : null);
      } else {
        for (var k = 1; k <= turn.span; k++) {
          var at = 0;
          if (t) at = t.ms >= 1 ? crossing(t.curve, k / turn.span) * t.ms : (k - 1) * STILL_GAP;
          push(turn.from + turn.dir * k, now + at, why, voice, turn.dir);
        }
        if (t) hearTurn(turn, t, why ? ratchetOf(voice) : null);
      }
      queue.sort(function (a, b) { return a.due - b.due; });
      pump();
    }

    function push(pos, due, why, voice, dir) {
      due = Math.max(due, lastDue + TICK_GAP);
      lastDue = due;
      queue.push({ due: due, pos: pos, value: inputs[((pos % n) + n) % n].value, cause: why, voice: voice, dir: dir });
    }

    function pump() {
      if (queueTimer) { clearTimeout(queueTimer); queueTimer = 0; }
      if (!root.isConnected) { queue.length = 0; hearCancel(); hearClose(); return; }
      var now = performance.now();
      while (queue.length && queue[0].due <= now + 1) emit(queue.shift(), now);
      if (queue.length) queueTimer = setTimeout(function () { queueTimer = 0; pump(); }, queue[0].due - now);
    }

    function buzz(why, ms) {
      if (!why || (why.pointer !== 'touch' && why.pointer !== 'pen') || !navigator.vibrate) return;
      var now = Date.now();
      if (now - buzzed < BUZZ_MS) return;
      buzzed = now;
      try { navigator.vibrate(ms); } catch (err) { /* not allowed */ }
    }

    function emit(tick) {
      lastEmit = performance.now();
      lastDir = tick.dir;
      lastPos = tick.pos;
      /* Two names for one keyframe set, so each tick starts it over. */
      kick = !kick;
      root.setAttribute('data-mode-dial-kick', kick ? 'a' : 'b');
      buzz(tick.cause, 6);
      /* Armed by the gesture, but the volume is read again now: a sound
         switched off mid-turn is off for the rest of it. In the ratchet's
         voice the snap is the detent's sound, and it is already planned. */
      if (tick.cause && tick.voice) {
        var v = voiceOf(root);
        if (!v) hearCancel();
        else if (!(v.snap > 0)) play('detent', v);
      }
      root.dispatchEvent(new CustomEvent('mode-dial:tick', {
        bubbles: true,
        detail: { value: tick.value, user: !!tick.cause }
      }));
    }

    /* --- 5. the ratchet ---------------------------------------------------
       Positions are in steps, the same absolute count the face turns by
       (sel + laps·n + drag), so a lap is never a jump. A tooth boundary is
       half a tooth either side of a stop: at rest the index sits between
       two teeth, as a pawl sits in a notch, so the settle's last wobble
       about the stop crosses none.

       Planned sounds wait in `events`, in time order, and only the next
       AHEAD ms of them are ever on the audio clock, so a cancel has little
       to take back. `seat` is the detent the face is in as planned and
       `heard` as played: a snap is the face arriving at a stop other than
       its seat, and it leaves its seat by going SEAT of a step away — three
       teeth on six stops. A turn's own overshoot past its target, up to
       0.24 of a step on a 4-step turn, is the same landing and never leaves
       it. */
    var hear = { events: [], timer: 0, chain: null, plan: 0, seat: sel, heard: sel, arrived: NaN, arrivedDir: 0, planDir: 0, tooth: null, voice: null, watch: null, inline: '', hold: 0 };

    /* Every stop the face arrives at going straight from u0 to u1 — the
       end included, the start not — as the fraction of the way, and the
       point at which it leaves its seat, with no stop. */
    function seats(u0, u1, out, keep) {
      if (!(u1 !== u0) || !isFinite(u0) || !isFinite(u1)) return;
      var dir = u1 > u0 ? 1 : -1;
      /* A face more than SEAT from its seat has left it — unless the seat is
         ahead of it, the way it is going, which is a face heard landing
         before it got there. */
      var ahead = (hear.seat - u0) * dir;
      if (hear.seat === hear.seat && hear.seat !== keep && Math.abs(u0 - hear.seat) > SEAT && !(ahead > 0 && ahead < 1)) { hear.seat = NaN; out(0); }
      var x = u0;
      for (var guard = 0; guard < 4 * n + 8; guard++) {
        var m = dir > 0 ? Math.floor(x + 1e-9) + 1 : Math.ceil(x - 1e-9) - 1;
        var off = hear.seat === hear.seat && hear.seat !== keep ? hear.seat + dir * SEAT : NaN;
        if (off === off && (off - x) * dir > 0 && (m - off) * dir > 0) {
          if ((off - u1) * dir > 1e-9) return;
          hear.seat = NaN;
          out(Math.min(1, Math.max(0, (off - u0) / (u1 - u0))));
          x = off;
          continue;
        }
        if ((m - u1) * dir > 1e-9) return;
        if (m !== hear.seat) {
          out(Math.min(1, Math.max(0, (m - u0) / (u1 - u0))), m, dir);
          hear.seat = m;
        }
        x = m;
      }
    }

    /* One straight stretch of the face's path, starting at `at` and taking
       `dur` ms: a grain for each tooth, a snap for each stop it lands in. */
    function feed(u0, u1, at, dur, v, q, full, id, out, keep) {
      if (u0 === u1 || !isFinite(u0) || !isFinite(u1)) return;
      var tps = v.teeth / n;
      if (q && v.scrape > 0) count(q, u0 * tps - 0.5, u1 * tps - 0.5, function (f, after) {
        out.push({ at: at + f * dur, grain: true, q: after, plan: id });
      });
      if (v.snap > 0) seats(u0, u1, function (f, m, d) {
        out.push(m === undefined ? { at: at + f * dur, leave: true, plan: id } : { at: at + f * dur, m: m, d: d, full: full(m), plan: id });
      }, keep);
    }

    /* The eased path, segment by segment off the same points the ticks'
       crossing() reads, so the snap at the target is due exactly when its
       tick is — less the TICK_GAP spacing the ticks also carry. */
    function walk(c, to, base, ms, curve, v, full, id, out, q) {
      var pts = curve || [[0, 0], [1, 1]];
      q = q || resume(hear.tooth, c * v.teeth / n - 0.5, to > c ? 1 : -1);
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        feed(c + (to - c) * a[1], c + (to - c) * b[1], base + a[0] * ms, (b[0] - a[0]) * ms, v, q, full, id, out, to);
      }
    }

    /* A transition's start is not known until its first frame. The plan is
       made from now and kept off the audio clock until the transition's
       `ready` says what the start was, a frame or two later; then it is
       moved onto it, and what is already due is caught up. Put on the clock
       at once, the first teeth were heard up to 24ms before the face moved
       and then a hole as long, where the rest moved onto the real start.
       Held, they come up to a frame late and close together, and the turn
       never stutters. HOLD_MAX lets go of a start that is never reported. */
    function rebaseOn(t, id, base) {
      if (!t.run || isFinite(t.start) || !t.anim || !t.anim.ready) return;
      var anim = t.anim;
      hear.hold = id;
      function letGo(s) {
        if (hear.hold !== id) return;
        hear.hold = 0;
        if (hear.plan !== id) return;
        if (s !== null && isFinite(s) && Math.abs(s - base) >= 1) { hearRebase(id, s - base, base); return; }
        catchUp(hear.events, base, id);
        hearPump(false);
      }
      anim.ready.then(function () { letGo(anim.startTime); }, function () { letGo(null); });
      setTimeout(function () { letGo(null); }, HOLD_MAX);
    }

    /* A turn that takes over from a running one starts at the time of the
       last frame, which can be most of a frame ago: the face shows that
       much of its path at once on the next. What of the plan is already due
       is caught up rather than dropped or played in one burst — the first
       2d ms of it heard in the next d. */
    function catchUp(out, from, id) {
      var now = performance.now();
      var d = now - from;
      if (!(d > 1)) return;
      out.forEach(function (e) {
        if (e.plan === id && e.when === undefined && e.at < now + d) e.at = now + (e.at - from) / 2;
      });
    }

    /* A turn the browser is running replaces whatever was planned and not
       yet heard, because the face's path has changed. */
    function hearTurn(turn, t, v) {
      hearCancel(t.run && isFinite(t.start) ? t.start : undefined);
      if (!v || !audioFor()) { hearLost(); return; }
      hear.voice = v;
      var to = turn.from + turn.dir * turn.span;
      var now = performance.now();
      var id = ++hear.plan;
      var out = [];
      var last = function (m) { return m === to; };
      /* A turn that carries on the way the last one went, from a face short
         of the last stop it was heard landing in, counts on from that stop,
         as the ticks count on from the last tick: a held key outruns the
         frames, so a snap can be heard before the face it belongs to, and
         the plan that heard it can think the face has already left it. */
      var c = t.run ? t.at : turn.from;
      var pdir = to > c ? 1 : -1;
      var ahead = (hear.arrived - c) * pdir;
      if (pdir === hear.planDir && pdir === hear.arrivedDir && ahead > 0 && ahead < 1) hear.seat = hear.arrived;
      hear.planDir = pdir;
      if (t.ms >= 1 && t.run !== false) {
        var base = t.run && isFinite(t.start) ? t.start : now;
        walk(t.run ? t.at : turn.from, to, base, t.ms, t.curve, v, last, id, out);
        catchUp(out, base, id);
        rebaseOn(t, id, base);
      } else if (t.ms < 1) {
        /* Reduced motion: the turn has no duration, so there is nothing to
           scratch. A snap per detent, at its tick's time. */
        for (var k = 1; k <= turn.span; k++) {
          feed(turn.from + turn.dir * (k - 1), turn.from + turn.dir * k, now + (k - 1) * STILL_GAP, 0, v, null, last, id, out);
        }
        hear.tooth = null;
      }
      hearAdd(out);
    }

    /* One frame of a drag: the stretch from the last displayed angle to
       this one, spread over the frame it took, so the grains come as fast
       as the face goes. */
    function hearDrag(pos) {
      var h = drag.hear, v = drag.voice;
      var now = performance.now();
      if (!h.q) h.q = resume(hear.tooth, h.pos * v.teeth / n - 0.5, pos > h.pos ? 1 : -1);
      var out = [];
      feed(h.pos, pos, now, Math.min(FRAME_MAX, Math.max(4, now - h.at)), v, h.q, always, 0, out);
      h.pos = pos;
      h.at = now;
      if (out.length) hearAdd(out);
    }

    /* A drag let go: the settle back to the stop, read off its transition
       like any turn. A face already in the notch it is going to adds no
       snap; one that had left it by more than SEAT snaps back into it. */
    function hearSettle(was) {
      var v = was.voice;
      var to = sel + laps * n;
      var t = timing();
      var now = performance.now();
      var id = ++hear.plan;
      var out = [];
      if (t.run && t.ms >= 1) {
        var base = isFinite(t.start) ? t.start : now;
        walk(t.at, to, base, t.ms, t.curve, v, always, id, out, was.hear.q);
        catchUp(out, base, id);
        rebaseOn(t, id, base);
      } else {
        feed(was.hear.pos, to, now, 0, v, null, always, id, out);
        hear.tooth = null;
      }
      hearAdd(out);
    }

    /* The face moved and was not heard — a host's turn, a reset, a turn
       with the sound off, a jump under reduced motion: what was last heard
       no longer says where the face is, so the next turn counts from it. */
    function hearLost() {
      hear.tooth = null;
      hear.seat = hear.heard = hear.arrived = NaN;
      hear.arrivedDir = hear.planDir = 0;
    }

    function byAt(a, b) { return a.at - b.at; }

    function hearAdd(out) {
      if (!out.length) return;
      for (var i = 0; i < out.length; i++) hear.events.push(out[i]);
      hear.events.sort(byAt);
      /* A host that switches the sound off, or takes the ratchet away,
         mid-turn: heard at once if it does so on the root itself. A drag
         writes the root's style every frame, so the style is only read
         again when one of the voice's three levels is what changed in it. */
      if (!hear.watch && window.MutationObserver) {
        hear.inline = levels();
        hear.watch = new MutationObserver(function (records) {
          var was = hear.inline;
          hear.inline = levels();
          var cls = records.some(function (r) { return r.attributeName === 'class'; });
          if ((cls || was !== hear.inline) && !ratchetOf(voiceOf(root))) hearPump(true);
        });
        hear.watch.observe(root, { attributes: true, attributeFilter: ['style', 'class'] });
      }
      hearPump(false);
    }

    function levels() {
      return ['--mode-dial-click', '--mode-dial-scrape', '--mode-dial-snap'].map(function (k) {
        return root.style.getPropertyValue(k);
      }).join('|');
    }

    /* Puts the next AHEAD ms on the audio clock, and checks on the way that
       the dial is still in the document and still has a voice. `fresh`
       reads the voice off the root again; a frame of a drag, or a plan just
       made, uses the one last read, so a drag never makes the browser work
       out the dial's style halfway through a frame. The timer reads it
       every PUMP ms, between frames, where it costs nothing. */
    function hearPump(fresh) {
      if (hear.timer) { clearTimeout(hear.timer); hear.timer = 0; }
      var v = root.isConnected && audio ? (fresh || !hear.voice ? ratchetOf(voiceOf(root)) : hear.voice) : null;
      hear.voice = v;
      if (!v) {
        hearCancel();
        hearClose();
        hearLost();
        if (drag) drag.hear = null;      /* switched off mid-drag: silent for the rest of it */
        return;
      }
      var ctx = audio.ctx;
      var now = performance.now();
      var cnow = ctx.currentTime;
      var running = ctx.state === 'running';
      var keep = [];
      var grains = false;
      for (var i = 0; i < hear.events.length; i++) {
        var e = hear.events[i];
        if (e.when !== undefined) {
          if (e.when > cnow) { keep.push(e); grains = grains || e.grain; }
          else if (e.m !== undefined) heardAt(e);
          else if (e.q) hear.tooth = e.q;
          continue;
        }
        /* A plan waiting for its transition's start stays off the clock. */
        if (e.plan && e.plan === hear.hold) { keep.push(e); grains = grains || e.grain; continue; }
        /* The face leaving its seat makes no sound; it is only noted. */
        if (e.leave) {
          if (e.at <= now) hear.heard = NaN;
          else keep.push(e);
          continue;
        }
        /* A clock that was not running drops what came due, as a tick
           does: scheduled late it would all play at once. */
        if (e.at < now - LATE) continue;
        if (!running || e.at > now + AHEAD) { keep.push(e); grains = grains || e.grain; continue; }
        /* At the face's moment on the audio clock, as the ticks are. The
           speaker is the output's latency behind that, and the ticks carry
           it too: put where getOutputTimestamp says it would be heard with
           the face, everything due sooner than the latency is committed at
           once, and a turn that is then interrupted keeps it. */
        var when = cnow + Math.max(0, e.at - now) / 1000;
        try {
          if (e.grain) {
            if (!hear.chain) hear.chain = scratchChain(v);
            e.when = grain(hear.chain, when, v);
            grains = true;
          } else {
            e.nodes = snapSound(when, v, e.full);
            e.when = when;
          }
        } catch (err) { continue; }
        keep.push(e);
      }
      hear.events = keep;
      /* The scratch's three nodes go once nothing has been left for them for IDLE. */
      if (hear.chain && !grains && cnow > hear.chain.last + IDLE) {
        stopAll(hear.chain.nodes, cnow);
        hear.chain = null;
      }
      if (hear.events.length || hear.chain) hear.timer = setTimeout(hearPump, PUMP, true);
      else hearClose();
    }

    /* A snap heard: the face's seat as played, and the last stop it was
       heard landing in, and which way it was going. */
    function heardAt(e) {
      hear.heard = hear.arrived = e.m;
      hear.arrivedDir = e.d;
    }

    function stopAll(nodes, at) {
      nodes.forEach(function (node) {
        if (node.stop) { try { node.stop(at); } catch (err) { /* not started */ } }
        try { node.disconnect(); } catch (err) { /* gone */ }
      });
    }

    /* Everything planned and not yet heard is taken back: the snaps'
       nodes stopped, the scratch's gain and pitch cancelled from now, and
       the seat and the tooth counter put back to where they were last
       heard. `cut` is when the face stopped following the plan: the start
       of the transition that takes over, which is the last frame's time.
       What was due by then stands, and so does anything the audio has
       already rendered, which cannot be taken back. */
    function hearCancel(cut) {
      hear.plan++;
      if (!hear.events.length) { hear.seat = hear.heard; return; }
      var cnow = audio ? audio.ctx.currentTime : 0;
      if (!(cut <= performance.now())) cut = performance.now();
      hear.events.forEach(function (e) {
        if (e.leave) { if (e.at <= cut) hear.heard = NaN; return; }
        if (e.when === undefined) return;
        if (e.when <= cnow || e.at <= cut) {
          if (e.m !== undefined) heardAt(e);
          else if (e.q) hear.tooth = e.q;
          return;
        }
        if (e.nodes) stopAll(e.nodes, cnow);
      });
      hear.events = [];
      if (hear.chain) {
        hear.chain.gain.gain.cancelScheduledValues(cnow);
        hear.chain.filter.frequency.cancelScheduledValues(cnow);
        hear.chain.last = cnow;
      }
      hear.seat = hear.heard;
    }

    /* The plan moved onto the transition's real start: what is on the
       audio clock and not yet heard comes off it, and goes back on later. */
    function hearRebase(id, shift, base) {
      if (!audio || Math.abs(shift) < 1) return;
      var cnow = audio.ctx.currentTime;
      hear.events.forEach(function (e) {
        if (e.when !== undefined && e.when > cnow) {
          if (e.nodes) stopAll(e.nodes, cnow);
          e.nodes = undefined;
          e.when = undefined;
        }
        if (e.plan === id && e.when === undefined) e.at += shift;
      });
      catchUp(hear.events, base + shift, id);
      if (hear.chain) {
        hear.chain.gain.gain.cancelScheduledValues(cnow);
        hear.chain.filter.frequency.cancelScheduledValues(cnow);
        hear.chain.last = cnow;
      }
      hear.events.sort(byAt);
      hearPump(false);
    }

    function hearClose() {
      if (hear.timer) { clearTimeout(hear.timer); hear.timer = 0; }
      if (hear.chain) {
        stopAll(hear.chain.nodes, audio ? audio.ctx.currentTime : 0);
        hear.chain = null;
      }
      if (hear.watch) { hear.watch.disconnect(); hear.watch = null; }
      hear.voice = null;
    }

    root.addEventListener('pointermove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (root.hasAttribute('data-mode-dial-settling') && (lastX !== settleX || lastY !== settleY)) {
        /* After a drag the grabbed option is still under the pointer, and
           peeking at it would read the item just left as a preview. It
           waits until the pointer is off that option. */
        var on = e.target.closest && e.target.closest('.mode-dial__option');
        if (!settleOn || on !== settleOn) {
          root.removeAttribute('data-mode-dial-settling');
          settleOn = null;
        }
      }
      if (root.hasAttribute('data-mode-dial-hush') && (lastX !== hushX || lastY !== hushY)) {
        root.removeAttribute('data-mode-dial-hush');
      }
    });

    root.addEventListener('pointerleave', function () {
      root.removeAttribute('data-mode-dial-settling');
      settleOn = null;
    });

    /* Escape with nothing pending lowers a raised name; the next move of the
       pointer or of focus raises it again. */
    root.addEventListener('focusin', function (e) {
      root.removeAttribute('data-mode-dial-hush');
      var k = key();
      if (k && k.contains(e.target)) syncHeld();
    });

    /* --- 2. the drag --------------------------------------------------------
       From a primary pointer of any type, anywhere on the dial but the key.
       The dial is touch-action: pan-y and the knurl none, so a vertical swipe
       over the face still scrolls the page — the browser takes it and sends
       pointercancel, which abandons the drag where the last detent left it. */

    var drag = null;
    var raf = 0;

    dial.addEventListener('pointerdown', function (e) {
      if (!e.isPrimary || e.button !== 0) return;
      if (e.target.closest && e.target.closest('.mode-dial__commit')) return;
      var box = dial.getBoundingClientRect();
      var cx = box.left + box.width / 2;
      var cy = box.top + box.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      if (Math.sqrt(dx * dx + dy * dy) < box.width / 2 * CENTRE) return;
      drag = {
        id: e.pointerId,
        cause: e.isTrusted ? { pointer: e.pointerType || 'mouse' } : null,
        voice: null,
        hear: null,
        notch: 0,
        cx: cx, cy: cy,
        prev: Math.atan2(dy, dx),
        acc: 0,
        from: sel + laps * n,
        started: false
      };
    });

    dial.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      /* Uncaptured, a release off the dial is never heard here. A move with
         the button up is the first sign of it, and ends the drag. */
      if (!(e.buttons & 1)) {
        end({ type: 'pointercancel', pointerId: e.pointerId, target: dial });
        return;
      }
      var a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
      var d = a - drag.prev;
      if (d > Math.PI) d -= 2 * Math.PI;
      else if (d <= -Math.PI) d += 2 * Math.PI;
      drag.prev = a;
      drag.acc += d;
      if (!drag.started) {
        if (Math.abs(drag.acc) < START) return;
        drag.started = true;
        /* Once per drag: how notched it is, and whether it is heard. */
        var k = parseFloat(getComputedStyle(root).getPropertyValue('--mode-dial-notch'));
        drag.notch = isFinite(k) ? Math.min(1, Math.max(0, k)) : 0;
        if (drag.cause) {
          drag.voice = voiceOf(root);
          if (drag.voice) { audioFor(); wake(); }
        }
        /* The face is the hand's now: whatever was planned for it is off. */
        hearCancel();
        hear.planDir = 0;
        if (audio && ratchetOf(drag.voice)) {
          hear.voice = drag.voice;
          drag.hear = { pos: drag.from, at: performance.now(), q: null };
        } else hearLost();
        root.setAttribute('data-mode-dial-dragging', '');
        /* Capture only now: captured from the press, a plain click would
           land on the dial instead of the label it was aimed at. */
        try { dial.setPointerCapture(e.pointerId); } catch (err) { /* gone */ }
      }
      if (!raf) raf = requestAnimationFrame(frame);
    });

    /* One detent at a time, however fast the pointer went, so three crossed
       is three changes. The fraction left over is the drag. A disabled stop
       is passed over, not checked: the next enabled one is taken once the
       disabled run is crossed by CROSS, and the way back asks the same, so
       the two thresholds never meet and a held pointer cannot flicker. */
    function frame() {
      raf = 0;
      if (!root.isConnected || !drag || !drag.started) return;
      var T = drag.from - drag.acc / (2 * Math.PI / n);
      var cur = sel + laps * n;
      var moved = null;
      var guard = n * 4;
      while (guard--) {
        var dir = T > cur ? 1 : -1;
        var dist = 1;
        while (dist < n && inputs[(((cur + dir * dist) % n) + n) % n].disabled) dist++;
        if (dist >= n || Math.abs(T - cur) <= dist - 1 + CROSS) break;
        var target = cur + dir * dist;
        var next = ((target % n) + n) % n;
        inputs[next].checked = true;
        fire(inputs[next], 'input');
        dragging = drag;
        try { fire(inputs[next], 'change'); } finally { dragging = null; }
        if (!drag) return;               /* a change listener ended it */
        cur = sel + laps * n;
        moved = inputs[next];
      }
      /* Focus follows only if it was already in the dial: a pointer drag
         from outside it should not leave a keyboard ring behind. */
      if (moved && root.contains(document.activeElement)) moved.focus({ preventScroll: true });
      /* The detent curve. x is how far past the stop the pointer is, which
         jumps by a whole step when the selection flips; f(x) - f(x - 1) = 1,
         so the face does not. Monotonic for k up to 1. */
      var x = T - cur;
      var shown = x - drag.notch * Math.sin(2 * Math.PI * x) / (2 * Math.PI);
      root.style.setProperty('--mode-dial-drag', shown.toFixed(4));
      if (drag.hear) hearDrag(cur + +shown.toFixed(4));
    }

    function swallowClick() {
      function kill(e) {
        e.stopPropagation();
        e.preventDefault();
        off();
      }
      function off() { root.removeEventListener('click', kill, true); }
      root.addEventListener('click', kill, true);
      /* The click, if one comes, is dispatched with the pointerup. */
      setTimeout(off, 0);
    }

    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      /* A touch is captured to what it landed on; taking the capture for
         the dial makes that element lose it, and the loss bubbles here. */
      if (e.type === 'lostpointercapture' && e.target !== dial) return;
      var was = drag;
      if (e.type === 'pointerup' && was.started && raf) {
        cancelAnimationFrame(raf);
        frame();
      }
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      drag = null;
      /* Both in one frame, so the detent transition carries the fraction
         back to the stop — and both whether or not the drag started, so
         nothing a lost drag left behind can stick. */
      root.removeAttribute('data-mode-dial-dragging');
      root.style.removeProperty('--mode-dial-drag');
      if (was.started && was.hear && root.isConnected) hearSettle(was);
      if (!was.started || e.type !== 'pointerup') return;
      swallowClick();
      root.setAttribute('data-mode-dial-settling', '');
      settleX = e.clientX;
      settleY = e.clientY;
      var under = document.elementFromPoint(e.clientX, e.clientY);
      settleOn = under && under.closest && root.contains(under) ? under.closest('.mode-dial__option') : null;
    }

    dial.addEventListener('pointerup', end);
    dial.addEventListener('pointercancel', end);
    dial.addEventListener('lostpointercapture', end);

    /* --- 3. commit -------------------------------------------------------
       The status line names what is held, always, in whatever language the
       option's name is in now; the key is described by it. Written at boot,
       at commit and after a cancel, and again whenever the key takes focus,
       which also covers a key a host puts in after boot. */

    var statusN = 0;
    function held() {
      var d = defaultInput();
      if (!d) return '';
      var opt = d.closest('.mode-dial__option');
      var nm = opt && opt.querySelector('.mode-dial__name');
      return nm ? nm.textContent : d.value;
    }

    function syncHeld(force) {
      var st = root.querySelector('.mode-dial__status');
      var v = root.querySelector('.mode-dial__status-value');
      var k = key();
      if (!st || !v || !k) return;
      if (!st.id) {
        do { statusN++; } while (document.getElementById('mode-dial-status-' + statusN));
        st.id = 'mode-dial-status-' + statusN;
      }
      k.setAttribute('aria-describedby', st.id);
      var t = held();
      if (force || v.textContent !== t) v.textContent = t;
    }
    syncHeld();

    var setTimer = 0;
    var owed = false;                  /* a release click waiting for the key to rise */

    root.addEventListener('submit', function (e) {
      var k = key();
      /* No key: nothing here submits, including Enter on a radio. A disabled
         key refuses, as it does without script. */
      if (!k || k.matches(':disabled')) { e.preventDefault(); return; }
      var prev = defaultInput();
      var cur = inputs[checkedIndex()];
      if (cur && cur !== prev) {
        /* False on all first, then true on the current one, so the checked
           radio is never left unchecked by a clean dirty flag. */
        inputs.forEach(function (i) { i.defaultChecked = false; });
        cur.defaultChecked = true;
        syncHeld();
        root.dispatchEvent(new CustomEvent('mode-dial:commit', {
          bubbles: true,
          detail: { name: cur.name, value: cur.value, previous: prev ? prev.value : null }
        }));
      }
      /* The hold always runs SET_MS from the last commit, and the key's
         release click, if it came up during it, is heard as it rises. */
      root.setAttribute('data-mode-dial-set', '');
      clearTimeout(setTimer);
      setTimer = setTimeout(function () {
        if (!root.isConnected) return;
        root.removeAttribute('data-mode-dial-set');
        if (owed && keyDown === null) play('release', voiceOf(root));
        owed = false;
      }, SET_MS);
      if (!root.hasAttribute('action')) e.preventDefault();
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && inputs.indexOf(e.target) >= 0) {
        var k = key();
        if (!k) return;
        e.preventDefault();
        if (k.matches(':disabled')) return;
        if (root.requestSubmit) root.requestSubmit(k);
        else k.click();
      } else if (e.key === 'Escape' && pending()) {
        e.preventDefault();
        root.reset();
      } else if (e.key === 'Escape') {
        /* Nothing to cancel: lower the raised name instead, and leave the
           key unclaimed for whatever the page does with Escape. */
        root.setAttribute('data-mode-dial-hush', '');
        hushX = lastX;
        hushY = lastY;
      }
    });

    /* The key's travel and its two clicks. A pointer on it, Space or Enter
       on it, or Enter on a radio of a dial with a key, presses it with
       data-mode-dial-press until the key comes up — a pointer too, because
       a touch gets :active late or not at all. The click down is heard at
       once; the softer, higher click up as the key rises, which waits out a
       commit's hold. Both for trusted input only, like every sound here. */
    var keyDown = null;

    function keySound(kind, pointer) {
      if (kind === 'press') {
        owed = false;                  /* a second press cancels a release never made */
        buzz({ pointer: pointer }, 8);
        play('press', voiceOf(root), 0, true);
        return;
      }
      /* A task on, so the click the release causes has run submit and a
         commit's hold is known. */
      setTimeout(function () {
        if (!root.isConnected) return;
        if (root.hasAttribute('data-mode-dial-set')) owed = true;
        else play('release', voiceOf(root), 0, true);
      }, 0);
    }

    root.addEventListener('pointerdown', function (e) {
      var k = key();
      if (!e.isTrusted || !e.isPrimary || e.button !== 0 || !k || !k.contains(e.target) || k.matches(':disabled')) return;
      /* Already held by Space or Enter: that key's own up releases it. */
      if (keyDown === ' ' || keyDown === 'Enter') return;
      var id = e.pointerId;
      keyDown = 'pointer';
      root.setAttribute('data-mode-dial-press', '');
      keySound('press', e.pointerType || 'mouse');
      function up(ev) {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointerup', up, true);
        window.removeEventListener('pointercancel', up, true);
        if (keyDown !== 'pointer') return;
        keyDown = null;
        root.removeAttribute('data-mode-dial-press');
        if (root.isConnected) keySound('release');
      }
      window.addEventListener('pointerup', up, true);
      window.addEventListener('pointercancel', up, true);
    });

    root.addEventListener('keydown', function (e) {
      if (!e.isTrusted || e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
      var k = key();
      if (!k || k.matches(':disabled')) return;
      if (!k.contains(e.target) && !(e.key === 'Enter' && inputs.indexOf(e.target) >= 0)) return;
      keyDown = e.key;
      root.setAttribute('data-mode-dial-press', '');
      keySound('press', 'key');
    });

    /* Clears a press left behind by anything but a pointer, whose own up
       releases it: a mouse press moves focus, and that focusout is not the
       key coming up. */
    function keyUp(sound) {
      if (keyDown === 'pointer') return;
      root.removeAttribute('data-mode-dial-press');
      if (keyDown === null) return;
      keyDown = null;
      if (sound) keySound('release');
    }

    root.addEventListener('keyup', function (e) {
      if (e.key === keyDown) keyUp(e.isTrusted);
    });
    root.addEventListener('focusout', function () { keyUp(false); });

    /* reset fires before the controls are reset, so the bookkeeping waits a
       task. A host's own form.reset() takes the same path. */
    root.addEventListener('reset', function (e) {
      var cur = inputs[checkedIndex()];
      var discarded = pending() && cur ? cur.value : null;
      var focused = inputs.indexOf(document.activeElement) >= 0;
      var why = cause;                   /* the Escape's, or null for a host */
      setTimeout(function () {
        if (!root.isConnected || e.defaultPrevented) return;
        var i = checkedIndex();
        if (i < 0) return;
        var now = inputs[i];
        if (i !== sel) {
          forced = why;
          try { fire(now, 'change'); } finally { forced = undefined; }
        }
        if (focused) now.focus({ preventScroll: true });
        syncHeld(discarded !== null);
        if (discarded !== null) {
          root.dispatchEvent(new CustomEvent('mode-dial:cancel', {
            bubbles: true,
            detail: { name: now.name, value: now.value, discarded: discarded }
          }));
        }
      }, 0);
    });
  }

  function boot() {
    Array.prototype.slice
      .call(document.querySelectorAll('.mode-dial'))
      .forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
