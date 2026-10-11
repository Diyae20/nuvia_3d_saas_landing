// Models the null/opaque origin used by file URLs, not disk filesystem policy.
// Inline the unchanged local asset contents in srcdoc: this avoids the preview
// server's cross-origin asset restrictions while keeping CDN imports cross-origin.
const app = document.getElementById('app');
const output = document.getElementById('results');
window.addEventListener('message', event => {
  if (event.source !== app.contentWindow || event.data?.type !== 'nuvia-origin-test') return;
  const result = event.data;
  const passed = event.origin === 'null' && result.ready && result.shaderCompiled;
  output.textContent = `${passed ? 'PASS' : 'FAIL'} — Null-origin HTTPS module loading and real WebGL rendering\nOrigin: ${event.origin}\n${result.message}`;
  output.dataset.complete = 'true';
  console.log('OPAQUE_ORIGIN_TEST', JSON.stringify({ passed, origin:event.origin, ...result }));
});
(async () => {
  try {
    const files = ['../index.html','../css/style.css','../js/interface.js','../js/scene.js','opaque-probe.js'];
    const [page,css,ui,scene,probe] = await Promise.all(files.map(async path => {
      const response = await fetch(new URL(path,location.href));
      if (!response.ok) throw new Error(`${path} returned ${response.status}`);
      return response.text();
    }));
    const inline = code => '<script>' + code.replace(/<\/script/gi, '<\\/script') + '</script>';
    let html = page.replace('<link rel="stylesheet" href="css/style.css">', '<style>'+css+'</style>');
    html = html.replace('<script src="js/interface.js" defer></script>', '');
    html = html.replace('<script src="js/scene.js" defer></script>', inline(ui)+inline(scene)+inline(probe));
    app.srcdoc = html;
    setTimeout(() => {
      if (!output.dataset.complete) {
        output.textContent = 'FAIL — Opaque-origin test timed out';
        output.dataset.complete = 'true';
        console.error('OPAQUE_ORIGIN_TEST timeout');
      }
    }, 70000);
  } catch(error) {
    console.error(error); output.textContent = `FAIL — ${error.message}`; output.dataset.complete='true';
  }
})();
