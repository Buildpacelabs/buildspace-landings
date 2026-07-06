/* =========================================================
   Patient Front Desk — interactions
   - Sticky header shadow
   - IntersectionObserver reveals (staggered)
   - Count-ups (tabular)
   - Signature: waiting-room board fills, cards flip to
     "AI-handled", counter climbs to 14/18, 2 drop to
     the exceptions column.
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Count-up helper ---------- */
  function countUp(el, target, dur) {
    if (reduce) { el.textContent = String(target); return; }
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = String(target);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Generic reveals + count triggers ---------- */
  var revObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('in');

      // fire any count-ups inside
      el.querySelectorAll('[data-count]').forEach(function (c) {
        if (c.dataset.done) return;
        c.dataset.done = '1';
        countUp(c, parseInt(c.dataset.count, 10), 1400);
      });

      obs.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revObserver.observe(el);
  });

  // Count-ups that are not themselves .reveal (e.g. inside a revealed parent)
  document.querySelectorAll('[data-count]').forEach(function (c) {
    if (c.closest('.reveal')) return; // handled above
  });

  /* =========================================================
     SIGNATURE: waiting-room board
     ========================================================= */
  var board = document.querySelector('.board');
  var qHandled = document.getElementById('queueHandled');
  var qExc = document.getElementById('queueExc');
  var bar = document.getElementById('boardBar');
  var handledCntEl = document.getElementById('handledCnt');
  var excCntEl = document.getElementById('excCnt');
  var counterEl = document.querySelector('[data-target="14"]');

  // 18 appointments; 14 handled, 4 exceptions (matches product facts).
  var appts = [
    { t: '8:00', n: 'A. Rivera',   v: 'New patient',   exc: false },
    { t: '8:20', n: 'M. Chen',     v: 'Follow-up',     exc: false },
    { t: '8:40', n: 'P. Okafor',   v: 'Annual physical', exc: false },
    { t: '9:00', n: 'S. Nguyen',   v: 'Lab review',    exc: true  },
    { t: '9:20', n: 'D. Kaur',     v: 'Follow-up',     exc: false },
    { t: '9:40', n: 'J. Morales',  v: 'New patient',   exc: false },
    { t: '10:00', n: 'R. Adeyemi', v: 'Consult',       exc: false },
    { t: '10:20', n: 'L. Rossi',   v: 'Follow-up',     exc: false },
    { t: '10:40', n: 'T. Bauer',   v: 'Referral',      exc: true  },
    { t: '11:00', n: 'K. Silva',   v: 'Annual physical', exc: false },
    { t: '11:20', n: 'E. Haddad',  v: 'Follow-up',     exc: false },
    { t: '11:40', n: 'N. Foster',  v: 'New patient',   exc: false },
    { t: '1:00', n: 'B. Lindqvist', v: 'Consult',      exc: true  },
    { t: '1:20', n: 'V. Costa',    v: 'Follow-up',     exc: false },
    { t: '1:40', n: 'H. Yamada',   v: 'Lab review',    exc: false },
    { t: '2:00', n: 'G. Traoré',   v: 'Follow-up',     exc: false },
    { t: '2:20', n: 'O. Fischer',  v: 'Referral',      exc: true  },
    { t: '2:40', n: 'C. Mensah',   v: 'Annual physical', exc: false }
  ];

  function apptEl(a) {
    var el = document.createElement('div');
    el.className = 'appt';
    el.innerHTML =
      '<span class="time num">' + a.t + '</span>' +
      '<span class="who"><b>' + a.n + '</b><span>' + a.v + '</span></span>' +
      '<span class="status" aria-hidden="true">' +
        '<svg class="spin" viewBox="0 0 24 24" fill="none"><path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
      '</span>';
    return el;
  }

  var checkSVG =
    '<svg viewBox="0 0 24 24" fill="none"><path d="M6 12.5l3.5 3.5L18 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var alertSVG =
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 8v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>';

  function runBoard() {
    if (reduce) {
      // Static, fully-resolved end state — no motion.
      var h = 0, e = 0;
      appts.forEach(function (a) {
        var el = apptEl(a);
        el.classList.add('in');
        var st = el.querySelector('.status');
        if (a.exc) {
          el.classList.add('exception');
          st.innerHTML = alertSVG;
          qExc.appendChild(el); e++;
        } else {
          el.classList.add('handled');
          st.innerHTML = checkSVG;
          qHandled.appendChild(el); h++;
        }
      });
      handledCntEl.textContent = h;
      excCntEl.textContent = e;
      if (counterEl) counterEl.textContent = '14';
      if (bar) bar.style.width = '78%';
      return;
    }

    var handled = 0, exceptions = 0, i = 0;

    function placeNext() {
      if (i >= appts.length) return;
      var a = appts[i];
      var el = apptEl(a);
      var target = a.exc ? qExc : qHandled;
      target.appendChild(el);

      // enter
      requestAnimationFrame(function () { el.classList.add('in'); });

      // resolve after a short "processing" beat
      var delay = 320 + Math.random() * 160;
      setTimeout(function () {
        var st = el.querySelector('.status');
        el.classList.add('flip');
        setTimeout(function () {
          if (a.exc) {
            el.classList.add('exception');
            st.innerHTML = alertSVG;
            exceptions++;
            excCntEl.textContent = exceptions;
          } else {
            el.classList.add('handled');
            st.innerHTML = checkSVG;
            handled++;
            handledCntEl.textContent = handled;
            if (counterEl) counterEl.textContent = String(handled);
            if (bar) bar.style.width = (handled / 18 * 100).toFixed(1) + '%';
          }
        }, 180);
        setTimeout(function () { el.classList.remove('flip'); }, 520);
      }, delay);

      i++;
      // stagger the population
      setTimeout(placeNext, 180);
    }

    placeNext();
  }

  // Kick the board once it scrolls into view (or immediately if already visible).
  if (board) {
    if (reduce) {
      runBoard();
    } else {
      var started = false;
      var boardObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            setTimeout(runBoard, 260);
            obs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      boardObs.observe(board);
    }
  }

  /* ---------- Contact form: gentle "Sending…" (no preventDefault) ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.dataset.label = btn.textContent;
        btn.textContent = 'Sending…';
        btn.disabled = false; // keep enabled so native POST proceeds
      }
    });
  }
})();
