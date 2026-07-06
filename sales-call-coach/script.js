/* Sales Call Coach — reveals, count-ups, signature waveform draw */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header shadow on scroll ---- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Count-up helper ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var dur = 1300, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---- Prepare waveform stroke draw ---- */
  var wavePath = document.getElementById("wavePath");
  if (wavePath && !reduceMotion) {
    try {
      var len = wavePath.getTotalLength();
      wavePath.style.strokeDasharray = len;
      wavePath.style.strokeDashoffset = len;
      wavePath.style.transition = "none";
    } catch (e) {}
  }

  function drawWave() {
    if (!wavePath) return;
    if (reduceMotion) return;
    try {
      var len = wavePath.getTotalLength();
      // force reflow then animate
      // eslint-disable-next-line no-unused-expressions
      wavePath.getBoundingClientRect();
      wavePath.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.22,.61,.36,1)";
      wavePath.style.strokeDashoffset = "0";
    } catch (e) {}
  }

  /* ---- Trend line length setup ---- */
  var trendLine = document.getElementById("trendLine");
  if (trendLine) {
    try {
      var tlen = trendLine.getTotalLength();
      trendLine.style.setProperty("--len", tlen);
    } catch (e) {}
  }

  /* ---- IntersectionObserver: reveals + triggers ---- */
  var revealEls = document.querySelectorAll(".reveal, [data-stagger]");

  function activate(el) {
    el.classList.add("reveal-on");

    // staggered children
    if (el.hasAttribute("data-stagger") && !reduceMotion) {
      var kids = el.children;
      for (var i = 0; i < kids.length; i++) {
        kids[i].style.transitionDelay = (i * 90) + "ms";
      }
    }

    // count-ups inside
    var counters = el.querySelectorAll("[data-count]");
    for (var c = 0; c < counters.length; c++) countUp(counters[c]);

    // waveform panel
    if (el.id === "wavePanel") {
      drawWave();
      if (!reduceMotion) {
        var markers = el.querySelectorAll(".marker");
        markers.forEach(function (m) {
          var d = parseInt(m.getAttribute("data-delay"), 10) || 0;
          m.style.animationDelay = d + "ms";
        });
      }
    }
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(activate);
  }

  /* ---- Contact form: friendly submit label (no preventDefault) ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.dataset.label = btn.textContent;
        btn.textContent = "Sending…";
        btn.disabled = false; // keep enabled so native POST proceeds
      }
    });
  }
})();
