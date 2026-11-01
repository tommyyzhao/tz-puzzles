// Geometry for one room of the valley: terraced ground, sunken channels, flowing water, grass and flowers.
// Pure presentation. Cells that newly get wet or come alive animate in via `since` timestamps kept by the caller.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { cellAt, isBasin, key, water } from './model.mjs';

export const PAL = {
  skyTop: '#cfe3e6', skyBottom: '#efe6d2',
  rock: 0x9a8268, rockDark: 0x5f4c3a, dryTop: 0xe2be6e, dryTop2: 0xd6ae5c, liveTop: 0x6fcf3a, liveTop2: 0x52b82c,
  wallDry: 0xc9a25a, wallLive: 0x4caa2e, bed: 0x9b7a55, bedWet: 0x6f5a42, mud: 0xae8a58,
  water: 0x3e9fd2, waterLight: 0xbfe8f7, pit: 0x2a221c,
  stone: 0xc3c7cc, wood: 0xa97d4f, woodDark: 0x7a5636,
  grass: 0x4fae2e, dryTuft: 0xd9b25e, petals: [0xff8a1c, 0x8a6fe0, 0xf5d93a, 0xfff8ec, 0xff7a12],
  leaf: 0x2f5d2a, leaf2: 0x3e6e30, trunk: 0x5a4636, oakDry: 0x55613a, oakDry2: 0x4b5634,
};
const WATERY = c => c === '~' || c === '%' || c === '+' || isBasin(c) || c === 'S';

