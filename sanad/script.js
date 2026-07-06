/* AI Clinical Notes — interactions
   - Sticky header shadow
   - Signature hero: waveform sweep -> SOAP lines type in with cited chips
   - IntersectionObserver reveals + count-up
   - Contact form: "Sending…" label (no preventDefault) */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header shadow on scroll ---- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Build hero waveform bars ---- */
  var wave = document.getElementById("wave");
  if (wave) {
    var BARS = 44;
    for (var i = 0; i < BARS; i++) {
      var b = document.createElement("span");
      b.className = "bar";
      // pseudo-random but deterministic height + stagger
      var h = 22 + Math.round(Math.abs(Math.sin(i * 1.7) * 78));
      b.style.height = h + "%";
      b.style.animationDelay = (i * 0.045).toFixed(2) + "s";
      b.style.animationDuration = (1.1 + (i % 5) * 0.12).toFixed(2) + "s";
      wave.appendChild(b);
    }
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
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

  /* ---- Signature: type SOAP lines in sequence ---- */
  var scribe = document.getElementById("scribe");
  var soapLines = document.querySelectorAll(".soap-line");
  function playSoap() {
    soapLines.forEach(function (line, idx) {
      setTimeout(function () {
        line.classList.add("in");
      }, 650 + idx * 850);
    });
  }
  if (scribe && soapLines.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      soapLines.forEach(function (l) { l.classList.add("in"); });
    } else {
      var soapObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            playSoap();
            soapObs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      soapObs.observe(scribe);
    }
  }

  /* ---- Count-up ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = target + suffix.replace(/[^%\w]/g, "");
      el.innerHTML = target + '<span class="u">' + suffix + "</span>";
      return;
    }
    var start = null, dur = 1400;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(eased * target);
      el.innerHTML = val + '<span class="u">' + suffix + "</span>";
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(countUp);
    } else {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            countUp(e.target);
            cObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cObs.observe(c); });
    }
  }

  /* ---- Contact form submit label (native POST, no preventDefault) ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.setAttribute("aria-busy", "true");
        var lbl = btn.querySelector(".btn-label");
        if (lbl) lbl.textContent = "Sending…";
        else btn.textContent = "Sending…";
        btn.disabled = false; // keep enabled so the POST proceeds
      }
    });
  }
})();
