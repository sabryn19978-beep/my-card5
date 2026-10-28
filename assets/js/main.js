/* ==========================================================================
   معرض أعمال صابرين — الحركة والتفاعل
   أسلوب كانفا: ظهور متدرّج، ارتداد لطيف، ميلان ثلاثي الأبعاد، توهج يتبع المؤشر
   ========================================================================== */

document.documentElement.classList.add("js");

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var qs = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var qsa = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function ready(fn) {
    if (document.readyState !== "loading") { fn(); }
    else { document.addEventListener("DOMContentLoaded", fn); }
  }

  /* ------------------------------------------------------------------
     1) شاشة التحميل
  ------------------------------------------------------------------ */
  function initPreloader() {
    var pre = qs(".preloader");
    if (!pre) return;
    if (reduceMotion) { pre.remove(); return; }

    var hide = function () {
      pre.classList.add("is-done");
      document.body.classList.add("is-loaded");
      setTimeout(function () { pre.remove(); }, 600);
    };

    window.addEventListener("load", function () { setTimeout(hide, 550); });
    // شبكة أمان لو لم يُطلق حدث load
    setTimeout(hide, 3200);
  }

  /* ------------------------------------------------------------------
     2) توهج يتبع المؤشر
  ------------------------------------------------------------------ */
  function initCursorGlow() {
    var glow = qs(".cursor-glow");
    if (!glow || reduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var target = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };
    var started = false;

    window.addEventListener("pointermove", function (e) {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        started = true;
        pos.x = target.x;
        pos.y = target.y;
        document.documentElement.classList.add("has-pointer");
      }
    }, { passive: true });

    (function loop() {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      glow.style.transform = "translate3d(" + pos.x + "px," + pos.y + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------
     3) شريط تقدّم التمرير + حالة الترويسة + زر أعلى الصفحة
  ------------------------------------------------------------------ */
  function initScrollUI() {
    var bar = qs(".scroll-progress span");
    var header = qs(".site-header");
    var toTop = qs(".to-top");

    var ticking = false;

    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        var pct = max > 0 ? (y / max) * 100 : 0;
        bar.style.width = pct.toFixed(2) + "%";
      }

      if (header) header.classList.toggle("is-stuck", y > 24);

      if (toTop) toTop.classList.toggle("is-visible", y > 520);

      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    window.addEventListener("resize", update, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* ------------------------------------------------------------------
     4) قائمة الجوال
  ------------------------------------------------------------------ */
  function initNavToggle() {
    var toggle = qs(".nav-toggle");
    var nav = qs(".site-nav");
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 780) close();
    });
  }

  /* ------------------------------------------------------------------
     5) تقسيم العناوين إلى كلمات (حركة كانفا)
        يمرّ على عُقد النص فقط، فيحافظ على أي وسوم داخل العنوان
  ------------------------------------------------------------------ */
  function initSplitText() {
    var nodes = qsa("[data-split]");

    nodes.forEach(function (root) {
      if (root.dataset.splitDone === "1") return;
      root.dataset.splitDone = "1";

      var baseDelay = parseInt(root.getAttribute("data-split-delay") || "0", 10);
      var step = parseInt(root.getAttribute("data-split-step") || "75", 10);

      // جمع عُقد النص غير الفارغة
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var texts = [];
      var n;
      while ((n = walker.nextNode())) {
        if (n.nodeValue && n.nodeValue.trim()) texts.push(n);
      }

      var idx = 0;

      texts.forEach(function (textNode) {
        var frag = document.createDocumentFragment();
        var parts = textNode.nodeValue.split(/(\s+)/);

        parts.forEach(function (part) {
          if (!part) return;

          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }

          var wrap = document.createElement("span");
          wrap.className = "split-word-wrap";

          var word = document.createElement("span");
          word.className = "split-word";
          word.style.setProperty("--wd", (baseDelay + idx * step) + "ms");
          word.textContent = part;

          wrap.appendChild(word);
          frag.appendChild(wrap);
          idx++;
        });

        textNode.parentNode.replaceChild(frag, textNode);
      });
    });
  }

  /* ------------------------------------------------------------------
     6) الظهور التدريجي عند التمرير
  ------------------------------------------------------------------ */
  function initReveal() {
    var items = qsa("[data-reveal]");

    // تأخير متدرّج داخل المجموعة الواحدة (data-reveal-group)
    qsa("[data-reveal-group]").forEach(function (group) {
      qsa("[data-reveal]", group).forEach(function (child, i) {
        child.style.setProperty("--d", (i * 110) + "ms");
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -70px 0px" });

    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top <= window.innerHeight * 0.92) {
        el.classList.add("is-revealed");
      } else {
        io.observe(el);
      }
    });

    // المحتوى المقسّم يظهر تلقائياً عند دخوله
    var splitIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          splitIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    qsa("[data-split]").forEach(function (el) { splitIO.observe(el); });
  }

  /* ------------------------------------------------------------------
     7) تأثيرميلان البطاقات (3D) + إضاءة تتبع المؤشر
  ------------------------------------------------------------------ */
  function initTilt() {
    if (reduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    qsa(".tpl-card").forEach(function (card) {
      var MAX = 7;
      var raf = null;

      function move(e) {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;

          var ry = (px - 0.5) * MAX * 2;
          var rx = -(py - 0.5) * MAX * 2;

          card.style.transform =
            "translateY(-12px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(1.02)";
        });
      }

      function reset() {
        card.style.transition = "transform .6s cubic-bezier(.22,.68,0,1), box-shadow .5s, border-color .4s";
        card.style.transform = "translateY(0) rotateX(0) rotateY(0) scale(1)";
        setTimeout(function () { card.style.transition = ""; }, 620);
      }

      card.style.transition = "transform .12s linear, box-shadow .5s, border-color .4s";
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", reset);
    });
  }

  /* ------------------------------------------------------------------
     8) الأزرار «المغناطيسية»
  ------------------------------------------------------------------ */
  function initMagnetic() {
    if (reduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    qsa(".btn--primary, .btn--dark, .btn--snow").forEach(function (btn) {
      var raf = null;

      btn.addEventListener("pointermove", function (e) {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var r = btn.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          btn.style.transform =
            "translate(" + (dx * 0.22).toFixed(1) + "px," + (dy * 0.32).toFixed(1) + "px) scale(1.05)";
        });
      });

      btn.addEventListener("pointerleave", function () {
        btn.style.transition = "transform .55s cubic-bezier(.34,1.56,.64,1), box-shadow .4s";
        btn.style.transform = "translate(0,0) scale(1)";
        setTimeout(function () { btn.style.transition = ""; }, 580);
      });
    });
  }

  /* ------------------------------------------------------------------
     9) عدّاد الأرقام
  ------------------------------------------------------------------ */
  function initCounters() {
    var nums = qsa("[data-count]");
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      if (reduceMotion) { el.textContent = target.toLocaleString("ar-EG"); return; }

      var dur = 1500;
      var start = null;

      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var value = Math.round(target * eased);

        el.textContent = value.toLocaleString("ar-EG") + (p === 1 ? el.getAttribute("data-suffix") || "" : "");
        if (p < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { io.observe(n); });
  }

  /* ------------------------------------------------------------------
     10) parall ache خفيف للغلاف
  ------------------------------------------------------------------ */
  function initParallax() {
    if (reduceMotion) return;

    var targets = qsa("[data-parallax]");
    if (!targets.length) return;

    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      targets.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        var mid = r.top + r.height / 2;
        var offset = (mid - vh / 2) * speed;
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    update();
  }

  /* ------------------------------------------------------------------
     11) نسخ إلى الحافظة + تنبيه
  ------------------------------------------------------------------ */
  var toastTimer = null;

  function showToast(msg) {
    var t = qs(".toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 2400);
  }

  function initCopy() {
    qsa("[data-copy]").forEach(function (el) {
      el.addEventListener("click", function () {
        var value = el.getAttribute("data-copy");
        var done = function () { showToast("تم نسخ: " + value); };
        var fail = function () { showToast("تعذّر النسخ، انسخه يدويًا"); };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value).then(done).catch(fail);
        } else {
          var ta = document.createElement("textarea");
          ta.value = value;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (err) { fail(); }
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     12) نموذج التواصل → رسالة واتساب
  ------------------------------------------------------------------ */
  function initContactForm() {
    var form = qs("#contactForm");
    if (!form) return;

    var PHONE = form.getAttribute("data-phone") || "966571828519";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var get = function (n) {
        var el = form.elements[n];
        return el ? el.value.trim() : "";
      };

      var name = get("name");
      var contact = get("contact");
      var service = get("service");
      var message = get("message");

      var text =
        "السلام عليكم 👋\n\n" +
        "أنا: " + name + "\n" +
        (contact ? "تواصل معي على: " + contact + "\n" : "") +
        (service ? "نوع الطلب: " + service + "\n" : "") +
        "\n" + message;

      var url = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");

      showToast("تم فتح واتساب برسالتك ✨");
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     12ب) تصفية المشاريع (طابع قوالب كانفا)
  ------------------------------------------------------------------ */
  function initFilter() {
    var bar = qs(".filters");
    var grid = qs("#projectsGrid");
    if (!bar || !grid) return;

    var buttons = qsa(".filter", bar);
    var cards = qsa("[data-cat]", grid);

    function apply(value) {
      cards.forEach(function (card) {
        var cats = (card.getAttribute("data-cat") || "").split(/\s+/);
        var show = value === "all" || cats.indexOf(value) !== -1;
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("is-revealed");
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        apply(btn.getAttribute("data-filter") || "all");
      });
    });
  }

  /* ------------------------------------------------------------------
     13) سنة الفوتر
  ------------------------------------------------------------------ */
  function initYear() {
    qsa("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     14) إبراز الرابط النشط في التذييل حسب الصفحة
  ------------------------------------------------------------------ */
  function initActiveLinks() {
    var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    qsa("[data-nav]").forEach(function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (href === file || (file === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ------------------------------------------------------------------
     التشغيل
  ------------------------------------------------------------------ */
  ready(function () {
    initSplitText();
    initPreloader();
    initCursorGlow();
    initScrollUI();
    initNavToggle();
    initReveal();
    initTilt();
    initMagnetic();
    initCounters();
    initParallax();
    initCopy();
    initContactForm();
    initFilter();
    initYear();
    initActiveLinks();
  });
})();