export function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function makeKit() {
  const time = { value: 0 };
  const G = {
    unit: new THREE.BoxGeometry(1, 1, 1).translate(0, -0.5, 0),            // column hanging below y=0
    cap: new RoundedBoxGeometry(1, 0.12, 1, 2, 0.04).translate(0, -0.06, 0),
    slab: new THREE.BoxGeometry(1, 1, 1),
    plane: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    blade: new THREE.ConeGeometry(0.03, 0.26, 3).translate(0, 0.13, 0),
    petal: new THREE.IcosahedronGeometry(0.055, 0),
    crown: new THREE.IcosahedronGeometry(0.3, 1),
    trunk: new THREE.CylinderGeometry(0.04, 0.06, 0.3, 6).translate(0, 0.15, 0),
    ring: new THREE.TorusGeometry(0.33, 0.08, 8, 24).rotateX(Math.PI / 2),
    kerb: new THREE.TorusGeometry(0.36, 0.06, 6, 28).rotateX(Math.PI / 2),
    lily: new THREE.CircleGeometry(0.12, 10, 0.4, 5.6).rotateX(-Math.PI / 2),
    pebble: new THREE.IcosahedronGeometry(0.05, 0).scale(1, 0.55, 1),
    stem: new THREE.CylinderGeometry(0.008, 0.01, 0.2, 4).translate(0, 0.1, 0),
    bloom: new THREE.IcosahedronGeometry(0.045, 0).scale(1, 0.6, 1).translate(0, 0.2, 0),
    bush: new THREE.IcosahedronGeometry(0.17, 1).scale(1, 0.75, 1).translate(0, 0.1, 0),
    mushCap: new THREE.SphereGeometry(0.05, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.06, 0),
    puddle: new THREE.CircleGeometry(0.42, 20).rotateX(-Math.PI / 2),
  };
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, ...extra });
  const M = {
    column: std(0xffffff), cap: std(0xffffff), pit: std(PAL.pit), wood: std(PAL.wood), woodDark: std(PAL.woodDark),
    petal: std(0xffffff, { roughness: 0.6 }), crown: std(0xffffff, { flatShading: true }), trunk: std(PAL.trunk),
    stoneRing: std(PAL.stone), grass: std(0xffffff), tuft: std(0xffffff), pebble: std(0xc9b48f, { flatShading: true }),
    stem: std(0x4f8a3a), bloom: std(0xffffff, { roughness: 0.55 }), bush: std(0xffffff, { flatShading: true }), mush: std(0xffffff, { roughness: 0.6 }), lily: std(0x4f8f3a, { side: THREE.DoubleSide }),
    water: std(PAL.water, { roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.88 }),
    spring: std(0x9fe6f7, { emissive: 0x2fa7cf, emissiveIntensity: 0.55, roughness: 0.2 }),
    glow: new THREE.MeshBasicMaterial({ color: 0xfff6dc, transparent: true, opacity: 0.55, depthWrite: false }),
  };
  // Water ripples drift along world space so neighbouring cells read as one stream.
  M.water.onBeforeCompile = shader => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTime; varying vec3 vW;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float a = sin(vW.x * 6.0 + uTime * 1.9) * sin(vW.z * 5.0 - uTime * 1.4);
        float b = sin((vW.x - vW.z) * 11.0 + uTime * 2.6);
        float glint = smoothstep(0.62, 0.98, a * 0.55 + b * 0.45);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.80, 0.94, 0.99), glint * 0.85);`);
  };
  // Flowing water: streaks drift downstream along each cell's flow, banks get shallow colour and a foam line,
  // pools are deep and still. Per-instance attributes: aFlow (downstream dir), aEdge (bank on N/E/S/W), aKind (1 = pool).
  M.flow = std(PAL.water, { roughness: 0.1, metalness: 0.05, transparent: true, opacity: 0.9 });
  M.flow.onBeforeCompile = shader => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>
        attribute vec2 aFlow; attribute vec4 aEdge; attribute float aKind;
        varying vec2 vFlow; varying vec4 vEdge; varying float vKind; varying vec2 vCell; varying vec3 vW;`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        vFlow = aFlow; vEdge = aEdge; vKind = aKind; vCell = position.xz;
        vW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
        uniform float uTime; varying vec2 vFlow; varying vec4 vEdge; varying float vKind; varying vec2 vCell; varying vec3 vW;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 perp = vec2(-vFlow.y, vFlow.x);
        float s = dot(vW.xz, vFlow), t = dot(vW.xz, perp);
        float lane = sin(t * 9.0 + sin(s * 2.3) * 1.5) * 0.5 + 0.5;
        float streak = smoothstep(0.72, 1.0, sin((s - uTime * 0.85) * 7.0 + lane * 3.0)) * smoothstep(0.35, 0.95, lane) * (1.0 - vKind);
        float a = sin(vW.x * 6.0 + uTime * (1.9 - vKind)) * sin(vW.z * 5.0 - uTime * (1.4 - vKind * 0.8));
        float b = sin((vW.x - vW.z) * 11.0 + uTime * (2.6 - vKind * 1.8));
        float glint = smoothstep(0.66, 0.98, a * 0.55 + b * 0.45);
        float d = 1.0;
        if (vEdge.x > 0.5) d = min(d, vCell.y + 0.5);
        if (vEdge.y > 0.5) d = min(d, 0.5 - vCell.x);
        if (vEdge.z > 0.5) d = min(d, 0.5 - vCell.y);
        if (vEdge.w > 0.5) d = min(d, vCell.x + 0.5);
        float shallow = 1.0 - smoothstep(0.0, 0.34, d);
        vec3 deep = mix(vec3(0.03, 0.26, 0.52), vec3(0.015, 0.15, 0.32), vKind);
        diffuseColor.rgb = mix(deep, vec3(0.2, 0.58, 0.64), shallow * 0.7);
        float foam = 1.0 - smoothstep(0.0, 0.07, d - (sin(dot(vW.xz, vec2(13.0, 11.0)) + uTime * 3.0) * 0.5 + 0.5) * 0.04);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.97, 1.0), max(foam * 0.75, max(streak * 0.55, glint * 0.6)));`);
  };
  // Grass sways from its tip; the root stays planted.
  M.grass.onBeforeCompile = shader => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 ip = instanceMatrix[3];
        float sway = sin(uTime * 1.7 + ip.x * 1.3 + ip.z * 0.9) * 0.5 + sin(uTime * 2.9 + ip.x * 3.1) * 0.25;
        transformed.x += sway * 0.07 * position.y / 0.26;`);
  };
  // Walls that would hide the cell behind them keep a solid footing and turn to glass above it.
  // The cap keeps more body than the column, so a glass wall still reads as a wall from above.
  const glassy = min => shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vY;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvY = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vY;')
      .replace('#include <color_fragment>', `#include <color_fragment>\ndiffuseColor.a *= mix(1.0, ${min.toFixed(2)}, smoothstep(0.18, 0.3, vY));`);
  };
  M.ghostColumn = Object.assign(M.column.clone(), { transparent: true, depthWrite: false, onBeforeCompile: glassy(0.2) });
  M.ghostCap = Object.assign(M.cap.clone(), { transparent: true, depthWrite: false, onBeforeCompile: glassy(0.5) });
  const tints = new Map();
  const tint = (id, l = 0) => new THREE.Color(tints.get(id) ?? 0xe9dcc0).offsetHSL(0, 0, l);
  tint.set = (id, c) => tints.set(id, c);
  return { G, M, time, tint };
}

