/* ==========================================================================
   Inbox Zero — motion + interactions
   - IntersectionObserver reveals + count-ups
   - Signature hero: emails flick into five lanes, counter ticks down to 0,
     keyboard shortcut hints fade in.
   - Everything guarded by prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Sticky header shadow
     --------------------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Count-ups (stat band)
     --------------------------------------------------------------------- */
  function animateCount(el, target, duration) {
    if (reduceMotion) { el.textContent = String(target); return; }
    var start = 0;
    var startTime = null;
    function step(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(start + (target - start) * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    requestAnimationFrame(step);
  }

  var countEls = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
  if (countEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      countEls.forEach(function (el) { el.textContent = el.getAttribute("data-count-to"); });
    } else {
      var countObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            animateCount(el, parseInt(el.getAttribute("data-count-to"), 10), 1400);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.6 });
      countEls.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------------------------------------------------------------------
     Signature hero — sort into lanes, count down to zero
     --------------------------------------------------------------------- */
  var stage = document.getElementById("heroStage");
  if (stage) {
    var counterNum = document.getElementById("counterNum");
    var lanesWrap = document.getElementById("heroLanes");
    var shortcutsWrap = document.getElementById("shortcuts");
    var slots = {};
    var laneCountEls = {};
    Array.prototype.slice.call(lanesWrap.querySelectorAll(".lane")).forEach(function (lane) {
      var key = lane.getAttribute("data-lane");
      slots[key] = lane.querySelector("[data-slot]");
      laneCountEls[key] = lane.querySelector("[data-count]");
    });

    // 24 emails distributed across lanes; order in which they land.
    var SEQUENCE = [
      "todo", "promo", "fyi", "news", "await",
      "promo", "todo", "news", "fyi", "promo",
      "news", "await", "fyi", "promo", "todo",
      "news", "fyi", "promo", "await", "news",
      "promo", "fyi", "news", "todo"
    ];
    var TOTAL = SEQUENCE.length;
    var laneTotals = { todo: 0, await: 0, fyi: 0, news: 0, promo: 0 };
    SEQUENCE.forEach(function (k) { laneTotals[k]++; });

    function makeMini() {
      var c = document.createElement("div");
      c.className = "mini-card landed";
      c.innerHTML = '<div class="mc-line w1"></div><div class="mc-line w2"></div>';
      return c;
    }

    function renderStatic() {
      // Reduced-motion / no-JS-motion: show final sorted state at 0.
      counterNum.textContent = "0";
      counterNum.classList.add("is-zero");
      var laneCounters = { todo: 0, await: 0, fyi: 0, news: 0, promo: 0 };
      SEQUENCE.forEach(function (key) {
        laneCounters[key]++;
        var mini = document.createElement("div");
        mini.className = "mini-card";
        mini.style.opacity = "1";
        mini.style.transform = "none";
        mini.innerHTML = '<div class="mc-line w1"></div><div class="mc-line w2"></div>';
        // Cap visible cards per lane to keep the box tidy
        if (slots[key].childElementCount < 3) slots[key].appendChild(mini);
      });
      Object.keys(laneCountEls).forEach(function (k) {
        laneCountEls[k].textContent = String(laneTotals[k]);
      });
      Array.prototype.slice.call(shortcutsWrap.querySelectorAll(".shortcut"))
        .forEach(function (s) { s.classList.add("show"); });
    }

    var played = false;

    function play() {
      if (played) return;
      played = true;

      if (reduceMotion) { renderStatic(); return; }

      var i = 0;
      var laneCounters = { todo: 0, await: 0, fyi: 0, news: 0, promo: 0 };
      var remaining = TOTAL;
      counterNum.textContent = String(TOTAL);

      var STEP = 150; // ms between cards

      function tick() {
        if (i >= TOTAL) { finish(); return; }
        var key = SEQUENCE[i];
        laneCounters[key]++;
        // Add card to lane (cap displayed at 3 so lanes don't overflow)
        if (slots[key].childElementCount < 3) {
          slots[key].appendChild(makeMini());
        } else {
          // pulse the count instead
          var badge = laneCountEls[key];
          badge.style.transform = "scale(1.18)";
          setTimeout(function () { badge.style.transform = ""; }, 160);
        }
        laneCountEls[key].textContent = String(laneCounters[key]);

        // countdown
        remaining--;
        counterNum.textContent = String(remaining);
        if (remaining === 0) {
          counterNum.classList.add("is-zero");
        }
        i++;
        setTimeout(tick, STEP);
      }

      function finish() {
        // reveal shortcut hints in stagger
        var hints = Array.prototype.slice.call(shortcutsWrap.querySelectorAll(".shortcut"));
        hints.forEach(function (s, idx) {
          setTimeout(function () { s.classList.add("show"); }, idx * 130);
        });
      }

      // brief beat before cards start flicking in
      setTimeout(tick, 420);
    }

    if (!("IntersectionObserver" in window)) {
      play();
    } else {
      var stageObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            play();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      stageObserver.observe(stage);
    }
  }

  /* ---------------------------------------------------------------------
     Contact form — set button label to "Sending…" (NO preventDefault)
     --------------------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function () {
      var btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.dataset.label = btn.textContent;
        btn.textContent = "Sending…";
        btn.disabled = false; // keep enabled so native POST proceeds
      }
      // no preventDefault — native Web3Forms POST continues
    });
  }
})();
