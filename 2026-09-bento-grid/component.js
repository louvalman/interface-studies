/*
  Behaviour for the bento grid, and only the part CSS cannot do.

  A grid cannot tween a re-pack. Track counts are not interpolable and neither
  is a tile's placement, so when the board changes arrangement every tile is
  simply somewhere else on the next frame. CSS can soften the moment — this
  study did, with a dip — but softening a cut is not moving anything. The View
  Transitions API moves them: it snapshots the old layout, lets the change
  happen, snapshots the new one, and animates each named element from where it
  was to where it ended up.

  Everything here is enhancement. With this file deleted the component still
  works: the tiles are <details>, so they open and close natively, and the
  column ladder falls back to the keyframes in component.css. Nothing below
  creates behaviour; it only makes existing behaviour move.

  No framework, no build step, no dependency.
*/
(function () {
  'use strict';

  /* One rung of the ladder. Slower than the CSS keyframes it replaces (600ms),
     because a rung that morphs needs time to read as a move rather than as a
     flicker, and the morph itself runs for MORPH_MS of it. */
  var RUNGS = [4, 3, 2, 1];
  var RUNG_MS = 1200;

  /* Kept in step with the fallback in component.css by hand — a pseudo-element
     on the document root cannot read a custom property that lives on the
     component, so the value is published to :root for the length of a
     transition and the stylesheet carries this same number as its literal. */
  var MORPH_MS = 460;

  var motion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false, addEventListener: function () {} };

  /* Support is a property of the browser; the preference is a property of the
     reader and can change while the page is open, so it is asked each time
     rather than resolved once. */
  var CAN_MORPH = typeof document.startViewTransition === 'function';

  function willMorph() {
    return CAN_MORPH && !motion.matches;
  }

  var boards = document.querySelectorAll('.bento-grid');
  Array.prototype.forEach.call(boards, setup);

  function setup(root, index) {
    var board = root.querySelector('.bento-grid__board');
    if (!board) return;

    var tiles = root.querySelectorAll('.bento-grid__tile');

    /* A view-transition-name has to be unique across the whole document, and a
       page may hold several of these boards — demo.html holds four. So the
       name carries the board's index as well as the tile's.

       They are set for the length of a transition and taken off again rather
       than left on. Every named element in the document takes part in every
       transition, whether or not it moved: left on, opening one tile on
       demo.html would animate twenty-eight elements to say something about
       seven of them. */
    function label(on) {
      Array.prototype.forEach.call(tiles, function (tile, i) {
        tile.style.viewTransitionName = on
          ? 'bento-grid-' + index + '-' + i
          : '';
      });
    }

    function change(apply) {
      if (!willMorph()) {
        apply();
        return;
      }

      /* The attribute is what lets component.css hand the page's clicks back
         while this component's transition is running, and only then — see
         "the page stays live" there. It goes on and comes off with the
         duration, on the same element and for the same reason. */
      label(true);
      document.documentElement.style.setProperty('--bento-grid-morph', MORPH_MS + 'ms');
      document.documentElement.setAttribute('data-bento-grid-morph', '');

      var transition;
      try {
        transition = document.startViewTransition(apply);
      } catch (err) {
        /* A transition already running, or the document not in a state that
           allows one. The change still has to happen. */
        done();
        apply();
        return;
      }

      transition.finished.then(done, done);

      function done() {
        label(false);
        document.documentElement.style.removeProperty('--bento-grid-morph');
        document.documentElement.removeAttribute('data-bento-grid-morph');
      }
    }

    /* Published on the board so whatever is laying this component out can ask
       for its own arrangement change to be animated the same way. preview.html
       rotates through column counts and calls this; anything that does not
       know about it just sets the property and gets the old hard cut. */
    board.bentoGridChange = change;

    /* Tells component.css that the keyframe fallbacks can stand down. Set only
       where the morph is actually available, so a browser without it keeps the
       softening it had. */
    if (CAN_MORPH) root.classList.add('bento-grid--scripted');

    Array.prototype.forEach.call(
      root.querySelectorAll('.bento-grid__face'),
      function (face) {
        face.addEventListener('click', function (event) {
          var panel = face.parentNode;
          if (!panel || panel.tagName !== 'DETAILS') return;

          /* Let the element do its own job. `preventDefault` below is the only
             reason this listener exists, and it is not worth calling unless
             something is going to happen instead. */
          if (!willMorph()) return;

          event.preventDefault();
          change(function () { panel.open = !panel.open; });
        });
      }
    );

    if (root.classList.contains('bento-grid--cycling')) ladder(board, change);
  }

  function ladder(board, change) {
    var at = 0;
    var timer = 0;

    function step() {
      at = (at + 1) % RUNGS.length;
      change(function () {
        board.style.setProperty('--bento-grid-cols', RUNGS[at]);
      });
    }

    function run() {
      halt();
      if (motion.matches || document.hidden) return;
      timer = setInterval(step, RUNG_MS);
    }

    function halt() {
      clearInterval(timer);
      timer = 0;
    }

    board.style.setProperty('--bento-grid-cols', RUNGS[0]);
    run();

    /* A board stepping through four arrangements in a tab nobody is looking at
       is four layouts and four transitions a second and a half, for nothing. */
    document.addEventListener('visibilitychange', run);

    if (motion.addEventListener) motion.addEventListener('change', run);
    else if (motion.addListener) motion.addListener(run);
  }
})();
