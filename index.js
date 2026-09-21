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
//   parent -> preview   { source: 'interface-studies', type: 'preview:theme',
//                         theme: 'light' | 'dark' }
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
      // Danish builds compounds, and one of them at a 36px hero can be wider
      // than a 320px line has to give — a sideways scrollbar across the whole
      // page. The headline carried \u00AD for that reason while it read
      // 'interfacedesign'; the current one has no word long enough to need it,
      // and .head__title's overflow-wrap is the backstop either way. A new
      // long compound in this table wants one: the soft hyphen is the
      // compound's own seam, invisible until the line needs it, breaking
      // where a Danish reader would break the word, and needing no
      // hyphenation dictionary, which is what `hyphens: auto` would be
      // waiting on.
      'head.title': 'Udforskning af interaktion og æstetik.',
      'head.lede': 'Hvert studie er én komponent, bygget i kode og holdt så '
        + 'lille, at den er til at gennemskue.',
      'head.ledeHint': 'Hold musen over et kort for at afspille det, tag et '
        + 'hurtigt kig på dets varianter, eller åbn studiet for '
        + 'beslutningerne og teknikkerne bag.',
      'head.ledeHintTouch': 'Tryk på hurtigt kig for at afspille et kort og '
        + 'bladre gennem dets varianter, eller åbn studiet for '
        + 'beslutningerne og teknikkerne bag.',
      'meta.latest': 'Seneste',
      'rail.study': 'Studie',
      'type.card': 'Kort',
      'type.aesthetic': 'Æstetik',
      'type.navigation': 'Navigation',
      'type.layout': 'Layout',
      'filter.all': 'Alle',
      'piece.liquidGlassToolbar.title': 'Værktøjslinje i flydende glas',
      'piece.liquidGlassToolbar.note': 'Én glasflade der skifter form — det '
        + 'valgte punkt folder sig ud til en pille med etiket, søgning til et '
        + 'felt, loggen til et panel — i seks materialer fra én opskrift.',
      'cta.quickLookToolbar': 'Hurtigt kig: Værktøjslinje i flydende glas',
      'piece.shaderTokenField.title': 'Shaderfelt af tokens',
      'piece.shaderTokenField.note': 'Et gradientfelt, hvis shader-parametre '
        + 'er en token-blok: otte tal og tre farver, l\u00e6st \u00e9n gang '
        + 'af en stopliste, der ikke kr\u00e6ver script, og \u00e9n gang af '
        + 'grafikkortet. Hvert fragments lysstyrke afgr\u00e6nses til et '
        + 'angivet b\u00e5nd, s\u00e5 kontrastgulvet under teksten er et '
        + 'l\u00f8fte, v\u00e6rdierne giver, frem for en m\u00e5ling taget '
        + 'bagefter.',
      'cta.quickLookShader': 'Hurtigt kig: Shaderfelt af tokens',
      'piece.struckTones.title': 'Anslagstoner',
      'piece.struckTones.note': 'En lydpalet til en gr\u00e6nseflade, skrevet '
        + 'som en token-blok: fire lyde angivet som en stemning, en klang, et '
        + 'anslag og et rum, og derefter syntetiseret ud fra de tal frem for '
        + 'afspillet fra filer. Den er tavs som udgangspunkt og tegner alt, '
        + 'hvad den siger.',
      'cta.quickLookStruck': 'Hurtigt kig: Anslagstoner',
      'piece.bentoGrid.title': 'Interaktivt bento-gitter',
      'piece.bentoGrid.note': 'Syv fliser, der hver angiver den plads, de '
        + 'ønsker, på et gitter der afkorter hvert spænd efter sit eget '
        + 'antal kolonner. Hver flise svarer på den plads, den lander i, '
        + 'frem for på den modifikator, den fik — og åbner man én, pakkes '
        + 'tavlen om omkring den.',
      'cta.quickLookBento': 'Hurtigt kig: Interaktivt bento-gitter',
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
      'ghost.title': 'Kommende studie',
      'ghost.month.oct': 'oktober',
      'ghost.month.nov': 'november',
      'ghost.month.dec': 'december',
      'foot.blurb': 'Hvert studie er en mappe, der står for sig selv: sin egen '
        + 'markup, sit eget stylesheet, sine egne tokens. Kopiér en ud, og '
        + 'den virker videre.',
      'foot.inspiration': 'Nogle studier tager udgangspunkt i en grænseflade '
        + 'set andre steder. Når de gør, står linket på Inspiration-linjen '
        + 'sidst i mappens notes.md; er designet originalt, står det der i '
        + 'stedet.',
      'foot.typefaces': 'Skrifttyper',
      'foot.stack': 'Stack',
      'foot.stackVal': 'HTML og CSS, intet byggetrin',
      'foot.types': 'Typer',
      'foot.studies': 'Studier',
      'foot.builtBy': 'Bygget af',
      'foot.coffee': 'Giv en kop kaffe',
      'foot.backToTop': 'Til toppen',
      'a11y.elsewhere': 'Andre steder',
      'a11y.carousel': 'Karrusel',
      'a11y.previous': 'Forrige',
      'a11y.next': 'Næste',
      'a11y.pauseRail': 'Sæt karrusellen på pause',
      'a11y.playRail': 'Start karrusellen',
      'a11y.railRegion': 'Studiekarrusel',
      'a11y.filter': 'Filtrér efter type',
      'a11y.variants': 'Varianter',
      'a11y.closeQuickLook': 'Luk hurtigt kig',
      'a11y.livePreview': 'Live forhåndsvisning af komponent',
      'a11y.theme': 'Mørk tilstand'
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

  // The theme the visitor actually chose, if they chose one. It arrives on the
  // theme:change event below rather than being read off <html>, because the
  // attribute there is the resolved answer — a dark page on a dark machine is
  // not a choice, and handing it on as one would store it at the other end.
  let themeChoice = null;

  // Demo pages are separate documents that carry their own copy of both
  // switches, so the choices travel in the link. Over file:// each document
  // gets its own opaque origin and localStorage does not carry across, which
  // is why the query string is the primary channel rather than a fallback.
  function syncLinks() {
    const query = [];
    if (current !== 'en') query.push('lang=' + current);
    if (themeChoice) query.push('theme=' + themeChoice);

    document.querySelectorAll('[data-lang-link]').forEach((link) => {
      const base = link.getAttribute('data-lang-link');
      link.setAttribute('href', base + (query.length ? '?' + query.join('&') : ''));
    });
  }

  document.addEventListener('theme:change', (event) => {
    themeChoice = event.detail ? event.detail.chosen : null;
    syncLinks();
  });

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

    syncLinks();

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


// --- theme ---------------------------------------------------------------
//
// Site chrome only, like the language switch above, and for the same reason:
// a preview is its own document with its own ground, so the cards stay lit
// plates under a dark page rather than inverting with it.
//
// The answer is already on <html> by the time this runs — the head carries a
// six-line copy of the same resolution, so the first paint is not a frame of
// the wrong theme. What is left here is the toggle, the state it reports, and
// the crossfade.
//
// index.css reads the attribute and nothing else, which is what keeps the dark
// palette to one block. The system preference is resolved here rather than in
// a media query, so it is still live: until someone picks a theme, an OS
// switch made while the page is open moves the page and relabels the button.

