/* Investor Update Drafter — motion + interactions
   Signature: a draft that types itself from metrics, tone chips that rewrite it,
   sparklines that draw, a wax seal that stamps. All disabled under reduced motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- IntersectionObserver reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- normalize sparkline dash lengths ---------- */
  document.querySelectorAll(".spark path").forEach(function (p) {
    try {
      var len = Math.ceil(p.getTotalLength());
      p.parentNode.style.setProperty("--len", len);
    } catch (e) {}
  });

  /* ---------- count-ups ---------- */
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = prefix.replace("&lt;", "<") + target + suffix; return; }
    var start = null, dur = 1100, from = 0;
    prefix = prefix.replace("&lt;", "<");
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(from + (target - from) * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counts = document.querySelectorAll("[data-count]");
  if (counts.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      counts.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counts.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- rate bars ---------- */
  document.querySelectorAll(".land-card").forEach(function (card) {
    var fills = card.querySelectorAll(".rate-fill");
    if (!fills.length) return;
    var fire = function () {
      fills.forEach(function (f) { f.style.width = (f.getAttribute("data-w") || 0) + "%"; });
    };
    if (reduce || !("IntersectionObserver" in window)) { fire(); return; }
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { fire(); rio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    rio.observe(card);
  });

  /* ---------- HERO: signature drafting animation ---------- */
  var demo = document.getElementById("draftDemo");
  var draftText = document.getElementById("draftText");

  var DRAFTS = {
    concise: "Team — June was a strong revenue month. MRR is up 14% to $48.2k with 27 new logos, and NRR reached 112%. Runway holds at 14 months. Ask: two intros to vertical-SaaS Series A leads.",
    detailed: "Team — sharing where we landed in June. MRR grew 14% month-over-month to $48.2k on 27 new logos, and net revenue retention rose to 112% as existing teams expanded. Active teams are up 21% to 318. Cash is down 9% to $1.4M, leaving 14 months of runway. Ask: two warm intros to Series A leads in vertical SaaS.",
    punchy: "Big June. MRR +14% to $48.2k. 27 new logos. NRR at 112%. Active teams up 21%. Runway: 14 months and we're building. Give us two intros to vertical-SaaS Series A leads and we'll take it from there.",
    vulnerable: "Team — June was mostly good, with one thing I'm watching. Revenue is up 14% to $48.2k and retention is healthy at 112%, which I'm proud of. But cash is down 9% and runway is at 14 months, so burn is on my mind. Where I'd love help: two intros to Series A leads who get vertical SaaS."
  };

  var typeTimer = null;
  function typeDraft(text, done) {
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    if (reduce) {
      draftText.innerHTML = text + '<span class="caret" aria-hidden="true"></span>';
      if (done) done();
      return;
    }
    draftText.textContent = "";
    var caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    draftText.appendChild(caret);
    var i = 0;
    (function step() {
      if (i <= text.length) {
        draftText.textContent = text.slice(0, i);
        draftText.appendChild(caret);
        i++;
        var ch = text.charAt(i - 2);
        var delay = ch === "." || ch === "," ? 46 : 15;
        typeTimer = setTimeout(step, delay);
      } else if (done) { done(); }
    })();
  }

  function setTone(tone, animate) {
    document.querySelectorAll(".tone-chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.getAttribute("data-tone") === tone));
    });
    var text = DRAFTS[tone] || DRAFTS.concise;
    if (animate) { typeDraft(text); }
    else { draftText.innerHTML = text + '<span class="caret" aria-hidden="true"></span>'; }
  }

  if (demo && draftText) {
    // chip interactions
    document.querySelectorAll(".tone-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { setTone(chip.getAttribute("data-tone"), true); });
    });

    var started = false;
    var startHero = function () {
      if (started) return; started = true;
      demo.classList.add("is-drawn");            // draws sparklines + stamps seal via CSS
      // begin typing once sparklines are mostly drawn
      setTimeout(function () { typeDraft(DRAFTS.concise); }, reduce ? 0 : 900);
    };

    if (reduce || !("IntersectionObserver" in window)) {
      demo.classList.add("is-drawn");
      setTone("concise", false);
    } else {
      var hio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { startHero(); hio.unobserve(e.target); } });
      }, { threshold: 0.35 });
      hio.observe(demo);
    }

    // send button flourish
    var sendBtn = document.getElementById("sendBtn");
    if (sendBtn) {
      sendBtn.addEventListener("click", function () {
        var status = demo.querySelector(".draft-head .status");
        sendBtn.textContent = "Sent ✓";
        sendBtn.style.background = "var(--mint)";
        if (status) status.innerHTML = '<span style="color:var(--mint)">Delivered to 12 LPs</span>';
        setTimeout(function () {
          sendBtn.innerHTML = 'Send update <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          sendBtn.style.background = "";
          if (status) status.innerHTML = '<span class="pulse" aria-hidden="true"></span> Drafting';
        }, 2600);
      });
    }
  }

  /* ---------- "Say it your way" panel ---------- */
  var voiceBody = document.getElementById("voiceBody");
  if (voiceBody) {
    var VTONE = {
      Concise: {
        name: "Concise",
        lead: "Team — June was a strong revenue month. MRR is up 14% to $48.2k and we added 27 new logos.",
        highlights: "NRR climbed to 112% and active teams grew 21% to 318 — expansion is doing the heavy lifting.",
        lowlights: "Cash is down 9% and runway ticked to 14 months; we're watching burn closely into Q3.",
        asks: "Two warm intros to Series A leads focused on vertical SaaS would move us forward.",
        hiring: "Closing a founding AE this month; still open for a senior product engineer."
      },
      Detailed: {
        name: "Detailed",
        lead: "Team — sharing the full picture from June. MRR grew 14% month-over-month to $48.2k on the back of 27 new logos across our two core segments.",
        highlights: "Net revenue retention rose to 112% as existing teams expanded, and active teams are up 21% to 318 — expansion revenue outpaced new-logo revenue for the second month running.",
        lowlights: "Cash is down 9% to $1.4M and runway now sits at 14 months. Burn is elevated from the two December hires; we expect it to normalise by Q3.",
        asks: "We'd value two warm intros to Series A leads who focus on vertical SaaS, and any references for a fractional finance lead.",
        hiring: "We're closing a founding account executive this month and remain open for a senior product engineer and a design generalist."
      },
      Punchy: {
        name: "Punchy",
        lead: "Big June. MRR +14% to $48.2k. 27 new logos.",
        highlights: "NRR at 112%. Active teams up 21% to 318. Expansion is carrying us.",
        lowlights: "Cash down 9%, runway at 14 months. Eyes on burn.",
        asks: "Two intros to vertical-SaaS Series A leads. That's the whole ask.",
        hiring: "Founding AE closing. Senior product engineer open."
      },
      Vulnerable: {
        name: "Vulnerable",
        lead: "Team — June was mostly good, with one thing I'm sitting with. Revenue grew 14% to $48.2k, which I'm genuinely proud of.",
        highlights: "Retention held strong at 112% and active teams grew 21% to 318 — the product is landing with the teams we most want.",
        lowlights: "Here's the honest part: cash is down 9% and runway is at 14 months. Burn is heavier than I'd like and it's on my mind daily.",
        asks: "Where I'd really value help: two intros to Series A leads who understand vertical SaaS, and a gut-check on our burn plan.",
        hiring: "We're closing a founding AE, and I'm still looking for a senior product engineer I can lean on."
      }
    };

    var lead = document.getElementById("vpLead");
    var toneName = document.getElementById("voiceToneName");
    var secEls = {};
    voiceBody.querySelectorAll(".vp-sec").forEach(function (p) { secEls[p.getAttribute("data-sec")] = p; });

    function renderVoice(toneKey) {
      var t = VTONE[toneKey] || VTONE.Concise;
      if (lead) lead.textContent = t.lead;
      if (toneName) toneName.textContent = t.name;
      Object.keys(secEls).forEach(function (k) {
        var el = secEls[k];
        var label = el.querySelector(".sec-label");
        var labelText = label ? label.textContent : "";
        el.innerHTML = "";
        if (label) { var l = document.createElement("span"); l.className = "sec-label"; l.textContent = labelText; el.appendChild(l); }
        el.insertAdjacentText("beforeend", t[k] || "");
      });
    }

    var currentTone = "Concise";
    document.querySelectorAll(".chip[data-vtone]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll(".chip[data-vtone]").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        currentTone = chip.getAttribute("data-vtone");
        renderVoice(currentTone);
      });
    });

    document.querySelectorAll(".toggle[data-sec]").forEach(function (tg) {
      tg.addEventListener("click", function () {
        var on = tg.getAttribute("aria-pressed") !== "true";
        tg.setAttribute("aria-pressed", String(on));
        var el = secEls[tg.getAttribute("data-sec")];
        if (el) el.classList.toggle("hidden", !on);
      });
    });
  }

  /* ---------- contact form: label only, never preventDefault ---------- */
  var form = document.querySelector('form[action*="web3forms"]');
  if (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = "Sending…"; btn.disabled = false; }
    });
  }
})();
