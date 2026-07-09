/* FieldRoute — interactions
   IntersectionObserver reveals, count-ups, self-drawing route line,
   factor bars, match ring, mini-bars. All motion-safe. */
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

  /* ---- Self-drawing route line ---- */
  function drawRoute(scope) {
    var lines = scope.querySelectorAll('.route-line');
    if (!lines.length) return;
    lines.forEach(function (line, idx) {
      var len = line.getTotalLength();
      if (reduceMotion) { line.style.strokeDashoffset = '0'; return; }
      var isRemain = line.classList.contains('remain');
      if (isRemain) {
        // remaining path keeps its dashed look; just fade it in
        line.style.opacity = '0';
        line.getBoundingClientRect();
        line.style.transition = 'opacity 0.6s ease 1.4s';
        line.style.opacity = '0.85';
        return;
      }
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.getBoundingClientRect();
      line.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.22,0.61,0.36,1) ' + (idx * 0.15) + 's';
      line.style.strokeDashoffset = '0';
    });
  }

  /* ---- Generic reveal observer ---- */
  var revObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revObserver.observe(el); });

  /* ---- One-shot activators (count, bars, ring, route) ---- */
  var activators = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.hasAttribute('data-count')) countUp(el);
      if (el.classList.contains('factor-bar')) {
        var i = el.querySelector('i'); if (i) i.style.width = el.getAttribute('data-pct') + '%';
      }
      if (el.classList.contains('ring-fill')) { el.style.strokeDasharray = el.getAttribute('data-dash') + ' 999'; }
      if (el.classList.contains('mini-bar')) {
        var mi = el.querySelector('i'); if (mi) mi.style.width = el.getAttribute('data-pct') + '%';
      }
      if (el.classList.contains('viz-map')) drawRoute(el);
      activators.unobserve(el);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('[data-count], .factor-bar, .ring-fill, .mini-bar, .viz-map')
    .forEach(function (el) { activators.observe(el); });

  /* ---- Hero route draws on load (above the fold) ---- */
  var heroMap = document.querySelector('.hero .viz-map');
  if (heroMap) {
    window.addEventListener('load', function () { setTimeout(function () { drawRoute(heroMap); }, 300); });
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