(function () {
  const STORE_KEY = 'interface-studies:theme';
  const SWITCH_MS = 420;   // matches .is-theming in index.css

  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  const media = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  // What the head script read, read again — not what it wrote: the attribute
  // is by then the resolved answer, and a system dark theme is not a choice
  // to keep once the OS changes.
  //
  // A demo page hands the choice back the way it received it, so the query
  // string comes first here for the same reason it does for the language.
  let chosen = new URLSearchParams(location.search).get('theme');
  if (chosen !== 'dark' && chosen !== 'light') {
    chosen = null;
    try { chosen = localStorage.getItem(STORE_KEY); } catch (err) { /* private mode */ }
    if (chosen !== 'dark' && chosen !== 'light') chosen = null;
  } else {
    try { localStorage.setItem(STORE_KEY, chosen); } catch (err) { /* private mode */ }
  }

  function shown() {
    return chosen || (media && media.matches ? 'dark' : 'light');
  }

  // The previews are separate documents as well, and a framed one is behind an
  // opaque origin over file:// — so the theme rides on the src the way it rides
  // on a demo link. Rewriting data-src rather than src is what keeps the two
  // places that load a preview (the rail on approach, quick look on open) from
  // having to know about any of this: they read data-src as they always did.
  //
  // A preview that is already loaded is told instead, over the same contract
  // the rail uses for everything else — reloading a live thumbnail to change
  // one colour would drop its animation and flash the skeleton back.
  //
  // Neither reaches a document that is loading at this moment: its src was
  // written before the switch and its listener does not exist yet, so the
  // message is dropped and the card is left on the old ground. The rail's
  // preview:ready handler re-states the theme for that case — see tellTheme.
  //
  // Every preview acts on it, and takes it the same way: --preview-ground is
  // the rail's ground rather than the component's staging, so it follows the
  // index into dark in all of them. What a folder does *beyond* moving that
  // ground is its own business — correcting an ink colour for type that sits
  // on the ground, or resting on whichever of two cards the rail is not.
  //
  // This comment described four previews as doing nothing with the theme and
  // named one that did. That stopped being true when the shared ground became
  // the contract; it is the rail reading as one set of cards, which is an
  // argument about this page and not about any study in it.
  function tellPreviews(theme) {
    document.querySelectorAll('[data-preview]').forEach((frame) => {
      const src = frame.getAttribute('data-src');
      if (src) frame.setAttribute('data-src', src.split('?')[0] + '?theme=' + theme);
    });

    document.querySelectorAll('[data-preview], [data-lightbox-frame]').forEach((frame) => {
      const live = frame.getAttribute('src');
      if (!live || live === 'about:blank') return;
      try {
        frame.contentWindow.postMessage(
          { source: 'interface-studies', type: 'preview:theme', theme: theme },
          '*'
        );
      } catch (err) { /* not loaded yet: the ready re-send catches it */ }
    });
  }

  function paint() {
    const theme = shown();
    root.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    tellPreviews(theme);

    // The language module owns the outgoing links; it needs the choice, not
    // the resolved answer.
    document.dispatchEvent(new CustomEvent('theme:change', {
      detail: { theme: theme, chosen: chosen }
    }));
  }

  let settle = 0;
  toggle.addEventListener('click', () => {
    chosen = shown() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(STORE_KEY, chosen); } catch (err) { /* private mode */ }

    // Keep ?theme= in step with the choice, the way the language switch does:
    // left stale, an older value would win over the stored one on the next
    // reload and undo the switch.
    try {
      const url = new URL(location.href);
      url.searchParams.set('theme', chosen);
      history.replaceState({}, '', url);
    } catch (err) { /* file:// can refuse replaceState */ }

    // The crossfade is hung on <html> for its own length and taken off again,
    // so the rule is not sitting on every element for the rest of the session.
    root.classList.add('is-theming');
    clearTimeout(settle);
    settle = setTimeout(() => root.classList.remove('is-theming'), SWITCH_MS);

    paint();
  });

  if (media) {
    const follow = () => { if (!chosen) paint(); };
    if (media.addEventListener) media.addEventListener('change', follow);
    else if (media.addListener) media.addListener(follow);
  }

  paint();
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
  const footTypes = document.getElementById('foot-types');
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

    // Before the first of the slots, so every study lands ahead of all three
    // and the three keep the order they are written in.
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
    // Before the message when starting, after it when stopping: the preview has
    // to be running to play its open state, and has to still be running to play
    // its way back out of it.
    if (active) syncPause(piece);
    frame.contentWindow.postMessage(
      { source: CHANNEL, type: 'preview', active: active },
      '*'
    );
    if (!active) syncPause(piece);
  }

  // Every animation in every loaded preview stops for the length of a gesture.
  //
  // A same-origin iframe shares this page's main thread, so a thumbnail that
  // keeps animating while the rail is being dragged is animating against the
  // drag, on the thread the drag needs. Measured on a throttled phone profile,
  // a two-card drag with the pause taking effect against the same drag with it
  // defeated: 446 style recalcs against 175. The frame-timing half of that
  // measurement stopped reproducing on the machine it was taken on, so the
  // recalc count is what this claim rests on, and a real phone is the test.
  //
  // Telling a preview it is inactive does not do this and never did — that
  // puts it in its resting state, and a resting state still animates. Measured
  // the same way, sending active:false to all five changed nothing.
  //
  // Pausing rather than unloading is what keeps a card's animation from
  // starting over every time it comes back: the document is still there and
  // the animations pick up where they were.
  let pausedAll = false;

  function pausePreview(piece, paused) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(
      { source: CHANNEL, type: 'preview:pause', paused: paused },
      '*'
    );
  }

  // A preview animates when it is the card being read, or when a pointer is on
  // it. Everything else is paused, however close to the scrollport it sits.
  //
  // Proximity used to be the rule, and it was the wrong one: a preview woke a
  // scrollport before it arrived, so a card a third of the way onto the screen
  // was already running its open state, and a component that introduces itself
  // on load — the plate that inks its own line drawing — did the introducing
  // while it was still off to the side. By the time it was yours to look at,
  // the thing worth seeing had happened next to it.
  //
  // Loading is still early, and deliberately: the document has to exist and be
  // parsed before the card lands, or you watch it arrive instead. It just
  // arrives stopped. A paused animation holds at its first frame, so the entry
  // plays on arrival rather than having played on approach.
  // How long a freshly loaded preview may run before the pause takes it. Long
  // enough for the slowest entry in the set: the inked plate's line drawing is
  // 520ms with up to 570ms of stagger behind it.
  const SETTLE_IN = 1200;

  // When this page's own previews were born, so the first pass can be told
  // apart from a card scrolling into view later.
  const bornAt = performance.now();

  // Nothing of it within the scrollport. Costs a pair of rects, and is only
  // read when a preview announces itself.
  function offScreen(piece) {
    const tr = track.getBoundingClientRect();
    const r = piece.getBoundingClientRect();
    return r.right <= tr.left || r.left >= tr.right;
  }

  // One timer per card for the settling-in grace. Declared up here with the
  // rest of the grace: dropPreview ends a grace and runs during setup, so a
  // const further down the file would be a TDZ error on that path.
  const arrivals = new WeakMap();

  function endGrace(piece) {
    clearTimeout(arrivals.get(piece));
    arrivals.delete(piece);
    if (piece.dataset.arriving !== 'true') return;
    delete piece.dataset.arriving;
    syncPause(piece);
  }

  // Whether each card is on screen, so a card coming into view on a still rail
  // starts and one leaving stops. Only the ones that changed are told, and the
  // rects cost the same order as activeIndex's, which sync already pays.
  function syncVisibility() {
    real().forEach((piece) => {
      const seen = offScreen(piece) ? 'false' : 'true';
      if (piece.dataset.seen === seen) return;
      piece.dataset.seen = seen;
      syncPause(piece);
    });
  }

  function wantPaused(piece) {
    if (pausedAll) return true;                        // the rail is moving
    if (piece.dataset.active === 'true') return false; // hovered, focused, handed off
    // A component that draws itself on load has nothing on screen until it has
    // done so, and paused at its first frame that is an empty card. Loading
    // happens a scrollport out, so this runs itself off screen and what arrives
    // is the finished drawing rather than the drawing being made.
    if (piece.dataset.arriving === 'true') return false;
    // Nothing to see. A loaded card a scrollport away would otherwise go on
    // running its field forever for nobody, which is the whole of what this
    // saves once the rail is still.
    if (offScreen(piece)) return true;
    // While the rail drifts, the card at the mark runs and the rest do not.
    // The drift writes scrollLeft from a frame callback, so a field animating
    // under it is animating on the thread it needs, and five of them at once
    // cost it plainly: measured on a throttled phone profile, the drift's
    // median frame went 16.7ms to 33.3ms with every resting field live, 25
    // dropped frames in 700 against 457.
    //
    // Holding all of them was the first answer and it was too much. `handoff`
    // is a coarse-pointer path — it is what stands in for hover where there is
    // none — so on a desktop no card is ever `active` from the mark, and the
    // rail drifts for all but the seconds a pointer is resting on it. That
    // left the resting fields paused essentially always, which is the whole of
    // what they are for.
    if (drift === 'on') {
      // The card on its way in runs too. A field held at its first frame while
      // it crosses the screen and only starting once it lands reads as broken
      // rather than as resting — the study people notice this on is the one
      // whose whole subject is a wave, and a wave that begins on arrival has
      // already missed its entrance.
      //
      // One extra card and no more. Every visible card running takes the
      // drift's median frame from 16.7ms to 33.3ms on a throttled phone
      // profile; this keeps the median and spends only headroom. The rail's
      // own motion is untouched either way — it integrates dt, so the rendered
      // advance stays even: 0 stalled frames in 599 and sub-pixel variance,
      // measured. And a finger landing mid-drift still hushes in 14ms against
      // 13, so nothing is waiting on the thread this spends.
      if (piece.dataset.next === 'true') return false;
      return !(onMark && piece.classList.contains('is-active'));
    }
    // On screen and the rail is still: it rests, and a resting state is still
    // a state.
    return false;
  }

  function syncPause(piece) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame || frame.dataset.loaded !== 'true') return;
    const want = wantPaused(piece) ? 'true' : 'false';
    if (frame.dataset.paused === want) return;
    frame.dataset.paused = want;
    pausePreview(piece, want === 'true');
  }

  function pauseAll(paused) {
    if (paused === pausedAll) return;
    pausedAll = paused;
    refreshPause();
  }

  // The drift starting or stopping changes the answer for every card at once,
  // the way a gesture does. Cheap: syncPause posts only where the answer moved.
  function refreshPause() {
    real().forEach(syncPause);
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
    tellTheme(piece.querySelector('[data-preview]'));
    // Including the pause, and for the same reason. A document that has just
    // announced itself is holding none of the state the index thinks it is —
    // markReady would return early on a card that is already ready and never
    // reach it, which left a fresh preview animating through a gesture that
    // every other card had stopped for.
    const held = piece.querySelector('[data-preview]');
    if (held) delete held.dataset.paused;
    syncPause(piece);
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

  // Which theme the rail is in, re-sent at the one moment a preview is known
  // to be listening.
  //
  // The theme arrives twice over — as ?theme= on the src a preview is loaded
  // with, and as preview:theme if the index is switched while it is already on
  // screen — and between the two sits the case neither covers: a document that
  // is loading right now. Its src was written before the switch, so it carries
  // the old theme; the message that would correct it lands in a document that
  // has not parsed its listener yet, and is dropped. The card is then on the
  // wrong ground for as long as it stays loaded, which is until the rail drops
  // it — the rest of the session, at the current margins.
  //
  // Toggling during the page's own first pass strands the whole rail that way;
  // toggling later strands whichever card the drift happened to be loading.
  // That is the "not all of them" shape of it.
  //
  // So theme joins the scale and the pause as state the ready message
  // re-states. <html>'s own attribute is the source read, because it is where
  // the theme module has already resolved the stored choice, the query string
  // and the system preference into one answer.
  function tellTheme(frame) {
    if (!frame || !frame.contentWindow) return;
    const theme =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light';
    frame.contentWindow.postMessage(
      { source: CHANNEL, type: 'preview:theme', theme: theme },
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
    // Loads drain when the hand lifts, so one can arrive while the step that
    // follows is still running. It joins the others paused rather than being
    // the one card animating through the landing.
    // ...but not before it has had SETTLE_IN to reach its resting state, which
    // for a component that draws itself is the difference between a thumbnail
    // and an empty frame.
    //
    // Off screen, or on the page's own first pass. A card you can see follows
    // the read mark like every other card does — the grace is for the one
    // arriving from outside, and granting it to a card already a third onto the
    // screen is the thing the read mark exists to prevent. Loading starts a
    // scrollport out, so off screen is the ordinary case; what it rules out is
    // the load that drains late enough in a step that the card has come into
    // view under it.
    //
    // The first pass is the exception because nothing has been read yet: the
    // whole rail arrives at once and the second card is a third on screen
    // whatever the rail does, so holding it at its first frame is not a card
    // introducing itself early — it is a card that never introduced itself at
    // all, and under the drift it sits there empty for ten seconds. A component
    // drawing itself while the page loads is the page loading.
    if (offScreen(piece) || performance.now() - bornAt < SETTLE_IN) {
      piece.dataset.arriving = 'true';
      clearTimeout(arrivals.get(piece));
      arrivals.set(piece, setTimeout(() => endGrace(piece), SETTLE_IN));
    }
    syncPause(piece);
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

  // Spinning up a document costs a frame — measured: a preview's src changing
  // on one frame and the next one arriving 30ms late. At rest that is a hitch
  // nobody is looking at, but mid-gesture it lands in the middle of the motion,
  // and with the margins as tight as they are a drag across two cards used to
  // set off two or three of them. So while a gesture is in flight the work is
  // remembered rather than done, and the rail catches up the moment it settles.
  const waiting = new Set();

  // Declared here rather than beside land(), which is far below: gesturing()
  // is called from loadPreview, and loadPreview runs synchronously during setup
  // on a browser with no IntersectionObserver. A `let` declared after this
  // point would be a ReferenceError on that path.
  let landing = false;
  let landTimer = 0;
  let quietPoll = 0;

  function gesturing() {
    return touching || dragging || landing || stepFrame !== 0;
  }

  // The two halves settle at different moments, because they are waiting on
  // different things. A load only has to be off the finger: started when the
  // hand lifts, it runs under the step that follows and the card is ready
  // before it has finished arriving — where waiting for the step to end left
  // the landed card showing its skeleton for a quarter of a second, all of it
  // after the movement had stopped. Playing waits for the step, because that
  // is the expensive one and the step is still motion.
  function drainWork() {
    if (!waiting.size) return;
    const due = Array.from(waiting);
    waiting.clear();
    due.forEach((job) => job());
  }

  function settleWork() {
    // Where the rail actually stopped, not where it was when the step was
    // planned. sync is coalesced onto a frame, so currentActive can still be
    // the card the gesture started from — which is how a card a third on screen
    // and a full card off the mark ended up being told to perform, and stayed
    // that way at rest. Reading it again here costs one layout per settle.
    sync();
    // handoff before the unpause: it is what stops the card being left behind
    // and starts the one that landed, and unpausing first would let the old
    // card — still holding dataset.active — run for the frames in between.
    if (onMark) handoff();
    pauseAll(false);
    drainWork();
  }

  function loadPreview(piece) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame || frame.dataset.loaded === 'true') return;
    const src = frame.getAttribute('data-src');
    if (!src) return;

    if (gesturing()) {
      waiting.add(() => loadPreview(piece));
      return;
    }

    frame.dataset.loaded = 'true';
    watchLoad(piece);
    frame.setAttribute('src', src);
  }

  function dropPreview(piece) {
    const frame = piece.querySelector('[data-preview]');
    if (!frame || frame.dataset.loaded !== 'true') return;

    // Deferred for the same reason: blanking a frame is a repaint of the card,
    // and a card repainting under a moving finger is the thing being fixed.
    if (gesturing()) {
      waiting.add(() => dropPreview(piece));
      return;
    }

    delete frame.dataset.loaded;
    delete frame.dataset.paused;
    delete piece.dataset.seen;
    endGrace(piece);
    clearTimeout(readyTimers.get(piece));
    // The skeleton comes back with it: the card is about to hold a blank
    // document, and lifting the cover off that is worse than covering it.
    piece.classList.remove('is-ready');
    delete piece.dataset.active;
    frame.setAttribute('src', 'about:blank');
  }

  // Two bands now, and neither decides whether a preview animates — the read
  // mark does that, in wantPaused. These only decide whether the document
  // exists.
  //
  // Loading starts a full scrollport out, where it used to start a quarter of
  // one. A quarter put the load a third of a card before the card arrived, so
  // you watched it happen. A load has to finish before it is looked at, which
  // means starting well before, and it can afford to: an off-mark preview is
  // paused, so a document that exists early costs nothing but its memory.
  //
  // Unloading is a ceiling rather than a routine — a handful of documents is
  // fine to hold, five hundred would not be. At this margin nothing in the
  // current set ever reaches it.
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) loadPreview(e.target); }),
      { root: track, rootMargin: '0px 100% 0px 100%' }
    );

    const gone = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (!e.isIntersecting) dropPreview(e.target); }),
      { root: track, rootMargin: '0px 600% 0px 600%' }
    );

    allPieces().forEach((piece) => { near.observe(piece); gone.observe(piece); });
  } else {
    // No observer: load the lot, which is what the page did before.
    allPieces().forEach(loadPreview);
  }

  // --- hover and focus --------------------------------------------------

  // Which card the pointer is on, or null. The demo below needs it for two
  // different questions — whether to run at all, and whether the card it is
  // holding has since been taken over by a reader — and neither can be asked
  // of `:hover`: a card that performs can move its own box out from under a
  // stationary cursor, so the pseudo-class goes stale exactly when the answer
  // matters. What the pointer last entered is the honest record.
  let hoveredPiece = null;

  real().forEach((piece) => {
    piece.addEventListener('pointerenter', () => {
      if (coarse.matches) return;   // touch drives this off the active card
      hoveredPiece = piece;
      // A reader is pointing, so the whole wave ends — not just this card.
      // With several performing at once, leaving the others open under a hand
      // that has arrived is the rail carrying on over the top of them. The one
      // being entered is dropped rather than closed: it is about to be told to
      // perform anyway, and the demo's own release would later turn off a
      // state the pointer is still holding.
      demoClear(piece);
      tell(piece, true);
    });
    piece.addEventListener('pointerleave', () => {
      if (coarse.matches) return;
      if (hoveredPiece === piece) hoveredPiece = null;
      tell(piece, false);
      // A full beat before the rail demonstrates anything again. Without it
      // the retry is the next thing to run — measured, the same card opened
      // again 500ms after the pointer left and sat there for its whole hold,
      // which reads as the card following the cursor off rather than as the
      // rail carrying on by itself.
      demoSoon(DEMO_REST);
    });
    piece.addEventListener('focusin', () => { demoClear(piece); tell(piece, true); });
    piece.addEventListener('focusout', (event) => {
      if (!piece.contains(event.relatedTarget)) tell(piece, false);
    });
  });

  // --- the rail demonstrates itself -------------------------------------

  // Every few seconds the cards on screen perform, the way they would under a
  // pointer, and settle back. The card at the read mark leads and the rest
  // follow a beat apart, so it reads as a wave crossing the rail rather than
  // as everything flashing at once.
  //
  // It exists because of an asymmetry nobody would guess from the code:
  // `handoff` is what tells a card at the mark to perform, and it returns
  // early unless `coarse.matches`. On a phone the card being read introduces
  // itself; on a desktop no card is ever told to perform except by a pointer
  // already on it. So the rail a desktop reader watches drift past is five
  // resting states, and the thing each study is actually about — the panel
  // that rises, the toolbar that morphs, the plate that re-inks — is invisible
  // until they happen to point at one. The drift moves the cards; it does not
  // show what they do.
  //
  // The studies whose resting state already animates are what this is measured
  // against: the gradient field and the dot field look alive on the rail on
  // their own, and a card whose whole subject is a hover behaviour read as
  // broken sitting still next to them.
  const DEMO_EVERY = 6000;
  // Long enough to read. The slowest open state in the set settles inside a
  // second, so this is the entry, a beat to look at it, and the way back out.
  const DEMO_HOLD = 2200;
  // Between one card starting and the next. Not decoration: the wave is what
  // keeps the cost off a single frame, since a performing card is an unpaused
  // card and every card starting at once is every preview restyling at once.
  //
  // It is a relay rather than a ripple, and the number is what makes it one.
  // Against the hold, the stagger decides how many cards are open together:
  // four of them overlap while it is under DEMO_HOLD / 3, and at 420 the whole
  // row was open for the better part of a second, which reads as the rail
  // flashing rather than as a wave crossing it. Past that third the count comes
  // down a card at a time — here three at the peak, each one clearly leading
  // the next, and every card gets a beat where it is the newest thing moving.
  // One at a time exactly would want the stagger at DEMO_HOLD or the hold
  // shortened to meet it; that is a different effect and not what this is.
  const DEMO_STAGGER = 850;
  // A beat that could not run asks again on this rather than waiting out the
  // full gap. Everything it waits on — a pointer gone, the overlay closed, a
  // gesture ended — arrives without announcing itself.
  const DEMO_RETRY = 900;
  // The quiet between one wave and the next. Floored at the retry so that
  // shortening the period below the hold cannot leave the rail never closing.
  const DEMO_REST = Math.max(DEMO_RETRY, DEMO_EVERY - DEMO_HOLD);
  // Substantially on screen, not merely intersecting. This is what is left of
  // the rule that nothing performs before the mark, and it is the half of it
  // that was load-bearing: what went wrong when proximity decided performing
  // was a card a third of the way in running its open state, so the thing
  // worth seeing happened off to the side and was over by the time the card
  // was yours to look at. A card three quarters in is not arriving, it is
  // there.
  const DEMO_SHOWN = 0.75;

  // The cards this is holding open, each with its own release, and the starts
  // still queued behind the stagger.
  const demoHeld = new Map();
  let demoStarts = [];
  let demoNextTimer = 0;

  function demoSoon(delay) {
    clearTimeout(demoNextTimer);
    demoNextTimer = setTimeout(demoTick, delay);
  }

  function demoShown(piece) {
    const tr = track.getBoundingClientRect();
    const r = piece.getBoundingClientRect();
    if (!r.width) return false;
    const shown = Math.min(r.right, tr.right) - Math.max(r.left, tr.left);
    return shown / r.width >= DEMO_SHOWN;
  }

  // Mark first, then the rest in ring order. The mark leads because it is the
  // card being read, and it is exempt from the visibility test rather than
  // filtered by it: the mark is whichever card has arrived, which under the
  // drift can be one the rail has already carried most of the way off. Held to
  // the same three quarters it dropped out of its own wave and a card behind it
  // performed instead — measured, a wave at 63s with the mark nowhere in it.
  // The card being read performs; that is what the mark means.
  function demoCards() {
    const mark = real()[currentActive];
    const list = real().filter(function (piece) {
      return piece !== mark && demoShown(piece) && piece.dataset.active !== 'true';
    });
    if (!mark || mark.dataset.active === 'true') return list;
    return [mark].concat(list);
  }

  function demoStart(piece) {
    // Between the queue and here a reader may have arrived, or the rail may
    // have carried the card off. Both are re-asked rather than trusted from
    // when the wave was planned.
    // Re-asked rather than trusted, with the mark exempt here too — it is the
    // card being read wherever the rail has got to.
    if (!demoable()) return;
    if (piece !== real()[currentActive] && !demoShown(piece)) return;
    if (piece.dataset.active === 'true') return;
    demoHeld.set(piece, setTimeout(function () { demoStop(piece); }, DEMO_HOLD));
    // This is also what unpauses it: wantPaused returns false for a card whose
    // dataset.active is set, and tell() calls syncPause before posting. So a
    // performing card is a live card, which is the cost the stagger spreads.
    tell(piece, true);
  }

  // The hold is up, or something moved underneath it.
  function demoStop(piece) {
    clearTimeout(demoHeld.get(piece));
    demoHeld.delete(piece);
    // Never turn off a state a reader is holding. Both halves are checked here
    // rather than trusted from when the hold began: a pointer can arrive
    // mid-hold, and focus can move without a pointerenter at all.
    if (hoveredPiece === piece) return;
    if (piece.contains(document.activeElement)) return;
    tell(piece, false);
  }

  // A pointer or focus has taken this card. Forget it without turning it off —
  // whoever took it owns its state now.
  function demoDrop(piece) {
    if (!demoHeld.has(piece)) return;
    clearTimeout(demoHeld.get(piece));
    demoHeld.delete(piece);
  }

  // The rail has carried a held card most of the way off. Only those close,
  // which is what separates this from demoClear: the mark moving does not
  // invalidate a wave that was never only the mark's, and clearing on every
  // mark change would truncate nearly every wave the drift ever sees.
  function demoPrune() {
    const mark = real()[currentActive];
    Array.from(demoHeld.keys()).forEach(function (piece) {
      if (piece !== mark && !demoShown(piece)) demoStop(piece);
    });
  }

  // End the wave: the queue, and everything it is holding. `keep` is a card a
  // reader has just taken, dropped rather than closed under them.
  function demoClear(keep) {
    demoStarts.forEach(clearTimeout);
    demoStarts = [];
    Array.from(demoHeld.keys()).forEach(function (piece) {
      if (piece === keep) demoDrop(piece);
      else demoStop(piece);
    });
    demoSoon(DEMO_REST);
  }

  function demoable() {
    // Touch has handoff, which holds the mark's card performing for as long as
    // it is the mark's. Nothing to add there, and a second source of `active`
    // on the same card would fight it.
    if (coarse.matches) return false;
    // Content that performs unasked is the whole of what the preference is
    // about — the same test `driftsUnasked` makes for the drift. A pointer
    // still works, which is the half the preference does not forbid.
    if (reduced.matches) return false;
    if (document.hidden) return false;
    // A reader is pointing at the rail; hover is the truth while they are.
    if (hoveredPiece) return false;
    // Quick look is open. Its own frame runs the component with real hover and
    // steps its variants on a timer of its own, and the rail behind the scrim
    // is not being looked at — performing there is work on the thread the
    // overlay is using.
    if (document.body.classList.contains('is-locked')) return false;
    // A drag, a step or a landing. The drift is deliberately not in this: a
    // card three quarters on screen is there to be looked at whether or not
    // the rail is still carrying it.
    return !gesturing();
  }

  function demoTick() {
    demoNextTimer = 0;
    if (demoHeld.size || demoStarts.length) return;   // a wave is still out
    if (!demoable()) { demoSoon(DEMO_RETRY); return; }
    const cards = demoCards();
    if (!cards.length) { demoSoon(DEMO_RETRY); return; }
    demoStarts = cards.map(function (piece, i) {
      return setTimeout(function () {
        // Starts fire in order, so the last one is what empties the queue —
        // demoTick reads its length to know a wave is still going out.
        if (i === cards.length - 1) demoStarts = [];
        demoStart(piece);
      }, i * DEMO_STAGGER);
    });
    // The wave is over once the last card's hold is up; the rest follows that.
    demoSoon((cards.length - 1) * DEMO_STAGGER + DEMO_HOLD + DEMO_REST);
  }

  demoSoon(DEMO_REST);

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
  const ghosts = Array.from(track.querySelectorAll('.piece--ghost'));

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
    // All of them. A filter narrows the rail to one type, and a forthcoming
    // slot has no type to be narrowed to.
    ghosts.forEach((el) => el.classList.toggle('is-filtered', filterType !== FILTER_ALL));

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

  // How many cards of each type, and the order the types are listed in:
  // commonest first, alphabetical where two are level. Two places read it —
  // the filter chips and the footer's Types row — and a row that ordered them
  // differently from the chips above would read as a different set of things.
  function typeCounts() {
    const counts = new Map();
    allPieces().forEach((piece) => {
      const type = typeOf(piece);
      if (type) counts.set(type, (counts.get(type) || 0) + 1);
    });
    return counts;
  }

  function typeOrder(counts) {
    return Array.from(counts.keys()).sort((a, b) => {
      const d = counts.get(b) - counts.get(a);
      return d !== 0 ? d : a.localeCompare(b);
    });
  }

  // The footer says what the set covers. It reads the badges rather than
  // holding a list of its own, so the types are declared once per card and
  // nowhere else — and it counts what exists rather than what the rail is
  // showing, which is the same split the Studies row beneath it keeps: a
  // filter narrowing the rail to one type is not four types ceasing to exist.
  function renderFootTypes() {
    if (!footTypes) return;
    const order = typeOrder(typeCounts());
    footTypes.textContent = order.length
      ? order.map(typeLabel).join(' \u00b7 ')
      : '\u2014';
  }

  function buildFilter() {
    if (!filterRow) return;

    const counts = typeCounts();

    // One type is not a choice, and no types means no keys to read.
    if (counts.size < 2) {
      filterRow.hidden = true;
      filterBtns = [];
      return;
    }

    const order = typeOrder(counts);

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
    syncFilterFade();
  }

  // The row scrolls sideways on a narrow screen rather than wrapping, which
  // means a chip can sit outside it — and Chromium does not bring a chip that
  // Tab reaches back into view on its own here, so the last option is focused
  // and invisible. One call, and a no-op at every width where the row fits.
  if (filterRow) {
    filterRow.addEventListener('focusin', (event) => {
      const btn = event.target.closest('.rail__filter-btn');
      if (btn) btn.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    });
  }

  // Which end of the row wears a fade. The mask is CSS; what it cannot know is
  // whether there is anything past either edge, which is a scroll position and
  // two widths. A whole pixel of slack, because a scrollLeft at the end is
  // fractional on a fractional device ratio and a permanent fade at an end
  // with nothing past it is the one thing this is meant not to say.
  function syncFilterFade() {
    if (!filterRow || filterRow.hidden) return;
    const max = filterRow.scrollWidth - filterRow.clientWidth;
    const at = filterRow.scrollLeft;
    filterRow.classList.toggle('is-fade-start', at > 1);
    filterRow.classList.toggle('is-fade-end', max > 1 && at < max - 1);
  }

  if (filterRow) {
    filterRow.addEventListener('scroll', syncFilterFade, { passive: true });
    window.addEventListener('resize', syncFilterFade);
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
    // Same strings, further down the page: the footer's Types row is the card
    // badges too, so it turns over with them rather than carrying its own.
    renderFootTypes();
    // Danish labels are not the width English ones were, so the row may have
    // gained or lost the overflow the fade is reporting.
    syncFilterFade();
  });

  // --- rail -------------------------------------------------------------

  // The drift control's label is state rather than a fixed string, so English
  // lives here instead of in the markup's data-i18n-aria and the Danish comes
  // off the same table the hint reads. prev and next keep their markup labels:
  // a looping rail has no end for them to announce.
  //
  // No "again" in the play label: under reduced motion the rail has never set
  // off, and the control is offered from the start precisely so it can be. The
  // word carried nothing the reader needed and was wrong in the one state where
  // the control matters most.
  const NAV_EN = {
    'a11y.pauseRail': 'Pause the carousel',
    'a11y.playRail': 'Start the carousel'
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

  // The three measurements every other function here asks for, taken once and
  // kept. Each one is a read, and a read after a write is where the browser has
  // to stop and lay the row out again before it can answer — which is exactly
  // what a drag does, writing scrollLeft on every pointermove and then asking
  // how wide a card is. Measured over a three-second drag: 172 forced layouts
  // and a third of the thread, on a phone reporting moves at 120Hz.
  //
  // None of it moves under a gesture. A card's width changes at a breakpoint,
  // the scrollport's with the window, the inset with neither — so the cache is
  // dropped where those happen and nowhere else.
  let metrics = null;

  function forget() { metrics = null; }

  function measure() {
    // Measured off a card in the row rather than the first in the file, which
    // the filter may have taken out and left with a zero width.
    const first = ring[0] || laidOut()[0];
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap) || 0;
    metrics = {
      step: first ? first.getBoundingClientRect().width + gap : track.clientWidth,
      inset: parseFloat(cs.scrollPaddingLeft) || 0,
      client: track.clientWidth,
      // The row's width does not move under a gesture either — the ring keeps
      // the same cards in it, only in a different order — so this is cached
      // with the rest. recycle() reads it on every frame of a drag, and
      // scrollWidth is a forced layout every time it is asked for.
      max: Math.max(0, track.scrollWidth - track.clientWidth)
    };
    return metrics;
  }

  const sized = () => metrics || measure();

  // One card plus the flex gap — the distance a single step should cover.
  function step() {
    return sized().step;
  }

  function maxScroll() {
    return sized().max;
  }

  // Where the recycle parks the rail: the middle of the row.
  //
  // It used to park one card in, which left a card and a quarter of row behind
  // the rail and three and a half in front. Touch is the half of this that
  // cannot recycle mid-gesture — writing scrollLeft under a native scroll is
  // writing underneath the thing doing the scrolling, and takes the momentum
  // with it — so a swipe has only the row that is already there to spend, and
  // backwards it ran out after a card and a quarter. Past that the rail hits
  // scrollLeft 0, rubber-bands against a wall it is not supposed to have, and
  // the recycle that was waiting for the gesture to end lands all at once.
  // That is the jump at the seam.
  //
  // The band is a card wide and any w-periodic lattice has exactly one point
  // in it, so parking it on the middle lands the rail on the snap position
  // nearest the middle without this having to know where the snap positions
  // are. Same slack either way, and about twice what a backwards swipe had.
  function homePos() {
    return maxScroll() / 2;
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
    forget();          // a different set of cards is a different row
    applyRing();
    recycle();
  }

  // The row has to cover the viewport with a card to spare, or there is
  // nothing to recycle into and the row would show its own end. A wide
  // viewport holding few studies is below that line; it is the one case the
  // rail stays finite in, and every study added raises the ceiling by a card.
  function loopable() {
    const m = sized();
    return m.step > 0 && (ring.length - 1) * m.step - m.client >= m.step;
  }

  // scrollLeft is held within half a card either side of the middle of the row
  // (see homePos), so there is as much row to scroll back into as there is to
  // scroll forward through. Returns the distance the scroll was moved, because anything holding
  // a scroll position of its own — a drag's origin, a step's two ends — has to
  // move with it or it will fight the recycle on the next frame.
  // `at` is the position the caller has just put the scroll at. Reading it back
  // off the element instead is what made dragging expensive: a scrollLeft write
  // followed by a scrollLeft read is a question the browser cannot answer
  // without laying the row out again, and the drag does exactly that on every
  // pointermove. Measured at one forced layout per move, about a hundred and
  // sixty in a three-second drag, against none while the rail sits still.
  // Callers that have not just written it pass nothing and pay for one read.
  function recycle(at) {
    if (!loopable()) return 0;

    const w = step();
    const home = homePos();
    let pos = at === undefined ? track.scrollLeft : at;
    let shifted = 0;
    let guard = ring.length * 2;

    while (guard-- > 0 && pos >= home + w * 0.5) {
      rotate(1);
      pos -= w;
      track.scrollLeft = pos;
      shifted -= w;
    }

    guard = ring.length * 2;
    while (guard-- > 0 && pos < home - w * 0.5) {
      rotate(-1);
      pos += w;
      track.scrollLeft = pos;
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
  // the track's scroll-padding edge, and how far off the mark it still is.
  //
  // Nearest and arrived are two different questions, and they were being
  // answered by one number. Nearest flips at the halfway point — the moment the
  // incoming card's edge is closer than the outgoing one's — which is the right
  // answer for the counter and the progress bar, and the wrong one for whether
  // a component should start performing. A card half in is not being read.
  function activeIndex() {
    const list = real();
    if (!list.length) return { index: 0, off: Infinity };

    const trackLeft = track.getBoundingClientRect().left;
    const inset = sized().inset;
    const mark = trackLeft + inset;

    let best = 0;
    let bestDistance = Infinity;
    let bestSigned = Infinity;
    list.forEach((piece, i) => {
      const signed = piece.getBoundingClientRect().left - mark;
      const distance = Math.abs(signed);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSigned = signed;
        best = i;
      }
    });
    // Signed as well as absolute, because which side of the mark a card is on
    // is the difference between arriving and leaving. A card still to the right
    // of the mark has not been read yet however near it is.
    return { index: best, off: bestDistance, signed: bestSigned };
  }

  // How close to the mark counts as arrived, as a fraction of a card. Snap
  // lands exactly, so this only has to absorb the last pixels of a settle — it
  // is not a halfway line, which is the whole point of it.
  const ON_MARK = 0.1;

  let currentActive = -1;
  let onMark = false;

  // Which card is currently being told to play, as against which one is in the
  // read position. They are the same thing at rest and deliberately not during
  // a gesture — see handoff().
  let told = -1;

  // Without hover, the read card is the only thing that can demonstrate the
  // component, so it plays by default and the one leaving stops.
  //
  // Never mid-gesture, though. The playing state is the expensive half of a
  // component — the one a study writes knowing only one card is ever in it —
  // and a drag across two cards used to start it and stop it four times on the
  // way past. Whatever is animating while the rail moves is animating against
  // the movement, so the handoff waits for the rail to stop and then happens
  // once.
  // Stopping is cheap and starting is not, so the two halves of a handoff are
  // not deferred together. The card being dragged away from stops the moment
  // the gesture begins — it is no longer the one being read, and leaving it
  // playing means the expensive half of a component animating through the
  // whole drag on a card nobody is looking at. The card being dragged toward
  // waits until it has landed.
  function hush() {
    // The wave stops with everything else. It is cleared before the `told`
    // guard rather than after, because on a fine pointer `told` is never set —
    // handoff is the coarse path — so a return here would leave every
    // demonstrating card performing through the whole gesture, which is the
    // one thing hush exists to prevent.
    demoClear();
    if (told < 0) return;
    const list = real();
    if (list[told]) tell(list[told], false);
    told = -1;
  }

  function handoff() {
    if (!coarse.matches || told === currentActive) return;
    const list = real();
    if (list[told]) tell(list[told], false);
    if (list[currentActive]) tell(list[currentActive], true);
    told = currentActive;
  }

  function markActive(i, arrived) {
    const moved = i !== currentActive;
    const landed = arrived !== onMark;
    if (!moved && !landed) return;

    const list = real();
    const leaving = moved ? list[currentActive] : null;

    // The mark moving is not the wave's business — it reaches every card on
    // screen, not only the one being read. What it is business of is a card
    // the rail has since carried off, which this is the cheapest moment to
    // notice: markActive already runs off sync's rects.
    if (moved) demoPrune();

    if (moved) {
      // The card arriving next, marked so the drift can run it as it comes in.
      // Ring order is arrival order, so it is simply the one after this — and
      // it wraps, because a looping rail has no last card.
      const next = list.length ? (i + 1) % list.length : -1;
      list.forEach((piece, n) => {
        piece.classList.toggle('is-active', n === i);
        if (n === next) piece.dataset.next = 'true';
        else delete piece.dataset.next;
      });
      currentActive = i;
    }
    onMark = arrived;

    // Arriving is what starts a preview, and three cards change when the mark
    // moves — the one it left, the one it is on, and the one now arriving
    // behind it. syncPause posts only where the answer moved, so re-asking all
    // of them costs a boolean each and keeps the three in step.
    if (moved) refreshPause();
    else {
      if (leaving) syncPause(leaving);
      if (list[currentActive]) syncPause(list[currentActive]);
    }

    // Only once it has actually arrived. handoff is what tells a component to
    // perform, and a component whose performance is a transition rather than an
    // animation — the toolbar that morphs its search field — cannot be held by
    // the pause at all, because animation-play-state does not touch
    // transitions. The pause stops a card that is running; this is what stops
    // one from being started.
    if (onMark && !gesturing()) handoff();
  }

  // sync() reads the position of every card, and a scroll fires more often than
  // the screen can draw — several times a frame under a drag, which on a 120Hz
  // phone is several times 120. Coalesced onto the frame, it runs once for
  // however many arrived, and it runs after the writes rather than between
  // them, which is the difference between one layout and one per event.
  let syncFrame = 0;

  function syncSoon() {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = 0;
      sync();
    });
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

    syncVisibility();

    const read = activeIndex();
    const active = read.index;
    const w = step();
    // The drift is the exception, and it has to be: it never rests, so a rule
    // that waits for rest would leave the index permanently still. While the
    // rail is moving on its own the nearest card is the one being shown. The
    // arrival test governs the rail under a reader's hand, which is where the
    // complaint lives — and the first touch stops the drift for good anyway.
    // Arrival, not nearness — and during the drift that distinction needs the
    // sign. Nearest flips at the halfway point, which is half a card *before*
    // the card reaches the mark, so a drifting rail had every card start
    // performing on its way in: the pulse ran while the card was still coming
    // onto the screen. Reading the signed distance instead starts it when it
    // arrives and leaves it running as it travels past, until the next one
    // arrives in its turn — which is what the drift needs, since it never rests
    // and a rule that waited for rest would leave the index permanently still.
    const arrived = !(w > 0)
      ? true
      : (drift === 'on' ? read.signed <= w * ON_MARK : read.off <= w * ON_MARK);
    markActive(active, arrived);
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
  // A release used to land faster than a button step, on the reasoning that the
  // hand had already done the travel. That was right while the hand's momentum
  // was still carrying it; now that the fling is cancelled and the rail travels
  // the whole way itself, the same reasoning makes it abrupt — there is nothing
  // else moving to be quick relative to.
  const RELEASE_MS = 460;

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
      settleWork();
      return;
    }

    // The card being left stops now, not when the rail arrives. A touch gesture
    // already does this at first contact; a button step and a settle had no
    // equivalent, so the outgoing card went on performing for the length of the
    // step — and a component whose performance is a transition rather than an
    // animation is not held by the pause at all, so the toolbar morphed its way
    // out of the read position and a card or two past it.
    hush();
    pauseAll(true);
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
    // Quartic rather than cubic: the same start, a longer tail. What makes a
    // landing read as buttery is how it arrives, not how it leaves.
    const eased = 1 - Math.pow(1 - t, 4);
    const at = stepFrom + (stepTarget - stepFrom) * eased;
    track.scrollLeft = at;

    const shift = recycle(at);
    if (shift) { stepFrom += shift; stepTarget += shift; }

    if (t < 1) {
      stepFrame = requestAnimationFrame(stepTick);
      return;
    }

    track.classList.remove('is-stepping');
    stepFrame = 0;
    // The rail has stopped moving: whatever the gesture deferred can happen now.
    settleWork();
  }

  // A touch release is the platform's, end to end — its momentum, its snap, its
  // deceleration curve. Nothing here animates anything.
  //
  // Every attempt that did animate it failed the same way, for reasons that
  // only lined up at the end. Driving scrollLeft from rAF is a main-thread
  // scroll update per frame: two or three visible hitches in every landing on a
  // phone, invisible to a throttled Chromium. Translating the row instead is
  // smooth, but the fling is still running underneath it, so the two distances
  // add up — the rail travels much too far and then snaps back when the real
  // scroll is committed. And a fling cannot reliably be cancelled from script:
  // the write meant to stop it is a no-op when it asks for the position the
  // scroll is already at.
  //
  // What was actually wrong was upstream of all of it. `scroll-snap-stop:
  // always` makes a fling stop at the next card rather than running through
  // several — but only if snap is on when the browser *plans* the fling, and
  // snap was off for the whole gesture so that a finger landing on a drifting
  // rail is not yanked to the nearest card. It was off at exactly the moment it
  // needed to be on.
  //
  // It only has to be off while the rail is still. Mandatory snap applies at
  // the end of a scroll, not during one, so giving the class back on the first
  // touchmove yanks nothing — the scroll is live by then — and the fling that
  // follows is planned with snap and snap-stop in hand. One swipe, one study,
  // landing on the mark, and not one line of it on this thread.
  let landEnd = null;

  // The lattice the cards actually sit on. A gesture that began on a drifting
  // rail began between two of them, and every target has to be one of them
  // whatever the arithmetic started from.
  function snapPos(at) {
    const w = step();
    const row = laidOut();
    if (!row.length || w <= 0) return at;
    const base = row[0].offsetLeft - sized().inset;
    return base + Math.round((at - base) / w) * w;
  }

  function stopWaiting() {
    clearTimeout(landTimer);
    clearInterval(quietPoll);
    quietPoll = 0;
    if (landEnd) { track.removeEventListener('scrollend', landEnd); landEnd = null; }
  }

  function finishLanding() {
    if (!landing) return;
    landing = false;
    stopWaiting();
    track.classList.remove('is-dragging');   // a no-op unless the finger never moved
    recycle();
    settleWork();
  }

  // Wait for the scroll to stop, however it is stopping, and then let the rail
  // catch up with itself. `wait` is the backstop for an engine that sends no
  // scrollend, or a scroll that is interrupted.
  function waitForStop(wait) {
    landing = true;
    stopWaiting();
    landEnd = () => finishLanding();
    track.addEventListener('scrollend', landEnd);

    // scrollend is the proper signal, and this is what covers an engine that is
    // late with it or does not send one. Waiting out the backstop instead left
    // the card sitting on the mark for the better part of a second before it was
    // told to perform — dead air between arriving and anything happening.
    //
    // Quiet alone is not enough to go on. scrollLeft quantises to whole pixels,
    // so the tail of an ease-out sits on one of them for longer than these two
    // ticks while the scroll is still live, and finishing there would recycle
    // the rail mid-motion — which is the seam jump. So the rail has to be quiet
    // AND on a snap position: landed, not merely slow. Anything else waits out
    // the backstop, which is what it is for.
    let was = track.scrollLeft;
    let still = 0;
    quietPoll = setInterval(() => {
      const at = track.scrollLeft;
      if (at !== was) { was = at; still = 0; return; }
      if (++still < 2) return;
      if (Math.abs(at - snapPos(at)) > 1) return;
      finishLanding();
    }, 45);

    landTimer = setTimeout(finishLanding, wait);
  }

  // The platform has it: a fling is running, snap and scroll-snap-stop will
  // land it on the next card, and nothing here may touch the scroll while that
  // happens.
  function landFlung() {
    waitForStop(1200);
  }

  // No fling worth the name — which is the only condition under which the rail
  // may move the scroll itself without fighting something. A slow drag leaves
  // almost no momentum, so a smooth scroll started now is the only thing
  // travelling, and it is the platform's animation rather than a loop here.
  function landWalked(target) {
    if (reduced.matches || Math.abs(target - track.scrollLeft) < 1) {
      landing = true;
      finishLanding();
      return;
    }
    waitForStop(900);
    track.scrollTo({ left: target, behavior: 'smooth' });
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
    const inset = sized().inset;
    stepTo(target.offsetLeft - inset);
  }

  // Land on a card. Snap does this for itself when it is on; this is for the
  // paths that turn it off — a drag, and the drift — where the scroll can stop
  // anywhere.
  function settle() {
    const target = real()[activeIndex().index];
    if (!target) return;
    const inset = sized().inset;
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
    // Never while a finger is down. A recycle writes scrollLeft, and writing it
    // under a native gesture is writing underneath the thing doing the
    // scrolling — the browser is tracking the finger against an offset it set
    // itself, and moving that offset is how a swipe loses its momentum. The
    // row carries a card of slack either side, which is more than a gesture
    // spends before it ends, and the step that follows recycles on every frame
    // of itself.
    // Never under a glide either: a scrollLeft write cancels a native smooth
    // scroll, and the recycle would stop it halfway.
    // Never while a landing is still travelling: a scrollLeft write would cut
    // the momentum short, and the browser is mid-decision about where to snap.
    if (!stepFrame && !dragging && !touching && !landing && drift !== 'on') recycle();
    syncSoon();
  }, { passive: true });

  window.addEventListener('resize', () => {
    forget();          // a new viewport is new card widths and a new scrollport
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
  const DRIFT_SPEED = 26;      // px per second
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
  let driftPos = 0;            // the exact position, unrounded, carried between frames
  let nudged = 0;              // the sub-pixel part of it, currently paid out on the cards
  let holdTimer = 0;
  let boxOpen = false;         // quick look, which must not resume behind itself
  let taken = false;           // the reader has stopped it; it does not come back on its own

  // Whether this rail can drift at all — a row too short to loop has nowhere to
  // drift to. Reduced motion is deliberately not in here: it decides whether the
  // rail sets off on its own, which is a different question from whether the
  // control exists, and folding the two together is what left a reader with the
  // preference set no way to start the carousel at all.
  function driftable() {
    return loopable();
  }

  // ...and whether it may set off unasked. Content that moves by itself is the
  // thing the preference is about, so it does not; a reader who presses play has
  // asked for this one, which is the opt-in the preference is supposed to leave
  // open rather than close.
  function driftsUnasked() {
    return !reduced.matches;
  }

  // scrollLeft is handed 0.43 of a pixel a frame at this speed, and its getter
  // reports whole pixels — so read back, the rail looks frozen for two frames
  // in three and then jumping a whole one. That reading is the getter's, not
  // the rendering's: Chromium keeps the scroll offset fractional underneath,
  // and a card's measured position there moves the full 0.43 every frame with
  // none of this. Measured both ways on the same frame: rendered position 0%
  // frozen, scrollLeft getter 63%.
  //
  // So this is here for the engine that does not, which is the one it was
  // reported on and the one that cannot be checked from here — only Chromium
  // is installed. scrollLeft takes the whole pixels and the remainder is paid
  // out as a translate on the cards, where sub-pixel positions are what the
  // compositor is for. On an engine that already renders the fraction it is a
  // no-op that costs nothing measurable: 200 frames of drift on a throttled
  // phone profile came back at the same 16.7ms median, 0 dropped against 1.
  //
  // `translate` rather than `transform`, because .piece already uses transform
  // for its hover lift and the two compose independently instead of one
  // clobbering the other.
  function nudge(frac) {
    nudged = frac;
    const px = frac ? `${-frac}px` : '';
    ring.forEach((el) => { el.style.translate = px; });
  }

  // Off, and off every card rather than only the ring's, so nothing is left
  // holding a fraction after a filter change swapped the set underneath it.
  // The rail moves by under a pixel when this lands, which is the point.
  function unnudge() {
    if (!nudged) return;
    nudged = 0;
    pieces().forEach((el) => { el.style.translate = ''; });
  }

  function place(pos) {
    const whole = Math.floor(pos);
    track.scrollLeft = whole;
    nudge(pos - whole);
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

    // The position is carried here as a float rather than read back off the
    // element. scrollLeft quantises to whole pixels, so the old way — write,
    // read, keep the difference — needed a read after every write, which is a
    // forced layout on every frame the rail drifts. Holding the exact position
    // ourselves keeps the rate just as honest and asks the browser nothing.
    driftPos += DRIFT_SPEED * dt;
    place(driftPos);

    // The reason there is no longer anything to see at the end of the row.
    // A rotation moves the scroll by a card, and a card is not necessarily a
    // whole number of pixels, so the split has to be taken again after it.
    const shifted = recycle(driftPos);
    if (shifted) {
      driftPos += shifted;
      place(driftPos);
    }
  }

  function driftRun() {
    clearTimeout(holdTimer);
    if (boxOpen || !driftable()) return;
    if (drift === 'on') return;
    drift = 'on';
    driftLast = 0;
    // The one read: where the rail actually is when the drift takes it over.
    driftPos = track.scrollLeft;
    track.classList.add('is-drifting');
    cancelAnimationFrame(driftFrame);
    driftFrame = requestAnimationFrame(driftTick);
    refreshPause();
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
    unnudge();
    refreshPause();
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
    // Before the settle, so snap measures the cards where they actually are.
    unnudge();
    if (wasRunning && settleAfter !== false) settle();
    refreshPause();
    syncDriftBtn();
    renderNav();
  }

  // A pointer on the rail is someone reading it, so the rail waits — but only
  // while there is someone there. Presence alone is not the signal it looks
  // like: on a 1440x810 laptop the track's box is 86% of the fold, so a cursor
  // left anywhere in the middle of the screen is "on the rail" and the drift
  // was held for as long as the page stayed open. A pointer that has moved
  // recently is a reader; one that has not is furniture.
  //
  // So movement holds it and stillness lets it go. Any move re-holds at once,
  // which is what keeps the rail from travelling out from under someone who is
  // actually there — they need only have moved within POINTER_IDLE, not be
  // moving now.
  const POINTER_IDLE = 4000;
  let idleTimer = 0;
  let idleX = null;
  let idleY = null;

  // Moved, in the sense of the pointer having moved. A browser dispatches a
  // pointermove of its own when the content under a stationary cursor changes,
  // so that :hover lands on whatever is under it now — and a drifting rail
  // changes that on every frame. Taken at face value, the rail's own motion
  // reads as a reader being there, holds the drift, and the carousel sits
  // still except for the frame or two after each idle release. The synthetic
  // move carries the coordinates the pointer already had, so comparing them is
  // the whole of the distinction.
  function pointerMoved(event) {
    if (!event || event.clientX === undefined) return true;   // enter, or no coords
    if (event.clientX === idleX && event.clientY === idleY) return false;
    idleX = event.clientX;
    idleY = event.clientY;
    return true;
  }

  function pointerAwake(event) {
    if (drift === 'off') return;        // taken for good; nothing to hold
    if (!pointerMoved(event)) return;
    clearTimeout(idleTimer);
    driftHold();
    idleTimer = setTimeout(() => driftRelease(0), POINTER_IDLE);
  }

  track.addEventListener('pointerenter', (event) => {
    idleX = event.clientX;
    idleY = event.clientY;
    pointerAwake(null);               // arriving counts, wherever it arrived
  });
  track.addEventListener('pointermove', pointerAwake);
  track.addEventListener('pointerleave', () => {
    clearTimeout(idleTimer);
    idleX = idleY = null;
    driftRelease(DRIFT_RESUME);
  });

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

  // A wheel scrolls the track natively and snap lands it on a card, with
  // nothing for the drag handler to catch. Touch used to need a line here too
  // and no longer does: pointerdown covers a finger now, and stopping the
  // drift from two places for one gesture is what stopped the rail before it
  // had been given anywhere to stop.
  //
  // Only a wheel that is actually moving the rail, though. A vertical wheel
  // over the track scrolls the page past it and leaves scrollLeft exactly
  // where it was — measured — so reading it as the reader taking the rail
  // stopped the drift for good on the way down to it. On a 13in laptop the rail
  // is most of the viewport, so scrolling the page to reach the rail is enough
  // to put the pointer over it, and the carousel was dead before it had been
  // looked at. The pointer being there already holds the drift and lets go
  // again on the way out; that is the right answer for passing through.
  //
  // Predominantly horizontal, or shift held, which is the conventional way to
  // ask a vertical wheel for a horizontal scroll. Equal deltas are the
  // diagonal start of a two-finger swipe and count as vertical: a gesture that
  // means the rail resolves into one within a frame or two.
  track.addEventListener('wheel', (event) => {
    const sideways = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (!sideways) return;
    driftStop(true, false);
  }, { passive: true });

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
    // Before the rail has ever set off the control has nothing to say, so it
    // stays out of the way — unless it is never going to set off, in which case
    // it is the only way in and has to be there from the start.
    const pending = drift === 'off' && !taken && driftsUnasked();
    driftBtn.hidden = !driftable() || pending;
  }

  // --- drag to scroll ---------------------------------------------------

  // Mouse, pen and finger alike. This was mouse-only while the browser still
  // scrolled the track horizontally on touch — driving scrollLeft underneath
  // that fought its momentum — but `touch-action: pan-y pinch-zoom` hands
  // horizontal to us, so there is no native scroll left to fight and a swipe
  // gets the same landing a drag does.
  //
  // The hazard the mouse-only rule was avoiding is still real and handled
  // below: a touch gesture can end in `pointercancel` rather than `pointerup`
  // — the browser claiming it for a vertical pan — and a cancelled pointer has
  // no click behind it to swallow.
  // Below this it is a tap or a click, not a drag. A finger is never as still
  // as a mouse: at 4px a tap with ordinary jitter registered as a drag, and
  // the click swallower below then ate the tap that was meant to open the
  // card.
  const DRAG_SLOP = { mouse: 4, touch: 12, pen: 8 };

  // Where a released drag lands. Nearest-card is the obvious rule and the
  // wrong one: it sends a drag of two fifths of a card back to the card it
  // came from, which reads as the rail refusing the gesture rather than
  // answering it.
  //
  // The bar is a tenth of a card, which is low on purpose. There is nowhere to
  // rest between two cards — the rail snaps either way — so the only question
  // a release asks is which card it ends on, and anything past the slop is a
  // deliberate answer to it. A flick means the next one whatever distance it
  // covered.
  const SNAP_FRACTION = 0.1;    // of a card
  const FLICK_SPEED = 0.2;      // px per ms

  // A flick has to have gone somewhere before it counts as one. Without a
  // floor, the jitter at the end of a tap clears the speed bar on its own and
  // the rail answers a tap by moving a card.
  const FLICK_FLOOR = 0.04;     // of a card

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

  let slop = DRAG_SLOP.mouse;

  track.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    // A finger is not driven from here: the browser scrolls this natively on
    // the compositor, and taking that over puts every frame of the gesture on
    // the main thread behind the thumbnails. The touch path below lets it
    // scroll and only decides where the gesture lands once it is over.
    if (event.pointerType === 'touch') return;
    dragging = true;
    moved = false;
    slop = DRAG_SLOP[event.pointerType] || DRAG_SLOP.mouse;
    originX = event.clientX;
    originScroll = track.scrollLeft;
    lastX = event.clientX;
    lastT = event.timeStamp;
    speed = 0;

    // Snap comes off at the first contact, not at the first movement. Between
    // the two, the drift stopping would hand the track back to mandatory snap
    // for long enough to yank it to the previous card — which is the jump a
    // finger landing on a drifting rail used to produce. Nothing is committed
    // by this: a press that turns out to be a tap settles on pointerup.
    track.classList.add('is-dragging');

    // And the rail stops under the finger. pointerenter usually has this in
    // hand already, but a pointer that arrives by landing rather than by
    // travelling may not have fired one, and a rail that keeps drifting under
    // a finger that is already down is the same complaint as the jump.
    driftHold();

    // Capture is taken only once a drag is real. Taking it here would
    // retarget the click, and the quick-look button would stop firing.
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = event.clientX - originX;
    if (!moved && Math.abs(delta) > slop) {
      moved = true;
      // Only once the drag is real. A press that turns out to be a click — a
      // card's link, its quick-look button — has not moved the rail and should
      // not end the drift; the pointer being over the track is already holding
      // it, and it picks up again when that pointer leaves.
      driftStop(true, false);
      hush();
      pauseAll(true);
      track.setPointerCapture(event.pointerId);
    }
    if (moved) {
      const dt = event.timeStamp - lastT;
      if (dt > 0) speed = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastT = event.timeStamp;

      const want = originScroll - delta;
      track.scrollLeft = want;
      // A recycle under the drag moves the scroll out from under the origin
      // this is measured against; without this the next frame would drag the
      // rail back by exactly the card that was just recycled. Handed the
      // position rather than asked for it, so the write above is never read
      // back.
      originScroll += recycle(want);
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
      if (event.type === 'pointerup') swallowNextClick();
      drainWork();
      release();
    } else {
      // A tap, not a drag — but snap has been off since the contact, and the
      // drift may have left the rail between two cards. Settling animates it
      // onto one instead of letting snap take it there in a single frame.
      settle();
    }

    // After release(), not before. Dropping .is-dragging hands the track back
    // to mandatory snap, which snaps to the nearest card the moment the class
    // goes — so reading the scroll after it would measure a gesture the
    // browser had already undone, and every drag under half a card came back
    // to the card it started on. release() puts .is-stepping on first, so the
    // track is never left for a frame with neither.
    track.classList.remove('is-dragging');
    moved = false;
    if (!stepFrame) settleWork();
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

    // The low bar only answers the first question a release asks — whether the
    // rail was meant to move at all. Once whole cards have gone past, that is
    // settled, and the remainder is the ordinary one of which card you stopped
    // nearest: a drag of 1.1 cards means the next one, not the one after it.
    let cards = whole;
    const bar = whole === 0 ? SNAP_FRACTION : 0.5;
    if (Math.abs(rest) >= bar) cards += Math.sign(rest);
    // A flick that covered almost nothing still means the next one, in the
    // direction the hand was travelling — which is the opposite sign to the
    // pointer, since dragging left walks the rail forwards.
    if (cards === 0 && flick && Math.abs(covered) > FLICK_FLOOR) {
      cards = -Math.sign(speed);
    }

    stepTo(originScroll + cards * w, RELEASE_MS);
  }

  // --- the touch gesture ------------------------------------------------

  // Watched, not driven. The browser scrolls the rail, carries its own momentum
  // and picks the card to snap to; this notes that a finger is down so the
  // recycle, the read mark and the drift keep out of the way, and it hands snap
  // back at the one moment that makes the fling behave.
  let touching = false;
  let touchFrom = 0;      // scroll position at touchstart
  let touchMoved = false;

  track.addEventListener('touchstart', () => {
    // A finger arriving mid-landing takes it over.
    if (landing) finishLanding();
    touching = true;
    touchMoved = false;
    touchFrom = track.scrollLeft;
    moveX = prevX = 0; moveT = prevT = 0;
    // Off only while the rail is still. Restoring mandatory snap to a rail that
    // has stopped between two cards — which is where the drift leaves it —
    // jumps to the nearest one under the finger.
    track.classList.add('is-dragging');
    driftStop(true, false);
    hush();
    pauseAll(true);
  }, { passive: true });

  // Two samples, which is all that is needed to tell a flick from a slow drag.
  // The full velocity sampling this replaced ran on every scroll event of a
  // gesture and fed arithmetic that decided where to land; this only answers
  // one yes-or-no question at the end.
  let moveX = 0, moveT = 0, prevX = 0, prevT = 0;

  function moveSpeed() {
    const dt = moveT - prevT;
    return dt > 0 ? (moveX - prevX) / dt : 0;
  }

  track.addEventListener('touchmove', (event) => {
    const touch = event.touches && event.touches[0];
    if (touch) {
      prevX = moveX; prevT = moveT;
      moveX = touch.clientX; moveT = event.timeStamp;
    }
    if (!touching || touchMoved) return;
    touchMoved = true;
    // And back on at the first movement, which is the whole trick. Snap applies
    // at the end of a scroll rather than during one, so with the scroll live
    // this yanks nothing — and the fling the browser is about to plan is
    // planned with snap and scroll-snap-stop in hand, which is what makes it
    // stop at the next card instead of running through several.
    track.classList.remove('is-dragging');
  }, { passive: true });

  function endTouch() {
    if (!touching) return;
    touching = false;
    // Before the landing, which would defer these again for as long as it runs.
    drainWork();

    // A press that never moved. Snap is still held off, and giving it back to a
    // rail standing between two cards is the yank the class exists to prevent,
    // so this walks it onto one instead.
    if (!touchMoved) {
      track.classList.remove('is-dragging');
      landWalked(snapPos(track.scrollLeft));
      return;
    }

    const w = step();
    if (w <= 0) { landing = true; finishLanding(); return; }

    // Measured at touchend, before momentum has added anything: what the finger
    // asked for, and how fast it was going when it stopped asking.
    const covered = (track.scrollLeft - touchFrom) / w;
    const flick = Math.abs(moveSpeed()) > FLICK_SPEED;

    if (flick) {
      // Hands off entirely. The fling was planned with snap in hand — see the
      // touchmove handler — so it stops at the next card on its own, and a
      // scroll written from here would only fight it.
      landFlung();
      return;
    }

    // Slow enough that there is no fling to fight. Snap on its own would return
    // a short drag to the card it started on, which is right for a stray touch
    // and wrong for the deliberate short drag this rail is mostly used with.
    let cards = 0;
    if (Math.abs(covered) >= SNAP_FRACTION) {
      cards = Math.sign(covered) * Math.max(1, Math.round(Math.abs(covered)));
    }
    landWalked(snapPos(touchFrom) + cards * w);
  }

  track.addEventListener('touchend', endTouch, { passive: true });
  track.addEventListener('touchcancel', endTouch, { passive: true });

  // Armed only where a click is actually coming, and it expires either way. A
  // swallower left waiting after a cancelled gesture does not sit harmlessly:
  // it eats whatever the next tap on a card was meant to do, which is a bug
  // that surfaces one gesture later than the one that caused it.
  function swallowNextClick() {
    const eat = (click) => {
      click.preventDefault();
      click.stopPropagation();
    };
    track.addEventListener('click', eat, { capture: true, once: true });
    setTimeout(() => track.removeEventListener('click', eat, { capture: true }), 400);
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
      tellTheme(frame);
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
    pointer: 'Hover a card to run it in place, take a quick look at its '
      + 'variants, or open the study for the decisions and techniques '
      + 'behind it.',
    touch: 'Tap quick look to run a card and step through its variants, or '
      + 'open the study for the decisions and techniques behind it.'
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
      // Through the same bookkeeping handoff() keeps, or it would think the
      // card it last set playing still is.
      told = -1;
      handoff();
    });
  }

  renderLedeHint(null);
  order();
  buildFilter();   // after order(), so the chips count a settled rail
  renderFootTypes();
  number();

  // After order(), which is the last thing that touches the DOM order the ring
  // is built from. The first recycle puts a card's worth of row to the left of
  // the newest study, which is where the rail rests.
  rebuildRing();
  sync();

  window.addEventListener('resize', () => {
    // A window narrowed back into a row it can loop sets the rail going again,
    // unless the reader had already stopped it.
    if (!taken && drift === 'off' && driftsUnasked()) driftRun();
    syncDriftBtn();
  });
  syncDriftBtn();
  // Late enough that the previews have landed: a rail that starts moving under
  // five loading skeletons advertises the wait rather than the work.
  setTimeout(() => { if (driftsUnasked()) driftRun(); }, DRIFT_DELAY);
})();
