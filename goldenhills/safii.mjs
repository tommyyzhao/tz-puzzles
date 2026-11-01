// Safii, peeking out of the old oak: only her eyes show. Her eyes (from the Safii project's design): tall glossy black
// ovals, each with a big upper-left catchlight and a small lower-right dot. Built facing +z; the renderer turns them to
// face the camera. `peek` pops them open; then they blink, glance about, and blink now and then for as long as she stays.
import * as THREE from 'three';

const pop = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

export function createSafii() {
  const root = new THREE.Group(), pair = new THREE.Group();
  root.add(pair);
  const black = new THREE.MeshBasicMaterial({ color: 0x0a0a0a }), shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyes = [-0.17, 0.17].map(x => {
    const e = new THREE.Group(); e.position.x = x;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), black); ball.scale.set(0.72, 1.3, 0.45);
    const hi = new THREE.Mesh(new THREE.CircleGeometry(0.038, 14), shine); hi.scale.y = 1.6; hi.position.set(-0.022, 0.06, 0.052);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.014, 8), shine); dot.position.set(0.03, -0.08, 0.051);
    e.add(ball, hi, dot); pair.add(e);
    return e;
  });
  // Drawn over the canopy (no depth test): she peeks out from inside the leaves, so the leaves must not cover her.
  root.traverse(o => { if (o.material) { o.material.depthTest = false; o.renderOrder = 13; } });
  root.visible = false;
  let t0 = -1e9, spoke = -1e9;
  function update(now) {
    if (!root.visible) return;
    const t = (now - t0) / 1000;
    // Opening, then two quick blinks and a look left and right; afterwards an idle blink every few seconds.
    const blink = [0.75, 1.0, 3.6].some(b => Math.abs(t - b) < 0.07) || now % 3700 < 120;
    const open = pop(t / 0.4) * (blink ? 0.1 : 1);
    eyes.forEach(e => e.scale.set(1, Math.max(0.001, open), 1));
    pair.position.x = t > 1.3 && t < 2.9 ? Math.sin((t - 1.3) / 1.6 * Math.PI * 2) * 0.05 : 0;
    pair.position.y = now - spoke < 1400 ? Math.abs(Math.sin((now - spoke) / 140)) * 0.03 : 0;   // a little bounce as she talks
  }
  return {
    root, update,
    peek(now = performance.now()) { t0 = now; root.visible = true; },
    show() { if (!root.visible) t0 = -1e9; root.visible = true; },   // already peeking (after the ending, on later visits)
    hide() { root.visible = false; },
    say(now = performance.now()) { spoke = now; },
    talking: () => root.visible && performance.now() - spoke < 4200,
  };
}
