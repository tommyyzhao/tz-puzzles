// Painterly backdrop: rolling golden ridges under a bank of coastal fog, built from procedural Gaussian splats (Spark)
// on their own canvas behind the diorama. Purely decorative and optional: the game never waits for it, and if it cannot
// load, the CSS sky remains. As pools wake, the fog thins and burns off, and the far ridges turn from gold to green.
import * as THREE from 'three';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';

function rng(seed) { let s = seed >>> 0; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296); }

export function createBackdrop(host, { reducedMotion = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'backdrop';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.add(new SparkRenderer({ renderer }));
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 500);

  const R = rng(7), V = new THREE.Vector3(), S = new THREE.Vector3(), Q = new THREE.Quaternion(), C = new THREE.Color(), E = new THREE.Euler();

  // Cloud sea: puffs clustered into banks, lit warm on top and cool beneath.
  const clouds = new SplatMesh({ constructSplats: splats => {
    for (let b = 0; b < 70; b++) {
      const bx = (R() - 0.5) * 220, bz = -R() * 150 + 25, by = -16 + R() * 5, size = 5 + R() * 9;
      for (let i = 0; i < 90; i++) {
        const a = R() * Math.PI * 2, r = Math.sqrt(R()) * size;
        V.set(bx + Math.cos(a) * r * 1.6, by + R() * size * 0.45 * (1 - r / size / 1.2), bz + Math.sin(a) * r);
        const s = 1.4 + R() * 2.6;
        S.set(s * 1.5, s * 0.75, s * 1.3);
        Q.setFromEuler(E.set(0, R() * Math.PI, 0));
        const lit = Math.min(1, (V.y - by) / (size * 0.4));
        C.setRGB(0.86 + lit * 0.12, 0.89 + lit * 0.09, 0.93 + lit * 0.05);
        splats.pushSplat(V, S, Q, 0.55 + R() * 0.3, C);
      }
    }
  } });
  // Far ridges: three layers of soft rolling hills (smooth sums of sines), golden grass with dark oak clumps on the slopes.
  const ridgeY = (x, layer) => -15 + 7 + layer * 3 + Math.sin(x * 0.035 + layer * 2) * 5 + Math.sin(x * 0.09 + layer) * 2.2 + Math.sin(x * 0.011 + layer * 4) * 4;
  const mesas = new SplatMesh({ constructSplats: splats => {
    for (let layer = 0; layer < 3; layer++) {
      const z = -80 - layer * 30, fade = 1 - layer * 0.18;
      for (let i = 0; i < 2600; i++) {
        const x = (R() - 0.5) * 320, top = ridgeY(x, layer), y = -15 + R() ** 0.7 * (top + 15);
        V.set(x, y, z + (R() - 0.5) * 12);
        S.set(1.6 + R() * 1.2, 0.7 + R() * 0.5, 1.4);
        const tone = R();
        C.setRGB((0.86 + tone * 0.08) * fade + (1 - fade) * 0.85, (0.68 + tone * 0.08) * fade + (1 - fade) * 0.85, (0.36 + tone * 0.06) * fade + (1 - fade) * 0.88);
        splats.pushSplat(V, S, Q.identity(), 0.85, C);
      }
      for (let i = 0; i < 120 - layer * 30; i++) {            // oak clumps dotting the slopes
        const x = (R() - 0.5) * 320, top = ridgeY(x, layer), y = top - R() * 6;
        V.set(x, y, z + 3);
        S.set(1.1 + R() * 0.6, 0.8, 1.1);
        C.setRGB(0.24 * fade + (1 - fade) * 0.7, 0.3 * fade + (1 - fade) * 0.72, 0.16 * fade + (1 - fade) * 0.7);
        splats.pushSplat(V, S, Q.identity(), 0.9, C);
      }
    }
  } });
  scene.add(mesas, clouds);

  let life = 0, shownLife = 0, view = { x: 0, z: 0 }, last = performance.now();
  // Recolour multiplies splat colours: gold × lush turns the far ridges green after the rain.
  const dry = new THREE.Color(1, 1, 1), lush = new THREE.Color(0.62, 1.12, 0.75);

  function resize() {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    camera.updateProjectionMatrix();
  }
  function render(now = performance.now()) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reducedMotion) clouds.position.x = ((clouds.position.x + dt * 0.6 + 110) % 220) - 110;
    shownLife += (life - shownLife) * Math.min(1, dt * 0.8);
    mesas.recolor.lerpColors(dry, lush, shownLife);   // SplatMesh owns these Colors; mutate, don't allocate
    // Coastal fog: heavy and high while the hills are dry, burning off as pools wake.
    clouds.position.y = shownLife * -9;
    clouds.opacity = 1 - shownLife * 0.75;
    clouds.recolor.setRGB(1, 1, 1);
    camera.position.set(view.x * 0.35, 22, 40 + view.z * 0.2);
    camera.lookAt(view.x * 0.35, -6, -30 + view.z * 0.2);
    renderer.render(scene, camera);
  }
  return {
    resize, render,
    setLife(f) { life = f; },
    setView(x, z) { view = { x, z }; },
    dispose() { renderer.dispose(); canvas.remove(); },
  };
}
