// Landing page chrome: the study rail and the quick-look overlay.
//
// Scrolling itself stays native — CSS scroll-snap does the snapping, this only
// nudges scrollLeft and keeps the chrome in sync. What it adds on top is the
// part the index was missing: the thumbnails are iframes with pointer-events
// off, so a card's component sat frozen at its resting state. The rail now
// tells a preview when its card is the one being looked at, and the preview
// decides what that means for its own component.
//
// The contract, deliberately generic — nothing here names a component class:
//
//   parent -> preview   { source: 'interface-studies', type: 'preview',
//                         active: true | false }
//   parent -> preview   { source: 'interface-studies', type: 'preview:variant',
//                         index: n }
//   parent -> preview   { source: 'interface-studies', type: 'preview:scale',
//                         scale: n }
//   preview -> parent   { source: 'interface-studies', type: 'preview:ready',
//                         variants?: [{ id, label }] }
//
// `preview:scale` is how much the preview's own pixels are being shrunk on
// screen: the card rail runs the preview at --preview-w and scales it to
// --preview-scale, and quick look measures its own factor against the
// viewport. A preview laying out at 480px and shown at 336 is being
// rasterised at 0.7 of the device ratio it can read for itself, which
// matters to anything sized in device pixels — a hairline, a mask's
// antialiasing ramp — and cannot be measured from inside the frame, since
// over file:// the parent is behind an opaque origin. Sent on ready and
// again whenever the factor changes.
//
// A preview that ignores all of it still renders correctly; it just doesn't
// move, and quick look shows it without dots.

// --- language ------------------------------------------------------------
//
// Site chrome only. A study's demo page is its own document and keeps its
// own copy; the strings inside a preview belong to that folder, so the variant
// labels quick look shows stay in whatever language the preview reports them.

(function () {
  const STORE_KEY = 'interface-studies:lang';

  const COPY = {
    da: {
      // Danish builds compounds, and 'interfacedesign' is one word at a 36px
      // hero — wider than a 320px line has to give, which is a sideways
      // scrollbar across the whole page. The soft hyphen is the compound's own
      // seam: invisible until the line actually needs it, breaking where a
      // Danish reader would break the word, and needing no hyphenation
      // dictionary, which is what `hyphens: auto` would be waiting on. A new
      // long compound in this table wants one too.
      'head.title': 'Små studier i interface\u00ADdesign.',
      'head.lede': 'Hvert studie tager en anden tilgang til én interfacedetalje '
        + '— et typografipar, en spatieringsrytme, en hover-adfærd — og bygger '
        + 'kun den, i ren HTML og CSS uden framework.',
      'head.ledeHint': 'Hold musen over et kort for at afspille det, eller åbn '
        + 'det i fuld størrelse.',
      'head.ledeHintTouch': 'Tryk på hurtigt kig for at afspille et kort, eller '
        + 'åbn det i fuld størrelse.',
      'meta.latest': 'Seneste',
      'rail.study': 'Studie',
      'type.card': 'Kort',
      'type.aesthetic': 'Æstetik',
      'type.navigation': 'Navigation',
      'filter.all': 'Alle',
      'piece.liquidGlassToolbar.title': 'Værktøjslinje i flydende glas',
      'piece.liquidGlassToolbar.note': 'Én glasflade der skifter form — det '
        + 'valgte punkt folder sig ud til en pille med etiket, søgning til et '
        + 'felt, loggen til et panel — i seks materialer fra én opskrift.',
      'cta.quickLookToolbar': 'Hurtigt kig: Værktøjslinje i flydende glas',
      'piece.inkedPlate.title': 'Kort med tegnede plader',
      'piece.inkedPlate.note': 'En billedplade og en tekstplade med afskårne '
        + 'hjørner mod hinanden, over et punktgitter med snitmærker. '
        + 'Stregtegningen tegner sig selv ved indlæsning i ren CSS — hver '
        + 'streg angiver en længde på 1, så ét sæt keyframes tegner dem alle '
        + 'uden at måle nogen af dem.',
      'cta.quickLookInked': 'Hurtigt kig: Kort med tegnede plader',
      'piece.rasterPulse.title': 'Rasterpuls',
      'piece.rasterPulse.note': 'Et plakatkort, hvis punktfelt selv regner '
        + 'sin form ud. Hvert punkt bærer intet andet end sin koordinat i '
        + 'gitteret; CSS udleder, om det hører til mønsteret, hvilken af to '
        + 'toner det får, og hvor det ligger i den puls, der vandrer gennem '
        + 'feltet.',
      'cta.quickLookRaster': 'Hurtigt kig: Rasterpuls',
      'piece.drawnGradients.title': 'Tegnede gradienter',
      'piece.drawnGradients.note': 'Gradientflader lavet ved at tegne nogle få '
        + 'overlappende SVG-former i flad farve og sløre dem til ukendelighed. '
        + 'En trappeformet silhuet lægger derefter fladen ind i en tekstblok, '
        + 'med trinnene på de samme linjer.',
      'cta.quickLookGradients': 'Hurtigt kig: Tegnede gradienter',
      'piece.detailReveal.title': 'Kort med detaljeafsløring',
      'piece.detailReveal.note': 'Et detaljepanel der stiger op fra bundkanten '
        + 'ved hover og skubber den hvilende etiket op foran sig. Rummer ethvert '
        + 'indhold; en kortvariant tilføjer højdekurver og en pulserende nål.',
      'cta.openDemo': 'Åbn demo',
      'cta.quickLook': 'Hurtigt kig',
      'cta.quickLookOf': 'Hurtigt kig: Kort med detaljeafsløring',
      'ghost.next': 'Den næste kommer her — kopiér _template/',
      'foot.blurb': 'Hvert studie er selvstændigt. Kopiér en mappe ud, og den '
        + 'virker uden noget andet herfra — intet delt stylesheet, intet '
        + 'byggetrin, ingen afhængighed af denne side.',
      'foot.sources': 'Nogle studier tager udgangspunkt i en grænseflade '
        + 'fundet andre steder; ingen er en kopi af en. Hver mappes notes.md '
        + 'nævner sin kilde og de beslutninger, den holder fast i.',
      'foot.typefaces': 'Skrifttyper',
      'foot.stack': 'Stack',
      'foot.stackVal': 'HTML og CSS, intet byggetrin',
      'foot.studies': 'Studier',
      'foot.builtBy': 'Bygget af',
      'foot.backToTop': 'Til toppen',
      'a11y.elsewhere': 'Andre steder',
      'a11y.carousel': 'Karrusel',
      'a11y.previous': 'Forrige',
      'a11y.next': 'Næste',
      'a11y.pauseRail': 'Sæt karrusellen på pause',
      'a11y.playRail': 'Start karrusellen igen',
      'a11y.railRegion': 'Studiekarrusel',
      'a11y.filter': 'Filtrér efter type',
      'a11y.variants': 'Varianter',
      'a11y.closeQuickLook': 'Luk hurtigt kig',
      'a11y.livePreview': 'Live forhåndsvisning af komponent'
    }
  };

  // English is what the markup already says, so it needs no table — switching
  // back restores the text captured on load.
  const buttons = Array.from(document.querySelectorAll('[data-lang]'));
  if (!buttons.length) return;

  const nodes = Array.from(
    document.querySelectorAll('[data-i18n], [data-i18n-aria], [data-i18n-title]')
  );

  const english = new Map();
  nodes.forEach((el) => {
    english.set(el, {
      text: el.textContent,
      aria: el.getAttribute('aria-label'),
      title: el.getAttribute('title')
    });
  });

  let current = 'en';

  function apply(lang) {
    const table = COPY[lang];
    current = lang;

    nodes.forEach((el) => {
      const base = english.get(el);
      const textKey = el.getAttribute('data-i18n');
      const ariaKey = el.getAttribute('data-i18n-aria');
      const titleKey = el.getAttribute('data-i18n-title');

      if (textKey) {
        el.textContent = table && table[textKey] ? table[textKey] : base.text;
      }
      if (ariaKey) {
        el.setAttribute('aria-label', table && table[ariaKey] ? table[ariaKey] : base.aria);
      }
      if (titleKey) {
        el.setAttribute('title', table && table[titleKey] ? table[titleKey] : base.title);
      }
    });

    document.documentElement.lang = lang;
    buttons.forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });

    // Demo pages are separate documents that carry their own copy, so the
    // choice travels in the link. Over file:// each document gets its own
    // opaque origin and localStorage does not carry across, which is why the
    // query string is the primary channel rather than a fallback.
    document.querySelectorAll('[data-lang-link]').forEach((link) => {
      const base = link.getAttribute('data-lang-link');
      link.setAttribute('href', lang === 'en' ? base : base + '?lang=' + lang);
    });

    // The lede's closing sentence is written by index.js, not by the markup,
    // so it is handed the table rather than reading a data-i18n key.
    document.dispatchEvent(new CustomEvent('lang:change', {
      detail: { lang: lang, copy: table || null }
    }));

    try { localStorage.setItem(STORE_KEY, lang); } catch (err) { /* private mode */ }
  }

  buttons.forEach((b) => {
    b.addEventListener('click', () => {
      apply(b.dataset.lang);

      // Keep ?lang= in step with the choice. Left stale, it would win over
      // the stored value on the next reload and undo the switch.
      try {
        const url = new URL(location.href);
        if (b.dataset.lang === 'en') url.searchParams.delete('lang');
        else url.searchParams.set('lang', b.dataset.lang);
        history.replaceState({}, '', url);
      } catch (err) { /* file:// can refuse replaceState */ }
    });
  });

  // A demo page hands the language back the same way it received it.
  const fromQuery = new URLSearchParams(location.search).get('lang');

  let saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (err) { /* private mode */ }

  const initial = fromQuery || saved;

  // Deferred by a microtask so every lang:change listener further down this
  // file is attached before the first one fires — otherwise script-written
  // copy like the lede's closing sentence misses the restore and stays
  // English.
  // apply() also rewrites the outgoing links, so English runs too — it has to
  // strip a ?lang= that an earlier switch left on them.
  queueMicrotask(() => apply(initial === 'da' ? 'da' : 'en'));
})();


