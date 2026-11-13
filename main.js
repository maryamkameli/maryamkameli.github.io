/* =========================================================
   Maryam Kameli: site behavior
   Theme toggle, mobile menu, news collapse, nav highlight,
   BibTeX reveal and copy, looping videos, and the
   drag-to-compare video. The page still reads fine without it.
   ========================================================= */
(function () {
  "use strict";

  /* ---- how many news items to show before "Show all" ---- */
  var NEWS_VISIBLE = 5;

  var root = document.documentElement;
  var live = document.getElementById("liveStatus");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function announce(msg) {
    if (!live) return;
    live.textContent = "";
    setTimeout(function () { live.textContent = msg; }, 30);
  }

  /* -------------------------------------------------------
     1. theme toggle (remembers the choice in this browser)
     The saved choice is applied by a tiny script in <head>
     so the page never flashes the wrong theme.
     ------------------------------------------------------- */
  var themeBtn = document.getElementById("themeBtn");
  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function currentTheme() {
    return root.getAttribute("data-theme") || (systemDark && systemDark.matches ? "dark" : "light");
  }
  function labelThemeBtn() {
    if (!themeBtn) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
  }

  if (themeBtn) {
    labelThemeBtn();
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked: fine */ }
      labelThemeBtn();
    });
    if (systemDark && systemDark.addEventListener) {
      systemDark.addEventListener("change", labelThemeBtn);
    }
  }

  /* -------------------------------------------------------
     2. mobile menu
     ------------------------------------------------------- */
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("open"));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenu(false);
      }
    });
  }

  /* -------------------------------------------------------
     3. news: collapse past the first NEWS_VISIBLE items
     ------------------------------------------------------- */
  var newsList = document.getElementById("newsList");
  var newsMore = document.getElementById("newsMore");

  if (newsList && newsMore) {
    var items = Array.prototype.slice.call(newsList.querySelectorAll(".news-item"));
    if (items.length > NEWS_VISIBLE) {
      items.slice(NEWS_VISIBLE).forEach(function (li) { li.hidden = true; });
      newsMore.hidden = false;

      newsMore.addEventListener("click", function () {
        var expanding = items[NEWS_VISIBLE].hidden;
        items.slice(NEWS_VISIBLE).forEach(function (li) { li.hidden = !expanding; });
        newsMore.textContent = expanding ? "Show less" : "Show all news";
        newsMore.setAttribute("aria-expanded", String(expanding));
      });
    }
  }

  /* -------------------------------------------------------
     4. nav: hairline on scroll, highlight the current section
     ------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var targets = navAnchors.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("scrolled", y > 8);
    if (!navAnchors.length) return;

    var current = -1;
    targets.forEach(function (el, i) {
      if (el && el.getBoundingClientRect().top <= 100) current = i;
    });
    /* at the very bottom, the last short section counts as current */
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight > 40;
    if (scrollable && window.innerHeight + y >= doc.scrollHeight - 2) current = targets.length - 1;

    navAnchors.forEach(function (a, i) { a.classList.toggle("active", i === current); });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* -------------------------------------------------------
     5. publications: BibTeX reveal and copy
     ------------------------------------------------------- */
  document.querySelectorAll(".bib-btn").forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute("aria-controls"));
    if (!box) return;
    btn.addEventListener("click", function () {
      var open = box.hidden;
      box.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  document.querySelectorAll(".bib-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = btn.parentNode.querySelector("pre");
      var flash = function (label, msg) {
        btn.textContent = label;
        announce(msg);
        setTimeout(function () { btn.textContent = "Copy"; }, 1600);
      };
      var fallback = function () {
        selectText(pre);
        flash("Selected", "BibTeX selected. Press Control or Command plus C to copy.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent).then(function () {
          flash("Copied", "BibTeX copied to the clipboard.");
        }, fallback);
      } else {
        fallback();
      }
    });
  });

  /* -------------------------------------------------------
     6. looping videos: play while on screen, pause when not.
     Every <video data-autoplay> gets this. A visitor who asks
     for reduced motion sees the poster and a play button.
     ------------------------------------------------------- */
  function toggleFor(video) {
    var box = video.parentNode;
    return box ? box.querySelector(".vid-toggle") : null;
  }

  function syncToggle(video) {
    var btn = toggleFor(video);
    if (!btn) return;
    var paused = video.paused;
    btn.classList.toggle("is-paused", paused);
    btn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
  }

  function tryPlay(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () { syncToggle(video); });
  }

  var loopers = Array.prototype.slice.call(document.querySelectorAll("video[data-autoplay]"));

  loopers.forEach(function (video) {
    video.muted = true; /* needed for autoplay on phones */
    video.addEventListener("play", function () { syncToggle(video); });
    video.addEventListener("pause", function () { syncToggle(video); });
    syncToggle(video);

    var btn = toggleFor(video);
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (video.paused) {
          video.dataset.userPaused = "";
          tryPlay(video);
        } else {
          video.dataset.userPaused = "1";
          video.pause();
        }
      });
    }
  });

  if (loopers.length) {
    if ("IntersectionObserver" in window) {
      /* watch the visible box (the comparison video is twice as tall
         as what shows), then map it back to its video */
      var boxToVideo = new Map();
      loopers.forEach(function (v) { boxToVideo.set(v.closest(".wipe-stage, .clip-media") || v, v); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = boxToVideo.get(en.target);
          if (!v) return;
          if (en.isIntersecting) {
            if (!reduceMotion && !v.dataset.userPaused) tryPlay(v);
          } else if (!v.paused) {
            v.pause();
          }
        });
      }, { threshold: 0.2 });
      boxToVideo.forEach(function (v, box) { io.observe(box); });
    } else if (!reduceMotion) {
      loopers.forEach(tryPlay);
    }
  }

  /* -------------------------------------------------------
     7. drag-to-compare video
     The video file holds two frames stacked vertically: full
     color on top, the sketch rendering below. The <video> shows
     the top frame; this draws the bottom frame onto a canvas,
     but only to the right of the handle. Both halves come from
     the same decoded frame, so they never drift apart.
     ------------------------------------------------------- */
  function initWipe(fig) {
    var stage = fig.querySelector(".wipe-stage");
    var video = stage.querySelector("video");
    var canvas = stage.querySelector("canvas");
    var knob = stage.querySelector(".wipe-knob");
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;

    var pos = 0.5;
    var touched = false;
    var poster = new Image();
    poster.decoding = "async";
    poster.src = video.getAttribute("poster");

    function frameSource() {
      if (video.readyState >= 2 && video.videoWidth) {
        return { el: video, w: video.videoWidth, h: video.videoHeight };
      }
      if (poster.complete && poster.naturalWidth) {
        return { el: poster, w: poster.naturalWidth, h: poster.naturalHeight };
      }
      return null;
    }

    function draw() {
      var cw = canvas.width, ch = canvas.height;
      if (!cw || !ch) return;
      ctx.clearRect(0, 0, cw, ch);
      var src = frameSource();
      if (!src) return;
      var x = Math.round(pos * cw);
      if (x >= cw) return;
      var half = src.h / 2;              /* the sketch frame is the bottom half */
      var sx = (x / cw) * src.w;
      try {
        ctx.drawImage(src.el, sx, half, src.w - sx, half, x, 0, cw - x, ch);
      } catch (e) { /* frame not ready yet */ }
    }

    function resize() {
      var r = stage.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(r.width * dpr));
      var h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      draw();
    }

    function setPos(p) {
      pos = Math.max(0, Math.min(1, p));
      var pct = Math.round(pos * 100);
      stage.style.setProperty("--pos", (pos * 100).toFixed(2) + "%");
      knob.setAttribute("aria-valuenow", String(pct));
      knob.setAttribute("aria-valuetext", pct + " percent from the left");
      draw();
    }

    /* redraw on every new video frame */
    var hasRVFC = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    var rafId = 0;
    function onVideoFrame() {
      draw();
      video.requestVideoFrameCallback(onVideoFrame);
    }
    function rafLoop() {
      draw();
      rafId = video.paused ? 0 : requestAnimationFrame(rafLoop);
    }
    if (hasRVFC) {
      video.requestVideoFrameCallback(onVideoFrame);
    } else {
      video.addEventListener("play", function () { if (!rafId) rafId = requestAnimationFrame(rafLoop); });
    }
    ["loadeddata", "seeked", "pause"].forEach(function (ev) { video.addEventListener(ev, draw); });
    poster.addEventListener("load", draw);

    /* pointer: drag anywhere on the video */
    var dragging = false;
    function posFromEvent(e) {
      var r = stage.getBoundingClientRect();
      return (e.clientX - r.left) / r.width;
    }
    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest(".vid-toggle")) return;
      dragging = true;
      touched = true;
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* old browsers */ }
      setPos(posFromEvent(e));
    });
    stage.addEventListener("pointermove", function (e) {
      if (dragging) setPos(posFromEvent(e));
    });
    function endDrag() { dragging = false; }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("lostpointercapture", endDrag);

    /* keyboard on the handle */
    knob.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 0.1 : 0.04;
      var next = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = pos - step;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = pos + step;
      else if (e.key === "PageDown") next = pos - 0.2;
      else if (e.key === "PageUp") next = pos + 0.2;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 1;
      if (next !== null) {
        e.preventDefault();
        touched = true;
        setPos(next);
      }
    });

    /* a short sweep the first time it scrolls into view, so it is
       obvious the handle moves */
    function hint() {
      if (reduceMotion || touched) return;
      var start = null, dur = 1700;
      function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
      function step(ts) {
        if (touched) return;
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        /* 0.5 -> 0.3 -> 0.7 -> 0.5 */
        var p;
        if (t < 0.3) p = 0.5 - 0.2 * ease(t / 0.3);
        else if (t < 0.75) p = 0.3 + 0.4 * ease((t - 0.3) / 0.45);
        else p = 0.7 - 0.2 * ease((t - 0.75) / 0.25);
        setPos(p);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          seen.disconnect();
          setTimeout(hint, 700);
        }
      }, { threshold: 0.6 });
      seen.observe(stage);
    }

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);
    resize();
  }

  document.querySelectorAll("[data-wipe]").forEach(initWipe);
})();
