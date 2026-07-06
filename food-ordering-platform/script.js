/* Low Latency Food Ordering Platform — interactions
   Restrained motion: scroll reveals, count-ups, signature hero flow.
   All non-essential motion disabled under prefers-reduced-motion. */

(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Count-up helper ---------- */
  function formatNum(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function countUp(el, target, duration) {
    if (reduce) { el.textContent = formatNum(target); return; }
    var start = null;
    var from = 0;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- IntersectionObserver: reveals + triggers ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var counted = new WeakSet();

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in");

        // count-ups inside this revealed element
        var nums = el.querySelectorAll(".countup");
        nums.forEach(function (n) {
          if (counted.has(n)) return;
          counted.add(n);
          countUp(n, parseFloat(n.getAttribute("data-target")) || 0, 1400);
        });

        io.unobserve(el);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Signature hero flow ---------- */
  var flow = document.getElementById("flow");
  var counter = document.getElementById("counter");

  if (flow) {
    var startFlow = function () {
      flow.classList.add("play");
      if (counter) {
        countUp(counter, parseFloat(counter.getAttribute("data-target")) || 0, 2200);
      }
    };

    if ("IntersectionObserver" in window && !reduce) {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { startFlow(); fio.unobserve(flow); }
        });
      }, { threshold: 0.4 });
      fio.observe(flow);
    } else {
      startFlow();
    }
  }

  /* ---------- Contact form: label feedback (no preventDefault) ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn && form.checkValidity()) {
        btn.dataset.label = btn.textContent;
        btn.textContent = "Sending…";
        btn.disabled = false; // keep enabled so the native POST proceeds
      }
    });
  }
})();
