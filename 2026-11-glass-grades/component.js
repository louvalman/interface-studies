/*
  Glass grades: what script adds to a component that already works without it.

  component.css opens, slides and labels every pane from the checked light and
  the Strip | Pane switch. This file drives the same number, --glass-grades-p,
  faster than a transition can: a drag that sticks near each stop, a flick
  that coasts, a glide that lands. Each stop passed ticks, in sound when
  --glass-grades-click is above 0 and in touch on a phone. A still press lifts
  the glass off the picture. A picture of your own can be picked, dropped or
  pasted. When the glass lands, p is handed back to the stylesheet, so at rest
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

  /* ── sound: one context per document, made on the first sound that has a
        volume above 0, never before. Every note is from one chord, C major,
        so the sounds agree with each other however they fall, and nothing
        is pitched in the top octaves, where a run of ticks tires the ear. ── */
  var C5 = 523.25, G5 = 784, C6 = 1046.5, G6 = 1568, C7 = 2093, E4 = 329.6;
  var audio = { ctx: null, out: null, room: null, noise: null };
  function ensureAudio() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      var c = audio.ctx = new AC(), sr = c.sampleRate;
      var comp = c.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      var top = c.createBiquadFilter();
      top.type = 'lowpass'; top.frequency.value = 6500; top.Q.value = 0.5;
      audio.out = c.createGain();
      audio.out.connect(top); top.connect(comp); comp.connect(c.destination);
      // A slight reverb: a dark tail of about a second, 14ms behind the sound
      // so the tap stays clear of it, and darker as it fades, the way air
      // takes the top off a real one.
      var len = Math.floor(sr * 1.2), pre = Math.floor(sr * 0.014), ir = c.createBuffer(2, len, sr);
      for (var ch = 0; ch < 2; ch++) {
        var r = ir.getChannelData(ch), lp = 0;
        for (var i = pre; i < len; i++) {
          var at = (i - pre) / sr;
          lp += (0.05 + 0.3 * Math.exp(-at / 0.2)) * (Math.random() * 2 - 1 - lp);
          r[i] = lp * Math.exp(-at / 0.15) * Math.min(1, at / 0.02);
        }
      }
      var conv = c.createConvolver();
      conv.buffer = ir;
      audio.room = c.createGain();
      audio.room.connect(conv); conv.connect(audio.out);
      var n = Math.floor(sr * 0.3), buf = c.createBuffer(1, n, sr), d = buf.getChannelData(0);
      for (var k = 0; k < n; k++) d[k] = Math.random() * 2 - 1;
      audio.noise = buf;
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  }
  // Where a sound goes: all of it to the output, and some to the reverb.
  function voice(wet) {
    var c = audio.ctx, v = c.createGain();
    v.connect(audio.out);
    if (wet > 0) { var s = c.createGain(); s.gain.value = wet; v.connect(s); s.connect(audio.room); }
    return v;
  }
  // A tap on thick glass: the note, a quiet octave, and a trace of a struck
  // plate's second mode, which is what makes it glass rather than a bell.
  // The upper two die first.
  function tap(t, f0, level, decay, wet, octave) {
    var c = audio.ctx, v = voice(wet);
    [[1, 1], [2, octave || 0.12], [2.756, 0.035]].forEach(function (m) {
      var o = c.createOscillator(), g = c.createGain(), d = decay / Math.sqrt(m[0]);
      o.frequency.value = f0 * m[0];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(m[1] * level, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(v);
      o.start(t); o.stop(t + d + 0.02);
    });
  }
  // Contact: a few milliseconds of noise, in the band a fingertip on glass makes.
  function touch(t, level, freq, len) {
    var c = audio.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = audio.noise; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.4;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(f); f.connect(g); g.connect(audio.out);
    s.start(t, Math.random() * 0.2); s.stop(t + len + 0.01);
  }
  // The glass seating: a short, low body, settling a little as it sounds.
  function body(t, level, from, to, dur, wet) {
    var c = audio.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(voice(wet));
    o.start(t); o.stop(t + dur + 0.02);
  }
  function air(t, level, from, to, dur, wet) {
    var c = audio.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = audio.noise; f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(voice(wet));
    s.start(t, Math.random() * 0.05); s.stop(t + dur + 0.02);
  }
  function play(kind, volume) {
    if (!(volume > 0)) return;
    var c = ensureAudio();
    if (!c) return;
    audio.out.gain.value = 1.2 * volume;
    var t = c.currentTime + 0.004;
    var j = 1 + (Math.random() - 0.5) * 0.012;   // a little variation, so a sweep never sounds mechanical, and little enough to stay in tune
    // The landing, the sound of choosing a grade, is the lowest note, and has
    // more of its octave than the others, because a phone's speaker plays
    // little of a note that low. The ticks on the way are all but dry, so a
    // run of them does not blur into the reverb.
    if (kind === 'pass') { touch(t, 0.025, 1600 * j, 0.004); tap(t, G5 * j, 0.13, 0.045, 0.06); }
    else if (kind === 'land') { body(t, 0.08, E4 * 1.04, E4 * 0.92, 0.07, 0.25); tap(t, C5 * j, 0.22, 0.24, 0.36, 0.35); touch(t, 0.015, 1500, 0.006); }
    else if (kind === 'lift') { air(t, 0.024, 500, 1600, 0.2, 0.38); tap(t + 0.06, C7 * j, 0.04, 0.09, 0.42); }
    else if (kind === 'set') { body(t, 0.085, E4, E4 * 0.88, 0.07, 0.25); tap(t, C6 * j, 0.13, 0.13, 0.36); tap(t + 0.026, G6 * j, 0.045, 0.08, 0.36); touch(t, 0.02, 1600, 0.008); }
    else if (kind === 'swap') { air(t, 0.019, 1600, 600, 0.16, 0.38); tap(t + 0.1, C6 * j, 0.06, 0.12, 0.42); tap(t + 0.19, G6 * j, 0.05, 0.16, 0.42); }
  }

  /* ── touch: a finger or a pen feels what a pointer hears ── */
  var VIB = { pass: 7, land: 16, lift: 12, set: [9, 34, 12], swap: 12 };
  var lastBuzz = 0;
  // Safari has no vibration API. Toggling a system switch makes iOS tick, and
  // that is the only touch feedback a page can reach there.
  function iosTick() {
    try {
      var l = document.createElement('label'), i = document.createElement('input');
      i.type = 'checkbox'; i.setAttribute('switch', '');
      l.setAttribute('aria-hidden', 'true'); l.style.display = 'none';
      l.appendChild(i); document.body.appendChild(l); l.click(); l.remove();
    } catch (err) { /* not available */ }
  }
  function buzz(kind, type) {
    if (type !== 'touch' && type !== 'pen') return;
    var now = performance.now();
    if (kind === 'pass' && now - lastBuzz < 35) return;   // ticks this close blur into a buzz
    lastBuzz = now;
    if (typeof navigator.vibrate === 'function' && !isIOS) {
      try { navigator.vibrate(VIB[kind] || 8); } catch (err) { /* not allowed here */ }
      return;
    }
    if (isIOS) iosTick();
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
    frame.addEventListener('pointerup', function (e) { endPointer(e, false); });
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
        if (latched) lift(false, lastType);
        // The stylesheet has already been told; hold p where the glass is
        // and glide from there, so the move ticks like any other.
        drive(p);
        glideTo(i, null, lastType, false);
      });
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
    function swap(url, ratio, type) {
      feedback('swap', type);
      root.classList.add('glass-grades--swapping');
      setTimeout(function () {
        Array.prototype.forEach.call(root.querySelectorAll('.glass-grades__base, .glass-grades__img'), function (im) { im.src = url; });
        var base = root.querySelector('.glass-grades__base');
        if (base) base.alt = msg('alt');
        root.style.setProperty('--glass-grades-ratio', Math.max(0.66, Math.min(2.2, ratio)).toFixed(4));
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { root.classList.remove('glass-grades--swapping'); });
        });
        if (current) URL.revokeObjectURL(current);
        current = url;
      }, reduce.matches ? 0 : ms('--glass-grades-swap-out', 110));
    }
    root.__glassGradesLoad = load;

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

  function boot() { Array.prototype.forEach.call(document.querySelectorAll('.glass-grades'), setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
