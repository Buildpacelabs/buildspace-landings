/* Focuscare — interactions
   - sticky header shadow on scroll
   - IntersectionObserver staggered reveals
   - signature consultation-flow playback + live timer count-up
   - contact form: "Sending…" label without blocking native POST
   All motion respects prefers-reduced-motion.
*/
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header scrolled state ---- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Signature consultation flow ---- */
  var flow = document.getElementById('flow');
  if (flow) {
    var timer = flow.querySelector('.flow-timer');
    var startCount = function () {
      if (!timer || reduce) return;
      var seconds = 0;
      var tick = setInterval(function () {
        seconds += 1;
        var m = String(Math.floor(seconds / 60)).padStart(2, '0');
        var s = String(seconds % 60).padStart(2, '0');
        timer.textContent = m + ':' + s + ' · recording';
        if (seconds >= 600) clearInterval(tick);
      }, 1000);
    };

    if (reduce || !('IntersectionObserver' in window)) {
      flow.classList.add('play');
    } else {
      var flowIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            flow.classList.add('play');
            startCount();
            flowIo.disconnect();
          }
        });
      }, { threshold: 0.4 });
      flowIo.observe(flow);
    }
  }

  /* ---- Contact form label (do NOT preventDefault) ---- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.dataset.label = btn.textContent;
        btn.textContent = 'Sending…';
        btn.disabled = false; // keep enabled so the native POST proceeds
      }
    });
  }
})();
