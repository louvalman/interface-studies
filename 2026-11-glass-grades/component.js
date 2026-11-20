/*
  Glass grades: what script adds to a component that already works without it.

  component.css opens, slides and labels every pane from the checked light and
  the Strip | Pane switch. This file drives the same number, --glass-grades-p,
  faster than a transition can: a drag that sticks near each stop, a flick
  that coasts, a spring that lands. Each stop passed ticks, in sound when
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
          lifted: 'Glass lifted: the picture as it is.', down: 'Glass back down:' },
    da: { notImage: 'Det er ikke et billede. Prøv JPEG, PNG eller HEIC.', cannot: 'Browseren kunne ikke åbne billedet.', alt: 'Dit billede',
          lifted: 'Glasset er løftet: billedet, som det er.', down: 'Glasset er lagt tilbage:' }
  };
  function msg(key) {
    var lang = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2);
    return (MSG[lang] || MSG.en)[key];
  }

  /* ── sound: one context per document, made on the first sound that has a
        volume above 0, never before ── */
  var audio = { ctx: null, out: null, noise: null };
  function ensureAudio() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio.ctx = new AC();
      var comp = audio.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      audio.out = audio.ctx.createGain();
      audio.out.connect(comp);
      comp.connect(audio.ctx.destination);
      var len = Math.floor(audio.ctx.sampleRate * 0.3);
      var buf = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      audio.noise = buf;
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  }
  // A struck pane: the first three modes of a free plate, the higher ones dying faster.
  function tink(t, f0, level, decay) {
    var c = audio.ctx;
    [[1, 0.5], [2.756, 0.22], [5.404, 0.1]].forEach(function (m) {
      var o = c.createOscillator(), g = c.createGain(), d = decay / Math.sqrt(m[0]);
      o.frequency.value = f0 * m[0];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(m[1] * level, t + 0.0015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(audio.out);
      o.start(t); o.stop(t + d + 0.02);
    });
  }
  // Contact: a few milliseconds of filtered noise.
  function click(t, level, hp, len) {
    var c = audio.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = audio.noise; f.type = 'highpass'; f.frequency.value = hp || 3200;
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (len || 0.004));
    s.connect(f); f.connect(g); g.connect(audio.out);
    s.start(t, Math.random() * 0.2); s.stop(t + (len || 0.004) + 0.01);
  }
  // The glass seating on the rail.
  function thock(t, level, from, to, dur) {
    var c = audio.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(audio.out);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function air(t, level, from, to, dur) {
    var c = audio.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = audio.noise; f.type = 'bandpass'; f.Q.value = 1.1;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(audio.out);
    s.start(t, Math.random() * 0.05); s.stop(t + dur + 0.02);
  }
  function play(kind, volume) {
    if (!(volume > 0)) return;
    var c = ensureAudio();
    if (!c) return;
    audio.out.gain.value = 1.2 * volume;
    var t = c.currentTime + 0.004;
    var j = 1 + (Math.random() - 0.5) * 0.04;   // a little variation, so a sweep never sounds mechanical
    if (kind === 'pass') { tink(t, 2450 * j, 0.35, 0.05); click(t, 0.05); }
    else if (kind === 'land') { tink(t, 1900 * j, 0.7, 0.11); click(t, 0.09); thock(t, 0.22, 190, 105, 0.07); }
    else if (kind === 'lift') { air(t, 0.06, 700, 2400, 0.16); tink(t + 0.02, 3100 * j, 0.18, 0.05); }
    else if (kind === 'set') { click(t, 0.12, 2200, 0.006); thock(t, 0.26, 170, 95, 0.08); tink(t, 2050 * j, 0.45, 0.09); tink(t + 0.022, 2300 * j, 0.22, 0.06); }
    else if (kind === 'swap') { air(t, 0.05, 2600, 900, 0.13); tink(t + 0.11, 2200 * j, 0.3, 0.07); }
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

    var spring = { raf: 0, target: 0, v: 0, landed: false, type: 'mouse', last: 0, zeta: 0.67, follow: true };
    // Every stop crossed is a tick; the first arrival at the target is a landing.
    function moveTo(next, why) {
      var prev = p;
      p = next;
      if (why && prev !== next) {
        var lo = Math.min(prev, next), hi = Math.max(prev, next);
        for (var n = Math.ceil(lo - 1e-9); n <= hi + 1e-9; n++) {
          if (n < 0 || n > N - 1 || Math.abs(n - prev) < 1e-9) continue;
          if (why.spring && n === spring.target) {
            if (!spring.landed) { spring.landed = true; feedback('land', why.type); }
          } else feedback('pass', why.type);
        }
      }
      drive(p);
      if (!why || why.follow !== false) mark(nearest(p));
    }
    function stopSpring() {
      if (spring.raf) cancelAnimationFrame(spring.raf);
      spring.raf = 0;
      spring.v = 0;
    }
    function springTo(t, v0, type, follow) {
      t = nearest(t);
      spring.target = t;
      spring.v = v0 || 0;
      spring.landed = false;
      spring.type = type;
      spring.follow = follow !== false;
      spring.zeta = num('--glass-grades-damping', 0.67, 0.2, 1.5);
      if (reduce.matches || Math.abs(p - t) < 1e-4) {
        stopSpring();
        moveTo(t, { spring: true, type: type, follow: spring.follow });
        release();
        return;
      }
      if (!spring.raf) {
        spring.last = performance.now();
        spring.raf = requestAnimationFrame(step);
      }
    }
    function step(now) {
      if (!root.isConnected) { spring.raf = 0; return; }
      var dt = Math.min(0.034, (now - spring.last) / 1000);
      spring.last = now;
      var k = 340, c = 2 * spring.zeta * Math.sqrt(k), x = p, v = spring.v, h = dt / 6;
      for (var i = 0; i < 6; i++) { var acc = -k * (x - spring.target) - c * v; v += acc * h; x += v * h; }
      spring.v = v;
      var why = { spring: true, type: spring.type, follow: spring.follow };
      glintFrom(v);
      moveTo(x, why);
      if (Math.abs(x - spring.target) < 0.002 && Math.abs(v) < 0.03) {
        spring.raf = 0;
        moveTo(spring.target, why);
        if (!spring.landed) { spring.landed = true; feedback('land', spring.type); }
        release();
        return;
      }
      spring.raf = requestAnimationFrame(step);
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
              moved: false, held: false, caught: !!spring.raf, samples: [] };
      stopSpring();
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
        if (driven && !spring.raf) springTo(nearest(p), 0, P.type, true);
        return;
      }
      var v = 0, s = P.samples;
      if (!cancelled && s.length > 1 && e.timeStamp - s[s.length - 1].t < 80) {
        var dt = (s[s.length - 1].t - s[0].t) / 1000;
        if (dt > 0) v = (s[s.length - 1].raw - s[0].raw) / dt;
      }
      // Projected ahead, so a flick coasts; three panes at most from where
      // the glass is. With the drag direct, a pane is 2.2 times the hand's
      // distance it used to be, so the projection grew from 0.2s to match.
      var here = nearest(p);
      var ahead = ms('--glass-grades-flick', 400) / 1000;
      springTo(Math.max(here - 3, Math.min(here + 3, Math.round(p + v * ahead))), v * 0.5, P.type, true);
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
      springTo(i, 0, type, false);
    }

    /* ── keys: the window steps and lifts; the rail is a radio group ── */
    frame.addEventListener('keydown', function (e) {
      var from = spring.raf ? spring.target : nearest(p);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (latched) lift(false, 'key');
        openView();
        var t = nearest(from + (e.key === 'ArrowRight' ? 1 : -1));
        drive(p);
        mark(t);
        springTo(t, 0, 'key', false);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        if (latched) lift(false, 'key');
        var end = e.key === 'Home' ? 0 : N - 1;
        drive(p);
        mark(end);
        springTo(end, 0, 'key', false);
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
        // and spring from there, so the move ticks like any other.
        drive(p);
        springTo(i, 0, lastType, false);
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
