/*
  Glass grades: what script adds to a component that already works without it.

  component.css opens, slides and labels every pane from the checked light and
  the Strip | Pane switch. This file drives the same number, --glass-grades-p,
  faster than a transition can: a drag that sticks near each stop, a flick
  that coasts, a glide that lands. Each stop passed ticks, in sound when
  --glass-grades-click is above 0 and in touch on a phone. A still press lifts
  the glass off the picture. A picture of your own can be picked, dropped or
  pasted, and a page can hand one in by its address. When the glass lands, p
  is handed back to the stylesheet, so at rest
  the component is exactly what it would be without this file.

  It reads its tunables from the root's own custom properties, so a host
  changes the feel the way it changes the colours.
*/
(function () {
  'use strict';

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
  var lastActive = null;   // the instance a paste goes to

  var MSG = {
    en: { notImage: 'That is not an image. Try a JPEG, PNG or HEIC.', cannot: 'This browser could not open that image.', alt: 'Your picture',
          lifted: 'Glass lifted: the picture as it is.', down: 'Glass back down:',
          ownOnly: 'Saving works on your own pictures.', unsaved: 'This browser could not save the picture.' },
    da: { notImage: 'Det er ikke et billede. Prøv JPEG, PNG eller HEIC.', cannot: 'Browseren kunne ikke åbne billedet.', alt: 'Dit billede',
          lifted: 'Glasset er løftet: billedet, som det er.', down: 'Glasset er lagt tilbage:',
          ownOnly: 'Gemme virker med dine egne billeder.', unsaved: 'Browseren kunne ikke gemme billedet.' }
  };
  function msg(key) {
    var lang = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2);
    return (MSG[lang] || MSG.en)[key];
  }

  /* ── sound: two recordings, a dry click as the glass passes a stop and a
        soft drop as it lands, from Kenney's Interface Sounds (CC0). They are
        carried at the end of this file as 16-bit samples, so a folder copied
        out still sounds, and become buffers when the first sound with a
        volume above 0 makes the context; no context is made before that.
        The drop is close to a pure F#5, so lifting the glass plays it a
        fifth up, setting it down brings it back with the click as the
        contact, and a picture sliding in plays the two rising. They play
        dry and at the rate they were chosen at, but for a little variation
        in the click's, so a sweep never sounds mechanical. ── */
  var audio = { ctx: null, out: null, buf: {} };
  function ensureAudio() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      var c = audio.ctx = new AC();
      audio.out = c.createGain();
      audio.out.connect(c.destination);
      Object.keys(SAMPLES).forEach(function (k) {
        var bin = atob(SAMPLES[k]), n = bin.length >> 1, b = c.createBuffer(1, n, SAMPLE_RATE), d = b.getChannelData(0);
        for (var i = 0; i < n; i++) {
          var v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8);
          d[i] = (v > 32767 ? v - 65536 : v) / 32768;
        }
        audio.buf[k] = b;
      });
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  }
  function hit(name, t, rate, level) {
    var c = audio.ctx, s = c.createBufferSource(), g = c.createGain();
    s.buffer = audio.buf[name]; s.playbackRate.value = rate; g.gain.value = level;
    s.connect(g); g.connect(audio.out); s.start(t);
  }
  function play(kind, volume) {
    if (!(volume > 0)) return;
    var c = ensureAudio();
    if (!c) return;
    // Three quarters of the volume token: at the demo's 0.5 the landing is as
    // loud as the synthesised one these replaced, and at full volume nothing
    // clips, so the output needs no compressor. See notes.md.
    audio.out.gain.value = 0.75 * volume;
    var t = c.currentTime + 0.004, j = 1 + (Math.random() - 0.5) * 0.03;
    if (kind === 'pass') hit('click', t, j, 1);
    else if (kind === 'land') hit('drop', t, 1, 1);
    else if (kind === 'lift') hit('drop', t, 1.5, 0.21);
    else if (kind === 'set') { hit('click', t, j, 0.52); hit('drop', t + 0.006, 1, 0.63); }
    else if (kind === 'swap') { hit('drop', t, 1, 0.22); hit('drop', t + 0.09, 1.5, 0.17); }
  }



  /* ── touch: a finger or a pen feels what a pointer hears ── */
  var VIB = { pass: 7, land: 16, lift: 12, set: [9, 34, 12], swap: 12 };
  var lastBuzz = 0;
  // Safari has no vibration API. Toggling a system switch makes iOS tick, and
  // that is the only touch feedback a page can reach there, but only inside a
  // tap: toggled off the clock, as the glass passed a pane or landed after a
  // glide, it never ticked on an iPhone. So it is toggled in the handlers of a
  // tap itself, once as a finger lets go of the picture and once as a
  // selector or the switch is tapped, and never for the moments in between.
  function iosTick() {
    try {
      var l = document.createElement('label'), i = document.createElement('input');
      i.type = 'checkbox'; i.setAttribute('switch', '');
      l.setAttribute('aria-hidden', 'true'); l.style.display = 'none';
      l.appendChild(i); document.head.appendChild(l); l.click(); l.remove();
    } catch (err) { /* not available */ }
  }
  function tapTick(type) {
    if (isIOS && (type === 'touch' || type === 'pen')) iosTick();
  }
  function buzz(kind, type) {
    if (type !== 'touch' && type !== 'pen') return;
    var now = performance.now();
    if (kind === 'pass' && now - lastBuzz < 35) return;   // ticks this close blur into a buzz
    lastBuzz = now;
    if (typeof navigator.vibrate === 'function' && !isIOS) {
      try { navigator.vibrate(VIB[kind] || 8); } catch (err) { /* not allowed here */ }
    }
  }

  function setup(root) {
    if (root.__glassGrades) return;
    var frame = root.querySelector('.glass-grades__frame');
    var panesEl = root.querySelector('.glass-grades__panes');
    var radios = Array.prototype.slice.call(root.querySelectorAll('.glass-grades__radio'));
    var panes = Array.prototype.slice.call(root.querySelectorAll('.glass-grades__pane'));
    var names = Array.prototype.slice.call(root.querySelectorAll('.glass-grades__name'));
    var sides = Array.prototype.slice.call(root.querySelectorAll('.glass-grades__switch-radio'));
    var stripSide = sides.filter(function (s) { return s.value === 'strip'; })[0];
    var paneSide = sides.filter(function (s) { return s.value === 'pane'; })[0];
    var file = root.querySelector('.glass-grades__file');
    var live = root.querySelector('.glass-grades__live');
    var note = root.querySelector('.glass-grades__tag--note');
    if (!frame || !radios.length) return;
    root.__glassGrades = true;
    root.classList.add('glass-grades--live');

    var N = radios.length;
    var lastType = 'mouse';
    root.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; lastActive = root; }, true);
    root.addEventListener('keydown', function () { lastType = 'key'; }, true);
    root.addEventListener('focusin', function () { lastActive = root; });
    // Safari starts audio only inside a press or a key, and the first sound
    // here usually comes mid-drag or as a glide lands, outside both. So with
    // the sound on, the context is made, or woken, in the gesture itself.
    function wake() {
      if (audio.ctx && audio.ctx.state === 'running') return;
      if (num('--glass-grades-click', 0, 0, 1) > 0) ensureAudio();
    }
    root.addEventListener('pointerdown', wake, true);
    root.addEventListener('pointerup', wake, true);
    root.addEventListener('keydown', wake, true);

    function read(prop) { return getComputedStyle(root).getPropertyValue(prop).trim(); }
    function num(prop, fallback, lo, hi) {
      var v = parseFloat(read(prop));
      if (!isFinite(v)) v = fallback;
      return Math.min(hi, Math.max(lo, v));
    }
    function ms(prop, fallback) {
      var s = read(prop), v = parseFloat(s);
      if (!isFinite(v)) return fallback;
      return /ms$/.test(s) ? v : /s$/.test(s) ? v * 1000 : v;
    }
    function checkedIndex() {
      for (var i = 0; i < N; i++) if (radios[i].checked) return i;
      return 0;
    }
    function feedback(kind, type) {
      play(kind, num('--glass-grades-click', 0, 0, 1));
      buzz(kind, type);
    }

    /* ── p: the stylesheet's number, driven ── */
    var p = checkedIndex();
    var driven = false;
    // Written on the three parts that read p rather than on the root: a custom
    // property set on the root restyles everything under it, the selectors'
    // swatches included, on every frame of a drag. Measured over the same
    // 120-step drag: 1.9s of style recalculation written on the root, 1.3s
    // written on these three.
    var readers = [panesEl, root.querySelector('.glass-grades__scale'), root.querySelector('.glass-grades__track')]
      .filter(Boolean);
    function nearest(x) { return Math.max(0, Math.min(N - 1, Math.round(x))); }
    function drive(x) {
      if (!driven) { driven = true; root.classList.add('glass-grades--driven'); }
      var v = x.toFixed(4);
      readers.forEach(function (el) { el.style.setProperty('--glass-grades-p', v); });
      if (panesEl && glintDirty) {
        panesEl.style.setProperty('--glass-grades-glint', glint.toFixed(3));
        glintDirty = false;
      }
    }
    // The readout, the scale and the selectors follow the checked radio, so
    // while a hand moves the glass the nearest pane is the checked one.
    function mark(i) { if (!radios[i].checked) radios[i].checked = true; }
    function labelOf(i) {
      var l = radios[i].closest('.glass-grades__chip').querySelector('.glass-grades__label');
      return l ? l.textContent.trim() : radios[i].value;
    }
    function descOf(i) {
      var d = names[i] && names[i].querySelector('.glass-grades__desc');
      return d ? d.textContent.trim() : '';
    }
    // Back to the stylesheet: the checked radio says the same number, so
    // nothing moves when the inline value comes off.
    function release() {
      var i = nearest(p);
      p = i;
      mark(i);
      root.classList.remove('glass-grades--driven');
      readers.forEach(function (el) { el.style.removeProperty('--glass-grades-p'); });
      driven = false;
      glintOff();
      if (live) live.textContent = labelOf(i) + '. ' + descOf(i) + '.';
      centre(i);
    }
    // Where the rail scrolls, as it does on a phone, the chosen selector is
    // brought to its middle when the glass lands. Only the rail moves, never
    // the page.
    var rail = root.querySelector('.glass-grades__rail');
    function centre(i) {
      if (!rail || rail.scrollWidth <= rail.clientWidth + 1) return;
      var chip = radios[i].closest('.glass-grades__chip').getBoundingClientRect();
      var box = rail.getBoundingClientRect();
      var left = rail.scrollLeft + (chip.left - box.left) - (rail.clientWidth - chip.width) / 2;
      rail.scrollTo({ left: Math.max(0, left), behavior: reduce.matches ? 'auto' : 'smooth' });
    }

    /* ── the glide: how the glass gets to a pane ──
       A cubic-bezier over time, read from --glass-grades-glide, the curve the
       stylesheet's own transition uses, so the glass moves the same way with
       script and without, and it never passes its pane. It replaced a spring
       that overshot by 6% and came back: a bounce on every landing. The curve
       slows from its first frame, because one that eases in, as the sheet
       curve (.32, .72, 0, 1) does, has to catch up: worked out on that curve,
       a glass let go at 3.6 panes a second was at 11.8 a tenth of a second on.
       A glide that starts while the glass is moving, a release from a drag
       above all, leaves at the speed the glass already has, so a hand letting
       go is never jolted: the curve's first control point is set to that
       speed, and the second stays the token's, so every glide arrives the
       same way. One from rest is the token's curve exactly. */
    var glide = { raf: 0, from: 0, to: 0, d: 0, t0: 0, dur: 560, c: [0.25, 1, 0.5, 1], landed: false, type: 'mouse', follow: true };
    var EASE = { ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1], linear: [0, 0, 1, 1] };
    function curve() {
      var s = read('--glass-grades-glide'), m = /cubic-bezier\(([^)]*)\)/.exec(s);
      var c = m ? m[1].split(',').map(parseFloat) : (EASE[s] || []).slice();
      if (c.length !== 4 || c.some(function (n) { return !isFinite(n); })) c = [0.25, 1, 0.5, 1];
      c[0] = Math.min(1, Math.max(0, c[0]));
      c[2] = Math.min(1, Math.max(0, c[2]));
      return c;
    }
    // One axis of a cubic-bezier from (0, 0) to (1, 1), and its slope.
    function bz(a, b, t) { var u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t; }
    function dbz(a, b, t) { var u = 1 - t; return 3 * u * u * a + 6 * u * t * (b - a) + 3 * t * t * (1 - b); }
    // The curve's parameter at time x: Newton's method, then halving where it stalls.
    function solve(c, x) {
      var t = x;
      for (var i = 0; i < 8; i++) {
        var e = bz(c[0], c[2], t) - x, d = dbz(c[0], c[2], t);
        if (Math.abs(e) < 1e-7) return t;
        if (Math.abs(d) < 1e-6) break;
        t = Math.min(1, Math.max(0, t - e / d));
      }
      var lo = 0, hi = 1;
      for (var j = 0; j < 40; j++) { t = (lo + hi) / 2; if (bz(c[0], c[2], t) < x) lo = t; else hi = t; }
      return t;
    }
    // The glass's speed on the curve, in panes a second.
    function speedAt(t) {
      var dx = dbz(glide.c[0], glide.c[2], t), dy = dbz(glide.c[1], glide.c[3], t);
      if (dx < 1e-4) { t = Math.min(1, t + 1e-3); dx = dbz(glide.c[0], glide.c[2], t); dy = dbz(glide.c[1], glide.c[3], t); }
      return dx > 0 ? glide.d * (dy / dx) / (glide.dur / 1000) : 0;
    }
    function speedNow() {
      if (!glide.raf) return 0;
      var x = glide.t0 ? Math.min(1, Math.max(0, (performance.now() - glide.t0) / glide.dur)) : 0;
      return speedAt(solve(glide.c, x));
    }
    // Every stop crossed is a tick; the arrival at the target is a landing.
    function moveTo(next, why) {
      var prev = p;
      p = next;
      if (why && prev !== next) {
        var lo = Math.min(prev, next), hi = Math.max(prev, next);
        for (var n = Math.ceil(lo - 1e-9); n <= hi + 1e-9; n++) {
          if (n < 0 || n > N - 1 || Math.abs(n - prev) < 1e-9) continue;
          if (why.glide && n === glide.to) {
            if (!glide.landed) { glide.landed = true; feedback('land', why.type); }
          } else feedback('pass', why.type);
        }
      }
      drive(p);
      if (!why || why.follow !== false) mark(nearest(p));
    }
    function stopGlide() {
      if (glide.raf) cancelAnimationFrame(glide.raf);
      glide.raf = 0;
    }
    // v0 is the speed to leave at, in panes a second: a release passes the
    // hand's. Left out, a glide keeps the speed of the one it replaces, and
    // from rest it is the token's curve.
    function glideTo(t, v0, type, follow) {
      t = nearest(t);
      var matched = v0 != null || !!glide.raf;
      if (v0 == null) v0 = speedNow();
      stopGlide();
      glide.to = t;
      glide.landed = false;
      glide.type = type;
      glide.follow = follow !== false;
      if (reduce.matches || Math.abs(p - t) < 1e-4) {
        moveTo(t, { glide: true, type: type, follow: glide.follow });
        release();
        return;
      }
      var d = t - p, c = curve();
      // A little longer over more panes and less over part of one: a fourth
      // root of the distance, 0.6 to 1.6 times the token.
      var dur = ms('--glass-grades-glide-time', 560) * Math.min(1.6, Math.max(0.6, Math.pow(Math.abs(d), 0.25)));
      if (matched) {
        // The slope the curve has to leave at. y1 over x1 is that slope, so
        // x1 stays the token's and y1 moves; a speed x1 cannot reach without
        // y1 passing 1, and the glass its pane, pulls x1 in instead. Leaving
        // away from the pane, y1 goes below 0: the glass carries on a little
        // the way the hand was going, and turns.
        var s = v0 * (dur / 1000) / d, x1 = Math.max(0.1, c[0]);
        if (s * x1 <= 1) { c[0] = x1; c[1] = Math.max(-1, s * x1); }
        else { c[1] = 1; c[0] = Math.max(0.02, 1 / s); }
      }
      glide.from = p;
      glide.d = d;
      glide.c = c;
      glide.dur = Math.max(1, dur);
      glide.t0 = 0;
      glide.raf = requestAnimationFrame(step);
    }
    function step(now) {
      if (!root.isConnected) { glide.raf = 0; return; }
      var why = { glide: true, type: glide.type, follow: glide.follow };
      // Timed from a frame before the first, so the frame that follows a
      // release already moves: a frame's time is when it began, and the
      // release that started the glide came after that, so timed from the
      // release the glass stood still for one frame as the hand let go.
      if (!glide.t0) glide.t0 = now - 16;
      var x = Math.min(1, Math.max(0, (now - glide.t0) / glide.dur));
      if (x >= 1) {
        glide.raf = 0;
        moveTo(glide.to, why);
        if (!glide.landed) { glide.landed = true; feedback('land', glide.type); }
        release();
        return;
      }
      var t = solve(glide.c, x), at = glide.from + glide.d * bz(glide.c[1], glide.c[3], t);
      glintFrom(speedAt(t));
      moveTo(at, why);
      // The seat is heard as the glass arrives, not when the curve's long
      // tail runs out: within a hundredth of a pane of its stop.
      if (!glide.landed && Math.abs(glide.to - at) < 0.01) { glide.landed = true; feedback('land', glide.type); }
      glide.raf = requestAnimationFrame(step);
    }

    /* ── the edges catch the light while the glass moves ──
       Written in the same call that moves the glass, never on a loop of its
       own: as a second animation loop beside the drag it tripled the drag's
       style work, 1.2s against 0.4s over the same 120 steps. The fade back is
       the stylesheet's opacity transition. */
    var glint = 0, glintDirty = false, glintIdle = 0;
    function glintFrom(v) {
      if (reduce.matches || !panesEl) return;
      var g = Math.min(1, Math.abs(v) / 5);
      if (Math.abs(g - glint) < 0.03) return;
      glint = g;
      glintDirty = true;
      clearTimeout(glintIdle);
      glintIdle = setTimeout(glintOff, 140);   // a hand holding still lets the light go
    }
    function glintOff() {
      clearTimeout(glintIdle);
      glint = 0;
      glintDirty = false;
      if (panesEl) panesEl.style.removeProperty('--glass-grades-glint');
    }
    // Once, on its own: the light catching the edges as the glass is lifted or loaded.
    function glintFlash() {
      if (reduce.matches || !panesEl) return;
      panesEl.style.setProperty('--glass-grades-glint', '1');
      clearTimeout(glintIdle);
      glintIdle = setTimeout(glintOff, 260);
    }

    /* ── strip and pane ── */
    function isStrip() { return !!(stripSide && stripSide.checked); }
    function openView() { if (isStrip() && paneSide) paneSide.checked = true; }
    function switchView() {
      if (stripSide && paneSide) (isStrip() ? paneSide : stripSide).checked = true;
    }

    /* ── lifting the glass ──
       Held, for as long as a press or Space is; or latched, by a tap on the
       open pane or by Enter, until the next tap or Enter, a drag or a change
       of light. The latch is the way to compare that needs no timing. */
    var latched = false;
    function lifted() { return root.classList.contains('glass-grades--lifted'); }
    function lift(on, type, say) {
      if (!on) latched = false;
      if (on === lifted()) return;
      root.classList.toggle('glass-grades--lifted', on);
      feedback(on ? 'lift' : 'set', type);
      if (on) glintFlash();
      if (say && live) live.textContent = on ? msg('lifted') : msg('down') + ' ' + labelOf(nearest(p)) + '.';
    }

    /* ── the drag: relative, detented, with a flick ── */
    var ptr = null, holdTimer = 0;
    function notch(x, k) { return x - k * Math.sin(2 * Math.PI * x) / (2 * Math.PI); }
    function unnotch(y, k) {
      var x = y;
      for (var i = 0; i < 8; i++) x -= (notch(x, k) - y) / Math.max(0.15, 1 - k * Math.cos(2 * Math.PI * x));
      return x;
    }
    function rubber(x) { return x < 0 ? x * 0.3 : x > N - 1 ? (N - 1) + (x - (N - 1)) * 0.3 : x; }
    function unrubber(y) { return y < 0 ? y / 0.3 : y > N - 1 ? (N - 1) + (y - (N - 1)) / 0.3 : y; }
    // How far the moving edge travels while the glass goes one pane: the open
    // pane's width less a sliver. One pane of drag is that distance divided
    // by --glass-grades-drag, so at 1 the edge stays under the hand. It was a
    // fixed clamp(56px, 26% of the window, 170px), which at 1440 moved the
    // edge 2.2 times as far as the hand. Covering ground fast is the flick's
    // job. open is read where the panes are, because a narrow window changes
    // it below the root.
    function travel() {
      var open = parseFloat(getComputedStyle(panesEl || frame).getPropertyValue('--glass-grades-open'));
      if (!isFinite(open)) open = 0.62;
      open = Math.min(1, Math.max(0.05, open));
      var sliver = N > 1 ? (1 - open) / (N - 1) : 0;
      return Math.max(24, (open - sliver) * frame.clientWidth);
    }

    // A press catches moving glass. If it then neither drags nor picks
    // another pane, the glass lands where it was nearest, rather than being
    // left between two stops.
    frame.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || ptr) return;
      ptr = { id: e.pointerId, type: e.pointerType || 'mouse', x0: e.clientX, y0: e.clientY, raw0: 0, k: 0, step: 1,
              moved: false, held: false, caught: !!glide.raf, samples: [] };
      stopGlide();
      try { frame.setPointerCapture(e.pointerId); } catch (err) { /* fine without it */ }
      if (!latched) holdTimer = setTimeout(function () {
        if (ptr && !ptr.moved) { ptr.held = true; lift(true, ptr.type); }
      }, ms('--glass-grades-hold', 320));
    });
    frame.addEventListener('pointermove', function (e) {
      if (!ptr || e.pointerId !== ptr.id) return;
      if (!ptr.moved) {
        var dx = e.clientX - ptr.x0, dy = e.clientY - ptr.y0;
        if (Math.hypot(dx, dy) < (ptr.type === 'mouse' ? 4 : 8)) return;
        var sideways = Math.abs(dx) >= Math.abs(dy);
        if (ptr.type !== 'mouse' && !sideways) return;   // a vertical swipe is the page's
        // Lifted, held or latched: a sideways move sets the glass down and
        // becomes a drag. The hand was looking, and now it is moving it.
        if (lifted()) {
          if (!sideways) return;
          ptr.held = false;
          lift(false, ptr.type);
        }
        ptr.moved = true;
        clearTimeout(holdTimer);
        frame.classList.add('glass-grades__frame--dragging');
        if (isStrip()) { p = nearest(p); openView(); }   // dragging from the strip opens it
        ptr.k = num('--glass-grades-notch', 0.55, 0, 0.95);
        ptr.step = travel() / num('--glass-grades-drag', 1, 0.25, 4);   // drag distance per pane
        ptr.x0 = e.clientX;
        ptr.raw0 = unnotch(unrubber(p), ptr.k);
      }
      var raw = ptr.raw0 - (e.clientX - ptr.x0) / ptr.step;
      ptr.samples.push({ t: e.timeStamp, raw: raw });
      while (ptr.samples.length > 2 && e.timeStamp - ptr.samples[0].t > 90) ptr.samples.shift();
      var s = ptr.samples, span = s.length > 1 ? (s[s.length - 1].t - s[0].t) / 1000 : 0;
      if (span > 0) glintFrom((s[s.length - 1].raw - s[0].raw) / span);
      moveTo(rubber(notch(raw, ptr.k)), { type: ptr.type });
    });
    function endPointer(e, cancelled) {
      if (!ptr || e.pointerId !== ptr.id) return;
      clearTimeout(holdTimer);
      var P = ptr;
      ptr = null;
      frame.classList.remove('glass-grades__frame--dragging');
      if (!P.moved) {
        if (P.held) lift(false, P.type);
        else if (!cancelled) tapAt(e.clientX, P.type, P.caught);
        if (driven && !glide.raf) glideTo(nearest(p), 0, P.type, true);
        return;
      }
      var v = 0, vp = 0, s = P.samples;
      if (!cancelled && s.length > 1 && e.timeStamp - s[s.length - 1].t < 80) {
        var dt = (s[s.length - 1].t - s[0].t) / 1000;
        if (dt > 0) {
          v = (s[s.length - 1].raw - s[0].raw) / dt;
          // The glass's own speed as it is let go, through the notch, which
          // the glide leaves at: over the last 50ms, as the 90ms the flick is
          // judged on lags a hand that is speeding up or slowing down.
          var a = s.length - 2;
          while (a > 0 && s[s.length - 1].t - s[a - 1].t <= 50) a--;
          var lastS = s[s.length - 1], span = (lastS.t - s[a].t) / 1000;
          if (span > 0) vp = (rubber(notch(lastS.raw, P.k)) - rubber(notch(s[a].raw, P.k))) / span;
        }
      }
      // Projected ahead, so a flick coasts; three panes at most from where
      // the glass is. With the drag direct, a pane is 2.2 times the hand's
      // distance it used to be, so the projection grew from 0.2s to match.
      // Only a flick is projected: a hand let go slower than
      // --glass-grades-flick-min, in px a second over the last 90ms, lands
      // the glass on the pane it is nearest, however close to halfway it was,
      // so a slow release never coasts on.
      var here = nearest(p);
      var ahead = ms('--glass-grades-flick', 400) / 1000;
      var flung = Math.abs(v) * P.step >= num('--glass-grades-flick-min', 400, 0, 10000);
      var target = flung ? Math.max(here - 3, Math.min(here + 3, Math.round(p + v * ahead))) : here;
      glideTo(target, vp, P.type, true);
    }
    frame.addEventListener('pointerup', function (e) {
      if (ptr && e.pointerId === ptr.id) tapTick(ptr.type);
      endPointer(e, false);
    });
    frame.addEventListener('pointercancel', function (e) { endPointer(e, true); });
    frame.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function paneAt(clientX) {
      var i = 0;
      for (; i < N - 1; i++) {
        var r = panes[i] && panes[i].getBoundingClientRect();
        if (r && clientX < r.right) break;
      }
      return i;
    }
    // A tap opens the pane it lands on. On the pane already open, glass at
    // rest, it lifts the glass off, and the next tap anywhere puts it back.
    function tapAt(clientX, type, caught) {
      if (latched) { lift(false, type, true); return; }
      var i = paneAt(clientX);
      if (!isStrip() && !caught && i === nearest(p)) {
        lift(true, type, true);
        latched = true;
        return;
      }
      openView();
      drive(p);   // hold the glass before the radio moves, or the stylesheet starts its own transition
      mark(i);
      glideTo(i, null, type, false);
    }

    /* ── keys: the window steps and lifts; the rail is a radio group ── */
    frame.addEventListener('keydown', function (e) {
      var from = glide.raf ? glide.to : nearest(p);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (latched) lift(false, 'key');
        openView();
        var t = nearest(from + (e.key === 'ArrowRight' ? 1 : -1));
        drive(p);
        mark(t);
        glideTo(t, null, 'key', false);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        if (latched) lift(false, 'key');
        var end = e.key === 'Home' ? 0 : N - 1;
        drive(p);
        mark(end);
        glideTo(end, null, 'key', false);
      } else if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        if (!lifted()) lift(true, 'key', true);
      } else if (e.key === 'Enter' && !e.repeat) {
        // The latch, for a hand that cannot hold a key down.
        e.preventDefault();
        if (lifted()) lift(false, 'key', true);
        else { lift(true, 'key', true); latched = true; }
      } else if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        switchView();
      }
    });
    frame.addEventListener('keyup', function (e) {
      if (e.key === ' ') { e.preventDefault(); if (!latched) lift(false, 'key', true); }
    });
    frame.addEventListener('blur', function () { if (!ptr) lift(false, 'key'); });
    radios.forEach(function (r, i) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        tapTick(lastType);
        if (latched) lift(false, lastType);
        // The stylesheet has already been told; hold p where the glass is
        // and glide from there, so the move ticks like any other.
        drive(p);
        glideTo(i, null, lastType, false);
      });
    });
    sides.forEach(function (side) {
      side.addEventListener('change', function () { if (side.checked) tapTick(lastType); });
    });

    /* ── a picture of your own: picked, dropped or pasted ── */
    var current = null, noteTimer = 0;
    function tell(text) {
      if (!note) return;
      note.textContent = text;
      note.classList.add('glass-grades__tag--on');
      clearTimeout(noteTimer);
      noteTimer = setTimeout(function () { note.classList.remove('glass-grades__tag--on'); }, 2600);
    }
    function load(f, type) {
      if (!f || !/^image\//.test(f.type)) { tell(msg('notImage')); return; }
      var shrink = window.createImageBitmap
        ? createImageBitmap(f, { imageOrientation: 'from-image' }).then(function (bmp) {
          // A full-size camera file is shrunk once, so fifteen copies of it stay quick.
          var s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
          var cv = document.createElement('canvas');
          cv.width = Math.round(bmp.width * s);
          cv.height = Math.round(bmp.height * s);
          cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
          if (bmp.close) bmp.close();
          return new Promise(function (res) { cv.toBlob(res, 'image/jpeg', 0.92); });
        })
        : Promise.reject();
      shrink.then(function (blob) {
        if (!blob) throw new Error('no blob');
        return URL.createObjectURL(blob);
      }, function () {
        return URL.createObjectURL(f);   // a format the canvas cannot take is used as it came
      }).then(function (url) {
        var probe = new Image();
        probe.src = url;
        return (probe.decode ? probe.decode() : Promise.resolve()).then(function () {
          swap(url, probe.naturalWidth / probe.naturalHeight || 1.5, type);
        }, function () {
          URL.revokeObjectURL(url);
          tell(msg('cannot'));
        });
      }).catch(function () { tell(msg('cannot')); });
    }
    function swap(url, ratio, type, alt) {
      feedback('swap', type);
      root.classList.add('glass-grades--swapping');
      setTimeout(function () {
        Array.prototype.forEach.call(root.querySelectorAll('.glass-grades__base, .glass-grades__img'), function (im) { im.src = url; });
        var base = root.querySelector('.glass-grades__base');
        if (base) base.alt = alt != null ? alt : msg('alt');
        root.style.setProperty('--glass-grades-ratio', Math.max(0.66, Math.min(2.2, ratio)).toFixed(4));
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { root.classList.remove('glass-grades--swapping'); });
        });
        if (current) URL.revokeObjectURL(current);
        current = /^blob:/.test(url) ? url : null;
      }, reduce.matches ? 0 : ms('--glass-grades-swap-out', 110));
    }
    root.__glassGradesLoad = load;

    /* A picture handed in by its address, by a page that offers pictures of
       its own: it slides in the way a picked one does, and is named by the
       alt it comes with.
         root.dispatchEvent(new CustomEvent('glass-grades:picture',
           { detail: { src: 'photos/sea.jpg', alt: 'Pink clouds over the sea' } })); */
    root.addEventListener('glass-grades:picture', function (e) {
      var d = e.detail || {};
      if (!d.src) return;
      var probe = new Image();
      probe.src = d.src;
      (probe.decode ? probe.decode() : Promise.resolve()).then(function () {
        swap(d.src, probe.naturalWidth / probe.naturalHeight || 1.5, d.type || lastType, d.alt);
      }, function () { tell(msg('cannot')); });
    });

    /* ── saving the picture through the open pane ──
       The same layers on a canvas, at the picture's own size: the picture on
       its paper through the pane's filter, its toe in screen, its shoulder in
       multiply and its grain in overlay. Every value is read off the pane as
       the browser computed it, so a recipe, or a grade re-set from outside,
       is saved as it is seen. The grain is the stylesheet's own noise, drawn
       as large against the picture as it is on screen. Over file:// the
       folder's own picture cannot be read back off a canvas; a picture of
       your own can.
       Where a canvas takes no filter, Safari on every iPhone among them, the
       filter is done by hand, the arithmetic the CSS functions are defined
       by, on the picture's pixels; the three blends are the canvas's own. */
    var saveBtn = root.querySelector('.glass-grades__btn--save');
    var canFilter = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype;
    if (saveBtn && typeof CanvasRenderingContext2D !== 'undefined') {
      root.classList.add('glass-grades--saves');
      saveBtn.addEventListener('click', function () { save(checkedIndex()); });
    }
    // brightness(), contrast() and saturate() as Filter Effects defines them,
    // in the order the filter names them, each clamped.
    function filterByHand(ctx, w, h, filter) {
      var steps = [], re = /(brightness|contrast|saturate)\(([^)]+)\)/g, m;
      while ((m = re.exec(filter))) steps.push([m[1], parseFloat(m[2])]);
      if (!steps.length) return;
      var img = ctx.getImageData(0, 0, w, h), d = img.data;
      var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
      for (var i = 0; i < d.length; i += 4) {
        var r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        for (var k = 0; k < steps.length; k++) {
          var f = steps[k][0], v = steps[k][1];
          if (!isFinite(v)) continue;
          if (f === 'brightness') { r = cl(r * v); g = cl(g * v); b = cl(b * v); }
          else if (f === 'contrast') { r = cl((r - 0.5) * v + 0.5); g = cl((g - 0.5) * v + 0.5); b = cl((b - 0.5) * v + 0.5); }
          else {
            var R = (0.213 + 0.787 * v) * r + (0.715 - 0.715 * v) * g + (0.072 - 0.072 * v) * b;
            var G = (0.213 - 0.213 * v) * r + (0.715 + 0.285 * v) * g + (0.072 - 0.072 * v) * b;
            var B = (0.213 - 0.213 * v) * r + (0.715 - 0.715 * v) * g + (0.072 + 0.928 * v) * b;
            r = cl(R); g = cl(G); b = cl(B);
          }
        }
        d[i] = Math.round(r * 255); d[i + 1] = Math.round(g * 255); d[i + 2] = Math.round(b * 255);
      }
      ctx.putImageData(img, 0, 0);
    }
    var noiseImg = null;
    function noise() {
      if (noiseImg) return noiseImg;
      var m = /url\((['"]?)(.*?)\1\)/.exec(read('--glass-grades-noise'));
      noiseImg = new Promise(function (res) {
        if (!m) { res(null); return; }
        var im = new Image();
        im.onload = function () { res(im); };
        im.onerror = function () { res(null); };
        im.src = m[2];
      });
      return noiseImg;
    }
    function grainPattern(ctx, im, tile) {
      if (!im) return null;
      var t = document.createElement('canvas');
      t.width = t.height = Math.max(8, Math.round(tile));
      var tx = t.getContext('2d');
      try {
        tx.drawImage(im, 0, 0, t.width, t.height);
        tx.getImageData(0, 0, 1, 1);   // a noise that would taint the picture is left off
      } catch (err) { return null; }
      return ctx.createPattern(t, 'repeat');
    }
    function save(i) {
      var pane = panes[i], base = root.querySelector('.glass-grades__base');
      if (!pane || !base || !base.naturalWidth) return;
      var media = pane.querySelector('.glass-grades__media');
      var m = getComputedStyle(media);
      var w = base.naturalWidth, h = base.naturalHeight;
      var flat = document.createElement('canvas');
      flat.width = w; flat.height = h;
      var fx = flat.getContext('2d');
      fx.fillStyle = m.backgroundColor;
      fx.fillRect(0, 0, w, h);
      fx.drawImage(base, 0, 0, w, h);
      var out = document.createElement('canvas');
      out.width = w; out.height = h;
      var ctx = out.getContext('2d');
      var wanted = m.filter && m.filter !== 'none' ? m.filter : 'none';
      // A canvas that says it takes a filter and then keeps none, as WebKit's
      // can off the page, is done by hand like one that does not.
      var byHand = !canFilter;
      if (!byHand) {
        ctx.filter = wanted;
        if (wanted !== 'none' && ctx.filter === 'none') byHand = true;
      }
      ctx.drawImage(flat, 0, 0);
      ctx.filter = 'none';
      if (byHand && wanted !== 'none') {
        try { filterByHand(ctx, w, h, wanted); }
        catch (err) { tell(msg(err && err.name === 'SecurityError' ? 'ownOnly' : 'unsaved')); return; }
      }
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = getComputedStyle(pane.querySelector('.glass-grades__toe')).backgroundColor;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = getComputedStyle(pane.querySelector('.glass-grades__shoulder')).backgroundColor;
      ctx.fillRect(0, 0, w, h);
      var grain = parseFloat(getComputedStyle(pane.querySelector('.glass-grades__grain')).opacity) || 0;
      var name = 'glass-grades-' + (radios[i].value || i) + '.jpg';
      (grain > 0 ? noise() : Promise.resolve(null)).then(function (im) {
        var tile = parseFloat(read('--glass-grades-grain-size')) * w / Math.max(1, frame.clientWidth);
        var pattern = grain > 0 ? grainPattern(ctx, im, tile) : null;
        if (pattern) {
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = Math.min(1, grain);
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1;
        }
        ctx.globalCompositeOperation = 'source-over';
        try {
          out.toBlob(function (blob) {
            if (!blob) { tell(msg('unsaved')); return; }
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = name; a.hidden = true;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          }, 'image/jpeg', 0.92);
        } catch (err) {
          tell(msg(err && err.name === 'SecurityError' ? 'ownOnly' : 'unsaved'));
        }
      });
    }

    if (file) {
      file.addEventListener('change', function () {
        var f = file.files && file.files[0];
        if (f) load(f, lastType);
        file.value = '';
      });
    }
    var depth = 0;
    function carriesFiles(e) {
      return !!e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') !== -1;
    }
    root.addEventListener('dragenter', function (e) {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      depth++;
      root.classList.add('glass-grades--dropping');
    });
    root.addEventListener('dragover', function (e) {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    root.addEventListener('dragleave', function (e) {
      if (!carriesFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (!depth) root.classList.remove('glass-grades--dropping');
    });
    root.addEventListener('drop', function (e) {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      depth = 0;
      root.classList.remove('glass-grades--dropping');
      lastActive = root;
      load(Array.prototype.filter.call(e.dataTransfer.files, function (f) { return /^image\//.test(f.type); })[0], 'mouse');
    });

    // The edges catch the light once, so the glass says what it is.
    setTimeout(glintFlash, 350);
  }

  // A pasted picture goes to the instance last touched, or the first one.
  document.addEventListener('paste', function (e) {
    var items = (e.clipboardData && e.clipboardData.items) || [];
    var item = Array.prototype.filter.call(items, function (i) { return /^image\//.test(i.type); })[0];
    if (!item) return;
    var target = (lastActive && lastActive.isConnected) ? lastActive : document.querySelector('.glass-grades--live');
    if (!target || !target.__glassGradesLoad) return;
    e.preventDefault();
    target.__glassGradesLoad(item.getAsFile(), 'key');
  });

  /* ── the two recordings the sound plays: Kenney's click_003 and drop_003,
        from Interface Sounds (CC0), mono 16-bit little-endian at 24kHz, which
        keeps all either has: above 8kHz both are 80dB down. The drop is cut
        at 118ms under a 30ms fade, where it reaches the recording's noise
        floor. ── */
  var SAMPLE_RATE = 24000;
  var SAMPLES = {
    click: 'nwGXIdA2lznTKVsOR/KX4Izfdu6kBise6CvsKiEcsgWX8MnkJ+ZR83QGyBe2IE4eGxJQAYPyC+sr7XD3cwW+EesXHRZxDXIB'
      + 'mfau8HPxKfj4ATcLqhCfEGgLIQPF+in1CvR79wb+QwWxCpMMfQpVBfr+kfnS9nf3FftLAEsFeAjpCJ8GdQLP/Sb6kPhf+Sz8'
      + '+v+KA8YFCAZsBJcBef4A/ND6HPum/OD+FAGlAjEDqwJVAaP/FP4T/dP8R/0u/jT/DgCVAMAAngBPAOn/ef8F/5X+Of4J/hr+'
      + 'c/4G/67/PgCOAIkAMwCp/xL/lf5O/kj+fP7V/jz/mf/b//v/9v/X/6b/cf9C/x//DP8K/xb/Lv9O/2//j/+o/7n/wP+//7b/'
      + 'qP+Z/4v/gf97/3z/gv+M/5r/qv+5/8X/z//W/9n/2v/a/9r/2//d/+D/5P/q/+//9f/7/w==',
    drop: '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'
      + '+//6//X/7P/j/9b/yP+5/6n/mf+K/3z/cP9m/17/Wv9Y/1r/Xv9m/3D/fP+J/5f/pv+2/8X/0//e/+j/8P/0//b/8//w/+j/'
      + '3//U/8j/u/+t/53/j/+C/3b/bf9n/2L/Yf9h/2b/bP92/4H/jP+Z/6f/tP/C/8//2f/k/+n/7v/v/+//6//m/93/0v/I/7z/'
      + 'r/+g/5X/iP9//3X/b/9s/2r/a/9u/3P/fP+F/4//nP+n/7T/wf/L/9b/3v/k/+n/6//q/+f/4v/a/9L/yP+9/7H/pv+a/4//'
      + 'h/9//3n/df9z/3T/dv97/4L/i/+U/57/qf+1/8D/yv/T/9v/4f/l/+f/5v/j/9//2f/R/8r/wP+2/6v/oP+X/47/h/+C/37/'
      + 'ff99/4D/hP+J/5L/mv+i/6z/t//A/8r/0v/Y/93/4f/k/+P/4v/e/9n/0v/L/8P/uv+w/6f/oP+X/5H/jP+I/4f/iP+J/43/'
      + 'kv+Y/5//qP+w/7n/wv/J/9H/2P/d/+D/4v/i/+D/3v/Z/9P/zf/G/77/tv+v/6f/of+a/5b/lP+S/5L/k/+W/5v/of+n/63/'
      + 'tf+9/8X/y//S/9f/3f/f/+H/4v/g/97/2v/V/9D/yv/D/7z/tf+w/6n/pf+g/57/nf+c/57/oP+k/6n/rv+z/7r/wf/H/87/'
      + '1P/Z/93/3//h/+H/4f/e/9z/2P/T/8//yP/C/73/t/+y/67/q/+o/6j/p/+p/6v/rv+x/7b/u//A/8b/zP/R/9b/2v/e/+D/'
      + '4f/i/+L/4P/d/9r/1//S/87/yf/E/8D/u/+4/7X/s/+y/7L/s/+1/7j/u/++/8P/x//M/9H/1v/Z/93/3//i/+P/4//j/+H/'
      + '3//c/9r/1v/S/87/yv/H/8P/wP+//7z/vP+8/73/v//B/8T/xv/K/87/0v/W/9r/3f/g/+L/5P/l/+X/5f/j/+L/4P/d/9r/'
      + '2P/U/9H/zv/L/8n/yP/G/8b/xv/H/8j/yv/N/8//0v/V/9j/2//f/+H/4//l/+f/5//n/+f/5v/l/+P/4f/f/93/2v/Y/9X/'
      + '0//S/9H/z//P/8//0P/R/9P/1f/X/9n/2//e/+D/4//l/+f/6P/p/+r/6v/q/+n/6P/n/+b/5P/i/+D/3v/d/9v/2v/Z/9j/'
      + '2P/Y/9j/2f/b/9z/3v/f/+H/4//l/+f/6f/q/+v/7P/t/+3/7f/s/+z/6//q/+n/5//m/+X/5P/i/+H/4P/g/+D/4P/g/+H/'
      + '4v/k/+T/5v/n/+n/6v/r/+3/7v/v//D/8P/w//D/8P/w/+//7v/t/+z/6//q/+r/6f/o/+j/5//n/+f/6P/o/+n/6v/r/+z/'
      + '7f/u/+//8P/x//L/8//z//T/9P/0//P/8//z//L/8v/x//D/8P/v/+//7v/u/+7/7v/u/+7/7//v//D/8f/x//L/8//0//T/'
      + '9f/2//b/9v/3//f/9//3//f/9v/2//b/9f/1//T/9P/0//P/8//z//P/9P/0//T/9P/1//X/9v/2//f/9//4//j/+f/5//n/'
      + '+v/6//r/+v/5//n/+f/5//n/+f/4//j/+P/4//j/+P/4//j/+P/4//n/+f/5//r/+v/6//v/+//7//v//P/8//z//P/8//z/'
      + '/P/8//z//P/8//z//P/7//v/+//7//v/+//8//z//P/8//z//P/9//3//f/9//3//f/+//7//v/+//7//v/+//7//v/+//7/'
      + '/v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//////////////w=='
  };

  function boot() { Array.prototype.forEach.call(document.querySelectorAll('.glass-grades'), setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
