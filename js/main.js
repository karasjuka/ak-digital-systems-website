/* AK Digital Systems — Interaktion & GSAP-Animationen
   Initialzustände werden per JS gesetzt (gsap.set), damit Inhalte
   ohne JavaScript bzw. bei reduced-motion immer sichtbar bleiben. */

(function () {
  'use strict';

  // Footer-Jahr (immer)
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Nav-Schatten ab 10px Scroll (immer)
  var nav = document.querySelector('.site-nav');
  function onScroll() {
    nav.classList.toggle('scrolled', scrollY > 10);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // 1) Hero-Headline: Wörter staggern
  gsap.from('.hero h1 .w', {
    y: 44, opacity: 0, duration: 0.9, ease: 'power3.out',
    stagger: 0.08, delay: 0.15,
  });
  gsap.from('.hero .eyebrow, .hero .hero-lead, .hero .hero-actions', {
    y: 24, opacity: 0, duration: 0.8, ease: 'power2.out',
    stagger: 0.12, delay: 0.55,
  });

  // 2) Count-Up im Zahlen-Band (einmalig)
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.dataset.count, 10);
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      snap: { v: 1 },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: function () { el.textContent = obj.v; },
    });
  });

  // 3) Karten-Stagger (Leistungen + Stack)
  [['.services-grid', '.service-card'], ['.stack-grid', '.stack-card']].forEach(function (pair) {
    gsap.from(pair[1], {
      y: 32, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12,
      scrollTrigger: { trigger: pair[0], start: 'top 82%', once: true },
    });
  });

  // 4) Phone-Frames richten sich beim Scrollen auf
  gsap.from('.phone-back', {
    y: 90, rotateY: -16, rotateX: 6, transformPerspective: 900, ease: 'none',
    scrollTrigger: { trigger: '.product-card', start: 'top 85%', end: 'center 55%', scrub: 0.5 },
  });
  gsap.from('.phone-front', {
    y: 130, rotateY: -10, rotateX: 4, transformPerspective: 900, ease: 'none',
    scrollTrigger: { trigger: '.product-card', start: 'top 85%', end: 'center 50%', scrub: 0.5 },
  });

  // 5) Foto-Parallax (Person)
  gsap.fromTo('.person-photo img',
    { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.person-photo', start: 'top bottom', end: 'bottom top', scrub: 0.4 },
    });

  // 6) Timeline: Linie zeichnet sich, Stationen blenden ein
  gsap.fromTo('.tl-line', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.tl', start: 'top 80%', end: 'bottom 60%', scrub: 0.4 },
  });
  gsap.utils.toArray('.tl-item').forEach(function (item) {
    gsap.from(item, {
      x: -28, opacity: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: item, start: 'top 86%', once: true },
    });
  });

  // 7) Generische Sektion-Reveals (Hero hat eigene Lade-Animation)
  gsap.utils.toArray('.reveal').filter(function (el) {
    return !el.closest('.hero');
  }).forEach(function (el) {
    gsap.from(el, {
      y: 28, opacity: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });
})();
