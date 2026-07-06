/* ==========================================================================
   DSV Fleet Management — interaction layer
   IntersectionObserver reveals · count-ups · live-ops map · telemetry ticker
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll reveals --------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var ro = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { ro.observe(el); });
    }
  }

  /* ---- Count-ups -------------------------------------------------------- */
  function runCount(el) {
    var to = parseFloat(el.getAttribute("data-to")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = prefix + to + suffix; return; }
    var start = null, dur = 1300;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(to * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + to + suffix;
    }
    requestAnimationFrame(tick);
  }
  var counts = Array.prototype.slice.call(document.querySelectorAll(".count"));
  if (counts.length) {
    if (!("IntersectionObserver" in window)) {
      counts.forEach(runCount);
    } else {
      var co = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); obs.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counts.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---- Signature: vehicles moving along routes -------------------------- */
  var vehicles = Array.prototype.slice.call(document.querySelectorAll(".veh"));
  if (vehicles.length && !reduceMotion) {
    var tracked = vehicles.map(function (g) {
      var path = document.getElementById(g.getAttribute("data-route"));
      if (!path) return null;
      return {
        g: g,
        path: path,
        len: path.getTotalLength(),
        offset: parseFloat(g.getAttribute("data-offset")) || 0,
        speed: 0.018 + Math.random() * 0.012 // fraction per second
      };
    }).filter(Boolean);

    var last = null;
    function placeVeh(v, t) {
      var pt = v.path.getPointAtLength(((t % 1) * v.len));
      v.g.setAttribute("transform", "translate(" + pt.x.toFixed(2) + "," + pt.y.toFixed(2) + ")");
    }
    function frame(ts) {
      if (last === null) last = ts;
      var dt = (ts - last) / 1000;
      last = ts;
      tracked.forEach(function (v) {
        v.offset = (v.offset + v.speed * dt) % 1;
        placeVeh(v, v.offset);
      });
      requestAnimationFrame(frame);
    }
    // start after routes have drawn in
    tracked.forEach(function (v) { placeVeh(v, v.offset); });
    setTimeout(function () { requestAnimationFrame(frame); }, reduceMotion ? 0 : 900);
  } else if (vehicles.length) {
    // reduced motion: pin each vehicle to a fixed point on its route
    vehicles.forEach(function (g) {
      var path = document.getElementById(g.getAttribute("data-route"));
      if (!path) return;
      var off = parseFloat(g.getAttribute("data-offset")) || 0.4;
      var pt = path.getPointAtLength(off * path.getTotalLength());
      g.setAttribute("transform", "translate(" + pt.x.toFixed(2) + "," + pt.y.toFixed(2) + ")");
    });
  }

  /* ---- Telemetry ticker + coordinate readout ---------------------------- */
  if (!reduceMotion) {
    var speedEl = document.querySelector(".js-speed");
    var fuelEl  = document.querySelector(".js-fuel");
    var etaEl   = document.querySelector(".js-eta");
    var coordEl = document.getElementById("coordReadout");
    var fuel = 71, etaMin = 8 * 60 + 42;

    function jitter(base, spread) { return base + Math.round((Math.random() - 0.5) * spread); }

    var telemetry = setInterval(function () {
      if (document.hidden) return;
      if (speedEl) speedEl.textContent = Math.max(0, jitter(52, 22));
      if (fuelEl)  { fuel = Math.max(38, fuel - (Math.random() < 0.4 ? 1 : 0)); fuelEl.textContent = fuel; }
      if (etaEl)   {
        etaMin = Math.max(0, etaMin - (Math.random() < 0.5 ? 1 : 0));
        var h = Math.floor(etaMin / 60), m = etaMin % 60;
        etaEl.textContent = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
      }
      if (coordEl) {
        var lat = (28.6139 + (Math.random() - 0.5) * 0.02).toFixed(4);
        var lng = (77.2090 + (Math.random() - 0.5) * 0.02).toFixed(4);
        coordEl.innerHTML = lat + "°N<br>" + lng + "°E";
      }
    }, 1600);
    window.addEventListener("pagehide", function () { clearInterval(telemetry); });
  }

  /* ---- Contact form: label feedback (never preventDefault) -------------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.setAttribute("aria-busy", "true"); btn.textContent = "Sending…"; }
      // native POST proceeds
    });
  }
})();
