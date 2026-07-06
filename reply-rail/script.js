/* Reply Rail — motion & interaction
   Restrained: scroll reveals, count-ups, a typed drafted reply.
   Everything degrades cleanly under prefers-reduced-motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- sticky header shadow ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- generic scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  /* ---- count-ups ---- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1200, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCount);
  } else {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---- theme / trend panels: add .in so bars & lines animate ---- */
  var panels = document.querySelectorAll(".theme, .panel");
  if (reduce || !("IntersectionObserver" in window)) {
    panels.forEach(function (p) { p.classList.add("in"); });
  } else {
    var pObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); pObs.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    panels.forEach(function (p) { pObs.observe(p); });
  }

  /* ---- signature: typed drafted reply ---- */
  var typed = document.getElementById("typed");
  if (typed) {
    var full = "Daniela — I'm sorry. Eighteen minutes for a lukewarm drip is on us, fully. I'll be at SoMa myself tomorrow to retrain the team on hand-off, and I'd like to make today right.";
    if (reduce) {
      typed.textContent = full;
    } else {
      var caret = document.createElement("span");
      caret.className = "caret";
      var i = 0;
      function type() {
        typed.textContent = full.slice(0, i);
        typed.appendChild(caret);
        i++;
        if (i <= full.length) {
          // slight natural rhythm; pause a touch on punctuation
          var ch = full.charAt(i - 2);
          var delay = (ch === "." || ch === ",") ? 220 : 20 + Math.random() * 26;
          setTimeout(type, delay);
        }
      }
      // start typing shortly after the card slides in
      setTimeout(type, 1500);
    }
  }

  /* ---- contact form: label the button while the native POST proceeds ---- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.dataset.label = btn.textContent;
        btn.textContent = "Sending…";
        btn.disabled = false; // never block the native submit
      }
      // no preventDefault — the native Web3Forms POST must proceed
    });
  }

  /* ---- smooth-scroll polish for in-page anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });
})();
