/**
 * Alessandro Panaia — Project Manager Edilizia Privata
 * main.js — Core interactions
 *
 * 1.  AOS init
 * 2.  Active nav highlighting via IntersectionObserver
 * 3.  Smooth scroll
 * 4.  Skill bar animation (FIX: observer on .skills-section, staggered)
 * 5.  Mobile hamburger sidebar toggle
 * 6.  Resize handler
 * 7.  Metodo accordion (mobile only)
 * 8.  Animated stat counters
 * 9.  Scroll progress indicator
 * 10. Custom cursor dot (desktop pointer:fine only)
 */

'use strict';

/* ─────────────────────────────────────────
   1. AOS — Animate On Scroll
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic'
    });
  }

  /* ─────────────────────────────────────────
     2. ACTIVE NAV LINK — IntersectionObserver
     FIX: threshold 0.3 + rootMargin for reliable
     highlighting as user scrolls between sections.
  ───────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.getAttribute('id'));
        }
      });
    }, {
      root: null,
      rootMargin: '-15% 0px -55% 0px',
      threshold: 0.3
    });

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  function setActiveNav(activeId) {
    navLinks.forEach(function (link) {
      const key = link.getAttribute('data-section');
      if (key === activeId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ─────────────────────────────────────────
     3. SMOOTH SCROLL
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      closeMobileSidebar();

      const isMobile = window.innerWidth < 768;
      const offset = isMobile ? 60 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────
     4. SKILL BARS — FIX: observe .skills-section
     When the section enters viewport, animate each
     fill bar with a 150ms stagger per bar.
  ───────────────────────────────────────── */
  const skillsSection = document.querySelector('.skills-section');

  if (skillsSection) {
    const skillsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.skill-fill');
          fills.forEach(function (fill, index) {
            const targetWidth = fill.getAttribute('data-width') || '0';
            setTimeout(function () {
              fill.style.width = targetWidth + '%';
            }, 200 + index * 150); // stagger: 200ms, 350ms, 500ms, 650ms
          });
          skillsObserver.unobserve(entry.target); // fire once only
        }
      });
    }, { threshold: 0.2 });

    skillsObserver.observe(skillsSection);
  }

  /* ─────────────────────────────────────────
     5. MOBILE HAMBURGER TOGGLE
  ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', function () {
      const isOpen = sidebar.classList.contains('sidebar--open');
      isOpen ? closeMobileSidebar() : openMobileSidebar();
    });

    if (overlay) overlay.addEventListener('click', closeMobileSidebar);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileSidebar();
    });
  }

  function openMobileSidebar() {
    if (!sidebar || !hamburger) return;
    sidebar.classList.add('sidebar--open');
    hamburger.classList.add('hamburger--active');
    hamburger.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (!sidebar || !hamburger) return;
    sidebar.classList.remove('sidebar--open');
    hamburger.classList.remove('hamburger--active');
    hamburger.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ─────────────────────────────────────────
     6. RESIZE HANDLER
  ───────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth >= 768) closeMobileSidebar();
    }, 150);
  });

  /* ─────────────────────────────────────────
     7. METODO ACCORDION (mobile only, < 768px)
     Clicking a card's toggle button expands its
     .card-collapsible; collapses all others.
  ───────────────────────────────────────── */
  const cardsGrid = document.querySelector('.cards-grid');

  if (cardsGrid) {
    cardsGrid.addEventListener('click', function (e) {
      // Only active on mobile
      if (window.innerWidth >= 768) return;

      const btn = e.target.closest('.card-toggle-btn');
      if (!btn) return;

      const card = btn.closest('.service-card');
      if (!card) return;

      const isOpen = card.classList.contains('is-open');

      // Collapse all cards first
      cardsGrid.querySelectorAll('.service-card.is-open').forEach(function (openCard) {
        openCard.classList.remove('is-open');
        openCard.querySelector('.card-toggle-btn').setAttribute('aria-expanded', 'false');
      });

      // If it wasn't open, open it
      if (!isOpen) {
        card.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ─────────────────────────────────────────
     8. ANIMATED STAT COUNTERS
     Triggers when .stats-row enters viewport.
  ───────────────────────────────────────── */
  const statsRow = document.querySelector('.stats-row');

  if (statsRow) {
    const statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-number').forEach(function (el) {
            animateCounter(el);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statsObserver.observe(statsRow);
  }

  /**
   * Animate a counter element from 0 to its data-target value.
   * @param {HTMLElement} el
   */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1500; // ms
    const step     = target / (duration / 16);
    var current    = 0;

    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  }

  /* ─────────────────────────────────────────
     9. SCROLL PROGRESS INDICATOR (sidebar)
     Fills a 60px tall bar proportional to
     the user's scroll position on the page.
  ───────────────────────────────────────── */
  const progressFill = document.getElementById('scrollProgress');

  if (progressFill) {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      const total    = document.body.scrollHeight - window.innerHeight;
      const pct      = total > 0 ? scrolled / total : 0;
      progressFill.style.height = (pct * 60) + 'px';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     10. CUSTOM CURSOR DOT
     Only activates on devices with a fine pointer
     (desktop/laptop with mouse). Tracks mousemove
     via rAF; scales up over interactive elements.
  ───────────────────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {
    var dot = document.createElement('div');
    dot.id  = 'cursor-dot';
    document.body.appendChild(dot);

    var cursorX = 0;
    var cursorY = 0;
    var rafId   = null;

    document.addEventListener('mousemove', function (e) {
      cursorX = e.clientX;
      cursorY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(function () {
          dot.style.left = cursorX + 'px';
          dot.style.top  = cursorY + 'px';
          rafId = null;
        });
      }
    });

    // Scale up on interactive elements
    var hoverTargets = '.btn, .nav-link, .advenire-link, .card-link, a';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) {
        dot.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) {
        dot.classList.remove('cursor-hover');
      }
    });

    // Hide dot when cursor leaves the window
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '';
    });
  }

  /* ─────────────────────────────────────────
     11. COMMITTENZA TABS
     Click or keyboard (←/→) to switch panels.
  ───────────────────────────────────────── */
  var ctabBtns   = Array.from(document.querySelectorAll('.ctab-btn'));
  var ctabPanels = document.querySelectorAll('.ctab-panel');

  function activateCtab(btn) {
    ctabBtns.forEach(function (b) {
      b.classList.remove('ctab-btn--active');
      b.setAttribute('aria-selected', 'false');
    });
    ctabPanels.forEach(function (p) {
      p.classList.remove('ctab-panel--active');
    });
    btn.classList.add('ctab-btn--active');
    btn.setAttribute('aria-selected', 'true');
    var panelId = btn.getAttribute('aria-controls');
    var panel   = panelId ? document.getElementById(panelId) : null;
    if (panel) panel.classList.add('ctab-panel--active');
  }

  if (ctabBtns.length) {
    ctabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateCtab(btn);
      });

      // Keyboard: ← → to navigate tabs
      btn.addEventListener('keydown', function (e) {
        var idx = ctabBtns.indexOf(btn);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          var next = ctabBtns[(idx + 1) % ctabBtns.length];
          next.focus();
          activateCtab(next);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          var prev = ctabBtns[(idx - 1 + ctabBtns.length) % ctabBtns.length];
          prev.focus();
          activateCtab(prev);
        }
      });
    });
  }

});

