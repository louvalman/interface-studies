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
       key moves `defaultChecked`; Escape is form.reset().

  Without it the component is still the component: arrow keys, clicks and a
  screen reader all work, the key submits the form, and the only things
  missing are the drag and the short way round.
*/

(function () {
  'use strict';

  var START = 4 * Math.PI / 180;   /* a drag begins after 4 degrees */
  var CROSS = 0.6;                 /* a detent is crossed 0.6 of a step past it */
  var CENTRE = 0.15;               /* ignore a press this close to the middle */
  var SET_MS = 180;                /* the key's pressed look after a commit */
  var BUZZ_MS = 40;

  function list(nodes) { return Array.prototype.slice.call(nodes); }

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

    /* --- 1. the near way round ------------------------------------------ */

    function turnTo(next) {
      if (next < 0 || next === sel) return;
      var from = sel + laps * n;
      laps = Math.round((from - next) / n);
      var span = Math.abs(next + laps * n - from);
      root.style.setProperty('--mode-dial-laps', String(laps));
      root.style.setProperty('--mode-dial-span', String(Math.max(1, span)));
      sel = next;
      /* Settling: the face is about to move under a pointer that has not.
         Hover rules wait until the pointer itself moves. */
      root.setAttribute('data-mode-dial-settling', '');
      settleX = lastX;
      settleY = lastY;
    }

    root.addEventListener('change', function (e) {
      if (inputs.indexOf(e.target) < 0) return;
      turnTo(checkedIndex());
    });

    root.addEventListener('pointermove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (root.hasAttribute('data-mode-dial-settling') && (lastX !== settleX || lastY !== settleY)) {
        root.removeAttribute('data-mode-dial-settling');
      }
    });

    root.addEventListener('pointerleave', function () {
      root.removeAttribute('data-mode-dial-settling');
    });

    /* --- 2. the drag --------------------------------------------------------
       From a primary pointer of any type, anywhere on the dial but the key.
       The dial is touch-action: pan-y and the knurl none, so a vertical swipe
       over the face still scrolls the page — the browser takes it and sends
       pointercancel, which abandons the drag where the last detent left it. */

    var drag = null;
    var raf = 0;
    var buzzed = 0;

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
        touch: e.pointerType === 'touch',
        cx: cx, cy: cy,
        prev: Math.atan2(dy, dx),
        acc: 0,
        from: sel + laps * n,
        started: false
      };
    });

    dial.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
      var d = a - drag.prev;
      if (d > Math.PI) d -= 2 * Math.PI;
      else if (d <= -Math.PI) d += 2 * Math.PI;
      drag.prev = a;
      drag.acc += d;
      if (!drag.started) {
        if (Math.abs(drag.acc) < START) return;
        drag.started = true;
        root.setAttribute('data-mode-dial-dragging', '');
        /* Capture only now: captured from the press, a plain click would
           land on the dial instead of the label it was aimed at. */
        try { dial.setPointerCapture(e.pointerId); } catch (err) { /* gone */ }
      }
      if (!raf) raf = requestAnimationFrame(frame);
    });

    /* One detent at a time, however fast the pointer went, so three crossed
       is three changes. The fraction left over is the drag. */
    function frame() {
      raf = 0;
      if (!root.isConnected || !drag || !drag.started) return;
      var T = drag.from - drag.acc / (2 * Math.PI / n);
      var cur = sel + laps * n;
      var moved = null;
      var guard = n * 4;
      while ((T - cur > CROSS || cur - T > CROSS) && guard--) {
        var target = cur + (T > cur ? 1 : -1);
        var next = ((target % n) + n) % n;
        inputs[next].checked = true;
        fire(inputs[next], 'input');
        fire(inputs[next], 'change');
        cur = sel + laps * n;
        moved = inputs[next];
        if (drag.touch && navigator.vibrate) {
          var now = Date.now();
          if (now - buzzed >= BUZZ_MS) { buzzed = now; navigator.vibrate(6); }
        }
      }
      if (moved) moved.focus({ preventScroll: true });
      root.style.setProperty('--mode-dial-drag', (T - cur).toFixed(4));
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
      if (!was.started) return;
      /* Both in one frame, so the detent transition carries the fraction
         back to the stop. */
      root.removeAttribute('data-mode-dial-dragging');
      root.style.removeProperty('--mode-dial-drag');
      if (e.type === 'pointerup') swallowClick();
    }

    dial.addEventListener('pointerup', end);
    dial.addEventListener('pointercancel', end);
    dial.addEventListener('lostpointercapture', end);

    /* --- 3. commit ------------------------------------------------------- */

    root.addEventListener('submit', function (e) {
      var k = key();
      /* No key: nothing here submits, including Enter on a radio. */
      if (!k) { e.preventDefault(); return; }
      var prev = defaultInput();
      var cur = inputs[checkedIndex()];
      if (cur && cur !== prev) {
        /* False on all first, then true on the current one, so the checked
           radio is never left unchecked by a clean dirty flag. */
        inputs.forEach(function (i) { i.defaultChecked = false; });
        cur.defaultChecked = true;
        var label = cur.closest('.mode-dial__option');
        var name = label && label.querySelector('.mode-dial__name');
        var status = root.querySelector('.mode-dial__status-value');
        if (status) status.textContent = name ? name.textContent : cur.value;
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
        if (root.requestSubmit) root.requestSubmit(k);
        else k.click();
      } else if (e.key === 'Escape' && pending()) {
        e.preventDefault();
        root.reset();
      }
    });

    /* reset fires before the controls are reset, so the bookkeeping waits a
       task. A host's own form.reset() takes the same path. */
    root.addEventListener('reset', function (e) {
      var cur = inputs[checkedIndex()];
      var discarded = pending() && cur ? cur.value : null;
      var focused = inputs.indexOf(document.activeElement) >= 0;
      setTimeout(function () {
        if (!root.isConnected || e.defaultPrevented) return;
        var i = checkedIndex();
        if (i < 0) return;
        var now = inputs[i];
        if (i !== sel) fire(now, 'change');
        if (focused) now.focus({ preventScroll: true });
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
