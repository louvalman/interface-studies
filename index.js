// Landing page chrome: the reference rail and the quick-look overlay.
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
//   parent -> preview   { source: 'ui-reference-base', type: 'preview',
//                         active: true | false }
//   parent -> preview   { source: 'ui-reference-base', type: 'preview:variant',
//                         index: n }
//   preview -> parent   { source: 'ui-reference-base', type: 'preview:ready',
//                         variants?: [{ id, label }] }
//
// A preview that ignores all of it still renders correctly; it just doesn't
// move, and quick look shows it without dots.

// --- language ------------------------------------------------------------
//
// Site chrome only. A reference's demo page is its own document and keeps its
// own copy; the strings inside a preview belong to that folder, so the variant
// labels quick look shows stay in whatever language the preview reports them.

(function () {
  const STORE_KEY = 'ui-reference-base:lang';

  const COPY = {
    da: {
      'head.title': 'Interfacedetaljer, bygget som genbrugelige dele.',
      'head.lede': 'Komponenter bygget i ren HTML og CSS, uden binding til '
        + 'noget framework — gemt så typografien, spatieringen og bevægelsen '
        + 'overlever at blive løftet ind i et.',
      'head.ledeHint': 'Hold musen over et kort for at afspille det, eller åbn '
        + 'det i fuld størrelse.',
      'head.ledeHintTouch': 'Tryk på hurtigt kig for at afspille et kort, eller '
        + 'åbn det i fuld størrelse.',
      'meta.references': 'Referencer',
      'meta.portable': 'Portabel',
      'meta.anyStack': 'Enhver stak',
      'meta.eachRef': 'Hver reference',
      'meta.standsAlone': 'Står alene',
      'rail.reference': 'Reference',
      'rail.hint': 'Hold musen over for at afspille · træk for at rulle · ← →',
      'rail.hintTouch': 'Stryg for at rulle · tryk på hurtigt kig',
      'type.card': 'Kort',
      'type.aesthetic': 'Æstetik',
      'type.navigation': 'Navigation',
      'piece.liquidGlassToolbar.title': 'Værktøjslinje i flydende glas',
      'piece.liquidGlassToolbar.note': 'Én glasflade der skifter form — det '
        + 'valgte punkt folder sig ud til en pille med etiket, søgning til et '
        + 'felt, aktivitet til et panel — i fem materialer fra én opskrift.',
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
      'foot.blurb': 'Hver reference er selvstændig. Kopiér en mappe ud, og den '
        + 'virker uden noget andet herfra — intet delt stylesheet, intet '
        + 'byggetrin, ingen afhængighed af denne side.',
      'foot.sources': 'Nogle referencer tager udgangspunkt i en grænseflade '
        + 'fundet andre steder; ingen er en kopi af en. Hver mappes notes.md '
        + 'nævner sin kilde og de beslutninger, den holder fast i.',
      'foot.typefaces': 'Skrifttyper',
      'foot.stack': 'Teknologi',
      'foot.stackVal': 'HTML og CSS, intet byggetrin',
      'foot.references': 'Referencer',
      'foot.builtBy': 'Bygget af',
      'foot.backToTop': 'Til toppen',
      'a11y.elsewhere': 'Andre steder',
      'a11y.carousel': 'Karrusel',
      'a11y.previous': 'Forrige',
      'a11y.next': 'Næste',
      'a11y.railRegion': 'Referencekarrusel',
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

    // The rail's hint is written by index.js, not by the markup, so it is
    // handed the table rather than reading a data-i18n key.
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
  // copy like the rail hint misses the restore and stays English.
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

  const CHANNEL = 'ui-reference-base';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(hover: none)');

  const prev = document.querySelector('[data-rail-prev]');
  const next = document.querySelector('[data-rail-next]');
  const progress = document.querySelector('[data-rail-progress]');
  const indexOut = document.getElementById('rail-index');
  const totalOut = document.getElementById('rail-total');
  const metaCount = document.getElementById('meta-count');
  const footCount = document.getElementById('foot-count');
  const hint = document.querySelector('[data-rail-hint]');
  const ledeHint = document.querySelector('[data-lede-hint]');

  const pieces = () => Array.from(track.children);
  const real = () => pieces().filter((el) => el.matches('[data-piece]'));

  const pad = (n) => String(n).padStart(2, '0');

  // Order is derived from each card's own date rather than from where its block
  // sits in the file. A date is a fact about the reference and does not change
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
    const src = frame ? frame.getAttribute('src') || '' : '';
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
  // something the DOM order already says, and every reference added above an
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
    markReady(piece);
  });

  function markReady(piece) {
    if (piece.classList.contains('is-ready')) return;
    piece.classList.add('is-ready');
    if (piece.dataset.active === 'true') tell(piece, true);
  }

  // Readiness has to survive a missed event. This script runs after the
  // iframes in document order, so a preview that loaded fast has already
  // fired 'load' with nothing listening — and over file:// its readyState is
  // unreadable behind an opaque origin. Hence three routes and a backstop:
  // whatever happens, the skeleton lifts.
  real().forEach((piece) => {
    const frame = piece.querySelector('[data-preview]');
    if (!frame) { markReady(piece); return; }

    frame.addEventListener('load', () => markReady(piece));

    try {
      const doc = frame.contentDocument;
      if (doc && doc.readyState === 'complete') markReady(piece);
    } catch (err) {
      /* opaque origin — fall through to the backstop */
    }

    setTimeout(() => markReady(piece), 2000);
  });

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

  // --- rail -------------------------------------------------------------

  // One card plus the flex gap — the distance a single step should cover.
  function step() {
    const first = pieces()[0];
    if (!first) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function maxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
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
    const ratio = max > 0 ? track.scrollLeft / max : 1;

    if (progress) {
      // With nothing to scroll, a full bar just reads as a heavy divider.
      progress.hidden = max <= 0;
      progress.style.setProperty('--rail-progress', (ratio * 100).toFixed(2) + '%');
    }

    const count = real().length;
    if (totalOut) totalOut.textContent = pad(count);
    if (metaCount) metaCount.textContent = pad(count);
    if (footCount) footCount.textContent = pad(count);

    const active = activeIndex();
    markActive(active);
    if (indexOut) indexOut.textContent = pad(Math.min(count, active + 1));

    // 1px of slack so a fractional scrollLeft doesn't leave a button live.
    if (prev) prev.disabled = track.scrollLeft <= 1;
    if (next) next.disabled = track.scrollLeft >= max - 1;
  }

  function scrollBy(direction) {
    track.scrollBy({
      left: direction * step(),
      behavior: reduced.matches ? 'auto' : 'smooth'
    });
  }

  function scrollToEdge(end) {
    track.scrollTo({
      left: end ? maxScroll() : 0,
      behavior: reduced.matches ? 'auto' : 'smooth'
    });
  }

  if (prev) prev.addEventListener('click', () => scrollBy(-1));
  if (next) next.addEventListener('click', () => scrollBy(1));

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); scrollBy(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); scrollBy(-1); }
    if (event.key === 'Home') { event.preventDefault(); scrollToEdge(false); }
    if (event.key === 'End') { event.preventDefault(); scrollToEdge(true); }
  });

  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);

  // --- drag to scroll ---------------------------------------------------

  // Mouse only. A touch pointer already scrolls the track natively, and
  // driving scrollLeft underneath that gesture fought the browser's own
  // momentum. Worse, a swipe ends in `pointercancel` with no click behind it,
  // so the one-shot click swallower below stayed armed and ate the user's
  // next tap on a card.
  const DRAG_SLOP = 4;   // below this it is a click, not a drag
  let dragging = false;
  let moved = false;
  let originX = 0;
  let originScroll = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (event.pointerType !== 'mouse') return;
    dragging = true;
    moved = false;
    originX = event.clientX;
    originScroll = track.scrollLeft;
    // Capture is taken only once a drag is real. Taking it here would
    // retarget the click, and the quick-look button would stop firing.
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = event.clientX - originX;
    if (!moved && Math.abs(delta) > DRAG_SLOP) {
      moved = true;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    }
    if (moved) track.scrollLeft = originScroll - delta;
  });

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    // Swallow the click the drag would otherwise fire on a card link.
    if (moved) {
      track.addEventListener('click', (click) => {
        click.preventDefault();
        click.stopPropagation();
      }, { capture: true, once: true });
      // Re-snap to whatever ended up in the read position.
      const target = real()[activeIndex()];
      if (target) {
        track.scrollTo({
          left: target.offsetLeft - (parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0),
          behavior: reduced.matches ? 'auto' : 'smooth'
        });
      }
    }
    moved = false;
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
      }
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
      buildDots(data.variants);
      playForTouch();
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
      frame.src = preview.getAttribute('src');

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

  const HINT_EN = {
    pointer: 'Hover to play · drag to scroll · ← →',
    touch: 'Swipe to scroll · tap quick look'
  };

  const LEDE_EN = {
    pointer: 'Hover a card to run it in place, or open one at full size.',
    touch: 'Tap quick look to run a card in place, or open one at full size.'
  };

  // Held so a pointer-type change can re-render without waiting for the next
  // language switch.
  let hintCopy = null;

  function renderHint(copy) {
    hintCopy = copy;
    const touch = coarse.matches;

    if (hint) {
      const key = touch ? 'rail.hintTouch' : 'rail.hint';
      hint.textContent = (copy && copy[key]) || (touch ? HINT_EN.touch : HINT_EN.pointer);
    }

    // The lede's closing sentence, for the same reason: there is nothing to
    // hover on a phone, and the card's own affordance is the quick-look
    // button rather than the pointer.
    if (ledeHint) {
      const key = touch ? 'head.ledeHintTouch' : 'head.ledeHint';
      ledeHint.textContent =
        (copy && copy[key]) || (touch ? LEDE_EN.touch : LEDE_EN.pointer);
    }
  }

  document.addEventListener('lang:change', (event) => renderHint(event.detail.copy));

  // A tablet gains a trackpad, or a laptop's touchscreen takes over: the hint
  // and which preview plays both hang off this, so neither can be decided
  // once at load.
  if (coarse.addEventListener) {
    coarse.addEventListener('change', () => {
      renderHint(hintCopy);
      const list = real();
      list.forEach((piece) => tell(piece, false));
      if (coarse.matches && list[currentActive]) tell(list[currentActive], true);
    });
  }

  renderHint(null);
  order();
  number();
  sync();
})();
