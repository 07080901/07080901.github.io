/* Site behaviour — no dependencies.
   intro · header · mobile menu · one-page scrolling with real URLs
   · lazy YouTube · release play buttons · scroll reveal · mailing-list placeholder */
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

  /* ---------- Header: solid on scroll · remembers scroll direction ---------- */
  // html.scroll-up mirrors the menu underline (it grows right to left when going up)
  var header = $('#site-header');
  var lastY = window.scrollY;
  var setUp = function (up) { root.classList.toggle('scroll-up', up); };
  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (y !== lastY) { setUp(y < lastY); lastY = y; }
  };
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
      setUp(el.getBoundingClientRect().top < 0);
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
      if (el) { current = location.pathname; locked = true; clearTimeout(unlockTimer);
        setUp(el.getBoundingClientRect().top < 0); mark(el); jump(el, true);
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

    /* Section magnet: scroll freely; once you've scrolled about 3 wheel steps
       into the next (or previous) section and pause, the page glides the rest
       of the way to its start. Any wheel / touch / key during the glide hands
       control straight back. Long sections can still be read freely. */
    if (!reduced) {
      var STEP = 100;          // ≈ one mouse-wheel notch, in px
      var PULL = 3 * STEP;     // how far into the next section before it pulls
      var IDLE_MS = 180;       // pause that counts as "stopped scrolling"
      var restY = window.scrollY, intent = false, pressed = false, gliding = false, idleTimer, raf;

      var points = function () {   // scroll positions where each section starts
        var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        return sections.map(function (s) {
          var y = s.id === 'home' ? 0 : s.getBoundingClientRect().top + window.scrollY - pad;
          return Math.max(0, Math.min(max, Math.round(y)));
        });
      };
      var stopGlide = function () {
        if (!gliding) return;
        gliding = false; cancelAnimationFrame(raf); root.style.scrollBehavior = '';
        restY = window.scrollY;
      };
      var glide = function (to) {
        var from = window.scrollY, dist = to - from, t0 = null;
        if (Math.abs(dist) < 3) return;
        var dur = Math.min(950, 420 + Math.abs(dist) * .5);
        gliding = true; root.style.scrollBehavior = 'auto';   // CSS smooth-scroll would fight the frames
        var frame = function (now) {
          if (!gliding) return;
          if (t0 === null) t0 = now;
          var t = Math.min(1, (now - t0) / dur);
          window.scrollTo(0, from + dist * (1 - Math.cos(Math.PI * t)) / 2);   // soft start, soft landing
          if (t < 1) raf = requestAnimationFrame(frame); else stopGlide();
        };
        raf = requestAnimationFrame(frame);
      };
      var settle = function () {
        var y = window.scrollY, moved = y - restY;
        if (locked || pressed || !intent || Math.abs(moved) < 10) { restY = y; intent = false; return; }
        intent = false;
        var p = points(), vh = window.innerHeight;
        var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
        var next = p.filter(function (v) { return v > y + 2; })[0];        // start of the section below
        var prev = p.filter(function (v) { return v < y - 2; }).pop();      // start of the section we're in
        var target = null;
        if (moved > 0) {
          // going down: the next section has risen ~3 steps above the bottom edge
          if (next !== undefined && next - y <= vh - pad - PULL) target = next;
        } else if (prev !== undefined) {
          // going up: we're near the start of this section, or ~3 steps into a short one from below
          var nearStart = y - prev <= PULL;
          var fromBelow = next === undefined || next - y >= PULL;
          if (nearStart || (fromBelow && y - prev <= vh * 1.2)) target = prev;
        }
        restY = y;
        if (target !== null) glide(target);
      };

      window.addEventListener('scroll', function () {
        if (gliding) return;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(settle, IDLE_MS);
      }, { passive: true });
      var takeOver = function () { intent = true; stopGlide(); };
      window.addEventListener('wheel', takeOver, { passive: true });
      window.addEventListener('touchstart', takeOver, { passive: true });
      window.addEventListener('keydown', takeOver);
      window.addEventListener('mousedown', function () { pressed = true; intent = true; stopGlide(); });   // scrollbar drag
      window.addEventListener('mouseup', function () {
        pressed = false;
        clearTimeout(idleTimer); idleTimer = setTimeout(settle, IDLE_MS);
      });
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

  /* ---------- Release page: sticky bar gets its glass once content slides under it,
                and shows the title once the big one has scrolled away ---------- */
  var relBar = $('#rel-bar'), relTitle = $('.rel__title');
  if (relBar && relTitle) {
    var barTick = false;
    var updateBar = function () {
      barTick = false;
      var bar = relBar.getBoundingClientRect();
      relBar.classList.toggle('is-stuck', window.scrollY > 4);
      relBar.classList.toggle('has-title', relTitle.getBoundingClientRect().bottom < bar.bottom);
    };
    window.addEventListener('scroll', function () { if (!barTick) { barTick = true; requestAnimationFrame(updateBar); } }, { passive: true });
    updateBar();
  }

  /* ---------- Release page: every play button glides down to the streaming links ---------- */
  var listen = $('#listen');
  if (listen) {
    $$('a[data-listen]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        listen.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        listen.classList.remove('is-flash'); void listen.offsetWidth; listen.classList.add('is-flash');
      });
    });
  }

  /* ---------- Mailing list placeholder: no provider set yet, the button does nothing ---------- */
  $$('form[data-soon]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  /* ---------- Scroll reveal: items come in top to bottom, one after another ---------- */
  var STAGGER = 65, MAX_WAIT = 450;   // ms between items · longest an item waits its turn
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var nextAt = 0;
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; }).map(function (en) { return en.target; });
      batch.sort(function (a, b) {
        var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return (ra.top - rb.top) || (ra.left - rb.left);
      });
      var now = performance.now();
      batch.forEach(function (el) {
        var at = Math.max(now, nextAt), wait = Math.min(at - now, MAX_WAIT);
        nextAt = now + wait + STAGGER;
        el.style.setProperty('--d', Math.round(wait) + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
