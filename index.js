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
      'head.lede': 'Komponenter bygget i ren HTML og CSS — nogle videreudviklet '
        + 'ud fra grænseflader fundet andre steder, nogle fra originale designs — gemt '
        + 'så typografien, spatieringen og bevægelsen forbliver genbrugelig. '
        + 'Hold musen over et kort for at afspille det, eller åbn det i fuld størrelse.',
      'meta.references': 'Referencer',
      'meta.builtWith': 'Bygget med',
      'meta.htmlCss': 'HTML & CSS',
      'meta.sharedCode': 'Delt kode',
      'meta.none': 'Ingen',
      'rail.reference': 'Reference',
      'rail.hint': 'Hold musen over for at afspille · træk for at rulle · ← →',
      'rail.hintTouch': 'Stryg for at rulle · tryk på hurtigt kig',
      'type.card': 'Kort',
      'type.aesthetic': 'Æstetik',
      'piece.gradientShapes.title': 'Gradientformer',
      'piece.gradientShapes.note': 'Én gradientopskrift — to radiale puljer over '
        + 'en lodret udtoning — projiceret på fliser, cirkler, buer og piller. '
        + 'Form og tema er adskilte akser, så enhver farve kan kombineres med '
        + 'enhver form.',
      'cta.quickLookGradients': 'Hurtigt kig: Gradientformer',
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
      'foot.typefaces': 'Skrifttyper',
      'foot.stack': 'Teknologi',
      'foot.stackVal': 'HTML og CSS, intet byggetrin',
      'foot.shared': 'Delt kode',
      'foot.sharedVal': 'Ingen — hver mappe står alene',
      'foot.references': 'Referencer',
      'foot.line': 'Bygget i hånden · 2026',
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

  const pieces = () => Array.from(track.children);
  const real = () => pieces().filter((el) => el.matches('[data-piece]'));

  const pad = (n) => String(n).padStart(2, '0');

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

  const DRAG_SLOP = 4;   // below this it is a click, not a drag
  let dragging = false;
  let moved = false;
  let originX = 0;
  let originScroll = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
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

    let restoreFocus = null;
    let closeTimer = null;
    let currentPiece = null;
    let variants = [];
    let variantIndex = 0;
    let marker = null;
    let dotEls = [];
    let autoplayTimer = null;
    let paused = false;

    const text = (el) => (el ? el.textContent.trim() : '');

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

      const scale = Math.min(
        stage.clientWidth / previewW,
        stage.clientHeight / previewH,
        1
      );

      box.style.setProperty('--lightbox-scale', Math.max(0, scale).toFixed(4));
    }

    // Parks the marker on a dot. `ms` is how long the trip takes: the full
    // autoplay interval when it is counting down to the next swap, a short
    // nudge when someone picked a dot themselves.
    function moveMarker(i, ms) {
      const dot = dotEls[i];
      if (!marker || !dot) return;
      marker.style.transitionDuration = (reduced.matches ? 0 : ms) + 'ms';
      marker.style.setProperty('--marker-x', (dot.offsetLeft + dot.offsetWidth / 2) + 'px');
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
      document.body.classList.add('is-locked');
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
        frame.src = 'about:blank';   // stop the preview rather than hide it
        document.body.classList.remove('is-locked');
        if (restoreFocus && document.contains(restoreFocus)) restoreFocus.focus();
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

  function renderHint(copy) {
    if (!hint) return;
    const touch = coarse.matches;
    const key = touch ? 'rail.hintTouch' : 'rail.hint';
    hint.textContent = (copy && copy[key]) || (touch ? HINT_EN.touch : HINT_EN.pointer);
  }

  document.addEventListener('lang:change', (event) => renderHint(event.detail.copy));

  renderHint(null);
  sync();
})();
