/* Support Pulse — reveals, count-ups, drafted-reply typing */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header shadow on scroll ---- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- count-up ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1200, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        var counters = e.target.querySelectorAll('[data-count]');
        counters.forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) {
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(countUp);
    });
  }

  /* ---- drafted-reply typing (signature hero) ---- */
  var typeTarget = document.getElementById('typeTarget');
  if (typeTarget) {
    var full = "Hi Tomás — sorry for the surprise charge. I dug into the ledger: two invoices fired from one provisioning event, so I've queued a refund of $4,200 against INV-88419.";
    if (reduce) {
      typeTarget.textContent = full;
      var caret = document.querySelector('.type-caret');
      if (caret) caret.style.display = 'none';
    } else {
      var i = 0;
      function tick() {
        if (i <= full.length) {
          typeTarget.textContent = full.slice(0, i);
          i++;
          // vary speed slightly for a human feel; pause on punctuation
          var ch = full.charAt(i - 1);
          var delay = (ch === '.' || ch === ',' || ch === '—') ? 220 : 26 + Math.random() * 34;
          setTimeout(tick, delay);
        } else {
          setTimeout(function () { i = 0; typeTarget.textContent = ''; tick(); }, 4200);
        }
      }
      // start after the board settles
      setTimeout(tick, 1400);
    }
  }

  /* ---- contact form: reassure label (never preventDefault) ---- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = false; }
    });
  }
})();
