/* =========================================================
   Captcha-Resilient ATS Agent — BuildspaceLabs
   IntersectionObserver reveals · count-ups · signature run demo
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------- Scroll reveals -------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* -------- Count-ups in the metric band -------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var dur = 1100, start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
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

  /* -------- Signature: the live bypass-stack run -------- */
  var terminal = document.getElementById("signature");
  var stack = document.getElementById("tier-stack");
  var logEl = document.getElementById("run-log");
  var gaugeProg = document.getElementById("gauge-prog");
  var gaugeNum = document.getElementById("gauge-num");

  var LOG = [
    { t: "10:42:01", html: '<span class="fn">navigate</span>(greenhouse.io/jobs) <span class="ok">200</span>' },
    { t: "10:42:03", html: '<span class="fn">fill</span>(name, email, resume) <span class="ok">ok</span>' },
    { t: "10:42:05", html: 'captcha <span class="warn">detected</span> — escalating' },
    { t: "10:42:05", html: 'tier 1 <span class="fn">chromium</span> <span class="warn">blocked</span>' },
    { t: "10:42:07", html: 'tier 2 <span class="fn">firefox</span> <span class="warn">blocked</span>' },
    { t: "10:42:09", html: 'tier 3 <span class="fn">2captcha</span>.solve() <span class="ok">cleared</span>' },
    { t: "10:42:11", html: '<span class="fn">submit</span>(application) <span class="ok">✓ 202</span>' },
    { t: "10:42:11", html: 'screenshot <span class="ok">captured</span> · run complete' }
  ];

  function ringFor(pct) {
    var C = 2 * Math.PI * 42; // 263.9
    return C - (pct / 100) * C;
  }

  function runGauge() {
    if (!gaugeProg) return;
    if (reduceMotion) {
      gaugeProg.style.strokeDashoffset = ringFor(99);
      if (gaugeNum) gaugeNum.textContent = "99";
      return;
    }
    // Escalate the gauge in steps that mirror the stack lighting up.
    var steps = [40, 70, 95, 99];
    var i = 0;
    function next() {
      if (i >= steps.length) return;
      var v = steps[i];
      gaugeProg.style.strokeDashoffset = ringFor(v);
      // number tween
      var from = i === 0 ? 0 : steps[i - 1];
      var s = null, dur = 620;
      (function tween() {
        function tick(ts) {
          if (s === null) s = ts;
          var p = Math.min((ts - s) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          if (gaugeNum) gaugeNum.textContent = Math.round(from + (v - from) * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      })();
      i++;
      setTimeout(next, 700);
    }
    next();
  }

  function runStack() {
    if (!stack) return;
    var tiers = stack.querySelectorAll(".tier");
    tiers.forEach(function (tier, idx) {
      var final = parseInt(tier.getAttribute("data-final"), 10);
      var fill = tier.querySelector(".tier-fill");
      var pctEl = tier.querySelector(".tier-pct");
      var delay = reduceMotion ? 0 : 240 + idx * 260;
      setTimeout(function () {
        tier.classList.add("is-active");
        if (fill) fill.style.width = final + "%";
        if (pctEl) {
          if (reduceMotion) { pctEl.textContent = final + "%"; return; }
          var s = null, dur = 900;
          function tick(ts) {
            if (s === null) s = ts;
            var p = Math.min((ts - s) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            pctEl.textContent = Math.round(final * eased) + "%";
            if (p < 1) requestAnimationFrame(tick);
            else pctEl.textContent = final + "%";
          }
          requestAnimationFrame(tick);
        }
      }, delay);
    });
  }

  function streamLog() {
    if (!logEl) return;
    logEl.innerHTML = "";
    if (reduceMotion) {
      LOG.forEach(function (line) {
        var d = document.createElement("div");
        d.className = "log-line show";
        d.innerHTML = '<span class="t">' + line.t + '</span> ' + line.html;
        logEl.appendChild(d);
      });
      return;
    }
    var i = 0;
    function addLine() {
      if (i >= LOG.length) {
        var last = logEl.lastChild;
        if (last) last.classList.remove("log-caret");
        return;
      }
      var line = LOG[i];
      var d = document.createElement("div");
      d.className = "log-line log-caret";
      d.innerHTML = '<span class="t">' + line.t + '</span> ' + line.html;
      // keep the log height bounded — drop oldest once full
      logEl.appendChild(d);
      var prev = d.previousSibling;
      if (prev) prev.classList.remove("log-caret");
      requestAnimationFrame(function () { d.classList.add("show"); });
      if (logEl.children.length > 7) logEl.removeChild(logEl.firstChild);
      i++;
      setTimeout(addLine, 620);
    }
    addLine();
  }

  var played = false;
  function playSignature() {
    if (played) return;
    played = true;
    runStack();
    streamLog();
    runGauge();
  }

  if (terminal) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      playSignature();
    } else {
      var sigObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { playSignature(); sigObs.disconnect(); }
        });
      }, { threshold: 0.4 });
      sigObs.observe(terminal);
    }
  }

  /* -------- Contact form: non-blocking "Sending…" label -------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.setAttribute("data-label", btn.textContent);
        btn.textContent = "Sending…";
        btn.style.opacity = "0.85";
      }
      // no preventDefault — the native POST proceeds
    });
  }
})();
