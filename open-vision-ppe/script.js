/* Open Vision PPE — reveals, count-ups, HUD counter. Vanilla JS. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- count-up ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---- reveal + trigger counts ---- */
  var revealEls = document.querySelectorAll('.reveal');
  var counted = new WeakSet();

  function runCounts(scope) {
    var nums = scope.querySelectorAll('[data-count-to]');
    for (var i = 0; i < nums.length; i++) {
      if (!counted.has(nums[i])) { counted.add(nums[i]); countUp(nums[i]); }
    }
  }

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          runCounts(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    runCounts(document);
  }

  /* ---- HUD counter (hero) runs on load regardless ---- */
  var hudCounts = document.querySelectorAll('.counter [data-count-to]');
  if (hudCounts.length) {
    setTimeout(function () {
      hudCounts.forEach(function (el) {
        if (!counted.has(el)) { counted.add(el); countUp(el); }
      });
    }, reduce ? 0 : 900);
  }

  /* ---- contact form: label to "Sending…" without blocking native POST ---- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn && form.checkValidity()) {
        btn.dataset.label = btn.textContent;
        btn.textContent = 'Sending…';
        btn.style.opacity = '0.8';
      }
    });
  }
})();
