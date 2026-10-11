/* UI is deliberately independent of WebGL: navigation and the form remain usable
   if the 3D libraries cannot load or WebGL is unavailable. */
window.nuviaScene = { progress: 0 };
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  mobileNav.hidden = open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    menuToggle.focus();
  }
});

const dialog = document.getElementById('motion-dialog');
document.getElementById('watch-film').addEventListener('click', () => dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
document.getElementById('start-experience').addEventListener('click', () => {
  dialog.close();
  document.getElementById('intelligence').scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth' });
});

const form = document.getElementById('interest-form');
const formStatus = document.getElementById('form-status');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  try {
    localStorage.setItem('nuvia-interest', JSON.stringify({ email: document.getElementById('email').value.trim(), savedAt: new Date().toISOString() }));
    formStatus.textContent = 'You’re on your way. Your interest is saved on this device only — no email was sent.';
    formStatus.style.color = '#d5f9ac';
    form.reset();
  } catch {
    formStatus.textContent = 'Local storage is unavailable. Nothing has been saved or sent.';
  }
});

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(window.nuviaScene, {
    progress: 1, ease: 'none',
    scrollTrigger: { trigger: '#experience', start: 'top top', end: 'bottom bottom', scrub: motionPreference.matches ? true : 1 }
  });
  if (!motionPreference.matches) {
    gsap.timeline({ scrollTrigger: { trigger: '#hero-section', start: 'top top', end: '65% top', scrub: 0.65 } })
      .to('.hero-copy', { opacity: 0, y: -65, ease: 'none' }, 0)
      .to('.orb-caption', { opacity: 0, y: -15, ease: 'none' }, 0)
      .to('.hero-bottom', { opacity: 0, ease: 'none' }, 0.1);
    gsap.from('.transformation-copy', { opacity: 0, y: 45, duration: 1, scrollTrigger: { trigger: '#intelligence', start: 'top 35%', end: 'top top', scrub: 1 } });
    gsap.utils.toArray('.feature-card').forEach((card, index) => {
      gsap.from(card, { y: 30, opacity: 0, duration: 0.8, delay: index * 0.1, scrollTrigger: { trigger: card, start: 'top 95%', once: true } });
    });
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
} else {
  window.addEventListener('scroll', () => {
    const range = document.getElementById('experience').offsetHeight - innerHeight;
    window.nuviaScene.progress = Math.max(0, Math.min(1, scrollY / Math.max(1, range)));
  }, { passive: true });
}