// Build one room. `life(x, y)` says whether a cell's clearing is restored; `since` maps cell keys to the time
// they became wet/alive (for grow-in animation). Returns the group plus tweens to run each frame.
export function buildRoom(kit, world, state, roomId, { wet, spills = [], life = () => false, since = new Map(), now = 0, detail = true, shell = null }) {
  const { G, M } = kit, r = world.rooms[roomId], h = r.grid.length, w = r.grid[0].length, g = new THREE.Group();
  // `shell`: this room is the inside of a box — walls are its timber, edges with arches open to daylight.
  const box = shell && world.objects[shell], boxArch = (x, y) => box && box.arches?.some(side => {
    const e = { up: [w >> 1, 0], down: [w >> 1, h - 1], left: [0, h >> 1], right: [w - 1, h >> 1] }[side];
    return e[0] === x && e[1] === y;
  });
  const lists = { pebble: [], stem: [], bloom: [], bush: [], mush: [], puddle: [], ghostColumn: [], ghostCap: [], glow: [], column: [], cap: [], pit: [], water: [], spring: [], ring: [], basinRim: [], lily: [], wood: [], woodDark: [], grass: [], tuft: [], petal: [], crown: [], trunk: [] };
  const pos = (x, y) => [x - w / 2 + 0.5, y - h / 2 + 0.5];
  const raw = (x, y) => r.grid[y]?.[x];
  const isWall = (x, y) => { const c = raw(x, y); return c === undefined || cellAt(world, state, roomId, x, y) === '#'; };
  const nearWet = (x, y, rad) => {
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++)
      if (Math.abs(dx) + Math.abs(dy) <= rad && wet.has(key({ room: roomId, x: x + dx, y: y + dy }))) return true;
    return false;
  };
  const alive = (x, y) => life(x, y) || (state.awake.length > 0 && nearWet(x, y, 2));
  // Downstream direction from wet distances (water runs from lower to higher), and which sides are banks.
  const N4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const flowAt = (x, y, k) => {
    const d = wet.get(k), w = N4.map(([dx, dy]) => wet.get(key({ room: roomId, x: x + dx, y: y + dy })));
    let f = [0, 0];
    w.forEach((n, i) => { if (n === d - 1) f = [f[0] - N4[i][0], f[1] - N4[i][1]]; else if (n === d + 1) f = [f[0] + N4[i][0], f[1] + N4[i][1]]; });
    const len = Math.hypot(...f) || 1;
    return { flow: len ? [f[0] / len, f[1] / len] : [1, 0], edge: w.map(n => n === undefined ? 1 : 0), kind: isBasin(cellAt(world, state, roomId, x, y)) ? 1 : 0 };
  };
  const col = (hex, x, y, j = 0.05) => new THREE.Color(hex).offsetHSL(0, 0, (hash(x, y, 11) - 0.5) * j);
  // Water pouring out of an arch onto ground that cannot carry it: a soaked patch and a spreading puddle.
  const spilled = new Map(spills.filter(p => p.room === roomId).map(p => [`${p.x},${p.y}`, p]));

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = cellAt(world, state, roomId, x, y), ch = raw(x, y), [px, pz] = pos(x, y), k = key({ room: roomId, x, y });
    const live = alive(x, y), t0 = since.get(k) ?? -1e9;
    if (c === '#') {
      const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      // The camera looks north: a wall with open ground behind it would hide that ground, so it turns to glass.
      const glass = y > 0 && !isWall(x, y - 1), column = glass ? lists.ghostColumn : lists.column, cap = glass ? lists.ghostCap : lists.cap;
      if (box) {                                   // timber walls inside a box
        const top = border ? 1.05 : 0.55;
        column.push({ p: [px, top - 0.1, pz], s: [1, top + 1.5, 1], c: col(kit.tint(shell, -0.18), x, y, 0.04) });
        cap.push({ p: [px, top, pz], s: [1, 1, 1], c: col(kit.tint(shell, 0), x, y, 0.03) });
        continue;
      }
      const top = border ? 1.25 : [0.7, 0.85, 1.0][Math.floor(hash(x, y, 2) * 3)];
      if (ch >= 'a' && ch <= 'j') {               // closed gate: a timber portcullis in a gap of the wall
        lists.column.push({ p: [px, -0.1, pz], s: [1, 1.5, 1], c: col(PAL.rock, x, y) });
        lists.cap.push({ p: [px, 0, pz], s: [1, 1, 1], c: col(live ? PAL.liveTop : PAL.dryTop, x, y), t0, live });
        for (let i = -1; i <= 1; i++) lists.wood.push({ p: [px + i * 0.28, 0.42, pz], s: [0.12, 0.84, 0.12] });
        lists.woodDark.push({ p: [px, 0.62, pz], s: [0.86, 0.1, 0.16] }, { p: [px, 0.26, pz], s: [0.86, 0.1, 0.16] });
        continue;
      }
      column.push({ p: [px, top - 0.1, pz], s: [1, top + 1.5, 1], c: col(PAL.rock, x, y, 0.08) });
      cap.push({ p: [px, top, pz], s: [1, 1, 1], c: col(live ? PAL.wallLive : PAL.wallDry, x, y), t0, live, dry: PAL.wallDry, wet: PAL.wallLive });
      if (glass) continue;                           // nothing grows on glass
      // Coast live oaks on the ridges: dark, wide and low. They are evergreen, so they stand even while the hills are
      // dry; they just look dusty until the rain comes. Grass on the ridge tops is gold, then green.
      if (detail && !border && !box && hash(x, y, 5) < 0.16 * Math.min(1, detail * 1.5)) {
        const s = 0.75 + hash(x, y, 6) * 0.55, lean = (hash(x, y, 9) - 0.5) * 0.25;
        lists.trunk.push({ p: [px, top, pz], s: [s * 1.3, s * 0.9, s * 1.3], t0 });
        const leaf = live ? (hash(x, y, 7) < 0.5 ? PAL.leaf : PAL.leaf2) : (hash(x, y, 7) < 0.5 ? PAL.oakDry : PAL.oakDry2);
        for (let k = 0; k < 3; k++) {
          const a = hash(x, y, 20 + k) * 6.28, r = k ? 0.2 * s : 0;
          lists.crown.push({ p: [px + Math.cos(a) * r + lean, top + 0.3 * s + (k ? 0 : 0.06), pz + Math.sin(a) * r], s: [s * (k ? 0.85 : 1.25), s * 0.62, s * (k ? 0.85 : 1.15)], c: col(leaf, x + k, y, 0.08), t0 });
        }
      } else if (detail) for (let i = 0; i < 3; i++) {
        const q = [px + hash(x, y, i) * 0.8 - 0.4, top, pz + hash(y, x, i) * 0.8 - 0.4];
        if (live) lists.grass.push({ p: q, t0, r: hash(i, x, y), c: col(PAL.grass, x, y, 0.1) });
        else lists.tuft.push({ p: q, r: hash(i, x, y), c: col(PAL.dryTuft, x, y, 0.1) });
      }
      continue;
    }
    if (c === '_') { lists.pit.push({ p: [px, -1.2, pz], s: [1, 0.4, 1] }); continue; }
    const watery = WATERY(c), depth = isBasin(c) ? -0.42 : watery ? -0.2 : 0;
    if (boxArch(x, y)) {                            // daylight through the arch: lit floor and a timber door frame
      lists.glow.push({ p: [px, 0.01, pz], s: [0.95, 1, 0.95] });
      const side = x === 0 || x === w - 1, out = (x === 0 ? -1 : x === w - 1 ? 1 : y === 0 ? -1 : 1) * 0.45;
      for (const o of [-0.46, 0.46]) lists.woodDark.push({ p: side ? [px + out, 0.5, pz + o] : [px + o, 0.5, pz + out], s: [0.1, 1.0, 0.1] });
      lists.woodDark.push({ p: side ? [px + out, 1.02, pz] : [px, 1.02, pz + out], s: side ? [0.12, 0.12, 1.02] : [1.02, 0.12, 0.12] });
    }
    lists.column.push({ p: [px, depth - 0.1, pz], s: [1, depth + 1.5, 1], c: col(watery ? PAL.bed : PAL.rock, x, y) });
    const sp = spilled.get(`${x},${y}`);
    if (sp) {
      const [dx, dz] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[sp.dir];
      lists.cap.push({ p: [px, 0, pz], s: [1, 1, 1], c: col(PAL.bedWet, x, y) });
      const ts = since.get('spill:' + k) ?? -1e9;
      lists.puddle.push({ p: [px - dx * 0.12, 0.012, pz - dz * 0.12], s: [1.05, 1, 1.05], t0: ts }, { p: [px - dx * 0.42, 0.016, pz - dz * 0.42], s: [0.5, 1, 0.5], t0: ts });
    } else if (!watery) {
      const lush = new THREE.Color(PAL.liveTop).lerp(new THREE.Color(PAL.liveTop2), hash(x, y, 13)).offsetHSL((hash(Math.floor(x / 2), Math.floor(y / 2), 14) - 0.5) * 0.05, 0, (hash(x, y, 15) - 0.5) * 0.07);
      lists.cap.push({ p: [px, 0, pz], s: [1, 1, 1], c: live ? lush : col((x + y) & 1 ? PAL.dryTop : PAL.dryTop2, x, y, 0.02), t0, live, dry: (x + y) & 1 ? PAL.dryTop : PAL.dryTop2 });
    }
    else lists.cap.push({ p: [px, depth, pz], s: [1, 1, 1], c: col(wet.has(k) ? PAL.bedWet : PAL.mud, x, y) });
    if (isBasin(c)) {                                         // a pool: stone kerb, lilies once it has filled
      lists.basinRim.push({ p: [px, 0.02, pz], s: [1.32, 1, 1.32] });
      if (wet.has(k)) for (let i = 0; i < 2; i++) lists.lily.push({ p: [px + (hash(x, y, i) - 0.5) * 0.5, -0.1, pz + (hash(y, x, i) - 0.5) * 0.5], t0, r: hash(i, y, x) });
    }
    if (c === 'S') {
      lists.spring.push({ p: [px, -0.08, pz], s: [0.8, 1, 0.8] });
      lists.ring.push({ p: [px, -0.02, pz] });
    } else if (watery && wet.has(k)) lists.water.push({ p: [px, isBasin(c) ? -0.12 : -0.07, pz], t0, rise: isBasin(c), ...flowAt(x, y, k) });
    if (c === '=' || c === '+') {                 // planks across the walking direction
      const alongX = !isWall(x - 1, y) && !isWall(x + 1, y) && (c === '=' || !WATERY(cellAt(world, state, roomId, x - 1, y) ?? '#'));
      for (let i = -1.5; i <= 1.5; i++)
        lists.wood.push({ p: [px + (alongX ? i * 0.22 : 0), 0.03, pz + (alongX ? 0 : i * 0.22)], s: alongX ? [0.18, 0.08, 0.92] : [0.92, 0.08, 0.18] });
    }
    if (c === '%') {                              // culvert: a low stone arch over the channel
      lists.column.push({ p: [px, 0.65, pz], s: [1, 0.35, 1], c: col(PAL.rockDark, x, y) });
      lists.cap.push({ p: [px, 0.75, pz], s: [1, 1, 1], c: col(live ? PAL.wallLive : PAL.wallDry, x, y), t0, live, dry: PAL.wallDry, wet: PAL.wallLive });
    }
    if (detail && !watery && c === '.' && !sp) {
      const d = detail === true ? 1 : detail, at = i => [px + hash(x, y, i + 9) * 0.84 - 0.42, pz + hash(y, x, i + 9) * 0.84 - 0.42];
      if (!live) {
        // Dry: crisp summer gold. Clumps of blond grass, the odd pebble.
        const n = Math.round((2 + hash(x, y, 3) * 3) * d);
        for (let i = 0; i < n; i++) { const [bx, bz] = at(i), h = hash(x, y, i + 90); lists.tuft.push({ p: [bx, 0, bz], r: hash(i, y, x), s: [1, 0.9 + h * 0.8, 1], c: new THREE.Color().setHSL(0.11 + h * 0.025, 0.55 + h * 0.15, 0.6 + h * 0.12) }); }
        if (hash(x, y, 4) < 0.15) { const [bx, bz] = at(30); lists.pebble.push({ p: [bx, 0.01, bz], r: hash(x, y, 8), c: col(0xcbb58c, x, y, 0.12) }); }
      } else {
        // Alive: dense, varied grass; flowers on stems in drifts; bushes and mushrooms near walls and water.
        const n = Math.round((7 + hash(x, y, 3) * 6) * d), drift = hash(Math.floor(x / 3), Math.floor(y / 3), 21);
        for (let i = 0; i < n; i++) {
          const [bx, bz] = at(i), hue = hash(x, y, i + 60);
          lists.grass.push({ p: [bx, 0, bz], t0, r: hash(i, x, y), s: [1, 0.7 + hue * 0.8, 1], c: new THREE.Color().setHSL(0.26 + hue * 0.05, 0.62 + hue * 0.2, 0.36 + hue * 0.14) });
        }
        const flowers = drift > 0.55 ? Math.round((1 + hash(x, y, 30) * 3) * d) : hash(x, y, 31) < 0.25 ? 1 : 0;
        const pc = PAL.petals[Math.floor(drift * 997) % 5];
        for (let i = 0; i < flowers; i++) {
          const [bx, bz] = at(i + 20), sc = 0.8 + hash(x, y, i + 70) * 0.6;
          lists.stem.push({ p: [bx, 0, bz], s: [1, sc, 1], t0 });
          lists.bloom.push({ p: [bx, 0, bz], s: [sc, sc, sc], t0, c: col(hash(x, y, i + 80) < 0.75 ? pc : PAL.petals[Math.floor(hash(x, y, i) * 5)], x, y, 0.1) });
        }
        const nearWall = N4.some(([dx, dy]) => isWall(x + dx, y + dy));
        if (nearWall && hash(x, y, 33) < 0.35 * d) { const [bx, bz] = at(40); const sc = 0.8 + hash(x, y, 34) * 0.6; lists.bush.push({ p: [bx, 0, bz], s: [sc, sc, sc], t0, r: hash(x, y, 35), c: col(hash(x, y, 36) < 0.5 ? PAL.leaf : PAL.leaf2, x, y, 0.12) }); }
        if (hash(x, y, 37) < 0.05 * d) { const [bx, bz] = at(50); lists.mush.push({ p: [bx, 0, bz], t0, c: new THREE.Color(hash(x, y, 38) < 0.5 ? 0xd9534f : 0xf0e3c8) }); }
      }
    }
  }

  // Island skirt: the room floats; its underside fades into the sky.
  if (box) {
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.5, h + 0.3).translate(0, -1.8, 0), new THREE.MeshStandardMaterial({ color: kit.tint(shell, -0.3), roughness: 0.9 }));
    g.add(floor);
  }
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(w, 2.4, h).translate(0, -2.8, 0), new THREE.MeshLambertMaterial({ vertexColors: true }));
  const pa = skirt.geometry.attributes.position, colors = [];
  for (let i = 0; i < pa.count; i++) { const c = new THREE.Color(pa.getY(i) > -2 ? PAL.rockDark : 0xc9d9d6); colors.push(c.r, c.g, c.b); }
  skirt.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.add(skirt);

  const tweens = [], o = new THREE.Object3D();
  const inst = (geom, mat, list, { shadow = true, receive = true, color = true, grow = null } = {}) => {
    if (!list.length) return;
    const m = new THREE.InstancedMesh(geom, mat, list.length);
    const set = (i, s) => {
      const it = list[i];
      o.position.set(...it.p);
      if (it.rise) { o.position.y -= 0.3 * (1 - Math.min(1, s)); s = 1; }   // pools fill from below
      o.rotation.set(0, it.r !== undefined ? it.r * 6.28 : 0, it.r !== undefined ? (it.r - 0.5) * 0.4 : 0);
      o.scale.set(...(it.s ?? [1, 1, 1]).map(v => v * s));
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    };
    list.forEach((it, i) => {
      set(i, 1);
      if (color && it.c) m.setColorAt(i, it.c);
      if (grow && it.t0 > now - grow.dur) { set(i, grow.ease(Math.max(0, (now - it.t0) / grow.dur))); tweens.push({ t0: it.t0, dur: grow.dur, apply: t => { set(i, grow.ease(t)); m.instanceMatrix.needsUpdate = true; } }); }
    });
    m.castShadow = shadow; m.receiveShadow = receive;
    g.add(m);
    return m;
  };
  const pop = t => t <= 0 ? 0.0001 : t >= 1 ? 1 : 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
  inst(G.plane, M.glow, lists.glow, { shadow: false, color: false });
  inst(G.unit, M.column, lists.column);
  const caps = inst(G.cap, M.cap, lists.cap, { shadow: false });
  if (caps) lists.cap.forEach((it, i) => {   // colour wave: dry → alive as life arrives
    if (!it.dry || !(it.t0 > now - 700)) return;
    const a = new THREE.Color(it.dry), b = it.c.clone();
    tweens.push({ t0: it.t0, dur: 700, apply: t => { caps.setColorAt(i, a.clone().lerp(b, Math.max(0, Math.min(1, t)))); caps.instanceColor.needsUpdate = true; } });
    caps.setColorAt(i, a);
  });
  // Glass after the water, so the water behind shows through it; no shadows, so the ground behind stays lit.
  for (const m of [inst(G.unit, M.ghostColumn, lists.ghostColumn, { shadow: false }), inst(G.cap, M.ghostCap, lists.ghostCap, { shadow: false })]) if (m) m.renderOrder = 1;
  inst(G.slab, M.pit, lists.pit, { shadow: false });
  // Each room gets its own copy of the plane so the per-cell flow attributes can live on it.
  if (lists.water.length) {
    const wg = G.plane.clone();
    wg.setAttribute('aFlow', new THREE.InstancedBufferAttribute(new Float32Array(lists.water.flatMap(it => it.flow)), 2));
    wg.setAttribute('aEdge', new THREE.InstancedBufferAttribute(new Float32Array(lists.water.flatMap(it => it.edge)), 4));
    wg.setAttribute('aKind', new THREE.InstancedBufferAttribute(new Float32Array(lists.water.map(it => it.kind)), 1));
    inst(wg, M.flow, lists.water, { shadow: false, grow: { dur: 380, ease: pop } });
  }
  inst(G.puddle, M.water, lists.puddle, { shadow: false, grow: { dur: 900, ease: pop } });
  inst(G.plane, M.spring, lists.spring, { shadow: false });
  inst(G.ring, M.stoneRing, lists.ring);
  inst(G.kerb, M.stoneRing, lists.basinRim);
  inst(G.lily, M.lily, lists.lily, { shadow: false, grow: { dur: 900, ease: pop } });
  inst(G.slab, M.wood, lists.wood);
  inst(G.slab, M.woodDark, lists.woodDark);
  inst(G.blade, M.grass, lists.grass, { shadow: false, grow: { dur: 650, ease: pop } });
  inst(G.blade, M.tuft, lists.tuft, { shadow: false });
  inst(G.pebble, M.pebble, lists.pebble, { shadow: false });
  inst(G.stem, M.stem, lists.stem, { shadow: false, grow: { dur: 800, ease: pop } });
  inst(G.bloom, M.bloom, lists.bloom, { shadow: false, grow: { dur: 900, ease: pop } });
  inst(G.bush, M.bush, lists.bush, { grow: { dur: 900, ease: pop } });
  inst(G.mushCap, M.mush, lists.mush, { shadow: false, grow: { dur: 900, ease: pop } });
  inst(G.stem, M.stem, lists.mush.map(m => ({ ...m, s: [2.5, 0.3, 2.5], c: undefined })), { shadow: false, grow: { dur: 900, ease: pop } });
  inst(G.petal, M.petal, lists.petal, { shadow: false, grow: { dur: 650, ease: pop } });
  inst(G.trunk, M.trunk, lists.trunk, { grow: { dur: 900, ease: pop } });
  inst(G.crown, M.crown, lists.crown, { grow: { dur: 900, ease: pop } });
  g.userData = { w, h };
  return { group: g, tweens };
}

