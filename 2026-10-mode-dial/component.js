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
       passes is a tick, timed to when the eased angle passes it, and a
       tick is a kick of the index (CSS), a `mode-dial:tick` event, a buzz
       for touch and pen, and — only if --mode-dial-click is above 0 — a
       synthesised click. The key clicks on the way down and up.

       Sound only ever follows a trusted input event on this dial: a key,
       a pointer, a click. A host's input.click(), its form.reset() or the
       preview turning the dial is silent, and with the volume at 0 no
       AudioContext is made. One context per document, made on the first
       tick that has a volume, and resumed if the browser suspended it.

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
      /* 50ms of white noise, shared by every click: the band-pass shapes it. */
      var len = Math.max(1, Math.round(ctx.sampleRate * 0.05));
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
     Q rings; it also passes less, so the gain gives some of that back. */
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
    g.gain.linearRampToValueAtTime(Math.min(1, gain * Math.sqrt(Math.max(1, q) / 2)), when + 0.0015);
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
      thump: num('--mode-dial-key-thump', 120, 30, 1000)
    };
  }

  function play(kind, v, delay) {
    if (!v || !audioFor()) return;
    wake();
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
      /* A suspended context can only be resumed from a gesture. */
      if (audio) wake();
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

    /* How long this turn takes and how it eases, off the layer that turns.
       Read after turnTo has written the span, which is what flushes it. */
    function timing() {
      var layer = root.querySelector('.mode-dial__options');
      if (!layer) return { ms: 420, curve: null };
      var cs = getComputedStyle(layer);
      return { ms: msOf(firstOf(cs.transitionDuration)), curve: curveOf(firstOf(cs.transitionTimingFunction)) };
    }

    /* One tick per detent passed. With a timing, each is due when the eased
       angle reaches it; without one — a drag — at once. */
    function ticks(turn, t, why, voice) {
      if (voice) { audioFor(); wake(); }
      var now = performance.now();
      for (var k = 1; k <= turn.span; k++) {
        var at = 0;
        if (t) at = t.ms >= 1 ? crossing(t.curve, k / turn.span) * t.ms : (k - 1) * STILL_GAP;
        var due = Math.max(now + at, lastDue + TICK_GAP);
        lastDue = due;
        var pos = turn.from + turn.dir * k;
        queue.push({ due: due, value: inputs[((pos % n) + n) % n].value, cause: why, voice: voice });
      }
      queue.sort(function (a, b) { return a.due - b.due; });
      pump();
    }

    function pump() {
      if (queueTimer) { clearTimeout(queueTimer); queueTimer = 0; }
      if (!root.isConnected) { queue.length = 0; return; }
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
      /* Two names for one keyframe set, so each tick starts it over. */
      kick = !kick;
      root.setAttribute('data-mode-dial-kick', kick ? 'a' : 'b');
      buzz(tick.cause, 6);
      if (tick.cause && tick.voice) play('detent', tick.voice);
      root.dispatchEvent(new CustomEvent('mode-dial:tick', {
        bubbles: true,
        detail: { value: tick.value, user: !!tick.cause }
      }));
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
      root.setAttribute('data-mode-dial-set', '');
      setTimeout(function () {
        if (!root.isConnected) return;
        root.removeAttribute('data-mode-dial-set');
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

    /* The key's travel and its two clicks. A pointer presses it with
       :active, which CSS already has; Space or Enter on it, or Enter on a
       radio of a dial with a key, presses it with data-mode-dial-press until
       the key comes up. The click down and the softer, higher click up are
       for trusted input only, like every sound here. */
    var keyDown = null;

    function keySound(kind, pointer) {
      if (kind === 'press') buzz({ pointer: pointer }, 8);
      play(kind, voiceOf(root));
    }

    root.addEventListener('pointerdown', function (e) {
      var k = key();
      if (!e.isTrusted || !e.isPrimary || e.button !== 0 || !k || !k.contains(e.target) || k.matches(':disabled')) return;
      var id = e.pointerId;
      keyDown = 'pointer';
      keySound('press', e.pointerType || 'mouse');
      function up(ev) {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointerup', up, true);
        window.removeEventListener('pointercancel', up, true);
        if (keyDown !== 'pointer') return;
        keyDown = null;
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

    function keyUp(sound) {
      if (keyDown !== ' ' && keyDown !== 'Enter') return;
      keyDown = null;
      root.removeAttribute('data-mode-dial-press');
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
