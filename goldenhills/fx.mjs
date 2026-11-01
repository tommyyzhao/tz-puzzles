// Soft round particles for dust, spray, sparkles and petals: one Points draw call, CPU-simulated.
import * as THREE from 'three';

export function createFx(max = 900) {
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3), size = new Float32Array(max), alpha = new Float32Array(max);
  const vel = new Float32Array(max * 3), life = new Float32Array(max), age = new Float32Array(max), grav = new Float32Array(max), drag = new Float32Array(max), size0 = new Float32Array(max);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const scale = { value: 40 };
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uScale: scale },
    vertexShader: `attribute float size; attribute float alpha; attribute vec3 color; uniform float uScale; varying vec3 vC; varying float vA;
      void main() { vC = color; vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * uScale; }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vC, vA * smoothstep(0.5, 0.25, d)); }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; points.renderOrder = 6;
  let next = 0;
  const C = new THREE.Color();

  // Spawn `count` particles around `at` (local room coords). Velocities are `vel` plus a random `spread`.
  function emit({ at, vel: v = [0, 0, 0], spread = 0.5, count = 8, color = 0xffffff, jitter = 0.04, life: l = 0.8, size: s = 0.12, gravity = -3, drag: dr = 1.5, radius = 0.1 }) {
    for (let n = 0; n < count; n++) {
      const i = next; next = (next + 1) % max;
      const a = Math.random() * 6.283, r = Math.random() * radius;
      pos[i * 3] = at[0] + Math.cos(a) * r; pos[i * 3 + 1] = at[1]; pos[i * 3 + 2] = at[2] + Math.sin(a) * r;
      vel[i * 3] = v[0] + (Math.random() - 0.5) * spread; vel[i * 3 + 1] = v[1] + Math.random() * spread * 0.5; vel[i * 3 + 2] = v[2] + (Math.random() - 0.5) * spread;
      C.set(Array.isArray(color) ? color[Math.floor(Math.random() * color.length)] : color).offsetHSL(0, 0, (Math.random() - 0.5) * jitter * 2);
      col[i * 3] = C.r; col[i * 3 + 1] = C.g; col[i * 3 + 2] = C.b;
      life[i] = l * (0.7 + Math.random() * 0.6); age[i] = 0; grav[i] = gravity; drag[i] = dr; size0[i] = s * (0.7 + Math.random() * 0.6);
    }
  }
  function update(dt, pxPerUnit) {
    scale.value = pxPerUnit * Math.min(devicePixelRatio || 1, 2);
    for (let i = 0; i < max; i++) {
      if (age[i] >= life[i]) { alpha[i] = 0; size[i] = 0; continue; }
      age[i] += dt;
      const k = Math.exp(-drag[i] * dt);
      vel[i * 3] *= k; vel[i * 3 + 2] *= k; vel[i * 3 + 1] = vel[i * 3 + 1] * k + grav[i] * dt;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      const t = age[i] / life[i];
      alpha[i] = Math.min(1, t * 8) * (1 - t) ** 1.5; size[i] = size0[i] * (1 - t * 0.4);
    }
    for (const a of ['position', 'color', 'size', 'alpha']) geo.attributes[a].needsUpdate = true;
  }
  function clear() { age.fill(1e9); }
  clear();
  return { points, emit, update, clear };
}
