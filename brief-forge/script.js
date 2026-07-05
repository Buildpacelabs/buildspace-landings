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

  /* ---------- Contact form (contact.html) -> Web3Forms (AJAX) ----------
     Submissions email our team directly; the access key lives in the form's
     hidden `access_key` field. */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var successNote = document.getElementById('form-success');
    var successMsg = document.getElementById('form-success-msg');
    var submitBtn = contactForm.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.innerHTML : '';

    var flag = function (msg, ok) {
      if (!successNote) return;
      if (successMsg) { successMsg.textContent = msg; }
      successNote.style.color = ok ? '' : '#B4382E';
      successNote.hidden = false;
      successNote.focus();
    };

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending…'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            contactForm.reset();
            flag("Thank you — we've got your note and will be in touch within one business day.", true);
          } else {
            flag((data.message || 'Something went wrong') + ' — you can also email buildspacelabs@vruoom.com.', false);
          }
        })
        .catch(function () {
          flag("Network error — please email buildspacelabs@vruoom.com and we'll pick it up.", false);
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitLabel; }
        });
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
