/* Factory OS — reveals, count-ups, and the signature Gantt sequence */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Count-up ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var start = performance.now();
    var dur = 1300;
    function step(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    requestAnimationFrame(step);
  }

  /* ---- Generic reveal + count observer ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add("in");
      el.querySelectorAll("[data-count]").forEach(function (n) {
        if (!n.dataset.done) { n.dataset.done = "1"; countUp(n); }
      });
      io.unobserve(el);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal, .band, .cap-panel").forEach(function (el) {
    io.observe(el);
  });

  // Stat band counters (band itself is observed above; ensure counts fire)
  document.querySelectorAll(".stat [data-count]").forEach(function () {});

  /* ---- Signature Gantt sequence ---- */
  var gantt = document.getElementById("gantt");
  if (gantt) {
    var capNum = document.getElementById("capNum");
    var gates = gantt.querySelectorAll(".gate");

    function runGates() {
      if (reduceMotion) {
        gates.forEach(function (g) { g.classList.add("checked"); });
        if (capNum) capNum.textContent = capNum.getAttribute("data-count");
        return;
      }
      gates.forEach(function (g, i) {
        setTimeout(function () { g.classList.add("checked"); }, 900 + i * 120);
      });
      // capacity number counts up in sync with the bar fill (CSS delay .8s, 1.4s dur)
      setTimeout(function () { if (capNum) countUp(capNum); }, 800);
    }

    var gIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        gantt.classList.add("play");
        runGates();
        gIO.unobserve(gantt);
      });
    }, { threshold: 0.35 });
    gIO.observe(gantt);
  }

  /* ---- Contact form: gentle "Sending…" label (never preventDefault) ---- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = "Sending…"; btn.disabled = false; }
    });
  }
})();
