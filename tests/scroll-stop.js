const app = document.getElementById('app');
const output = document.getElementById('results');
const lines = [];
const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
async function until(predicate, timeout=25000) {
  const begin = performance.now();
  while (!predicate() && performance.now()-begin<timeout) await wait(100);
  return Boolean(predicate());
}
function check(label, result) {
  const text = `${result ? 'PASS' : 'FAIL'} — ${label}`;
  lines.push(text); console.log(text); output.textContent = lines.join('\n');
}
let started = false;
async function run() {
  const w = app.contentWindow, d = app.contentDocument;
  if (started || !w.nuviaScene || !d.getElementById('intelligence')) return;
  started = true; clearInterval(poll);
  try {
    await until(() => w.nuvia3D?.ready);
    const stage = d.querySelector('.scene-sticky');
    const section = d.getElementById('intelligence');
    const experience = d.getElementById('experience');
    d.documentElement.style.scrollBehavior = 'auto';
    const boundary = experience.offsetTop + experience.offsetHeight - stage.offsetHeight;
    const measure = () => ({ scroll:w.scrollY, top:stage.getBoundingClientRect().top, sectionTop:section.getBoundingClientRect().top, docTop:stage.getBoundingClientRect().top+w.scrollY, progress:w.nuviaScene.progress });
    const scroll = async y => { w.scrollTo(0,y); await wait(350); };
    await scroll(0);
    await until(()=>w.nuviaScene.progress<0.01);
    const initialX = w.nuvia3D?.sphere.x;
    await scroll(boundary);
    check('The sphere reaches its centered/chrome state', await until(()=>w.nuviaScene.progress>0.98));
    const arrival = measure();
    const centerX = w.nuvia3D?.sphere.x;
    await scroll(boundary+190);
    const lower = measure();
    console.log('SCROLL_BOUNDARY',JSON.stringify({ viewport:[w.innerWidth,w.innerHeight], boundary, arrival, lower }));
    check('Sphere moves up with the text after arrival', Math.abs((lower.top-arrival.top) + (lower.scroll-arrival.scroll))<3);
    check('Sphere stays anchored to the same document position', Math.abs(lower.docTop-arrival.docTop)<3);
    check('Sphere-to-section offset stays constant', Math.abs((lower.top-lower.sectionTop)-(arrival.top-arrival.sectionTop))<3);
    await scroll(experience.offsetTop+experience.offsetHeight+20);
    check('The 3D viewport leaves with its section', stage.getBoundingClientRect().bottom<=1);
    await scroll(boundary*0.45);
    check('Reverse scroll restarts the transition', await until(()=>w.nuviaScene.progress>0.3 && w.nuviaScene.progress<0.6));
    check('Viewport reattaches smoothly on return', Math.abs(stage.getBoundingClientRect().top)<2);
    await scroll(0);
    check('Returning to the hero restores glass', await until(()=>w.nuviaScene.progress<0.01 && w.nuvia3D.transmission>0.66));
    check('Returning to the hero restores the original horizontal position', Math.abs(w.nuvia3D.sphere.x-initialX)<5);
    if (w.innerWidth>=768) check('Center-to-right motion preserved', initialX>centerX+30);
    // Leave the real page just after the boundary for visual review.
    await scroll(boundary+120);
    await until(()=>w.nuviaScene.progress>0.99);
  } catch(error) { check(error.message,false); }
  output.dataset.complete='true';
  console.log('SCROLL_STOP_TESTS_COMPLETE',lines.filter(x=>x.startsWith('FAIL')).length,'failures');
}
const poll = setInterval(run,200);
app.addEventListener('load',run);
run();
