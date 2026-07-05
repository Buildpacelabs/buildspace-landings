/* ============================================================
   Charge Pulse — interactions
   Vanilla JS. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('is-stuck');
      else header.classList.remove('is-stuck');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Seamless marquee: duplicate its children once ---------- */
  var marquee = document.getElementById('marquee');
  if (marquee && !reduceMotion) {
    marquee.innerHTML += marquee.innerHTML;
  }

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up for numeric stats ---------- */
  var countEls = Array.prototype.slice.call(document.querySelectorAll('[data-countup]'));

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-countup'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  if (countEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      countEls.forEach(function (el) {
        el.textContent = el.getAttribute('data-countup') + (el.getAttribute('data-suffix') || '');
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      countEls.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Contact form -> Web3Forms (AJAX) ---------- */
  /* Submissions email our team directly; the access key lives in the form's
     hidden `access_key` field. */
  var form = document.getElementById('contactForm');
  if (form) {
    var note = document.getElementById('formSuccess');
    var noteSpan = note ? note.querySelector('span') : null;
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn ? btn.innerHTML : '';

    var showNote = function (msg, ok) {
      if (!note) return;
      if (noteSpan) { noteSpan.textContent = msg; } else { note.textContent = msg; }
      note.style.color = ok ? '' : '#FCA5A5';
      note.classList.add('show');
      note.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            form.reset();
            showNote("Thanks — we've got it. We'll be in touch within one business day.", true);
          } else {
            showNote((data.message || 'Something went wrong.') + ' You can also email buildspacelabs@vruoom.com.', false);
          }
        })
        .catch(function () {
          showNote("Network error — please email buildspacelabs@vruoom.com and we'll pick it up.", false);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = btnLabel; }
        });
    });
  }
})();
