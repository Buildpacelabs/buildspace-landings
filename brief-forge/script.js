/* =====================================================================
   Brief Forge — interactions
   Reveal-on-scroll · count-up stats · redline signature motion · mobile nav
   All motion respects prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Contact form (contact.html) -> native Web3Forms POST ----------
     The free plan blocks cross-origin AJAX, so we let the form POST natively;
     on success Web3Forms redirects to the hidden `redirect` (thank-you.html).
     We only add a light "Sending…" label — never preventDefault — so the
     browser's required-field validation runs first. */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn && contactForm.checkValidity()) {
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.textContent = 'Sending…';
      }
    });
  }

  /* ---------- Count-up numerals ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var start = null;
    var dur = 1100;
    function step(ts) {
      if (start === null) { start = ts; }
      var p = Math.min((ts - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) { requestAnimationFrame(step); }
      else { el.textContent = String(target); }
    }
    requestAnimationFrame(step);
  }

  /* ---------- Reveal-on-scroll (staggered) + hooks ---------- */
  var heroPlate = document.querySelector('.hero-plate');
  var ctaInner = document.querySelector('.cta-inner');

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
    if (heroPlate) { heroPlate.classList.add('is-redlined'); }
    if (ctaInner) { ctaInner.classList.add('in-view'); }
    return;
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) { return; }
      var el = entry.target;

      // stagger siblings within a shared parent group
      var group = el.parentElement
        ? Array.prototype.filter.call(el.parentElement.children, function (c) {
            return c.classList && c.classList.contains('reveal');
          })
        : [el];
      var idx = group.indexOf(el);
      var delay = reduceMotion ? 0 : Math.min(idx, 5) * 90;
      el.style.transitionDelay = delay + 'ms';
      el.classList.add('in-view');

      revealObserver.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Count-up trigger ---------- */
  var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) { return; }
      countUp(entry.target);
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    statObserver.observe(el);
  });

  /* ---------- Hero signature: redline reveal ---------- */
  if (heroPlate) {
    if (reduceMotion) {
      heroPlate.classList.add('is-redlined');
    } else {
      var plateObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          // small beat so the reader registers the original clause first
          setTimeout(function () { heroPlate.classList.add('is-redlined'); }, 650);
          plateObserver.unobserve(entry.target);
        });
      }, { threshold: 0.4 });
      plateObserver.observe(heroPlate);
    }
  }

  /* ---------- CTA rule draw ---------- */
  if (ctaInner) {
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        ctaInner.classList.add('in-view');
        ctaObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    ctaObserver.observe(ctaInner);
  }
})();
