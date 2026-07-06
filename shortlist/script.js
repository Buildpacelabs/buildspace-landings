/* ShortList — interactions
   - IntersectionObserver reveals
   - count-ups (funnel)
   - signature hero: score rings fill + shuffle-then-sort re-rank + cut line
   - per-skill fit bars grow vs role marker
   All motion respects prefers-reduced-motion. */

(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header shadow on scroll ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- count-up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      counters.forEach(countUp);
    } else {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cObs.observe(el); });
    }
  }

  /* ---------- score rings (hero) ---------- */
  var CIRC = 113.097; // 2 * PI * 18

  function fillRing(ring) {
    var p = parseFloat(ring.style.getPropertyValue('--p')) || 0;
    var prog = ring.querySelector('.prog');
    if (prog) prog.style.strokeDashoffset = String(CIRC * (1 - p / 100));
  }

  /* ---------- signature hero: shuffle then sort ---------- */
  var rankCard = document.getElementById('rankCard');
  var rankList = document.getElementById('rankList');
  var cutLine = document.getElementById('cutLine');

  function positionCutLine() {
    // place cut line just above the first candidate scoring < 80
    if (!rankList || !cutLine) return;
    var rows = Array.prototype.slice.call(rankList.querySelectorAll('.cand'));
    var listRect = rankList.getBoundingClientRect();
    var firstBelow = null;
    rows.forEach(function (r) {
      if (firstBelow === null && parseInt(r.getAttribute('data-score'), 10) < 80) {
        firstBelow = r;
      }
    });
    if (firstBelow) {
      var rr = firstBelow.getBoundingClientRect();
      var top = rr.top - listRect.top - 5;
      cutLine.style.top = top + 'px';
      cutLine.style.opacity = '1';
    }
  }

  function markShortlist() {
    if (!rankList) return;
    Array.prototype.slice.call(rankList.querySelectorAll('.cand')).forEach(function (r) {
      var s = parseInt(r.getAttribute('data-score'), 10);
      r.classList.toggle('is-short', s >= 80);
    });
  }

  function runHeroAnimation() {
    if (!rankList) return;
    var rows = Array.prototype.slice.call(rankList.querySelectorAll('.cand'));

    if (reduce) {
      rows.forEach(fillRingRow);
      markShortlist();
      positionCutLine();
      return;
    }

    // Measure sorted (DOM) positions, then apply an initial shuffled offset via transform,
    // then release to animate into sorted order (FLIP-style, transform only).
    var gap = 8;
    var h = rows.length ? rows[0].getBoundingClientRect().height + gap : 60;

    // shuffled starting order (indices)
    var shuffled = [3, 0, 4, 1, 2];
    rows.forEach(function (row, i) {
      var startPos = shuffled.indexOf(i);
      var delta = (startPos - i) * h;
      row.style.transition = 'none';
      row.style.transform = 'translateY(' + delta + 'px)';
      // reset rank number to shuffled display briefly
    });

    // force reflow
    void rankList.offsetHeight;

    // release: animate to natural (sorted) position
    requestAnimationFrame(function () {
      rows.forEach(function (row) {
        row.style.transition = '';
        row.style.transform = 'translateY(0)';
      });
    });

    // fill rings slightly after sort begins
    setTimeout(function () {
      rows.forEach(fillRingRow);
    }, 450);

    // mark shortlist + slide cut line in after settle
    setTimeout(function () {
      markShortlist();
      positionCutLine();
    }, 1150);
  }

  function fillRingRow(row) {
    var ring = row.querySelector('.ring');
    if (ring) fillRing(ring);
  }

  if (rankCard) {
    if (reduce || !('IntersectionObserver' in window)) {
      runHeroAnimation();
    } else {
      var heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runHeroAnimation(); heroObs.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      heroObs.observe(rankCard);
    }
    // keep cut line aligned on resize
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(positionCutLine, 150);
    }, { passive: true });
  }

  /* ---------- fit bars (explainable section) ---------- */
  function growFitPanel(panel) {
    var rows = Array.prototype.slice.call(panel.querySelectorAll('.fit-row'));
    rows.forEach(function (row, i) {
      var fill = row.querySelector('.fit-fill');
      var num = row.querySelector('.fv-n');
      var target = parseFloat(row.getAttribute('data-fill')) || 0;
      var delay = reduce ? 0 : i * 140;
      setTimeout(function () {
        if (fill) fill.style.width = target + '%';
        if (num) animateNum(num, target, reduce ? 0 : 900);
      }, delay);
    });
  }

  function animateNum(el, target, dur) {
    if (dur === 0) { el.textContent = target; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  var fitPanel = document.querySelector('.fitpanel');
  if (fitPanel) {
    if (reduce || !('IntersectionObserver' in window)) {
      growFitPanel(fitPanel);
    } else {
      var fitObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { growFitPanel(e.target); fitObs.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      fitObs.observe(fitPanel);
    }
  }

  /* ---------- contact form: gentle sending label (no preventDefault) ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn && form.checkValidity()) {
        btn.dataset.label = btn.textContent;
        btn.textContent = 'Sending…';
        btn.disabled = false; // keep enabled so native POST proceeds
      }
    });
  }
})();
