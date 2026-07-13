(function () {
  'use strict';

  /* ==========================================================================
     TWISTED — Premium Concepts Shared Behaviour
     Supports both the legacy (concept-1) markup and the BEM markup used by
     concept-2 … concept-5. Every feature below checks for the presence of
     the relevant elements before wiring up, so this single file works
     unmodified across all five concept pages.
     ========================================================================== */

  var doc = document;

  /* --------------------------------------------------------------------
     1. Header scroll state — adds .pc-header--scrolled to any .pc-header
     -------------------------------------------------------------------- */
  (function headerScroll() {
    var header = doc.querySelector('.pc-header');
    if (!header) return;

    var THRESHOLD = 24;

    function onScroll() {
      if (window.scrollY > THRESHOLD) {
        header.classList.add('pc-header--scrolled');
      } else {
        header.classList.remove('pc-header--scrolled');
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* --------------------------------------------------------------------
     2. Mobile navigation toggle
        - BEM: [data-pc-mobile-toggle] + .pc-header__nav
        - Legacy: #pcMenuToggle + #pcNavRow
     -------------------------------------------------------------------- */
  (function mobileNav() {
    var toggle = doc.querySelector('[data-pc-mobile-toggle]') || doc.getElementById('pcMenuToggle');
    var nav = doc.querySelector('.pc-header__nav') || doc.getElementById('pcNavRow');
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    /* Close mobile nav if the viewport grows back to desktop size */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  })();

  /* --------------------------------------------------------------------
     3. Mega menu
        - BEM: [data-pc-mega-trigger] toggles [hidden] on .pc-mega__panel
          and .is-open on the parent .pc-mega
        - Legacy: #pcProductsTrigger toggles .mega-open on #pcNavRow
     -------------------------------------------------------------------- */
  (function megaMenu() {
    var isMobile = function () { return window.innerWidth <= 900; };

    /* --- BEM mega trigger(s) --- */
    var megaTriggers = doc.querySelectorAll('[data-pc-mega-trigger]');
    megaTriggers.forEach(function (trigger) {
      var mega = trigger.closest('.pc-mega');
      var panel = mega ? mega.querySelector('.pc-mega__panel') : null;
      if (!mega || !panel) return;

      function closeMega() {
        panel.setAttribute('hidden', '');
        mega.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      function openMega() {
        panel.removeAttribute('hidden');
        mega.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      trigger.addEventListener('click', function (e) {
        if (isMobile()) {
          e.preventDefault();
          if (panel.hasAttribute('hidden')) openMega();
          else closeMega();
        }
      });

      mega.addEventListener('mouseenter', function () {
        if (!isMobile()) openMega();
      });
      mega.addEventListener('mouseleave', function () {
        if (!isMobile()) closeMega();
      });

      trigger.addEventListener('focus', function () {
        if (!isMobile()) openMega();
      });

      doc.addEventListener('click', function (e) {
        if (!isMobile() && !mega.contains(e.target)) closeMega();
      });

      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMega();
      });
    });

    /* --- Legacy #pcProductsTrigger + #pcNavRow.mega-open --- */
    var legacyTrigger = doc.getElementById('pcProductsTrigger');
    var legacyNavRow = doc.getElementById('pcNavRow');
    var legacyMega = doc.getElementById('pcMegaMenu');
    if (legacyTrigger && legacyNavRow && legacyMega) {
      var legacyNavItem = legacyTrigger.closest('.pc-nav-item');
      var closeTimer = null;

      function openLegacyMega() {
        if (isMobile()) return;
        clearTimeout(closeTimer);
        legacyNavRow.classList.add('mega-open');
        if (legacyNavItem) legacyNavItem.classList.add('is-open');
        legacyTrigger.setAttribute('aria-expanded', 'true');
      }

      function closeLegacyMega() {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(function () {
          legacyNavRow.classList.remove('mega-open');
          if (legacyNavItem) legacyNavItem.classList.remove('is-open');
          legacyTrigger.setAttribute('aria-expanded', 'false');
        }, 120);
      }

      /* Desktop: hover Products or the mega panel only (not auto / always open) */
      if (legacyNavItem) {
        legacyNavItem.addEventListener('mouseenter', openLegacyMega);
        legacyNavItem.addEventListener('mouseleave', closeLegacyMega);
      }
      legacyMega.addEventListener('mouseenter', openLegacyMega);
      legacyMega.addEventListener('mouseleave', closeLegacyMega);

      /* Mobile: tap to toggle */
      legacyTrigger.addEventListener('click', function (e) {
        if (!isMobile()) return;
        e.preventDefault();
        var open = legacyNavRow.classList.toggle('mega-open');
        if (legacyNavItem) legacyNavItem.classList.toggle('is-open', open);
        legacyTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          clearTimeout(closeTimer);
          legacyNavRow.classList.remove('mega-open');
          if (legacyNavItem) legacyNavItem.classList.remove('is-open');
          legacyTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  })();

  /* --------------------------------------------------------------------
     4. FAQ accordion
        - BEM: .pc-faq__trigger + .pc-faq__panel (uses [hidden])
        - Legacy: .pc-faq-trigger + .pc-faq-panel (uses is-open / grid rows)
     -------------------------------------------------------------------- */
  (function faqAccordion() {
    /* BEM */
    doc.querySelectorAll('.pc-faq__trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.pc-faq__item');
        if (!item) return;
        var panel = item.querySelector('.pc-faq__panel');
        var isOpen = item.classList.contains('is-open');

        doc.querySelectorAll('.pc-faq__item').forEach(function (el) {
          el.classList.remove('is-open');
          var t = el.querySelector('.pc-faq__trigger');
          var p = el.querySelector('.pc-faq__panel');
          if (t) t.setAttribute('aria-expanded', 'false');
          if (p) p.setAttribute('hidden', '');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          if (panel) panel.removeAttribute('hidden');
        }
      });
    });

    /* Legacy */
    doc.querySelectorAll('.pc-faq-trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.pc-faq-item');
        if (!item) return;
        var isOpen = item.classList.contains('is-open');

        doc.querySelectorAll('.pc-faq-item').forEach(function (el) {
          el.classList.remove('is-open');
          var t = el.querySelector('.pc-faq-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();

  /* --------------------------------------------------------------------
     5. Product actions — wishlist / compare / quick view
        - BEM: [data-pc-toggle] (wishlist or compare), [data-pc-quickview]
        - Legacy: [data-wishlist]
     -------------------------------------------------------------------- */
  (function productActions() {
    doc.querySelectorAll('[data-pc-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var active = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', active ? 'false' : 'true');
        btn.classList.toggle('is-active', !active);
      });
    });

    doc.querySelectorAll('[data-wishlist]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('is-active');
        var label = btn.classList.contains('is-active') ? 'Remove from wishlist' : 'Add to wishlist';
        btn.setAttribute('aria-label', label);
      });
    });

    doc.querySelectorAll('[data-pc-quickview]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var card = btn.closest('.pc-product, .pc-product-card');
        var title = card ? card.querySelector('.pc-product__title, .pc-product-title') : null;
        var name = title ? title.textContent.trim() : 'this product';
        window.alert('Quick view: ' + name);
      });
    });
  })();

  /* --------------------------------------------------------------------
     6. Add to cart demo + cart badge + sticky cart counter
     -------------------------------------------------------------------- */
  (function cartDemo() {
    var cartCount = 0;
    var cartTotal = 0;

    var cartCountEl = doc.querySelector('[data-cart-count]');
    var cartTotalEl = doc.querySelector('[data-cart-total]');
    var stickyCountEl = doc.querySelector('[data-sticky-count]');
    var stickyTotalEl = doc.querySelector('[data-sticky-total]');
    var legacyStickyCart = doc.getElementById('pcStickyCart');

    function updateCartDisplay() {
      if (cartCountEl) cartCountEl.textContent = cartCount;
      if (stickyCountEl) stickyCountEl.textContent = cartCount + ' item' + (cartCount !== 1 ? 's' : '');
      var totalStr = '\u00a3' + cartTotal.toFixed(2);
      if (cartTotalEl) cartTotalEl.textContent = totalStr;
      if (stickyTotalEl) stickyTotalEl.textContent = totalStr;

      doc.querySelectorAll('.pc-badge[data-cart-badge]').forEach(function (badge) {
        badge.textContent = cartCount;
        badge.hidden = cartCount === 0;
      });

      if (legacyStickyCart && cartCount > 0) legacyStickyCart.classList.add('is-visible');
    }

    doc.querySelectorAll('[data-add-cart]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var price = parseFloat(btn.getAttribute('data-price')) || 0;
        cartCount += 1;
        cartTotal += price;
        updateCartDisplay();
        var original = btn.textContent;
        btn.textContent = 'Added!';
        setTimeout(function () {
          btn.textContent = original || 'Add to Cart';
        }, 1200);
      });
    });

    /* BEM "Add to Cart" links inside product cards (non-demo anchors) get a
       lightweight visual confirmation without navigating away. */
    doc.querySelectorAll('.pc-product__cart').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href === '#') e.preventDefault();
        cartCount += 1;
        updateCartDisplay();
        var original = link.textContent;
        link.textContent = 'Added!';
        setTimeout(function () {
          link.textContent = original || 'Add to Cart';
        }, 1200);
      });
    });
  })();

  /* --------------------------------------------------------------------
     7. Sticky cart visibility on scroll (all concepts)
     -------------------------------------------------------------------- */
  (function stickyCartScroll() {
    var stickyCarts = doc.querySelectorAll('.pc-sticky-cart');
    if (!stickyCarts.length) return;

    var SHOW_AFTER = 480;

    function onScroll() {
      var visible = window.scrollY > SHOW_AFTER;
      stickyCarts.forEach(function (el) {
        el.classList.toggle('is-visible', visible);
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* --------------------------------------------------------------------
     8. Hero glass search redirect (legacy concept-1 only)
     -------------------------------------------------------------------- */
  (function heroSearchRedirect() {
    var heroSearch = doc.getElementById('pcHeroSearch');
    if (!heroSearch) return;
    heroSearch.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'shop.html';
    });
  })();

  /* --------------------------------------------------------------------
     9. Dispatch countdown (legacy concept-1: #pcHours/#pcMinutes/#pcSeconds)
     -------------------------------------------------------------------- */
  (function dispatchCountdown() {
    var hoursEl = doc.getElementById('pcHours');
    var minutesEl = doc.getElementById('pcMinutes');
    var secondsEl = doc.getElementById('pcSeconds');
    if (!hoursEl && !minutesEl && !secondsEl) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdown() {
      var now = new Date();
      var cutoff = new Date();
      cutoff.setHours(15, 0, 0, 0);
      if (now >= cutoff) cutoff.setDate(cutoff.getDate() + 1);
      var diff = cutoff - now;
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      if (hoursEl) hoursEl.textContent = pad(h);
      if (minutesEl) minutesEl.textContent = pad(m);
      if (secondsEl) secondsEl.textContent = pad(s);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  })();

  /* --------------------------------------------------------------------
     10. Newsletter submit demo
         - Legacy: #pcNewsletterForm
         - BEM: .pc-newsletter__form
     -------------------------------------------------------------------- */
  (function newsletterDemo() {
    var forms = [];
    var legacyForm = doc.getElementById('pcNewsletterForm');
    if (legacyForm) forms.push(legacyForm);
    doc.querySelectorAll('.pc-newsletter__form').forEach(function (f) { forms.push(f); });

    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('button');
        if (!btn) return;
        var original = btn.textContent;
        btn.textContent = 'Subscribed!';
        form.reset();
        setTimeout(function () {
          btn.textContent = original;
        }, 2000);
      });
    });
  })();

  /* --------------------------------------------------------------------
     11. Fade-up scroll reveal — .pc-fade-up sections gain .is-visible
     -------------------------------------------------------------------- */
  (function fadeUpReveal() {
    var targets = doc.querySelectorAll('.pc-fade-up');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  })();
})();
