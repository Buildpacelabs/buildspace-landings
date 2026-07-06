/* AI Lease Management (GroSpace) — landing interactions
   IntersectionObserver reveals · count-ups · signature extraction motif */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Count-up ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce) { el.textContent = String(target); return; }
    var dur = 1400, start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var chatDemo = document.querySelector('.chat-demo');

  if (!('IntersectionObserver' in window) || reduce) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    if (chatDemo) chatDemo.classList.add('in');
    document.querySelectorAll('[data-count]').forEach(countUp);
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        el.querySelectorAll('[data-count]').forEach(countUp);
        if (el.hasAttribute('data-count')) countUp(el);
        obs.unobserve(el);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { io.observe(el); });

    // chart bars + chat
    if (chatDemo) {
      var chatIO = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      chatIO.observe(chatDemo);
    }
  }

  /* ---------- Signature extraction motif ---------- */
  var extract = document.getElementById('extract');
  if (extract && !reduce && 'IntersectionObserver' in window) {
    var exIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        extract.classList.add('run');
        pingClauses();
        obs.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    exIO.observe(extract);
  } else if (extract) {
    extract.classList.add('run');
  }

  // As the scan passes each highlighted clause, flash its outline in sequence.
  function pingClauses() {
    var hots = extract.querySelectorAll('.doc-line.hot');
    hots.forEach(function (line, i) {
      var loop = function () {
        line.classList.add('pinged');
        setTimeout(function () { line.classList.remove('pinged'); }, 900);
      };
      setTimeout(loop, 500 + i * 300);
      setInterval(loop, 3600); // matches the scan keyframe cycle
    });
  }

})();
