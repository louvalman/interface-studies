/*
  Struck tones — the half of this component CSS genuinely cannot reach.

  It does four things and nothing else:

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

    4. Draws the screen and the voice. The screen is a shader painting the
       struck sound as a phosphor would — the waveform inside its envelope,
       the second note over it, the room as a haze after it — from the same
       tokens, on the same clock as the CSS; the voice is a path computed from
       the partials. Both have a CSS or markup version already on the page,
       which is what shows when this file, or WebGL, is missing.

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

  /* What the Voice module prints, in the width it has. */
  var SHORT_TIMBRE = { sine: 'sine', triangle: 'tri', square: 'sqr', sawtooth: 'saw' };

  function ratio(v) {
    return String(Math.round(v * 100) / 100);
  }

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
      air: num('air', 0.1),
      airSize: num('air-size', 1.2),
      persist: Math.max(1, num('persist', 260)),
      timebase: Math.max(0.01, num('timebase', 20)),

      /* Not design values: the pause and the device-pixel factor, both handed
         in on this element from outside — by the index, through the preview
         file — the way every other study's thumbnail takes them. */
      run: num('run', 1) !== 0,
      bufferScale: Math.min(Math.max(num('buffer-scale', 1), 0.1), 4),

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
      notes: [{ step: 'tap' }]
    },
    commit: {
      label: 'Commit',
      notes: [{ step: 'tap' }, { step: 'commit', after: 'commit' }]
    },
    revert: {
      label: 'Revert',
      notes: [{ step: 'tap' }, { step: 'revert', after: 'revert' }]
    },
    alert: {
      label: 'Alert',
      notes: [{ step: 'tap' }, { step: 'alert', after: 'alert' }]
    }
  };

  /* What a sound says to a screen reader, composed from its step rather than
     written beside it. It used to be written, and --close retuned the commit
     to a minor third while the sentence went on announcing a fifth: the one
     channel a reader who cannot hear has was the one that stopped following
     the tokens. */
  var INTERVALS = ['unison', 'semitone', 'whole tone', 'minor third',
    'major third', 'fourth', 'tritone', 'fifth', 'minor sixth', 'major sixth',
    'minor seventh', 'major seventh', 'octave'];

  function says(tone, pal) {
    var spec = TONES[tone];
    var last = spec.notes[spec.notes.length - 1];
    var step = pal.steps[last.step] - pal.steps.tap;
    if (spec.notes.length < 2 || step === 0) return spec.label + ', at the root';

    var n = Math.abs(Math.round(step));
    var name = n <= 12 ? INTERVALS[n] : n + ' semitones';
    var article = n > 12 ? '' : (name === 'octave' ? 'an ' : 'a ');
    return spec.label + ', ' + (step > 0 ? 'up ' : 'down ') + article + name +
      ' from the root';
  }

  function hz(pal, step) {
    return pal.root * Math.pow(2, step / 12);
  }

  /* --- the voice, drawn --------------------------------------------------
     The waveform of one note laid around a circle ROSETTE_CYCLES times: the
     radius at each angle is the wave at that phase. With whole-number
     partials the wave repeats exactly once a cycle, so the ring closes and
     every petal is the same petal. With the 2.76 of a struck bar it never
     repeats, so no two petals match and the line misses its own start — the
     same argument the voice's comment makes in words, drawn. The markup
     carries the default set's path; this redraws it from whatever the
     partial tokens say.

     Every layer is sounded in the --timbre shape, so every layer is drawn
     in it too: a square set grows square petals. The shapes are the ideal
     ones; the oscillators are band-limited, so what is heard has the edges
     rounded off, but the picture a square wave makes is a square. The
     screen's shader draws with the same four shapes. */
  var ROSETTE_CYCLES = 6;
  var ROSETTE_POINTS = 144;
  var TAU = Math.PI * 2;

  function shape(timbre, phase) {
    if (timbre === 'triangle') return Math.asin(Math.sin(phase)) * 2 / Math.PI;
    if (timbre === 'square') return Math.max(-1, Math.min(1, Math.sin(phase) * 6));
    if (timbre === 'sawtooth') {
      var f = phase / TAU + 0.5;
      return 2 * (f - Math.floor(f)) - 1;
    }
    return Math.sin(phase);
  }

  function wave(phase, partials, timbre) {
    var v = shape(timbre, phase);
    for (var i = 0; i < partials.length; i++) {
      v += partials[i][1] * shape(timbre, partials[i][0] * phase);
    }
    return v;
  }

  function rosette(partials, timbre) {
    var peak = 0;
    var samples = [];
    for (var i = 0; i <= ROSETTE_POINTS; i++) {
      var a = (i / ROSETTE_POINTS) * TAU;
      var v = wave(a * ROSETTE_CYCLES, partials, timbre);
      samples.push([a, v]);
      peak = Math.max(peak, Math.abs(v));
    }
    return samples.map(function (s, i) {
      var r = 0.62 + 0.3 * (s[1] / (peak || 1));
      var x = r * Math.sin(s[0]);
      var y = -r * Math.cos(s[0]);
      return (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }).join('');
  }

  function partialsOf(pal) {
    var list = [];
    if (pal.partialLevel > 0) list.push([pal.partial, pal.partialLevel]);
    if (pal.shimmerLevel > 0) list.push([pal.shimmer, pal.shimmerLevel]);
    return list;
  }

  /* --- the screen: colour -------------------------------------------------
     The shader wants linear-light numbers and the tokens are whatever CSS
     colour someone wrote. Writing a token to a probe's `color` and reading
     the computed value back hands the parsing to the engine, which returns a
     resolved rgb() whatever went in. One probe, reused, and only touched when
     a token changes. */
  var probe = null;

  function readColour(value, fallback) {
    if (!probe) {
      probe = document.createElement('span');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;' +
        'clip-path:inset(50%);pointer-events:none';
      document.body.appendChild(probe);
    }
    probe.style.color = '';
    probe.style.color = value;
    var resolved = getComputedStyle(probe).color;
    var parts = resolved.match(/[-\d.]+(?:e[-+]?\d+)?/gi);
    if (!value || !parts || parts.length < 3) return fallback;

    var srgb = resolved.indexOf('color(') === 0
      ? [+parts[0], +parts[1], +parts[2]]
      : [parts[0] / 255, parts[1] / 255, parts[2] / 255];

    return srgb.map(function (c) {
      c = c < 0 ? 0 : c > 1 ? 1 : c;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
  }

  /* --- the screen: the GPU ------------------------------------------------
     One WebGL2 context for the whole document, drawn off screen and handed to
     each screen as an ImageBitmap. A browser caps live contexts and drops the
     oldest without saying so, and on the index every card is its own framed
     document — so a study that took a context per instance would be the
     reason some other card went blank.

     If any piece of it is missing this returns null and nothing else
     happens: the CSS envelope is already on the screen and is already the
     drawing. */
  var gpu;
  var MAX_BUFFER_PX = 600000;

  var VERT =
    '#version 300 es\n' +
    'void main() {\n' +
    '  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\n' +
    '  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\n' +
    '}\n';

  var FRAG =
    '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform vec2 u_res;\n' +
    'uniform vec4 u_box;\n' +              /* the envelope's box, in buffer px */
    'uniform float u_px;\n' +              /* buffer px per CSS px */
    'uniform float u_win, u_att, u_dec, u_lag, u_two;\n' +
    'uniform float u_cyc1, u_cyc2;\n' +    /* waveform cycles per ms, slowed */
    'uniform vec4 u_parts;\n' +            /* partial, level, shimmer, level */
    'uniform int u_timbre;\n' +            /* 0 sine, 1 triangle, 2 square, 3 sawtooth */
    'uniform float u_air, u_room;\n' +
    'uniform float u_now, u_scan, u_persist, u_calm;\n' +
    'uniform vec3 u_glass, u_phos;\n' +
    'out vec4 fragColor;\n' +
    'const float TAU = 6.28318530718;\n' +

    'float hash(vec2 p) {\n' +
    '  p = fract(p * vec2(123.34, 456.21));\n' +
    '  p += dot(p, p + 45.32);\n' +
    '  return fract(p.x * p.y);\n' +
    '}\n' +

    'float vnoise(vec2 p) {\n' +
    '  vec2 i = floor(p), f = fract(p);\n' +
    '  vec2 u = f * f * (3.0 - 2.0 * f);\n' +
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),\n' +
    '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\n' +
    '}\n' +

    /* The envelope the CSS draws and the gain node plays: a straight rise,
       then an exponential fall, pulled down to land on zero at --decay. */
    'float env(float t) {\n' +
    '  if (t < 0.0) return 0.0;\n' +
    '  if (t < u_att) return t / max(u_att, 1.0);\n' +
    '  float u = (t - u_att) / max(u_dec, 1.0);\n' +
    '  if (u >= 1.0) return 0.0;\n' +
    '  return exp(-4.4 * u) - exp(-4.4) * u;\n' +
    '}\n' +

    /* The voice: the fundamental and its two partials, each in the --timbre
       shape the oscillators are set to, normalised. The same four shapes
       the rosette draws with. */
    'float shape(float ph) {\n' +
    '  if (u_timbre == 1) return asin(sin(ph)) * 0.63662;\n' +
    '  if (u_timbre == 2) return clamp(sin(ph) * 6.0, -1.0, 1.0);\n' +
    '  if (u_timbre == 3) return 2.0 * fract(ph / TAU + 0.5) - 1.0;\n' +
    '  return sin(ph);\n' +
    '}\n' +

    'float wave(float ph) {\n' +
    '  float v = shape(ph) + u_parts.y * shape(u_parts.x * ph) + u_parts.w * shape(u_parts.z * ph);\n' +
    '  return v / (1.0 + u_parts.y + u_parts.w);\n' +
    '}\n' +

    'float sig(float t) { return env(t) * wave(TAU * u_cyc1 * t); }\n' +

    'void main() {\n' +
    '  vec2 fc = gl_FragCoord.xy;\n' +
    '  vec2 uv = fc / u_res;\n' +

    /* The glass: darker towards its edges, a faint lift across the top where
       a pane catches the room, and a scanline every other CSS pixel. */
    '  vec3 col = u_glass;\n' +
    '  float r = length((uv - vec2(0.5, 0.55)) * vec2(1.0, 1.7));\n' +
    '  col *= 1.0 - 0.5 * smoothstep(0.35, 1.0, r);\n' +
    '  col += vec3(0.010, 0.014, 0.012) * smoothstep(0.6, 1.0, uv.y);\n' +
    '  col *= 0.9 + 0.1 * step(0.5, fract(fc.y / (2.0 * u_px)));\n' +

    '  vec2 p = (fc - u_box.xy) / u_box.zw;\n' +
    '  float inX = step(0.0, p.x) * step(p.x, 1.0);\n' +
    '  float t = p.x * u_win;\n' +
    '  float yc = u_box.y + u_box.w * 0.5;\n' +
    '  float amp = u_box.w * 0.46;\n' +
    '  float dy = fc.y - yc;\n' +
    '  float inY = step(abs(dy), u_box.w * 0.5);\n' +
    '  float light = 0.0;\n' +
    '  float light2 = 0.0;\n' +

    /* A graticule: the zero line and eighths of the window. */
    '  float gx = abs(fract(p.x * 8.0 + 0.5) - 0.5) * u_box.z / 8.0;\n' +
    '  light += (1.0 - smoothstep(0.0, u_px, gx)) * inY * inX * 0.045;\n' +
    '  light += (1.0 - smoothstep(0.0, u_px, abs(dy))) * inX * 0.06;\n' +

    /* How recently the playhead passed this column, which is how brightly it
       is still lit: the glass holds a line for --persist and lets it go.
       Under reduced motion there is no sweep, so the whole trace lights at
       once and cools together. */
    '  float heat = 0.0;\n' +
    '  if (u_calm > 0.5) heat = exp(-u_now / u_persist);\n' +
    '  else if (t <= u_scan) heat = exp(-max(u_now - t, 0.0) / u_persist);\n' +
    '  float bright = mix(0.4, 1.0, heat);\n' +

    /* The room: a haze from each note\'s onset out to --decay plus the
       room\'s length, as dense as there is --air in it, grained like the
       noise the impulse response is made from. It runs past the right-hand
       edge, because the room rings past the end of the note. */
    '  float haze = 0.0;\n' +
    '  float band = exp(-pow(dy / (amp * 0.75), 2.0)) * inY;\n' +
    '  float grain = 0.7 * vnoise(vec2(t / 16.0, dy / (u_px * 3.5)))\n' +
    '              + 0.3 * hash(floor(fc / max(u_px, 1.0)));\n' +
    '  for (int n = 0; n < 2; n++) {\n' +
    '    float o = n == 0 ? 0.0 : u_lag;\n' +
    '    if (n == 1 && u_two < 0.5) break;\n' +
    '    float k = t - o;\n' +
    '    if (k <= 0.0) continue;\n' +
    '    float tail = pow(max(1.0 - k / (u_dec + u_room), 0.0), 2.6);\n' +
    '    haze += u_air * 1.7 * tail * smoothstep(0.0, u_att + 40.0, k);\n' +
    '  }\n' +
    '  light += haze * band * (0.25 + 0.75 * grain) * inX * bright;\n' +

    /* The first note: the waveform itself, slowed until each cycle is a
       stroke you can see, so how tightly it is packed is its pitch. A line
       of phosphor with a body of glow inside its envelope.

       The distance to the line is the nearest of nine samples either side,
       not the vertical distance divided through by the slope: that shortcut
       is only true close to the line, and on a steep stroke it lit the whole
       column above and below it. */
    '  float dt = u_win / u_box.z;\n' +
    '  float d = 1e4;\n' +
    '  for (int k = -4; k <= 4; k++) {\n' +
    '    float kx = float(k) * 0.75 * u_px;\n' +
    '    d = min(d, length(vec2(kx, dy - amp * sig(t + kx * dt))));\n' +
    '  }\n' +
    '  float line = exp(-pow(d / (0.7 * u_px), 2.0)) + 0.3 * exp(-d / (2.2 * u_px));\n' +
    '  float body = step(abs(dy), amp * env(t)) * 0.09;\n' +
    '  light += (line + body) * inX * bright;\n' +

    /* The second note, distinct rather than summed into the first: its
       envelope as a dashed outline, and a tick at every cycle of it, so its
       pitch is how close the ticks stand. */
    '  if (u_two > 0.5) {\n' +
    '    float t2 = t - u_lag;\n' +
    '    float e2 = env(t2);\n' +
    '    float live = step(0.0, t2) * step(0.004, e2);\n' +
    '    float edge = abs(abs(dy) - amp * e2);\n' +
    '    float dash = step(0.45, fract(fc.x / (5.0 * u_px)));\n' +
    '    float outline = exp(-pow(edge / (0.65 * u_px), 2.0)) * dash;\n' +
    '    float ms = abs(fract(u_cyc2 * t2 + 0.5) - 0.5) / max(u_cyc2, 1e-5);\n' +
    '    float tick = (1.0 - smoothstep(0.3 * u_px, 1.1 * u_px, ms / dt)) * step(abs(dy), amp * e2);\n' +
    '    light2 += (outline * 1.15 + tick * 0.4) * live * inX * bright;\n' +
    '  }\n' +

    /* The playhead, while it is crossing. */
    '  if (u_calm < 0.5 && u_now < u_win) {\n' +
    '    float xs = u_box.x + u_scan / u_win * u_box.z;\n' +
    '    light += exp(-pow((fc.x - xs) / (0.8 * u_px), 2.0)) * inY * 0.85;\n' +
    '  }\n' +

    /* Phosphor adds light; where it is brightest it burns towards white,
       which is what reads as glow rather than as a coloured line. The second
       note is drawn a step whiter than the first, so the two stay apart. */
    '  vec3 phos = u_phos * light + mix(u_phos, vec3(1.0), 0.45) * light2;\n' +
    '  phos += vec3(1.0) * pow(max(light + light2 - 0.85, 0.0), 2.0) * 0.35;\n' +
    '  col += phos;\n' +
    '  col += (hash(fc) - 0.5) * 0.01;\n' +
    '  col = clamp(col, 0.0, 1.0);\n' +
    '  vec3 srgb = mix(col * 12.92,\n' +
    '                  1.055 * pow(max(col, 1e-5), vec3(1.0 / 2.4)) - 0.055,\n' +
    '                  step(vec3(0.0031308), col));\n' +
    '  fragColor = vec4(srgb, 1.0);\n' +
    '}\n';

  var UNIFORMS = ['u_res', 'u_box', 'u_px', 'u_win', 'u_att', 'u_dec', 'u_lag',
    'u_two', 'u_cyc1', 'u_cyc2', 'u_parts', 'u_timbre', 'u_air', 'u_room', 'u_now',
    'u_scan', 'u_persist', 'u_calm', 'u_glass', 'u_phos'];

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function getGpu() {
    if (gpu !== undefined) return gpu;
    gpu = null;

    if (typeof OffscreenCanvas !== 'function') return gpu;

    var off;
    try { off = new OffscreenCanvas(2, 2); } catch (err) { return gpu; }
    if (typeof off.transferToImageBitmap !== 'function') return gpu;

    var gl = off.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, stencil: false,
      preserveDrawingBuffer: false, powerPreference: 'low-power'
    });
    if (!gl) return gpu;

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return gpu;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return gpu;

    gl.useProgram(prog);
    var u = {};
    UNIFORMS.forEach(function (name) { u[name] = gl.getUniformLocation(prog, name); });

    gpu = { canvas: off, gl: gl, u: u, w: 0, h: 0 };
    return gpu;
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
    var traceFrom = root.querySelector('[data-trace-from]');
    var traceLag = root.querySelector('[data-trace-lag]');
    var voiceLine = root.querySelector('[data-rosette]');

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
      var gesture = spec.notes.length > 1;

      /* The stylesheet draws the envelope and lights the LED from this, so
         the CSS picture follows the strike with no second copy of the
         mapping here. */
      root.setAttribute('data-shown', tone);

      if (traceName) traceName.textContent = spec.label;
      if (traceFrom) traceFrom.textContent = gesture ? Math.round(hz(pal, pal.steps.tap)) + ' \u2192' : '';
      if (traceFreq) traceFreq.textContent = Math.round(hz(pal, pal.steps[last.step]));
      if (traceLag) {
        traceLag.textContent = gesture
          ? '+' + Math.round(pal.times[tone] * pal.spread) + ' ms'
          : 'one note';
      }
      if (traceAttack) traceAttack.textContent = Math.round(pal.attack);
      if (traceDecay) traceDecay.textContent = Math.round(pal.decay);

      if (spoke && traceLive) traceLive.textContent = says(tone, pal);
    }

    /* The palette list and the pad steps, printed from the properties rather
       than kept as a second copy of them. This is what makes the block at the
       top of component.css the single source: override a value from outside
       and the component says the new one. */
    function label(pal) {
      var cells = {
        root: Math.round(pal.root) + ' Hz',
        voice: (SHORT_TIMBRE[pal.timbre] || pal.timbre) + ' ' +
          ratio(pal.partial) + '× ' + ratio(pal.shimmer) + '×',
        envelope: Math.round(pal.attack) + '/' + Math.round(pal.decay) + ' ms',
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

      if (voiceLine) voiceLine.setAttribute('d', rosette(partialsOf(pal), pal.timbre));
    }

    /* --- the screen --------------------------------------------------------
       The shader draws the struck sound on the glass. It keeps no clock of its
       own: the trace's `struck-tones-cool` animation starts with the strike,
       and each frame reads that animation's currentTime — so the sweep is in
       step with the CSS playhead, and when the index pauses every animation
       in a preview this pauses with them. The loop runs only while a strike
       is in flight; the rest of the time the screen is one still frame,
       redrawn when a token, the size or the struck sound changes. */
    var trace = root.querySelector('.' + ROOT + '__trace');
    var canvas = root.querySelector('[data-screen]');
    var envelope = root.querySelector('.' + ROOT + '__envelope');
    var calm = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    var screen = { ctx: null, w: 0, h: 0, scale: 1, box: null, frame: 0,
      pal: null, glass: null, phos: null };

    function readScreenColours() {
      var s = getComputedStyle(root);
      screen.glass = readColour(s.getPropertyValue(CHANNEL + 'screen').trim(), [0.0033, 0.0075, 0.0048]);
      screen.phos = readColour(s.getPropertyValue(CHANNEL + 'phosphor').trim(), [0.38, 0.91, 0.21]);
    }

    /* The buffer is sized for the pixels that will actually be shown. A card
       lays its preview out at 480 and shows it at 0.7, and --buffer-scale
       carries that factor in from the index; anywhere else it is 1 and this
       is the device ratio. The envelope's box is measured in the same pixels,
       because that is where the drawing goes. */
    function measure() {
      var rect = canvas.getBoundingClientRect();
      var env = envelope.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;

      var k = (window.devicePixelRatio || 1) * screen.pal.bufferScale;
      var w = Math.max(1, Math.round(rect.width * k));
      var h = Math.max(1, Math.round(rect.height * k));
      if (w * h > MAX_BUFFER_PX) {
        var f = Math.sqrt(MAX_BUFFER_PX / (w * h));
        w = Math.max(1, Math.round(w * f));
        h = Math.max(1, Math.round(h * f));
      }

      if (w !== screen.w || h !== screen.h) {
        screen.w = w;
        screen.h = h;
        canvas.width = w;
        canvas.height = h;
      }

      var sx = w / rect.width;
      var sy = h / rect.height;
      screen.scale = sx;
      screen.box = [
        (env.left - rect.left) * sx,
        (rect.bottom - env.bottom) * sy,
        env.width * sx,
        env.height * sy
      ];
      return true;
    }

    function clock() {
      if (!trace || !trace.getAnimations) return null;
      var list = trace.getAnimations();
      for (var i = 0; i < list.length; i++) {
        if (list[i].animationName === 'struck-tones-cool') return list[i];
      }
      return null;
    }

    function draw() {
      var g = getGpu();
      if (!g || !canvas || !envelope || !screen.pal) return;
      if (!measure()) return;

      if (!screen.ctx) {
        try { screen.ctx = canvas.getContext('bitmaprenderer'); } catch (err) { screen.ctx = null; }
        if (!screen.ctx) return;
      }

      var gl = g.gl;
      if (g.w !== screen.w || g.h !== screen.h) {
        g.canvas.width = screen.w;
        g.canvas.height = screen.h;
        g.w = screen.w;
        g.h = screen.h;
        gl.viewport(0, 0, screen.w, screen.h);
      }

      var pal = screen.pal;
      var spec = TONES[shown];
      var last = spec.notes[spec.notes.length - 1];
      var two = spec.notes.length > 1;
      var tmax = Math.max(pal.times.commit, pal.times.revert, pal.times.alert);
      var win = tmax * pal.spread + pal.attack + pal.decay;
      var still = calm && calm.matches;

      /* No strike in flight is a strike long ago: everything at rest. */
      var now = 1e7;
      var scan = win;
      var anim = clock();
      if (anim && anim.currentTime !== null) {
        now = Number(anim.currentTime);
        scan = still ? win : Math.min(now, win);
      }

      var u = g.u;
      gl.uniform2f(u.u_res, screen.w, screen.h);
      gl.uniform4f(u.u_box, screen.box[0], screen.box[1], screen.box[2], screen.box[3]);
      gl.uniform1f(u.u_px, screen.scale);
      gl.uniform1f(u.u_win, win);
      gl.uniform1f(u.u_att, Math.max(pal.attack, 1));
      gl.uniform1f(u.u_dec, Math.max(pal.decay, 1));
      gl.uniform1f(u.u_lag, two ? pal.times[shown] * pal.spread : 0);
      gl.uniform1f(u.u_two, two ? 1 : 0);
      gl.uniform1f(u.u_cyc1, hz(pal, pal.steps.tap) / 1000 / pal.timebase);
      gl.uniform1f(u.u_cyc2, hz(pal, pal.steps[last.step]) / 1000 / pal.timebase);
      gl.uniform4f(u.u_parts, pal.partial, pal.partialLevel, pal.shimmer, pal.shimmerLevel);
      gl.uniform1i(u.u_timbre, Math.max(0, TIMBRES.indexOf(pal.timbre)));
      gl.uniform1f(u.u_air, Math.min(Math.max(pal.air, 0), 1));
      gl.uniform1f(u.u_room, Math.max(pal.airSize, 0) * 1000);
      gl.uniform1f(u.u_now, now);
      gl.uniform1f(u.u_scan, scan);
      gl.uniform1f(u.u_persist, pal.persist);
      gl.uniform1f(u.u_calm, still ? 1 : 0);
      gl.uniform3fv(u.u_glass, screen.glass);
      gl.uniform3fv(u.u_phos, screen.phos);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      screen.ctx.transferFromImageBitmap(g.canvas.transferToImageBitmap());
      if (!trace.hasAttribute('data-drawn')) trace.setAttribute('data-drawn', '');
    }

    /* A root that has left the document stops for good. getComputedStyle on
       a detached element returns empty strings, every token falls back to its
       default and --run reads as 1 again, so a loop left to check would undo
       any pause written on the way out. */
    function tick() {
      screen.frame = 0;
      if (!root.isConnected) return;
      draw();
      var anim = clock();
      if (anim && anim.playState === 'running' && screen.pal.run && !document.hidden) {
        screen.frame = requestAnimationFrame(tick);
      }
    }

    function kick() {
      if (screen.frame || !getGpu() || !root.isConnected) return;
      if (!screen.pal.run || document.hidden) { draw(); return; }
      screen.frame = requestAnimationFrame(tick);
    }

    function halt() {
      if (screen.frame) cancelAnimationFrame(screen.frame);
      screen.frame = 0;
    }

    function redraw() {
      if (!screen.frame && root.isConnected) draw();
    }

    function refresh() {
      var pal = palette(root);
      screen.pal = pal;
      readScreenColours();
      label(pal);
      show(shown, pal, false);

      /* --run is the index's pause arriving as a token. A strike held
         mid-flight picks up where it was when it comes back. */
      if (!pal.run) { halt(); redraw(); return; }
      var anim = clock();
      if (anim && anim.playState === 'running') kick();
      else redraw();
    }

    /* --- striking ---------------------------------------------------------
       One strike, whoever asks for it: a press, or the `--live` clock below.
       The read-out and the drawing follow either way. Only a press can sound
       and only a press speaks to a screen reader, because the clock is the
       component demonstrating itself and nobody asked it anything. */
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

      screen.pal = pal;
      halt();
      kick();
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

    /* The trace's strike ends when the glass has cooled, which is the clock
       animation finishing — the playhead is over sooner. One still frame
       after it, so the screen settles exactly at rest. */
    if (trace) {
      trace.addEventListener('animationend', function (event) {
        if (event.target !== trace || event.animationName !== 'struck-tones-cool') return;
        trace.removeAttribute('data-hit');
        halt();
        redraw();
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

    /* A still frame still has to be a correct one: the envelope's box moves
       when fonts land or the column narrows, so the screen is redrawn with
       it. */
    if (window.ResizeObserver && trace) {
      new ResizeObserver(redraw).observe(trace);
    }

    if (calm) {
      var follow = function () { redraw(); };
      if (calm.addEventListener) calm.addEventListener('change', follow);
      else if (calm.addListener) calm.addListener(follow);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { halt(); return; }
      var anim = clock();
      if (anim && anim.playState === 'running') kick();
    });

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
