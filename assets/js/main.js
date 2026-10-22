/* Site behaviour — no dependencies.
   intro (pencil drawing) · header · mobile menu · home URL sync while scrolling
   · arrow page slides · lazy YouTube · scroll reveal · mailing-list placeholder */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro: write the signature like a pencil ---------- */
  var DRAW_MS = 2600;   // total drawing time
  var HOLD_MS = 550;    // pause on the finished logo before the curtain lifts
  var intro = $('#intro');

  function finishIntro() {
    if (!intro || intro.classList.contains('is-gone')) return;
    intro.classList.add('is-gone');
    root.classList.add('intro-done');
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
  }

  if (intro && root.classList.contains('intro-play')) {
    var paths = $$('.intro__strokes path', intro);
    var tip = $('.intro__tip', intro);
    var lens = paths.map(function (p) { var l = p.getTotalLength(); p.style.setProperty('--len', l); p.style.strokeDashoffset = l; return l; });
    var total = lens.reduce(function (a, b) { return a + b; }, 0);
    var start = null, done = false, lifting = false;

    var lift = function () {
      if (lifting) return; lifting = true;
      intro.classList.remove('is-drawing');
      intro.classList.add('is-lifting');
    };
    var complete = function () {
      paths.forEach(function (p) { p.style.strokeDashoffset = 0; });
      done = true; intro.classList.remove('is-drawing');
    };
    var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
    var frame = function (now) {
      if (done) return;
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / DRAW_MS), drawn = ease(t) * total, acc = 0;
      for (var i = 0; i < paths.length; i++) {
        var l = lens[i], part = Math.max(0, Math.min(l, drawn - acc));
        paths[i].style.strokeDashoffset = l - part;
        if (part > 0 && part < l && tip) {
          var pt = paths[i].getPointAtLength(part);
          tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y);
        }
        acc += l;
      }
      if (t < 1) requestAnimationFrame(frame);
      else { complete(); setTimeout(lift, HOLD_MS); }
    };
    var go = function () { intro.classList.add('is-drawing'); requestAnimationFrame(frame); };
    var img = new Image();
    img.onload = img.onerror = function () { setTimeout(go, 150); };
    img.src = $('image', intro).getAttribute('href');

    intro.addEventListener('animationend', function (e) { if (e.target === intro) finishIntro(); });
    var skip = function () { complete(); lift(); };
    intro.addEventListener('click', skip);
    document.addEventListener('keydown', function onKey() { skip(); document.removeEventListener('keydown', onKey); });
    setTimeout(finishIntro, 9000); // safety net
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
  if (toggle && drawer) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { drawer.hidden = false; requestAnimationFrame(function () { drawer.classList.add('is-open'); }); document.body.style.overflow = 'hidden'; }
      else { drawer.classList.remove('is-open'); setTimeout(function () { drawer.hidden = true; }, 350); document.body.style.overflow = ''; }
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  }

  /* ---------- Arrow links: remember slide direction for the next page ---------- */
  $$('[data-slide]').forEach(function (a) {
    a.addEventListener('click', function () { try { sessionStorage.setItem('slide', a.dataset.slide); } catch (e) {} });
  });

  /* ---------- Home only: change the URL as sections scroll past ---------- */
  var sections = document.body.classList.contains('is-home') ? $$('[data-url]') : [];
  if (sections.length && 'IntersectionObserver' in window && history.replaceState) {
    var navLinks = $$('.nav__link[data-path]');
    var current = location.pathname;
    var setUrl = function (el) {
      var url = el.dataset.url;
      if (url === current) return;
      current = url;
      history.replaceState(history.state, '', url);
      if (el.dataset.title) document.title = el.dataset.title;
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.dataset.path === url); });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setUrl(en.target); });
    }, { rootMargin: '-45% 0px -50% 0px' });   // fires when a section crosses the middle of the screen
    sections.forEach(function (s) { spy.observe(s); });
    // the mailing list + footer keep the last section's URL; back at the top → "/"
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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
