(function () {
  // The page's chrome: the language switch, the theme switch, the Sound
  // switch where the study makes a noise, and the back link that hands the
  // first two to the index. This page's own part — its Danish and its
  // hooks — is window.demoPage, set by the <script data-demo-page> just
  // above.
  var page = window.demoPage || {};
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var back = document.querySelector('.demo__back');
  var LANG_KEY = 'interface-studies:lang';
  var THEME_KEY = 'interface-studies:theme';

  function slice(list) { return Array.prototype.slice.call(list); }
  function stored(key) { try { return localStorage.getItem(key); } catch (err) { return null; } }
  function store(key, value) { try { localStorage.setItem(key, value); } catch (err) { /* private mode */ } }
  function language(v) { return v === 'en' || v === 'da' ? v : null; }
  function theme(v) { return v === 'dark' || v === 'light' ? v : null; }

  // Only a choice travels: one handed over in the address, one stored, or
  // one made here. A default is not a choice, and the index would only
  // resolve it the same way. Both are resolved before anything writes the
  // back link, so it is never written from half an answer.
  var langFromQuery = language(params.get('lang'));
  var chosenLang = langFromQuery || language(stored(LANG_KEY));
  var chosenTheme = theme(params.get('theme')) || theme(stored(THEME_KEY));

  function syncBack() {
    if (!back) return;
    var q = [];
    if (chosenLang) q.push('lang=' + chosenLang);
    if (chosenTheme) q.push('theme=' + chosenTheme);
    back.setAttribute('href', '../index.html' + (q.length ? '?' + q.join('&') : ''));
  }

  // Keep the address in step with a choice, as the index does: left stale,
  // the query outranks the stored choice on the next reload and undoes it.
  function rewrite(name, value) {
    try {
      var url = new URL(location.href);
      if (value) url.searchParams.set(name, value);
      else url.searchParams.delete(name);
      history.replaceState(history.state, '', url);
    } catch (err) { /* file:// can refuse replaceState */ }
  }

  // A page's hook runs inside the chrome's own flow, so a hook that throws
  // is rethrown on its own turn rather than taking the switches down.
  function hook(fn, arg) {
    if (typeof fn !== 'function') return;
    try { fn(arg); } catch (err) { setTimeout(function () { throw err; }); }
  }

  // --- language -------------------------------------------------------
  (function () {
    // The switches' own strings. The page's are page.da, and a page key of
    // the same name would win, though the generator refuses one.
    var DA = {
      'a11y.lang': 'Sprog',
      'a11y.theme': 'Mørk tilstand',
      'sound': 'Lyd'
    };
    var own = page.da || {};
    Object.keys(own).forEach(function (key) { DA[key] = own[key]; });

    var nodes = slice(document.querySelectorAll('[data-i18n]'));
    var labelled = slice(document.querySelectorAll('[data-i18n-aria]'));
    var buttons = slice(document.querySelectorAll('.demo__lang [data-lang]'));
    var englishLabels = labelled.map(function (el) { return el.getAttribute('aria-label'); });
    /* innerHTML rather than textContent, on the capture and on the set
       alike. Several strings want markup the sentence needs — a <code>
       around a token name, a <strong> that numbers a step — and read with
       textContent the English fallback is captured already flattened, so the
       first apply() on load strips markup that was in the markup. Safe here
       in the way innerHTML usually is not: every string it sets is a literal
       in this file or in the page's table. Nothing from a URL, a field or a
       fetch reaches this line. */
    var english = nodes.map(function (el) { return el.innerHTML; });

    function apply(lang) {
      var table = lang === 'da' ? DA : null;
      nodes.forEach(function (el, i) {
        var key = el.getAttribute('data-i18n');
        el.innerHTML = table && table[key] ? table[key] : english[i];
      });
      labelled.forEach(function (el, i) {
        var key = el.getAttribute('data-i18n-aria');
        el.setAttribute('aria-label', table && table[key] ? table[key] : englishLabels[i]);
      });
      // The tab follows the heading, so the study's name is one string in
      // both places and both languages. <title> is the no-script fallback.
      var head = document.querySelector('.demo__heading');
      if (head) document.title = head.textContent.trim() + ' — Interface Studies';
      root.lang = lang;
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
      });
      syncBack();
      hook(page.applied, lang);
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        chosenLang = b.dataset.lang;
        store(LANG_KEY, chosenLang);
        rewrite('lang', chosenLang === 'en' ? null : chosenLang);
        apply(chosenLang);
      });
    });

    // A handover is a choice and is kept; a default is not.
    if (langFromQuery) store(LANG_KEY, langFromQuery);
    apply(chosenLang || 'en');
  })();

  /*{{SOUND}}*/

  // --- theme ----------------------------------------------------------
  // The answer is already on <html>: the head carries the same resolution.
  // The stylesheet reads the attribute and nothing else; the system
  // preference is resolved here so it stays live until someone picks.
  (function () {
    var toggle = document.querySelector('[data-theme-toggle]');
    var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function shown() { return chosenTheme || (media && media.matches ? 'dark' : 'light'); }

    function paint() {
      var t = shown();
      root.setAttribute('data-theme', t);
      if (toggle) toggle.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      syncBack();
    }

    var settle = 0;
    if (toggle) {
      toggle.addEventListener('click', function () {
        chosenTheme = shown() === 'dark' ? 'light' : 'dark';
        store(THEME_KEY, chosenTheme);
        rewrite('theme', chosenTheme);
        // Hung on <html> for its own length and taken off again, so the rule
        // is not on every element for the rest of the session.
        root.classList.add('is-theming');
        clearTimeout(settle);
        settle = setTimeout(function () { root.classList.remove('is-theming'); }, {{CROSSFADE_MS}});
        paint();
      });
    }

    if (media) {
      var follow = function () { if (!chosenTheme) paint(); };
      if (media.addEventListener) media.addEventListener('change', follow);
      else if (media.addListener) media.addListener(follow);
    }
    paint();
  })();
})();
