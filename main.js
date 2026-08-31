/* =========================================================
   Maryam Kameli — site behavior
   Three small things: theme toggle, mobile menu, news collapse.
   The page works fine without any of it.
   ========================================================= */
(function () {
  "use strict";

  /* ---- how many news items to show before "Show all" ---- */
  var NEWS_VISIBLE = 5;

  /* -------------------------------------------------------
     1. theme toggle (remembers the choice in this browser)
     ------------------------------------------------------- */
  var root = document.documentElement;

  try {
    var saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) { /* private mode, storage blocked: just use the system setting */ }

  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var current = root.getAttribute("data-theme") || (systemDark ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* -------------------------------------------------------
     2. mobile menu
     ------------------------------------------------------- */
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
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
      });
    }
  }

  /* -------------------------------------------------------
     4. nav: hairline on scroll, highlight the current section
     ------------------------------------------------------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var navAnchors = document.querySelectorAll(".nav-links a[href^='#']");
  var sections = [];
  navAnchors.forEach(function (a) {
    var el = document.querySelector(a.getAttribute("href"));
    if (el) sections.push({ el: el, link: a });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) { a.classList.remove("active"); });
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (match) match.link.classList.add("active");
      });
    }, { rootMargin: "-64px 0px -70% 0px", threshold: 0 });

    sections.forEach(function (s) { io.observe(s.el); });
  }
})();