// A flat map of a room, drawn to a canvas: the lid of every box shows what is inside it.
export function miniature(world, state, roomId, wet, canvas) {
  const r = world.rooms[roomId], h = r.grid.length, w = r.grid[0].length, n = Math.max(w, h);
  const cell = Math.max(4, Math.floor(256 / n)), size = cell * n;
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d'), ox = (n - w) * cell / 2, oy = (n - h) * cell / 2;
  const hex = c => `#${new THREE.Color(c).getHexString()}`;
  g.fillStyle = hex(PAL.rockDark); g.fillRect(0, 0, size, size);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = cellAt(world, state, roomId, x, y), k = key({ room: roomId, x, y });
    g.fillStyle = c === '#' ? hex(PAL.rock) : c === '_' ? hex(PAL.pit) : wet.has(k) || c === 'S' ? hex(PAL.water)
      : WATERY(c) ? hex(PAL.bed) : hex(state.awake.length ? PAL.liveTop : PAL.dryTop);
    g.fillRect(ox + x * cell, oy + y * cell, cell, cell);
  }
  for (const [id, p] of Object.entries(state.objects)) {
    if (p.room !== roomId || p.sunk) continue;
    const box = !!world.objects[id].interior;
    g.fillStyle = box ? (world.objects[id].color ?? '#e8dcc0') : hex(PAL.stone);
    const pad = box ? cell * 0.1 : cell * 0.22;
    g.fillRect(ox + p.x * cell + pad, oy + p.y * cell + pad, cell - 2 * pad, cell - 2 * pad);
  }
  if (state.player.room === roomId) {
    g.fillStyle = '#e0623f';
    g.beginPath(); g.arc(ox + (state.player.x + 0.5) * cell, oy + (state.player.y + 0.5) * cell, cell * 0.32, 0, 7); g.fill();
  }
}

