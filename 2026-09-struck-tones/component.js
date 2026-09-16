/*
  Struck tones — the half of this component CSS genuinely cannot reach.

  It does three things and nothing else:

    1. Reads the tuning out of the custom properties. Every number handed to an
       oscillator below comes from getComputedStyle on the component's own root
       — none of it is written twice. Re-theme the set from outside and the
       sound changes with the picture, which is the test CLAUDE.md sets for a
       property block, applied to something that is not a colour.

    2. Synthesises the sounds. There are no audio files in this folder and
       there is no request to make: a struck tone is two oscillators and a gain
       envelope, and saying so in numbers is what makes the set re-tunable at
       all. A .wav is a decision you cannot edit.

    3. Writes the read-out. The tuning list and the pad steps are printed from
       the same properties, so the component states its own values rather than
       a copy of them.

  No AudioContext is constructed until somebody presses the arm switch. That is
  not politeness about autoplay policy — the policy would block it anyway — it
  is the component's default: silence, and a visible way out of it.

  Plain vanilla, no framework, no build step. Safe to load twice, and safe on a
  page holding any number of these.
*/

(function () {
  var ROOT = 'struck-tones';
  var CHANNEL = '--' + ROOT + '-';

  /* One context for the whole page, built on the first arming gesture and
     shared by every instance after that. Browsers cap how many of these a
     document may hold, and the demo page alone stands up four components. */
  var ctx = null;

  function audio() {
    if (ctx) return ctx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch (err) { return null; }
    return ctx;
  }

  /* --- the tuning, read off the element ---------------------------------- */

  var TIMBRES = ['sine', 'triangle', 'square', 'sawtooth'];

  function tuning(root) {
    var s = getComputedStyle(root);

    function num(name, fallback) {
      var v = parseFloat(s.getPropertyValue(CHANNEL + name));
      return isFinite(v) ? v : fallback;
    }

    var timbre = s.getPropertyValue(CHANNEL + 'timbre').trim();

    return {
      root: num('root', 528),
      /* An unknown type throws on assignment, and a token block is editable
         from outside by design, so the value is checked rather than trusted. */
      timbre: TIMBRES.indexOf(timbre) === -1 ? 'triangle' : timbre,
      attack: num('attack', 4),
      decay: num('decay', 260),
      level: num('level', 0.16),
      partial: num('partial', 2.76),
      partialLevel: num('partial-level', 0.28),
      spread: num('spread', 96),
      steps: {
        tap: num('i-tap', 0),
        commit: num('i-commit', 7),
        revert: num('i-revert', -5),
        alert: num('i-alert', 1)
      }
    };
  }

  /* The four sounds, as contours rather than as pitches. Each note names a
     step in the block above and when it falls, in multiples of --spread, so
     the shape of a sound survives being retuned: `commit` is the root then
     whatever the set calls a commit, whether that is a fifth or a third.

     Direction is the message. Up is something now exists, down is something
     was undone, a single note is a plain acknowledgement, and two notes a
     semitone apart sounded together is the only thing in the set meant to be
     unpleasant — it beats, and that roughness is the whole point of it. */
  var TONES = {
    tap: {
      label: 'Tap',
      says: 'Tap, at the root',
      notes: [{ step: 'tap', at: 0 }]
    },
    commit: {
      label: 'Commit',
      says: 'Commit, rising to a fifth above the root',
      notes: [{ step: 'tap', at: 0 }, { step: 'commit', at: 1 }]
    },
    revert: {
      label: 'Revert',
      says: 'Revert, falling to a fourth below the root',
      notes: [{ step: 'tap', at: 0 }, { step: 'revert', at: 1 }]
    },
    alert: {
      label: 'Alert',
      says: 'Alert, a semitone sounded against the root',
      notes: [{ step: 'tap', at: 0 }, { step: 'alert', at: 0 }]
    }
  };

  function hz(tune, step) {
    return tune.root * Math.pow(2, step / 12);
  }

  /* --- one struck voice --------------------------------------------------
     A fundamental and one inharmonic partial above it, both under the same
     shape: a near-instant ramp up and a long exponential fall. The exponential
     is what makes it read as struck rather than as switched on, and it is also
     what a real bar does. It cannot be ramped to zero — the curve is
     multiplicative — so it lands on a value below hearing and stops there.

     The partial decays faster than the fundamental, which is the other half of
     "struck": the ring is bright at the moment of the hit and gone well before
     the note is. */
  function voice(dest, freq, t0, tune, level, decay) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var attack = Math.max(tune.attack, 1) / 1000;
    var fall = decay / 1000;

    osc.type = tune.timbre;
    osc.frequency.setValueAtTime(freq, t0);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(level, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + fall);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t0);
    osc.stop(t0 + attack + fall + 0.02);

    return { osc: osc, gain: gain };
  }

  function setup(root) {
    if (root.dataset.stReady === 'true') return;
    root.dataset.stReady = 'true';

    var arm = root.querySelector('[data-arm]');
    var armText = root.querySelector('[data-arm-text]');
    var pads = Array.prototype.slice.call(root.querySelectorAll('[data-tone]'));
    var traceName = root.querySelector('[data-trace-name]');
    var traceFreq = root.querySelector('[data-trace-freq]');
    var traceAttack = root.querySelector('[data-trace-attack]');
    var traceDecay = root.querySelector('[data-trace-decay]');
    var traceLive = root.querySelector('[data-trace-live]');

    var armed = false;
    var shown = 'tap';

    /* What is still ringing, per sound. A second press of the same pad cancels
       its own tail rather than layering on top of it, so ten fast taps are ten
       taps and not a chord — but two different sounds may overlap, because in
       a real interface they do. */
    var ringing = {};

    function hush(tone) {
      var live = ringing[tone];
      if (!live || !ctx) return;
      var now = ctx.currentTime;
      live.forEach(function (node) {
        try {
          node.gain.gain.cancelScheduledValues(now);
          /* An exponential ramp cannot start from zero, and the envelope
             genuinely can be there between the schedule and the press. */
          node.gain.gain.setValueAtTime(Math.max(node.gain.gain.value, 0.0001), now);
          node.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
          node.osc.stop(now + 0.03);
        } catch (err) { /* already stopped */ }
      });
      ringing[tone] = null;
    }

    function play(tone, tune) {
      if (!armed || !audio()) return;
      if (ctx.state === 'suspended') ctx.resume();

      hush(tone);

      var spec = TONES[tone];
      var t0 = ctx.currentTime + 0.001;
      var nodes = [];

      spec.notes.forEach(function (note) {
        var at = t0 + (note.at * tune.spread) / 1000;
        var freq = hz(tune, tune.steps[note.step]);

        nodes.push(voice(ctx.destination, freq, at, tune, tune.level, tune.decay));

        if (tune.partialLevel > 0) {
          nodes.push(voice(
            ctx.destination,
            freq * tune.partial,
            at,
            tune,
            tune.level * tune.partialLevel,
            tune.decay * 0.6
          ));
        }
      });

      ringing[tone] = nodes;
    }

    /* --- the read-out ----------------------------------------------------
       Drawn on every strike whether or not anything was audible. The visible
       half is the name, the pitch and the envelope; the spoken half is one
       sentence naming the sound and what its contour means, because "528 Hz"
       is not the message the sound was carrying. */
    function show(tone, tune, spoke) {
      shown = tone;
      var spec = TONES[tone];
      var last = spec.notes[spec.notes.length - 1];

      if (traceName) traceName.textContent = spec.label;
      if (traceFreq) traceFreq.textContent = Math.round(hz(tune, tune.steps[last.step]));
      if (traceAttack) traceAttack.textContent = Math.round(tune.attack);
      if (traceDecay) traceDecay.textContent = Math.round(tune.decay);

      if (spoke && traceLive) traceLive.textContent = spec.says;
    }

    /* The tuning list and the pad steps, printed from the properties rather
       than kept as a second copy of them. This is what makes the block at the
       top of component.css the single source: override a value from outside
       and the component says the new one. */
    function label(tune) {
      var cells = {
        root: Math.round(tune.root) + ' Hz',
        timbre: tune.timbre,
        partial: tune.partial.toFixed(2) + '×',
        envelope: Math.round(tune.attack) + ' / ' + Math.round(tune.decay) + ' ms'
      };

      Object.keys(cells).forEach(function (key) {
        var cell = root.querySelector('[data-token="' + key + '"]');
        if (cell) cell.textContent = cells[key];
      });

      pads.forEach(function (pad) {
        var cell = pad.querySelector('[data-step]');
        if (!cell) return;
        var step = tune.steps[pad.dataset.tone];
        cell.textContent = step > 0 ? '+' + step : (step < 0 ? '−' + Math.abs(step) : '0');
      });
    }

    function refresh() {
      var tune = tuning(root);
      label(tune);
      show(shown, tune, false);
    }

    /* --- striking --------------------------------------------------------- */

    pads.forEach(function (pad) {
      pad.addEventListener('click', function () {
        var tune = tuning(root);
        var tone = pad.dataset.tone;

        show(tone, tune, true);
        play(tone, tune);

        /* The flash is a keyframe, not a transition, so it has to be retriggered
           rather than re-entered: the attribute comes off at the end of the run
           and goes back on for the next press. Forced reflow between the two so
           a press during the tail restarts the animation instead of being
           swallowed as no change. */
        pad.removeAttribute('data-hit');
        void pad.offsetWidth;
        pad.setAttribute('data-hit', '');
      });

      pad.addEventListener('animationend', function (event) {
        if (event.target === pad) pad.removeAttribute('data-hit');
      });

      /* `--live` is the set playing itself through, and the read-out has to
         name whichever pad is lit or the card shows one sound and says
         another. The CSS sweep stays the clock — these are its own events, so
         the label advances exactly when the flash does, and a paused animation
         fires no iterations, which is how the index's one
         animation-play-state rule reaches this without knowing it exists. */
      function follow(event) {
        if (event.animationName !== 'struck-tones-sweep') return;
        if (event.target !== pad) return;
        show(pad.dataset.tone, tuning(root), false);
      }

      pad.addEventListener('animationstart', follow);
      pad.addEventListener('animationiteration', follow);
    });

    /* --- arming ------------------------------------------------------------ */

    if (arm) {
      /* The markup ships this disabled, because without this file there is no
         audio to arm and a control that does nothing is worse than one that
         says so. Enabling it is the first thing the script does — everything
         else on the component already works without it. */
      arm.disabled = false;

      arm.addEventListener('click', function () {
        armed = !armed;
        arm.setAttribute('aria-pressed', armed ? 'true' : 'false');
        if (armText) armText.textContent = armed ? 'Sound on' : 'Sound off';

        if (armed) {
          var c = audio();
          /* The click is the gesture the policy wants; a context built before
             one exists starts suspended and stays that way. */
          if (c && c.state === 'suspended') c.resume();
        } else {
          Object.keys(ringing).forEach(hush);
        }
      });
    }

    /* --- re-theming from outside -------------------------------------------
       The one thing that makes the property block a real interface rather than
       a place the defaults happen to live: if something above this component
       overrides a token — a modifier class, an inline style, the preview file
       handing in a variant — the read-out has to follow, or the component is
       printing values it is no longer using. Attributes only, on this element
       only, so it costs nothing while nobody is re-theming anything. */
    if (window.MutationObserver) {
      new MutationObserver(function () { refresh(); })
        .observe(root, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    refresh();
  }

  function boot() {
    Array.prototype.slice
      .call(document.querySelectorAll('.' + ROOT))
      .forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
