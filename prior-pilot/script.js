/* PriorPilot — interactions
   IntersectionObserver reveals, count-ups, gauge/ring/bar activators.
   All motion-safe: with reduced motion we render the final state. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Count-up helper ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var dur = 1400;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
  }

  /* ---- Arc / ring fill helper ---- */
  function fillDash(el) {
    var dash = el.getAttribute('data-dash');
    if (reduceMotion) { el.style.transition = 'none'; }
    el.style.strokeDasharray = dash + ' 999';
  }

  /* ---- Generic reveal observer ---- */
  var revObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revObserver.observe(el); });

  /* ---- One-shot activators (count, bars, gauge, ring) ---- */
  var activators = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.hasAttribute('data-count')) countUp(el);
      if (el.classList.contains('driver-bar')) {
        var pct = el.getAttribute('data-pct');
        var i = el.querySelector('i');
        if (i) i.style.width = pct + '%';
      }
      if (el.classList.contains('mini-bar')) {
        var mp = el.getAttribute('data-pct');
        var mi = el.querySelector('i');
        if (mi) mi.style.width = mp + '%';
      }
      if (el.classList.contains('ring-fill') || el.classList.contains('gauge-fill')) fillDash(el);
      activators.unobserve(el);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('[data-count], .driver-bar, .mini-bar, .ring-fill, .gauge-fill')
    .forEach(function (el) { activators.observe(el); });

  /* ---- Hero gauge fills on load (above the fold) ---- */
  var heroGauge = document.querySelector('.hero .gauge-fill');
  if (heroGauge) {
    window.addEventListener('load', function () { setTimeout(function () { fillDash(heroGauge); }, 300); });
  }

  /* ---- Contact form: gentle "Sending…" (never preventDefault) ---- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; btn.style.opacity = '0.8'; }
    });
  }

  /* ---- Current year ---- */
  document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