// The neighbourhood around a box (what you would see if you stepped out), with the box outlined.
export function miniatureAround(world, state, boxId, canvas, radius = 4) {
  const p = state.objects[boxId], roomId = p.room, n = radius * 2 + 1, cell = Math.floor(canvas.width / n);
  const g = canvas.getContext('2d'), hex = c => `#${new THREE.Color(c).getHexString()}`, { wet } = water(world, state);
  g.fillStyle = hex(PAL.rockDark); g.fillRect(0, 0, canvas.width, canvas.height);
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    const x = p.x + dx, y = p.y + dy, c = cellAt(world, state, roomId, x, y), k = key({ room: roomId, x, y });
    if (c === null) continue;
    g.fillStyle = c === '#' ? hex(PAL.rock) : c === '_' ? hex(PAL.pit) : wet.has(k) || c === 'S' ? hex(PAL.water)
      : WATERY(c) ? hex(PAL.bed) : hex(state.awake.length ? PAL.liveTop : PAL.dryTop);
    g.fillRect((dx + radius) * cell, (dy + radius) * cell, cell, cell);
  }
  for (const [id, q] of Object.entries(state.objects)) {
    const dx = q.x - p.x, dy = q.y - p.y;
    if (q.room !== roomId || q.sunk || Math.abs(dx) > radius || Math.abs(dy) > radius) continue;
    g.fillStyle = world.objects[id].interior ? `#${new THREE.Color(world.objects[id].tint ?? 0xe9dcc0).getHexString()}` : hex(PAL.stone);
    const pad = world.objects[id].interior ? 1 : cell * 0.22;
    g.fillRect((dx + radius) * cell + pad, (dy + radius) * cell + pad, cell - 2 * pad, cell - 2 * pad);
  }
  g.strokeStyle = '#e0583a'; g.lineWidth = 3;
  g.strokeRect(radius * cell + 1.5, radius * cell + 1.5, cell - 3, cell - 3);
  // Arches: dark notches on the marked box.
  g.fillStyle = '#241c16';
  for (const side of world.objects[boxId].arches ?? []) {
    const cx = radius * cell + cell / 2, cy = radius * cell + cell / 2, o = cell / 2 - 2;
    const [ax, ay] = { up: [0, -o], down: [0, o], left: [-o, 0], right: [o, 0] }[side];
    g.fillRect(cx + ax - 3, cy + ay - 3, 6, 6);
  }
}
