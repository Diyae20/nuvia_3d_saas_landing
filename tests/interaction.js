const app = document.getElementById('app');
const output = document.getElementById('results');
const reports = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(predicate, timeout = 18000) {
  const start = performance.now();
  while (!predicate() && performance.now()-start < timeout) await delay(150);
  return Boolean(predicate());
}
function check(name, value) {
  const line = `${value ? 'PASS' : 'FAIL'} — ${name}`;
  reports.push(line); console.log(line); output.textContent = reports.join('\n');
}
app.addEventListener('load', async () => {
  const w = app.contentWindow, d = app.contentDocument;
  try {
    check('Real WebGL ready', await until(() => w.nuvia3D?.ready));
    check('Local entry is a classic script, not a file ES module', d.querySelector('script[src="js/scene.js"]').type !== 'module');
    check('Custom shader compiled', w.nuvia3D.shaderCompiled);
    const move = (x, y) => d.getElementById('hero-section').dispatchEvent(new w.PointerEvent('pointermove', { clientX:x, clientY:y, pointerType:'mouse', bubbles:true }));
    const center = () => w.nuvia3D.sphere;
    move(center().x, center().y);
    check('Pointer hits the real sphere', await until(() => w.nuvia3D.hovered));
    check('Noise shader hover amplitude increases', await until(() => w.nuvia3D.hover > (w.nuvia3D.reducedMotion ? 0.15 : 0.85)));
    move(center().x-60, center().y-35);
    await delay(1800);
    const left = { ...w.nuvia3D.environment };
    const leftPointer = { ...w.nuvia3D.pointer };
    move(center().x+60, center().y+35);
    check('Studio reflections follow horizontal/vertical motion', await until(() => Math.abs(w.nuvia3D.environment.y-left.y)>0.035 && Math.abs(w.nuvia3D.environment.x-left.x)>0.015));
    check('RGB shader receives changing pointer coordinates', Math.abs(w.nuvia3D.pointer.x-leftPointer.x)>0.035);
    move(10, w.innerHeight-10);
    check('Leaving the sphere releases the distortion', await until(() => !w.nuvia3D.hovered && w.nuvia3D.hover<0.08));
    d.documentElement.style.scrollBehavior = 'auto';
    w.scrollTo(0, d.getElementById('intelligence').offsetTop);
    check('Chrome transition remains functional', await until(() => w.nuviaScene.progress>0.96 && w.nuvia3D.transmission<0.04));
    move(center().x, center().y);
    check('Hit testing follows the sphere after scrolling', await until(() => w.nuvia3D.hovered && w.nuvia3D.hover>0.15));
    w.scrollTo(0,0);
    await until(() => w.nuviaScene.progress<0.01);
    move(center().x+45, center().y-30);
    await until(() => w.nuvia3D.hover>0.15);
    console.log('INTERACTION_STATE', JSON.stringify(w.nuvia3D));
  } catch(error) { check(error.message, false); }
  output.dataset.complete = 'true';
  console.log('INTERACTION_TESTS_COMPLETE', reports.filter(x=>x.startsWith('FAIL')).length, 'failures');
});
