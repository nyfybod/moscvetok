/* Motion enhances visible content; it never controls availability or layout. */
(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate || !('IntersectionObserver' in window)) return;
  const running = new Map();
  const seen = new WeakSet();
  const play = (element, delay = 0, distance = 20) => {
    if (seen.has(element) || preference.matches || element.contains(document.activeElement)) return;
    seen.add(element);
    const animation = element.animate([
      {opacity: 0, transform: `translateY(${distance}px)`},
      {opacity: 1, transform: 'translateY(0)'}
    ], {duration: 560, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'});
    running.set(element, animation);
    const cleanup = () => { if (running.get(element) === animation) running.delete(element); };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  };
  document.querySelectorAll('.hero-art, .hero-copy > *').forEach((element, index) => {
    play(element, Math.min(index * 65, 260), 16);
  });
  const observer = new IntersectionObserver(entries => {
    let stagger = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      play(entry.target, Math.min(stagger++ * 55, 165));
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -24px 0px'});
  document.querySelectorAll('.section-head, .product, .service, .about-grid, .gallery-photo, .review, .faq-grid, .contact-panel').forEach(element => observer.observe(element));
  document.addEventListener('focusin', event => {
    running.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
  });
  preference.addEventListener('change', () => {
    if (preference.matches) running.forEach(animation => animation.cancel());
  });
})();
