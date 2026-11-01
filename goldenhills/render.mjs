// Three.js diorama for Stillwater. Reads model state; never decides legality, never delays input.
// The camera frames the clearing you stand in. Every box wears a live map of its interior on its lid, so the
// impossible nesting is always visible; stepping into an arch dives into that map, leaving pulls back out.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { water, key, supplyPath } from './model.mjs';
import { makeKit, buildRoom, miniature, hash, PAL } from './terrain.mjs';
import { createFx } from './fx.mjs';
import { createHero } from './hero.mjs';
import { createSafii } from './safii.mjs';

const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const BOX_TINTS = [0xe9dcc0, 0xd8e3c8, 0xe6d3c9, 0xcfdde3, 0xe8e0b8, 0xd9cfe6];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = t => Math.max(0, Math.min(1, t));
const easeOut = t => 1 - (1 - t) ** 3;

// Quality: 2 = full; 1 = lighter ground detail, DPR 1; 0 = also no shadows or butterflies. Starts from a device
// guess and steps down (never up) when frames stay slow, so a phone settles where it runs smoothly.
const TIERS = [{ dpr: 0.85, detail: 0.35, shadows: false }, { dpr: 1, detail: 0.6, shadows: true }, { dpr: 1.5, detail: 1, shadows: true }];
export function createRenderer(canvas, world, { frameOf, lifeOf, onCue, reducedMotion = false, maxDpr = 1.5, level = 2 } = {}) {
  const quality = { level: Math.max(0, Math.min(2, level)), slow: 0, frames: 0, acc: 0 };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const hemi = new THREE.HemisphereLight(0xfff7e8, 0x7a8466, 1.55);
  scene.add(hemi);
  const poolCount = new Set(Object.values(world.rooms).flatMap(r => r.grid.join('').match(/[0-9]/g) ?? [])).size;
  const sun = new THREE.DirectionalLight(0xfff0d4, 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.002;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const kit = makeKit();
  const fx = createFx();
  scene.add(fx.points);
  const fade = document.createElement('div');
  fade.className = 'fade';
  canvas.after(fade);

  // ---- Objects ----
  const geo = {
    box: new RoundedBoxGeometry(0.9, 0.78, 0.9, 3, 0.09).translate(0, 0.39, 0),
    lid: new THREE.PlaneGeometry(0.74, 0.74).rotateX(-Math.PI / 2),
    rim: new RoundedBoxGeometry(0.96, 0.08, 0.96, 2, 0.03),
    arch: archShape(),
    stone: rockGeometry(),
    ring: new THREE.RingGeometry(0.34, 0.45, 36).rotateX(-Math.PI / 2),
  };
  function archShape() {
    const s = new THREE.Shape();
    s.moveTo(-0.17, 0); s.lineTo(-0.17, 0.3); s.absarc(0, 0.3, 0.17, Math.PI, 0, true); s.lineTo(0.17, 0); s.lineTo(-0.17, 0);
    return new THREE.ShapeGeometry(s, 14);
  }
  function rockGeometry() {
    const g = new THREE.IcosahedronGeometry(0.36, 2), p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + (hash(Math.round(v.x * 40), Math.round(v.z * 40), Math.round(v.y * 40)) - 0.5) * 0.14;
      v.multiplyScalar(n * 0.86);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  const mat = {
    stone: new THREE.MeshStandardMaterial({ color: PAL.stone, roughness: 0.85, flatShading: true }),
    arch: new THREE.MeshBasicMaterial({ color: 0x241c16 }),
    sealed: new THREE.MeshBasicMaterial({ color: 0x5e5248 }),
    plug: new THREE.MeshStandardMaterial({ color: 0x9b9184, roughness: 0.9, side: THREE.DoubleSide }),
    rim: new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 0.8 }),
    ring: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }),
  };
  const boxIds = Object.keys(world.objects).filter(id => world.objects[id].interior);
  const tintOf = id => world.objects[id].tint ?? BOX_TINTS[boxIds.indexOf(id) % BOX_TINTS.length];
  for (const id of boxIds) kit.tint.set(id, tintOf(id));
  const shellMats = new Map(boxIds.map(id => [id, new THREE.MeshStandardMaterial({ color: tintOf(id), roughness: 0.82 })]));
  const lids = new Map();
  for (const id of boxIds) {
    const c = document.createElement('canvas'), t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    lids.set(id, { c, t, sig: '', mat: new THREE.MeshBasicMaterial({ map: t, toneMapped: false }) });
  }
  function boxMesh(id) {
    const o = world.objects[id], g = new THREE.Group();
    const shell = new THREE.Mesh(geo.box, shellMats.get(id));
    shell.castShadow = shell.receiveShadow = true;
    const rim = new THREE.Mesh(geo.rim, mat.rim); rim.position.y = 0.8; rim.castShadow = true;
    const lid = new THREE.Mesh(geo.lid, lids.get(id).mat); lid.position.y = 0.845;
    g.add(shell, rim, lid);
    const sealed = o.seal && (!state?.awake.includes(o.seal) || performance.now() < sealOpenAt);
    for (const side of o.arches ?? []) {
      const a = new THREE.Mesh(geo.arch, sealed ? mat.sealed : mat.arch), [dx, dz] = DIRV[side];
      a.position.set(dx * 0.452, 0, dz * 0.452); a.rotation.y = Math.atan2(dx, dz);
      g.add(a);
      if (sealed) {                       // a carved stone door fills the arch until its pool wakes
        const plug = new THREE.Mesh(geo.arch, mat.plug);
        plug.position.set(dx * 0.462, 0, dz * 0.462); plug.rotation.y = a.rotation.y; plug.scale.set(0.82, 0.86, 1);
        g.add(plug);
        if (state?.awake.includes(o.seal)) g.userData.opening = { plug, arch: a, dx, dz };
      }
    }
    return g;
  }
  function stoneMesh() {
    const g = new THREE.Group(), m = new THREE.Mesh(geo.stone, mat.stone);
    m.castShadow = m.receiveShadow = true; m.position.y = 0.31;
    g.add(m); g.userData.spin = m;
    return g;
  }

  // ---- Butterflies: a few over living ground, wandering around a home cell. ----
  const wingGeo = new THREE.PlaneGeometry(0.11, 0.08).translate(0.055, 0, 0).rotateX(-Math.PI / 2);
  const wingMats = [0xf7d65e, 0xf3a0b5, 0xfffaf0, 0xb7a6f2, 0xff9b5e].map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
  let flock = [];
  function spawnButterflies(s, life) {
    for (const b of flock) b.g.removeFromParent();
    flock = [];
    if (reducedMotion || quality.level < 1) return;
    const r = world.rooms[roomId], homes = [];
    for (let y = 0; y < r.grid.length; y++) for (let x = 0; x < r.grid[0].length; x++)
      if (r.grid[y][x] === '.' && life(x, y) && hash(x, y, 77) < 0.035) homes.push([x, y]);
    for (const [x, y] of homes.slice(0, 18)) {
      const g = new THREE.Group(), m = wingMats[Math.floor(hash(x, y, 78) * wingMats.length)];
      const L = new THREE.Mesh(wingGeo, m), R = new THREE.Mesh(wingGeo, m); R.scale.x = -1;
      g.add(L, R); roomGroup.add(g);
      const [hx, hz] = local(roomId, x, y);
      flock.push({ g, L, R, hx, hz, ph: hash(x, y, 79) * 100, sp: 0.6 + hash(x, y, 80) * 0.5 });
    }
  }
  function flutter(now) {
    for (const b of flock) {
      const t = now / 1000 * b.sp + b.ph;
      const x = b.hx + Math.sin(t * 0.7) * 1.3 + Math.sin(t * 1.9) * 0.3, z = b.hz + Math.cos(t * 0.53) * 1.1 + Math.sin(t * 2.3) * 0.25;
      const dx = Math.cos(t * 0.7) * 0.91, dz = -Math.sin(t * 0.53) * 0.58;
      b.g.position.set(x, 0.45 + Math.sin(t * 3.1) * 0.12, z);
      b.g.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
      const flap = Math.sin(now / 1000 * 22 + b.ph) * 1.1;
      b.L.rotation.z = flap; b.R.rotation.z = -flap;
    }
  }

  // ---- Hero ----
  const girl = createHero(), hero = new THREE.Group(), heroBody = new THREE.Group();
  // Safii lives in the old oak. Once it drinks, her eyes peek out of a dark gap in the leaves at the front of the canopy,
  // turned to face the camera. EYES: offset from the oak's centre (x, height, z toward the camera).
  const safii = createSafii(), EYES = [0.15, 1.42, 1.32];
  // A dark gap in the leaves around her eyes, soft-edged so it reads as shadow inside the canopy.
  const hollow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 28).scale(1.2, 0.8, 1), new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vP; void main() { vP = position.xy / vec2(0.6, 0.4); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec2 vP; void main() { float d = length(vP); gl_FragColor = vec4(0.1, 0.2, 0.07, 0.85 * smoothstep(1.0, 0.5, d)); }',
  }));
  hollow.position.z = -0.03; hollow.renderOrder = 12; safii.root.add(hollow);
  hollow.visible = false;
  function placeSafii() {
    const [x, z] = local('v', world.landmark.x, world.landmark.y);
    safii.root.position.set(x + EYES[0], EYES[1], z + EYES[2]); safii.root.rotation.set(-PITCH, 0, 0);
    roomGroup.add(safii.root); hollow.visible = safii.root.visible;
  }
  heroBody.add(girl.root);
  hero.add(heroBody);
  const hoverRing = new THREE.Mesh(geo.ring, mat.ring);
  hoverRing.visible = false;

  // Focus veil: a sheet of haze just above the tallest walls with a soft window over the current clearing,
  // so neighbouring clearings stay visible as context without competing for attention.
  const VEIL_H = 2.2;
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: { uCenter: { value: new THREE.Vector2() }, uHalf: { value: new THREE.Vector2(6, 6) }, uColor: { value: new THREE.Color(0xe9e6d8) }, uAmount: { value: 0.62 } },
    vertexShader: 'varying vec2 vP; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec2 uCenter; uniform vec2 uHalf; uniform vec3 uColor; uniform float uAmount; varying vec2 vP;
      void main() { vec2 d = abs(vP - uCenter) - uHalf; float o = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
        gl_FragColor = vec4(uColor, uAmount * smoothstep(-0.2, 1.6, o)); }`,
  }));
  veil.position.y = VEIL_H;
  veil.renderOrder = 10;
  scene.add(veil);

  // ---- Scene state ----
  let state = null, roomId = null, roomGroup = null, terrainSig = '', tweens = [], spillFx = [], sealOpenAt = 0;
  const objects = new Map(), since = new Map();
  let prevWet = new Map(), prevLife = new Set();
  const anim = { hero: null, objects: new Map(), bump: null, transition: null, finale: null, cine: null, wobble: null, impacts: new Map(), land: null };
  const rolled = new Map();    // each stone keeps the orientation its rolling left it in
  const DUST = [0xe8dcc0, 0xd9c49a, 0xcbb894];
  function dust(p, count, spread, dir = [0, 0]) {
    fx.emit({ at: [p.x + dir[0] * 0.35, 0.05, p.z + dir[1] * 0.35], vel: [dir[0] * 0.4, 0.5, dir[1] * 0.4], spread, count, color: DUST, life: 0.55, size: 0.11, gravity: -0.6, drag: 3, radius: 0.25 });
  }
  function impact(m, amt) { anim.impacts.set(m, { t0: performance.now(), amt }); }
  const cam = { x: 0, z: 0, span: 12, tx: 0, tz: 0, tspan: 12 };
  let facing = 0;

  const local = (rid, x, y) => { const r = world.rooms[rid]; return [x - r.grid[0].length / 2 + 0.5, y - r.grid.length / 2 + 0.5]; };
  const sigOf = s => JSON.stringify([s.player.room, s.awake, [...water(world, s).wet.keys()].filter(k => k.startsWith(s.player.room + ',')).sort(),
    Object.entries(s.objects).filter(([, p]) => p.sunk).map(([i]) => i), lifeSig(s)]);
  const lifeSig = s => world.lifeKey?.(s) ?? '';

  function rebuild(s, now, animate = true) {
    const { wet, spills } = water(world, s);
    const here = spills.filter(p => p.room === roomId);
    for (const p of here) if (!since.has('spill:' + key(p))) since.set('spill:' + key(p), Math.max(animate ? now : -1e9, sealOpenAt));
    spillFx = here.map(p => { const [dx, dz] = DIRV[p.dir], [x, z] = local(roomId, p.x, p.y); return { at: [x - dx * 0.5, 0.3, z - dz * 0.5], dir: [dx, dz], t0: since.get('spill:' + key(p)) }; });
    const life = (x, y) => lifeOf?.(s, roomId, x, y) ?? false;
    const r0 = world.rooms[roomId];
    if (animate) {
      // Water spreads outward along its flow distance; life follows a beat later, rippling from the water.
      const fresh = [...wet].filter(([k]) => !prevWet.has(k) && k.startsWith(roomId + ','));
      const base = fresh.length ? Math.min(...fresh.map(([, d]) => d)) : 0;
      // During the finale, new water appears just behind the pulse, and the heart fills when the pulse arrives.
      const fin = anim.finale;
      for (const [k, d] of fresh) since.set(k, !fin ? now + (d - base) * (reducedMotion ? 0 : 45)
        : now + (fin.when.get(k) ?? fin.tHeart + Math.max(0, d - base) * 0.03) * 1000);
      // The finale's life sweep starts at the heart, not at every wet cell.
      const seeds = fin ? [...wet].filter(([k]) => { const [rm, x, y] = k.split(','); return rm === roomId && r0.grid[+y][+x] === world.heart; }) : wet;
      // Life spreads as a front: breadth-first from the water that brought it, one ring every ~70 ms.
      const H = r0.grid.length, W = r0.grid[0].length, dist = new Map(), queue = [];
      const fresh2 = new Set();
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (life(x, y) && !prevLife.has(`${x},${y}`)) fresh2.add(`${x},${y}`);
      if (fresh2.size) {
        for (const [k] of seeds) {
          const [room, x, y] = k.split(','); if (room !== roomId) continue;
          const t = fin ? now + fin.tBloom * 1000 : since.get(k) ?? now;
          dist.set(`${x},${y}`, t); queue.push([+x, +y]);
        }
        for (let i = 0; i < queue.length; i++) {
          const [x, y] = queue[i], t = dist.get(`${x},${y}`);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy, nk = `${nx},${ny}`;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H || dist.has(nk)) continue;
            dist.set(nk, t + (reducedMotion ? 0 : fin ? SWEEP_RING * 1000 : 70)); queue.push([nx, ny]);
          }
        }
        for (const c of fresh2) {
          const [x, y] = c.split(',').map(Number);
          since.set(key({ room: roomId, x, y }), (dist.get(c) ?? now) + (reducedMotion ? 0 : 200 + hash(x, y, 1) * 120));
        }
      }
    }
    prevWet = wet;
    prevLife = new Set();
    const r = world.rooms[roomId];
    for (let y = 0; y < r.grid.length; y++) for (let x = 0; x < r.grid[0].length; x++) if (life(x, y)) prevLife.add(`${x},${y}`);
    if (roomGroup) { scene.remove(roomGroup); dispose(roomGroup); }
    const shellId = roomId === 'v' ? null : world.containerOf[roomId];
    const built = buildRoom(kit, world, s, roomId, { wet, spills, life, since, now, shell: shellId, detail: TIERS[quality.level].detail });
    roomGroup = built.group; tweens = built.tweens;
    scene.add(roomGroup);
    roomGroup.add(hero, hoverRing);
    objects.clear();
    for (const [id, p] of Object.entries(s.objects)) {
      if (p.room !== roomId) continue;
      const m = world.objects[id].interior ? boxMesh(id) : stoneMesh();
      if (rolled.has(id)) m.userData.spin?.rotation.set(rolled.get(id)[0], 0, rolled.get(id)[1]);
      const [x, z] = local(roomId, p.x, p.y);
      m.position.set(x, p.sunk ? -0.34 : 0, z);
      if (p.sunk) m.scale.set(1.15, 0.9, 1.15);
      roomGroup.add(m);
      objects.set(id, m);
    }
    updateLids(s, wet);
    if (roomId === 'v' && world.landmark) heartTree(s, now);
    if (roomId === 'v' && s.awake.includes(world.heart)) {
      if (!anim.finale) safii.show(); else if (!anim.finale.fired.has('safii-out')) safii.hide();
      placeSafii();
    }
    spawnButterflies(s, life);
    // Light warms as the valley wakes: flat, cool noon while dry; low golden sun once alive.
    const f = s.awake.length / Math.max(1, poolCount);
    sun.color.setHSL(0.1, 0.35 + f * 0.4, 0.86 - f * 0.06); sun.intensity = 2.2 + f * 0.5;
    hemi.color.setHSL(0.12 - f * 0.02, 0.5 + f * 0.3, 0.94); hemi.intensity = 1.6 - f * 0.15;
  }

  // The landmark at the heart: the old oak. Dry, it is a gnarled, half-bare oak with a few dusty leaves; once it
  // drinks it grows into a great, wide coast live oak, the canopy spreading low and dark green.
  function heartTree(s, now) {
    const [x, z] = local('v', world.landmark.x, world.landmark.y), alive = s.awake.includes(world.heart);
    const g = new THREE.Group(); g.position.set(x, -0.3, z);
    const bark = new THREE.MeshStandardMaterial({ color: alive ? 0x5a4636 : 0x7d6a58, roughness: 0.95, flatShading: true });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.48, 1.5, 9).translate(0, 0.75, 0), bark);
    trunk.castShadow = true; g.add(trunk);
    // Big limbs reaching out and up, the oak's signature silhouette.
    const limbs = [[0.4, 0.2, 1.1], [2.5, -0.1, 1.0], [4.3, 0.15, 0.95], [1.4, 0.4, 0.8]];
    for (const [a, tilt, len] of limbs) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.17, len, 7).translate(0, len / 2, 0), bark);
      l.position.y = 1.2; l.rotation.set(0, a, 0.95 + tilt); l.castShadow = true; g.add(l);
    }
    const leafA = new THREE.MeshStandardMaterial({ color: alive ? 0x2f6b2a : 0x6c6a45, roughness: 0.85, flatShading: true });
    const leafB = new THREE.MeshStandardMaterial({ color: alive ? 0x3f7f30 : 0x7a7450, roughness: 0.85, flatShading: true });
    const clumps = alive ? 13 : 4;
    for (let i = 0; i < clumps; i++) {
      const a = i * 2.4, r = i === 0 ? 0 : 0.7 + hash(i, 3) * 0.75, size = i === 0 ? 0.9 : 0.5 + hash(i, 4) * 0.32;
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), i % 3 ? leafA : leafB);
      c.scale.y = 0.62;
      c.position.set(Math.cos(a) * r, 2.0 + hash(i, 5) * 0.35 - r * 0.15, Math.sin(a) * r); c.castShadow = true; g.add(c);
    }
    if (alive) {
      const t0 = since.get(key({ room: 'v', x: world.landmark.x, y: world.landmark.y })) ?? -1e9;
      if (t0 > now - 2200) {
        g.scale.setScalar(0.55);
        tweens.push({ t0: t0 + 400, dur: 1800, apply: t => g.scale.setScalar(0.55 + 0.45 * Math.max(0, 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2)) });
      }
    }
    roomGroup.add(g);
  }
  const shared = new Set([...Object.values(geo), ...Object.values(kit.G), ...Object.values(mat), ...Object.values(kit.M), ...shellMats.values(), ...[...lids.values()].map(l => l.mat)]);
  function dispose(g) {
    g.traverse(o => {
      if (o.isInstancedMesh) o.dispose();
      if (o.geometry && !shared.has(o.geometry)) o.geometry.dispose();
      if (o.material && !shared.has(o.material)) o.material.dispose();
    });
  }
  function updateLids(s, wet) {
    for (const id of boxIds) {
      const inner = world.objects[id].interior, l = lids.get(id);
      const sig = JSON.stringify([s.awake, [...wet.keys()].filter(k => k.startsWith(inner + ',')).length,
        Object.entries(s.objects).filter(([, p]) => p.room === inner).map(([i, p]) => [i, p.x, p.y, p.sunk]),
        s.player.room === inner && [s.player.x, s.player.y]]);
      if (sig === l.sig) continue;
      l.sig = sig;
      miniature(world, s, inner, wet, l.c);
      l.t.needsUpdate = true;
    }
  }

  // ---- Showing a new state ----
  function show(next, events = []) {
    const now = performance.now(), prev = state;
    if (anim.finale && (events.length || !next.awake.includes(world.heart))) interrupt();   // any move, or undoing the heart
    if (events.length || prev?.awake.length !== next.awake.length) endCine();
    const sealId = world.containerOf.v, sealBasin = world.objects[sealId]?.seal;
    if (!reducedMotion && prev && next.player.room === 'v' && events.some(e => e.type === 'awaken' && e.basin === sealBasin)) planSeal(next, now);
    if (!reducedMotion && prev && roomId === 'v' && next.player.room === 'v' && events.some(e => e.type === 'awaken' && e.basin === world.heart))
      planFinale(next, now);
    const pass = events.find(e => e.type === 'enter' || e.type === 'exit');
    state = next;
    if (pass && !reducedMotion && prev) return startTransition(prev, next, pass, now);
    finishTransition();
    const sameRoom = roomId === next.player.room;
    if (!sameRoom) { roomId = next.player.room; prevWet = new Map(); prevLife = new Set(); since.clear(); terrainSig = ''; }
    const tsig = sigOf(next);
    if (tsig !== terrainSig) { terrainSig = tsig; rebuild(next, now, sameRoom && events.length > 0); }
    else {
      updateLids(next, water(world, next).wet);
      for (const [id, p] of Object.entries(next.objects)) {     // undo/redo can move objects without changing terrain
        const m = objects.get(id);
        if (!m) continue;
        if (p.room !== roomId) { terrainSig = ''; return show(next, events); }
        const [x, z] = local(roomId, p.x, p.y);
        m.position.set(x, p.sunk ? -0.34 : 0, z);
      }
      if (Object.entries(next.objects).some(([id, p]) => p.room === roomId && !objects.has(id))) { terrainSig = ''; return show(next, events); }
    }
    const [px, pz] = local(roomId, next.player.x, next.player.y);
    hero.position.set(px, 0, pz);
    const dir = events[0]?.dir;
    if (dir) facing = Math.atan2(DIRV[dir][0], DIRV[dir][1]);
    if (prev && sameRoom && events.length && !reducedMotion && (prev.player.x !== next.player.x || prev.player.y !== next.player.y)) {
      const [ox, oz] = local(roomId, prev.player.x, prev.player.y), push = events[0]?.type === 'push';
      anim.hero = { from: [ox, oz], to: [px, pz], t0: now, dur: push ? 150 : 105, push };
      for (const id of events[0]?.moved ?? []) {
        const a = prev.objects[id], b = next.objects[id], m = objects.get(id);
        if (!m || a.room !== roomId || b.room !== roomId) continue;
        const [ax, az] = local(roomId, a.x, a.y), r = rolled.get(id) ?? [0, 0];
        const [dx, dz] = [m.position.x - ax, m.position.z - az];
        rolled.set(id, [r[0] + dz * Math.PI / 2, r[1] - dx * Math.PI / 2]);
        anim.objects.set(id, { from: [ax, az], to: [m.position.x, m.position.z], t0: now, dur: 150, sunk: b.sunk, r0x: r[0], r0z: r[1] });
        m.position.x = ax; m.position.z = az;
      }
    } else { anim.hero = null; anim.objects.clear(); }
    if (!sameRoom || !prev) snapCamera(); else target();
  }

  // ---- Arch transitions: dive into a box's lid / pull back out to the room around it ----
  // The stone box holds the valley, so passing through it gets a longer, legible move: leaving the valley's edge pulls
  // back over the whole valley, then dives into the box's lid (a map of that same valley) and comes out beside it.
  const VALLEY_SPAN = (world.rooms.v?.grid.length ?? 31) + 1;
  function startTransition(prev, next, e, now) {
    finishTransition();
    const inward = e.type === 'enter', box = prev.objects[e.box], wb = e.box === world.containerOf.v;
    if (wb && !inward) { cam.tx = 0; cam.tz = 0; cam.tspan = VALLEY_SPAN; anim.transition = { t0: now, dur: 2400, next, e, inward, wb, midAt: 0.5, fw: 0.08, speed: 3.4 }; return; }
    if (inward && box && box.room === roomId) { [cam.tx, cam.tz] = onLid(roomId, box); cam.tspan = wb ? 0.95 : 1.4; }
    else cam.tspan = cam.span * 1.8;
    anim.transition = wb ? { t0: now, dur: 1900, next, e, inward, wb, midAt: 0.42, fw: 0.08, speed: 5 } : { t0: now, dur: 240, next, e, inward, midAt: 0.5, fw: 0.5, speed: 16 };
  }
  // Ground point the camera looks at to centre a box's lid (it stands LID_Y above the ground).
  const LID_Y = 0.845;
  function onLid(room, p) { const [x, z] = local(room, p.x, p.y); return [x, z - LID_Y / Math.tan(PITCH)]; }
  function midTransition() {
    const tr = anim.transition, next = tr.next;
    roomId = next.player.room; prevWet = new Map(); prevLife = new Set(); since.clear();
    terrainSig = sigOf(next);
    rebuild(next, performance.now(), false);
    const [px, pz] = local(roomId, next.player.x, next.player.y);
    hero.position.set(px, 0, pz);
    if (tr.e.dir) facing = hero.rotation.y = Math.atan2(DIRV[tr.e.dir][0], DIRV[tr.e.dir][1]);
    anim.hero = null; anim.objects.clear();
    target();
    if (tr.wb && tr.inward) { cam.x = 0; cam.z = 0; cam.span = VALLEY_SPAN; tr.speed = 2.6; }
    else if (tr.inward) { cam.x = cam.tx; cam.z = cam.tz; cam.span = cam.tspan * 1.8; }
    else {
      const box = next.objects[tr.e.box];
      if (box && box.room === roomId) { [cam.x, cam.z] = onLid(roomId, box); cam.span = tr.wb ? 0.95 : 1.4; }
      else snapCamera();
      if (tr.wb) tr.speed = 1.7;
    }
    tr.mid = true;
  }
  function finishTransition() {
    if (!anim.transition) return;
    if (!anim.transition.mid) midTransition();
    anim.transition = null;
    fade.style.opacity = '0';
  }

  function bump(dir) {
    if (reducedMotion || !state) return;
    facing = Math.atan2(DIRV[dir][0], DIRV[dir][1]);
    anim.bump = { dir: DIRV[dir], t0: performance.now(), dur: 110 };
  }

  // ---- Camera: orthographic, fixed pitch, grid-aligned; fits a square patch between the HUD bars ----
  // Frame the clearing; on narrow screens, where a whole clearing would make tiles tiny, zoom to ~40 px tiles
  // and follow the player, clamped so the view never leaves the clearing.
  const MIN_TILE = 40;
  function target(follow = !anim.finale && !anim.cine) {
    const f = frameOf?.(state);
    if (f && state.player.room === f.room) { [cam.tx, cam.tz] = local(f.room, f.cx, f.cy); cam.tspan = f.span; }
    else { const r = world.rooms[state.player.room]; cam.tx = 0; cam.tz = 0; cam.tspan = Math.max(r.grid.length, r.grid[0].length) + 2.2; }
    const W = canvas.clientWidth || 1;
    if (follow && W / cam.tspan < MIN_TILE) {
      const span = W / MIN_TILE, [px, pz] = local(state.player.room, state.player.x, state.player.y);
      const half = cam.tspan / 2, H = canvas.clientHeight || 1;
      const visZ = (H - insets.top - insets.bottom) / MIN_TILE / Math.sin(PITCH) / 2;
      // Follow on an axis only when the clearing overflows it; otherwise the clamp inverts, so stay centred.
      const follow = (c, p, vis) => vis >= half ? c : Math.max(c - half + vis, Math.min(c + half - vis, p));
      cam.tx = follow(cam.tx, px, span / 2);
      cam.tz = follow(cam.tz, pz, visZ);
      cam.tspan = span;
    }
  }
  // The veil window follows the framed clearing; it opens fully for whole-room views and the finale.
  function focus() {
    const f = frameOf?.(state), whole = anim.finale || anim.cine || !f || f.room !== state.player.room;
    const [x, z] = whole ? [cam.x, cam.z] : local(f.room, f.cx, f.cy);
    return { x, z, half: whole ? 999 : f.span / 2 - 0.6, amount: whole ? 0 : 0.62 };
  }
  function snapCamera() { target(); cam.x = cam.tx; cam.z = cam.tz; cam.span = cam.tspan; }

  const insets = { top: 64, bottom: 84 };
  setInsets();
  function setInsets() { const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 700; insets.bottom = coarse ? 136 : 84; }
  const PITCH = THREE.MathUtils.degToRad(56), UP = new THREE.Vector3();
  function place(dt) {
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * (anim.transition ? anim.transition.speed : anim.finale ? anim.finale.speed : anim.cine ? anim.cine.speed : 5));
    cam.x = lerp(cam.x, cam.tx, k); cam.z = lerp(cam.z, cam.tz, k); cam.span = lerp(cam.span, cam.tspan, k);
    const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1, usable = Math.max(120, H - insets.top - insets.bottom);
    const patchH = cam.span * Math.sin(PITCH) + 1.1 * Math.cos(PITCH);
    // Portrait phones: a clearing is wider than the screen allows; fit to width but never below 28 px a tile.
    const scale = Math.min(W / cam.span, usable / patchH);
    camera.left = -W / scale / 2; camera.right = W / scale / 2; camera.top = H / scale / 2; camera.bottom = -H / scale / 2;
    camera.updateProjectionMatrix();
    const shift = (insets.bottom - insets.top) / 2 / scale, d = 50;
    camera.position.set(cam.x, Math.sin(PITCH) * d, cam.z + Math.cos(PITCH) * d);
    camera.lookAt(cam.x, 0, cam.z);
    camera.position.addScaledVector(UP.set(0, 1, 0).applyQuaternion(camera.quaternion), shift);
    camera.updateMatrixWorld();
    sun.position.set(cam.x - 7, 14, cam.z + 5); sun.target.position.set(cam.x, 0, cam.z);
    // The veil floats VEIL_H above the ground; slide its window along the view ray so it sits over the clearing.
    const f = focus(), viewDir = new THREE.Vector3(0, -Math.sin(PITCH), -Math.cos(PITCH));
    const t = VEIL_H / Math.sin(PITCH);
    veil.material.uniforms.uCenter.value.set(f.x - viewDir.x * t, f.z - viewDir.z * t);
    veil.material.uniforms.uHalf.value.set(f.half, f.half);
    veil.material.uniforms.uAmount.value = f.amount;
    const sc = sun.shadow.camera, half = Math.max(4, cam.span * 0.85);
    sc.left = sc.bottom = -half; sc.right = sc.top = half; sc.near = 1; sc.far = 45; sc.updateProjectionMatrix();
  }

  // ---- Frame ----
  let last = performance.now();
  const nearestAngle = (from, to) => { let d = (to - from) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return from + d; };
  // Average frame time over ~2 s windows; three slow windows in a row drop one tier and rebuild.
  function watchFrames(raw) {
    if (document.hidden || raw > 250) return;
    quality.acc += raw; quality.frames++;
    if (quality.acc < 2000) return;
    const avg = quality.acc / quality.frames;
    quality.acc = quality.frames = 0;
    quality.slow = avg > 24 ? quality.slow + 1 : 0;
    if (quality.slow >= 3 && quality.level > 0) {
      quality.level--; quality.slow = 0;
      resize(); terrainSig = ''; if (state) show(state);
    }
  }
  function render(now = performance.now()) {
    watchFrames(now - last);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    kit.time.value = now / 1000;
    if (!state || !roomGroup) return;
    const tr = anim.transition;
    if (tr) {
      const t = (now - tr.t0) / tr.dur;
      if (!tr.mid && t >= tr.midAt) midTransition();
      fade.style.opacity = String(0.85 * clamp01(1 - Math.abs(t - tr.midAt) / tr.fw) ** (t < tr.midAt ? 2 : 1));
      if (t >= 1) { anim.transition = null; fade.style.opacity = '0'; }
    }
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i], t = (now - tw.t0) / tw.dur;
      tw.apply(clamp01(t));
      if (t >= 1) tweens.splice(i, 1);
    }
    const [px, pz] = local(roomId, state.player.x, state.player.y);
    let lean = 0, squash = 0;
    if (anim.hero) {
      const a = anim.hero, t = clamp01((now - a.t0) / a.dur), e = easeOut(t);
      hero.position.set(lerp(a.from[0], a.to[0], e), Math.sin(t * Math.PI) * (a.push ? 0.03 : 0.07), lerp(a.from[1], a.to[1], e));
      lean = a.push ? Math.sin(t * Math.PI) * 0.28 : 0;
      squash = t < 0.5 ? -Math.sin(t * 2 * Math.PI) * 0.05 : 0;           // stretch on the hop
      if (t >= 1) { anim.hero = null; anim.land = now; if (!reducedMotion) dust(hero.position, 3, 0.35); }
    } else if (!anim.bump && state.player.room === roomId) hero.position.set(px, 0, pz);
    const tl = (now - (anim.land ?? -1e9)) / 140;
    if (tl < 1) squash = Math.sin(tl * Math.PI) * 0.07;                    // settle on landing
    if (anim.bump) {
      const b = anim.bump, t = clamp01((now - b.t0) / b.dur), s = Math.sin(t * Math.PI) * 0.13;
      hero.position.set(px + b.dir[0] * s, 0, pz + b.dir[1] * s);
      heroBody.scale.set(1 + s * 0.4, 1 - s * 0.5, 1 + s * 0.4);
      if (t >= 1) { anim.bump = null; heroBody.scale.set(1, 1, 1); }
    } else heroBody.scale.set(1 + squash * 0.6, 1 - squash + Math.sin(now / 520) * 0.012, 1 + squash * 0.6);
    hero.rotation.y = lerp(hero.rotation.y, nearestAngle(hero.rotation.y, facing), reducedMotion ? 1 : 0.35);
    heroBody.rotation.x = lean;
    girl.update(now, dt, { moving: !!anim.hero, push: !!anim.hero?.push });
    flutter(now);
    safii.update(now);
    for (const [id, a] of anim.objects) {
      const m = objects.get(id), t = clamp01((now - a.t0) / a.dur), e = easeOut(t);
      if (!m) { anim.objects.delete(id); continue; }
      m.position.x = lerp(a.from[0], a.to[0], e); m.position.z = lerp(a.from[1], a.to[1], e);
      m.position.y = a.sunk ? lerp(0, -0.34, clamp01(t * 1.6 - 0.6)) : 0;
      const box = !!world.objects[id].interior, dx = a.to[0] - a.from[0], dz = a.to[1] - a.from[1];
      if (!box && !a.sunk) {                       // stones roll: a quarter-turn per tile, about the push axis
        m.userData.spin?.rotation.set(a.r0x + dz * e * Math.PI / 2, 0, a.r0z - dx * e * Math.PI / 2);
      }
      if (box) m.rotation.set(-dz * Math.sin(t * Math.PI) * 0.06, 0, dx * Math.sin(t * Math.PI) * 0.06);   // boxes tip as they slide
      const scrape = t < 1 && Math.random() < 0.6;
      if (scrape && !reducedMotion) dust(m.position, 1, 0.25, [-dx, -dz]);
      if (t >= 1) {
        anim.objects.delete(id);
        if (box) m.rotation.set(0, 0, 0);
        if (!reducedMotion) { dust(m.position, a.sunk ? 14 : 6, a.sunk ? 0.6 : 0.4); impact(m, a.sunk ? 0.16 : 0.09); }
      }
    }
    for (const [m, w] of anim.impacts) {          // squash then spring back after a push lands
      const t = (now - w.t0) / 260;
      const k = t < 1 ? Math.sin(t * Math.PI) * w.amt * (1 - t) : 0;
      m.scale.set(1 + k, 1 - k * 1.4, 1 + k);
      if (t >= 1) anim.impacts.delete(m);
    }
    if (anim.finale) runFinale(now);
    if (anim.cine) { if (anim.transition) anim.cine.t0 = now; else runCine(now); }
    if (anim.wobble) {
      const w = anim.wobble, m = objects.get(w.id), t = (now - w.t0) / 900;
      if (m) m.rotation.z = t < 1 ? Math.sin(t * Math.PI * 6) * 0.09 * (1 - t) : 0;
      if (t >= 1) anim.wobble = null;
    }
    const op = objects.get(world.containerOf.v)?.userData.opening;
    if (op && now >= sealOpenAt) {
      op.plug.removeFromParent(); op.arch.material = mat.arch;
      const m = objects.get(world.containerOf.v), at = [m.position.x + op.dx * 0.48, 0.3, m.position.z + op.dz * 0.48];
      fx.emit({ at, vel: [op.dx * 1.2, 1.4, op.dz * 1.2], spread: 1.6, count: 40, color: [0x9b9184, 0xb8afa2, 0x7d7468], life: 1.1, size: 0.13, gravity: -6, radius: 0.2 });
      delete m.userData.opening;
    }
    if (!reducedMotion) for (const sp of spillFx) if (now >= sp.t0) {
      const n = Math.random() < dt * 30 ? 2 : 0;
      if (n) fx.emit({ at: sp.at, vel: [sp.dir[0] * 1.3, 0.9, sp.dir[1] * 1.3], spread: 0.6, count: n, color: [0xffffff, 0xbfe8f7, 0x9fd8f0], life: 0.55, size: 0.09, gravity: -6, drag: 0.8, radius: 0.15 });
    }
    place(dt);
    fx.update(dt, pxPerUnit());
    renderer.render(scene, camera);
  }

  // ---- Finale: the last push. The river already runs off the valley's edge and out of the stone box (the seal
  // cinematic showed that); now it runs on from the box's arch to the heart. A bright pulse leads the water, the heart
  // fills, the tree grows, and life sweeps outward from the heart across the whole valley. ----
  const pulse = new THREE.Group();
  // Drawn over everything: the pulse passes under culverts and through boxes, and must stay in sight.
  const pulseHalo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), new THREE.MeshBasicMaterial({ color: 0xbff0ff, transparent: true, opacity: 0.45, depthWrite: false, depthTest: false }));
  pulse.add(new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthTest: false })), pulseHalo);
  pulse.children.forEach(m => (m.renderOrder = 12));
  pulse.visible = false; pulse.renderOrder = 11; scene.add(pulse);
  const SWEEP_RING = 0.11;   // seconds per ring of the life sweep out from the heart
  function planFinale(s, now) {
    const toValley = p => { for (let i = 0; i < 12 && p && p.room !== 'v'; i++) p = s.objects[world.containerOf[p.room]]; return p?.room === 'v' ? p : null; };
    const cells = [];
    for (const p of supplyPath(world, s, world.heart)) {
      const q = toValley(p), l = cells.at(-1);
      if (q && !(l && l.x === q.x && l.y === q.y)) cells.push({ x: q.x, y: q.y });
    }
    // The river re-enters the valley from the stone box: the one jump in the path. The finale starts there.
    const j = cells.findIndex((c, i) => i && Math.abs(c.x - cells[i - 1].x) + Math.abs(c.y - cells[i - 1].y) > 1);
    const box = s.objects[world.containerOf.v], B = j < 0 ? cells.slice(-14) : cells.slice(j);
    const lead = 0.7, step = 0.24, tHeart = lead + B.length * step;
    const when = new Map(B.map((c, i) => [key({ room: 'v', ...c }), lead + (i + 1) * step]));
    anim.finale = { t0: now, B: j >= 0 && box ? [box, ...B] : B, lead, step, tHeart, tBloom: tHeart + 0.9, when, fired: new Set(), speed: 4 };
  }
  const along = (cells, u) => {
    const i = Math.max(0, Math.min(cells.length - 1, Math.floor(u))), a = cells[i], b = cells[Math.min(cells.length - 1, i + 1)], f = clamp01(u - i);
    return local('v', lerp(a.x, b.x, f), lerp(a.y, b.y, f));
  };
  function runFinale(now) {
    const f = anim.finale, t = (now - f.t0) / 1000, cue = (name, when) => { if (when && !f.fired.has(name)) { f.fired.add(name); onCue?.(name); return true; } };
    const heart = world.landmark ? local('v', world.landmark.x, world.landmark.y) : [0, 0], end = f.tHeart + 12.4;
    let p = null;
    cue('start', true);
    if (t < f.tHeart) { p = along(f.B, (t - f.lead) / f.step); f.speed = 4.5; [cam.tx, cam.tz] = p; cam.tspan = 8; }
    else if (t < f.tHeart + 2.8) {
      if (cue('heart', true)) {
        fx.emit({ at: [heart[0], 0.2, heart[1]], vel: [0, 3.2, 0], spread: 3.2, count: 120, color: [0xf6c3cf, 0xfff3f6, 0xf7d65e, 0xbfe8f7], life: 2.6, size: 0.12, gravity: -1.1, drag: 1.2, radius: 1.2 });
        girl.celebrate(now + 500);
      }
      f.speed = 2.2; [cam.tx, cam.tz] = heart; cam.tspan = 9;
    } else if (t < f.tHeart + 6.4) { cue('bloom', true); f.speed = 1.2; cam.tx = 0; cam.tz = 0; cam.tspan = world.rooms.v.grid.length + 1; }
    else if (t < f.tHeart + 11.2) {
      // Safii's eyes peek out of the old oak, blink, look about, then she says hi.
      f.speed = 2; [cam.tx, cam.tz] = local('v', world.landmark.x + 0.15, world.landmark.y + 1.6); cam.tspan = 4.6;
      if (t > f.tHeart + 7.2 && cue('safii-out', true)) { safii.peek(now); placeSafii(); }
      if (t > f.tHeart + 7.2 + 2.2 && cue('safii-hi', true)) safii.say(now);
    } else { f.speed = 2; target(true); }   // settle back on the player
    // The stone box swells as the water comes out of it.
    const bm = objects.get(world.containerOf.v), kb = (t - f.lead + 0.5) / 0.7;
    bm?.scale.setScalar(kb > 0 && kb < 1 ? 1 + Math.sin(kb * Math.PI) * 0.18 : 1);
    pulse.visible = !!p;
    if (p) {
      pulse.position.set(p[0], 0.3, p[1]);
      pulseHalo.scale.setScalar(1 + Math.sin(now / 90) * 0.15);
      if (Math.random() < 0.5) fx.emit({ at: [p[0], 0.25, p[1]], vel: [0, 0.5, 0], spread: 0.5, count: 1, color: [0xffffff, 0xbfe8f7], life: 0.7, size: 0.1, gravity: 0.2 });
    }
    if (t > end) { anim.finale = null; pulse.visible = false; target(); cue('done', true); }
  }
  // Screen position just above Safii's head while she is talking, for the speech bubble; null otherwise.
  const head = new THREE.Vector3();
  function safiiSpeech() {
    if (!safii.talking() || !safii.root.parent || roomId !== 'v') return null;
    safii.root.getWorldPosition(head); head.y += 0.42;
    const v = head.project(camera);
    return [(v.x + 1) / 2 * canvas.clientWidth, (1 - v.y) / 2 * canvas.clientHeight];
  }
  // ---- Short cinematics: a list of camera shots, each held for `dur` seconds; any input ends them. ----
  function cine(shots, now = performance.now()) {
    if (reducedMotion || !shots.length) return;
    anim.cine = { shots, i: -1, t0: now, speed: 3 };
  }
  function runCine(now) {
    const c = anim.cine, t = (now - c.t0) / 1000;
    let acc = 0, i = 0;
    for (; i < c.shots.length && t >= acc + c.shots[i].dur; i++) acc += c.shots[i].dur;
    if (i >= c.shots.length) { anim.cine = null; target(); onCue?.('cine-done'); return; }
    const sh = c.shots[i];
    if (i !== c.i) { c.i = i; sh.start?.(now); if (sh.cue) onCue?.(sh.cue); }
    c.speed = sh.speed ?? 3;
    if (sh.at) { [cam.tx, cam.tz] = sh.at; cam.tspan = sh.span ?? cam.tspan; } else target(true);
    sh.during?.(now, (t - acc) / sh.dur);
  }
  function endCine() { sealOpenAt = Math.min(sealOpenAt, performance.now()); if (anim.cine) { anim.cine = null; target(); } }
  // Basin 6 opens the stone box: show the water reaching the valley's east edge, then the box, whose door crumbles
  // as the same water pours out of its arch. Only then back to the player.
  function planSeal(s, now) {
    const g = world.rooms.v.grid, W = g[0].length;
    const edge = [...water(world, s).wet.keys()].map(k => k.split(',')).filter(([r, x]) => r === 'v' && +x === W - 1).map(([, x, y]) => [+x, +y])[0];
    const box = s.objects[world.containerOf.v];
    if (!edge || !box || box.room !== 'v') return;
    sealOpenAt = now + 2600;
    const e = local('v', edge[0] - 2, edge[1]), b = local('v', box.x, box.y);
    cine([
      { at: e, span: 8, dur: 2.6, speed: 2.6, cue: 'seal-edge' },
      { at: b, span: 5.5, dur: 3.6, speed: 2.4, cue: 'seal-box' },
      { dur: 1.2, speed: 2.4 },
    ], now);
  }
  // The opening look: the dry heart the valley needs, then back to the player.
  function intro() {
    if (!world.landmark || reducedMotion) return;
    const heart = local('v', world.landmark.x, world.landmark.y);
    cam.x = cam.tx = heart[0]; cam.z = cam.tz = heart[1]; cam.span = cam.tspan = 8;
    cine([{ at: heart, span: 8, dur: 2.4, speed: 2 }, { dur: 1.4, speed: 2.2 }]);
  }
  // A nudge toward the heart: the stone box wobbles, and sparks run up the dry channel to the heart.
  function nudge() {
    if (reducedMotion || !state || roomId !== 'v') return;
    const id = world.containerOf.v, now = performance.now();
    if (objects.has(id)) anim.wobble = { id, t0: now };
    dryChannel(state).forEach((c, i) => setTimeout(() => {
      if (roomId !== 'v') return;
      const [x, z] = local('v', c.x, c.y);
      fx.emit({ at: [x, 0.05, z], vel: [0, 0.6, 0], spread: 0.4, count: 5, color: [0xfff6c8, 0xbfe8f7], life: 0.9, size: 0.1, gravity: 0.3 });
    }, 300 + i * 70));
  }
  // Dry channel cells that lead to the heart, nearest the heart last.
  function dryChannel(s) {
    const { wet } = water(world, s), g = world.rooms.v.grid, seen = new Set(), out = [], queue = [];
    g.forEach((row, y) => [...row].forEach((c, x) => { if (c === world.heart) { queue.push([x, y]); seen.add(x + ',' + y); } }));
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, c = g[ny]?.[nx], k = nx + ',' + ny;
        if (seen.has(k) || !(c === '~' || c === '%') || wet.has(key({ room: 'v', x: nx, y: ny }))) continue;
        seen.add(k); queue.push([nx, ny]); out.push({ x: nx, y: ny });
      }
    }
    return out.reverse();
  }

  function interrupt() {
    endCine();
    if (!anim.finale) return;
    const f = anim.finale;
    if (state?.awake.includes(world.heart) && roomId === 'v') { safii.show(); placeSafii(); }
    anim.finale = null; pulse.visible = false; target();
    objects.get(world.containerOf.v)?.scale.setScalar(1);
    if (!f.fired.has('done')) onCue?.('done');
  }

  // ---- Pointer helpers ----
  function resize() {
    setInsets();
    renderer.shadowMap.enabled = sun.castShadow = TIERS[quality.level].shadows;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, maxDpr, TIERS[quality.level].dpr));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  }
  function project(x, y, lift = 0.9) {
    if (!state || !roomId) return [0, 0, false];
    const [px, pz] = local(roomId, x, y), v = new THREE.Vector3(px, lift, pz).project(camera);
    return [(v.x + 1) / 2 * canvas.clientWidth, (1 - v.y) / 2 * canvas.clientHeight, Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05];
  }
  const ray = new THREE.Raycaster(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
  function pick(cx, cy) {
    if (!state || anim.transition) return null;
    ndc.set(cx / canvas.clientWidth * 2 - 1, -(cy / canvas.clientHeight * 2 - 1));
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(ground, hit)) return null;
    const r = world.rooms[roomId];
    return { x: Math.floor(hit.x + r.grid[0].length / 2), y: Math.floor(hit.z + r.grid.length / 2) };
  }
  function hover(cell) {
    const r = state && world.rooms[roomId];
    if (!cell || !r || cell.x < 0 || cell.y < 0 || cell.x >= r.grid[0].length || cell.y >= r.grid.length) return void (hoverRing.visible = false);
    const [x, z] = local(roomId, cell.x, cell.y);
    hoverRing.position.set(x, 0.03, z); hoverRing.visible = true;
  }
  function ping(cell, ok) {
    if (!roomGroup) return;
    const m = new THREE.Mesh(geo.ring, new THREE.MeshBasicMaterial({ color: ok ? 0xffffff : 0xe0623f, transparent: true, depthWrite: false }));
    const [x, z] = local(roomId, cell.x, cell.y);
    m.position.set(x, 0.04, z); roomGroup.add(m);
    tweens.push({ t0: performance.now(), dur: 450, apply: t => { m.scale.setScalar(1 + t * 0.5); m.material.opacity = 0.85 * (1 - t); if (t >= 1) { m.removeFromParent(); m.material.dispose(); } } });
  }

  function pxPerUnit() { return (canvas.clientHeight || 1) / (camera.top - camera.bottom); }
  const info = () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, programs: renderer.info.programs?.length, shadows: renderer.shadowMap.enabled, dpr: renderer.getPixelRatio(), level: quality.level });
  return { info, renderNow: () => renderer.render(scene, camera), show, bump, render, resize, project, pick, hover, ping, interrupt, intro, nudge, insets, safiiSpeech, quality: () => quality.level, busy: () => !!(anim.finale || anim.cine) };
}
