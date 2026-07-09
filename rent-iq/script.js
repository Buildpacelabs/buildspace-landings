/* RentIQ — interactions
   IntersectionObserver reveals, count-ups, self-drawing demand curve,
   driver bars, attribution ring. All motion-safe. */
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
    function format(v) {
      return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    if (reduceMotion) { el.textContent = format(target); return; }
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = format(target);
    }
    requestAnimationFrame(frame);
  }

  /* ---- Self-drawing demand curve ---- */
  function drawCurve(scope) {
    var line = scope.querySelector('.curve-line');
    var area = scope.querySelector('.curve-area');
    var rec = scope.querySelector('.curve-rec');
    if (!line) return;
    if (reduceMotion) {
      line.style.strokeDasharray = 'none';
      if (area) area.style.opacity = '1';
      if (rec) rec.style.opacity = '1';
      return;
    }
    var len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.getBoundingClientRect();
    line.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.22,0.61,0.36,1)';
    line.style.strokeDashoffset = '0';
    if (area) { area.style.transition = 'opacity 1.4s ease 0.5s'; area.style.opacity = '1'; }
    if (rec) { rec.style.transition = 'opacity 0.5s ease 1.4s'; rec.style.opacity = '1'; }
  }

  /* ---- Generic reveal observer ---- */
  var revObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revObserver.observe(el); });

  /* ---- One-shot activators (count, bars, ring, curve, viz-drivers) ---- */
  var activators = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.hasAttribute('data-count')) countUp(el);
      if (el.classList.contains('driver-bar')) {
        var i = el.querySelector('i'); if (i) i.style.width = el.getAttribute('data-pct') + '%';
      }
      if (el.classList.contains('ring-fill')) {
        el.style.strokeDasharray = el.getAttribute('data-dash') + ' 999';
      }
      if (el.classList.contains('mini-bar')) {
        var mi = el.querySelector('i'); if (mi) mi.style.width = el.getAttribute('data-pct') + '%';
      }
      if (el.classList.contains('viz-drivers')) {
        el.querySelectorAll('.db i').forEach(function (bar) { bar.style.width = (bar.getAttribute('data-w') || 0) + '%'; });
      }
      if (el.classList.contains('viz-curve')) drawCurve(el);
      activators.unobserve(el);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('[data-count], .driver-bar, .ring-fill, .mini-bar, .viz-drivers, .viz-curve')
    .forEach(function (el) { activators.observe(el); });

  /* ---- Hero visual draws on load (above the fold) ---- */
  var heroCurve = document.querySelector('.hero .viz-curve');
  var heroDrivers = document.querySelector('.hero .viz-drivers');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (heroCurve) drawCurve(heroCurve);
      if (heroDrivers) heroDrivers.querySelectorAll('.db i').forEach(function (bar) { bar.style.width = (bar.getAttribute('data-w') || 0) + '%'; });
    }, 300);
  });

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
