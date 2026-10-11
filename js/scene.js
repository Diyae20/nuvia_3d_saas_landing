/* Classic local script on purpose: file:// blocks local ES-module entry files.
   Only HTTPS CDN dependencies are imported as modules (CORS-enabled).
   No local fetch(), local module import or build/server is needed to launch the page. */
(() => {
  const status = document.getElementById('scene-status');
  const root = document.documentElement;
  const diagnostics = window.nuvia3D = { ready: false, hovered: false, hover: 0, frames: 0 };
  let failed = false;
  function showFailure(error) {
    failed = true;
    diagnostics.ready = false;
    root.classList.remove('scene-ready');
    if (status) {
      status.textContent = '3D unavailable — check Internet / WebGL.';
      status.title = 'An Internet connection and a browser with WebGL are required. Check your connection, enable graphics acceleration, then reload the page.';
    }
    console.warn('Nuvia: real-time 3D could not start.', error);
  }
  const slowLoadTimer = setTimeout(() => {
    if (!diagnostics.ready && !failed && status) status.textContent = '3D is loading — check your connection.';
  }, 20000);

  async function startScene() {
    const [ReactModule, ReactDOM, THREE, Fiber, Drei] = await Promise.all([
      import('react'), import('react-dom/client'), import('three'),
      import('@react-three/fiber'), import('@react-three/drei')
    ]);
    const React = ReactModule.default;
    const { Suspense, useMemo, useRef, useEffect } = ReactModule;
    const { Canvas, useFrame, useThree } = Fiber;
    const { Environment, Lightformer } = Drei;
    const h = React.createElement;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { clientX: 0, clientY: 0, present: false, blocked: false };
    // The canvas is behind the text and deliberately has pointer-events:none.
    // Capture real page events instead of relying on unreachable mesh DOM events.
    window.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.present = true;
      pointer.blocked = Boolean(event.target.closest?.('a, button, input, dialog, nav'));
    }, { passive: true, capture: true });
    const clearPointer = () => { pointer.present = false; };
    document.addEventListener('pointerleave', clearPointer);
    window.addEventListener('blur', clearPointer);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearPointer(); });

    function makeFluidGeometry() {
      const geometry = new THREE.SphereGeometry(1, 128, 96);
      const positions = geometry.attributes.position;
      const vector = new THREE.Vector3();
      for (let i = 0; i < positions.count; i++) {
        vector.fromBufferAttribute(positions, i).normalize();
        const { x, y, z } = vector;
        const broad = Math.sin(x * 3.6 + y * 2.2) * Math.cos(z * 3.4 - y * 1.2);
        const folds = Math.sin(y * 10 + x * 4 + Math.sin(z * 5) * 1.5);
        const radius = 1 + 0.16 * broad + 0.065 * folds + 0.035 * Math.sin(x * 12 + z * 6);
        vector.multiplyScalar(radius);
        vector.x *= 1.02;
        positions.setXYZ(i, vector.x, vector.y, vector.z);
      }
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      return geometry;
    }

    function FluidSphere() {
      const group = useRef();
      const outerMesh = useRef();
      const material = useRef();
      const hover = useRef(0);
      const geometry = useMemo(makeFluidGeometry, []);
      const { viewport, size, camera, gl, scene } = useThree();
      const mobile = size.width < 768;
      const tracking = useMemo(() => ({
        raycaster: new THREE.Raycaster(), ndc: new THREE.Vector2(),
        smooth: new THREE.Vector2(), projected: new THREE.Vector3(),
        localHit: new THREE.Vector3(0, 0, 1), intersections: []
      }), []);
      // Shared uniform objects survive material recompilation (glass -> chrome).
      const uniforms = useMemo(() => ({
        uTime: { value: 0 }, uHover: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uHit: { value: new THREE.Vector3(0, 0, 1) }
      }), []);
      useEffect(() => () => geometry.dispose(), [geometry]);

      const patchMaterial = program => {
        Object.assign(program.uniforms, uniforms);
        program.vertexShader = `
          uniform float uTime;
          uniform float uHover;
          uniform vec2 uPointer;
          uniform vec3 uHit;
          float fluidHash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
          float fluidNoise(vec3 p) {
            vec3 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix(fluidHash(i), fluidHash(i+vec3(1,0,0)), f.x),
                           mix(fluidHash(i+vec3(0,1,0)), fluidHash(i+vec3(1,1,0)), f.x), f.y),
                       mix(mix(fluidHash(i+vec3(0,0,1)), fluidHash(i+vec3(1,0,1)), f.x),
                           mix(fluidHash(i+vec3(0,1,1)), fluidHash(i+vec3(1,1,1)), f.x), f.y), f.z);
          }
          vec3 fluidDisplace(vec3 p, vec3 n) {
            float wave = sin(p.y*5.0+p.x*3.0+uTime*0.75) * cos(p.z*4.0-p.x*2.0+uTime*0.45);
            float noise = fluidNoise(p*3.6 + vec3(uPointer*1.3, uTime*0.6))*2.0-1.0;
            float influence = exp(-dot(p-uHit,p-uHit)*1.6);
            float distortion = uHover * (noise*0.22 + influence*0.13);
            return p + n * (wave*0.027 + distortion);
          }
        ` + program.vertexShader;
        program.vertexShader = program.vertexShader.replace('#include <beginnormal_vertex>', `
          #include <beginnormal_vertex>
          // Recompute the normal of the displaced surface, so glass reflections
          // move with the distortion rather than staying glued to the old shape.
          vec3 fluidN = normalize(normal);
          vec3 fluidT = normalize(cross(fluidN, abs(fluidN.y)<0.9 ? vec3(0,1,0) : vec3(1,0,0)));
          vec3 fluidB = normalize(cross(fluidN, fluidT));
          float eps = 0.012;
          vec3 fluidP = fluidDisplace(position, fluidN);
          vec3 fluidPT = fluidDisplace(position+fluidT*eps, normalize(fluidN+fluidT*eps));
          vec3 fluidPB = fluidDisplace(position+fluidB*eps, normalize(fluidN+fluidB*eps));
          objectNormal = normalize(cross(fluidPT-fluidP, fluidPB-fluidP));
        `);
        program.vertexShader = program.vertexShader.replace('#include <begin_vertex>', `
          vec3 transformed = fluidDisplace(position, normalize(normal));
        `);
        program.fragmentShader = 'uniform vec2 uPointer; uniform float uHover;\n' + program.fragmentShader;
        program.fragmentShader = program.fragmentShader.replace('#include <opaque_fragment>', `
          float fluidFresnel = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.0);
          float fluidShift = clamp(0.5 + uPointer.x*0.6 + normal.x*0.3, 0.0, 1.0);
          vec3 fluidRGB = mix(vec3(0.04,0.65,0.85), vec3(0.65,0.06,0.55), fluidShift);
          outgoingLight += fluidRGB * fluidFresnel * (0.06 + uHover*0.2);
          #include <opaque_fragment>
        `);
        diagnostics.shaderCompiled = true;
      };

      useFrame((state, delta) => {
        if (!group.current || !material.current || !outerMesh.current) return;
        const progress = window.nuviaScene?.progress || 0;
        const reducedMotion = motionQuery.matches;
        const time = reducedMotion ? 0 : state.clock.elapsedTime;
        const dt = Math.min(delta, 0.1);
        const rect = gl.domElement.getBoundingClientRect();
        if (pointer.present) {
          tracking.ndc.set((pointer.clientX-rect.left)/rect.width*2-1, -(pointer.clientY-rect.top)/rect.height*2+1);
        }
        const trackingEnabled = pointer.present && !pointer.blocked;
        const response = reducedMotion ? 0.2 : 1;
        tracking.smooth.x = THREE.MathUtils.damp(tracking.smooth.x, trackingEnabled ? tracking.ndc.x*response : 0, 6, dt);
        tracking.smooth.y = THREE.MathUtils.damp(tracking.smooth.y, trackingEnabled ? tracking.ndc.y*response : 0, 6, dt);
        const desktopX = viewport.width*0.257;
        const startY = mobile ? -viewport.height*0.22 : 0.01;
        group.current.position.x = THREE.MathUtils.lerp(mobile ? 0 : desktopX, mobile ? 0.1 : viewport.width*0.08, progress);
        group.current.position.y = THREE.MathUtils.lerp(startY, mobile ? 0.6 : 0.25, progress) + Math.sin(time*0.55)*0.055;
        group.current.rotation.set(0.18+tracking.smooth.y*0.07, -0.35+time*0.065+progress*1.7, -0.22+Math.sin(time*0.2)*0.055);
        const baseScale = mobile ? viewport.width*0.325 : Math.min(viewport.width*0.185, viewport.height*0.32);
        group.current.scale.setScalar(baseScale*(1+progress*0.12));
        group.current.updateWorldMatrix(true, true);

        // Hit testing uses the actual mesh in its current scroll position, not
        // a fixed right-hand rectangle. No dependency on canvas pointer-events.
        let hit = null;
        if (trackingEnabled && Math.abs(tracking.ndc.x)<=1 && Math.abs(tracking.ndc.y)<=1) {
          tracking.raycaster.setFromCamera(tracking.ndc, camera);
          tracking.intersections.length = 0;
          tracking.raycaster.intersectObject(outerMesh.current, false, tracking.intersections);
          hit = tracking.intersections[0] || null;
        }
        if (hit) tracking.localHit.copy(outerMesh.current.worldToLocal(hit.point.clone()));
        hover.current = THREE.MathUtils.damp(hover.current, hit ? (reducedMotion ? 0.2 : 1) : 0, 7, dt);
        uniforms.uTime.value = time;
        uniforms.uHover.value = hover.current;
        uniforms.uPointer.value.copy(tracking.smooth);
        uniforms.uHit.value.lerp(tracking.localHit, 1-Math.exp(-8*dt));

        material.current.transmission = THREE.MathUtils.lerp(0.68, 0, progress);
        material.current.metalness = THREE.MathUtils.lerp(0.23, 1, progress);
        material.current.roughness = THREE.MathUtils.lerp(0.085, 0.17, progress);
        material.current.iridescence = THREE.MathUtils.lerp(0.95, 0.25, progress);
        material.current.envMapIntensity = THREE.MathUtils.lerp(1.7, 2, progress);
        // Environment from drei is scene.environment, not material.envMap.
        // Rotate scene.environmentRotation: Three ignores material.envMapRotation
        // for this source. Both the glass and inner core now reflect the movement.
        scene.environmentRotation.set(tracking.smooth.y*0.4, tracking.smooth.x*0.85, 0);

        tracking.projected.copy(group.current.position).project(camera);
        Object.assign(diagnostics, {
          hovered: Boolean(hit), hover: hover.current, frames: diagnostics.frames+1,
          pointer: { x: uniforms.uPointer.value.x, y: uniforms.uPointer.value.y },
          environment: { x: scene.environmentRotation.x, y: scene.environmentRotation.y },
          transmission: material.current.transmission,
          sphere: { x: rect.left+(tracking.projected.x+1)*rect.width/2, y: rect.top+(1-tracking.projected.y)*rect.height/2 },
          reducedMotion
        });
      });
      const markReady = () => {
        if (diagnostics.ready || failed) return;
        diagnostics.ready = true;
        clearTimeout(slowLoadTimer);
        root.classList.add('scene-ready');
        if (status) {
          status.textContent = mobile ? 'Real-time 3D. Scroll to transform.' : 'Move your cursor. Feel the possibilities.';
          status.title = 'Live WebGL rendering. Move the pointer over the sphere to deform its surface.';
        }
      };
      return h('group', { ref: group },
        h('mesh', { ref: outerMesh, geometry, onAfterRender: markReady }, h('meshPhysicalMaterial', {
          ref: material, color: '#b8c2e2', metalness: 0.23, roughness: 0.085,
          transmission: 0.68, thickness: 1.7, ior: 1.48,
          iridescence: 0.95, iridescenceIOR: 1.34, iridescenceThicknessRange: [180,540],
          clearcoat: 1, clearcoatRoughness: 0.08,
          attenuationColor: '#7687be', attenuationDistance: 2.8,
          envMapIntensity: 1.7, onBeforeCompile: patchMaterial
        })),
        h('mesh', { geometry, scale: 0.8 }, h('meshStandardMaterial', {
          color: '#11172f', metalness: 1, roughness: 0.19, envMapIntensity: 1.2
        }))
      );
    }

    function StudioLights() {
      return h(Environment, { resolution: 128, frames: 1 }, h('group', null,
        h(Lightformer, { form:'rect', intensity:3, color:'#c9e8ff', position:[0,4,0], rotation:[Math.PI/2,0,0], scale:[6,2,1] }),
        h(Lightformer, { form:'rect', intensity:5, color:'#42eeec', position:[-4,0,2], rotation:[0,Math.PI/2,0], scale:[2,6,1] }),
        h(Lightformer, { form:'rect', intensity:4, color:'#ad53ef', position:[4,1,1], rotation:[0,-Math.PI/2,0], scale:[3,6,1] }),
        h(Lightformer, { form:'ring', intensity:2, color:'#ef89dd', position:[1,-3,2], rotation:[-Math.PI/3,0,0], scale:[5,2,1] }),
        h(Lightformer, { form:'rect', intensity:2.5, color:'#a6e6fa', position:[-1,1,5], scale:[0.4,6,1] }),
        h(Lightformer, { form:'rect', intensity:1.5, color:'#d2bfff', position:[3,-1,-4], rotation:[0,Math.PI,0], scale:[5,4,1] })
      ));
    }
    class SceneBoundary extends React.Component {
      constructor(props) { super(props); this.state = { failed: false }; }
      static getDerivedStateFromError() { return { failed: true }; }
      componentDidCatch(error) { showFailure(error); }
      render() { return this.state.failed ? null : this.props.children; }
    }
    ReactDOM.createRoot(document.getElementById('scene-root')).render(
      h(SceneBoundary, null, h(Canvas, {
        dpr: [1, Math.min(window.devicePixelRatio || 1, window.innerWidth<768 ? 1.25 : 1.5)],
        camera: { position:[0,0,8], fov:42, near:0.1, far:50 },
        gl: { alpha:true, antialias:true, powerPreference:'high-performance' },
        onCreated: ({ gl }) => {
          gl.setClearColor('#080a0b',0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.domElement.addEventListener('webglcontextlost', event => {
            event.preventDefault();
            showFailure('WebGL context lost. Reload to restart the scene.');
          });
          gl.domElement.addEventListener('webglcontextrestored', () => { failed = false; });
        }
      }, h(Suspense, { fallback:null }, h(StudioLights), h(FluidSphere))))
    );
  }
  startScene().catch(showFailure);
})();
