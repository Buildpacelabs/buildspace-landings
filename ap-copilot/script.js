/* ============================================================
   AP Copilot — interactions
   - reveal-on-scroll (IntersectionObserver, staggered)
   - metric count-ups (tabular mono)
   - signature hero animation: field fill-in + confidence rings
   - mobile nav
   All non-essential motion is skipped under prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      mobileNav.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        mobileNav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- count-ups ---------- */
  function formatNum(value, decimals, comma) {
    var out = decimals ? value.toFixed(decimals) : String(Math.round(value));
    if (comma) out = Number(out).toLocaleString("en-US");
    return out;
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var comma = el.getAttribute("data-format") === "comma";

    if (reduceMotion) {
      el.textContent = formatNum(target, decimals, comma) + suffix;
      return;
    }

    var dur = 1400, start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased, decimals, comma) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target, decimals, comma) + suffix;
    }
    requestAnimationFrame(tick);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCount);
  } else {
    var countObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* ---------- confidence ring builder ---------- */
  var NS = "http://www.w3.org/2000/svg";
  var R = 15, C = 2 * Math.PI * R;

  function buildRing(host, pct) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 40 40");
    svg.setAttribute("width", "40");
    svg.setAttribute("height", "40");

    var track = document.createElementNS(NS, "circle");
    track.setAttribute("cx", "20"); track.setAttribute("cy", "20"); track.setAttribute("r", String(R));
    track.setAttribute("fill", "none"); track.setAttribute("stroke", "#E7E9EE"); track.setAttribute("stroke-width", "3");

    var arc = document.createElementNS(NS, "circle");
    arc.setAttribute("cx", "20"); arc.setAttribute("cy", "20"); arc.setAttribute("r", String(R));
    arc.setAttribute("fill", "none"); arc.setAttribute("stroke", "#0FA968"); arc.setAttribute("stroke-width", "3");
    arc.setAttribute("stroke-linecap", "round");
    arc.setAttribute("transform", "rotate(-90 20 20)");
    arc.setAttribute("stroke-dasharray", String(C));

    var label = document.createElementNS(NS, "text");
    label.setAttribute("x", "20"); label.setAttribute("y", "20");
    label.setAttribute("text-anchor", "middle"); label.setAttribute("dominant-baseline", "central");
    label.setAttribute("font-family", "'IBM Plex Mono', monospace");
    label.setAttribute("font-size", "9.5"); label.setAttribute("font-weight", "600");
    label.setAttribute("fill", "#0A0B0D");

    var offset = C * (1 - pct / 100);
    if (reduceMotion) {
      arc.setAttribute("stroke-dashoffset", String(offset));
      label.textContent = pct + "%";
    } else {
      arc.setAttribute("stroke-dashoffset", String(C));
      arc.style.transition = "stroke-dashoffset 1s cubic-bezier(.22,.61,.36,1)";
      label.textContent = "0%";
    }

    svg.appendChild(track); svg.appendChild(arc); svg.appendChild(label);
    host.appendChild(svg);

    return function animate() {
      if (reduceMotion) return;
      arc.setAttribute("stroke-dashoffset", String(offset));
      var start = null, dur = 1000;
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        label.textContent = Math.round(pct * eased) + "%";
        if (p < 1) requestAnimationFrame(tick);
        else label.textContent = pct + "%";
      }
      requestAnimationFrame(tick);
    };
  }

  /* ---------- signature hero animation ---------- */
  var card = document.getElementById("extract-card");
  if (card) {
    var fields = Array.prototype.slice.call(card.querySelectorAll(".ec-field"));
    var animators = [];

    fields.forEach(function (field) {
      var host = field.querySelector("[data-ring]");
      var pct = parseInt(field.getAttribute("data-conf"), 10);
      animators.push(buildRing(host, pct));
    });

    function playCard() {
      if (reduceMotion) {
        fields.forEach(function (f) { f.classList.add("in"); });
        card.classList.add("done");
        return;
      }
      var step = 340;
      fields.forEach(function (field, i) {
        setTimeout(function () {
          field.classList.add("in");
          animators[i]();
        }, 200 + i * step);
      });
      setTimeout(function () {
        card.classList.add("done");
      }, 200 + fields.length * step + 300);
    }

    if (!("IntersectionObserver" in window)) {
      playCard();
    } else {
      var cardObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { playCard(); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      cardObs.observe(card);
    }
  }
})();
