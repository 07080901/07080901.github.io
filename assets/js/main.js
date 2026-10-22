/* Site behaviour: intro, header, mobile menu, hero slider, carousel,
   lazy YouTube embeds, timeline tabs, scroll reveal. No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro ---------- */
  var intro = $('#intro');
  function finishIntro() {
    if (!intro || intro.classList.contains('is-gone')) return;
    intro.classList.add('is-gone');
    root.classList.add('intro-done');
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    startHero();
  }
  if (intro && root.classList.contains('intro-play')) {
    var go = function () { intro.classList.add('is-go'); };
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1200); })]).then(go);
    intro.addEventListener('animationend', function (e) {
      if (e.target === intro && e.animationName === 'intro-lift') finishIntro();
    });
    var skip = function () { if (intro.classList.contains('is-go')) intro.classList.add('is-skipping'); else { go(); intro.classList.add('is-skipping'); } };
    intro.addEventListener('click', skip);
    document.addEventListener('keydown', function onKey() { skip(); document.removeEventListener('keydown', onKey); });
    setTimeout(finishIntro, 7000); // safety net
  } else {
    root.classList.add('intro-done');
    document.addEventListener('DOMContentLoaded', startHero);
  }

  /* ---------- Header: solid on scroll ---------- */
  var header = $('#site-header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var toggle = $('.menu-toggle'), drawer = $('#drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { drawer.hidden = false; requestAnimationFrame(function () { drawer.classList.add('is-open'); }); document.body.style.overflow = 'hidden'; }
      else { drawer.classList.remove('is-open'); setTimeout(function () { drawer.hidden = true; }, 350); document.body.style.overflow = ''; }
    });
  }

  /* ---------- Hero slider ---------- */
  var heroStarted = false;
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    var hero = $('.hero'); if (!hero) return;
    var slides = $$('.hero__slide', hero), dots = $$('.hero__dot', hero);
    if (slides.length < 2) return;
    var i = 0, ms = 6000, timer;
    hero.style.setProperty('--slide-ms', ms + 'ms');
    function show(n) {
      slides[i].classList.remove('is-active'); if (dots[i]) dots[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      if (dots[i]) { dots[i].classList.remove('is-active'); void dots[i].offsetWidth; dots[i].classList.add('is-active'); }
    }
    function play() { clearInterval(timer); if (!reduced) timer = setInterval(function () { show(i + 1); }, ms); }
    // restart the first dot's progress bar now that the slider is live
    if (dots[0]) { dots[0].classList.remove('is-active'); void dots[0].offsetWidth; dots[0].classList.add('is-active'); }
    dots.forEach(function (d) { d.addEventListener('click', function () { show(+d.dataset.index); play(); }); });
    $$('.hero__arrow', hero).forEach(function (a) { a.addEventListener('click', function () { show(i + +a.dataset.dir); play(); }); });
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { show(i + (dx < 0 ? 1 : -1)); play(); }
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else play(); });
    play();
  }

  /* ---------- Carousels ---------- */
  $$('[data-carousel]').forEach(function (c) {
    var track = $('.carousel__track', c), items = track.children;
    var prev = $('[data-dir="-1"]', c), next = $('[data-dir="1"]', c);
    var cur = $('[data-current]', c), tot = $('[data-total]', c);
    function perView() { return items.length ? Math.max(1, Math.round(track.clientWidth / items[0].getBoundingClientRect().width)) : 1; }
    function pages() { return Math.max(1, Math.ceil(items.length / perView())); }
    function page() { return Math.min(pages(), Math.round(track.scrollLeft / track.clientWidth) + 1); }
    function update() {
      tot.textContent = pages(); cur.textContent = page();
      prev.disabled = track.scrollLeft < 5;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
      c.querySelector('.carousel__nav').style.display = pages() > 1 ? '' : 'none';
    }
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: +b.dataset.dir * track.clientWidth, behavior: 'smooth' }); });
    });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Lazy YouTube ---------- */
  $$('[data-youtube]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.youtube;
      if (!id || id.indexOf('REPLACE') === 0) {
        btn.setAttribute('data-msg', 'Add a YouTube ID in _data/videos.yml');
        btn.classList.add('is-missing'); return;
      }
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });

  /* ---------- Timeline tabs ---------- */
  var tabs = $$('.tl-tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', String(x === t)); });
      $$('.tl-era').forEach(function (e) { e.classList.toggle('is-active', e.id === t.getAttribute('aria-controls')); });
      if (history.replaceState) history.replaceState(null, '', '#' + t.getAttribute('aria-controls'));
    });
  });
  if (location.hash && tabs.length) { var t0 = $('.tl-tab[aria-controls="' + location.hash.slice(1) + '"]'); if (t0) t0.click(); }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
