(function () {
  "use strict";

  // Sem dados locais: a pagina e 100% movida a data.json.
  var FALLBACK = {};
  var DB = null;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var getPath = function (o, p) {
    return p.split(".").reduce(function (a, k) { return a == null ? undefined : a[k]; }, o);
  };
  var isSet = function (v) { return v !== undefined && v !== null && v !== ""; };

  function fill(el, val) {
    if (!el) return;
    if (isSet(val)) el.textContent = val;
    else el.setAttribute("data-empty", "true");
  }

  function hide(sel) {
    var el = $(sel);
    if (el) el.classList.add("hidden");
  }

  var ICONS = {
    instagram: "bi-instagram",
    facebook: "bi-facebook",
    linkedin: "bi-linkedin",
    youtube: "bi-youtube",
    whatsapp: "bi-whatsapp",
    tiktok: "bi-tiktok",
    x: "bi-twitter-x",
    email: "bi-envelope",
    phone: "bi-telephone",
    address: "bi-geo-alt",
    hours: "bi-clock"
  };

  function renderBase() {
    if (isSet(DB.lang)) document.documentElement.lang = DB.lang;
    if (isSet(DB.htmlTitle)) document.title = DB.htmlTitle;
    else if (DB.brand && isSet(DB.brand.name)) document.title = DB.brand.name + " | " + (DB.brand.tagline || "Publicidade digital e tráfego");
    var meta = $('meta[name="description"]');
    if (meta && isSet(DB.metaDescription)) meta.setAttribute("content", DB.metaDescription);
  }

  function renderNav() {
    var list = $("#navList");
    var items = DB.nav || [];
    if (!items.length) { hide("#siteNav"); return; }
    list.innerHTML = items.map(function (it) {
      return '<li><a href="' + it.href + '" data-scroll>' + it.label + "</a></li>";
    }).join("");
  }

  function renderHero() {
    var h = DB.hero || {};
    fill($("[data-replace='hero.badge']"), h.badge);
    fill($("[data-replace='hero.title']"), h.title);
    fill($("[data-replace='hero.subtitle']"), h.subtitle);
    if (h.ctaPrimary && isSet(h.ctaPrimary.label)) {
      $("#ctaPrimary").textContent = h.ctaPrimary.label;
      if (isSet(h.ctaPrimary.href)) $("#ctaPrimary").setAttribute("href", h.ctaPrimary.href);
    } else $("#ctaPrimary").classList.add("hidden");
    if (h.ctaSecondary && isSet(h.ctaSecondary.label)) {
      $("#ctaSecondary").textContent = h.ctaSecondary.label;
      if (isSet(h.ctaSecondary.href)) $("#ctaSecondary").setAttribute("href", h.ctaSecondary.href);
    } else $("#ctaSecondary").classList.add("hidden");

    var words = h.rotating || [];
    if (words.length) startRotate(words);
    else hide("#rotateWrap");

    var stats = h.stats || [];
    var wrap = $("#heroStats");
    if (!stats.length) { hide("#heroStatsWrap"); return; }
    wrap.innerHTML = stats.map(function (s) {
      var v = typeof s.value === "number" ? s.value : 0;
      return '<div class="stat"><b data-count="' + v + '" data-suffix="' + (s.suffix || "") + '">0</b><span>' + (s.label || "") + "</span></div>";
    }).join("");
  }

  function renderMarquee() {
    var items = DB.marquee || [];
    if (!items.length) { hide("#marqueeWrap"); return; }
    var inner = items.map(function (m) { return "<li>" + m + "</li>"; }).join("");
    $("#marqueeTrack").innerHTML = inner + inner;
  }

  function renderSections() {
    var secs = DB.sections || {};
    renderSectionHead("servicos", secs.services);
    renderSectionHead("metodo", secs.method);
    renderSectionHead("diferenciais", secs.differentials);
    renderSectionHead("resultados", secs.results);
    renderSectionHead("faq", secs.faq);
  }

  function renderSectionHead(id, data) {
    if (!data) { hide("#" + id + "Head"); return; }
    var head = $("#" + id + "Head");
    fill(head.querySelector(".kicker"), data.kicker);
    fill(head.querySelector(".section-title"), data.title);
    fill(head.querySelector(".section-sub"), data.subtitle);
    if (!isSet(data.title)) head.classList.add("hidden");
  }

  function renderLists() {
    var svc = DB.services || [];
    var list = $("#serviceList");
    if (!svc.length) {
      hide("#servicos");
    } else {
      list.innerHTML = svc.map(function (s, i) {
        var n = String(i + 1).padStart(2, "0");
        return '<li class="service reveal"><span class="service-num">' + n + '</span><div><h3>' + s.title + "</h3><p>" + s.text + '</p></div><span class="service-arrow"><i class="bi bi-arrow-up-right" aria-hidden="true"></i></span></li>';
      }).join("");
    }

    var steps = DB.method || [];
    if (!steps.length) {
      hide("#metodo");
    } else {
      $("#methodList").innerHTML = steps.map(function (s, i) {
        var n = String(i + 1).padStart(2, "0");
        return '<li class="method-step reveal" data-d="' + (i % 2) + '"><span class="method-ghost" aria-hidden="true">' + n + '</span><span class="method-num">Etapa ' + n + "</span><h3>" + s.title + "</h3><p>" + s.text + "</p></li>";
      }).join("");
    }

    var diffs = DB.differentials || [];
    if (!diffs.length) {
      hide("#diferenciais");
    } else {
      $("#diffList").innerHTML = diffs.map(function (d) {
        return '<li class="diff reveal"><span class="diff-mark"><i>✓</i></span><div><h3>' + d.title + "</h3><p>" + d.text + "</p></div></li>";
      }).join("");
      var dc = DB.diffCta;
      if (dc && isSet(dc.label)) {
        var dl = $("#diffsCta");
        dl.textContent = dc.label;
        if (isSet(dc.href)) dl.setAttribute("href", dc.href);
      } else $("#diffsCta").classList.add("hidden");
    }

    var tst = DB.testimonials || [];
    if (!tst.length) {
      hide("#resultados");
    } else {
      $("#testimonialList").innerHTML = tst.map(function (t) {
        return '<figure class="tst reveal"><blockquote class="tst-text">' + t.text + '</blockquote><figcaption class="tst-author"><span class="tst-avatar">' + t.name.charAt(0) + '</span><span><span class="tst-name">' + t.name + '</span><br><span class="tst-role">' + (t.role || "") + "</span></span></figcaption></figure>";
      }).join("");
    }

    var faqs = DB.faq || [];
    if (!faqs.length) {
      hide("#duvidas");
    } else {
      $("#faqList").innerHTML = faqs.map(function (f) {
        return '<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false"><span>' + f.q + '</span><span class="faq-ico"><i class="bi bi-plus-lg" aria-hidden="true"></i></span></button><div class="faq-a"><p>' + f.a + "</p></div></div>";
      }).join("");
      initAccordion();
    }
  }

  function renderCta() {
    var c = DB.cta || {};
    fill($("[data-replace='cta.title']"), c.title);
    fill($("[data-replace='cta.text']"), c.text);
    var btn = $("#ctaBtn");
    var b = c.button || {};
    if (isSet(b.label)) {
      btn.textContent = b.label;
      var link = null;
      if (DB.contact && isSet(DB.contact.whatsapp)) {
        link = "https://wa.me/" + DB.contact.whatsapp;
        btn.setAttribute("target", "_blank");
      } else if (DB.contact && isSet(DB.contact.email)) {
        link = "mailto:" + DB.contact.email;
      }
      if (link) btn.setAttribute("href", link);
      else if (isSet(b.href)) btn.setAttribute("href", b.href);
      else btn.classList.add("hidden");
    } else btn.classList.add("hidden");
  }

  function renderFooter() {
    var f = DB.footer || {};
    fill($("[data-replace='footer.about']"), f.about);
    fill($("[data-replace='footer.note']"), f.note);
    fill($("[data-replace='footer.linksTitle']"), f.linksTitle);
    var fl = $("#footerLinks");
    var links = (DB.nav || []).filter(function (l) { return isSet(l.href); });
    if (!links.length) { hide("#footerLinksCol"); }
    else {
      fl.innerHTML = links.map(function (l) {
        return '<li><a href="' + l.href + '" data-scroll>' + l.label + "</a></li>";
      }).join("");
    }

    var social = (DB.social || []).filter(function (s) { return s && isSet(s.url) && ICONS[s.slug]; });
    var sl = $("#socialList");
    if (!social.length) { sl.classList.add("hidden"); }
    else {
      sl.innerHTML = social.map(function (s) {
        return '<li><a href="' + s.url + '" target="_blank" rel="noopener" aria-label="' + s.slug + '"><i class="bi ' + ICONS[s.slug] + '" aria-hidden="true"></i></a></li>';
      }).join("");
    }

    var ct = DB.contact || {};
    var pairs = [
      { key: "email", el: $("#contactEmail"), href: ct.email ? "mailto:" + ct.email : "", text: ct.email },
      { key: "phone", el: $("#contactPhone"), href: ct.phone ? "tel:" + String(ct.phone).replace(/[^\d+]/g, "") : "", text: ct.phone },
      { key: "address", el: $("#contactAddress"), href: "", text: ct.address },
      { key: "hours", el: $("#contactHours"), href: "", text: ct.hours }
    ];
    var any = false;
    pairs.forEach(function (p) {
      var li = p.el.closest("li");
      if (!isSet(p.text)) { li.remove(); return; }
      any = true;
      var tag = p.href ? "a" : "span";
      if (p.href) { p.el.setAttribute("href", p.href); }
      var icon = '<i class="bi ' + ICONS[p.key] + '" aria-hidden="true"></i>';
      li.innerHTML = icon + "<" + tag + ">" + p.text + "</" + tag + ">";
    });
    if (!any) hide("#footerContactCol");

    var wa = DB.contact && DB.contact.whatsapp;
    if (!isSet(wa)) { $("#waFloat").classList.add("hidden"); }
    else { $("#waFloat").setAttribute("href", "https://wa.me/" + wa); }

    var bar = $("#copyright");
    var year = new Date().getFullYear();
    bar.textContent = (year) + " " + (DB.brand && DB.brand.name ? DB.brand.name : "ADSTRIA") + ". Todos os direitos reservados.";
  }

  /* ---------- Tema claro / escuro ---------- */
  function initTheme() {
    var toggle = $("#themeToggle");
    toggle.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("adstria-theme", next); } catch (e) {}
      if (window.__fx) window.__fx.recolor();
    });
  }

  /* ---------- Palavra rotativa do hero ---------- */
  function startRotate(words) {
    var el = $("#rotateWord");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.classList.add("is-typing");
    if (reduced) { el.textContent = words.join(" / "); return; }
    var i = 0;
    function typeWord(word, done) {
      var k = 0;
      (function tick() {
        el.textContent = word.slice(0, ++k);
        if (k < word.length) setTimeout(tick, 65);
        else setTimeout(done, 1900);
      })();
    }
    function eraseWord(done) {
      var txt = el.textContent;
      var k = txt.length;
      (function tick() {
        el.textContent = txt.slice(0, --k);
        if (k > 0) setTimeout(tick, 28);
        else setTimeout(done, 320);
      })();
    }
    function cycle() {
      typeWord(words[i], function () {
        eraseWord(function () {
          i = (i + 1) % words.length;
          cycle();
        });
      });
    }
    cycle();
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        animateCount(en.target);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      var v = target * ease;
      el.textContent = (target % 1 !== 0 ? v.toFixed(1) : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Reveal no scroll ---------- */
  function initReveal() {
    var els = $$(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });

    var art = $(".hero-art");
    if (art) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { art.classList.add("is-live"); io2.unobserve(art); }
        });
      }, { threshold: 0.2 });
      io2.observe(art);
    }
  }

  /* ---------- Header no scroll + progresso ---------- */
  function initHeader() {
    var header = $("#siteHeader");
    var bar = $("#scrollProgress");
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        header.classList.toggle("is-scrolled", y > 10);
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var btn = $("#menuToggle");
    btn.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("#siteNav a[data-scroll]").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    function closeMenu() {
      document.body.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
    }
  }

  /* ---------- FAQ accordion ---------- */
  function initAccordion() {
    $$(".faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var open = item.classList.contains("is-open");
        $$(".faq-item.is-open").forEach(function (o) {
          o.classList.remove("is-open");
          o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }
  /* ---------- Partículas ---------- */
  function initParticles(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W, H, pts, raf, running = true;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mouse = { x: -9999, y: -9999 };

    function cssVar(name) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || "#30DAD0";
    }

    function resize() {
      var box = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = Math.floor(box.width * (window.devicePixelRatio || 1));
      H = canvas.height = Math.floor(box.height * (window.devicePixelRatio || 1));
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      var n = W < 700 ? 34 : W < 1100 ? 52 : 70;
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * (W / (window.devicePixelRatio || 1)), y: Math.random() * (H / (window.devicePixelRatio || 1)), vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + .8 });
      }
      if (reduced) { draw(); running = false; }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var color = cssVar("--brand");
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > (W / (window.devicePixelRatio || 1))) p.vx *= -1;
        if (p.y < 0 || p.y > (H / (window.devicePixelRatio || 1))) p.vy *= -1;
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 8100) { p.x += dx * .015; p.y += dy * .015; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j];
          var d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.globalAlpha = (1 - d / 120) * .22;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = .8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    function loop() {
      if (!running) return;
      draw();
      raf = requestAnimationFrame(loop);
    }

    function recolor() { if (!reduced && running) {} }

    var ro = new ResizeObserver(function () { resize(); });
    ro.observe(canvas.parentElement);
    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    window.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });

    resize();
    loop();
    return { recolor: recolor };
  }

  /* ---------- Ancoras suaves (fallback) ---------- */
  function initAnchors() {
    $$('a[data-scroll]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        var target = $(href);
        if (!target) return;
        e.preventDefault();
        if (document.documentElement.scrollBehavior !== "smooth") {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.hash = href;
        }
        closeMenuMobile();
      });
    });
  }

  function closeMenuMobile() {
    document.body.classList.remove("menu-open");
    var btn = $("#menuToggle");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  /* ---------- Boot ---------- */
  function start() {
    renderBase();
    renderNav();
    renderHero();
    renderMarquee();
    renderSections();
    renderLists();
    renderCta();
    renderFooter();
    initTheme();
    initCounters();
    initReveal();
    initHeader();
    initMenu();
    initAnchors();
    window.__fx = initParticles($("#fxCanvas"));
  }

  fetch("data.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(function (data) { DB = data; start(); })
    .catch(function () { DB = FALLBACK; start(); });
})();
