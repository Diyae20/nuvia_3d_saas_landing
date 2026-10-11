(() => {
  const started = performance.now();
  const timer = setInterval(() => {
    const state = window.nuvia3D;
    if (state?.ready || performance.now()-started>60000) {
      clearInterval(timer);
      parent.postMessage({ type:'nuvia-origin-test', ready:Boolean(state?.ready), shaderCompiled:Boolean(state?.shaderCompiled), message:document.getElementById('scene-status')?.textContent || 'No scene status' }, '*');
    }
  }, 250);
})();
