// --- sound ----------------------------------------------------------
// Off on every load, never stored, never in a link: a page that makes a
// noise is asked each time. The switch makes no sound itself. What on and
// off mean is the study's, said by page.sound in one of two shapes. Every
// [data-sound-toggle] on the page is the one switch, the top bar's and
// any local mirror: either copy switches all of them and all of them
// report it. Without Web Audio, or with nothing to reach, every copy stays
// hidden.
(function () {
  var spec = page.sound;
  var toggles = slice(document.querySelectorAll('[data-sound-toggle]'));
  if (!spec || !toggles.length) return;
  if (!(window.AudioContext || window.webkitAudioContext)) return;
  var on = false;

  function report() {
    toggles.forEach(function (t) { t.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  function offer(flip) {
    toggles.forEach(function (t) { t.addEventListener('click', flip); t.hidden = false; });
    report();
  }

  // A token: the component is silent until its root is given a level, so
  // on hands spec.token = spec.value inline to every spec.roots — on the
  // root itself, where a declaration on a wrapper would lose to the root's
  // own default — and off takes it out. Roots are found on every switch.
  if (spec.token) {
    var hand = function () {
      slice(document.querySelectorAll(spec.roots)).forEach(function (el) {
        if (on) el.style.setProperty(spec.token, spec.value);
        else el.style.removeProperty(spec.token);
      });
    };
    offer(function () { on = !on; report(); hand(); });
    hand();
    return;
  }

  // Arm switches: the component owns its own and builds its AudioContext
  // inside the click on one. So this presses them rather than reaching
  // past them, inside its own click (the gesture the audio policy wants),
  // and reads its state back off them: on while any is armed. A component
  // enables its switches when it boots, so this starts a turn after every
  // DOMContentLoaded listener has run, whatever order the scripts loaded
  // in.
  if (spec.arms) {
    var start = function () {
      var arms = slice(document.querySelectorAll(spec.arms))
        .filter(function (arm) { return !arm.disabled; });
      if (!arms.length) return;
      var armed = function (arm) { return arm.getAttribute('aria-pressed') === 'true'; };
      var read = function () { on = arms.some(armed); report(); };
      if (window.MutationObserver) {
        var watch = new MutationObserver(read);
        arms.forEach(function (arm) {
          watch.observe(arm, { attributes: true, attributeFilter: ['aria-pressed'] });
        });
      }
      offer(function () {
        var next = !on;
        arms.forEach(function (arm) { if (armed(arm) !== next) arm.click(); });
        read();
      });
      read();
    };
    var later = function () { setTimeout(start, 0); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later);
    else later();
  }
})();
