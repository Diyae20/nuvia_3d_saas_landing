const app = document.getElementById('app');
const output = document.getElementById('results');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const reports = [];
function check(name, passed) {
  reports.push(`${passed ? 'PASS' : 'FAIL'} — ${name}`);
  console.log(reports.at(-1));
  output.textContent = reports.join('\n');
}
let started = false;
async function runTests() {
  if (started) return;
  const w = app.contentWindow;
  const d = app.contentDocument;
  if (!w.nuviaScene || !d.getElementById('email')) return;
  started = true;
  clearInterval(startPoll);
  const readyAt = performance.now();
  while (!w.nuvia3D?.ready && performance.now()-readyAt<30000) await wait(150);
  check('No horizontal overflow', d.documentElement.scrollWidth <= w.innerWidth + 1);
  check('Readable title size', parseFloat(w.getComputedStyle(d.querySelector('h1')).fontSize) >= 40);
  d.getElementById('watch-film').click();
  check('Preview dialog opens', d.getElementById('motion-dialog').open);
  d.querySelector('.dialog-close').click();
  check('Preview dialog closes', !d.getElementById('motion-dialog').open);
  const toggle = d.querySelector('.menu-toggle');
  toggle.click();
  check('Mobile menu expands', toggle.getAttribute('aria-expanded') === 'true' && !d.getElementById('mobile-nav').hidden);
  toggle.click();
  check('Mobile menu closes', toggle.getAttribute('aria-expanded') === 'false' && d.getElementById('mobile-nav').hidden);
  const email = d.getElementById('email');
  email.value = 'not-an-email';
  check('Email validation rejects malformed address', !email.checkValidity());
  const previous = w.localStorage.getItem('nuvia-interest');
  email.value = 'test@example.com';
  d.getElementById('interest-form').requestSubmit();
  check('Local-only interest form persists correctly', JSON.parse(w.localStorage.getItem('nuvia-interest') || '{}').email === 'test@example.com');
  check('Form clearly states no email sent', d.getElementById('form-status').textContent.includes('no email was sent'));
  if (previous === null) w.localStorage.removeItem('nuvia-interest');
  else w.localStorage.setItem('nuvia-interest', previous);
  d.documentElement.style.scrollBehavior = 'auto';
  w.scrollTo(0, d.getElementById('intelligence').offsetTop);
  w.ScrollTrigger?.refresh();
  const scrollAt = performance.now();
  while (w.nuviaScene.progress<=0.96 && performance.now()-scrollAt<20000) await wait(150);
  console.log('SCROLL_STATE', JSON.stringify({ y: w.scrollY, progress: w.nuviaScene.progress, target: d.getElementById('intelligence').offsetTop, viewport: w.innerHeight, experience: d.getElementById('experience').offsetHeight }));
  check('Scroll drives material transformation', w.nuviaScene.progress > 0.9);
  check('Hero fades on scroll', Number(w.getComputedStyle(d.querySelector('.hero-copy')).opacity) < 0.1 || w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  check('Real WebGL scene initialized', d.documentElement.classList.contains('scene-ready'));
  output.dataset.complete = 'true';
  console.log('SMOKE_TESTS_COMPLETE', reports.filter(line => line.startsWith('FAIL')).length, 'failures');
}
// Cached iframe loads can finish before this script's load listener is attached.
const startPoll = setInterval(runTests, 250);
app.addEventListener('load', runTests);
runTests();
