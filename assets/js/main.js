/* Site behaviour — no dependencies.
   intro · header · mobile menu · one-page scrolling with real URLs
   · lazy YouTube · scroll reveal · mailing-list placeholder */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro: one quick pencil pass, then fade ---------- */
  var DRAW_MS = 1300;   // drawing time
  var HOLD_MS = 200;    // pause on the finished logo
  var intro = $('#intro');

  function finishIntro() {
    if (!intro || intro.classList.contains('is-gone')) return;
    intro.classList.add('is-gone');
    root.classList.add('intro-done');
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
  }

  if (intro && root.classList.contains('intro-play')) {
    var paths = $$('.intro__strokes path', intro);
    var lens = paths.map(function (p) { var l = p.getTotalLength(); p.style.setProperty('--len', l); p.style.strokeDashoffset = l; return l; });
    var total = lens.reduce(function (a, b) { return a + b; }, 0);
    var start = null, done = false, fading = false;
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

    var fade = function () {
      if (fading) return; fading = true;
      intro.classList.add('is-fading');
      setTimeout(finishIntro, 550);
    };
    var complete = function () { done = true; paths.forEach(function (p) { p.style.strokeDashoffset = 0; }); };
    var frame = function (now) {
      if (done) return;
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / DRAW_MS), drawn = easeOut(t) * total, acc = 0;
      for (var i = 0; i < paths.length; i++) {
        paths[i].style.strokeDashoffset = lens[i] - Math.max(0, Math.min(lens[i], drawn - acc));
        acc += lens[i];
      }
      if (t < 1) requestAnimationFrame(frame);
      else { complete(); setTimeout(fade, HOLD_MS); }
    };
    var img = new Image();
    img.onload = img.onerror = function () { requestAnimationFrame(frame); };
    img.src = $('image', intro).getAttribute('href');

    var skip = function () { complete(); fade(); };
    intro.addEventListener('click', skip);
    document.addEventListener('keydown', function onKey() { skip(); document.removeEventListener('keydown', onKey); });
    setTimeout(finishIntro, 6000); // safety net
  } else {
    root.classList.add('intro-done');
  }

  /* ---------- Header: solid on scroll ---------- */
  var header = $('#site-header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var toggle = $('.menu-toggle'), drawer = $('#drawer');
  var setDrawer = function (open) {
    if (!toggle || !drawer) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { drawer.hidden = false; requestAnimationFrame(function () { drawer.classList.add('is-open'); }); document.body.style.overflow = 'hidden'; }
    else { drawer.classList.remove('is-open'); setTimeout(function () { drawer.hidden = true; }, 350); document.body.style.overflow = ''; }
  };
  if (toggle) toggle.addEventListener('click', function () { setDrawer(toggle.getAttribute('aria-expanded') !== 'true'); });

  /* ---------- One page: menu clicks scroll, URL follows the scroll ---------- */
  var onepage = $('.onepage');
  if (onepage) {
    var sections = $$('[data-url]', onepage);
    var byName = {};
    sections.forEach(function (s) { byName[s.id] = s; });
    var navLinks = $$('.nav__link[data-path]');
    var current = location.pathname;
    var locked = false, unlockTimer;

    var mark = function (el) {
      if (el.dataset.title) document.title = el.dataset.title;
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.dataset.path === el.dataset.url); });
    };
    var jump = function (el, smooth) {
      var behavior = smooth && !reduced ? 'smooth' : 'auto';
      if (el.id === 'home') window.scrollTo({ top: 0, behavior: behavior });
      else el.scrollIntoView({ behavior: behavior, block: 'start' });
    };
    var go = function (el, push) {
      locked = true; clearTimeout(unlockTimer);
      if (el.dataset.url !== current) {
        current = el.dataset.url;
        history[push ? 'pushState' : 'replaceState']({ section: el.id }, '', current);
      }
      mark(el); jump(el, true);
      unlockTimer = setTimeout(function () { locked = false; }, 1100);
    };

    // open /music/, /live/ … already scrolled to their section
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var startEl = byName[onepage.dataset.start];
    if (startEl && startEl.id !== 'home') requestAnimationFrame(function () { jump(startEl, false); });

    // menu, logo, hero button, scroll cue
    $$('a[data-section]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var el = byName[a.dataset.section];
        if (!el || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        setDrawer(false);
        go(el, true);
      });
    });
    // browser back / forward
    window.addEventListener('popstate', function () {
      var el = sections.filter(function (s) { return s.dataset.url === location.pathname; })[0];
      if (el) { current = location.pathname; locked = true; clearTimeout(unlockTimer); mark(el); jump(el, true);
        unlockTimer = setTimeout(function () { locked = false; }, 1100); }
    });
    // while scrolling, the section crossing the middle of the screen owns the URL
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        if (locked) return;
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          if (el.dataset.url === current) return;
          current = el.dataset.url;
          history.replaceState({ section: el.id }, '', current);
          mark(el);
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------- Lazy YouTube ---------- */
  $$('[data-youtube]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.youtube; if (!id) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });

  /* ---------- Mailing list placeholder (no provider set yet) ---------- */
  $$('form[data-soon]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); $('.mailing__note', f).hidden = false; });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