(function () {
  const track = document.querySelector('[data-rail-track]');
  if (!track) return;

  // Enables the CSS that hides a preview until it is ready. Set from here so
  // the skeleton only ever exists while something is around to clear it.
  document.documentElement.classList.add('js');

  const CHANNEL = 'interface-studies';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(hover: none)');

  const prev = document.querySelector('[data-rail-prev]');
  const next = document.querySelector('[data-rail-next]');
  const driftBtn = document.querySelector('[data-rail-drift]');
  const progress = document.querySelector('[data-rail-progress]');
  const indexOut = document.getElementById('rail-index');
  const totalOut = document.getElementById('rail-total');
  const metaLatest = document.getElementById('meta-latest');
  const footCount = document.getElementById('foot-count');
  const ledeHint = document.querySelector('[data-lede-hint]');

  const pieces = () => Array.from(track.children);

  // Every card in the file, and the cards the rail is currently working with.
  // The filter takes cards out of the second without touching the first, so
  // the rail renumbers and re-counts around what is left while the masthead
  // and the footer go on stating how many studies there are.
  const allPieces = () => Array.from(track.querySelectorAll('[data-piece]'));
  const real = () =>
    pieces().filter(
      (el) => el.matches('[data-piece]') && !el.classList.contains('is-filtered')
    );

  const pad = (n) => String(n).padStart(2, '0');

  // Order is derived from each card's own date rather than from where its block
  // sits in the file. A date is a fact about the study and does not change
  // when someone else adds one; a position is not, and two sessions adding a
  // card at the front at the same time is exactly how a hand-kept order goes
  // wrong — git merges both and the winner is whichever way the merge fell.
  //
  // data-date is the key. Without it the folder name is the fallback, which is
  // YYYY-MM-slug and so carries a month and no day — a dated card therefore
  // sorts ahead of an undated one in the same month, which is the right way
  // round for a card whose date nobody wrote down.
  function orderKey(piece) {
    if (piece.dataset.date) return piece.dataset.date;
    const frame = piece.querySelector('[data-preview]');
    const src = frame
      ? frame.getAttribute('data-src') || frame.getAttribute('src') || ''
      : '';
    const found = /(\d{4})-(\d{2})-/.exec(src);
    return found ? found[1] + '-' + found[2] : '';
  }

  function order() {
    const list = real();
    const sorted = list.slice().sort((a, b) => {
      const ka = orderKey(a);
      const kb = orderKey(b);
      return ka === kb ? 0 : ka < kb ? 1 : -1;
    });

    // Array.prototype.sort is stable, so cards sharing a date keep the order
    // they were written in. And nothing is moved unless the order actually
    // differs: re-inserting an iframe reloads it, and the authored order is
    // usually already right, so the common case touches no DOM at all.
    if (sorted.every((piece, n) => piece === list[n])) return;

    const ghost = track.querySelector('.piece--ghost');
    sorted.forEach((piece) => track.insertBefore(piece, ghost));
  }

  // Card numbers are positional, so they are written from the list rather than
  // typed into it. Hand-maintained they were a second source of truth for
  // something the DOM order already says, and every study added above an
  // existing one silently invalidated all the numbers below it. Run once: the
  // list is static, and sync() is on the scroll path.
  function number() {
    real().forEach((piece, n) => {
      const out = piece.querySelector('.piece__no');
      if (out) out.textContent = pad(n + 1);
    });
  }

  // --- preview messaging ------------------------------------------------

  // Same-origin is not guaranteed: opened over file://, each document gets an
  // opaque origin, so '*' is the only target that lands. Nothing secret is
  // being sent, and previews validate the shape on the way in.
  function tell(piece, active) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame || !frame.contentWindow) return;
    if (active) piece.dataset.active = 'true';
    else delete piece.dataset.active;
    frame.contentWindow.postMessage(
      { source: CHANNEL, type: 'preview', active: active },
      '*'
    );
  }

  // A preview may not have parsed its listener yet when the pointer arrives,
  // so re-send once it announces itself.
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.source !== CHANNEL || data.type !== 'preview:ready') return;

    const piece = real().find((el) => {
      const frame = el.querySelector('[data-preview]');
      return frame && frame.contentWindow === event.source;
    });
    if (!piece) return;
    // Always, not only on the first pass: markReady is a one-shot, and the
    // ready message is the one moment a preview is known to be listening.
    tellScale(piece.querySelector('[data-preview]'), cardScale());
    markReady(piece);
  });

  // What a card multiplies its preview by. Breakpoint-driven, so it is read
  // fresh rather than cached.
  function cardScale() {
    const v = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--preview-scale')
    );
    return v > 0 ? v : 1;
  }

  function tellScale(frame, scale) {
    if (!frame || !frame.contentWindow || !(scale > 0)) return;
    frame.contentWindow.postMessage(
      { source: CHANNEL, type: 'preview:scale', scale: scale },
      '*'
    );
  }

  function markReady(piece) {
    if (piece.classList.contains('is-ready')) return;
    // A card that has been dropped since is holding about:blank, and the
    // backstop below outlives the load it was set for — so readiness is
    // checked against the frame rather than taken on trust.
    const held = piece.querySelector('[data-preview]');
    if (held && held.dataset.loaded !== 'true') return;
    piece.classList.add('is-ready');
    tellScale(piece.querySelector('[data-preview]'), cardScale());
    if (piece.dataset.active === 'true') tell(piece, true);
  }

  // --preview-scale changes at the breakpoint, so every card that already
  // took a factor has to be told the new one.
  let scaleSent = cardScale();
  window.addEventListener('resize', () => {
    const now = cardScale();
    if (now === scaleSent) return;
    scaleSent = now;
    real().forEach((piece) => {
      if (piece.classList.contains('is-ready')) {
        tellScale(piece.querySelector('[data-preview]'), now);
      }
    });
  });

  // --- loading a preview ------------------------------------------------

  // Readiness has to survive a missed event. This script runs after the
  // iframes in document order, so a preview that loaded fast has already
  // fired 'load' with nothing listening — and over file:// its readyState is
  // unreadable behind an opaque origin. Hence three routes and a backstop:
  // whatever happens, the skeleton lifts. The backstop starts when the load
  // does, not when the page does, or a card still waiting its turn would have
  // its skeleton lifted off an empty frame.
  function watchLoad(piece) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame) { markReady(piece); return; }

    frame.addEventListener('load', () => markReady(piece));

    try {
      const doc = frame.contentDocument;
      if (doc && doc.readyState === 'complete') markReady(piece);
    } catch (err) {
      /* opaque origin — fall through to the backstop */
    }

    clearTimeout(readyTimers.get(piece));
    readyTimers.set(piece, setTimeout(() => markReady(piece), 2000));
  }

  // Every card on this page is a live component, which is the point of the
  // index and also what it costs: five studies is six documents, and one of
  // those thumbnails alone runs 289 dots on their own animations — on screen
  // or not, for as long as the page is open. That does not stay affordable as
  // the set grows, and the rail drifting means every card eventually arrives.
  //
  // So a preview loads when it comes near the rail's scrollport and is dropped
  // again once it is well past. Two margins rather than one, because a single
  // boundary is something a card can sit on and flap across: it comes alive a
  // card-width before it arrives and is not released until it is two
  // card-widths gone, so ordinary scrolling never crosses both.
  //
  // The src lives in data-src, which means no previews at all without
  // JavaScript. The index already needs it for the rail's order, its numbers
  // and its counts, so this does not lose a working page that existed.
  // One backstop per card, so dropping a preview can cancel the one its load
  // set going.
  const readyTimers = new WeakMap();

  function loadPreview(piece) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame || frame.dataset.loaded === 'true') return;
    const src = frame.getAttribute('data-src');
    if (!src) return;
    frame.dataset.loaded = 'true';
    watchLoad(piece);
    frame.setAttribute('src', src);
  }

  function dropPreview(piece) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame || frame.dataset.loaded !== 'true') return;
    delete frame.dataset.loaded;
    clearTimeout(readyTimers.get(piece));
    // The skeleton comes back with it: the card is about to hold a blank
    // document, and lifting the cover off that is worse than covering it.
    piece.classList.remove('is-ready');
    delete piece.dataset.active;
    frame.setAttribute('src', 'about:blank');
  }

  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) loadPreview(e.target); }),
      { root: track, rootMargin: '0px 100% 0px 100%' }
    );

    const far = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (!e.isIntersecting) dropPreview(e.target); }),
      { root: track, rootMargin: '0px 200% 0px 200%' }
    );

    allPieces().forEach((piece) => { near.observe(piece); far.observe(piece); });
  } else {
    // No observer: load the lot, which is what the page did before.
    allPieces().forEach(loadPreview);
  }

  // --- hover and focus --------------------------------------------------

  real().forEach((piece) => {
    piece.addEventListener('pointerenter', () => {
      if (coarse.matches) return;   // touch drives this off the active card
      tell(piece, true);
    });
    piece.addEventListener('pointerleave', () => {
      if (coarse.matches) return;
      tell(piece, false);
    });
    piece.addEventListener('focusin', () => tell(piece, true));
    piece.addEventListener('focusout', (event) => {
      if (!piece.contains(event.relatedTarget)) tell(piece, false);
    });
  });

  // --- type filter ------------------------------------------------------

  // The type is stated once per card, in the key on its badge — `type.card`,
  // `type.navigation`. This row reads that key rather than adding a second
  // place to say it, which also means a study of a new type needs nothing
  // added here: the row is built from whatever the cards declare.
  //
  // Ordered by how many carry each type, then alphabetically, so the row leads
  // with the part of the set you are most likely to want and does not
  // reshuffle itself every time a study is added.
  const filterRow = document.querySelector('[data-rail-filter]');
  const ghost = track.querySelector('.piece--ghost');

  const FILTER_ALL = '*';

  // The All chip is the only label this row owns — every other chip borrows a
  // card's badge text — so its English lives here with the nav labels rather
  // than in markup index.js never sees again. The i18n module reads the
  // document once at start-up; chips built afterwards are not in that list and
  // are re-labelled on the lang:change below instead.
  const FILTER_EN = { 'filter.all': 'All' };

  let filterType = FILTER_ALL;
  let filterBtns = [];
  let filterCopy = null;

  function filterText(key) {
    return (filterCopy && filterCopy[key]) || FILTER_EN[key];
  }

  function typeOf(piece) {
    const badge = piece.querySelector('.piece__type');
    const key = badge ? badge.getAttribute('data-i18n') || '' : '';
    return key.startsWith('type.') ? key.slice(5) : '';
  }

  // The label a chip shows: the card's own badge text, so English comes from
  // the markup and Danish from the table the rest of the page uses, and this
  // row never holds a type name of its own in either language.
  function typeLabel(type) {
    const piece = allPieces().find((el) => typeOf(el) === type);
    const badge = piece && piece.querySelector('.piece__type');
    return badge ? badge.textContent.trim() : type;
  }

  function applyFilter() {
    allPieces().forEach((piece) => {
      const hit = filterType === FILTER_ALL || typeOf(piece) === filterType;
      // A class, not the hidden attribute: .piece sets its own display, and an
      // author rule beats the UA rule [hidden] leans on.
      piece.classList.toggle('is-filtered', !hit);
    });

    // "Next one goes here" is about the set, not about one type of it.
    if (ghost) ghost.classList.toggle('is-filtered', filterType !== FILTER_ALL);

    filterBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.type === filterType ? 'true' : 'false');
    });

    // The rail is a different length now: renumber it, put it back at the
    // start, rebuild the row the loop cycles through, and let sync() redo the
    // count and the progress. Filtering to a type small enough that the row no
    // longer covers the viewport takes the loop and the drift with it, which
    // is what syncDriftBtn reads.
    number();
    track.scrollLeft = 0;
    rebuildRing();

    // Not restarted here: the chip handler stops the drift on purpose, and a
    // row that becomes loopable again on the way back to "All" is not a reason
    // to override that. The control is what offers it back.
    syncDriftBtn();
    sync();
  }

  function buildFilter() {
    if (!filterRow) return;

    const counts = new Map();
    allPieces().forEach((piece) => {
      const type = typeOf(piece);
      if (type) counts.set(type, (counts.get(type) || 0) + 1);
    });

    // One type is not a choice, and no types means no keys to read.
    if (counts.size < 2) {
      filterRow.hidden = true;
      filterBtns = [];
      return;
    }

    const order = Array.from(counts.keys()).sort((a, b) => {
      const d = counts.get(b) - counts.get(a);
      return d !== 0 ? d : a.localeCompare(b);
    });

    filterRow.textContent = '';
    filterBtns = [FILTER_ALL].concat(order).map((type) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rail__filter-btn';
      btn.dataset.type = type;
      btn.setAttribute('aria-pressed', type === filterType ? 'true' : 'false');

      const label = document.createElement('span');
      label.textContent = type === FILTER_ALL ? filterText('filter.all') : typeLabel(type);
      btn.appendChild(label);

      const n = document.createElement('span');
      n.className = 'rail__filter-count';
      // The space is inside the text, not only in the margin: a screen reader
      // reads the two spans as one run, and "Card3" is not what this says.
      n.textContent = ' ' + (type === FILTER_ALL ? allPieces().length : counts.get(type));
      btn.appendChild(n);

      btn.addEventListener('click', () => {
        if (filterType === type) return;
        filterType = type;
        // Filtering is a deliberate look at one part of the set; the rail
        // sliding off it a second later is not what was asked for.
        driftStop();
        applyFilter();
      });

      filterRow.appendChild(btn);
      return btn;
    });

    filterRow.hidden = false;
  }

  // The chips carry card labels, so they are rewritten with everything else
  // when the language changes. This runs after the module has re-labelled the
  // badges, which is where every chip but All reads its text from.
  document.addEventListener('lang:change', (event) => {
    filterCopy = (event.detail && event.detail.copy) || null;
    filterBtns.forEach((btn) => {
      const type = btn.dataset.type;
      btn.firstChild.textContent =
        type === FILTER_ALL ? filterText('filter.all') : typeLabel(type);
    });
  });

  // --- rail -------------------------------------------------------------

  // The drift control's label is state rather than a fixed string, so English
  // lives here instead of in the markup's data-i18n-aria and the Danish comes
  // off the same table the hint reads. prev and next keep their markup labels:
  // a looping rail has no end for them to announce.
  const NAV_EN = {
    'a11y.pauseRail': 'Pause the carousel',
    'a11y.playRail': 'Start the carousel again'
  };

  let navCopy = null;    // held, so a language switch re-labels without a scroll

  function navText(key) {
    return (navCopy && navCopy[key]) || NAV_EN[key];
  }

  function renderNav() {
    if (driftBtn) {
      // 'held' is still the rail running as far as the reader is concerned —
      // it is deferring to their pointer, not waiting to be restarted — so the
      // button offers to pause rather than to play.
      const running = drift !== 'off';
      driftBtn.dataset.drift = running ? 'on' : 'off';
      driftBtn.setAttribute(
        'aria-label',
        navText(running ? 'a11y.pauseRail' : 'a11y.playRail')
      );
    }
  }

  // One card plus the flex gap — the distance a single step should cover.
  // Measured off a card in the row rather than the first in the file, which
  // the filter may have taken out and left with a zero width.
  function step() {
    const first = ring[0] || laidOut()[0];
    if (!first) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function maxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  // --- the loop ---------------------------------------------------------

  // The rail has no ends. Rather than cloning the set — which would mean a
  // second live component for every card — each card is recycled: the one that
  // has scrolled clear of the left goes to the back of the row, and the scroll
  // position is pulled back by exactly its width in the same breath. Every
  // pixel under the viewport is where it was, so there is no moment to see.
  //
  // The move is a flex `order`, never a DOM move. Re-inserting an iframe
  // discards its browsing context and the component inside reloads from
  // scratch — a same-parent appendChild is enough to do it — whereas `order`
  // repositions the card with the DOM untouched and the component still
  // running. That is the whole reason this is possible without clones.
  let ring = [];

  // What the row is currently made of. A filtered card is display:none, so it
  // occupies no place in the row and must not hold one in the ring either —
  // rotating it would move nothing while still pulling the scroll back by a
  // card, and the recycle would stop lining up.
  const laidOut = () =>
    pieces().filter((el) => !el.classList.contains('is-filtered'));

  function applyRing() {
    ring.forEach((el, i) => { el.style.order = String(i); });
  }

  // Rebuilt whenever the set of laid-out cards changes, which is what the type
  // filter does. Re-assigning every order from scratch also clears whatever a
  // card was left holding while it was filtered out.
  function rebuildRing() {
    ring = laidOut();
    applyRing();
    recycle();
  }

  // The row has to cover the viewport with a card to spare, or there is
  // nothing to recycle into and the row would show its own end. A wide
  // viewport holding few studies is below that line; it is the one case the
  // rail stays finite in, and every study added raises the ceiling by a card.
  function loopable() {
    const w = step();
    return w > 0 && (ring.length - 1) * w - track.clientWidth >= w;
  }

  // scrollLeft is held within half a card either side of one card in, so there
  // is always row to the left to scroll back into and the rest of it to the
  // right. Returns the distance the scroll was moved, because anything holding
  // a scroll position of its own — a drag's origin, a step's two ends — has to
  // move with it or it will fight the recycle on the next frame.
  function recycle() {
    if (!loopable()) return 0;

    const w = step();
    let shifted = 0;
    let guard = ring.length * 2;

    while (guard-- > 0 && track.scrollLeft >= w * 1.5) {
      rotate(1);
      track.scrollLeft -= w;
      shifted -= w;
    }

    guard = ring.length * 2;
    while (guard-- > 0 && track.scrollLeft < w * 0.5) {
      rotate(-1);
      track.scrollLeft += w;
      shifted += w;
    }

    return shifted;
  }

  // Mandatory snap re-snaps whenever the layout under it changes, and a
  // recycle is a layout change — left alone it drags the scroll to the next
  // card and undoes exactly the compensation that makes the move invisible.
  // Suppressed for the frame the move happens in, and restored after, by which
  // point the scroll is back on the card it started on and re-snapping is a
  // no-op. The class is a third way into the same rule .is-drifting uses.
  let snapFrame = 0;

  function rotate(direction) {
    if (direction > 0) ring.push(ring.shift());
    else ring.unshift(ring.pop());
    applyRing();

    track.classList.add('is-recycling');
    cancelAnimationFrame(snapFrame);
    snapFrame = requestAnimationFrame(() => {
      snapFrame = 0;
      track.classList.remove('is-recycling');
    });
  }

  // Called where the row's width may have changed under the rail. Dropping
  // below the loopable line with a rotated ring would leave a finite rail not
  // starting at the newest study, so it is put back in its authored order.
  function normalise() {
    if (loopable()) { recycle(); return; }
    const row = laidOut();
    if (!ring.length || ring.every((el, i) => el === row[i])) return;
    ring = row;
    applyRing();
    track.scrollLeft = 0;
  }

  // The card sitting in the read position: the one whose left edge is nearest
  // the track's scroll-padding edge.
  function activeIndex() {
    const list = real();
    if (!list.length) return 0;

    const trackLeft = track.getBoundingClientRect().left;
    const inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const mark = trackLeft + inset;

    let best = 0;
    let bestDistance = Infinity;
    list.forEach((piece, i) => {
      const distance = Math.abs(piece.getBoundingClientRect().left - mark);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    return best;
  }

  let currentActive = -1;

  function markActive(i) {
    if (i === currentActive) return;
    const list = real();

    list.forEach((piece, n) => piece.classList.toggle('is-active', n === i));

    // Without hover, the read card is the only thing that can demonstrate the
    // component, so it plays by default and the one leaving stops.
    if (coarse.matches) {
      if (list[currentActive]) tell(list[currentActive], false);
      if (list[i]) tell(list[i], true);
    }

    currentActive = i;
  }

  function sync() {
    const max = maxScroll();

    // The rail counts what it is showing; the footer counts what exists.
    // Filtering to one type does not mean four studies stopped being written,
    // and the rail's own "Study 01 / 05" is where the total is read anyway —
    // which is why the masthead no longer carries a second copy of it.
    const count = real().length;
    const total = allPieces().length;
    if (totalOut) totalOut.textContent = pad(count);
    if (footCount) footCount.textContent = pad(total);

    // The newest study's month. order() has already sorted the rail newest
    // first, so it is the first card's own date — read off the same attribute
    // the sort uses rather than written down a second time. Numeric, so it
    // needs no translating and no month table.
    if (metaLatest) {
      const newest = allPieces()[0];
      const key = newest ? orderKey(newest) : '';
      metaLatest.textContent = key ? key.slice(0, 7).replace('-', ' · ') : '—';
    }

    const active = activeIndex();
    markActive(active);
    if (indexOut) indexOut.textContent = pad(Math.min(count, active + 1));

    if (progress) {
      // The track stays: it is the rule the footer used to draw for itself.
      // What it fills with is no longer distance along the row — that is
      // nothing on a rail with no end — but how far through the set the card
      // in the read position is, which is what the number beside it says.
      progress.style.setProperty(
        '--rail-progress',
        max > 0 && count > 0 ? ((active + 1) / count * 100).toFixed(2) + '%' : '0%'
      );
    }

    // A looping rail has no ends, so nothing disables on it. Where the row is
    // too thin to loop it is finite again, and the buttons say so at its edges
    // the way they always did — 1px of slack, so a fractional scrollLeft at an
    // edge still counts as being there.
    const endless = loopable();
    if (prev) prev.disabled = !endless && track.scrollLeft <= 1;
    if (next) next.disabled = !endless && track.scrollLeft >= max - 1;
    renderNav();
  }

  // Steps are animated here rather than handed to `behavior: 'smooth'`,
  // because recycling has to be able to move the scroll position underneath
  // one: writing scrollLeft during a native smooth scroll cancels it, and the
  // step would stop halfway. Driving it ourselves means a recycle mid-step
  // shifts both ends of the animation and it lands where it was always going.
  const STEP_MS = 420;
  // A released drag lands faster than a button step: the hand has already done
  // the travel, so the rail only has to close the gap it was let go in.
  const RELEASE_MS = 240;

  let stepFrame = 0;
  let stepFrom = 0;
  let stepTarget = 0;
  let stepStart = 0;
  let stepMs = STEP_MS;

  function stepTo(target, ms) {
    cancelAnimationFrame(stepFrame);
    stepFrame = 0;

    if (reduced.matches) {
      track.scrollLeft = target;
      recycle();
      return;
    }

    stepFrom = track.scrollLeft;
    stepTarget = target;
    stepStart = 0;
    stepMs = ms || STEP_MS;
    track.classList.add('is-stepping');
    stepFrame = requestAnimationFrame(stepTick);
  }

  function stepTick(now) {
    if (!stepStart) stepStart = now;

    const t = Math.min(1, (now - stepStart) / stepMs);
    const eased = 1 - Math.pow(1 - t, 3);
    track.scrollLeft = stepFrom + (stepTarget - stepFrom) * eased;

    const shift = recycle();
    if (shift) { stepFrom += shift; stepTarget += shift; }

    if (t < 1) {
      stepFrame = requestAnimationFrame(stepTick);
      return;
    }

    track.classList.remove('is-stepping');
    stepFrame = 0;
  }

  function scrollBy(direction) {
    const w = step();
    if (w <= 0) return;
    stepTo(track.scrollLeft + direction * w);
  }

  // Home and End had nowhere to go once the row stopped having ends, so they
  // mean the set's ends instead: the newest study and the oldest. Both are
  // always somewhere in the row, so this is an ordinary scroll to a card.
  function scrollToEdge(end) {
    const list = real();
    const target = end ? list[list.length - 1] : list[0];
    if (!target) return;
    const inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    stepTo(target.offsetLeft - inset);
  }

  // Land on a card. Snap does this for itself when it is on; this is for the
  // paths that turn it off — a drag, and the drift — where the scroll can stop
  // anywhere.
  function settle() {
    const target = real()[activeIndex()];
    if (!target) return;
    const inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    // Through stepTo rather than scrollTo, so every movement of this rail has
    // the same timing, and so the track never sits for a frame with snap back
    // on and the scroll still between two cards — which is the gap that made
    // a released drag jump before it animated.
    stepTo(target.offsetLeft - inset, RELEASE_MS);
  }

  if (prev) prev.addEventListener('click', () => { driftStop(); scrollBy(-1); });
  if (next) next.addEventListener('click', () => { driftStop(); scrollBy(1); });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); driftStop(); scrollBy(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); driftStop(); scrollBy(-1); }
    if (event.key === 'Home') { event.preventDefault(); driftStop(); scrollToEdge(false); }
    if (event.key === 'End') { event.preventDefault(); driftStop(); scrollToEdge(true); }
  });

  // A scroll the rail did not drive — a swipe and its momentum, a trackpad,
  // a focus jump. The drift, a step and a drag each recycle on their own
  // schedule, and would fight a second one here.
  track.addEventListener('scroll', () => {
    if (!stepFrame && !dragging && drift !== 'on') recycle();
    sync();
  }, { passive: true });

  window.addEventListener('resize', () => {
    normalise();
    sync();
  });

  // --- drift ------------------------------------------------------------

  // The rail sets off on its own when the page opens and keeps going: slow,
  // continuous, one direction, wrapping through the same cut the buttons take.
  // It drives scrollLeft — the same scroll everything else here drives — so the
  // progress bar, the card number and the active-card handoff all keep working
  // without knowing the drift exists.
  //
  // Speed is per second rather than per frame, so a 120Hz display drifts at the
  // same rate a 60Hz one does. Snap has to come off while it runs: mandatory
  // snap yanks the scroll back to a card every time it is written, and with
  // scroll-behavior inherited smooth the writes would queue animations against
  // each other. .is-drifting turns both off, the way .is-dragging already does.
  const DRIFT_SPEED = 22;      // px per second
  const DRIFT_DELAY = 1400;    // ms before it sets off, so the previews land first
  const DRIFT_RESUME = 900;    // ms after the pointer leaves

  // 'off' is the reader having taken the rail — a button, a key, a drag, a
  // wheel, or the pause control — and only the play control brings it back.
  // 'held' is the rail deferring to a pointer or an open quick look, and comes
  // back by itself. The split is the difference between respecting a decision
  // and arguing with one: a drift that resumed a second after a click would
  // carry the card away from whoever just asked for it.
  let drift = 'off';           // 'on' | 'held' | 'off'
  let driftFrame = 0;
  let driftLast = 0;
  let driftCarry = 0;          // the sub-pixel the engine rounded away last frame
  let holdTimer = 0;
  let boxOpen = false;         // quick look, which must not resume behind itself
  let taken = false;           // the reader has stopped it; it does not come back on its own

  function driftable() {
    return !reduced.matches && loopable();
  }

  function driftTick(now) {
    if (drift !== 'on') return;
    driftFrame = requestAnimationFrame(driftTick);

    const elapsed = driftLast ? now - driftLast : 0;
    driftLast = now;
    // A backgrounded tab hands back one enormous delta on return. Capped, so
    // the rail picks up where it left off rather than teleporting a minute on.
    const dt = Math.min(elapsed, 64) / 1000;
    if (!dt) return;

    // The row can stop being loopable underneath the drift — a window widened
    // past what the set can fill — and there is no end to drift to once it is.
    if (!loopable()) { driftStop(false); return; }

    const want = track.scrollLeft + driftCarry + DRIFT_SPEED * dt;
    track.scrollLeft = want;
    // scrollLeft quantises to whole pixels, but carrying the remainder costs
    // nothing and keeps the rate honest.
    driftCarry = want - track.scrollLeft;

    // The reason there is no longer anything to see at the end of the row.
    recycle();
  }

  function driftRun() {
    clearTimeout(holdTimer);
    if (boxOpen || !driftable()) return;
    if (drift === 'on') return;
    drift = 'on';
    driftLast = 0;
    driftCarry = 0;
    track.classList.add('is-drifting');
    cancelAnimationFrame(driftFrame);
    driftFrame = requestAnimationFrame(driftTick);
    syncDriftBtn();
    renderNav();
  }

  // Temporary. Snap stays off and the class stays on, so nothing jerks under
  // a pointer that is only passing through.
  function driftHold() {
    clearTimeout(holdTimer);
    if (drift !== 'on') return;
    drift = 'held';
    cancelAnimationFrame(driftFrame);
    renderNav();
  }

  function driftRelease(delay) {
    if (drift !== 'held') return;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => driftRun(), delay || 0);
  }

  // Final, until the play control. Snap comes back, so the rail lands on a card
  // rather than wherever the drift happened to be between two.
  //
  // byUser is what separates a decision from a circumstance: a reader stopping
  // the rail means it stays stopped, while a viewport that grew wide enough to
  // hold every card has only run out of room, and shrinking it back should set
  // the rail going again rather than leave a dead control behind.
  //
  // settleAfter is false where a gesture is taking the rail over: a drag, a
  // wheel, a swipe. Those move the scroll themselves and decide where it ends,
  // and settling here would start a smooth scroll back to the nearest card
  // that runs underneath the whole gesture — which is what made a drag of any
  // length come back to the card it started on.
  function driftStop(byUser, settleAfter) {
    clearTimeout(holdTimer);
    cancelAnimationFrame(driftFrame);
    const wasRunning = drift !== 'off';
    drift = 'off';
    if (byUser !== false) taken = true;
    track.classList.remove('is-drifting');
    if (wasRunning && settleAfter !== false) settle();
    syncDriftBtn();
    renderNav();
  }

  // A pointer resting on the rail is someone reading it, so the rail waits.
  track.addEventListener('pointerenter', driftHold);
  track.addEventListener('pointerleave', () => driftRelease(DRIFT_RESUME));

  // Arriving by keyboard is taking control of the rail — one that drifted
  // between two tab presses would be hostile — so that stops it for good. A
  // click landing focus on a card is not, and neither is quick look handing
  // focus back as it closes; :focus-visible is exactly that distinction, and
  // it is what keeps the close from settling the rail onto the card the
  // overlay was covering.
  track.addEventListener('focusin', (event) => {
    let keyboard = true;
    try { keyboard = event.target.matches(':focus-visible'); }
    catch (err) { /* older engine: treat focus as deliberate */ }
    if (keyboard) driftStop();
    else driftHold();
  });

  // Touch and wheel both scroll the track natively, with nothing for the drag
  // handler to catch — so they are hooked here rather than left to fight the
  // drift over the same scrollLeft.
  // Both scroll the track natively, and snap comes back the moment the drift
  // lets go of it, so the browser lands them on a card without help.
  track.addEventListener('touchstart', () => driftStop(true, false), { passive: true });
  track.addEventListener('wheel', () => driftStop(true, false), { passive: true });

  if (driftBtn) {
    driftBtn.addEventListener('click', () => {
      if (drift === 'off') driftRun();
      else driftStop();
    });
  }

  // Reduced motion is a live setting, not a load-time one.
  if (reduced.addEventListener) {
    reduced.addEventListener('change', () => {
      if (reduced.matches) driftStop();
      syncDriftBtn();
    });
  }

  // The control is worth showing only while there is something for it to do:
  // under reduced motion there is no drift, and on a viewport wide enough to
  // hold every card there is nothing to move. It also stays out of the way for
  // the second before the rail sets off, rather than sitting there offering to
  // start something that is about to start by itself.
  function syncDriftBtn() {
    if (!driftBtn) return;
    driftBtn.hidden = !driftable() || (drift === 'off' && !taken);
  }

  // --- drag to scroll ---------------------------------------------------

  // Mouse only. A touch pointer already scrolls the track natively, and
  // driving scrollLeft underneath that gesture fought the browser's own
  // momentum. Worse, a swipe ends in `pointercancel` with no click behind it,
  // so the one-shot click swallower below stayed armed and ate the user's
  // next tap on a card.
  const DRAG_SLOP = 4;   // below this it is a click, not a drag

  // Where a released drag lands. Nearest-card is the obvious rule and the
  // wrong one: it sends a drag of two fifths of a card back to the card it
  // came from, which reads as the rail refusing the gesture rather than
  // answering it. A fifth of a card is enough to mean "the next one", and a
  // flick means the next one whatever distance it covered.
  const SNAP_FRACTION = 0.2;    // of a card
  const FLICK_SPEED = 0.35;     // px per ms

  let dragging = false;
  let moved = false;
  let originX = 0;
  let originScroll = 0;

  // The last sample of the gesture, for the flick test. One sample is enough:
  // it is the speed the pointer was let go at that says whether this was a
  // flick, not the average over the whole drag.
  let lastX = 0;
  let lastT = 0;
  let speed = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (event.pointerType !== 'mouse') return;
    dragging = true;
    moved = false;
    originX = event.clientX;
    originScroll = track.scrollLeft;
    lastX = event.clientX;
    lastT = event.timeStamp;
    speed = 0;
    // Capture is taken only once a drag is real. Taking it here would
    // retarget the click, and the quick-look button would stop firing.
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = event.clientX - originX;
    if (!moved && Math.abs(delta) > DRAG_SLOP) {
      moved = true;
      // Only once the drag is real. A press that turns out to be a click — a
      // card's link, its quick-look button — has not moved the rail and should
      // not end the drift; the pointer being over the track is already holding
      // it, and it picks up again when that pointer leaves.
      driftStop(true, false);
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    }
    if (moved) {
      const dt = event.timeStamp - lastT;
      if (dt > 0) speed = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastT = event.timeStamp;

      track.scrollLeft = originScroll - delta;
      // A recycle under the drag moves the scroll out from under the origin
      // this is measured against; without this the next frame would drag the
      // rail back by exactly the card that was just recycled.
      originScroll += recycle();
    }
  });

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    // Swallow the click the drag would otherwise fire on a card link.
    if (moved) {
      track.addEventListener('click', (click) => {
        click.preventDefault();
        click.stopPropagation();
      }, { capture: true, once: true });
      release();
    }

    // After release(), not before. Dropping .is-dragging hands the track back
    // to mandatory snap, which snaps to the nearest card the moment the class
    // goes — so reading the scroll after it would measure a gesture the
    // browser had already undone, and every drag under half a card came back
    // to the card it started on. release() puts .is-stepping on first, so the
    // track is never left for a frame with neither.
    track.classList.remove('is-dragging');
    moved = false;
  }

  // originScroll is the scroll the drag started from, kept in step with every
  // recycle underneath it — so counting cards from there is counting them from
  // where the hand started, whatever the row did on the way.
  function release() {
    const w = step();
    if (w <= 0) { settle(); return; }

    const covered = (track.scrollLeft - originScroll) / w;
    const whole = Math.trunc(covered);
    const rest = covered - whole;
    const flick = Math.abs(speed) > FLICK_SPEED;

    let cards = whole;
    if (Math.abs(rest) >= SNAP_FRACTION) cards += Math.sign(rest);
    // A flick that covered almost nothing still means the next one, in the
    // direction the hand was travelling — which is the opposite sign to the
    // pointer, since dragging left walks the rail forwards.
    if (cards === 0 && flick) cards = -Math.sign(speed);

    stepTo(originScroll + cards * w, RELEASE_MS);
  }

  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // --- quick look -------------------------------------------------------

  const box = document.querySelector('[data-lightbox]');

  if (box) {
    const panel = box.querySelector('.lightbox__panel');
    const frame = box.querySelector('[data-lightbox-frame]');
    const slugOut = box.querySelector('[data-lightbox-slug]');
    const titleOut = box.querySelector('[data-lightbox-title], #lightbox-title');
    const noteOut = box.querySelector('[data-lightbox-note]');
    const demoOut = box.querySelector('[data-lightbox-demo]');
    const closers = box.querySelectorAll('[data-lightbox-close]');

    const stage = box.querySelector('.lightbox__stage');
    const variantBar = box.querySelector('[data-lightbox-variants]');
    const dotsOut = box.querySelector('[data-lightbox-dots]');
    const variantLabel = box.querySelector('[data-lightbox-variant-label]');

    const AUTOPLAY_MS = 4000;   // one variant every four seconds
    const NUDGE_MS = 260;       // a manual pick moves the marker at once
    // The narrowest the panel is worth being. Sizing it to the preview is
    // right until a short viewport scales the preview down far enough to drag
    // the footer's copy into a two-word column — below this the panel keeps
    // its width and the preview sits centred in it.
    const PANEL_FLOOR = 288;

    let restoreFocus = null;
    let closeTimer = null;
    let lockedAt = 0;
    let currentPiece = null;
    let variants = [];
    let variantIndex = 0;
    let marker = null;
    let dotEls = [];
    let autoplayTimer = null;
    let paused = false;

    const text = (el) => (el ? el.textContent.trim() : '');

    // Taking the body out of flow is what actually stops iOS scrolling the
    // page behind the overlay, and that loses the scroll position — so it is
    // held here and put back on close.
    function lockScroll() {
      lockedAt = window.scrollY || window.pageYOffset || 0;
      document.body.style.top = -lockedAt + 'px';
      document.body.classList.add('is-locked');
    }

    function unlockScroll() {
      document.body.classList.remove('is-locked');
      document.body.style.top = '';
      window.scrollTo(0, lockedAt);
    }

    // Quick look runs the preview with pointer events on so the component's
    // own :hover does the work — which is nothing at all on a device that
    // cannot hover, leaving the overlay showing a frozen card. There the
    // index falls back to the same message the cards use, so the component
    // demonstrates itself. Still generic: it names no component class, and
    // the preview decides what being active means. Re-sent after a variant
    // swap, because a preview is free to rebuild its markup on one.
    function playForTouch() {
      if (!coarse.matches || box.hidden) return;
      if (!frame.contentWindow) return;
      frame.contentWindow.postMessage(
        { source: CHANNEL, type: 'preview', active: true },
        '*'
      );
    }

    // The stage has already been laid out by the flex column above, so the
    // scale is one measurement of it — no arithmetic over the bar and footer,
    // and no feedback loop, because the frame is out of flow and the panel's
    // width no longer depends on the result.
    let lightboxScale = 1;

    function fitStage() {
      if (box.hidden) return;

      const rootStyle = getComputedStyle(document.documentElement);
      const previewW = parseFloat(rootStyle.getPropertyValue('--preview-w'));
      const previewH = parseFloat(rootStyle.getPropertyValue('--preview-h'));
      if (!previewW || !previewH) return;

      // Measure against the panel's natural width first.
      panel.style.width = '';

      // Whatever width the overlay actually has to give — the floor can never
      // exceed it, or the panel would push past the viewport it is centred in.
      const floor = Math.min(PANEL_FLOOR, panel.getBoundingClientRect().width);

      // Two passes. The panel is narrowed to whatever the scaled preview
      // actually occupies — left at its full width, a preview limited by
      // height sits in a band of panel either side of it, which reads as a
      // gap in the page rather than a frame around it. Narrowing can rewrap
      // the footer and cost a little height, so the fit is taken again.
      for (let pass = 0; pass < 2; pass++) {
        const scale = Math.min(
          stage.clientWidth / previewW,
          stage.clientHeight / previewH,
          1
        );

        box.style.setProperty('--lightbox-scale', Math.max(0, scale).toFixed(4));
        panel.style.width =
          Math.max(Math.round(previewW * scale), floor) + 'px';
        lightboxScale = Math.max(0, scale);
      }
      tellScale(frame, lightboxScale);
    }

    // Parks the marker on a dot. `ms` is how long the trip takes: the full
    // autoplay interval when it is counting down to the next swap, a short
    // nudge when someone picked a dot themselves.
    function moveMarker(i, ms) {
      const dot = dotEls[i];
      if (!marker || !dot) return;
      marker.style.transitionDuration = (reduced.matches ? 0 : ms) + 'ms';
      marker.style.setProperty('--marker-x', (dot.offsetLeft + dot.offsetWidth / 2) + 'px');
      // The row wraps on a phone, where the dots are finger-sized, so the
      // second axis is not always zero.
      marker.style.setProperty('--marker-y', (dot.offsetTop + dot.offsetHeight / 2) + 'px');
    }

    function stopAutoplay() {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    // The marker sets off for the next dot as soon as this one lands, and the
    // variant changes when it arrives — so the travel time and the interval
    // are the same number by construction, not two settings kept in step.
    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduced.matches || variants.length < 2) return;

      const next = (variantIndex + 1) % variants.length;
      moveMarker(next, AUTOPLAY_MS);
      autoplayTimer = setTimeout(() => showVariant(next, { marker: false }), AUTOPLAY_MS);
    }

    function showVariant(i, options) {
      if (!variants.length) return;
      const settings = options || {};
      variantIndex = (i + variants.length) % variants.length;

      frame.contentWindow.postMessage(
        { source: CHANNEL, type: 'preview:variant', index: variantIndex },
        '*'
      );
      playForTouch();

      dotEls.forEach((dot, n) => {
        dot.setAttribute('aria-current', n === variantIndex ? 'true' : 'false');
      });
      variantLabel.textContent = variants[variantIndex].label;

      // Autoplay has already walked the marker here; a manual pick has not.
      if (settings.marker !== false) moveMarker(variantIndex, NUDGE_MS);

      queueAutoplay();
    }

    // Built from what the preview reported, so the index stays ignorant of
    // what any variant actually is.
    function buildDots(list) {
      variants = Array.isArray(list) ? list : [];
      dotsOut.textContent = '';
      variantBar.hidden = variants.length < 2;

      marker = null;
      dotEls = [];

      variants.forEach((variant, n) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'lightbox__dot';
        dot.setAttribute('aria-label', variant.label);
        dot.setAttribute('aria-current', n === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => showVariant(n));
        dotsOut.appendChild(dot);
        dotEls.push(dot);
      });

      if (variants.length > 1) {
        marker = document.createElement('span');
        marker.className = 'lightbox__dots-marker';
        dotsOut.appendChild(marker);
      }

      variantLabel.textContent = variants.length ? variants[0].label : '';
      variantIndex = 0;

      // The dots take height off the stage, so the fit has to be redone.
      fitStage();

      // Park on the first dot without animating in from the left edge.
      moveMarker(0, 0);
      void dotsOut.offsetWidth;
      queueAutoplay();
    }

    // Variants arrive with the preview's ready message, once its iframe has
    // parsed — which is after open() has already run.
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.source !== CHANNEL || data.type !== 'preview:ready') return;
      if (box.hidden || event.source !== frame.contentWindow) return;
      tellScale(frame, lightboxScale);
      buildDots(data.variants);
      playForTouch();
    });

    // The keydown handler further down is on this document, and the preview is
    // not in it — an iframe has its own event target, and nothing bubbles
    // across the boundary. Quick look is the one place that matters: it runs
    // the preview with pointer events live, so a click on the component moves
    // focus into the frame and Escape stops closing the overlay. The preview
    // hands Escape back over the channel instead. Same guards as above: the
    // channel name, and the frame this overlay is actually showing.
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.source !== CHANNEL || data.type !== 'preview:key') return;
      if (box.hidden || event.source !== frame.contentWindow) return;
      if (data.key === 'Escape') close();
    });

    // Everything the overlay shows is read out of the card, so this is also
    // what re-runs when the page language changes under an open overlay.
    function fillFrom(piece) {
      const link = piece.querySelector('.piece__link');
      if (!link) return;
      slugOut.textContent = text(piece.querySelector('.piece__slug'));
      titleOut.textContent = text(link);
      noteOut.textContent = text(piece.querySelector('[data-note]'));
      // Already carries ?lang= when the card links do.
      demoOut.href = link.getAttribute('href');
    }

    document.addEventListener('lang:change', () => {
      if (!box.hidden && currentPiece) fillFrom(currentPiece);
    });

    function open(piece) {
      const preview = piece.querySelector('[data-preview]');
      const link = piece.querySelector('.piece__link');
      if (!preview || !link) return;

      currentPiece = piece;
      fillFrom(piece);

      // Live and unscaled: pointer events are on here, so the component's own
      // :hover does the work and no message contract is involved.
      stopAutoplay();
      paused = false;
      variants = [];
      variantIndex = 0;
      marker = null;
      dotEls = [];
      dotsOut.textContent = '';
      variantBar.hidden = true;
      // data-src, not src: the card's own frame is loaded on approach and may
      // still be empty. The path is on the card either way.
      frame.src = preview.getAttribute('data-src') || preview.getAttribute('src');

      // The rail must not drift on behind the overlay: the pointer has left the
      // track to get here, so its own pointerleave would otherwise release the
      // hold a moment after this opens.
      boxOpen = true;
      driftHold();

      clearTimeout(closeTimer);
      restoreFocus = document.activeElement;
      box.hidden = false;
      lockScroll();
      fitStage();   // sized before it is painted, so it never opens too tall

      // Flush layout so the transition has a start value to move from, then
      // open synchronously. A requestAnimationFrame here would never fire in
      // a background tab, and the overlay would sit there at opacity 0.
      void box.offsetHeight;
      box.classList.add('is-open');

      const closeBtn = box.querySelector('.lightbox__close');
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (box.hidden) return;
      stopAutoplay();
      paused = false;
      currentPiece = null;
      boxOpen = false;
      box.classList.remove('is-open');

      const finish = () => {
        box.hidden = true;
        panel.style.width = '';
        frame.src = 'about:blank';   // stop the preview rather than hide it
        unlockScroll();
        // Scroll is already back where it was; letting focus move it again
        // would jump the rail to wherever the card happens to sit.
        if (restoreFocus && document.contains(restoreFocus)) {
          restoreFocus.focus({ preventScroll: true });
        }
        restoreFocus = null;
        // After the focus restore, so a keyboard close keeps the rail stopped
        // and only a pointer one hands it back.
        driftRelease(DRIFT_RESUME);
      };

      if (reduced.matches) finish();
      else closeTimer = setTimeout(finish, 320);
    }

    real().forEach((piece) => {
      const button = piece.querySelector('[data-expand]');
      if (!button) return;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        open(piece);
      });
    });

    closers.forEach((el) => el.addEventListener('click', close));

    window.addEventListener('resize', fitStage);
    window.addEventListener('orientationchange', fitStage);

    // A phone's toolbars collapsing changes what is visible without always
    // firing a window resize, and the panel is sized in dvh — so the stage it
    // is fitted to has moved under it.
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitStage);
    }

    // Hovering the preview means someone is looking at this variant: hold it,
    // and send the marker back to the dot it belongs to.
    stage.addEventListener('pointerenter', () => {
      paused = true;
      stopAutoplay();
      moveMarker(variantIndex, NUDGE_MS);
    });

    stage.addEventListener('pointerleave', () => {
      paused = false;
      queueAutoplay();
    });

    document.addEventListener('keydown', (event) => {
      if (box.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); }

      if (variants.length > 1) {
        if (event.key === 'ArrowRight') { event.preventDefault(); showVariant(variantIndex + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); showVariant(variantIndex - 1); }
      }

      if (event.key !== 'Tab') return;

      // Small trap: the panel's own controls, plus the preview itself so the
      // component inside stays reachable by keyboard.
      const focusable = Array.from(
        panel.querySelectorAll('button, a[href], iframe')
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  // --- go ---------------------------------------------------------------

  const LEDE_EN = {
    pointer: 'Hover a card to run it in place, or open it at full size.',
    touch: 'Tap quick look to run a card in place, or open it at full size.'
  };

  // Held so a pointer-type change can re-render without waiting for the next
  // language switch.
  let hintCopy = null;

  function renderLedeHint(copy) {
    hintCopy = copy;
    const touch = coarse.matches;

    // The lede's closing sentence, for the same reason: there is nothing to
    // hover on a phone, and the card's own affordance is the quick-look
    // button rather than the pointer.
    if (ledeHint) {
      const key = touch ? 'head.ledeHintTouch' : 'head.ledeHint';
      ledeHint.textContent =
        (copy && copy[key]) || (touch ? LEDE_EN.touch : LEDE_EN.pointer);
    }
  }

  // apply() writes the buttons' data-i18n-aria labels before it dispatches
  // this, so re-labelling here lands after it and the wrap label survives a
  // switch made while sitting at an edge.
  document.addEventListener('lang:change', (event) => {
    renderLedeHint(event.detail.copy);
    navCopy = event.detail.copy;
    renderNav();
  });

  // A tablet gains a trackpad, or a laptop's touchscreen takes over: the hint
  // and which preview plays both hang off this, so neither can be decided
  // once at load.
  if (coarse.addEventListener) {
    coarse.addEventListener('change', () => {
      renderLedeHint(hintCopy);
      const list = real();
      list.forEach((piece) => tell(piece, false));
      if (coarse.matches && list[currentActive]) tell(list[currentActive], true);
    });
  }

  renderLedeHint(null);
  order();
  buildFilter();   // after order(), so the chips count a settled rail
  number();

  // After order(), which is the last thing that touches the DOM order the ring
  // is built from. The first recycle puts a card's worth of row to the left of
  // the newest study, which is where the rail rests.
  rebuildRing();
  sync();

  window.addEventListener('resize', () => {
    // A window narrowed back into a row it can loop sets the rail going again,
    // unless the reader had already stopped it.
    if (!taken && drift === 'off') driftRun();
    syncDriftBtn();
  });
  syncDriftBtn();
  // Late enough that the previews have landed: a rail that starts moving under
  // five loading skeletons advertises the wait rather than the work.
  setTimeout(() => driftRun(), DRIFT_DELAY);
})();
