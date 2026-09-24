/*
  Struck tones — the half of this component CSS genuinely cannot reach.

  It does three things and nothing else:

    1. Reads the palette out of the custom properties. Every number handed to a
       node below comes from getComputedStyle on the component's own root —
       none of it is written twice. Re-theme the set from outside and the sound
       changes with the picture, which is the test CLAUDE.md sets for a property
       block, applied to something that is not a colour.

    2. Synthesises the sounds. There are no audio files in this folder and no
       request to make — including for the room, whose impulse response is
       generated from two numbers when the first sound is armed.

    3. Writes the read-out and marks the strike. The palette list and the pad
       steps are printed from the same properties, so the component states its
       own values rather than a copy of them; the strike is an attribute that
       starts CSS animations timed from those properties, so how long a pad
       stays lit is the sound's business and not this file's.

  A note is four layers, and the layering is the whole difference between an
  instrument and a beep. A sine fundamental sounded twice a few cents apart so
  it drifts; an octave above it for body; a twelfth above that for shimmer,
  dying first the way every acoustic overtone does; and a short burst of
  band-passed noise underneath the attack, which is the click. All of it under
  one gentle lowpass, then split between the dry signal and a small room.

  What it is *not* is one oscillator with a sharp envelope on it. That was the
  first version and it sounded like a sound chip, for three reasons worth
  keeping written down: a raw geometric wave with nothing rolled off, an
  inharmonic partial at 2.76x the fundamental — the ratio a struck metal bar
  has, and an overtone belonging to no key reads as a bleep however carefully
  it is enveloped — and a 4ms attack, which is not a click but a discontinuity.
  A click is a layer. An attack is a shape. Sharpening the second to get the
  first is what makes a set brittle.

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
     document may hold, and the demo page alone stands up three components. */
  var ctx = null;
  var master = null;
  var convolver = null;
  var noise = null;
  var rooms = {};

  function audio() {
    if (ctx) return ctx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch (err) { return null; }

    /* A safety net rather than a sound: two sounds may overlap by design, and
       --level is editable from outside, so the sum can exceed full scale
       without this. Threshold high and the knee soft, so it is doing nothing
       at all until something would otherwise clip. */
    var limit = ctx.createDynamicsCompressor();
    limit.threshold.value = -3;
    limit.knee.value = 6;
    limit.ratio.value = 12;
    limit.attack.value = 0.002;
    limit.release.value = 0.15;

    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(limit);
    limit.connect(ctx.destination);

    convolver = ctx.createConvolver();
    convolver.connect(master);

    /* One second of noise, made once and re-used by every click. */
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
    var nd = noise.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    return ctx;
  }

  /* The room, generated rather than loaded. Noise under an exponential decay
     is the standard synthetic impulse; the one-pole lowpass over it is what
     keeps it from sounding like static, because raw white noise convolved
     against a short tone reads as gravel rather than as air.

     Cached per length, since the set only ever asks for two or three. */
  function room(seconds) {
    var key = seconds.toFixed(2);
    if (rooms[key]) return rooms[key];

    var n = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    var buf = ctx.createBuffer(2, n, ctx.sampleRate);

    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      var last = 0;
      for (var i = 0; i < n; i++) {
        /* 0.72 of the previous sample: a cheap one-pole, and the difference
           between a room and a hiss. */
        last = last * 0.72 + (Math.random() * 2 - 1) * 0.28;
        d[i] = last * Math.pow(1 - i / n, 2.6);
      }
    }

    rooms[key] = buf;
    return buf;
  }

  /* --- the palette, read off the element --------------------------------- */

  var TIMBRES = ['sine', 'triangle', 'square', 'sawtooth'];

  function palette(root) {
    var s = getComputedStyle(root);

    function num(name, fallback) {
      var v = parseFloat(s.getPropertyValue(CHANNEL + name));
      return isFinite(v) ? v : fallback;
    }

    var timbre = s.getPropertyValue(CHANNEL + 'timbre').trim();

    return {
      root: num('root', 528),
      spread: num('spread', 104),

      /* An unknown type throws on assignment, and a token block is editable
         from outside by design, so the value is checked rather than trusted. */
      timbre: TIMBRES.indexOf(timbre) === -1 ? 'sine' : timbre,
      partial: num('partial', 2),
      partialLevel: num('partial-level', 0.22),
      shimmer: num('shimmer', 3),
      shimmerLevel: num('shimmer-level', 0.06),
      chorus: num('chorus', 7),

      attack: num('attack', 16),
      decay: num('decay', 820),
      level: num('level', 0.15),
      bounce: num('bounce', 0.55),
      click: num('click', 0.11),
      clickTone: num('click-tone', 2100),
      clickFall: num('click-fall', 26),

      tone: num('tone', 3400),
      air: num('air', 0.18),
      airSize: num('air-size', 1.7),

      steps: {
        tap: num('i-tap', 0),
        commit: num('i-commit', 7),
        revert: num('i-revert', -5),
        alert: num('i-alert', -1)
      },

      /* When each gesture's second note falls, in multiples of --spread. The
         pads draw the same three numbers, which is why they are tokens and
         not constants in TONES below. */
      times: {
        commit: num('t-commit', 1),
        revert: num('t-revert', 1),
        alert: num('t-alert', 0.55)
      }
    };
  }

  /* The four sounds, as contours rather than as pitches. Each note names a
     step in the block above and, if it is not the first, which --t says when
     it falls — so the shape of a sound survives being retuned: `commit` is
     the root then whatever the set calls a commit, whether that is a fifth or
     a third, as soon after as the set says.

     Direction is the message. Up is something now exists, down is something
     was undone, and a single note is a plain acknowledgement.

     The alert is the one that changed. It used to sound its semitone *against*
     the root — two pitches 31 Hz apart, which is not beating but roughness,
     and genuinely unpleasant rather than merely urgent. It is the same
     interval now, played as a fall rather than a stack: nothing sounds
     together, so nothing beats, and what is left is the unease of a step down
     onto a note that is nearly the tonic and is not. It is also the quickest
     gesture in the set, which is where the urgency actually lives. */
  var TONES = {
    tap: {
      label: 'Tap',
      says: 'Tap, at the root',
      notes: [{ step: 'tap' }]
    },
    commit: {
      label: 'Commit',
      says: 'Commit, rising to a fifth above the root',
      notes: [{ step: 'tap' }, { step: 'commit', after: 'commit' }]
    },
    revert: {
      label: 'Revert',
      says: 'Revert, falling to a fourth below the root',
      notes: [{ step: 'tap' }, { step: 'revert', after: 'revert' }]
    },
    alert: {
      label: 'Alert',
      says: 'Alert, stepping down a semitone from the root',
      notes: [{ step: 'tap' }, { step: 'alert', after: 'alert' }]
    }
  };

  function hz(pal, step) {
    return pal.root * Math.pow(2, step / 12);
  }

  /* --- one layer ---------------------------------------------------------
     A ramp up with no corner in it, then an exponential fall — which cannot
     be ramped to zero, the curve being multiplicative, so it lands on a value
     below hearing and stops there.

     `--bounce` rides on top: the layer starts a fraction of a semitone sharp
     and settles onto its pitch over the first 70ms. Far too small to hear as
     a pitch change, and most of why the set reads as sprung. */
  function layer(bus, pal, freq, t0, level, decay, detune) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var attack = Math.max(pal.attack, 1) / 1000;
    var fall = decay / 1000;

    osc.type = pal.timbre;
    if (detune) osc.detune.value = detune;

    if (pal.bounce > 0) {
      osc.frequency.setValueAtTime(freq * Math.pow(2, pal.bounce / 12), t0);
      osc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.07);
    } else {
      osc.frequency.setValueAtTime(freq, t0);
    }

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(level, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + fall);

    osc.connect(gain);
    gain.connect(bus);
    osc.start(t0);
    osc.stop(t0 + attack + fall + 0.02);

    return { node: osc, gain: gain };
  }

  /* The click: band-passed noise under the attack, and the whole of what makes
     a sound feel touched rather than played. Its own short envelope, because a
     transient that decays with the note is not a transient. */
  function transient(bus, pal, t0) {
    if (pal.click <= 0) return null;

    var src = ctx.createBufferSource();
    var bpf = ctx.createBiquadFilter();
    var gain = ctx.createGain();
    var fall = Math.max(pal.clickFall, 4) / 1000;

    src.buffer = noise;
    /* Anywhere in the buffer, so repeated strikes are not bit-identical. */
    var from = Math.random() * 0.3;

    bpf.type = 'bandpass';
    bpf.frequency.value = pal.clickTone;
    bpf.Q.value = 0.7;

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(pal.click, t0 + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + fall);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(bus);
    src.start(t0, from, fall + 0.05);
    src.stop(t0 + fall + 0.05);

    return { node: src, gain: gain };
  }

  /* One note: every layer onto a shared bus, the bus under one lowpass, and
     the lowpass split between the dry signal and the room. */
  function note(pal, freq, t0) {
    var nodes = [];

    var bus = ctx.createGain();
    bus.gain.value = 1;

    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = pal.tone;
    lp.Q.value = 0.4;
    bus.connect(lp);

    var dry = ctx.createGain();
    dry.gain.value = 1 - Math.min(Math.max(pal.air, 0), 0.9) * 0.5;
    lp.connect(dry);
    dry.connect(master);

    if (pal.air > 0) {
      /* Reassigning a live convolver's buffer is not free and can be heard, so
         only when the room actually changed — which is when a variant with a
         different --air-size takes over, not on every note. */
      var ir = room(pal.airSize);
      if (convolver.buffer !== ir) convolver.buffer = ir;
      var wet = ctx.createGain();
      wet.gain.value = pal.air;
      lp.connect(wet);
      wet.connect(convolver);
    }

    /* The fundamental, twice, detuned against itself and panned apart. */
    var half = pal.chorus / 2;
    if (pal.chorus > 0 && ctx.createStereoPanner) {
      [-1, 1].forEach(function (side) {
        var pan = ctx.createStereoPanner();
        pan.pan.value = side * 0.35;
        pan.connect(bus);
        nodes.push(layer(pan, pal, freq, t0, pal.level, pal.decay, side * half));
      });
    } else {
      nodes.push(layer(bus, pal, freq, t0, pal.level, pal.decay, 0));
    }

    /* The overtones, both harmonic, both dying before the fundamental does —
       which is what an acoustic tone actually does and what makes the note
       mellow as it falls instead of simply getting quieter. */
    if (pal.partialLevel > 0) {
      nodes.push(layer(bus, pal, freq * pal.partial, t0,
        pal.level * pal.partialLevel, pal.decay * 0.5, 0));
    }
    if (pal.shimmerLevel > 0) {
      nodes.push(layer(bus, pal, freq * pal.shimmer, t0,
        pal.level * pal.shimmerLevel, pal.decay * 0.3, 0));
    }

    var click = transient(bus, pal, t0);
    if (click) nodes.push(click);

    return nodes;
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
      live.forEach(function (v) {
        try {
          v.gain.gain.cancelScheduledValues(now);
          /* An exponential ramp cannot start from zero, and the envelope
             genuinely can be there between the schedule and the press. */
          v.gain.gain.setValueAtTime(Math.max(v.gain.gain.value, 0.0001), now);
          v.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
          v.node.stop(now + 0.04);
        } catch (err) { /* already stopped */ }
      });
      ringing[tone] = null;
    }

    function play(tone, pal) {
      if (!armed || !audio()) return;
      if (ctx.state === 'suspended') ctx.resume();

      hush(tone);

      var spec = TONES[tone];
      /* Enough lookahead that the first envelope point is never scheduled in
         the past on a busy main thread, which is where clicks come from. */
      var t0 = ctx.currentTime + 0.012;
      var voices = [];

      spec.notes.forEach(function (n) {
        var at = t0 + ((n.after ? pal.times[n.after] : 0) * pal.spread) / 1000;
        voices = voices.concat(note(pal, hz(pal, pal.steps[n.step]), at));
      });

      ringing[tone] = voices;
    }

    /* --- the read-out ----------------------------------------------------
       Drawn on every strike whether or not anything was audible. The visible
       half is the name, the pitch and the envelope; the spoken half is one
       sentence naming the sound and what its contour means, because "528 Hz"
       is not the message the sound was carrying. */
    function show(tone, pal, spoke) {
      shown = tone;
      var spec = TONES[tone];
      var last = spec.notes[spec.notes.length - 1];

      if (traceName) traceName.textContent = spec.label;
      if (traceFreq) traceFreq.textContent = Math.round(hz(pal, pal.steps[last.step]));
      if (traceAttack) traceAttack.textContent = Math.round(pal.attack);
      if (traceDecay) traceDecay.textContent = Math.round(pal.decay);

      if (spoke && traceLive) traceLive.textContent = spec.says;
    }

    /* The palette list and the pad steps, printed from the properties rather
       than kept as a second copy of them. This is what makes the block at the
       top of component.css the single source: override a value from outside
       and the component says the new one. */
    function label(pal) {
      var cells = {
        root: Math.round(pal.root) + ' Hz',
        voice: pal.timbre + ' + ' + pal.partial + '× + ' + pal.shimmer + '×',
        envelope: Math.round(pal.attack) + ' / ' + Math.round(pal.decay) + ' ms',
        air: pal.airSize.toFixed(1) + ' s · ' + Math.round(pal.air * 100) + '%'
      };

      Object.keys(cells).forEach(function (key) {
        var cell = root.querySelector('[data-token="' + key + '"]');
        if (cell) cell.textContent = cells[key];
      });

      pads.forEach(function (pad) {
        var cell = pad.querySelector('[data-step]');
        if (!cell) return;
        var step = pal.steps[pad.dataset.tone];
        cell.textContent = step > 0 ? '+' + step : (step < 0 ? '−' + Math.abs(step) : '0');
      });
    }

    function refresh() {
      var pal = palette(root);
      label(pal);
      show(shown, pal, false);
    }

    /* --- striking ---------------------------------------------------------
       One strike, whoever asks for it: a press, or the `--live` clock below.
       The read-out and the drawing follow either way. Only a press can sound
       and only a press speaks to a screen reader, because the clock is the
       component demonstrating itself and nobody asked it anything. */
    var trace = root.querySelector('.' + ROOT + '__trace');

    function strike(pad, pressed) {
      var pal = palette(root);
      var tone = pad.dataset.tone;

      show(tone, pal, pressed);
      if (pressed) play(tone, pal);

      /* The strike is a keyframe, not a transition, so it has to be
         retriggered rather than re-entered: the attribute comes off and goes
         back on, with a forced style flush between the two so a strike during
         the tail restarts the animation instead of being swallowed as no
         change. The trace takes one too, which is the playhead. */
      pad.removeAttribute('data-hit');
      if (trace) trace.removeAttribute('data-hit');
      void root.offsetWidth;
      pad.setAttribute('data-hit', '');
      if (trace) trace.setAttribute('data-hit', '');
    }

    pads.forEach(function (pad) {
      pad.addEventListener('click', function () { strike(pad, true); });

      /* The strike is over when the last thing it lit has faded, which is the
         second head, a --t of a --spread after the pad itself. Clearing on the
         pad's own end would cut that head off. Clearing at all is not
         housekeeping: a finished animation whose duration then grows — a
         variant with a longer --decay taking over — becomes active again, so
         an attribute left on replays the tail of an old strike. */
      var heads = pad.querySelectorAll('.' + ROOT + '__note');
      var last = heads.length ? heads[heads.length - 1] : pad;

      pad.addEventListener('animationend', function (event) {
        if (event.animationName !== 'struck-tones-fall') return;
        if (event.target === last) pad.removeAttribute('data-hit');
      });
    });

    if (trace) {
      trace.addEventListener('animationend', function (event) {
        if (event.animationName === 'struck-tones-playhead') trace.removeAttribute('data-hit');
      });
    }

    /* --- --live: the clock -------------------------------------------------
       The rack's keyframe is the tempo and this is the hand on the pads: each
       beat strikes the next one, starting from the tap whenever the modifier
       goes on. A paused animation fires no iterations, which is how the
       index's one animation-play-state rule stops this without knowing it
       exists. */
    var rack = root.querySelector('.' + ROOT + '__rack');
    var beat = 0;

    function onBeat(event) {
      if (event.target !== rack || event.animationName !== 'struck-tones-clock') return;
      beat = event.type === 'animationstart' ? 0 : (beat + 1) % pads.length;
      strike(pads[beat], false);
    }

    if (rack && pads.length) {
      rack.addEventListener('animationstart', onBeat);
      rack.addEventListener('animationiteration', onBeat);
    }

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
