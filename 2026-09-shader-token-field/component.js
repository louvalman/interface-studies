/*
  2026-09-shader-token-field — no framework, no build step, no dependency.

  What this file adds, and the order it matters in:

    1. It reads the token block. Every uniform the shader runs on comes from
       getComputedStyle on the component's own root — none of it is written
       twice. Re-theme the component from outside and the GPU's copy changes
       with the stop list, which is the test CLAUDE.md sets for a property
       block, applied to something that is not a colour.

    2. It draws the field on the GPU. One WebGL2 context for the whole
       document, blitted into every surface, because a browser caps live
       contexts and kills the oldest without saying so — and this page alone
       wants six.

    3. It prints the read-out, including the worst-case contrast ratio, which
       is computed from the ink token and the clamp token rather than
       asserted.

  Without it the component is still the component: the stop list is the same
  recipe from the same tokens, it moves under --live on its own, and the
  read-out in the markup states the same defaults. Script enhances; it does
  not constitute.
*/

(function () {
  'use strict';

  var P = '--shader-token-field-';
  var MAX_OCTAVES = 8;          /* the fbm loop's compile-time bound */
  var MAX_BUFFER_PX = 2200000;  /* a card is not worth four megapixels */

  /* ---------------------------------------------------------------- colour

     An unregistered custom property comes back from getComputedStyle as the
     string it was authored as, so `oklch(60% .1 150)` arrives as text and
     `parseFloat` gets nothing. Writing it to an element's `color` and reading
     the computed value back hands the parsing to the engine, which returns a
     resolved rgb()/color() function whatever went in — hex, named, hsl,
     oklch. One probe, reused, and only touched when a token changes. */
  var probe = null;

  function probeEl() {
    if (probe) return probe;
    probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;' +
      'clip-path:inset(50%);pointer-events:none';
    document.body.appendChild(probe);
    return probe;
  }

  function toLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  /* -> [r, g, b] in linear light, which is the space the clamp has to work
     in: WCAG relative luminance is a linear-light quantity, and clamping it
     in gamma space clamps the wrong number. */
  function readColour(value, fallback) {
    var el = probeEl();
    el.style.color = '';
    el.style.color = value;
    var resolved = getComputedStyle(el).color;
    var parts = resolved.match(/[-\d.]+(?:e[-+]?\d+)?/gi);
    if (!parts || parts.length < 3) return fallback;

    var srgb = resolved.indexOf('color(') === 0
      ? [+parts[0], +parts[1], +parts[2]]
      : [parts[0] / 255, parts[1] / 255, parts[2] / 255];

    var out = [];
    for (var i = 0; i < 3; i++) {
      var c = srgb[i];
      out.push(toLinear(c < 0 ? 0 : c > 1 ? 1 : c));
    }
    return out;
  }

  function luminance(lin) {
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  }

  /* ----------------------------------------------------------------- tokens */

  function readTokens(root) {
    var s = getComputedStyle(root);

    function num(name, fallback) {
      var v = parseFloat(s.getPropertyValue(P + name));
      return isFinite(v) ? v : fallback;
    }

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

    var floor = clamp(num('lum-floor', 0.22), 0, 1);
    var ceil = clamp(num('lum-ceil', 0.72), 0, 1);
    if (ceil < floor) ceil = floor;

    return {
      /* The field. Clamped rather than trusted: the block is editable from
         outside by design, and an octave count is a loop bound. */
      scale: clamp(num('scale', 2.4), 0.05, 40),
      octaves: Math.round(clamp(num('octaves', 4), 1, MAX_OCTAVES)),
      warp: clamp(num('warp', 0.42), 0, 4),
      relief: clamp(num('relief', 0.9), 0, 3),
      grain: clamp(num('grain', 0.035), 0, 0.5),
      flow: clamp(num('flow', 0.05), 0, 8),

      base: readColour(s.getPropertyValue(P + 'base'), [0.65, 0.62, 0.52]),
      poolA: readColour(s.getPropertyValue(P + 'pool-a'), [0.29, 0.38, 0.28]),
      poolB: readColour(s.getPropertyValue(P + 'pool-b'), [0.53, 0.32, 0.13]),

      lumFloor: floor,
      lumCeil: ceil,
      ink: readColour(s.getPropertyValue(P + 'field-ink'), [0.006, 0.006, 0.005]),

      /* --gpu is a design value and the other two are not. --gpu picks which
         of the two renderings is on screen, which is a thing worth being able
         to ask for: the stop list is the recipe without the light, not a
         degraded copy of it. --run is the pause and --buffer-scale is the
         device-pixel factor, both written onto this element from outside. */
      run: num('run', 1) !== 0,
      gpu: num('gpu', 1) !== 0,
      bufferScale: clamp(num('buffer-scale', 1), 0.1, 4),
      settle: Math.max(1, num('settle', 900))
    };
  }

  /* The guarantee the band is making, stated as the number a reader would
     measure. Dark ink on a light field: the darkest pixel allowed is the
     worst case, so the floor decides it. Light ink on a dark field: the
     lightest is, so the ceiling does. */
  function worstRatio(t) {
    var ink = luminance(t.ink);
    var lo = Math.min(ink, t.lumFloor);
    var hi = Math.max(ink, t.lumCeil);
    if (ink > t.lumCeil) { lo = t.lumCeil; hi = ink; }
    else if (ink < t.lumFloor) { lo = ink; hi = t.lumFloor; }
    else { return 1; }
    return (hi + 0.05) / (lo + 0.05);
  }

  /* -------------------------------------------------------------------- GPU

     One context per document, shared by every surface on it. A browser caps
     live WebGL contexts — Chromium at sixteen — and drops the oldest with no
     warning, which on this site would be a card in the rail going blank for
     no visible reason: the rail is eight previews and growing, quick look
     opens a ninth, and this demo page alone holds six surfaces. So the
     drawing is done once, off screen, and handed to each canvas as an
     ImageBitmap.

     If any piece of that is missing the function returns null and nothing
     else happens: the stop list is already on screen and is already the
     component. */
  var gpu;

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
    'uniform float u_phase;\n' +
    'uniform vec3 u_base, u_poolA, u_poolB;\n' +
    'uniform float u_scale, u_warp, u_grain, u_relief;\n' +
    'uniform float u_floor, u_ceil;\n' +
    'uniform int u_octaves;\n' +
    'out vec4 fragColor;\n' +

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

    /* The loop bound is a compile-time constant because GLSL requires one;
       the token decides where it breaks. */
    'float fbm(vec2 p) {\n' +
    '  float a = 0.5, sum = 0.0, norm = 0.0;\n' +
    '  for (int i = 0; i < ' + MAX_OCTAVES + '; i++) {\n' +
    '    if (i >= u_octaves) break;\n' +
    '    sum += a * vnoise(p); norm += a;\n' +
    '    p *= 2.02; a *= 0.5;\n' +
    '  }\n' +
    '  return sum / max(norm, 1e-5);\n' +
    '}\n' +

    'void main() {\n' +
    /* Both axes over the same number, so the field is never stretched — and
       that number is the width, so the 7:1 band is a horizontal slice of the
       same material the 4:3 plate shows rather than a finer one. Over the
       height it would have been the same recipe at a seventh of the size,
       which reads as a different material standing next to itself. */
    '  vec2 p = (gl_FragCoord.xy / u_res.x) * u_scale;\n' +
    '  vec2 q = vec2(fbm(p + vec2(0.0, u_phase)),\n' +
    '                fbm(p + vec2(5.2, 1.3) - vec2(u_phase, 0.0)));\n' +
    '  float f = fbm(p + u_warp * 4.0 * q);\n' +
    '  float g = fbm(p * 1.7 + 11.0 + q);\n' +

    /* Linear light throughout. The pools gather, the base is what is left. */
    '  vec3 col = u_base;\n' +
    '  col = mix(col, u_poolA, smoothstep(0.30, 0.78, f));\n' +
    '  col = mix(col, u_poolB, smoothstep(0.42, 0.95, g) * 0.75);\n' +

    /* The light, and it is the reason the clamp is not decoration. Every
       line above is a convex blend, and relative luminance is linear, so a
       blend of colours inside the band is provably inside it: a clamp over a
       blend can never fire. This is not a blend. A narrow sheen sits on the
       ridge of the warped field and a shadow gathers in its troughs, and
       both SCALE the colour rather than mixing into it — which is what makes
       the field read as lit instead of as two colours poured together, and
       what walks it out of the band at both ends.

       Scaling rather than adding, because adding light is adding white.
       Added at the strength this needs it swamps the chroma of anything
       dark: the night version came out as grey plateaus, its palette gone.
       A scale preserves chromaticity exactly, so the field is the same
       colours lit harder. --relief is the gain, and the two versions do not
       share a value — a dark band is narrower, so the same gain moves a
       smaller fraction of it. */
    '  float ridge = 1.0 - abs(f * 2.0 - 1.0);\n' +
    '  col *= 1.0 + pow(ridge, 6.0) * u_relief;\n' +
    '  col *= 1.0 - smoothstep(0.42, 0.0, f) * u_relief * 0.45;\n' +

    /* Grain goes in BEFORE the clamp, so it cannot push a pixel out of the
       band it is the clamp's job to hold. */
    '  col += (hash(gl_FragCoord.xy + fract(u_phase)) - 0.5) * u_grain;\n' +
    '  col = clamp(col, 0.0, 1.0);\n' +

    /* The clamp, and the two halves are not symmetrical.

       Raising: mix toward white by (target - Y) / (1 - Y). Luminance is
       linear and the weights sum to one, so the result IS the target
       exactly, and a convex combination with white cannot leave the gamut.
       Scaling up would have been the obvious move and it is wrong: it clips a
       channel at 1.0, and the clip lands the fragment back under the floor —
       the guarantee fails precisely on the pixels that needed it.

       Lowering: scale. That cannot clip, and it hits the target exactly for
       the same reason. */
    '  float Y = dot(col, vec3(0.2126, 0.7152, 0.0722));\n' +
    '  if (Y < u_floor) {\n' +
    '    col = mix(col, vec3(1.0), (u_floor - Y) / max(1.0 - Y, 1e-5));\n' +
    '  } else if (Y > u_ceil) {\n' +
    '    col *= u_ceil / max(Y, 1e-5);\n' +
    '  }\n' +
    '  col = clamp(col, 0.0, 1.0);\n' +

    '  vec3 srgb = mix(col * 12.92,\n' +
    '                  1.055 * pow(max(col, 1e-5), vec3(1.0 / 2.4)) - 0.055,\n' +
    '                  step(vec3(0.0031308), col));\n' +
    '  fragColor = vec4(srgb, 1.0);\n' +
    '}\n';

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
    ['u_res', 'u_phase', 'u_base', 'u_poolA', 'u_poolB', 'u_scale', 'u_warp',
      'u_grain', 'u_relief', 'u_floor', 'u_ceil', 'u_octaves'].forEach(function (name) {
      u[name] = gl.getUniformLocation(prog, name);
    });

    gpu = { canvas: off, gl: gl, u: u, w: 0, h: 0 };
    return gpu;
  }

  /* ---------------------------------------------------------------- a root */

  function setup(root) {
    var surfaces = Array.prototype.slice
      .call(root.querySelectorAll('[data-shader-token-field-surface]'))
      .map(function (el) {
        var canvas = el.querySelector('[data-shader-token-field-canvas]');
        return canvas ? { el: el, canvas: canvas, ctx: null, w: 0, h: 0 } : null;
      })
      .filter(Boolean);

    var values = {};
    Array.prototype.slice
      .call(root.querySelectorAll('[data-shader-token-field-value]'))
      .forEach(function (el) {
        values[el.getAttribute('data-shader-token-field-value')] = el;
      });

    var calm = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    var target = readTokens(root);
    var cur = JSON.parse(JSON.stringify(target));
    var phase = 0;
    var frame = 0;
    var last = 0;
    var drawing = getGpu() !== null;

    /* --- the read-out ------------------------------------------------- */

    function fixed(v, n) { return v.toFixed(n); }

    function paintReadout() {
      var t = target;
      function set(key, text) { if (values[key]) values[key].textContent = text; }

      set('scale', fixed(t.scale, 1) + ' · ' + t.octaves + ' oct');
      set('warp', fixed(t.warp, 2) + ' \u00b7 ' + fixed(t.relief, 2));
      set('flow', fixed(t.flow, 2) + ' / s');
      set('band', fixed(t.lumFloor, 2) + ' – ' + fixed(t.lumCeil, 2) + ' Y');
      set('ratio', fixed(worstRatio(t), 2) + ':1');
      set('renderer', drawing && target.gpu ? 'Shader' : 'Stop list');
    }

    /* --- sizing --------------------------------------------------------

       The buffer is sized for the pixels that will actually be shown, which
       is not the same as the pixels this document is laid out in. A card lays
       its preview out at 480 and shows it at 336, so every device pixel the
       shader draws is 0.7 of one — and the grain, which is one hash per
       fragment, is the part that notices. --buffer-scale carries that factor
       in from the index; anywhere else it is 1 and this is just the device
       ratio. */
    function measure(surface) {
      var rect = surface.el.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;

      var dpr = (window.devicePixelRatio || 1) * cur.bufferScale;
      var w = Math.max(1, Math.round(rect.width * dpr));
      var h = Math.max(1, Math.round(rect.height * dpr));

      var px = w * h;
      if (px > MAX_BUFFER_PX) {
        var k = Math.sqrt(MAX_BUFFER_PX / px);
        w = Math.max(1, Math.round(w * k));
        h = Math.max(1, Math.round(h * k));
      }

      if (w === surface.w && h === surface.h) return true;
      surface.w = w;
      surface.h = h;
      surface.canvas.width = w;
      surface.canvas.height = h;
      return true;
    }

    /* --- drawing -------------------------------------------------------

       Surfaces are drawn smallest-first so that the shared buffer is resized
       once per distinct size rather than once per surface: this page holds
       three plates and three bands, which is two reallocations a frame
       instead of six. */
    function draw() {
      var g = getGpu();
      if (!g) return;
      if (!target.gpu) return;

      var order = surfaces.filter(measure).sort(function (a, b) {
        return (a.w * a.h) - (b.w * b.h);
      });

      var gl = g.gl;

      for (var i = 0; i < order.length; i++) {
        var s = order[i];

        if (!s.ctx) {
          try { s.ctx = s.canvas.getContext('bitmaprenderer'); } catch (err) { s.ctx = null; }
          if (!s.ctx) continue;
        }

        if (g.w !== s.w || g.h !== s.h) {
          g.canvas.width = s.w;
          g.canvas.height = s.h;
          g.w = s.w;
          g.h = s.h;
          gl.viewport(0, 0, s.w, s.h);
        }

        gl.uniform2f(g.u.u_res, s.w, s.h);
        gl.uniform1f(g.u.u_phase, phase);
        gl.uniform3fv(g.u.u_base, cur.base);
        gl.uniform3fv(g.u.u_poolA, cur.poolA);
        gl.uniform3fv(g.u.u_poolB, cur.poolB);
        gl.uniform1f(g.u.u_scale, cur.scale);
        gl.uniform1f(g.u.u_warp, cur.warp);
        gl.uniform1f(g.u.u_grain, cur.grain);
        gl.uniform1f(g.u.u_relief, cur.relief);
        gl.uniform1f(g.u.u_floor, cur.lumFloor);
        gl.uniform1f(g.u.u_ceil, cur.lumCeil);
        gl.uniform1i(g.u.u_octaves, cur.octaves);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        s.ctx.transferFromImageBitmap(g.canvas.transferToImageBitmap());
        if (!s.el.hasAttribute('data-shader-token-field-drawn')) {
          s.el.setAttribute('data-shader-token-field-drawn', '');
        }
      }
    }

    /* --- the loop -------------------------------------------------------

       Uniforms chase their target rather than snapping to it, so a --live
       class or a theme change arrives on the GPU's copy the way the stop
       list's own transition arrives: --settle is the time constant.

       What is advected is a phase this accumulates, not the clock. Passing
       raw time would make a change of --flow rewrite where the field already
       is, and the field would jump at the moment it was asked to speed up. */
    var SCALARS = ['scale', 'warp', 'relief', 'grain', 'flow', 'lumFloor', 'lumCeil'];
    var COLOURS = ['base', 'poolA', 'poolB'];

    function chase(dt) {
      var k = 1 - Math.exp(-dt / (target.settle / 1000));
      var moved = false;

      SCALARS.forEach(function (key) {
        var d = target[key] - cur[key];
        if (Math.abs(d) > 1e-4) { cur[key] += d * k; moved = true; }
        else cur[key] = target[key];
      });

      COLOURS.forEach(function (key) {
        for (var i = 0; i < 3; i++) {
          var d = target[key][i] - cur[key][i];
          if (Math.abs(d) > 1e-4) { cur[key][i] += d * k; moved = true; }
          else cur[key][i] = target[key][i];
        }
      });

      cur.octaves = target.octaves;
      cur.bufferScale = target.bufferScale;
      return moved;
    }

    function tick(now) {
      frame = 0;
      var dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;

      chase(dt);
      phase += dt * cur.flow;
      draw();
      schedule();
    }

    /* Two things stop the loop, and neither is a CSS rule, because no CSS
       rule can reach one. --run is the index's pause, arriving as a token on
       this element. Reduced motion is the reader's, and it means one frame
       and no more — not a slower field. */
    function schedule() {
      if (frame || !drawing) return;
      if (!target.run || !target.gpu) return;
      if (calm && calm.matches) return;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      last = 0;
    }

    /* Handing the surface back to the stop list. The canvas keeps whatever it
       last drew — there is no way to un-draw it — so what is taken away is the
       attribute the stylesheet fades it in on. */
    function yieldSurfaces() {
      surfaces.forEach(function (s) {
        s.el.removeAttribute('data-shader-token-field-drawn');
      });
    }

    /* A still frame still has to be a correct one: when the loop is not
       running, a token change or a resize snaps the uniforms and redraws
       once, so a paused card is the current component rather than a stale
       picture of the last one. */
    function still() {
      chase(10);
      SCALARS.forEach(function (k) { cur[k] = target[k]; });
      COLOURS.forEach(function (k) { cur[k] = target[k].slice(); });
      draw();
    }

    function refresh() {
      target = readTokens(root);
      paintReadout();

      if (!target.gpu) {
        stop();
        yieldSurfaces();
      } else if (!target.run || (calm && calm.matches)) {
        stop();
        still();
      } else {
        last = 0;
        schedule();
      }
    }

    /* Everything the outside world says to this component, it says in the
       cascade: --live lands as a class, the pause and the buffer scale land
       as inline custom properties. One observer catches all three, and
       nothing is read per frame. */
    if (window.MutationObserver) {
      new MutationObserver(refresh).observe(root, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (frame || !drawing) return;
        still();
      }).observe(root);
    }

    if (calm) {
      var follow = function () { refresh(); };
      if (calm.addEventListener) calm.addEventListener('change', follow);
      else if (calm.addListener) calm.addListener(follow);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else { last = 0; schedule(); }
    });

    paintReadout();
    if (!drawing || !target.gpu) return;
    if (calm && calm.matches) still();
    else schedule();
  }

  function boot() {
    Array.prototype.slice
      .call(document.querySelectorAll('.shader-token-field'))
      .forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
