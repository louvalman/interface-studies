// Carousel for the reference rail: arrow buttons, keyboard stepping, and a
// scroll-position bar. Scrolling itself is native — CSS scroll-snap does the
// snapping, this only nudges scrollLeft and keeps the chrome in sync.

(function () {
  const track = document.querySelector('[data-rail-track]');
  if (!track) return;

  const prev = document.querySelector('[data-rail-prev]');
  const next = document.querySelector('[data-rail-next]');
  const progress = document.querySelector('[data-rail-progress]');
  const indexOut = document.getElementById('rail-index');
  const totalOut = document.getElementById('rail-total');
  const metaCount = document.getElementById('meta-count');

  const pieces = () => Array.from(track.children);
  const real = () => pieces().filter((el) => !el.classList.contains('piece--ghost'));

  const pad = (n) => String(n).padStart(2, '0');

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
    if (indexOut) {
      const current = max > 0 ? Math.round(track.scrollLeft / step()) : 0;
      indexOut.textContent = pad(Math.min(count, current + 1));
    }

    // 1px of slack so a fractional scrollLeft doesn't leave a button live.
    if (prev) prev.disabled = track.scrollLeft <= 1;
    if (next) next.disabled = track.scrollLeft >= max - 1;
  }

  function scrollBy(direction) {
    track.scrollBy({ left: direction * step(), behavior: 'smooth' });
  }

  if (prev) prev.addEventListener('click', () => scrollBy(-1));
  if (next) next.addEventListener('click', () => scrollBy(1));

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); scrollBy(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); scrollBy(-1); }
  });

  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
