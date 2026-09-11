/*
  Liquid glass toolbar — the only interaction CSS cannot reach on its own.

  This file writes two attributes and nothing else: `aria-current` on the
  destinations, `aria-expanded` on the panel button. Every visible consequence —
  the lozenge, the label opening from zero, the pill becoming a card — is a CSS
  rule reading those attributes. Nothing here measures, positions or animates,
  and the search field is not mentioned at all: it runs on :focus-within.

  Plain vanilla, no framework, no build step. Runs once on load; safe to load on
  a page with any number of toolbars, and safe to load twice.
*/

(function () {
  var ROOT = 'liquid-glass-toolbar';

  function all(scope, selector) {
    return Array.prototype.slice.call(scope.querySelectorAll(selector));
  }

  function setup(root) {
    if (root.dataset.lgtReady === 'true') return;
    root.dataset.lgtReady = 'true';

    var actions = all(root, '.' + ROOT + '__action');
    var panel = root.querySelector('.' + ROOT + '__action--panel');
    var input = root.querySelector('.' + ROOT + '__input');

    // The destinations: anything carrying aria-current is one of them.
    var places = actions.filter(function (el) {
      return el.hasAttribute('aria-current');
    });

    // `--open` and `--searching` are a starting state, not a lock. The moment
    // somebody actually touches the toolbar the attributes take over, so the
    // two cannot end up disagreeing about what is lit.
    function unpin() {
      root.classList.remove(ROOT + '--open');
      root.classList.remove(ROOT + '--searching');
    }

    // Where the lozenge goes back to when the panel closes. A panel is a detour,
    // not a destination — closing it should return you to where you were, not
    // leave the bar with nothing selected.
    var home = places[0];
    places.forEach(function (el) {
      if (el.getAttribute('aria-current') === 'page') home = el;
    });

    function mark(current) {
      places.forEach(function (el) {
        el.setAttribute('aria-current', el === current ? 'page' : 'false');
      });
    }

    function closePanel(restore) {
      unpin();
      if (!panel) return;
      panel.setAttribute('aria-expanded', 'false');
      if (restore) mark(home);
    }

    places.forEach(function (el) {
      el.addEventListener('click', function (event) {
        // The hrefs are placeholders in this reference; a real one navigates and
        // the server decides aria-current on the next page.
        event.preventDefault();
        home = el;
        unpin();
        mark(el);
        closePanel(false);
        if (input) input.blur();
      });
    });

    if (panel) {
      panel.addEventListener('click', function () {
        var open = panel.getAttribute('aria-expanded') === 'true'
          || root.classList.contains(ROOT + '--open');
        unpin();
        panel.setAttribute('aria-expanded', open ? 'false' : 'true');
        // Only one thing is lit at a time, and while the panel is open it is
        // the panel — same rule the CSS applies to the search field.
        mark(open ? home : null);
        if (!open && input) input.blur();
      });
    }

    if (input) {
      input.addEventListener('focus', unpin);
    }

    root.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (input && document.activeElement === input) {
        input.blur();
        return;
      }
      closePanel(true);
    });

    // A panel that only closes from its own button is a panel you have to
    // remember to close.
    document.addEventListener('pointerdown', function (event) {
      if (root.contains(event.target)) return;
      if (!panel || panel.getAttribute('aria-expanded') !== 'true') return;
      closePanel(true);
    });
  }

  all(document, '.' + ROOT).forEach(setup);
})();
