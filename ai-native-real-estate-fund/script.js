/* AI-Native Real Estate Fund — interactions
   IntersectionObserver reveals, count-ups, gauge sweep, pipeline sequence,
   map-pin drops. All motion respects prefers-reduced-motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Generic reveals ---------- */
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

  /* ---------- Count-ups ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduce) { el.textContent = String(target); return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (!("IntersectionObserver" in window)) {
    counters.forEach(countUp);
  } else {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- ML feature meters ---------- */
  var feats = document.querySelectorAll(".feat");
  if (feats.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      feats.forEach(function (f) { f.classList.add("in"); });
    } else {
      var fObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var siblings = e.target.parentNode.querySelectorAll(".feat");
            siblings.forEach(function (s, i) {
              setTimeout(function () { s.classList.add("in"); }, i * 110);
            });
            fObs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      fObs.observe(feats[0]);
    }
  }

  /* ---------- Hero visual: pipeline + gauge + pins ---------- */
  var viz = document.getElementById("pipeline-viz");
  var nodes = viz ? viz.querySelectorAll(".p-node") : [];
  var gaugeArc = document.getElementById("gaugeArc");
  var gaugeNum = document.getElementById("gaugeNum");
  var pins = document.querySelectorAll("#miniMap .pin");
  var verdict = document.getElementById("mapVerdict");

  function sweepGauge() {
    if (!gaugeArc) return;
    if (reduce) {
      gaugeArc.classList.add("go");
      if (gaugeNum) gaugeNum.textContent = "81";
      return;
    }
    gaugeArc.classList.add("go");
    var target = 81, dur = 2500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      if (gaugeNum) gaugeNum.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else if (gaugeNum) gaugeNum.textContent = String(target);
    }
    requestAnimationFrame(step);
  }

  function cyclePipeline() {
    if (!nodes.length || reduce) {
      nodes.forEach(function (n) { n.classList.add("active"); });
      return;
    }
    var i = 0;
    function tick() {
      nodes.forEach(function (n) { n.classList.remove("active"); });
      nodes[i].classList.add("active");
      i = (i + 1) % nodes.length;
    }
    tick();
    setInterval(tick, 1400);
  }

  function dropPins() {
    if (!pins.length) return;
    if (reduce) {
      pins.forEach(function (p) { p.classList.add("drop"); });
      if (verdict) verdict.classList.add("show");
      return;
    }
    pins.forEach(function (p) {
      var d = parseInt(p.getAttribute("data-delay"), 10) || 0;
      setTimeout(function () { p.classList.add("drop"); }, d);
    });
    setTimeout(function () { if (verdict) verdict.classList.add("show"); }, 1900);
  }

  function runHero() {
    sweepGauge();
    cyclePipeline();
    dropPins();
  }

  if (viz || gaugeArc) {
    var heroTarget = viz || gaugeArc;
    if (!("IntersectionObserver" in window)) {
      runHero();
    } else {
      var hObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runHero(); hObs.disconnect(); }
        });
      }, { threshold: 0.35 });
      hObs.observe(heroTarget);
    }
  }

  /* ---------- Contact form: gentle "Sending…" label (no preventDefault) ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn && form.checkValidity()) {
        btn.dataset.label = btn.textContent;
        btn.textContent = "Sending…";
        btn.disabled = false; // keep enabled so native POST proceeds
      }
    });
  }
})();
