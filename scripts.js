(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.rs-card, .rs-hero');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('rs-reveal--in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('rs-reveal--in');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  targets.forEach((el) => { el.classList.add('rs-reveal'); observer.observe(el); });
})();