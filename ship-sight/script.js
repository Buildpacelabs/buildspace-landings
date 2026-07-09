/* ShipSight — interactions
   IntersectionObserver reveals, count-ups, self-drawing on-time trend,
   cause meters, ETA-confidence ring. All motion-safe. */
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
  function countUp(el, done) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var dur = 1400;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      if (done) done();
      return;
    }
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else { el.textContent = target.toFixed(decimals); if (done) done(); }
    }
    requestAnimationFrame(frame);
  }

  /* ---- Self-drawing trend line ---- */
  function drawTrend(scope) {
    var line = scope.querySelector('.draw-line');
    var area = scope.querySelector('.draw-area');
    var dot = scope.querySelector('.draw-dot');
    if (!line) return;
    var len = line.getTotalLength();
    if (reduceMotion) {
      line.style.strokeDasharray = 'none';
      if (area) area.style.opacity = '1';
      if (dot) dot.style.opacity = '1';
      return;
    }
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    if (dot) dot.style.opacity = '0';
    line.getBoundingClientRect();
    line.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.22,0.61,0.36,1)';
    line.style.strokeDashoffset = '0';
    if (area) { area.style.transition = 'opacity 1.4s ease 0.5s'; area.style.opacity = '1'; }
    if (dot) { dot.style.transition = 'opacity 0.5s ease 1.4s'; dot.style.opacity = '1'; }
  }

  /* ---- Generic reveal observer ---- */
  var revObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revObserver.observe(el); });

  /* ---- One-shot activators (count, meters, ring, chart) ---- */
  var activators = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.hasAttribute('data-count')) countUp(el);
      if (el.classList.contains('meter')) {
        var pct = el.getAttribute('data-pct');
        var i = el.querySelector('i');
        if (i) i.style.width = pct + '%';
      }
      if (el.classList.contains('ring-fill')) {
        el.style.strokeDasharray = el.getAttribute('data-dash') + ' 999';
      }
      if (el.classList.contains('mini-bar')) {
        var mp = el.getAttribute('data-pct');
        var mi = el.querySelector('i');
        if (mi) mi.style.width = mp + '%';
      }
      if (el.classList.contains('draw-chart')) drawTrend(el);
      activators.unobserve(el);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('[data-count], .meter, .ring-fill, .mini-bar, .draw-chart')
    .forEach(function (el) { activators.observe(el); });

  /* ---- Hero trend draws on load (above the fold) ---- */
  var heroChart = document.querySelector('.hero .draw-chart');
  if (heroChart) {
    window.addEventListener('load', function () { setTimeout(function () { drawTrend(heroChart); }, 300); });
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
